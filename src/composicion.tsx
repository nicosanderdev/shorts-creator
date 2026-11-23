import { AbsoluteFill, Img, Sequence, useCurrentFrame } from "remotion";
import { Audio, Video } from "@remotion/media";

export const FOTOGRAMAS_POR_SEGUNDO = 30;
export const ANCHO_DEL_SHORT = 1080;
export const ALTO_DEL_SHORT = 1920;

export type TextoDeEscena = {
  id: string;
  content: string;
  x: number;
  y: number;
  size: number;
  color: string;
  align: "left" | "center" | "right";
};

export type EscenaPlana = {
  id: string;
  duration: number;
  fadeIn: number;
  entry: number;
  visual: { kind: "imagen" | "video"; src: string; name: string } | null;
  texts: TextoDeEscena[];
  narrationSrc: string | null;
};

type EscenaColocada = EscenaPlana & {
  from: number;
  durationInFrames: number;
  fadeInFrames: number;
  fadeOutFrames: number;
  trimBefore: number;
};

export function fotogramas(seconds: number): number {
  return Math.round(seconds * FOTOGRAMAS_POR_SEGUNDO);
}

export function duracionDelShortEnFotogramas(escenas: Pick<EscenaPlana, "duration" | "fadeIn">[]): number {
  if (escenas.length === 0) return 0;
  const seconds = escenas.reduce((total, escena, index) => {
    const overlap = index + 1 < escenas.length ? escenas[index + 1].fadeIn : 0;
    return total + escena.duration - overlap;
  }, 0);
  return fotogramas(seconds);
}

function colocar(escenas: EscenaPlana[]): EscenaColocada[] {
  let cursor = 0;
  return escenas.map((escena, index) => {
    const fadeOut = index + 1 < escenas.length ? escenas[index + 1].fadeIn : 0;
    const placed: EscenaColocada = {
      ...escena,
      from: fotogramas(cursor),
      durationInFrames: Math.max(1, fotogramas(escena.duration)),
      fadeInFrames: fotogramas(escena.fadeIn),
      fadeOutFrames: fotogramas(fadeOut),
      trimBefore: fotogramas(escena.entry),
    };
    cursor += escena.duration - fadeOut;
    return placed;
  });
}

function opacidad(local: number, duration: number, fadeIn: number, fadeOut: number): number {
  let opacity = 1;
  if (fadeIn > 0 && local < fadeIn) opacity = local / fadeIn;
  if (fadeOut > 0 && duration - local < fadeOut) {
    opacity = Math.min(opacity, (duration - local) / fadeOut);
  }
  return opacity;
}

function Capa({ escena }: { escena: EscenaColocada }) {
  const local = useCurrentFrame();
  const opacity = opacidad(local, escena.durationInFrames, escena.fadeInFrames, escena.fadeOutFrames);
  return (
    <AbsoluteFill style={{ opacity }}>
      {escena.visual?.kind === "imagen" ? (
        <Img
          src={escena.visual.src}
          alt={escena.visual.name}
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
        />
      ) : null}
      {escena.visual?.kind === "video" ? (
        <Video
          src={escena.visual.src}
          trimBefore={escena.trimBefore}
          durationInFrames={escena.durationInFrames}
          muted
          loop={false}
          objectFit="cover"
          premountFor={0}
          style={{ width: "100%", height: "100%", objectPosition: "center" }}
        />
      ) : null}
      {escena.texts.map((text, index) => (
        <span
          key={text.id}
          style={{
            position: "absolute",
            left: `${text.x * 100}%`,
            top: `${text.y * 100}%`,
            transform: "translate(-50%, -50%)",
            color: text.color,
            textAlign: text.align,
            fontSize: `${text.size * ALTO_DEL_SHORT}px`,
            fontFamily: "system-ui, sans-serif",
            lineHeight: 1.1,
            width: "max-content",
            maxWidth: "100%",
            whiteSpace: "pre-wrap",
            zIndex: index + 1,
          }}
        >
          {text.content}
        </span>
      ))}
      {escena.narrationSrc ? <Audio src={escena.narrationSrc} premountFor={0} /> : null}
    </AbsoluteFill>
  );
}

export function ComposicionDelShort({ escenas }: { escenas: EscenaPlana[] }) {
  const placed = colocar(escenas);
  return (
    <AbsoluteFill>
      {placed.map((escena) => (
        <Sequence key={escena.id} from={escena.from} durationInFrames={escena.durationInFrames} premountFor={0}>
          <Capa escena={escena} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
}
