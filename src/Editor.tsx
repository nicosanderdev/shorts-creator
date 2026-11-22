import { useEffect, useState, type ChangeEvent, type CSSProperties } from "react";
import "./index.css";

const STORAGE_KEY = "shorts-editor";

const feelingInicial = {
  fontSize: "16px",
  color: "#1a1a1a",
  backgroundColor: "#f7f7f5",
} as const;

const modes = [
  { id: "biblioteca", label: "Biblioteca" },
  { id: "escenas", label: "Escenas" },
  { id: "escena", label: "Escena" },
  { id: "apariencia", label: "Apariencia" },
] as const;

type Mode = (typeof modes)[number]["id"];

type Scene = {
  id: string;
  mediumId: string;
  duration: number;
  entry: number | null;
  cutWithPrevious: "corte directo" | null;
};

type Project = {
  name: string;
  scenes: Scene[];
};

type MediumKind = "video" | "imagen" | "audio";

type Medium = {
  id: string;
  name: string;
  kind: MediumKind;
};

type UserDocument = {
  id: string;
  library: Medium[];
  projects: Project[];
};

type HeldFile = {
  file: File;
  url: string | null;
};

// The document keeps the name and the class. The bytes stay here for this session,
// so a later view can show the medium after the editor remounts.
const heldFiles = new Map<string, HeldFile>();

const videoExtensions = new Set(["mp4", "webm", "mov", "m4v"]);
const imageExtensions = new Set(["png", "jpg", "jpeg", "webp"]);
const audioExtensions = new Set(["mp3", "wav", "m4a", "aac", "ogg"]);

function fileExtension(name: string): string {
  const dot = name.lastIndexOf(".");
  if (dot < 0 || dot === name.length - 1) return "";
  return name.slice(dot + 1).toLowerCase();
}

function classify(file: File): MediumKind | null {
  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();
  if (type === "image/gif" || name.endsWith(".gif")) return "video";
  if (type.startsWith("video/")) return "video";
  if (type.startsWith("image/")) return "imagen";
  if (type.startsWith("audio/")) return "audio";
  if (type !== "") return null;
  const extension = fileExtension(file.name);
  if (videoExtensions.has(extension)) return "video";
  if (imageExtensions.has(extension)) return "imagen";
  if (audioExtensions.has(extension)) return "audio";
  return null;
}

function holdFile(id: string, file: File) {
  let url: string | null = null;
  try {
    url = URL.createObjectURL(file);
  } catch {
    url = null;
  }
  heldFiles.set(id, { file, url });
}

function emptyUser(): UserDocument {
  return {
    id: crypto.randomUUID(),
    library: [],
    projects: [{ name: "Proyecto", scenes: [] }],
  };
}

function parseScene(value: unknown): Scene | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  if (typeof record.id !== "string" || record.id === "") return null;
  if (typeof record.mediumId !== "string" || record.mediumId === "") return null;
  if (typeof record.duration !== "number" || !Number.isFinite(record.duration) || record.duration <= 0) {
    return null;
  }
  let entry: number | null;
  if (record.entry === null) entry = null;
  else if (typeof record.entry === "number" && Number.isFinite(record.entry) && record.entry >= 0) {
    entry = record.entry;
  } else return null;
  if (record.cutWithPrevious !== null && record.cutWithPrevious !== "corte directo") return null;
  return {
    id: record.id,
    mediumId: record.mediumId,
    duration: record.duration,
    entry,
    cutWithPrevious: record.cutWithPrevious === null ? null : "corte directo",
  };
}

function parseProject(value: unknown): Project | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  if (record.name !== "Proyecto" || !Array.isArray(record.scenes)) return null;
  const scenes: Scene[] = [];
  for (const item of record.scenes) {
    const scene = parseScene(item);
    if (!scene) return null;
    scenes.push(scene);
  }
  return { name: "Proyecto", scenes };
}

function parseMedium(value: unknown): Medium | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  if (typeof record.id !== "string" || record.id === "") return null;
  if (typeof record.name !== "string") return null;
  if (record.kind !== "video" && record.kind !== "imagen" && record.kind !== "audio") return null;
  return { id: record.id, name: record.name, kind: record.kind };
}

function parseUser(value: unknown): UserDocument | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  if (typeof record.id !== "string" || record.id === "") return null;
  if (!Array.isArray(record.library) || !Array.isArray(record.projects)) return null;
  const library: Medium[] = [];
  for (const item of record.library) {
    const medium = parseMedium(item);
    if (!medium) return null;
    library.push(medium);
  }
  const projects: Project[] = [];
  for (const item of record.projects) {
    const project = parseProject(item);
    if (!project) return null;
    projects.push(project);
  }
  if (projects.length === 0) return null;
  return { id: record.id, library, projects };
}

function openUser(): UserDocument {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const stored = parseUser(JSON.parse(raw));
      if (stored) return stored;
    } catch {
      // Unreadable browser data opens a new empty user below.
    }
  }
  const created = emptyUser();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(created));
  return created;
}

function mediumUrl(id: string): string | null {
  return heldFiles.get(id)?.url ?? null;
}

function readVideoDuration(url: string): Promise<number> {
  const video = document.createElement("video");
  video.muted = true;
  video.preload = "metadata";
  video.setAttribute("aria-hidden", "true");
  video.style.position = "fixed";
  video.style.width = "0";
  video.style.height = "0";
  document.body.append(video);
  return new Promise((resolve) => {
    const finish = (duration: number) => {
      video.removeAttribute("src");
      video.remove();
      resolve(duration);
    };
    video.addEventListener("loadedmetadata", () => finish(video.duration), { once: true });
    video.addEventListener("error", () => finish(Number.NaN), { once: true });
    video.src = url;
  });
}

async function sceneBirth(medium: Medium): Promise<{ duration: number; entry: number | null } | null> {
  if (medium.kind === "imagen") return { duration: 3, entry: null };
  if (medium.kind !== "video") return null;
  const url = mediumUrl(medium.id);
  if (!url) return null;
  const fileDuration = await readVideoDuration(url);
  if (!Number.isFinite(fileDuration) || fileDuration <= 0) return null;
  return { duration: fileDuration >= 3 ? 3 : fileDuration, entry: 0 };
}

function shortSeconds(scenes: Scene[]): number {
  return scenes.reduce((total, scene) => total + scene.duration, 0);
}

const encaje: CSSProperties = {
  display: "block",
  width: "100%",
  height: "100%",
  objectFit: "cover",
  objectPosition: "center",
};

function SceneFrame({ scene, medium }: { scene: Scene; medium: Medium | null }) {
  const url = medium ? mediumUrl(medium.id) : null;
  return (
    <div className="escena-cuerpo" style={{ display: "flex", flexDirection: "row", alignItems: "flex-start", gap: "16px" }}>
      <section
        className="cuadro"
        aria-label="Cuadro"
        style={{ aspectRatio: "9 / 16", overflow: "hidden", flexGrow: 2, flexShrink: 1, flexBasis: 0, minWidth: 0 }}
      >
        {medium && url && medium.kind === "imagen" ? (
          <img src={url} alt={medium.name} style={encaje} />
        ) : null}
        {medium && url && medium.kind === "video" ? (
          <video src={url} muted autoPlay playsInline style={encaje} />
        ) : null}
      </section>
      <div className="datos" style={{ flexGrow: 1, flexShrink: 1, flexBasis: 0, minWidth: 0 }}>
        <p>{medium?.name}</p>
        <p>{scene.duration} s</p>
        {scene.entry !== null ? <p>{scene.entry} s</p> : null}
        {scene.cutWithPrevious ? <p>{scene.cutWithPrevious}</p> : null}
      </div>
    </div>
  );
}

export function Editor() {
  const [user, setUser] = useState(openUser);
  const [mode, setMode] = useState<Mode>("escenas");
  const [chosenMediumId, setChosenMediumId] = useState<string | null>(null);
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);
  const project = user.projects[0];
  const visualMedia = user.library.filter(
    (medium) => medium.kind === "imagen" || medium.kind === "video",
  );
  const chosen =
    visualMedia.find((medium) => medium.id === chosenMediumId) ?? visualMedia[0] ?? null;
  const selectedScene = project.scenes.find((scene) => scene.id === selectedSceneId) ?? null;

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }, [user]);

  function onIncorporate(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;
    const kind = classify(file);
    if (!kind) return;
    const medium: Medium = { id: crypto.randomUUID(), name: file.name, kind };
    holdFile(medium.id, file);
    setUser((current) => ({
      ...current,
      library: [medium, ...current.library],
    }));
  }

  async function onAdd() {
    if (!chosen) return;
    const birth = await sceneBirth(chosen);
    if (!birth) return;
    const sceneId = crypto.randomUUID();
    const mediumId = chosen.id;
    setSelectedSceneId(sceneId);
    setMode("escena");
    setUser((current) => {
      const currentProject = current.projects[0];
      const scene: Scene = {
        id: sceneId,
        mediumId,
        duration: birth.duration,
        entry: birth.entry,
        cutWithPrevious: currentProject.scenes.length > 0 ? "corte directo" : null,
      };
      return {
        ...current,
        projects: [
          { ...currentProject, scenes: [...currentProject.scenes, scene] },
          ...current.projects.slice(1),
        ],
      };
    });
  }

  return (
    <main
      className="editor"
      style={
        {
          ...feelingInicial,
          "--bg": feelingInicial.backgroundColor,
          "--bar-element": "36px",
        } as CSSProperties
      }
    >
      <header className="bar">
        <div className="project">
          <h1>{project.name}</h1>
          <p>El short dura {shortSeconds(project.scenes)} s</p>
        </div>
        <nav aria-label="Modos">
          {modes.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={mode === item.id}
              onClick={() => setMode(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>
      {mode === "biblioteca" ? (
        <section className="section" aria-label="Biblioteca">
          <h2>Biblioteca</h2>
          <label>
            Incorporar
            <input type="file" onChange={onIncorporate} />
          </label>
          <ul aria-label="Medios">
            {user.library.map((medium) => {
              const label = `${medium.name} ${medium.kind}`;
              return (
                <li key={medium.id} aria-label={label}>
                  {label}
                </li>
              );
            })}
          </ul>
          {user.library.length === 0 ? <p>No hay medios.</p> : null}
        </section>
      ) : null}
      {mode === "escenas" ? (
        <section className="section" aria-label="Escenas">
          <h2>Escenas</h2>
          {chosen ? (
            <div className="add-scene">
              <label>
                Medio visual
                <select
                  value={chosen.id}
                  onChange={(event) => setChosenMediumId(event.currentTarget.value)}
                >
                  {visualMedia.map((medium) => (
                    <option key={medium.id} value={medium.id}>
                      {medium.name}
                    </option>
                  ))}
                </select>
              </label>
              <button type="button" onClick={onAdd}>
                Añadir
              </button>
            </div>
          ) : null}
          <ul aria-label="Escenas">
            {project.scenes.map((scene) => {
              const medium = user.library.find((item) => item.id === scene.mediumId);
              return (
                <li key={scene.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSceneId(scene.id);
                      setMode("escena");
                    }}
                  >
                    {medium?.name}
                  </button>
                </li>
              );
            })}
          </ul>
          {project.scenes.length === 0 ? <p>El proyecto no tiene escenas.</p> : null}
        </section>
      ) : null}
      {mode === "escena" ? (
        <section className="section" aria-label="Escena">
          <h2>Escena</h2>
          {selectedScene ? (
            <SceneFrame
              scene={selectedScene}
              medium={user.library.find((item) => item.id === selectedScene.mediumId) ?? null}
            />
          ) : (
            <p>No hay una escena que editar.</p>
          )}
        </section>
      ) : null}
      {mode === "apariencia" ? (
        <section className="section" aria-label="Apariencia">
          <h2>Apariencia</h2>
        </section>
      ) : null}
    </main>
  );
}
