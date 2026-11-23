import { useEffect, useRef, useState, type ChangeEvent, type CSSProperties } from "react";
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

function scenePreviewTime(scenes: Scene[], index: number): number {
  const start = sceneStarts(scenes)[index] ?? 0;
  const scene = scenes[index];
  if (!scene || index === 0) return start;
  const fadeIn = fadeSeconds(scene);
  if (fadeIn <= 0 || fadeIn >= scene.duration) return start;
  return start + fadeIn;
}

function bornFade(left: number, right: number): number {
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

function layerOpacity(local: number, duration: number, fadeIn: number, fadeOut: number): number {
  let opacity = 1;
  if (fadeIn > 0 && local < fadeIn) opacity = local / fadeIn;
  if (fadeOut > 0 && duration - local < fadeOut) {
    opacity = Math.min(opacity, (duration - local) / fadeOut);
  }
  return opacity;
}

type FrameLayer = {
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

function frameLayers(scenes: Scene[], library: Medium[], moment: number): FrameLayer[] {
  const starts = sceneStarts(scenes);
  const length = shortSeconds(scenes);
  const time = length === 0 ? 0 : Math.min(Math.max(moment, 0), length);
  const layers: FrameLayer[] = [];
  scenes.forEach((scene, index) => {
    const start = starts[index];
    const end = start + scene.duration;
    const isLast = index === scenes.length - 1;
    if (!(time >= start && (time < end || (isLast && time === end)))) return;
    const local = Math.min(Math.max(time - start, 0), scene.duration);
    const fadeIn = index === 0 ? 0 : fadeSeconds(scene);
    const fadeOut = index + 1 < scenes.length ? fadeSeconds(scenes[index + 1]) : 0;
    const narration = scene.narrationId
      ? library.find((item) => item.id === scene.narrationId && item.kind === "audio") ?? null
      : null;
    const medium = library.find((item) => item.id === scene.mediumId) ?? null;
    layers.push({
      sceneId: scene.id,
      medium,
      url: medium ? mediumUrl(medium.id) : null,
      entry: scene.entry ?? 0,
      local,
      opacity: layerOpacity(local, scene.duration, fadeIn, fadeOut),
      duration: scene.duration,
      texts: scene.texts,
      narrationId: narration?.id ?? null,
      narrationUrl: narration ? mediumUrl(narration.id) : null,
    });
  });
  return layers;
}

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

function VisualLayer({ layer }: { layer: FrameLayer }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const nextTime = layer.entry + layer.local;
    if (!Number.isFinite(nextTime)) return;
    try {
      video.currentTime = nextTime;
    } catch {
      // A preview can seek only after the file has metadata.
    }
  }, [layer.entry, layer.local, layer.url]);

  if (!layer.medium || !layer.url) return null;
  if (layer.medium.kind === "imagen") {
    return <img src={layer.url} alt={layer.medium.name} style={encaje} />;
  }
  if (layer.medium.kind === "video") {
    return <video ref={videoRef} src={layer.url} muted autoPlay playsInline style={encaje} />;
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

function SceneFrame({
  scene,
  medium,
  layers,
  visualMedia,
  audioMedia,
  nextCut,
  moment,
  shortLength,
  onDuration,
  onReplace,
  onScrub,
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
  layers: FrameLayer[];
  visualMedia: Medium[];
  audioMedia: Medium[];
  nextCut: { kind: "corte directo" | "fundido"; time: number | null } | null;
  moment: number;
  shortLength: number;
  onDuration: (next: number) => void;
  onReplace: (mediumId: string) => void;
  onScrub: (next: number) => void;
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
      <section
        className="cuadro"
        aria-label="Cuadro"
        style={{
          position: "relative",
          containerType: "size",
          aspectRatio: "9 / 16",
          overflow: "hidden",
          flexGrow: 2,
          flexShrink: 1,
          flexBasis: 0,
          minWidth: 0,
        }}
      >
        {layers.map((layer) => (
          <div
            key={layer.sceneId}
            style={{ position: "absolute", inset: 0, opacity: layer.opacity }}
          >
            <VisualLayer layer={layer} />
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
        {nextCut ? (
          <label>
            Corte con la siguiente
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
        ) : null}
        {nextCut?.kind === "fundido" && nextCut.time !== null ? (
          <FractionField
            label="Tiempo del fundido"
            value={nextCut.time}
            positiveOnly
            onChange={onSetFadeTime}
          />
        ) : null}
        <label>
          Recorrer
          <input
            type="range"
            min={0}
            max={shortLength}
            step="any"
            value={moment}
            onChange={(event) => onScrub(Number(event.currentTarget.value))}
          />
        </label>
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
                <FractionField
                  label="Horizontal"
                  value={text.x}
                  onChange={(next) => onPatchText(text.id, { x: next })}
                />
                <FractionField
                  label="Vertical"
                  value={text.y}
                  onChange={(next) => onPatchText(text.id, { y: next })}
                />
                <FractionField
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

export function Editor() {
  const [user, setUser] = useState(openUser);
  const [mode, setMode] = useState<Mode>("escenas");
  const [chosenMediumId, setChosenMediumId] = useState<string | null>(null);
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);
  const [playhead, setPlayhead] = useState(0);
  const [apariencia, setApariencia] = useState(openApariencia);
  const [revision, setRevision] = useState(0);
  const project = user.projects[0];
  const visualMedia = user.library.filter(
    (medium) => medium.kind === "imagen" || medium.kind === "video",
  );
  const audioMedia = user.library.filter((medium) => medium.kind === "audio");
  const chosen =
    visualMedia.find((medium) => medium.id === chosenMediumId) ?? visualMedia[0] ?? null;
  const selectedScene = project.scenes.find((scene) => scene.id === selectedSceneId) ?? null;
  const shortLength = shortSeconds(project.scenes);
  const moment = Math.min(playhead, shortLength);
  const libraryRef = useRef(user.library);
  libraryRef.current = user.library;

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
    const start = shortSeconds(project.scenes);
    setSelectedSceneId(sceneId);
    setPlayhead(start);
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
    let fileDuration = Number.POSITIVE_INFINITY;
    if (medium.kind === "video") {
      const url = mediumUrl(medium.id);
      if (!url) return;
      fileDuration = await readVideoDuration(url);
      if (!Number.isFinite(fileDuration) || fileDuration <= 0) return;
    }
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
    if (medium.kind === "imagen") {
      updateScene(sceneId, (current) => ({ ...current, mediumId, entry: null }));
      return;
    }
    const url = mediumUrl(medium.id);
    if (!url) return;
    const fileDuration = await readVideoDuration(url);
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
              fadeTime: bornFade(currentProject.scenes[index].duration, following.duration),
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
              onClick={() => setMode(item.id)}
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
                      setPlayhead(scenePreviewTime(project.scenes, index));
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
            <SceneFrame
              scene={selectedScene}
              medium={user.library.find((item) => item.id === selectedScene.mediumId) ?? null}
              layers={frameLayers(project.scenes, user.library, moment)}
              visualMedia={visualMedia}
              audioMedia={audioMedia}
              nextCut={nextCutOf(project.scenes, selectedScene.id)}
              moment={moment}
              shortLength={shortLength}
              onDuration={(next) => setDuration(selectedScene.id, next)}
              onReplace={(mediumId) => replaceVisual(selectedScene.id, mediumId)}
              onScrub={setPlayhead}
              onSetNextCut={(kind) => setNextCut(selectedScene.id, kind)}
              onSetFadeTime={(next) => setFadeTime(selectedScene.id, next)}
              onSetNarration={(narrationId) => setNarration(selectedScene.id, narrationId)}
              onAddText={() => addText(selectedScene.id)}
              onPatchText={(textId, patch) => patchText(selectedScene.id, textId, patch)}
              onMoveText={(textId, direction) => moveText(selectedScene.id, textId, direction)}
              onRemoveText={(textId) => removeText(selectedScene.id, textId)}
            />
          ) : (
            <p>No hay una escena que editar.</p>
          )}
        </section>
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
