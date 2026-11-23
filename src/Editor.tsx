import { Player, type PlayerRef } from "@remotion/player";
import { canRenderMediaOnWeb, renderMediaOnWeb } from "@remotion/web-renderer";
import { useEffect, useRef, useState, type ChangeEvent, type CSSProperties } from "react";
import {
  ALTO_DEL_SHORT,
  ANCHO_DEL_SHORT,
  ComposicionDelShort,
  duracionDelShortEnFotogramas,
  FOTOGRAMAS_POR_SEGUNDO,
  fotogramas,
  type EscenaPlana,
} from "./composicion";
import "./index.css";

const STORAGE_KEY = "shorts-editor";
const APARIENCIA_KEY = "shorts-editor-apariencia";

const feelingInicial = {
  tipografia: 16,
  texto: "#1a1a1a",
  fondo: "#f7f7f5",
  iconosBarras: 20,
  elementosBarras: 36,
  iconosSecciones: 20,
  elementosSecciones: 36,
} as const;

type Apariencia = {
  tipografia: number;
  texto: string;
  fondo: string;
  iconosBarras: number;
  elementosBarras: number;
  iconosSecciones: number;
  elementosSecciones: number;
};

const modes = [
  { id: "biblioteca", label: "Biblioteca" },
  { id: "escenas", label: "Escenas" },
  { id: "escena", label: "Escena" },
  { id: "apariencia", label: "Apariencia" },
  { id: "vista-previa", label: "Vista previa" },
] as const;

type Mode = (typeof modes)[number]["id"];

type TextAlign = "left" | "center" | "right";

type SceneText = {
  id: string;
  content: string;
  x: number;
  y: number;
  size: number;
  color: string;
  align: TextAlign;
};

type Scene = {
  id: string;
  mediumId: string;
  duration: number;
  entry: number | null;
  cutWithPrevious: "corte directo" | "fundido" | null;
  fadeTime: number | null;
  texts: SceneText[];
  narrationId: string | null;
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

function releaseFile(id: string) {
  const held = heldFiles.get(id);
  if (!held) return;
  if (held.url) {
    try {
      URL.revokeObjectURL(held.url);
    } catch {
      // Ignore cleanup failures in environments without object URLs.
    }
  }
  heldFiles.delete(id);
}

function isMediumUsed(projects: Project[], mediumId: string): boolean {
  return projects.some((project) =>
    project.scenes.some(
      (scene) => scene.mediumId === mediumId || scene.narrationId === mediumId,
    ),
  );
}

function emptyUser(): UserDocument {
  return {
    id: crypto.randomUUID(),
    library: [],
    projects: [{ name: "Proyecto", scenes: [] }],
  };
}

function parseText(value: unknown): SceneText | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  if (typeof record.id !== "string" || record.id === "") return null;
  if (typeof record.content !== "string") return null;
  if (typeof record.x !== "number" || !Number.isFinite(record.x)) return null;
  if (typeof record.y !== "number" || !Number.isFinite(record.y)) return null;
  if (typeof record.size !== "number" || !Number.isFinite(record.size) || record.size <= 0) {
    return null;
  }
  if (!isHexColor(record.color)) return null;
  if (record.align !== "left" && record.align !== "center" && record.align !== "right") return null;
  return {
    id: record.id,
    content: record.content,
    x: record.x,
    y: record.y,
    size: record.size,
    color: record.color.toLowerCase(),
    align: record.align,
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
  let cutWithPrevious: Scene["cutWithPrevious"];
  if (record.cutWithPrevious === null) cutWithPrevious = null;
  else if (record.cutWithPrevious === "corte directo") cutWithPrevious = "corte directo";
  else if (record.cutWithPrevious === "fundido") cutWithPrevious = "fundido";
  else return null;
  let fadeTime: number | null;
  if (cutWithPrevious === "fundido") {
    if (
      typeof record.fadeTime !== "number" ||
      !Number.isFinite(record.fadeTime) ||
      record.fadeTime <= 0
    ) {
      return null;
    }
    fadeTime = record.fadeTime;
  } else if (record.fadeTime === undefined || record.fadeTime === null) {
    fadeTime = null;
  } else return null;
  if (record.texts !== undefined && !Array.isArray(record.texts)) return null;
  const texts: SceneText[] = [];
  for (const item of record.texts ?? []) {
    const text = parseText(item);
    if (!text) return null;
    texts.push(text);
  }
  let narrationId: string | null;
  if (record.narrationId === undefined || record.narrationId === null) narrationId = null;
  else if (typeof record.narrationId === "string" && record.narrationId !== "") {
    narrationId = record.narrationId;
  } else return null;
  return {
    id: record.id,
    mediumId: record.mediumId,
    duration: record.duration,
    entry,
    cutWithPrevious,
    fadeTime,
    texts,
    narrationId,
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
  if (scenes.length > 0 && scenes[0].cutWithPrevious !== null) {
    scenes[0] = { ...scenes[0], cutWithPrevious: null, fadeTime: null };
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

function Glyph() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="6" fill="currentColor" />
    </svg>
  );
}

function SectionHeading({ children }: { children: string }) {
  return (
    <h2>
      <Glyph />
      {children}
    </h2>
  );
}

type NumberRead = number | "keep-typing" | "reject";

function DraftNumberField({
  label,
  value,
  min,
  max,
  step,
  parse,
  onChange,
}: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step: number | "any";
  parse: (raw: string) => NumberRead;
  onChange: (next: number) => void;
}) {
  const [draft, setDraft] = useState<{ base: number; text: string } | null>(null);
  const shown = draft && draft.base === value ? draft.text : value;

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const raw = event.target.value;
    const read = parse(raw);
    if (typeof read === "number") {
      setDraft(null);
      onChange(read);
      return;
    }
    if (read === "keep-typing") {
      setDraft({ base: value, text: raw });
      return;
    }
    setDraft(null);
  }

  return (
    <label>
      {label}
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={shown}
        onChange={handleChange}
        onBlur={() => setDraft(null)}
      />
    </label>
  );
}

function readSize(raw: string): NumberRead {
  if (raw === "") return "keep-typing";
  if (!/^\d+$/.test(raw)) return "reject";
  const next = Number(raw);
  if (next >= 8 && next <= 96) return next;
  if (raw.length === 1) return "keep-typing";
  return "reject";
}

function SizeField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (next: number) => void;
}) {
  return (
    <DraftNumberField
      label={label}
      value={value}
      min={8}
      max={96}
      step={1}
      parse={readSize}
      onChange={onChange}
    />
  );
}

function readFraction(raw: string, positiveOnly: boolean): NumberRead {
  if (raw === "" || raw === "-" || raw === "." || raw.endsWith(".")) return "keep-typing";
  if (!/^-?\d*\.?\d+$/.test(raw)) return "reject";
  const next = Number(raw);
  if (!Number.isFinite(next)) return "reject";
  if (positiveOnly && next <= 0) return next === 0 ? "keep-typing" : "reject";
  return next;
}

function FractionField({
  label,
  value,
  positiveOnly = false,
  onChange,
}: {
  label: string;
  value: number;
  positiveOnly?: boolean;
  onChange: (next: number) => void;
}) {
  return (
    <DraftNumberField
      label={label}
      value={value}
      min={positiveOnly ? 0.01 : undefined}
      step="any"
      parse={(raw) => readFraction(raw, positiveOnly)}
      onChange={onChange}
    />
  );
}

function percentFromFraction(fraction: number): number {
  const percent = fraction * 100;
  if (!Number.isFinite(percent)) return percent;
  return Number(percent.toPrecision(12));
}

function PercentField({
  label,
  value,
  positiveOnly = false,
  onChange,
}: {
  label: string;
  value: number;
  positiveOnly?: boolean;
  onChange: (next: number) => void;
}) {
  return (
    <FractionField
      label={label}
      value={percentFromFraction(value)}
      positiveOnly={positiveOnly}
      onChange={(next) => onChange(next / 100)}
    />
  );
}

function isHexColor(value: unknown): value is string {
  return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value);
}

function isSize(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 8 && value <= 96;
}

function parseApariencia(value: unknown): Apariencia | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  if (
    !isSize(record.tipografia) ||
    !isSize(record.iconosBarras) ||
    !isSize(record.elementosBarras) ||
    !isSize(record.iconosSecciones) ||
    !isSize(record.elementosSecciones) ||
    !isHexColor(record.texto) ||
    !isHexColor(record.fondo)
  ) {
    return null;
  }
  return {
    tipografia: record.tipografia,
    texto: record.texto.toLowerCase(),
    fondo: record.fondo.toLowerCase(),
    iconosBarras: record.iconosBarras,
    elementosBarras: record.elementosBarras,
    iconosSecciones: record.iconosSecciones,
    elementosSecciones: record.elementosSecciones,
  };
}

function openApariencia(): Apariencia {
  const raw = localStorage.getItem(APARIENCIA_KEY);
  if (!raw) return { ...feelingInicial };
  try {
    return parseApariencia(JSON.parse(raw)) ?? { ...feelingInicial };
  } catch {
    return { ...feelingInicial };
  }
}

function rememberApariencia(apariencia: Apariencia) {
  localStorage.setItem(APARIENCIA_KEY, JSON.stringify(apariencia));
}

function paint(apariencia: Apariencia): string {
  const fondo = /^#[0-9a-f]{6}$/i.test(apariencia.fondo) ? apariencia.fondo : feelingInicial.fondo;
  const tipo = `${apariencia.tipografia}px`;
  return [
    `.editor, .bar, .section, .editor button, .editor input, .editor select, .editor textarea, .editor label, .editor legend, .editor h1, .editor h2, .editor h3, .editor p { font-size: ${tipo}; }`,
    `.bar, .section, .editor button, .editor input, .editor select, .editor textarea { background-color: ${fondo}; }`,
    `.bar button { height: ${apariencia.elementosBarras}px; }`,
    `.bar button svg { width: ${apariencia.iconosBarras}px; height: ${apariencia.iconosBarras}px; }`,
    `.section button, .section input, .section select { height: ${apariencia.elementosSecciones}px; }`,
    `.section textarea { min-height: ${apariencia.elementosSecciones}px; }`,
    `.section h2 svg { width: ${apariencia.iconosSecciones}px; height: ${apariencia.iconosSecciones}px; }`,
  ].join("\n");
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

function fadeSeconds(scene: Scene): number {
  if (scene.cutWithPrevious !== "fundido" || scene.fadeTime === null) return 0;
  return scene.fadeTime;
}

function sceneStarts(scenes: Scene[]): number[] {
  const starts: number[] = [];
  let start = 0;
  for (let index = 0; index < scenes.length; index += 1) {
    starts.push(start);
    const overlap = index + 1 < scenes.length ? fadeSeconds(scenes[index + 1]) : 0;
    start += scenes[index].duration - overlap;
  }
  return starts;
}

function shortSeconds(scenes: Scene[]): number {
  if (scenes.length === 0) return 0;
  const starts = sceneStarts(scenes);
  return starts[starts.length - 1] + scenes[scenes.length - 1].duration;
}

function keptCuts(scenes: Scene[]): Map<string, { kind: "corte directo" | "fundido"; time: number | null }> {
  const cuts = new Map<string, { kind: "corte directo" | "fundido"; time: number | null }>();
  for (let index = 1; index < scenes.length; index += 1) {
    const scene = scenes[index];
    cuts.set(`${scenes[index - 1].id}>${scene.id}`, {
      kind: scene.cutWithPrevious === "fundido" ? "fundido" : "corte directo",
      time: scene.cutWithPrevious === "fundido" ? scene.fadeTime : null,
    });
  }
  return cuts;
}

function applyCuts(
  scenes: Scene[],
  cuts: Map<string, { kind: "corte directo" | "fundido"; time: number | null }>,
): Scene[] {
  return scenes.map((scene, index) => {
    if (index === 0) return { ...scene, cutWithPrevious: null, fadeTime: null };
    const kept = cuts.get(`${scenes[index - 1].id}>${scene.id}`);
    if (!kept || kept.kind !== "fundido" || kept.time === null) {
      return { ...scene, cutWithPrevious: "corte directo", fadeTime: null };
    }
    return { ...scene, cutWithPrevious: "fundido", fadeTime: kept.time };
  });
}

function shrinkFades(scenes: Scene[]): Scene[] {
  return scenes.map((scene, index) => {
    if (index === 0 || scene.cutWithPrevious !== "fundido" || scene.fadeTime === null) return scene;
    const limit = Math.min(scenes[index - 1].duration, scene.duration);
    if (scene.fadeTime <= limit) return scene;
    return { ...scene, fadeTime: limit };
  });
}

function tiempoInicialDelFundido(left: number, right: number): number {
  const shorter = Math.min(left, right);
  return shorter < 0.5 ? shorter : 0.5;
}

function nextCutOf(
  scenes: Scene[],
  sceneId: string,
): { kind: "corte directo" | "fundido"; time: number | null } | null {
  const index = scenes.findIndex((item) => item.id === sceneId);
  const following = index >= 0 ? scenes[index + 1] : undefined;
  if (!following) return null;
  if (following.cutWithPrevious === "fundido") return { kind: "fundido", time: following.fadeTime };
  return { kind: "corte directo", time: null };
}

type CapaCuadro = {
  sceneId: string;
  medium: Medium | null;
  url: string | null;
  entry: number;
  local: number;
  opacity: number;
  duration: number;
  texts: SceneText[];
  narrationId: string | null;
  narrationUrl: string | null;
};

function capaEnReposo(scene: Scene, library: Medium[]): CapaCuadro {
  const medium = library.find((item) => item.id === scene.mediumId) ?? null;
  const narration = scene.narrationId
    ? library.find((item) => item.id === scene.narrationId && item.kind === "audio") ?? null
    : null;
  return {
    sceneId: scene.id,
    medium,
    url: medium ? mediumUrl(medium.id) : null,
    entry: scene.entry ?? 0,
    local: 0,
    opacity: 1,
    duration: scene.duration,
    texts: scene.texts,
    narrationId: narration?.id ?? null,
    narrationUrl: narration ? mediumUrl(narration.id) : null,
  };
}

const cuadroStyle: CSSProperties = {
  position: "relative",
  containerType: "size",
  width: 120,
  aspectRatio: "9 / 16",
  overflow: "hidden",
  flexGrow: 0,
  flexShrink: 0,
  flexBasis: "120px",
};

const encaje: CSSProperties = {
  display: "block",
  width: "100%",
  height: "100%",
  objectFit: "cover",
  objectPosition: "center",
};

function textStyle(text: SceneText, index: number): CSSProperties {
  return {
    position: "absolute",
    left: `${text.x * 100}%`,
    top: `${text.y * 100}%`,
    transform: "translate(-50%, -50%)",
    color: text.color,
    textAlign: text.align,
    fontSize: `${text.size * 100}cqh`,
    fontFamily: "inherit",
    lineHeight: 1.1,
    width: "max-content",
    maxWidth: "100%",
    whiteSpace: "pre-wrap",
    zIndex: index + 1,
  };
}

function MedioEnCuadro({ layer }: { layer: CapaCuadro }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(layer.entry)) return;
    if (!video.paused) video.pause();
    try {
      video.currentTime = layer.entry;
    } catch {
      // A still can seek only after the file has metadata.
    }
  }, [layer.entry, layer.url]);

  if (!layer.medium || !layer.url) return null;
  if (layer.medium.kind === "imagen") {
    return <img src={layer.url} alt={layer.medium.name} style={encaje} />;
  }
  if (layer.medium.kind === "video") {
    return <video ref={videoRef} src={layer.url} muted playsInline style={encaje} />;
  }
  return null;
}

function NarrationAudio({
  sceneId,
  narrationId,
  src,
  duration,
  local,
}: {
  sceneId: string;
  narrationId: string;
  src: string;
  duration: number;
  local: number;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioStopTimer = useRef<number | null>(null);

  function clearAudioTimer() {
    if (audioStopTimer.current !== null) {
      window.clearTimeout(audioStopTimer.current);
      audioStopTimer.current = null;
    }
  }

  function scheduleAudioStop(audio: HTMLAudioElement) {
    clearAudioTimer();
    const remainingMs = Math.max(0, (duration - audio.currentTime) * 1000);
    audioStopTimer.current = window.setTimeout(() => {
      audioStopTimer.current = null;
      audio.pause();
    }, remainingMs);
  }

  function syncAudioStop(audio: HTMLAudioElement) {
    if (audio.currentTime >= duration) {
      clearAudioTimer();
      audio.pause();
      return;
    }
    scheduleAudioStop(audio);
  }

  useEffect(() => {
    const audio = audioRef.current;
    if (audio && !audio.paused && !audio.ended) syncAudioStop(audio);
    return () => clearAudioTimer();
  }, [sceneId, duration, narrationId]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(local)) return;
    try {
      audio.currentTime = local;
    } catch {
      // The preview seeks when the file can report a position.
    }
  }, [local]);

  return (
    <audio
      ref={audioRef}
      key={`${sceneId}:${narrationId}`}
      src={src}
      autoPlay
      loop={false}
      onPlay={(event) => syncAudioStop(event.currentTarget)}
      onPlaying={(event) => syncAudioStop(event.currentTarget)}
      onTimeUpdate={(event) => {
        if (event.currentTarget.currentTime >= duration) {
          clearAudioTimer();
          event.currentTarget.pause();
        }
      }}
      onWaiting={clearAudioTimer}
      onStalled={clearAudioTimer}
      onPause={clearAudioTimer}
      onEnded={clearAudioTimer}
    />
  );
}

function EscenaElegida({
  scene,
  medium,
  layers,
  visualMedia,
  audioMedia,
  nextCut,
  onDuration,
  onReplace,
  onSetNextCut,
  onSetFadeTime,
  onSetNarration,
  onAddText,
  onPatchText,
  onMoveText,
  onRemoveText,
}: {
  scene: Scene;
  medium: Medium | null;
  layers: CapaCuadro[];
  visualMedia: Medium[];
  audioMedia: Medium[];
  nextCut: { kind: "corte directo" | "fundido"; time: number | null } | null;
  onDuration: (next: number) => void;
  onReplace: (mediumId: string) => void;
  onSetNextCut: (kind: "corte directo" | "fundido") => void;
  onSetFadeTime: (next: number) => void;
  onSetNarration: (narrationId: string | null) => void;
  onAddText: () => void;
  onPatchText: (textId: string, patch: Partial<Omit<SceneText, "id">>) => void;
  onMoveText: (textId: string, direction: -1 | 1) => void;
  onRemoveText: (textId: string) => void;
}) {
  const narration = scene.narrationId
    ? audioMedia.find((audio) => audio.id === scene.narrationId) ?? null
    : null;

  return (
    <div className="escena-cuerpo" style={{ display: "flex", flexDirection: "row", alignItems: "flex-start", gap: "16px" }}>
      <section className="cuadro" aria-label="Cuadro" style={cuadroStyle}>
        {layers.map((layer) => (
          <div
            key={layer.sceneId}
            style={{ position: "absolute", inset: 0, opacity: layer.opacity }}
          >
            <MedioEnCuadro layer={layer} />
            {layer.texts.map((text, index) => (
              <span key={text.id} className="cuadro-texto" style={textStyle(text, index)}>
                {text.content}
              </span>
            ))}
          </div>
        ))}
        {layers.map((layer) =>
          layer.narrationId && layer.narrationUrl ? (
            <NarrationAudio
              key={`${layer.sceneId}:${layer.narrationId}`}
              sceneId={layer.sceneId}
              narrationId={layer.narrationId}
              src={layer.narrationUrl}
              duration={layer.duration}
              local={layer.local}
            />
          ) : null,
        )}
      </section>
      <div className="datos" style={{ flexGrow: 1, flexShrink: 1, flexBasis: 0, minWidth: 0 }}>
        <p>{medium?.name}</p>
        <label>
          Reemplazar
          <select
            value={scene.mediumId}
            onChange={(event) => {
              const next = event.currentTarget.value;
              if (next === scene.mediumId) return;
              event.currentTarget.value = scene.mediumId;
              onReplace(next);
            }}
          >
            {visualMedia.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <FractionField label="Duración" value={scene.duration} positiveOnly onChange={onDuration} />
        <p>{scene.duration} s</p>
        {scene.entry !== null ? <p>{scene.entry} s</p> : null}
        {scene.cutWithPrevious ? <p>{scene.cutWithPrevious}</p> : null}
        <label>
          Narración
          <select
            value={narration?.id ?? ""}
            onChange={(event) => onSetNarration(event.currentTarget.value || null)}
          >
            <option value="">Sin narración</option>
            {audioMedia.map((audio) => (
              <option key={audio.id} value={audio.id}>
                {audio.name}
              </option>
            ))}
          </select>
        </label>
        {nextCut ? (
          <fieldset>
            <legend>Fundido</legend>
            <label>
              Fundido
              <select
                value={nextCut.kind}
                onChange={(event) =>
                  onSetNextCut(event.currentTarget.value === "fundido" ? "fundido" : "corte directo")
                }
              >
                <option value="corte directo">Corte directo</option>
                <option value="fundido">Fundido</option>
              </select>
            </label>
            {nextCut.kind === "fundido" && nextCut.time !== null ? (
              <FractionField
                label="Tiempo del fundido"
                value={nextCut.time}
                positiveOnly
                onChange={onSetFadeTime}
              />
            ) : null}
          </fieldset>
        ) : null}
        <div className="textos">
          <div className="textos-cabecera">
            <h3>Textos</h3>
            <button type="button" onClick={onAddText}>
              Añadir texto
            </button>
          </div>
          <ul aria-label="Textos">
            {scene.texts.map((text, index) => (
              <li key={text.id} className="texto-item">
                <div className="texto-cabecera">
                  <p>Texto {index + 1}</p>
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => onMoveText(text.id, -1)}
                  >
                    Más atrás
                  </button>
                  <button
                    type="button"
                    disabled={index === scene.texts.length - 1}
                    onClick={() => onMoveText(text.id, 1)}
                  >
                    Más adelante
                  </button>
                  <button type="button" onClick={() => onRemoveText(text.id)}>
                    Quitar
                  </button>
                </div>
                <label>
                  Contenido
                  <textarea
                    value={text.content}
                    onChange={(event) => onPatchText(text.id, { content: event.currentTarget.value })}
                  />
                </label>
                <PercentField
                  label="Horizontal"
                  value={text.x}
                  onChange={(next) => onPatchText(text.id, { x: next })}
                />
                <PercentField
                  label="Vertical"
                  value={text.y}
                  onChange={(next) => onPatchText(text.id, { y: next })}
                />
                <PercentField
                  label="Tamaño"
                  value={text.size}
                  positiveOnly
                  onChange={(next) => onPatchText(text.id, { size: next })}
                />
                <label>
                  Color
                  <input
                    type="color"
                    value={text.color}
                    onChange={(event) => onPatchText(text.id, { color: event.currentTarget.value })}
                  />
                </label>
                <label>
                  Alineación
                  <select
                    value={text.align}
                    onChange={(event) =>
                      onPatchText(text.id, { align: event.currentTarget.value as TextAlign })
                    }
                  >
                    <option value="left">Izquierda</option>
                    <option value="center">Centro</option>
                    <option value="right">Derecha</option>
                  </select>
                </label>
              </li>
            ))}
          </ul>
          {scene.texts.length === 0 ? <p>Esta escena no tiene textos.</p> : null}
        </div>
      </div>
    </div>
  );
}

function planoDeEscena(scene: Scene, index: number, library: Medium[]): EscenaPlana {
  const medium = library.find((item) => item.id === scene.mediumId) ?? null;
  const visual =
    medium && medium.kind !== "audio" && mediumUrl(medium.id)
      ? { kind: medium.kind, src: mediumUrl(medium.id) as string, name: medium.name }
      : null;
  const narration = scene.narrationId
    ? library.find((item) => item.id === scene.narrationId && item.kind === "audio") ?? null
    : null;
  return {
    id: scene.id,
    duration: scene.duration,
    fadeIn: index === 0 ? 0 : fadeSeconds(scene),
    entry: scene.entry ?? 0,
    visual,
    texts: scene.texts,
    narrationSrc: narration ? mediumUrl(narration.id) : null,
  };
}

function FotogramaDeEntrada({ src, entry }: { src: string; entry: number }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const place = () => {
      try {
        video.currentTime = entry;
      } catch {
        // The still appears once the file can be seeked.
      }
      video.pause();
    };
    place();
    video.addEventListener("loadedmetadata", place);
    return () => video.removeEventListener("loadedmetadata", place);
  }, [src, entry]);
  return <video ref={ref} src={src} muted playsInline loop={false} style={encaje} />;
}

function VistaPrevia({
  scenes,
  library,
  moment,
  shortLength,
  playing,
  aviso,
  onScrub,
  onPlay,
  onPause,
  onRender,
}: {
  scenes: Scene[];
  library: Medium[];
  moment: number;
  shortLength: number;
  playing: boolean;
  aviso: "vacio" | "produciendo" | "fallo" | null;
  onScrub: (next: number) => void;
  onPlay: () => void;
  onPause: () => void;
  onRender: () => void;
}) {
  const playerRef = useRef<PlayerRef>(null);
  const cuadroRef = useRef<HTMLElement | null>(null);
  const escenas = scenes.map((scene, index) => planoDeEscena(scene, index, library));
  const durationInFrames = duracionDelShortEnFotogramas(escenas);
  const frame =
    durationInFrames === 0 ? 0 : Math.min(Math.max(fotogramas(moment), 0), durationInFrames - 1);

  useEffect(() => {
    const player = playerRef.current;
    if (!player || playing) return;
    player.seekTo(frame);
  }, [frame, durationInFrames, playing]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player || playing) return;
    player.pause();
  }, [playing]);

  useEffect(() => {
    const root = cuadroRef.current;
    if (!root) return;
    for (const audio of root.querySelectorAll("audio")) {
      const src = audio.getAttribute("src") ?? "";
      const heard = playing && src.startsWith("blob:");
      if (heard) {
        if (audio.paused) void audio.play();
      } else if (!audio.paused) {
        audio.pause();
      }
    }
  });

  return (
    <section className="section vista-previa" aria-label="Vista previa" style={{ flexGrow: 1, minHeight: 0 }}>
      <section
        className="cuadro"
        ref={cuadroRef}
        aria-label="Cuadro"
        style={{
          flexGrow: 1,
          flexShrink: 1,
          flexBasis: "auto",
          minHeight: 0,
          aspectRatio: "9 / 16",
          containerType: "size",
          width: "auto",
          maxWidth: "100%",
          alignSelf: "center",
        }}
      >
        {durationInFrames > 0 ? (
          <Player
            ref={playerRef}
            component={ComposicionDelShort}
            inputProps={{ escenas }}
            durationInFrames={durationInFrames}
            compositionWidth={ANCHO_DEL_SHORT}
            compositionHeight={ALTO_DEL_SHORT}
            fps={FOTOGRAMAS_POR_SEGUNDO}
            initialFrame={frame}
            autoPlay={false}
            controls={false}
            clickToPlay={false}
            doubleClickToFullscreen={false}
            spaceKeyToPlayOrPause={false}
            loop={false}
            moveToBeginningWhenEnded={false}
            defaultPremountInSeconds={0}
            logLevel="error"
            style={{ width: "100%", height: "100%" }}
            errorFallback={() => null}
          />
        ) : null}
      </section>
      <ul aria-label="Escenas">
        {escenas.map((escena, index) => {
          const name = escena.visual?.name ?? "Escena";
          return (
            <li key={escena.id} aria-label={name}>
              <button
                type="button"
                aria-label={name}
                onClick={() => {
                  onPause();
                  onScrub(sceneStarts(scenes)[index] ?? 0);
                }}
              >
                {escena.visual?.kind === "imagen" ? (
                  <img src={escena.visual.src} alt={escena.visual.name} style={encaje} />
                ) : null}
                {escena.visual?.kind === "video" ? (
                  <FotogramaDeEntrada src={escena.visual.src} entry={escena.entry} />
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
      <label>
        Recorrido
        <input
          type="range"
          min={0}
          max={shortLength}
          step="any"
          value={Math.min(moment, shortLength)}
          onChange={(event) => {
            const next = Math.min(Math.max(Number(event.currentTarget.value), 0), shortLength);
            if (next === moment) return;
            onPause();
            onScrub(next);
          }}
        />
      </label>
      <button
        type="button"
        onClick={(event) => {
          if (aviso === "produciendo" || moment >= shortLength) return;
          playerRef.current?.seekTo(frame);
          onPlay();
          playerRef.current?.play(event);
        }}
        disabled={playing || aviso === "produciendo"}
      >
        Reproducir
      </button>
      <button type="button" onClick={onPause} disabled={!playing}>
        Pausar
      </button>
      <button type="button" onClick={onRender} disabled={aviso === "produciendo"}>
        Renderizar
      </button>
      {aviso === "vacio" ? <p>No hay escenas</p> : null}
      {aviso === "produciendo" ? <p>Produciendo el archivo</p> : null}
      {aviso === "fallo" ? <p>No se pudo producir el archivo</p> : null}
    </section>
  );
}

export function Editor() {
  const [user, setUser] = useState(openUser);
  const [mode, setMode] = useState<Mode>("escenas");
  const [chosenMediumId, setChosenMediumId] = useState<string | null>(null);
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);
  const [playhead, setPlayhead] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [aviso, setAviso] = useState<"vacio" | "produciendo" | "fallo" | null>(null);
  const sceneCount = useRef(0);
  const [apariencia, setApariencia] = useState(openApariencia);
  const [revision, setRevision] = useState(0);
  const project = user.projects[0];
  const shortLength = shortSeconds(project.scenes);
  const moment = Math.min(playhead, shortLength);

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      setPlayhead((current) => {
        const next = Math.round((current + 0.1) * 10) / 10;
        return next >= shortLength ? shortLength : next;
      });
    }, 100);
    return () => window.clearInterval(id);
  }, [playing, shortLength]);

  useEffect(() => {
    if (playing && moment >= shortLength) setPlaying(false);
  }, [playing, moment, shortLength]);

  useEffect(() => {
    if (project.scenes.length > sceneCount.current && (aviso === "vacio" || aviso === "fallo")) {
      setAviso(null);
    }
    sceneCount.current = project.scenes.length;
  }, [aviso, project.scenes.length]);
  const visualMedia = user.library.filter(
    (medium) => medium.kind === "imagen" || medium.kind === "video",
  );
  const audioMedia = user.library.filter((medium) => medium.kind === "audio");
  const chosen =
    visualMedia.find((medium) => medium.id === chosenMediumId) ?? visualMedia[0] ?? null;
  const selectedScene = project.scenes.find((scene) => scene.id === selectedSceneId) ?? null;
  const libraryRef = useRef(user.library);
  libraryRef.current = user.library;
  const editTicket = useRef(new Map<string, number>());

  function takeTicket(sceneId: string) {
    const ticket = (editTicket.current.get(sceneId) ?? 0) + 1;
    editTicket.current.set(sceneId, ticket);
    return ticket;
  }

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    const activeIds = new Set(user.library.map((medium) => medium.id));
    for (const id of [...heldFiles.keys()]) {
      if (!activeIds.has(id)) {
        releaseFile(id);
      }
    }
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

  function removeMedium(mediumId: string) {
    setUser((current) =>
      isMediumUsed(current.projects, mediumId)
        ? current
        : { ...current, library: current.library.filter((item) => item.id !== mediumId) },
    );
  }

  async function onAdd() {
    if (!chosen) return;
    const mediumId = chosen.id;
    const birth = await sceneBirth(chosen);
    if (!birth || !libraryRef.current.some((item) => item.id === mediumId)) return;
    const sceneId = crypto.randomUUID();
    setSelectedSceneId(sceneId);
    setMode("escena");
    setUser((current) => {
      if (!current.library.some((item) => item.id === mediumId)) return current;
      const currentProject = current.projects[0];
      const scene: Scene = {
        id: sceneId,
        mediumId,
        duration: birth.duration,
        entry: birth.entry,
        cutWithPrevious: currentProject.scenes.length > 0 ? "corte directo" : null,
        fadeTime: null,
        texts: [],
        narrationId: null,
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

  function updateScene(sceneId: string, updater: (scene: Scene) => Scene) {
    setUser((current) => {
      const currentProject = current.projects[0];
      return {
        ...current,
        projects: [
          {
            ...currentProject,
            scenes: currentProject.scenes.map((scene) =>
              scene.id === sceneId ? updater(scene) : scene,
            ),
          },
          ...current.projects.slice(1),
        ],
      };
    });
  }

  function setNarration(sceneId: string, narrationId: string | null) {
    if (narrationId !== null) {
      const medium = user.library.find((item) => item.id === narrationId);
      if (!medium || medium.kind !== "audio") return;
    }
    updateScene(sceneId, (scene) => ({ ...scene, narrationId }));
  }

  function addText(sceneId: string) {
    const text: SceneText = {
      id: crypto.randomUUID(),
      content: "Texto",
      x: 0.5,
      y: 0.5,
      size: 0.08,
      color: "#ffffff",
      align: "center",
    };
    updateScene(sceneId, (scene) => ({ ...scene, texts: [...scene.texts, text] }));
  }

  function patchText(sceneId: string, textId: string, patch: Partial<Omit<SceneText, "id">>) {
    if (patch.color !== undefined && !isHexColor(patch.color)) return;
    updateScene(sceneId, (scene) => ({
      ...scene,
      texts: scene.texts.map((text) => (text.id === textId ? { ...text, ...patch } : text)),
    }));
  }

  function moveText(sceneId: string, textId: string, direction: -1 | 1) {
    updateScene(sceneId, (scene) => {
      const index = scene.texts.findIndex((text) => text.id === textId);
      const next = index + direction;
      if (index < 0 || next < 0 || next >= scene.texts.length) return scene;
      const texts = [...scene.texts];
      const [item] = texts.splice(index, 1);
      texts.splice(next, 0, item);
      return { ...scene, texts };
    });
  }

  function removeText(sceneId: string, textId: string) {
    updateScene(sceneId, (scene) => ({
      ...scene,
      texts: scene.texts.filter((text) => text.id !== textId),
    }));
  }

  async function setDuration(sceneId: string, next: number) {
    if (!(next > 0)) return;
    const scene = project.scenes.find((item) => item.id === sceneId);
    if (!scene) return;
    const medium = user.library.find((item) => item.id === scene.mediumId);
    if (!medium || (medium.kind !== "imagen" && medium.kind !== "video")) return;
    const ticket = takeTicket(sceneId);
    let fileDuration = Number.POSITIVE_INFINITY;
    if (medium.kind === "video") {
      const url = mediumUrl(medium.id);
      if (!url) return;
      fileDuration = await readVideoDuration(url);
      if (editTicket.current.get(sceneId) !== ticket) return;
      if (!Number.isFinite(fileDuration) || fileDuration <= 0) return;
    }
    if (editTicket.current.get(sceneId) !== ticket) return;
    const mediumId = medium.id;
    const kind = medium.kind;
    setUser((current) => {
      const currentProject = current.projects[0];
      const latest = currentProject.scenes.find((item) => item.id === sceneId);
      if (!latest || latest.mediumId !== mediumId) return current;
      if (kind === "video" && (latest.entry ?? 0) + next > fileDuration) return current;
      return {
        ...current,
        projects: [
          {
            ...currentProject,
            scenes: shrinkFades(
              currentProject.scenes.map((item) =>
                item.id === sceneId ? { ...item, duration: next } : item,
              ),
            ),
          },
          ...current.projects.slice(1),
        ],
      };
    });
  }

  async function replaceVisual(sceneId: string, mediumId: string) {
    const scene = project.scenes.find((item) => item.id === sceneId);
    if (!scene || scene.mediumId === mediumId) return;
    const medium = user.library.find((item) => item.id === mediumId);
    if (!medium || (medium.kind !== "imagen" && medium.kind !== "video")) return;
    const ticket = takeTicket(sceneId);
    if (medium.kind === "imagen") {
      updateScene(sceneId, (current) => ({ ...current, mediumId, entry: null }));
      return;
    }
    const url = mediumUrl(medium.id);
    if (!url) return;
    const fileDuration = await readVideoDuration(url);
    if (editTicket.current.get(sceneId) !== ticket) return;
    if (!Number.isFinite(fileDuration) || fileDuration <= 0) return;
    setUser((current) => {
      if (!current.library.some((item) => item.id === mediumId && item.kind === "video")) {
        return current;
      }
      const currentProject = current.projects[0];
      const scenes = shrinkFades(
        currentProject.scenes.map((item) => {
          if (item.id !== sceneId || item.mediumId === mediumId) return item;
          const duration = fileDuration < item.duration ? fileDuration : item.duration;
          return { ...item, mediumId, entry: 0, duration };
        }),
      );
      return {
        ...current,
        projects: [{ ...currentProject, scenes }, ...current.projects.slice(1)],
      };
    });
  }

  function setNextCut(sceneId: string, kind: "corte directo" | "fundido") {
    setUser((current) => {
      const currentProject = current.projects[0];
      const index = currentProject.scenes.findIndex((item) => item.id === sceneId);
      if (index < 0 || index >= currentProject.scenes.length - 1) return current;
      const following = currentProject.scenes[index + 1];
      if (kind === "fundido" && following.cutWithPrevious === "fundido") return current;
      const updated: Scene =
        kind === "corte directo"
          ? { ...following, cutWithPrevious: "corte directo", fadeTime: null }
          : {
              ...following,
              cutWithPrevious: "fundido",
              fadeTime: tiempoInicialDelFundido(currentProject.scenes[index].duration, following.duration),
            };
      return {
        ...current,
        projects: [
          {
            ...currentProject,
            scenes: currentProject.scenes.map((item, itemIndex) =>
              itemIndex === index + 1 ? updated : item,
            ),
          },
          ...current.projects.slice(1),
        ],
      };
    });
  }

  function setFadeTime(sceneId: string, time: number) {
    if (!(time > 0)) return;
    setUser((current) => {
      const currentProject = current.projects[0];
      const index = currentProject.scenes.findIndex((item) => item.id === sceneId);
      if (index < 0 || index >= currentProject.scenes.length - 1) return current;
      const following = currentProject.scenes[index + 1];
      if (following.cutWithPrevious !== "fundido" || following.fadeTime === null) return current;
      const limit = Math.min(currentProject.scenes[index].duration, following.duration);
      if (time > limit) return current;
      return {
        ...current,
        projects: [
          {
            ...currentProject,
            scenes: currentProject.scenes.map((item, itemIndex) =>
              itemIndex === index + 1 ? { ...item, fadeTime: time } : item,
            ),
          },
          ...current.projects.slice(1),
        ],
      };
    });
  }

  function arrangeScenes(next: Scene[], previous: Scene[]) {
    return applyCuts(next, keptCuts(previous));
  }

  function deleteScene(sceneId: string) {
    setSelectedSceneId((current) => (current === sceneId ? null : current));
    setUser((current) => {
      const currentProject = current.projects[0];
      const scenes = arrangeScenes(
        currentProject.scenes.filter((item) => item.id !== sceneId),
        currentProject.scenes,
      );
      return {
        ...current,
        projects: [{ ...currentProject, scenes }, ...current.projects.slice(1)],
      };
    });
  }

  function moveScene(sceneId: string, direction: -1 | 1) {
    setUser((current) => {
      const currentProject = current.projects[0];
      const index = currentProject.scenes.findIndex((item) => item.id === sceneId);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= currentProject.scenes.length) return current;
      const scenes = [...currentProject.scenes];
      const [moved] = scenes.splice(index, 1);
      scenes.splice(target, 0, moved);
      return {
        ...current,
        projects: [
          { ...currentProject, scenes: arrangeScenes(scenes, currentProject.scenes) },
          ...current.projects.slice(1),
        ],
      };
    });
  }

  function setValor<K extends keyof Apariencia>(key: K, value: Apariencia[K]) {
    setApariencia((current) => {
      const next = { ...current, [key]: value };
      rememberApariencia(next);
      return next;
    });
  }

  function restablecer() {
    const next = { ...feelingInicial };
    rememberApariencia(next);
    setApariencia(next);
    setRevision((current) => current + 1);
  }

  return (
    <main
      className="editor"
      style={
        {
          fontSize: `${apariencia.tipografia}px`,
          color: apariencia.texto,
          backgroundColor: apariencia.fondo,
          "--fg": apariencia.texto,
          "--bg": apariencia.fondo,
          "--bar-icon": `${apariencia.iconosBarras}px`,
          "--bar-element": `${apariencia.elementosBarras}px`,
          "--section-icon": `${apariencia.iconosSecciones}px`,
          "--section-element": `${apariencia.elementosSecciones}px`,
        } as CSSProperties
      }
    >
      <style>{paint(apariencia)}</style>
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
              disabled={aviso === "produciendo"}
              onClick={() => {
                if (aviso === "produciendo") return;
                if (item.id !== "vista-previa") setAviso(null);
                setMode(item.id);
              }}
            >
              <Glyph />
              {item.label}
            </button>
          ))}
        </nav>
      </header>
      {mode === "biblioteca" ? (
        <section className="section" aria-label="Biblioteca">
          <SectionHeading>Biblioteca</SectionHeading>
          <label>
            Incorporar
            <input type="file" onChange={onIncorporate} />
          </label>
          <ul aria-label="Medios" className="medios">
            {user.library.map((medium) => {
              const label = `${medium.name} ${medium.kind}`;
              return (
                <li key={medium.id} aria-label={label} className="medio-item">
                  <span>{label}</span>
                  <button type="button" onClick={() => removeMedium(medium.id)}>
                    Quitar
                  </button>
                </li>
              );
            })}
          </ul>
          {user.library.length === 0 ? <p>No hay medios.</p> : null}
        </section>
      ) : null}
      {mode === "escenas" ? (
        <section className="section" aria-label="Escenas">
          <SectionHeading>Escenas</SectionHeading>
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
            {project.scenes.map((scene, index) => {
              const medium = user.library.find((item) => item.id === scene.mediumId);
              const name = medium?.name ?? "Escena";
              return (
                <li key={scene.id} aria-label={name}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSceneId(scene.id);
                      setMode("escena");
                    }}
                  >
                    {name}
                  </button>
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveScene(scene.id, -1)}
                  >
                    Mover antes
                  </button>
                  <button
                    type="button"
                    disabled={index === project.scenes.length - 1}
                    onClick={() => moveScene(scene.id, 1)}
                  >
                    Mover después
                  </button>
                  <button type="button" onClick={() => deleteScene(scene.id)}>
                    Eliminar
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
          <SectionHeading>Escena</SectionHeading>
          {selectedScene ? (
            <EscenaElegida
              scene={selectedScene}
              medium={user.library.find((item) => item.id === selectedScene.mediumId) ?? null}
              layers={[capaEnReposo(selectedScene, user.library)]}
              visualMedia={visualMedia}
              audioMedia={audioMedia}
              nextCut={nextCutOf(project.scenes, selectedScene.id)}
              onDuration={(next) => setDuration(selectedScene.id, next)}
              onReplace={(mediumId) => replaceVisual(selectedScene.id, mediumId)}
              onSetNextCut={(kind) => setNextCut(selectedScene.id, kind)}
              onSetFadeTime={(next) => setFadeTime(selectedScene.id, next)}
              onSetNarration={(narrationId) => setNarration(selectedScene.id, narrationId)}
              onAddText={() => addText(selectedScene.id)}
              onPatchText={(textId, patch) => patchText(selectedScene.id, textId, patch)}
              onMoveText={(textId, direction) => moveText(selectedScene.id, textId, direction)}
              onRemoveText={(textId) => removeText(selectedScene.id, textId)}
            />
          ) : (
            <div
              className="escena-cuerpo"
              style={{ display: "flex", flexDirection: "row", alignItems: "flex-start", gap: "16px" }}
            >
              <section className="cuadro" aria-label="Cuadro" style={cuadroStyle} />
              <p>No hay una escena que editar.</p>
            </div>
          )}
        </section>
      ) : null}
      {mode === "vista-previa" ? (
        <VistaPrevia
          scenes={project.scenes}
          library={user.library}
          moment={moment}
          shortLength={shortLength}
          playing={playing}
          aviso={aviso}
          onScrub={setPlayhead}
          onPlay={() => {
            if (aviso === "produciendo" || moment >= shortLength) return;
            setPlaying(true);
          }}
          onPause={() => setPlaying(false)}
          onRender={() => {
            if (aviso === "produciendo") return;
            if (project.scenes.length === 0) {
              setAviso("vacio");
              return;
            }
            setPlaying(false);
            const escenas = project.scenes.map((scene, index) => planoDeEscena(scene, index, user.library));
            const durationInFrames = duracionDelShortEnFotogramas(escenas);
            const archivo = {
              container: "mp4" as const,
              videoCodec: "h264" as const,
              audioCodec: "aac" as const,
              videoBitrate: "medium" as const,
              audioBitrate: "medium" as const,
              muted: false,
              width: ANCHO_DEL_SHORT,
              height: ALTO_DEL_SHORT,
            };
            void (async () => {
              const ready = await canRenderMediaOnWeb(archivo);
              if (!ready.canRender) {
                setAviso("fallo");
                return;
              }
              setAviso("produciendo");
              try {
                const result = await renderMediaOnWeb({
                  composition: {
                    id: "proyecto",
                    component: ComposicionDelShort,
                    durationInFrames,
                    fps: FOTOGRAMAS_POR_SEGUNDO,
                    width: ANCHO_DEL_SHORT,
                    height: ALTO_DEL_SHORT,
                    defaultProps: { escenas },
                  },
                  inputProps: { escenas },
                  ...archivo,
                  sampleRate: 48000,
                  keyframeIntervalInSeconds: 5,
                  hardwareAcceleration: "no-preference",
                  allowHtmlInCanvas: false,
                  metadata: null,
                });
                const blob = await result.getBlob();
                const url = URL.createObjectURL(blob);
                const anchor = document.createElement("a");
                anchor.href = url;
                anchor.download = "Proyecto.mp4";
                anchor.click();
                window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
                setAviso(null);
              } catch {
                setAviso("fallo");
              }
            })();
          }}
        />
      ) : null}
      {mode === "apariencia" ? (
        <section className="section" aria-label="Apariencia">
          <SectionHeading>Apariencia</SectionHeading>
          <fieldset>
            <legend>Interfaz</legend>
            <SizeField
              key={`tipografia-${revision}`}
              label="Tipografía"
              value={apariencia.tipografia}
              onChange={(next) => setValor("tipografia", next)}
            />
            <label>
              Color del texto
              <input
                type="color"
                value={apariencia.texto}
                onChange={(event) => setValor("texto", event.target.value)}
              />
            </label>
            <label>
              Color de fondo
              <input
                type="color"
                value={apariencia.fondo}
                onChange={(event) => setValor("fondo", event.target.value)}
              />
            </label>
          </fieldset>
          <fieldset>
            <legend>Barras</legend>
            <SizeField
              key={`iconos-barras-${revision}`}
              label="Iconos de las barras"
              value={apariencia.iconosBarras}
              onChange={(next) => setValor("iconosBarras", next)}
            />
            <SizeField
              key={`elementos-barras-${revision}`}
              label="Elementos de las barras"
              value={apariencia.elementosBarras}
              onChange={(next) => setValor("elementosBarras", next)}
            />
          </fieldset>
          <fieldset>
            <legend>Secciones</legend>
            <SizeField
              key={`iconos-secciones-${revision}`}
              label="Iconos de las secciones"
              value={apariencia.iconosSecciones}
              onChange={(next) => setValor("iconosSecciones", next)}
            />
            <SizeField
              key={`elementos-secciones-${revision}`}
              label="Elementos de las secciones"
              value={apariencia.elementosSecciones}
              onChange={(next) => setValor("elementosSecciones", next)}
            />
          </fieldset>
          <button type="button" onClick={restablecer}>
            Restablecer
          </button>
        </section>
      ) : null}
    </main>
  );
}
