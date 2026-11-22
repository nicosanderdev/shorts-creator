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

type Project = {
  name: string;
  scenes: unknown[];
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

function parseProject(value: unknown): Project | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  if (record.name !== "Proyecto" || !Array.isArray(record.scenes)) return null;
  return { name: "Proyecto", scenes: record.scenes };
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

export function Editor() {
  const [user, setUser] = useState(openUser);
  const [mode, setMode] = useState<Mode>("escenas");
  const project = user.projects[0];

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
          <p>El short dura 0 s</p>
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
          <ul aria-label="Escenas" />
          {project.scenes.length === 0 ? <p>El proyecto no tiene escenas.</p> : null}
        </section>
      ) : null}
      {mode === "escena" ? (
        <section className="section" aria-label="Escena">
          <h2>Escena</h2>
          <p>No hay una escena que editar.</p>
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
