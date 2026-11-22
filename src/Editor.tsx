import { useState, type ChangeEvent, type CSSProperties } from "react";
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

type Project = {
  name: string;
  scenes: unknown[];
};

type UserDocument = {
  id: string;
  library: unknown[];
  projects: Project[];
};

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

function parseUser(value: unknown): UserDocument | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  if (typeof record.id !== "string" || record.id === "") return null;
  if (!Array.isArray(record.library) || !Array.isArray(record.projects)) return null;
  const projects: Project[] = [];
  for (const item of record.projects) {
    const project = parseProject(item);
    if (!project) return null;
    projects.push(project);
  }
  if (projects.length === 0) return null;
  return { id: record.id, library: record.library, projects };
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

function readSize(raw: string): number | "keep-typing" | "reject" {
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
  const [draft, setDraft] = useState<{ base: number; text: string } | null>(null);
  const shown = draft && draft.base === value ? draft.text : value;

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const raw = event.target.value;
    const read = readSize(raw);
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
        min={8}
        max={96}
        step={1}
        value={shown}
        onChange={handleChange}
        onBlur={() => setDraft(null)}
      />
    </label>
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
    `.editor, .bar, .section, .editor button, .editor input, .editor label, .editor legend, .editor h1, .editor h2, .editor p { font-size: ${tipo}; }`,
    `.bar, .section, .editor button, .editor input { background-color: ${fondo}; }`,
    `.bar button { height: ${apariencia.elementosBarras}px; }`,
    `.bar button svg { width: ${apariencia.iconosBarras}px; height: ${apariencia.iconosBarras}px; }`,
    `.section button, .section input { height: ${apariencia.elementosSecciones}px; }`,
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

export function Editor() {
  const [user] = useState(openUser);
  const [mode, setMode] = useState<Mode>("escenas");
  const [apariencia, setApariencia] = useState(openApariencia);
  const [revision, setRevision] = useState(0);
  const project = user.projects[0];

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
              <Glyph />
              {item.label}
            </button>
          ))}
        </nav>
      </header>
      {mode === "biblioteca" ? (
        <section className="section" aria-label="Biblioteca">
          <SectionHeading>Biblioteca</SectionHeading>
          <ul aria-label="Medios" />
          {user.library.length === 0 ? <p>No hay medios.</p> : null}
        </section>
      ) : null}
      {mode === "escenas" ? (
        <section className="section" aria-label="Escenas">
          <SectionHeading>Escenas</SectionHeading>
          <ul aria-label="Escenas" />
          {project.scenes.length === 0 ? <p>El proyecto no tiene escenas.</p> : null}
        </section>
      ) : null}
      {mode === "escena" ? (
        <section className="section" aria-label="Escena">
          <SectionHeading>Escena</SectionHeading>
          <p>No hay una escena que editar.</p>
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
