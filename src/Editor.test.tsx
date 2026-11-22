import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test } from "vitest";
import { Editor } from "./Editor";

const fileDurations = new WeakMap<File, number>();
let restorePlayback: (() => void) | null = null;

function fileWithDuration(name: string, type: string, duration: number) {
  const file = new File(["medio"], name, { type });
  fileDurations.set(file, duration);
  return file;
}

// jsdom has no object URL and does not load media metadata. The frame and the
// birth of a video need both, the way a browser reads the file.
function stubPlayback() {
  const durationByUrl = new Map<string, number>();
  let count = 0;
  const originalCreate = URL.createObjectURL;
  const originalRevoke = URL.revokeObjectURL;
  URL.createObjectURL = (blob: Blob) => {
    const url = `blob:stub-${count++}`;
    const duration = fileDurations.get(blob as File);
    durationByUrl.set(url, duration === undefined ? Number.NaN : duration);
    return url;
  };
  URL.revokeObjectURL = () => {};

  const prototype = HTMLMediaElement.prototype;
  const previousSrc = Object.getOwnPropertyDescriptor(prototype, "src");
  Object.defineProperty(prototype, "src", {
    configurable: true,
    get() {
      return this.getAttribute("src") ?? "";
    },
    set(value: string) {
      this.setAttribute("src", value);
      Object.defineProperty(this, "duration", {
        configurable: true,
        get: () => durationByUrl.get(value) ?? Number.NaN,
      });
      this.dispatchEvent(new Event("loadedmetadata"));
    },
  });

  restorePlayback = () => {
    if (originalCreate) URL.createObjectURL = originalCreate;
    else Reflect.deleteProperty(URL, "createObjectURL");
    if (originalRevoke) URL.revokeObjectURL = originalRevoke;
    else Reflect.deleteProperty(URL, "revokeObjectURL");
    if (previousSrc) Object.defineProperty(prototype, "src", previousSrc);
    else Reflect.deleteProperty(prototype, "src");
    restorePlayback = null;
  };
}

afterEach(() => {
  restorePlayback?.();
});

const modes = ["Biblioteca", "Escenas", "Escena", "Apariencia"] as const;

test("al abrir, la barra muestra el proyecto y una duración del short de cero", () => {
  render(<Editor />);

  expect(screen.getByRole("heading", { name: "Proyecto" })).toBeInTheDocument();
  expect(screen.getByText("El short dura 0 s")).toBeInTheDocument();
  expect(screen.getByRole("list", { name: "Escenas" })).toBeEmptyDOMElement();
  expect(screen.getByText("El proyecto no tiene escenas.")).toBeInTheDocument();
});

test("la barra sigue visible y en la pantalla hay un solo modo", async () => {
  const user = userEvent.setup();
  render(<Editor />);

  const bar = screen.getByRole("banner");
  for (const mode of modes) {
    expect(within(bar).getByRole("button", { name: mode })).toBeInTheDocument();
  }

  await user.click(within(bar).getByRole("button", { name: "Biblioteca" }));
  expect(within(bar).getByRole("heading", { name: "Proyecto" })).toBeInTheDocument();
  expect(within(bar).getByText("El short dura 0 s")).toBeInTheDocument();
  expect(screen.getByRole("list", { name: "Medios" })).toBeEmptyDOMElement();
  expect(screen.getByText("No hay medios.")).toBeInTheDocument();
  expect(screen.queryByRole("region", { name: "Escenas" })).not.toBeInTheDocument();
  expect(screen.queryByRole("region", { name: "Escena" })).not.toBeInTheDocument();
  expect(screen.queryByRole("region", { name: "Apariencia" })).not.toBeInTheDocument();

  await user.click(within(bar).getByRole("button", { name: "Escenas" }));
  expect(within(bar).getByRole("heading", { name: "Proyecto" })).toBeInTheDocument();
  expect(within(bar).getByText("El short dura 0 s")).toBeInTheDocument();
  expect(screen.getByRole("list", { name: "Escenas" })).toBeEmptyDOMElement();
  expect(screen.getByText("El proyecto no tiene escenas.")).toBeInTheDocument();
  expect(screen.queryByRole("region", { name: "Biblioteca" })).not.toBeInTheDocument();
  expect(screen.queryByRole("region", { name: "Escena" })).not.toBeInTheDocument();
  expect(screen.queryByRole("region", { name: "Apariencia" })).not.toBeInTheDocument();

  await user.click(within(bar).getByRole("button", { name: "Escena" }));
  expect(within(bar).getByRole("heading", { name: "Proyecto" })).toBeInTheDocument();
  expect(within(bar).getByText("El short dura 0 s")).toBeInTheDocument();
  expect(screen.getByText("No hay una escena que editar.")).toBeInTheDocument();
  expect(screen.queryByRole("region", { name: "Biblioteca" })).not.toBeInTheDocument();
  expect(screen.queryByRole("region", { name: "Escenas" })).not.toBeInTheDocument();
  expect(screen.queryByRole("region", { name: "Apariencia" })).not.toBeInTheDocument();

  await user.click(within(bar).getByRole("button", { name: "Apariencia" }));
  expect(within(bar).getByRole("heading", { name: "Proyecto" })).toBeInTheDocument();
  expect(within(bar).getByText("El short dura 0 s")).toBeInTheDocument();
  expect(screen.getByRole("region", { name: "Apariencia" })).toBeInTheDocument();
  expect(screen.queryByRole("region", { name: "Biblioteca" })).not.toBeInTheDocument();
  expect(screen.queryByRole("region", { name: "Escenas" })).not.toBeInTheDocument();
  expect(screen.queryByRole("region", { name: "Escena" })).not.toBeInTheDocument();
});

test("al volver, el proyecto y la biblioteca siguen vacíos", async () => {
  const user = userEvent.setup();
  const first = render(<Editor />);

  expect(screen.getByRole("heading", { name: "Proyecto" })).toBeInTheDocument();
  expect(screen.getByText("El short dura 0 s")).toBeInTheDocument();
  expect(screen.getByRole("list", { name: "Escenas" })).toBeEmptyDOMElement();

  first.unmount();
  render(<Editor />);

  expect(screen.getByRole("heading", { name: "Proyecto" })).toBeInTheDocument();
  expect(screen.getByText("El short dura 0 s")).toBeInTheDocument();
  expect(screen.getByRole("list", { name: "Escenas" })).toBeEmptyDOMElement();
  expect(screen.getByText("El proyecto no tiene escenas.")).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "Biblioteca" }));
  expect(screen.getByRole("list", { name: "Medios" })).toBeEmptyDOMElement();
  expect(screen.getByText("No hay medios.")).toBeInTheDocument();
});

test("el feeling inicial pinta la tipografía, el texto y el fondo", () => {
  render(<Editor />);

  expect(screen.getByRole("main")).toHaveStyle({
    fontSize: "16px",
    color: "#1a1a1a",
    backgroundColor: "#f7f7f5",
  });
});

test("incorporar un video crea un medio con su nombre y su clase", async () => {
  const user = userEvent.setup();
  render(<Editor />);

  await user.click(screen.getByRole("button", { name: "Biblioteca" }));
  await user.upload(
    screen.getByLabelText("Incorporar"),
    new File(["video"], "clip.mp4", { type: "video/mp4" }),
  );

  const list = screen.getByRole("list", { name: "Medios" });
  const item = within(list).getByRole("listitem");
  expect(item).toHaveTextContent(/^clip\.mp4 video$/);
  expect(screen.queryByText("No hay medios.")).not.toBeInTheDocument();
});

test("incorporar una imagen o un audio crea un medio con su clase", async () => {
  const user = userEvent.setup();
  render(<Editor />);

  await user.click(screen.getByRole("button", { name: "Biblioteca" }));
  const input = screen.getByLabelText("Incorporar");
  await user.upload(input, new File(["imagen"], "foto.png", { type: "image/png" }));
  await user.upload(input, new File(["audio"], "nota.mp3", { type: "audio/mpeg" }));

  const list = screen.getByRole("list", { name: "Medios" });
  expect(within(list).getByRole("listitem", { name: "foto.png imagen" })).toBeInTheDocument();
  expect(within(list).getByRole("listitem", { name: "nota.mp3 audio" })).toBeInTheDocument();
  expect(screen.queryByText("No hay medios.")).not.toBeInTheDocument();
  expect(screen.getAllByRole("list")).toHaveLength(1);
});

test("un GIF se incorpora como video", async () => {
  const user = userEvent.setup();
  render(<Editor />);

  await user.click(screen.getByRole("button", { name: "Biblioteca" }));
  const input = screen.getByLabelText("Incorporar");
  await user.upload(input, new File(["gif"], "anim.gif", { type: "image/gif" }));
  await user.upload(input, new File(["gif"], "otro.GIF", { type: "application/octet-stream" }));

  const items = within(screen.getByRole("list", { name: "Medios" })).getAllByRole("listitem");
  expect(items.map((item) => item.textContent)).toEqual(["otro.GIF video", "anim.gif video"]);
  expect(screen.queryByText("imagen")).not.toBeInTheDocument();
});

test("el mismo archivo, traído dos veces, son dos medios", async () => {
  const user = userEvent.setup();
  render(<Editor />);

  await user.click(screen.getByRole("button", { name: "Biblioteca" }));
  const input = screen.getByLabelText("Incorporar");
  const clip = new File(["video"], "clip.mp4", { type: "video/mp4" });
  await user.upload(input, clip);
  await user.upload(input, clip);

  const items = within(screen.getByRole("list", { name: "Medios" })).getAllByRole("listitem");
  expect(items.map((item) => item.textContent)).toEqual(["clip.mp4 video", "clip.mp4 video"]);
});

test("dos medios pueden llamarse igual y no se renombran", async () => {
  const user = userEvent.setup();
  render(<Editor />);

  await user.click(screen.getByRole("button", { name: "Biblioteca" }));
  const input = screen.getByLabelText("Incorporar");
  await user.upload(input, new File(["uno"], "foto.png", { type: "image/png" }));
  await user.upload(input, new File(["dos"], "foto.png", { type: "image/png" }));

  const items = within(screen.getByRole("list", { name: "Medios" })).getAllByRole("listitem");
  expect(items.map((item) => item.textContent)).toEqual(["foto.png imagen", "foto.png imagen"]);
});

test("un archivo de otra clase no crea un medio y la biblioteca queda como estaba", async () => {
  const user = userEvent.setup();
  render(<Editor />);

  await user.click(screen.getByRole("button", { name: "Biblioteca" }));
  const input = screen.getByLabelText("Incorporar");
  const list = screen.getByRole("list", { name: "Medios" });

  await user.upload(input, new File(["%PDF"], "notas.pdf", { type: "application/pdf" }));
  expect(list).toBeEmptyDOMElement();
  expect(screen.getByText("No hay medios.")).toBeInTheDocument();

  await user.upload(input, new File(["video"], "clip.mp4", { type: "video/mp4" }));
  await user.upload(input, new File(["texto"], "nota.txt", { type: "text/plain" }));

  const items = within(list).getAllByRole("listitem");
  expect(items.map((item) => item.textContent)).toEqual(["clip.mp4 video"]);
  expect(screen.queryByText("No hay medios.")).not.toBeInTheDocument();
});

test("la lista muestra el medio más reciente primero", async () => {
  const user = userEvent.setup();
  render(<Editor />);

  await user.click(screen.getByRole("button", { name: "Biblioteca" }));
  const input = screen.getByLabelText("Incorporar");
  await user.upload(input, new File(["video"], "clip.mp4", { type: "video/mp4" }));
  await user.upload(input, new File(["imagen"], "foto.png", { type: "image/png" }));

  const items = within(screen.getByRole("list", { name: "Medios" })).getAllByRole("listitem");
  expect(items.map((item) => item.textContent)).toEqual(["foto.png imagen", "clip.mp4 video"]);
});

test("sin tipo, la extensión decide la clase y lo demás no entra", async () => {
  const user = userEvent.setup();
  render(<Editor />);

  await user.click(screen.getByRole("button", { name: "Biblioteca" }));
  const input = screen.getByLabelText("Incorporar");
  await user.upload(input, new File(["video"], "clip.mp4", { type: "" }));
  await user.upload(input, new File(["imagen"], "foto.png", { type: "" }));
  await user.upload(input, new File(["audio"], "nota.mp3", { type: "" }));
  await user.upload(input, new File(["otro"], "notas.pdf", { type: "" }));

  const items = within(screen.getByRole("list", { name: "Medios" })).getAllByRole("listitem");
  expect(items.map((item) => item.textContent)).toEqual([
    "nota.mp3 audio",
    "foto.png imagen",
    "clip.mp4 video",
  ]);
  expect(screen.queryByText("No hay medios.")).not.toBeInTheDocument();
});

test("al volver, la biblioteca sigue con los medios, el más reciente primero", async () => {
  const user = userEvent.setup();
  const first = render(<Editor />);

  await user.click(screen.getByRole("button", { name: "Biblioteca" }));
  const input = screen.getByLabelText("Incorporar");
  await user.upload(input, new File(["video"], "clip.mp4", { type: "video/mp4" }));
  await user.upload(input, new File(["audio"], "nota.mp3", { type: "audio/mpeg" }));

  first.unmount();
  render(<Editor />);

  await user.click(screen.getByRole("button", { name: "Biblioteca" }));
  const items = within(screen.getByRole("list", { name: "Medios" })).getAllByRole("listitem");
  expect(items.map((item) => item.textContent)).toEqual(["nota.mp3 audio", "clip.mp4 video"]);
  expect(screen.queryByText("No hay medios.")).not.toBeInTheDocument();
});

test("incorporar un medio no crea una escena", async () => {
  const user = userEvent.setup();
  render(<Editor />);

  await user.click(screen.getByRole("button", { name: "Biblioteca" }));
  await user.upload(
    screen.getByLabelText("Incorporar"),
    new File(["video"], "clip.mp4", { type: "video/mp4" }),
  );

  await user.click(screen.getByRole("button", { name: "Escenas" }));
  expect(screen.getByRole("list", { name: "Escenas" })).toBeEmptyDOMElement();
  expect(screen.getByText("El proyecto no tiene escenas.")).toBeInTheDocument();
  expect(screen.getByText("El short dura 0 s")).toBeInTheDocument();
  expect(screen.queryByRole("region", { name: "Biblioteca" })).not.toBeInTheDocument();
});

test("una imagen nace en tres segundos, sin recorte, y llena el cuadro", async () => {
  stubPlayback();
  const user = userEvent.setup();
  render(<Editor />);

  await user.click(screen.getByRole("button", { name: "Biblioteca" }));
  await user.upload(
    screen.getByLabelText("Incorporar"),
    new File(["imagen"], "foto.png", { type: "image/png" }),
  );

  await user.click(screen.getByRole("button", { name: "Escenas" }));
  await user.click(screen.getByRole("button", { name: "Añadir" }));

  const scene = await screen.findByRole("region", { name: "Escena" });
  expect(within(scene).getByText("foto.png")).toBeInTheDocument();
  expect(within(scene).getByText("3 s")).toBeInTheDocument();
  expect(within(scene).queryByText("0 s")).not.toBeInTheDocument();
  expect(within(scene).queryByText("corte directo")).not.toBeInTheDocument();
  expect(screen.getByText("El short dura 3 s")).toBeInTheDocument();
  expect(scene.querySelector("audio")).toBeNull();
  expect(within(scene).queryByRole("button")).not.toBeInTheDocument();
  expect(within(scene).queryByRole("combobox")).not.toBeInTheDocument();
  expect(within(scene).queryByRole("checkbox")).not.toBeInTheDocument();
  expect(screen.queryByRole("region", { name: "Escenas" })).not.toBeInTheDocument();
  expect(screen.queryByRole("region", { name: "Biblioteca" })).not.toBeInTheDocument();
  expect(screen.queryByRole("region", { name: "Apariencia" })).not.toBeInTheDocument();

  const frame = within(scene).getByRole("region", { name: "Cuadro" });
  const image = within(frame).getByRole("img", { name: "foto.png" });
  expect(image).toHaveStyle({ objectFit: "cover", objectPosition: "center" });
  expect(frame).toHaveStyle({ aspectRatio: "9 / 16", overflow: "hidden" });
  expect(frame.parentElement).toHaveStyle({ display: "flex", flexDirection: "row" });
  expect(frame).toHaveStyle({ flexGrow: "2" });
  expect(frame.nextElementSibling).toHaveStyle({ flexGrow: "1" });

  await user.click(screen.getByRole("button", { name: "Escenas" }));
  expect(
    within(screen.getByRole("list", { name: "Escenas" }))
      .getAllByRole("listitem")
      .map((item) => item.textContent),
  ).toEqual(["foto.png"]);
  expect(screen.queryByRole("region", { name: "Escena" })).not.toBeInTheDocument();
});

test("sin una imagen o un video no se añade una escena", async () => {
  const user = userEvent.setup();
  render(<Editor />);

  expect(screen.queryByRole("button", { name: "Añadir" })).not.toBeInTheDocument();
  expect(screen.queryByRole("combobox", { name: "Medio visual" })).not.toBeInTheDocument();
  expect(screen.getByText("El proyecto no tiene escenas.")).toBeInTheDocument();
  expect(screen.getByText("El short dura 0 s")).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "Biblioteca" }));
  await user.upload(
    screen.getByLabelText("Incorporar"),
    new File(["audio"], "nota.mp3", { type: "audio/mpeg" }),
  );

  await user.click(screen.getByRole("button", { name: "Escenas" }));
  expect(screen.queryByRole("button", { name: "Añadir" })).not.toBeInTheDocument();
  expect(screen.queryByRole("combobox", { name: "Medio visual" })).not.toBeInTheDocument();
  expect(screen.getByRole("list", { name: "Escenas" })).toBeEmptyDOMElement();
  expect(screen.getByText("El proyecto no tiene escenas.")).toBeInTheDocument();
  expect(screen.getByText("El short dura 0 s")).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "Escena" }));
  expect(screen.getByText("No hay una escena que editar.")).toBeInTheDocument();
});

test("un audio no entra en la elección del medio visual", async () => {
  const user = userEvent.setup();
  render(<Editor />);

  await user.click(screen.getByRole("button", { name: "Biblioteca" }));
  const input = screen.getByLabelText("Incorporar");
  await user.upload(input, new File(["imagen"], "foto.png", { type: "image/png" }));
  await user.upload(input, new File(["audio"], "nota.mp3", { type: "audio/mpeg" }));

  await user.click(screen.getByRole("button", { name: "Escenas" }));
  const choice = screen.getByRole("combobox", { name: "Medio visual" });
  expect(within(choice).getAllByRole("option").map((option) => option.textContent)).toEqual([
    "foto.png",
  ]);
  expect(within(choice).queryByRole("option", { name: "nota.mp3" })).not.toBeInTheDocument();
});

test("un video de diez segundos nace con la entrada al inicio y dura tres", async () => {
  stubPlayback();
  const user = userEvent.setup();
  render(<Editor />);

  await user.click(screen.getByRole("button", { name: "Biblioteca" }));
  await user.upload(
    screen.getByLabelText("Incorporar"),
    fileWithDuration("clip.mp4", "video/mp4", 10),
  );

  await user.click(screen.getByRole("button", { name: "Escenas" }));
  await user.click(screen.getByRole("button", { name: "Añadir" }));

  const scene = await screen.findByRole("region", { name: "Escena" });
  expect(within(scene).getByText("clip.mp4")).toBeInTheDocument();
  expect(within(scene).getByText("0 s")).toBeInTheDocument();
  expect(within(scene).getByText("3 s")).toBeInTheDocument();
  expect(screen.getByText("El short dura 3 s")).toBeInTheDocument();

  const frame = within(scene).getByRole("region", { name: "Cuadro" });
  const video = frame.querySelector("video");
  expect(video).not.toBeNull();
  expect(frame.querySelector("img")).toBeNull();
  expect(video).toHaveProperty("muted", true);
  expect(video).toHaveProperty("loop", false);
  expect(video).not.toHaveAttribute("controls");
  expect(video).toHaveStyle({ objectFit: "cover", objectPosition: "center" });
  expect(scene.querySelector("audio")).toBeNull();
  expect(within(scene).queryByRole("button")).not.toBeInTheDocument();
  expect(within(scene).queryByRole("checkbox")).not.toBeInTheDocument();
});

async function settle() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

test("un video más corto que tres segundos nace con el largo del archivo", async () => {
  stubPlayback();
  const user = userEvent.setup();
  render(<Editor />);

  await user.click(screen.getByRole("button", { name: "Biblioteca" }));
  await user.upload(
    screen.getByLabelText("Incorporar"),
    fileWithDuration("corto.mp4", "video/mp4", 2),
  );

  await user.click(screen.getByRole("button", { name: "Escenas" }));
  await user.click(screen.getByRole("button", { name: "Añadir" }));

  const scene = await screen.findByRole("region", { name: "Escena" });
  expect(within(scene).getByText("corto.mp4")).toBeInTheDocument();
  expect(within(scene).getByText("0 s")).toBeInTheDocument();
  expect(within(scene).getByText("2 s")).toBeInTheDocument();
  expect(screen.getByText("El short dura 2 s")).toBeInTheDocument();
  const video = within(scene).getByRole("region", { name: "Cuadro" }).querySelector("video");
  expect(video).toHaveProperty("muted", true);
  expect(video).toHaveProperty("loop", false);
  expect(scene.querySelector("audio")).toBeNull();
});

test("un video sin duración positiva no se añade y el proyecto queda como estaba", async () => {
  stubPlayback();
  const user = userEvent.setup();
  render(<Editor />);

  await user.click(screen.getByRole("button", { name: "Biblioteca" }));
  await user.upload(
    screen.getByLabelText("Incorporar"),
    fileWithDuration("vacio.mp4", "video/mp4", 0),
  );
  await user.click(screen.getByRole("button", { name: "Escenas" }));
  await user.click(screen.getByRole("button", { name: "Añadir" }));
  await settle();

  expect(screen.getByRole("list", { name: "Escenas" })).toBeEmptyDOMElement();
  expect(screen.getByText("El proyecto no tiene escenas.")).toBeInTheDocument();
  expect(screen.getByText("El short dura 0 s")).toBeInTheDocument();
  expect(screen.queryByRole("region", { name: "Escena" })).not.toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "Biblioteca" }));
  const input = screen.getByLabelText("Incorporar");
  await user.upload(input, new File(["imagen"], "foto.png", { type: "image/png" }));
  await user.upload(input, fileWithDuration("nada.webm", "video/webm", Number.NaN));

  await user.click(screen.getByRole("button", { name: "Escenas" }));
  let choice = screen.getByRole("combobox", { name: "Medio visual" });
  await user.selectOptions(choice, within(choice).getByRole("option", { name: "foto.png" }));
  await user.click(screen.getByRole("button", { name: "Añadir" }));

  let scene = await screen.findByRole("region", { name: "Escena" });
  expect(within(scene).getByText("foto.png")).toBeInTheDocument();
  expect(screen.getByText("El short dura 3 s")).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "Escenas" }));
  choice = screen.getByRole("combobox", { name: "Medio visual" });
  await user.selectOptions(choice, within(choice).getByRole("option", { name: "nada.webm" }));
  await user.click(screen.getByRole("button", { name: "Añadir" }));
  await settle();

  expect(screen.getByText("El short dura 3 s")).toBeInTheDocument();
  expect(screen.queryByRole("region", { name: "Escena" })).not.toBeInTheDocument();
  expect(
    within(screen.getByRole("list", { name: "Escenas" }))
      .getAllByRole("listitem")
      .map((item) => item.textContent),
  ).toEqual(["foto.png"]);

  await user.click(screen.getByRole("button", { name: "Escena" }));
  scene = screen.getByRole("region", { name: "Escena" });
  expect(within(scene).getByText("foto.png")).toBeInTheDocument();
  expect(screen.queryByText("nada.webm")).not.toBeInTheDocument();
});

test("un GIF se ve en el cuadro como video, en silencio y sin repetirse", async () => {
  stubPlayback();
  const user = userEvent.setup();
  render(<Editor />);

  await user.click(screen.getByRole("button", { name: "Biblioteca" }));
  await user.upload(
    screen.getByLabelText("Incorporar"),
    fileWithDuration("anim.gif", "image/gif", 10),
  );

  await user.click(screen.getByRole("button", { name: "Escenas" }));
  expect(
    within(screen.getByRole("combobox", { name: "Medio visual" })).getByRole("option", {
      name: "anim.gif",
    }),
  ).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Añadir" }));

  const scene = await screen.findByRole("region", { name: "Escena" });
  const frame = within(scene).getByRole("region", { name: "Cuadro" });
  const video = frame.querySelector("video");
  expect(video).not.toBeNull();
  expect(frame.querySelector("img")).toBeNull();
  expect(video).toHaveProperty("muted", true);
  expect(video).toHaveProperty("loop", false);
  expect(video).not.toHaveAttribute("loop");
  expect(video).not.toHaveAttribute("controls");
  expect(video).toHaveStyle({ objectFit: "cover", objectPosition: "center" });
  expect(within(scene).getByText("3 s")).toBeInTheDocument();
  expect(within(scene).getByText("0 s")).toBeInTheDocument();
  expect(screen.getByText("El short dura 3 s")).toBeInTheDocument();
  expect(scene.querySelector("audio")).toBeNull();
  expect(within(scene).queryByRole("button")).not.toBeInTheDocument();
  expect(within(scene).queryByRole("checkbox")).not.toBeInTheDocument();
});

test("dos escenas quedan en orden, la segunda nace en corte directo y la barra suma", async () => {
  const user = userEvent.setup();
  render(<Editor />);

  await user.click(screen.getByRole("button", { name: "Biblioteca" }));
  const input = screen.getByLabelText("Incorporar");
  await user.upload(input, new File(["una"], "foto.png", { type: "image/png" }));
  await user.upload(input, new File(["otra"], "otra.png", { type: "image/png" }));

  await user.click(screen.getByRole("button", { name: "Escenas" }));
  let choice = screen.getByRole("combobox", { name: "Medio visual" });
  await user.selectOptions(choice, within(choice).getByRole("option", { name: "foto.png" }));
  await user.click(screen.getByRole("button", { name: "Añadir" }));

  let scene = await screen.findByRole("region", { name: "Escena" });
  expect(within(scene).getByText("foto.png")).toBeInTheDocument();
  expect(within(scene).queryByText("corte directo")).not.toBeInTheDocument();
  expect(screen.getByText("El short dura 3 s")).toBeInTheDocument();
  expect(screen.queryByRole("region", { name: "Escenas" })).not.toBeInTheDocument();
  expect(screen.queryByRole("region", { name: "Biblioteca" })).not.toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "Escenas" }));
  choice = screen.getByRole("combobox", { name: "Medio visual" });
  await user.selectOptions(choice, within(choice).getByRole("option", { name: "otra.png" }));
  await user.click(screen.getByRole("button", { name: "Añadir" }));

  scene = await screen.findByRole("region", { name: "Escena" });
  expect(within(scene).getByText("otra.png")).toBeInTheDocument();
  expect(within(scene).getByText("corte directo")).toBeInTheDocument();
  expect(within(scene).getByText("3 s")).toBeInTheDocument();
  expect(screen.getByText("El short dura 6 s")).toBeInTheDocument();
  expect(screen.queryByRole("region", { name: "Escenas" })).not.toBeInTheDocument();
  expect(screen.queryByRole("region", { name: "Biblioteca" })).not.toBeInTheDocument();
  expect(screen.queryByRole("region", { name: "Apariencia" })).not.toBeInTheDocument();
  expect(scene.querySelector("audio")).toBeNull();

  await user.click(screen.getByRole("button", { name: "Escenas" }));
  expect(
    within(screen.getByRole("list", { name: "Escenas" }))
      .getAllByRole("listitem")
      .map((item) => item.textContent),
  ).toEqual(["foto.png", "otra.png"]);
  expect(screen.queryByRole("region", { name: "Escena" })).not.toBeInTheDocument();

  await user.click(
    within(screen.getByRole("list", { name: "Escenas" })).getByRole("button", { name: "foto.png" }),
  );
  scene = await screen.findByRole("region", { name: "Escena" });
  expect(within(scene).getByText("foto.png")).toBeInTheDocument();
  expect(within(scene).queryByText("corte directo")).not.toBeInTheDocument();
  expect(within(scene).getByRole("region", { name: "Cuadro" })).toBeInTheDocument();
  expect(screen.getByText("El short dura 6 s")).toBeInTheDocument();
  expect(screen.queryByRole("region", { name: "Escenas" })).not.toBeInTheDocument();
});

test("al volver, la escena añadida sigue en el proyecto", async () => {
  const user = userEvent.setup();
  const first = render(<Editor />);

  await user.click(screen.getByRole("button", { name: "Biblioteca" }));
  await user.upload(
    screen.getByLabelText("Incorporar"),
    new File(["imagen"], "foto.png", { type: "image/png" }),
  );
  await user.click(screen.getByRole("button", { name: "Escenas" }));
  await user.click(screen.getByRole("button", { name: "Añadir" }));
  await screen.findByRole("region", { name: "Escena" });

  first.unmount();
  render(<Editor />);

  expect(screen.getByText("El short dura 3 s")).toBeInTheDocument();
  expect(screen.queryByText("El proyecto no tiene escenas.")).not.toBeInTheDocument();
  expect(
    within(screen.getByRole("list", { name: "Escenas" }))
      .getAllByRole("listitem")
      .map((item) => item.textContent),
  ).toEqual(["foto.png"]);

  await user.click(
    within(screen.getByRole("list", { name: "Escenas" })).getByRole("button", { name: "foto.png" }),
  );
  const scene = screen.getByRole("region", { name: "Escena" });
  expect(within(scene).getByText("foto.png")).toBeInTheDocument();
  expect(within(scene).getByText("3 s")).toBeInTheDocument();
  expect(within(scene).queryByText("0 s")).not.toBeInTheDocument();
  expect(within(scene).queryByText("corte directo")).not.toBeInTheDocument();
  const image = within(scene).getByRole("img", { name: "foto.png" });
  expect(image.getAttribute("src")).toBeTruthy();
});
