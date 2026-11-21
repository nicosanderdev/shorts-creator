import { useState, type CSSProperties } from "react";
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
  const project = user.projects[0];

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
          <ul aria-label="Medios" />
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
