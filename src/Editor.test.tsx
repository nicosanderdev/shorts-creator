import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test, vi } from "vitest";
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
  vi.useRealTimers();
  restorePlayback?.();
});

const modes = ["Biblioteca", "Escenas", "Escena", "Apariencia", "Vista previa"] as const;

function libraryLabels(list: HTMLElement) {
  return within(list)
    .getAllByRole("listitem")
    .map((item) => item.getAttribute("aria-label"));
}

async function removeLibraryMedium(
  user: ReturnType<typeof userEvent.setup>,
  list: HTMLElement,
  label: string,
) {
  await user.click(
    within(within(list).getByRole("listitem", { name: label })).getByRole("button", {
      name: "Quitar",
    }),
  );
}

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
  expect(
    within(bar)
      .getAllByRole("button")
      .map((button) => button.textContent),
  ).toEqual([...modes]);
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
  expect(screen.queryByRole("region", { name: "Vista previa" })).not.toBeInTheDocument();

  await user.click(within(bar).getByRole("button", { name: "Escenas" }));
  expect(within(bar).getByRole("heading", { name: "Proyecto" })).toBeInTheDocument();
  expect(within(bar).getByText("El short dura 0 s")).toBeInTheDocument();
  expect(screen.getByRole("list", { name: "Escenas" })).toBeEmptyDOMElement();
  expect(screen.getByText("El proyecto no tiene escenas.")).toBeInTheDocument();
  expect(screen.queryByRole("region", { name: "Biblioteca" })).not.toBeInTheDocument();
  expect(screen.queryByRole("region", { name: "Escena" })).not.toBeInTheDocument();
  expect(screen.queryByRole("region", { name: "Apariencia" })).not.toBeInTheDocument();
  expect(screen.queryByRole("region", { name: "Vista previa" })).not.toBeInTheDocument();

  await user.click(within(bar).getByRole("button", { name: "Escena" }));
  expect(within(bar).getByRole("heading", { name: "Proyecto" })).toBeInTheDocument();
  expect(within(bar).getByText("El short dura 0 s")).toBeInTheDocument();
  expect(screen.getByText("No hay una escena que editar.")).toBeInTheDocument();
  expect(screen.queryByRole("region", { name: "Biblioteca" })).not.toBeInTheDocument();
  expect(screen.queryByRole("region", { name: "Escenas" })).not.toBeInTheDocument();
  expect(screen.queryByRole("region", { name: "Apariencia" })).not.toBeInTheDocument();
  expect(screen.queryByRole("region", { name: "Vista previa" })).not.toBeInTheDocument();

  await user.click(within(bar).getByRole("button", { name: "Apariencia" }));
  expect(within(bar).getByRole("heading", { name: "Proyecto" })).toBeInTheDocument();
  expect(within(bar).getByText("El short dura 0 s")).toBeInTheDocument();
  expect(screen.getByRole("region", { name: "Apariencia" })).toBeInTheDocument();
  expect(screen.queryByRole("region", { name: "Biblioteca" })).not.toBeInTheDocument();
  expect(screen.queryByRole("region", { name: "Escenas" })).not.toBeInTheDocument();
  expect(screen.queryByRole("region", { name: "Escena" })).not.toBeInTheDocument();
  expect(screen.queryByRole("region", { name: "Vista previa" })).not.toBeInTheDocument();

  await user.click(within(bar).getByRole("button", { name: "Vista previa" }));
  expect(within(bar).getByRole("heading", { name: "Proyecto" })).toBeInTheDocument();
  expect(within(bar).getByText("El short dura 0 s")).toBeInTheDocument();
  expect(screen.getByRole("region", { name: "Vista previa" })).toBeInTheDocument();
  expect(screen.queryByRole("region", { name: "Biblioteca" })).not.toBeInTheDocument();
  expect(screen.queryByRole("region", { name: "Escenas" })).not.toBeInTheDocument();
  expect(screen.queryByRole("region", { name: "Escena" })).not.toBeInTheDocument();
  expect(screen.queryByRole("region", { name: "Apariencia" })).not.toBeInTheDocument();
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
  expect(item).toHaveAccessibleName("clip.mp4 video");
  expect(within(item).getByText(/^clip\.mp4 video$/)).toBeInTheDocument();
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

  const list = screen.getByRole("list", { name: "Medios" });
  expect(libraryLabels(list)).toEqual(["otro.GIF video", "anim.gif video"]);
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

  expect(libraryLabels(screen.getByRole("list", { name: "Medios" }))).toEqual([
    "clip.mp4 video",
    "clip.mp4 video",
  ]);
});

test("dos medios pueden llamarse igual y no se renombran", async () => {
  const user = userEvent.setup();
  render(<Editor />);

  await user.click(screen.getByRole("button", { name: "Biblioteca" }));
  const input = screen.getByLabelText("Incorporar");
  await user.upload(input, new File(["uno"], "foto.png", { type: "image/png" }));
  await user.upload(input, new File(["dos"], "foto.png", { type: "image/png" }));

  expect(libraryLabels(screen.getByRole("list", { name: "Medios" }))).toEqual([
    "foto.png imagen",
    "foto.png imagen",
  ]);
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

  expect(libraryLabels(list)).toEqual(["clip.mp4 video"]);
  expect(screen.queryByText("No hay medios.")).not.toBeInTheDocument();
});

test("la lista muestra el medio más reciente primero", async () => {
  const user = userEvent.setup();
  render(<Editor />);

  await user.click(screen.getByRole("button", { name: "Biblioteca" }));
  const input = screen.getByLabelText("Incorporar");
  await user.upload(input, new File(["video"], "clip.mp4", { type: "video/mp4" }));
  await user.upload(input, new File(["imagen"], "foto.png", { type: "image/png" }));

  expect(libraryLabels(screen.getByRole("list", { name: "Medios" }))).toEqual([
    "foto.png imagen",
    "clip.mp4 video",
  ]);
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

  expect(libraryLabels(screen.getByRole("list", { name: "Medios" }))).toEqual([
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
  expect(libraryLabels(screen.getByRole("list", { name: "Medios" }))).toEqual([
    "nota.mp3 audio",
    "clip.mp4 video",
  ]);
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
  expect(within(scene).getByText("foto.png", { selector: "p" })).toBeInTheDocument();
  expect(within(scene).getByText("3 s")).toBeInTheDocument();
  expect(within(scene).queryByText("0 s")).not.toBeInTheDocument();
  expect(within(scene).queryByText("corte directo")).not.toBeInTheDocument();
  expect(screen.getByText("El short dura 3 s")).toBeInTheDocument();
  expect(scene.querySelector("audio")).toBeNull();
  expect(within(scene).getAllByRole("button").map((button) => button.textContent)).toEqual([
    "Añadir texto",
  ]);
  expect(within(scene).getByRole("combobox", { name: "Narración" })).toHaveValue("");
  expect(within(scene).getByRole("combobox", { name: "Reemplazar" })).toBeInTheDocument();
  expect(within(scene).getAllByRole("combobox")).toHaveLength(2);
  expect(within(scene).queryByRole("checkbox")).not.toBeInTheDocument();
  expect(screen.queryByRole("region", { name: "Escenas" })).not.toBeInTheDocument();
  expect(screen.queryByRole("region", { name: "Biblioteca" })).not.toBeInTheDocument();
  expect(screen.queryByRole("region", { name: "Apariencia" })).not.toBeInTheDocument();

  const frame = within(scene).getByRole("region", { name: "Cuadro" });
  const image = within(frame).getByRole("img", { name: "foto.png" });
  expect(image).toHaveStyle({ objectFit: "cover", objectPosition: "center" });
  expect(frame).toHaveStyle({
    width: "120px",
    aspectRatio: "9 / 16",
    overflow: "hidden",
    flexGrow: "0",
  });
  expect(frame.parentElement).toHaveStyle({ display: "flex", flexDirection: "row" });
  expect(frame.nextElementSibling).toHaveStyle({ flexGrow: "1" });

  await user.click(screen.getByRole("button", { name: "Escenas" }));
  expect(
    within(screen.getByRole("list", { name: "Escenas" }))
      .getAllByRole("listitem")
      .map((item) => item.getAttribute("aria-label")),
  ).toEqual(["foto.png"]);
  expect(screen.queryByRole("region", { name: "Escena" })).not.toBeInTheDocument();
});

test("el cuadro de Escena mide 120 px de ancho, conserva la proporción del short y queda al lado de los datos", async () => {
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
  const cuadro = within(scene).getByRole("region", { name: "Cuadro" });
  const datos = cuadro.nextElementSibling as HTMLElement;
  expect(within(datos).getByText("foto.png", { selector: "p" })).toBeInTheDocument();
  expect(within(datos).getByRole("spinbutton", { name: "Duración" })).toBeInTheDocument();
  expect(cuadro).toHaveStyle({ width: "120px", aspectRatio: "9 / 16", overflow: "hidden" });
  expect(cuadro.parentElement).toHaveStyle({ display: "flex", flexDirection: "row" });
});

test("el cuadro muestra el inicio de la escena elegida, sola y a opacidad plena, con el encaje y los textos", async () => {
  const user = userEvent.setup();
  render(<Editor />);

  await addMedium(user, new File(["una"], "foto.png", { type: "image/png" }));
  await addMedium(user, new File(["otra"], "otra.png", { type: "image/png" }));
  await addSceneFrom(user, "foto.png");
  let scene = await addSceneFrom(user, "otra.png");
  await user.click(within(scene).getByRole("button", { name: "Añadir texto" }));
  const content = within(scene).getByRole("textbox", { name: "Contenido" });
  await user.clear(content);
  await user.type(content, "Sola");

  scene = await openScene(user, "foto.png");
  await chooseCut(user, scene, "fundido");
  scene = await openScene(user, "otra.png");
  putDuration(scene, "0.4");
  scene = await openScene(user, "otra.png");

  const cuadro = within(scene).getByRole("region", { name: "Cuadro" });
  const image = within(cuadro).getByRole("img", { name: "otra.png" });
  expect(within(cuadro).queryByRole("img", { name: "foto.png" })).not.toBeInTheDocument();
  expect(image).toHaveStyle({ objectFit: "cover", objectPosition: "center" });
  expect(image.parentElement).toHaveStyle({ opacity: "1" });
  expect(cuadro).toHaveStyle({ overflow: "hidden" });
  expect(within(cuadro).getByText("Sola")).toBeInTheDocument();
});

test("en un video o un GIF el cuadro es el fotograma de la entrada, quieto, y en una imagen es la imagen", async () => {
  stubPlayback();
  const user = userEvent.setup();
  render(<Editor />);

  await addMedium(user, fileWithDuration("clip.mp4", "video/mp4", 10));
  await addMedium(user, fileWithDuration("anim.gif", "image/gif", 4));
  await addMedium(user, new File(["imagen"], "foto.png", { type: "image/png" }));

  let scene = await addSceneFrom(user, "clip.mp4");
  let cuadro = within(scene).getByRole("region", { name: "Cuadro" });
  let video = cuadro.querySelector("video");
  expect(video).not.toBeNull();
  expect(cuadro.querySelector("img")).toBeNull();
  expect(video).not.toHaveAttribute("autoplay");
  expect(video).toHaveProperty("paused", true);
  expect(video).toHaveProperty("currentTime", 0);
  expect(video).toHaveProperty("muted", true);
  expect(video).toHaveProperty("loop", false);
  expect(video).not.toHaveAttribute("controls");
  expect(video).toHaveStyle({ objectFit: "cover", objectPosition: "center" });

  scene = await addSceneFrom(user, "anim.gif");
  await chooseCut(user, await openScene(user, "clip.mp4"), "fundido");
  scene = await openScene(user, "anim.gif");
  cuadro = within(scene).getByRole("region", { name: "Cuadro" });
  video = cuadro.querySelector("video");
  expect(video).not.toBeNull();
  expect(cuadro.querySelector("img")).toBeNull();
  expect(video).not.toHaveAttribute("autoplay");
  expect(video).toHaveProperty("paused", true);
  expect(video).toHaveProperty("currentTime", 0);
  expect(within(cuadro).queryByRole("img")).not.toBeInTheDocument();

  scene = await addSceneFrom(user, "foto.png");
  cuadro = within(scene).getByRole("region", { name: "Cuadro" });
  expect(within(cuadro).getByRole("img", { name: "foto.png" })).toBeInTheDocument();
  expect(cuadro.querySelector("video")).toBeNull();
});

test("el recorrido no está en Escena y no mueve el cuadro", async () => {
  stubPlayback();
  const user = userEvent.setup();
  render(<Editor />);

  await addMedium(user, fileWithDuration("clip.mp4", "video/mp4", 10));
  await addMedium(user, new File(["imagen"], "foto.png", { type: "image/png" }));
  await addSceneFrom(user, "clip.mp4");
  await addSceneFrom(user, "foto.png");
  const first = await openScene(user, "clip.mp4");
  await chooseCut(user, first, "fundido");

  expect(within(first).queryByRole("slider", { name: "Recorrer" })).not.toBeInTheDocument();
  expect(within(first).queryByRole("slider")).not.toBeInTheDocument();

  const video = within(first).getByRole("region", { name: "Cuadro" }).querySelector("video");
  expect(video).toHaveProperty("currentTime", 0);
  expect(video).toHaveProperty("paused", true);
  fireEvent.input(within(first).getByRole("spinbutton", { name: "Tiempo del fundido" }), {
    target: { value: "2" },
  });
  expect(video).toHaveProperty("currentTime", 0);
  expect(video).toHaveProperty("paused", true);
  expect(
    within(within(first).getByRole("region", { name: "Cuadro" })).queryByRole("img", {
      name: "foto.png",
    }),
  ).not.toBeInTheDocument();
});

test("sin escena elegida, el cuadro no tiene nada que mostrar", async () => {
  const user = userEvent.setup();
  render(<Editor />);

  await user.click(screen.getByRole("button", { name: "Escena" }));
  const scene = screen.getByRole("region", { name: "Escena" });
  expect(within(scene).getByText("No hay una escena que editar.")).toBeInTheDocument();
  const cuadro = within(scene).getByRole("region", { name: "Cuadro" });
  expect(cuadro).toHaveStyle({ width: "120px", aspectRatio: "9 / 16" });
  expect(cuadro).toBeEmptyDOMElement();
  expect(cuadro.parentElement).toHaveStyle({ display: "flex", flexDirection: "row" });
});

test("el bloque Fundido está arriba de los textos, elige el corte con la escena siguiente y en la última no está", async () => {
  const user = userEvent.setup();
  render(<Editor />);

  await addMedium(user, new File(["una"], "foto.png", { type: "image/png" }));
  await addMedium(user, new File(["otra"], "otra.png", { type: "image/png" }));
  await addSceneFrom(user, "foto.png");
  await addSceneFrom(user, "otra.png");

  const scene = await openScene(user, "foto.png");
  const fundido = within(scene).getByRole("group", { name: "Fundido" });
  const textos = within(scene).getByRole("heading", { name: "Textos" });
  expect(fundido.compareDocumentPosition(textos) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
    Node.DOCUMENT_POSITION_FOLLOWING,
  );
  const cut = within(fundido).getByRole("combobox", { name: "Fundido" });
  expect(within(cut).getAllByRole("option").map((option) => option.textContent)).toEqual([
    "Corte directo",
    "Fundido",
  ]);
  expect(cut).toHaveValue("corte directo");
  expect(within(fundido).queryByRole("spinbutton", { name: "Tiempo del fundido" })).not.toBeInTheDocument();

  await user.selectOptions(cut, within(cut).getByRole("option", { name: "Fundido" }));
  expect(within(fundido).getByRole("spinbutton", { name: "Tiempo del fundido" })).toHaveValue(0.5);
  expect(screen.getByText("El short dura 5.5 s")).toBeInTheDocument();

  const second = await openScene(user, "otra.png");
  expect(within(second).getByText("fundido")).toBeInTheDocument();
  expect(within(second).queryByRole("group", { name: "Fundido" })).not.toBeInTheDocument();
  expect(within(second).queryByRole("spinbutton", { name: "Tiempo del fundido" })).not.toBeInTheDocument();
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
  expect(within(scene).getByText("clip.mp4", { selector: "p" })).toBeInTheDocument();
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
  expect(within(scene).getAllByRole("button").map((button) => button.textContent)).toEqual([
    "Añadir texto",
  ]);
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
  expect(within(scene).getByText("corto.mp4", { selector: "p" })).toBeInTheDocument();
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
  expect(within(scene).getByText("foto.png", { selector: "p" })).toBeInTheDocument();
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
      .map((item) => item.getAttribute("aria-label")),
  ).toEqual(["foto.png"]);

  await user.click(screen.getByRole("button", { name: "Escena" }));
  scene = screen.getByRole("region", { name: "Escena" });
  expect(within(scene).getByText("foto.png", { selector: "p" })).toBeInTheDocument();
  expect(screen.queryByText("nada.webm", { selector: "p" })).not.toBeInTheDocument();
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
  expect(within(scene).getAllByRole("button").map((button) => button.textContent)).toEqual([
    "Añadir texto",
  ]);
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
  expect(within(scene).getByText("foto.png", { selector: "p" })).toBeInTheDocument();
  expect(within(scene).queryByText("corte directo")).not.toBeInTheDocument();
  expect(screen.getByText("El short dura 3 s")).toBeInTheDocument();
  expect(screen.queryByRole("region", { name: "Escenas" })).not.toBeInTheDocument();
  expect(screen.queryByRole("region", { name: "Biblioteca" })).not.toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "Escenas" }));
  choice = screen.getByRole("combobox", { name: "Medio visual" });
  await user.selectOptions(choice, within(choice).getByRole("option", { name: "otra.png" }));
  await user.click(screen.getByRole("button", { name: "Añadir" }));

  scene = await screen.findByRole("region", { name: "Escena" });
  expect(within(scene).getByText("otra.png", { selector: "p" })).toBeInTheDocument();
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
      .map((item) => item.getAttribute("aria-label")),
  ).toEqual(["foto.png", "otra.png"]);
  expect(screen.queryByRole("region", { name: "Escena" })).not.toBeInTheDocument();

  await user.click(
    within(screen.getByRole("list", { name: "Escenas" })).getByRole("button", { name: "foto.png" }),
  );
  scene = await screen.findByRole("region", { name: "Escena" });
  expect(within(scene).getByText("foto.png", { selector: "p" })).toBeInTheDocument();
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
      .map((item) => item.getAttribute("aria-label")),
  ).toEqual(["foto.png"]);

  await user.click(
    within(screen.getByRole("list", { name: "Escenas" })).getByRole("button", { name: "foto.png" }),
  );
  const scene = screen.getByRole("region", { name: "Escena" });
  expect(within(scene).getByText("foto.png", { selector: "p" })).toBeInTheDocument();
  expect(within(scene).getByText("3 s")).toBeInTheDocument();
  expect(within(scene).queryByText("0 s")).not.toBeInTheDocument();
  expect(within(scene).queryByText("corte directo")).not.toBeInTheDocument();
  const image = within(scene).getByRole("img", { name: "foto.png" });
  expect(image.getAttribute("src")).toBeTruthy();
});

test("el panel agrupa la interfaz, las barras y las secciones con el feeling inicial", async () => {
  const user = userEvent.setup();
  render(<Editor />);

  await user.click(screen.getByRole("button", { name: "Apariencia" }));

  const panel = screen.getByRole("region", { name: "Apariencia" });
  const interfaz = within(panel).getByRole("group", { name: "Interfaz" });
  const barras = within(panel).getByRole("group", { name: "Barras" });
  const secciones = within(panel).getByRole("group", { name: "Secciones" });

  expect(within(interfaz).getByRole("spinbutton", { name: "Tipografía" })).toHaveValue(16);
  expect(within(interfaz).getByLabelText("Color del texto")).toHaveValue("#1a1a1a");
  expect(within(interfaz).getByLabelText("Color de fondo")).toHaveValue("#f7f7f5");
  expect(within(barras).getByRole("spinbutton", { name: "Iconos de las barras" })).toHaveValue(20);
  expect(within(barras).getByRole("spinbutton", { name: "Elementos de las barras" })).toHaveValue(36);
  expect(within(secciones).getByRole("spinbutton", { name: "Iconos de las secciones" })).toHaveValue(20);
  expect(within(secciones).getByRole("spinbutton", { name: "Elementos de las secciones" })).toHaveValue(36);
});

test("cambiar la tipografía se ve en el momento y deja quietos los otros seis valores", async () => {
  const user = userEvent.setup();
  render(<Editor />);
  await user.click(screen.getByRole("button", { name: "Apariencia" }));

  const panel = screen.getByRole("region", { name: "Apariencia" });
  const tipografia = within(panel).getByRole("spinbutton", { name: "Tipografía" });
  await user.clear(tipografia);
  await user.type(tipografia, "24");

  expect(screen.getByRole("main")).toHaveStyle({
    fontSize: "24px",
    color: "#1a1a1a",
    backgroundColor: "#f7f7f5",
  });
  expect(tipografia).toHaveValue(24);
  expect(within(panel).getByLabelText("Color del texto")).toHaveValue("#1a1a1a");
  expect(within(panel).getByLabelText("Color de fondo")).toHaveValue("#f7f7f5");
  expect(within(panel).getByRole("spinbutton", { name: "Iconos de las barras" })).toHaveValue(20);
  expect(within(panel).getByRole("spinbutton", { name: "Elementos de las barras" })).toHaveValue(36);
  expect(within(panel).getByRole("spinbutton", { name: "Iconos de las secciones" })).toHaveValue(20);
  expect(within(panel).getByRole("spinbutton", { name: "Elementos de las secciones" })).toHaveValue(36);
});

test("el color del texto pinta la letra, los iconos y el texto de los elementos", async () => {
  const user = userEvent.setup();
  render(<Editor />);
  await user.click(screen.getByRole("button", { name: "Apariencia" }));

  const panel = screen.getByRole("region", { name: "Apariencia" });
  const texto = within(panel).getByLabelText("Color del texto");
  await user.click(texto);
  fireEvent.input(texto, { target: { value: "#2244aa" } });

  expect(screen.getByRole("main")).toHaveStyle({
    fontSize: "16px",
    color: "#2244aa",
    backgroundColor: "#f7f7f5",
  });
  expect(screen.getByRole("heading", { name: "Proyecto" })).toHaveStyle({ color: "#2244aa" });
  const biblioteca = screen.getByRole("button", { name: "Biblioteca" });
  expect(biblioteca).toHaveStyle({ color: "#2244aa" });
  expect(biblioteca.querySelector("svg")).toHaveStyle({ color: "#2244aa" });
  expect(within(panel).getByRole("heading", { name: "Apariencia" }).querySelector("svg")).toHaveStyle({
    color: "#2244aa",
  });
  expect(within(panel).getByRole("spinbutton", { name: "Tipografía" })).toHaveValue(16);
  expect(texto).toHaveValue("#2244aa");
  expect(within(panel).getByLabelText("Color de fondo")).toHaveValue("#f7f7f5");
  expect(within(panel).getByRole("spinbutton", { name: "Iconos de las barras" })).toHaveValue(20);
  expect(within(panel).getByRole("spinbutton", { name: "Elementos de las barras" })).toHaveValue(36);
  expect(within(panel).getByRole("spinbutton", { name: "Iconos de las secciones" })).toHaveValue(20);
  expect(within(panel).getByRole("spinbutton", { name: "Elementos de las secciones" })).toHaveValue(36);
});

test("el color de fondo pinta las barras, las secciones y los elementos", async () => {
  const user = userEvent.setup();
  render(<Editor />);
  await user.click(screen.getByRole("button", { name: "Apariencia" }));

  const panel = screen.getByRole("region", { name: "Apariencia" });
  const fondo = within(panel).getByLabelText("Color de fondo");
  await user.click(fondo);
  fireEvent.input(fondo, { target: { value: "#ddeecc" } });

  expect(screen.getByRole("main")).toHaveStyle({
    fontSize: "16px",
    color: "#1a1a1a",
    backgroundColor: "#ddeecc",
  });
  expect(screen.getByRole("banner")).toHaveStyle({ backgroundColor: "#ddeecc" });
  expect(panel).toHaveStyle({ backgroundColor: "#ddeecc" });
  expect(screen.getByRole("button", { name: "Biblioteca" })).toHaveStyle({ backgroundColor: "#ddeecc" });
  expect(within(panel).getByRole("spinbutton", { name: "Tipografía" })).toHaveStyle({
    backgroundColor: "#ddeecc",
  });
  expect(fondo).toHaveValue("#ddeecc");
  expect(within(panel).getByLabelText("Color del texto")).toHaveValue("#1a1a1a");
  expect(within(panel).getByRole("spinbutton", { name: "Tipografía" })).toHaveValue(16);
  expect(within(panel).getByRole("spinbutton", { name: "Iconos de las barras" })).toHaveValue(20);
  expect(within(panel).getByRole("spinbutton", { name: "Elementos de las barras" })).toHaveValue(36);
  expect(within(panel).getByRole("spinbutton", { name: "Iconos de las secciones" })).toHaveValue(20);
  expect(within(panel).getByRole("spinbutton", { name: "Elementos de las secciones" })).toHaveValue(36);
});

test("las barras comparten sus tamaños y las secciones comparten los otros", async () => {
  const user = userEvent.setup();
  render(<Editor />);
  await user.click(screen.getByRole("button", { name: "Apariencia" }));

  const panel = screen.getByRole("region", { name: "Apariencia" });
  const iconosBarras = within(panel).getByRole("spinbutton", { name: "Iconos de las barras" });
  const elementosBarras = within(panel).getByRole("spinbutton", { name: "Elementos de las barras" });
  await user.clear(iconosBarras);
  await user.type(iconosBarras, "28");
  await user.clear(elementosBarras);
  await user.type(elementosBarras, "48");

  for (const name of ["Biblioteca", "Escenas", "Escena", "Apariencia"]) {
    const button = screen.getByRole("button", { name });
    expect(button).toHaveStyle({ height: "48px" });
    expect(button.querySelector("svg")).toHaveStyle({ width: "28px", height: "28px" });
  }
  expect(within(panel).getByRole("heading", { name: "Apariencia" }).querySelector("svg")).toHaveStyle({
    width: "20px",
    height: "20px",
  });
  expect(within(panel).getByRole("spinbutton", { name: "Tipografía" })).toHaveStyle({ height: "36px" });
  expect(within(panel).getByLabelText("Color del texto")).toHaveStyle({ height: "36px" });
  expect(within(panel).getByRole("spinbutton", { name: "Iconos de las secciones" })).toHaveValue(20);
  expect(within(panel).getByRole("spinbutton", { name: "Elementos de las secciones" })).toHaveValue(36);

  const iconosSecciones = within(panel).getByRole("spinbutton", { name: "Iconos de las secciones" });
  const elementosSecciones = within(panel).getByRole("spinbutton", { name: "Elementos de las secciones" });
  await user.clear(iconosSecciones);
  await user.type(iconosSecciones, "32");
  await user.clear(elementosSecciones);
  await user.type(elementosSecciones, "44");

  expect(within(panel).getByRole("heading", { name: "Apariencia" }).querySelector("svg")).toHaveStyle({
    width: "32px",
    height: "32px",
  });
  expect(within(panel).getByRole("spinbutton", { name: "Tipografía" })).toHaveStyle({ height: "44px" });
  expect(within(panel).getByLabelText("Color de fondo")).toHaveStyle({ height: "44px" });
  for (const name of ["Biblioteca", "Escenas", "Escena", "Apariencia"]) {
    const button = screen.getByRole("button", { name });
    expect(button).toHaveStyle({ height: "48px" });
    expect(button.querySelector("svg")).toHaveStyle({ width: "28px", height: "28px" });
  }
  expect(within(panel).getByRole("spinbutton", { name: "Tipografía" })).toHaveValue(16);
  expect(within(panel).getByLabelText("Color del texto")).toHaveValue("#1a1a1a");
  expect(within(panel).getByLabelText("Color de fondo")).toHaveValue("#f7f7f5");

  await user.click(screen.getByRole("button", { name: "Biblioteca" }));
  expect(screen.getByRole("heading", { name: "Biblioteca" }).querySelector("svg")).toHaveStyle({
    width: "32px",
    height: "32px",
  });
});

test("un tamaño fuera del 8 al 96 o que no es entero no se aplica", async () => {
  const user = userEvent.setup();
  render(<Editor />);
  await user.click(screen.getByRole("button", { name: "Apariencia" }));

  const tipografia = screen.getByRole("spinbutton", { name: "Tipografía" });
  await user.clear(tipografia);
  await user.type(tipografia, "8");
  expect(tipografia).toHaveValue(8);
  expect(screen.getByRole("main")).toHaveStyle({ fontSize: "8px" });

  await user.clear(tipografia);
  await user.type(tipografia, "96");
  expect(tipografia).toHaveValue(96);
  expect(screen.getByRole("main")).toHaveStyle({ fontSize: "96px" });

  await user.clear(tipografia);
  await user.type(tipografia, "7");
  expect(screen.getByRole("main")).toHaveStyle({ fontSize: "96px" });
  await user.tab();
  expect(tipografia).toHaveValue(96);

  fireEvent.input(tipografia, { target: { value: "97" } });
  expect(tipografia).toHaveValue(96);
  expect(screen.getByRole("main")).toHaveStyle({ fontSize: "96px" });

  fireEvent.input(tipografia, { target: { value: "16.5" } });
  expect(tipografia).toHaveValue(96);
  expect(screen.getByRole("main")).toHaveStyle({ fontSize: "96px" });

  expect(screen.getByLabelText("Color del texto")).toHaveValue("#1a1a1a");
  expect(screen.getByLabelText("Color de fondo")).toHaveValue("#f7f7f5");
  expect(screen.getByRole("spinbutton", { name: "Iconos de las barras" })).toHaveValue(20);
  expect(screen.getByRole("spinbutton", { name: "Elementos de las barras" })).toHaveValue(36);
  expect(screen.getByRole("spinbutton", { name: "Iconos de las secciones" })).toHaveValue(20);
  expect(screen.getByRole("spinbutton", { name: "Elementos de las secciones" })).toHaveValue(36);
});

test("los dos colores pueden ser el mismo", async () => {
  const user = userEvent.setup();
  render(<Editor />);
  await user.click(screen.getByRole("button", { name: "Apariencia" }));

  const texto = screen.getByLabelText("Color del texto");
  const fondo = screen.getByLabelText("Color de fondo");
  await user.click(texto);
  fireEvent.input(texto, { target: { value: "#445566" } });
  await user.click(fondo);
  fireEvent.input(fondo, { target: { value: "#445566" } });

  expect(texto).toHaveValue("#445566");
  expect(fondo).toHaveValue("#445566");
  expect(screen.getByRole("main")).toHaveStyle({
    color: "#445566",
    backgroundColor: "#445566",
  });
  expect(screen.getByRole("banner")).toHaveStyle({ backgroundColor: "#445566" });
  expect(screen.getByRole("region", { name: "Apariencia" })).toHaveStyle({ backgroundColor: "#445566" });
  expect(screen.getByRole("heading", { name: "Proyecto" })).toHaveStyle({ color: "#445566" });
  expect(screen.getByRole("button", { name: "Escenas" })).toHaveStyle({
    color: "#445566",
    backgroundColor: "#445566",
  });
});

test("hover, foco y selección invierten el color del texto y el de fondo", () => {
  render(<Editor />);

  const inverted = [...document.styleSheets].flatMap((sheet) => {
    try {
      return [...sheet.cssRules];
    } catch {
      return [];
    }
  }).filter((rule): rule is CSSStyleRule => {
    if (!(rule instanceof CSSStyleRule)) return false;
    const background = rule.style.backgroundColor || rule.style.background;
    return rule.style.color === "var(--bg)" && background === "var(--fg)";
  });
  const selectors = inverted.map((rule) => rule.selectorText).join("\n");

  expect(selectors).toContain(".bar button:hover");
  expect(selectors).toContain(".bar button:focus-visible");
  expect(selectors).toContain('[aria-pressed="true"]');
  expect(selectors).toContain(".section button:hover");
  expect(selectors).toContain(".section button:focus-visible");
  expect(selectors).toContain(".section input:hover");
  expect(selectors).toContain(".section input:focus-visible");
});

test("al volver, los siete valores de la apariencia siguen en este navegador", async () => {
  const user = userEvent.setup();
  const first = render(<Editor />);
  await user.click(screen.getByRole("button", { name: "Apariencia" }));

  const tipografia = screen.getByRole("spinbutton", { name: "Tipografía" });
  await user.clear(tipografia);
  await user.type(tipografia, "18");
  fireEvent.input(screen.getByLabelText("Color del texto"), { target: { value: "#112233" } });
  fireEvent.input(screen.getByLabelText("Color de fondo"), { target: { value: "#aabbcc" } });
  const iconosBarras = screen.getByRole("spinbutton", { name: "Iconos de las barras" });
  await user.clear(iconosBarras);
  await user.type(iconosBarras, "22");
  const elementosBarras = screen.getByRole("spinbutton", { name: "Elementos de las barras" });
  await user.clear(elementosBarras);
  await user.type(elementosBarras, "40");
  const iconosSecciones = screen.getByRole("spinbutton", { name: "Iconos de las secciones" });
  await user.clear(iconosSecciones);
  await user.type(iconosSecciones, "26");
  const elementosSecciones = screen.getByRole("spinbutton", { name: "Elementos de las secciones" });
  await user.clear(elementosSecciones);
  await user.type(elementosSecciones, "50");

  first.unmount();
  render(<Editor />);
  await user.click(screen.getByRole("button", { name: "Apariencia" }));

  expect(screen.getByRole("main")).toHaveStyle({
    fontSize: "18px",
    color: "#112233",
    backgroundColor: "#aabbcc",
  });
  expect(screen.getByRole("spinbutton", { name: "Tipografía" })).toHaveValue(18);
  expect(screen.getByLabelText("Color del texto")).toHaveValue("#112233");
  expect(screen.getByLabelText("Color de fondo")).toHaveValue("#aabbcc");
  expect(screen.getByRole("spinbutton", { name: "Iconos de las barras" })).toHaveValue(22);
  expect(screen.getByRole("spinbutton", { name: "Elementos de las barras" })).toHaveValue(40);
  expect(screen.getByRole("spinbutton", { name: "Iconos de las secciones" })).toHaveValue(26);
  expect(screen.getByRole("spinbutton", { name: "Elementos de las secciones" })).toHaveValue(50);
  expect(screen.getByRole("button", { name: "Biblioteca" })).toHaveStyle({ height: "40px" });
  expect(screen.getByRole("button", { name: "Biblioteca" }).querySelector("svg")).toHaveStyle({
    width: "22px",
    height: "22px",
  });
  expect(screen.getByRole("heading", { name: "Apariencia" }).querySelector("svg")).toHaveStyle({
    width: "26px",
    height: "26px",
  });
  expect(screen.getByRole("spinbutton", { name: "Tipografía" })).toHaveStyle({ height: "50px" });
  expect(screen.getByRole("banner")).toHaveStyle({ backgroundColor: "#aabbcc" });
});

test("Restablecer devuelve el feeling inicial y deja quietos el proyecto y la biblioteca", async () => {
  const user = userEvent.setup();
  const first = render(<Editor />);
  await user.click(screen.getByRole("button", { name: "Apariencia" }));

  const tipografia = screen.getByRole("spinbutton", { name: "Tipografía" });
  await user.clear(tipografia);
  await user.type(tipografia, "18");
  fireEvent.input(screen.getByLabelText("Color del texto"), { target: { value: "#112233" } });
  fireEvent.input(screen.getByLabelText("Color de fondo"), { target: { value: "#aabbcc" } });
  const iconosBarras = screen.getByRole("spinbutton", { name: "Iconos de las barras" });
  await user.clear(iconosBarras);
  await user.type(iconosBarras, "22");
  const elementosBarras = screen.getByRole("spinbutton", { name: "Elementos de las barras" });
  await user.clear(elementosBarras);
  await user.type(elementosBarras, "40");
  const iconosSecciones = screen.getByRole("spinbutton", { name: "Iconos de las secciones" });
  await user.clear(iconosSecciones);
  await user.type(iconosSecciones, "26");
  const elementosSecciones = screen.getByRole("spinbutton", { name: "Elementos de las secciones" });
  await user.clear(elementosSecciones);
  await user.type(elementosSecciones, "50");

  await user.click(screen.getByRole("button", { name: "Restablecer" }));

  expect(screen.getByRole("main")).toHaveStyle({
    fontSize: "16px",
    color: "#1a1a1a",
    backgroundColor: "#f7f7f5",
  });
  expect(screen.getByRole("spinbutton", { name: "Tipografía" })).toHaveValue(16);
  expect(screen.getByLabelText("Color del texto")).toHaveValue("#1a1a1a");
  expect(screen.getByLabelText("Color de fondo")).toHaveValue("#f7f7f5");
  expect(screen.getByRole("spinbutton", { name: "Iconos de las barras" })).toHaveValue(20);
  expect(screen.getByRole("spinbutton", { name: "Elementos de las barras" })).toHaveValue(36);
  expect(screen.getByRole("spinbutton", { name: "Iconos de las secciones" })).toHaveValue(20);
  expect(screen.getByRole("spinbutton", { name: "Elementos de las secciones" })).toHaveValue(36);
  expect(screen.getByRole("button", { name: "Biblioteca" })).toHaveStyle({ height: "36px" });
  expect(screen.getByRole("button", { name: "Biblioteca" }).querySelector("svg")).toHaveStyle({
    width: "20px",
    height: "20px",
  });
  expect(screen.getByRole("heading", { name: "Apariencia" }).querySelector("svg")).toHaveStyle({
    width: "20px",
    height: "20px",
  });
  expect(screen.getByRole("banner")).toHaveStyle({ backgroundColor: "#f7f7f5" });
  expect(screen.getByRole("heading", { name: "Proyecto" })).toBeInTheDocument();
  expect(screen.getByText("El short dura 0 s")).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "Escenas" }));
  expect(screen.getByRole("list", { name: "Escenas" })).toBeEmptyDOMElement();
  expect(screen.getByText("El proyecto no tiene escenas.")).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Biblioteca" }));
  expect(screen.getByRole("list", { name: "Medios" })).toBeEmptyDOMElement();
  expect(screen.getByText("No hay medios.")).toBeInTheDocument();

  first.unmount();
  render(<Editor />);
  expect(screen.getByRole("heading", { name: "Proyecto" })).toBeInTheDocument();
  expect(screen.getByText("El short dura 0 s")).toBeInTheDocument();
  expect(screen.getByRole("list", { name: "Escenas" })).toBeEmptyDOMElement();
  expect(screen.getByText("El proyecto no tiene escenas.")).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Biblioteca" }));
  expect(screen.getByRole("list", { name: "Medios" })).toBeEmptyDOMElement();
  expect(screen.getByText("No hay medios.")).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Apariencia" }));
  expect(screen.getByRole("main")).toHaveStyle({
    fontSize: "16px",
    color: "#1a1a1a",
    backgroundColor: "#f7f7f5",
  });
  expect(screen.getByRole("spinbutton", { name: "Tipografía" })).toHaveValue(16);
  expect(screen.getByLabelText("Color del texto")).toHaveValue("#1a1a1a");
  expect(screen.getByLabelText("Color de fondo")).toHaveValue("#f7f7f5");
  expect(screen.getByRole("spinbutton", { name: "Iconos de las barras" })).toHaveValue(20);
  expect(screen.getByRole("spinbutton", { name: "Elementos de las barras" })).toHaveValue(36);
  expect(screen.getByRole("spinbutton", { name: "Iconos de las secciones" })).toHaveValue(20);
  expect(screen.getByRole("spinbutton", { name: "Elementos de las secciones" })).toHaveValue(36);
});

test("el panel usa la misma tipografía que el resto", async () => {
  const user = userEvent.setup();
  render(<Editor />);
  await user.click(screen.getByRole("button", { name: "Apariencia" }));

  const tipografia = screen.getByRole("spinbutton", { name: "Tipografía" });
  await user.clear(tipografia);
  await user.type(tipografia, "28");

  const panel = screen.getByRole("region", { name: "Apariencia" });
  expect(panel).toHaveStyle({ fontSize: "28px" });
  expect(within(panel).getByText("Interfaz")).toHaveStyle({ fontSize: "28px" });
  expect(within(panel).getByText("Barras")).toHaveStyle({ fontSize: "28px" });
  expect(within(panel).getByText("Secciones")).toHaveStyle({ fontSize: "28px" });
  expect(within(panel).getByText("Tipografía")).toHaveStyle({ fontSize: "28px" });
  expect(within(panel).getByRole("spinbutton", { name: "Tipografía" })).toHaveStyle({ fontSize: "28px" });
  expect(within(panel).getByRole("button", { name: "Restablecer" })).toHaveStyle({ fontSize: "28px" });
  expect(screen.getByRole("heading", { name: "Proyecto" })).toHaveStyle({ fontSize: "28px" });
  expect(screen.getByRole("button", { name: "Biblioteca" })).toHaveStyle({ fontSize: "28px" });
});

async function openSceneWithImage(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "Biblioteca" }));
  await user.upload(
    screen.getByLabelText("Incorporar"),
    new File(["imagen"], "foto.png", { type: "image/png" }),
  );
  await user.click(screen.getByRole("button", { name: "Escenas" }));
  await user.click(screen.getByRole("button", { name: "Añadir" }));

  const scene = await screen.findByRole("region", { name: "Escena" });
  const cuadro = within(scene).getByRole("region", { name: "Cuadro" });
  return { scene, cuadro };
}

test("añadir un texto lo crea en el centro, en blanco, alineado al centro y a ocho centésimos de la altura", async () => {
  const user = userEvent.setup();
  render(<Editor />);

  const { scene, cuadro } = await openSceneWithImage(user);
  expect(within(scene).getByRole("list", { name: "Textos" })).toBeEmptyDOMElement();

  await user.click(within(scene).getByRole("button", { name: "Añadir texto" }));

  const items = within(within(scene).getByRole("list", { name: "Textos" })).getAllByRole("listitem");
  expect(items).toHaveLength(1);
  expect(within(items[0]).getByLabelText("Contenido")).toHaveValue("Texto");
  expect(within(items[0]).getByRole("spinbutton", { name: "Horizontal" })).toHaveValue(50);
  expect(within(items[0]).getByRole("spinbutton", { name: "Vertical" })).toHaveValue(50);
  expect(within(items[0]).getByRole("spinbutton", { name: "Tamaño" })).toHaveValue(8);
  expect(within(scene).getByRole("spinbutton", { name: "Duración" })).toHaveValue(3);
  expect(within(items[0]).getByLabelText("Color")).toHaveValue("#ffffff");
  expect(within(items[0]).getByRole("combobox", { name: "Alineación" })).toHaveValue("center");

  const overlay = within(cuadro).getByText("Texto");
  expect(overlay).toHaveStyle({
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)",
    color: "#ffffff",
    textAlign: "center",
    fontSize: "8cqh",
    width: "max-content",
  });
});

test("una escena puede tener varios textos apilados en el orden de la lista, con el último arriba y una sola fuente", async () => {
  const user = userEvent.setup();
  render(<Editor />);

  const { scene, cuadro } = await openSceneWithImage(user);
  const add = within(scene).getByRole("button", { name: "Añadir texto" });
  await user.click(add);
  await user.click(add);

  const items = within(within(scene).getByRole("list", { name: "Textos" })).getAllByRole("listitem");
  expect(items).toHaveLength(2);

  const overlays = within(cuadro).getAllByText("Texto");
  expect(overlays).toHaveLength(2);
  expect(Number(getComputedStyle(overlays[1]).zIndex)).toBeGreaterThan(
    Number(getComputedStyle(overlays[0]).zIndex),
  );
  expect(overlays[0]).toHaveStyle({ fontFamily: "inherit" });
  expect(overlays[1]).toHaveStyle({ fontFamily: "inherit" });

  expect(
    within(scene).queryByLabelText(/fuente|tipografía|caja|borde|sombra|animación|preset|inicio|fin/i),
  ).not.toBeInTheDocument();
});

test("editar contenido, posición, tamaño, color y alineación se ve en el cuadro en vivo", async () => {
  const user = userEvent.setup();
  render(<Editor />);

  const { scene, cuadro } = await openSceneWithImage(user);
  await user.click(within(scene).getByRole("button", { name: "Añadir texto" }));

  const item = within(within(scene).getByRole("list", { name: "Textos" })).getByRole("listitem");
  const content = within(item).getByLabelText("Contenido");
  await user.clear(content);
  await user.type(content, "Amanece");
  expect(within(cuadro).getByText("Amanece")).toBeInTheDocument();

  const horizontal = within(item).getByRole("spinbutton", { name: "Horizontal" });
  await user.clear(horizontal);
  await user.type(horizontal, "25");

  const vertical = within(item).getByRole("spinbutton", { name: "Vertical" });
  await user.clear(vertical);
  await user.type(vertical, "75");

  const size = within(item).getByRole("spinbutton", { name: "Tamaño" });
  await user.clear(size);
  await user.type(size, "12");

  const color = within(item).getByLabelText("Color");
  fireEvent.input(color, { target: { value: "#2244aa" } });

  const align = within(item).getByRole("combobox", { name: "Alineación" });
  await user.selectOptions(align, "Izquierda");

  const overlay = within(cuadro).getByText("Amanece");
  expect(overlay).toHaveStyle({
    left: "25%",
    top: "75%",
    transform: "translate(-50%, -50%)",
    fontSize: "12cqh",
    color: "#2244aa",
    textAlign: "left",
  });

  await user.clear(size);
  await user.type(size, "0");
  await user.tab();
  expect(size).toHaveValue(12);
  expect(overlay).toHaveStyle({ fontSize: "12cqh" });

  fireEvent.input(size, { target: { value: "-1" } });
  expect(size).toHaveValue(12);
  expect(overlay).toHaveStyle({ fontSize: "12cqh" });
});

test("la posición puede caer fuera de 0 a 100, el tamaño admite decimales y la duración y el fundido siguen en segundos", async () => {
  const user = userEvent.setup();
  render(<Editor />);

  await addMedium(user, new File(["una"], "foto.png", { type: "image/png" }));
  await addMedium(user, new File(["otra"], "otra.png", { type: "image/png" }));
  await addSceneFrom(user, "foto.png");
  await addSceneFrom(user, "otra.png");
  const scene = await openScene(user, "foto.png");
  await chooseCut(user, scene, "fundido");
  expect(within(scene).getByRole("spinbutton", { name: "Duración" })).toHaveValue(3);
  expect(within(scene).getByRole("spinbutton", { name: "Tiempo del fundido" })).toHaveValue(0.5);

  await user.click(within(scene).getByRole("button", { name: "Añadir texto" }));
  const item = within(scene).getByRole("listitem");
  const horizontal = within(item).getByRole("spinbutton", { name: "Horizontal" });
  const vertical = within(item).getByRole("spinbutton", { name: "Vertical" });
  const size = within(item).getByRole("spinbutton", { name: "Tamaño" });
  await user.clear(horizontal);
  await user.type(horizontal, "-10");
  await user.clear(vertical);
  await user.type(vertical, "120");
  await user.clear(size);
  await user.type(size, "12.5");

  const overlay = within(within(scene).getByRole("region", { name: "Cuadro" })).getByText("Texto");
  expect(horizontal).toHaveValue(-10);
  expect(vertical).toHaveValue(120);
  expect(size).toHaveValue(12.5);
  expect(overlay).toHaveStyle({ left: "-10%", top: "120%", fontSize: "12.5cqh" });
  expect(within(scene).getByRole("spinbutton", { name: "Duración" })).toHaveValue(3);
  expect(within(scene).getByRole("spinbutton", { name: "Tiempo del fundido" })).toHaveValue(0.5);
});

test("reordenar los textos cambia el orden de la lista y el apilado en el cuadro", async () => {
  const user = userEvent.setup();
  render(<Editor />);

  const { scene, cuadro } = await openSceneWithImage(user);
  const add = within(scene).getByRole("button", { name: "Añadir texto" });
  await user.click(add);
  await user.click(add);

  let items = within(within(scene).getByRole("list", { name: "Textos" })).getAllByRole("listitem");
  await user.clear(within(items[0]).getByLabelText("Contenido"));
  await user.type(within(items[0]).getByLabelText("Contenido"), "Primero");
  await user.clear(within(items[1]).getByLabelText("Contenido"));
  await user.type(within(items[1]).getByLabelText("Contenido"), "Segundo");

  expect(within(items[0]).getByRole("button", { name: "Más atrás" })).toBeDisabled();
  expect(within(items[1]).getByRole("button", { name: "Más adelante" })).toBeDisabled();
  expect(
    Number(getComputedStyle(within(cuadro).getByText("Segundo")).zIndex),
  ).toBeGreaterThan(Number(getComputedStyle(within(cuadro).getByText("Primero")).zIndex));

  await user.click(within(items[0]).getByRole("button", { name: "Más adelante" }));

  items = within(within(scene).getByRole("list", { name: "Textos" })).getAllByRole("listitem");
  expect(within(items[0]).getByLabelText("Contenido")).toHaveValue("Segundo");
  expect(within(items[1]).getByLabelText("Contenido")).toHaveValue("Primero");
  expect(
    Number(getComputedStyle(within(cuadro).getByText("Primero")).zIndex),
  ).toBeGreaterThan(Number(getComputedStyle(within(cuadro).getByText("Segundo")).zIndex));

  await user.click(within(items[1]).getByRole("button", { name: "Más atrás" }));

  items = within(within(scene).getByRole("list", { name: "Textos" })).getAllByRole("listitem");
  expect(within(items[0]).getByLabelText("Contenido")).toHaveValue("Primero");
  expect(within(items[1]).getByLabelText("Contenido")).toHaveValue("Segundo");
  expect(
    Number(getComputedStyle(within(cuadro).getByText("Segundo")).zIndex),
  ).toBeGreaterThan(Number(getComputedStyle(within(cuadro).getByText("Primero")).zIndex));
});

test("quitar un texto lo saca de la lista y del cuadro sin tocar el medio ni los demás textos", async () => {
  const user = userEvent.setup();
  render(<Editor />);

  const { scene, cuadro } = await openSceneWithImage(user);
  const add = within(scene).getByRole("button", { name: "Añadir texto" });
  await user.click(add);
  await user.click(add);

  let items = within(within(scene).getByRole("list", { name: "Textos" })).getAllByRole("listitem");
  await user.clear(within(items[0]).getByLabelText("Contenido"));
  await user.type(within(items[0]).getByLabelText("Contenido"), "Primero");
  await user.clear(within(items[1]).getByLabelText("Contenido"));
  await user.type(within(items[1]).getByLabelText("Contenido"), "Segundo");

  await user.click(within(items[0]).getByRole("button", { name: "Quitar" }));

  items = within(within(scene).getByRole("list", { name: "Textos" })).getAllByRole("listitem");
  expect(items).toHaveLength(1);
  expect(within(items[0]).getByLabelText("Contenido")).toHaveValue("Segundo");
  expect(within(cuadro).queryByText("Primero")).not.toBeInTheDocument();
  expect(within(cuadro).getByText("Segundo")).toBeInTheDocument();
  expect(within(scene).getByText("foto.png", { selector: "p" })).toBeInTheDocument();
  expect(within(scene).getByText("3 s")).toBeInTheDocument();
  expect(screen.getByText("El short dura 3 s")).toBeInTheDocument();

  await user.click(within(items[0]).getByRole("button", { name: "Quitar" }));
  expect(within(scene).getByRole("list", { name: "Textos" })).toBeEmptyDOMElement();
  expect(within(scene).getByText("Esta escena no tiene textos.")).toBeInTheDocument();
  expect(within(cuadro).queryByText("Segundo")).not.toBeInTheDocument();
});

test("al volver, los textos de la escena siguen con su contenido, posición, tamaño, color, alineación y orden", async () => {
  const user = userEvent.setup();
  const first = render(<Editor />);

  let { scene } = await openSceneWithImage(user);
  const add = within(scene).getByRole("button", { name: "Añadir texto" });
  await user.click(add);
  await user.click(add);

  let items = within(within(scene).getByRole("list", { name: "Textos" })).getAllByRole("listitem");
  await user.clear(within(items[0]).getByLabelText("Contenido"));
  await user.type(within(items[0]).getByLabelText("Contenido"), "Fondo");
  await user.clear(within(items[1]).getByLabelText("Contenido"));
  await user.type(within(items[1]).getByLabelText("Contenido"), "Frente");
  await user.clear(within(items[1]).getByRole("spinbutton", { name: "Horizontal" }));
  await user.type(within(items[1]).getByRole("spinbutton", { name: "Horizontal" }), "30");
  await user.clear(within(items[1]).getByRole("spinbutton", { name: "Vertical" }));
  await user.type(within(items[1]).getByRole("spinbutton", { name: "Vertical" }), "80");
  await user.clear(within(items[1]).getByRole("spinbutton", { name: "Tamaño" }));
  await user.type(within(items[1]).getByRole("spinbutton", { name: "Tamaño" }), "10");
  fireEvent.input(within(items[1]).getByLabelText("Color"), { target: { value: "#ff00aa" } });
  await user.selectOptions(within(items[1]).getByRole("combobox", { name: "Alineación" }), "Derecha");

  first.unmount();
  render(<Editor />);

  await user.click(
    within(screen.getByRole("list", { name: "Escenas" })).getByRole("button", { name: "foto.png" }),
  );
  scene = await screen.findByRole("region", { name: "Escena" });
  items = within(within(scene).getByRole("list", { name: "Textos" })).getAllByRole("listitem");
  expect(items).toHaveLength(2);
  expect(within(items[0]).getByLabelText("Contenido")).toHaveValue("Fondo");
  expect(within(items[1]).getByLabelText("Contenido")).toHaveValue("Frente");
  expect(within(items[1]).getByRole("spinbutton", { name: "Horizontal" })).toHaveValue(30);
  expect(within(items[1]).getByRole("spinbutton", { name: "Vertical" })).toHaveValue(80);
  expect(within(items[1]).getByRole("spinbutton", { name: "Tamaño" })).toHaveValue(10);
  expect(within(items[1]).getByLabelText("Color")).toHaveValue("#ff00aa");
  expect(within(items[1]).getByRole("combobox", { name: "Alineación" })).toHaveValue("right");

  const cuadro = within(scene).getByRole("region", { name: "Cuadro" });
  const front = within(cuadro).getByText("Frente");
  expect(front).toHaveStyle({
    left: "30%",
    top: "80%",
    fontSize: "10cqh",
    color: "#ff00aa",
    textAlign: "right",
  });
  expect(Number(getComputedStyle(front).zIndex)).toBeGreaterThan(
    Number(getComputedStyle(within(cuadro).getByText("Fondo")).zIndex),
  );
});

test("una escena guardada antes sin textos se abre sin perder el proyecto", async () => {
  localStorage.setItem(
    "shorts-editor",
    JSON.stringify({
      id: "u1",
      library: [{ id: "m1", name: "foto.png", kind: "imagen" }],
      projects: [
        {
          name: "Proyecto",
          scenes: [
            {
              id: "s1",
              mediumId: "m1",
              duration: 3,
              entry: null,
              cutWithPrevious: null,
            },
          ],
        },
      ],
    }),
  );

  const user = userEvent.setup();
  render(<Editor />);

  await user.click(
    within(screen.getByRole("list", { name: "Escenas" })).getByRole("button", { name: "foto.png" }),
  );
  const scene = await screen.findByRole("region", { name: "Escena" });
  expect(within(scene).getByText("foto.png", { selector: "p" })).toBeInTheDocument();
  expect(within(scene).getByRole("list", { name: "Textos" })).toBeEmptyDOMElement();
});

test("poner una narración elige un audio de la biblioteca y lo deja en esa escena", async () => {
  stubPlayback();
  const user = userEvent.setup();
  render(<Editor />);

  await user.click(screen.getByRole("button", { name: "Biblioteca" }));
  const input = screen.getByLabelText("Incorporar");
  await user.upload(input, new File(["imagen"], "foto.png", { type: "image/png" }));
  await user.upload(input, fileWithDuration("video.mp4", "video/mp4", 6));
  await user.upload(input, fileWithDuration("voz.mp3", "audio/mpeg", 5));

  await user.click(screen.getByRole("button", { name: "Escenas" }));
  const mediumChoice = screen.getByRole("combobox", { name: "Medio visual" });
  await user.selectOptions(
    mediumChoice,
    within(mediumChoice).getByRole("option", { name: "foto.png" }),
  );
  await user.click(screen.getByRole("button", { name: "Añadir" }));

  const scene = await screen.findByRole("region", { name: "Escena" });
  expect(scene.querySelector("audio")).toBeNull();
  expect(
    within(scene).queryByLabelText(/volumen|inicio|bucle|repetir/i),
  ).not.toBeInTheDocument();
  expect(within(scene).queryByRole("checkbox")).not.toBeInTheDocument();

  const narration = within(scene).getByRole("combobox", { name: "Narración" });
  expect(narration).toHaveValue("");
  expect(
    within(narration)
      .getAllByRole("option")
      .map((option) => option.textContent),
  ).toEqual(["Sin narración", "voz.mp3"]);

  await user.selectOptions(narration, within(narration).getByRole("option", { name: "voz.mp3" }));

  expect(narration).not.toHaveValue("");
  const audio = scene.querySelector("audio");
  expect(audio).not.toBeNull();
  expect(audio?.getAttribute("src")).toMatch(/^blob:stub-/);
  expect(audio).toHaveProperty("muted", false);
  expect(audio).toHaveProperty("loop", false);
  expect(audio).not.toHaveAttribute("loop");
  expect(audio).not.toHaveAttribute("controls");
  expect(screen.getByText("El short dura 3 s")).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "Biblioteca" }));
  expect(
    within(screen.getByRole("list", { name: "Medios" })).getByRole("listitem", {
      name: "voz.mp3 audio",
    }),
  ).toBeInTheDocument();
});

test("otro audio sustituye a la narración, quitarla deja la escena en silencio y el audio sigue en la biblioteca", async () => {
  stubPlayback();
  const user = userEvent.setup();
  render(<Editor />);

  await user.click(screen.getByRole("button", { name: "Biblioteca" }));
  const input = screen.getByLabelText("Incorporar");
  await user.upload(input, fileWithDuration("video.mp4", "video/mp4", 6));
  await user.upload(input, fileWithDuration("voz1.mp3", "audio/mpeg", 4));
  await user.upload(input, fileWithDuration("voz2.mp3", "audio/mpeg", 4));

  await user.click(screen.getByRole("button", { name: "Escenas" }));
  await user.click(screen.getByRole("button", { name: "Añadir" }));

  const scene = await screen.findByRole("region", { name: "Escena" });
  const video = scene.querySelector("video");
  expect(video).toHaveProperty("muted", true);
  expect(scene.querySelector("audio")).toBeNull();

  const narration = within(scene).getByRole("combobox", { name: "Narración" });
  await user.selectOptions(narration, within(narration).getByRole("option", { name: "voz1.mp3" }));
  const firstAudio = scene.querySelector("audio");
  const firstSrc = firstAudio?.getAttribute("src");
  expect(firstSrc).toBeTruthy();
  expect(scene.querySelectorAll("audio")).toHaveLength(1);
  expect(video).toHaveProperty("muted", true);

  await user.selectOptions(narration, within(narration).getByRole("option", { name: "voz2.mp3" }));
  const secondAudio = scene.querySelector("audio");
  const secondSrc = secondAudio?.getAttribute("src");
  expect(secondSrc).toBeTruthy();
  expect(secondSrc).not.toBe(firstSrc);
  expect(scene.querySelectorAll("audio")).toHaveLength(1);
  expect(video).toHaveProperty("muted", true);

  await user.selectOptions(
    narration,
    within(narration).getByRole("option", { name: "Sin narración" }),
  );
  expect(narration).toHaveValue("");
  expect(scene.querySelector("audio")).toBeNull();
  expect(video).toHaveProperty("muted", true);

  await user.click(screen.getByRole("button", { name: "Biblioteca" }));
  const library = screen.getByRole("list", { name: "Medios" });
  expect(within(library).getByRole("listitem", { name: "voz1.mp3 audio" })).toBeInTheDocument();
  expect(within(library).getByRole("listitem", { name: "voz2.mp3 audio" })).toBeInTheDocument();
});

test("el mismo audio puede estar en varias escenas y en un corte directo no sigue en la siguiente", async () => {
  stubPlayback();
  const user = userEvent.setup();
  render(<Editor />);

  await user.click(screen.getByRole("button", { name: "Biblioteca" }));
  const input = screen.getByLabelText("Incorporar");
  await user.upload(input, new File(["una"], "uno.png", { type: "image/png" }));
  await user.upload(input, new File(["dos"], "dos.png", { type: "image/png" }));
  await user.upload(input, new File(["tres"], "tres.png", { type: "image/png" }));
  await user.upload(input, fileWithDuration("voz.mp3", "audio/mpeg", 4));

  await user.click(screen.getByRole("button", { name: "Escenas" }));
  let mediumChoice = screen.getByRole("combobox", { name: "Medio visual" });
  await user.selectOptions(mediumChoice, within(mediumChoice).getByRole("option", { name: "uno.png" }));
  await user.click(screen.getByRole("button", { name: "Añadir" }));
  let scene = await screen.findByRole("region", { name: "Escena" });
  let narration = within(scene).getByRole("combobox", { name: "Narración" });
  await user.selectOptions(narration, within(narration).getByRole("option", { name: "voz.mp3" }));
  const firstAudio = scene.querySelector("audio");
  expect(firstAudio).not.toBeNull();

  await user.click(screen.getByRole("button", { name: "Escenas" }));
  mediumChoice = screen.getByRole("combobox", { name: "Medio visual" });
  await user.selectOptions(mediumChoice, within(mediumChoice).getByRole("option", { name: "dos.png" }));
  await user.click(screen.getByRole("button", { name: "Añadir" }));
  scene = await screen.findByRole("region", { name: "Escena" });
  expect(within(scene).getByText("corte directo")).toBeInTheDocument();
  expect(within(scene).getByRole("combobox", { name: "Narración" })).toHaveValue("");
  expect(scene.querySelector("audio")).toBeNull();

  await user.click(screen.getByRole("button", { name: "Escenas" }));
  mediumChoice = screen.getByRole("combobox", { name: "Medio visual" });
  await user.selectOptions(mediumChoice, within(mediumChoice).getByRole("option", { name: "tres.png" }));
  await user.click(screen.getByRole("button", { name: "Añadir" }));
  scene = await screen.findByRole("region", { name: "Escena" });
  expect(within(scene).getByText("corte directo")).toBeInTheDocument();
  narration = within(scene).getByRole("combobox", { name: "Narración" });
  await user.selectOptions(narration, within(narration).getByRole("option", { name: "voz.mp3" }));
  const thirdAudio = scene.querySelector("audio");
  expect(thirdAudio).not.toBeNull();
  expect(thirdAudio).not.toBe(firstAudio);
  expect(thirdAudio?.getAttribute("src")).toBe(firstAudio?.getAttribute("src"));

  await user.click(screen.getByRole("button", { name: "Escenas" }));
  await user.click(
    within(screen.getByRole("list", { name: "Escenas" })).getByRole("button", { name: "uno.png" }),
  );
  scene = await screen.findByRole("region", { name: "Escena" });
  narration = within(scene).getByRole("combobox", { name: "Narración" });
  await user.selectOptions(
    narration,
    within(narration).getByRole("option", { name: "Sin narración" }),
  );
  expect(scene.querySelector("audio")).toBeNull();

  await user.click(screen.getByRole("button", { name: "Escenas" }));
  await user.click(
    within(screen.getByRole("list", { name: "Escenas" })).getByRole("button", { name: "tres.png" }),
  );
  scene = await screen.findByRole("region", { name: "Escena" });
  expect(scene.querySelector("audio")).not.toBeNull();
});

test("la narración termina cuando termina la escena y no se repite si acaba antes", async () => {
  stubPlayback();
  const user = userEvent.setup();
  render(<Editor />);

  await user.click(screen.getByRole("button", { name: "Biblioteca" }));
  const input = screen.getByLabelText("Incorporar");
  await user.upload(input, new File(["imagen"], "foto.png", { type: "image/png" }));
  await user.upload(input, fileWithDuration("relato.mp3", "audio/mpeg", 10));

  await user.click(screen.getByRole("button", { name: "Escenas" }));
  await user.click(screen.getByRole("button", { name: "Añadir" }));

  const scene = await screen.findByRole("region", { name: "Escena" });
  const narration = within(scene).getByRole("combobox", { name: "Narración" });
  await user.selectOptions(narration, within(narration).getByRole("option", { name: "relato.mp3" }));

  const audio = scene.querySelector("audio")!;
  expect(audio).not.toBeNull();
  expect(audio).toHaveProperty("loop", false);
  expect(audio).not.toHaveAttribute("loop");

  const pause = vi.fn();
  Object.defineProperty(audio, "pause", { configurable: true, value: pause });

  let time = 2.9;
  Object.defineProperty(audio, "currentTime", {
    configurable: true,
    get: () => time,
    set: (value: number) => {
      time = value;
    },
  });
  fireEvent.timeUpdate(audio);
  expect(pause).not.toHaveBeenCalled();

  time = 3;
  fireEvent.timeUpdate(audio);
  expect(pause).toHaveBeenCalledTimes(1);

  pause.mockClear();
  time = 0;
  vi.useFakeTimers();
  fireEvent.play(audio);
  act(() => {
    vi.advanceTimersByTime(2999);
  });
  expect(pause).not.toHaveBeenCalled();
  act(() => {
    vi.advanceTimersByTime(1);
  });
  expect(pause).toHaveBeenCalledTimes(1);

  pause.mockClear();
  fireEvent.play(audio);
  fireEvent.ended(audio);
  act(() => {
    vi.advanceTimersByTime(5000);
  });
  expect(pause).not.toHaveBeenCalled();
});

test("al volver, la narración sigue en la escena y una escena guardada sin narración se abre bien", async () => {
  stubPlayback();
  const user = userEvent.setup();
  const first = render(<Editor />);

  await user.click(screen.getByRole("button", { name: "Biblioteca" }));
  const input = screen.getByLabelText("Incorporar");
  await user.upload(input, new File(["imagen"], "foto.png", { type: "image/png" }));
  await user.upload(input, fileWithDuration("voz.mp3", "audio/mpeg", 4));

  await user.click(screen.getByRole("button", { name: "Escenas" }));
  await user.click(screen.getByRole("button", { name: "Añadir" }));
  let scene = await screen.findByRole("region", { name: "Escena" });
  let narration = within(scene).getByRole("combobox", { name: "Narración" });
  await user.selectOptions(narration, within(narration).getByRole("option", { name: "voz.mp3" }));
  const expectedSrc = scene.querySelector("audio")?.getAttribute("src");
  expect(expectedSrc).toBeTruthy();

  first.unmount();
  const second = render(<Editor />);

  await user.click(
    within(screen.getByRole("list", { name: "Escenas" })).getByRole("button", { name: "foto.png" }),
  );
  scene = await screen.findByRole("region", { name: "Escena" });
  narration = within(scene).getByRole("combobox", { name: "Narración" });
  expect(narration).not.toHaveValue("");
  expect(within(narration).getByRole("option", { name: "voz.mp3" })).toHaveProperty("selected", true);
  expect(scene.querySelector("audio")?.getAttribute("src")).toBe(expectedSrc);

  second.unmount();
  localStorage.setItem(
    "shorts-editor",
    JSON.stringify({
      id: "u1",
      library: [{ id: "m1", name: "foto.png", kind: "imagen" }],
      projects: [
        {
          name: "Proyecto",
          scenes: [
            {
              id: "s1",
              mediumId: "m1",
              duration: 3,
              entry: null,
              cutWithPrevious: null,
              texts: [],
            },
          ],
        },
      ],
    }),
  );

  render(<Editor />);
  await user.click(
    within(screen.getByRole("list", { name: "Escenas" })).getByRole("button", { name: "foto.png" }),
  );
  scene = await screen.findByRole("region", { name: "Escena" });
  expect(within(scene).getByRole("combobox", { name: "Narración" })).toHaveValue("");
  expect(scene.querySelector("audio")).toBeNull();
});

test("un medio que ninguna escena usa sale de la biblioteca y no vuelve al reabrir", async () => {
  stubPlayback();
  const user = userEvent.setup();
  const first = render(<Editor />);

  await user.click(screen.getByRole("button", { name: "Biblioteca" }));
  const input = screen.getByLabelText("Incorporar");
  await user.upload(input, new File(["imagen"], "foto.png", { type: "image/png" }));
  await user.upload(input, fileWithDuration("video.mp4", "video/mp4", 4));
  await user.upload(input, fileWithDuration("voz.mp3", "audio/mpeg", 3));

  const list = screen.getByRole("list", { name: "Medios" });
  await removeLibraryMedium(user, list, "video.mp4 video");

  expect(within(list).queryByRole("listitem", { name: "video.mp4 video" })).not.toBeInTheDocument();
  expect(within(list).getByRole("listitem", { name: "foto.png imagen" })).toBeInTheDocument();
  expect(within(list).getByRole("listitem", { name: "voz.mp3 audio" })).toBeInTheDocument();

  first.unmount();
  render(<Editor />);

  await user.click(screen.getByRole("button", { name: "Biblioteca" }));
  const reloadedList = screen.getByRole("list", { name: "Medios" });
  expect(
    within(reloadedList).queryByRole("listitem", { name: "video.mp4 video" }),
  ).not.toBeInTheDocument();
  expect(
    within(reloadedList).getByRole("listitem", { name: "foto.png imagen" }),
  ).toBeInTheDocument();
  expect(within(reloadedList).getByRole("listitem", { name: "voz.mp3 audio" })).toBeInTheDocument();

  await removeLibraryMedium(user, reloadedList, "foto.png imagen");
  await removeLibraryMedium(user, reloadedList, "voz.mp3 audio");

  expect(reloadedList).toBeEmptyDOMElement();
  expect(screen.getByText("No hay medios.")).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "Escenas" }));
  expect(screen.queryByRole("combobox", { name: "Medio visual" })).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Añadir" })).not.toBeInTheDocument();
});

test("quitar un medio usado como medio visual se niega y deja biblioteca y proyecto igual", async () => {
  stubPlayback();
  const user = userEvent.setup();
  render(<Editor />);

  await user.click(screen.getByRole("button", { name: "Biblioteca" }));
  const input = screen.getByLabelText("Incorporar");
  await user.upload(input, new File(["primera"], "foto.png", { type: "image/png" }));
  await user.upload(input, new File(["segunda"], "foto.png", { type: "image/png" }));
  await user.upload(input, new File(["otra"], "otra.png", { type: "image/png" }));

  // Newer "foto.png" is at index 1 in visualMedia; add Scene 1 with it, Scene 2 with "otra.png".
  await user.click(screen.getByRole("button", { name: "Escenas" }));
  const mediumChoice = screen.getByRole("combobox", { name: "Medio visual" });
  const photoOptions = within(mediumChoice).getAllByRole("option", { name: "foto.png" });
  expect(photoOptions).toHaveLength(2);
  await user.selectOptions(mediumChoice, (photoOptions[0] as HTMLOptionElement).value);
  await user.click(screen.getByRole("button", { name: "Añadir" }));

  await user.click(screen.getByRole("button", { name: "Escenas" }));
  await user.selectOptions(
    screen.getByRole("combobox", { name: "Medio visual" }),
    within(screen.getByRole("combobox", { name: "Medio visual" })).getByRole("option", {
      name: "otra.png",
    }),
  );
  await user.click(screen.getByRole("button", { name: "Añadir" }));

  await user.click(screen.getByRole("button", { name: "Biblioteca" }));
  const list = screen.getByRole("list", { name: "Medios" });
  // Order in library (newest first): otra.png, foto.png (used), foto.png (unused).
  expect(libraryLabels(list)).toEqual(["otra.png imagen", "foto.png imagen", "foto.png imagen"]);

  // Try removing used foto.png -> denied.
  let items = within(list).getAllByRole("listitem");
  await user.click(within(items[1]).getByRole("button", { name: "Quitar" }));
  expect(libraryLabels(list)).toEqual(["otra.png imagen", "foto.png imagen", "foto.png imagen"]);

  // Removing unused copy succeeds.
  items = within(list).getAllByRole("listitem");
  await user.click(within(items[2]).getByRole("button", { name: "Quitar" }));
  expect(libraryLabels(list)).toEqual(["otra.png imagen", "foto.png imagen"]);

  expect(screen.getByText("El short dura 6 s")).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Escenas" }));
  const scenes = screen.getByRole("list", { name: "Escenas" });
  expect(libraryLabels(scenes)).toEqual(["foto.png", "otra.png"]);

  await user.click(within(scenes).getByRole("button", { name: "foto.png" }));
  const scene = await screen.findByRole("region", { name: "Escena" });
  expect(within(scene).getByRole("img", { name: "foto.png" }).getAttribute("src")).toBeTruthy();
});

test("un audio usado como narración no sale de la biblioteca hasta que ninguna escena lo usa", async () => {
  stubPlayback();
  const user = userEvent.setup();
  render(<Editor />);

  await user.click(screen.getByRole("button", { name: "Biblioteca" }));
  const input = screen.getByLabelText("Incorporar");
  await user.upload(input, new File(["una"], "uno.png", { type: "image/png" }));
  await user.upload(input, new File(["dos"], "dos.png", { type: "image/png" }));
  await user.upload(input, fileWithDuration("voz.mp3", "audio/mpeg", 4));

  // Scene 1 uses voz.mp3; Scene 2 does not.
  await user.click(screen.getByRole("button", { name: "Escenas" }));
  let choice = screen.getByRole("combobox", { name: "Medio visual" });
  await user.selectOptions(choice, within(choice).getByRole("option", { name: "uno.png" }));
  await user.click(screen.getByRole("button", { name: "Añadir" }));
  let scene = await screen.findByRole("region", { name: "Escena" });
  let narration = within(scene).getByRole("combobox", { name: "Narración" });
  await user.selectOptions(narration, within(narration).getByRole("option", { name: "voz.mp3" }));

  await user.click(screen.getByRole("button", { name: "Escenas" }));
  choice = screen.getByRole("combobox", { name: "Medio visual" });
  await user.selectOptions(choice, within(choice).getByRole("option", { name: "dos.png" }));
  await user.click(screen.getByRole("button", { name: "Añadir" }));
  await screen.findByRole("region", { name: "Escena" });

  // Try removing voz.mp3 -> denied while Scene 1 uses it.
  await user.click(screen.getByRole("button", { name: "Biblioteca" }));
  const list = screen.getByRole("list", { name: "Medios" });
  await removeLibraryMedium(user, list, "voz.mp3 audio");
  expect(within(list).getByRole("listitem", { name: "voz.mp3 audio" })).toBeInTheDocument();

  // Remove narration from Scene 1 -> audio remains in library and can now be removed.
  await user.click(screen.getByRole("button", { name: "Escenas" }));
  await user.click(
    within(screen.getByRole("list", { name: "Escenas" })).getByRole("button", { name: "uno.png" }),
  );
  scene = await screen.findByRole("region", { name: "Escena" });
  expect(scene.querySelector("audio")).not.toBeNull();
  narration = within(scene).getByRole("combobox", { name: "Narración" });
  await user.selectOptions(
    narration,
    within(narration).getByRole("option", { name: "Sin narración" }),
  );
  expect(scene.querySelector("audio")).toBeNull();

  await user.click(screen.getByRole("button", { name: "Biblioteca" }));
  const listAfter = screen.getByRole("list", { name: "Medios" });
  expect(within(listAfter).getByRole("listitem", { name: "voz.mp3 audio" })).toBeInTheDocument();
  await removeLibraryMedium(user, listAfter, "voz.mp3 audio");
  expect(
    within(listAfter).queryByRole("listitem", { name: "voz.mp3 audio" }),
  ).not.toBeInTheDocument();
  expect(screen.getByText("El short dura 6 s")).toBeInTheDocument();
});

test("quitar un medio consulta todos los proyectos del usuario y deja la biblioteca y los proyectos igual si alguno lo usa", async () => {
  localStorage.setItem(
    "shorts-editor",
    JSON.stringify({
      id: "u1",
      library: [
        { id: "m1", name: "visual.png", kind: "imagen" },
        { id: "m2", name: "relato.mp3", kind: "audio" },
        { id: "m3", name: "libre.png", kind: "imagen" },
      ],
      projects: [
        { name: "Proyecto", scenes: [] },
        {
          name: "Proyecto",
          scenes: [
            {
              id: "s-otro",
              mediumId: "m1",
              duration: 3,
              entry: null,
              cutWithPrevious: null,
              texts: [],
              narrationId: "m2",
            },
          ],
        },
      ],
    }),
  );

  const user = userEvent.setup();
  render(<Editor />);

  await user.click(screen.getByRole("button", { name: "Biblioteca" }));
  const list = screen.getByRole("list", { name: "Medios" });

  await removeLibraryMedium(user, list, "visual.png imagen");
  await removeLibraryMedium(user, list, "relato.mp3 audio");

  expect(within(list).getByRole("listitem", { name: "visual.png imagen" })).toBeInTheDocument();
  expect(within(list).getByRole("listitem", { name: "relato.mp3 audio" })).toBeInTheDocument();
  expect(within(list).getByRole("listitem", { name: "libre.png imagen" })).toBeInTheDocument();

  await removeLibraryMedium(user, list, "libre.png imagen");
  expect(within(list).queryByRole("listitem", { name: "libre.png imagen" })).not.toBeInTheDocument();

  const stored = JSON.parse(localStorage.getItem("shorts-editor") ?? "{}");
  expect(stored.library.map((item: { id: string }) => item.id)).toEqual(["m1", "m2"]);
  expect(stored.projects).toHaveLength(2);
  expect(stored.projects[1].scenes[0]).toMatchObject({
    id: "s-otro",
    mediumId: "m1",
    narrationId: "m2",
  });
});

async function addMedium(user: ReturnType<typeof userEvent.setup>, file: File) {
  if (!screen.queryByRole("region", { name: "Biblioteca" })) {
    await user.click(screen.getByRole("button", { name: "Biblioteca" }));
  }
  await user.upload(screen.getByLabelText("Incorporar"), file);
}

async function addSceneFrom(user: ReturnType<typeof userEvent.setup>, name: string) {
  if (!screen.queryByRole("region", { name: "Escenas" })) {
    await user.click(screen.getByRole("button", { name: "Escenas" }));
  }
  const choice = screen.getByRole("combobox", { name: "Medio visual" });
  await user.selectOptions(choice, within(choice).getByRole("option", { name }));
  await user.click(screen.getByRole("button", { name: "Añadir" }));
  return screen.findByRole("region", { name: "Escena" });
}

async function openScene(
  user: ReturnType<typeof userEvent.setup>,
  name: string,
  index = 0,
) {
  if (!screen.queryByRole("region", { name: "Escenas" })) {
    await user.click(screen.getByRole("button", { name: "Escenas" }));
  }
  const buttons = within(screen.getByRole("list", { name: "Escenas" })).getAllByRole("button", {
    name,
  });
  await user.click(buttons[index]);
  return screen.findByRole("region", { name: "Escena" });
}

function putDuration(scene: HTMLElement, value: string) {
  fireEvent.input(within(scene).getByRole("spinbutton", { name: "Duración" }), {
    target: { value },
  });
}

test("cambiar la duración de una imagen cambia cuánto se muestra y una imagen no tiene tope", async () => {
  const user = userEvent.setup();
  render(<Editor />);

  await addMedium(user, new File(["imagen"], "foto.png", { type: "image/png" }));
  const scene = await addSceneFrom(user, "foto.png");
  expect(within(scene).getByText("3 s")).toBeInTheDocument();
  expect(screen.getByText("El short dura 3 s")).toBeInTheDocument();

  putDuration(scene, "8");
  expect(within(scene).getByText("8 s")).toBeInTheDocument();
  expect(within(scene).queryByText("3 s")).not.toBeInTheDocument();
  expect(screen.getByText("El short dura 8 s")).toBeInTheDocument();
  expect(within(scene).getByRole("spinbutton", { name: "Duración" })).toHaveValue(8);

  putDuration(scene, "100");
  expect(within(scene).getByText("100 s")).toBeInTheDocument();
  expect(screen.getByText("El short dura 100 s")).toBeInTheDocument();
  expect(within(scene).queryByText("0 s")).not.toBeInTheDocument();
});

test("pedir duración cero se niega y la duración anterior sigue", async () => {
  const user = userEvent.setup();
  render(<Editor />);

  await addMedium(user, new File(["imagen"], "foto.png", { type: "image/png" }));
  const scene = await addSceneFrom(user, "foto.png");
  const duration = within(scene).getByRole("spinbutton", { name: "Duración" });

  duration.focus();
  fireEvent.input(duration, { target: { value: "0" } });
  expect(within(scene).getByText("3 s")).toBeInTheDocument();
  expect(screen.getByText("El short dura 3 s")).toBeInTheDocument();

  fireEvent.blur(duration);
  expect(duration).toHaveValue(3);
  expect(within(scene).getByText("3 s")).toBeInTheDocument();
  expect(screen.getByText("El short dura 3 s")).toBeInTheDocument();
});

test("en un video, la duración mueve la salida, la entrada se queda y no se sale del archivo", async () => {
  stubPlayback();
  const user = userEvent.setup();
  render(<Editor />);

  await addMedium(user, fileWithDuration("clip.mp4", "video/mp4", 10));
  const scene = await addSceneFrom(user, "clip.mp4");
  expect(within(scene).getByText("0 s")).toBeInTheDocument();
  expect(within(scene).getByText("3 s")).toBeInTheDocument();
  expect(within(scene).queryByRole("spinbutton", { name: "Entrada" })).not.toBeInTheDocument();
  expect(within(scene).getAllByRole("spinbutton")).toHaveLength(1);

  putDuration(scene, "5");
  expect(await within(scene).findByText("5 s")).toBeInTheDocument();
  expect(within(scene).getByText("0 s")).toBeInTheDocument();
  expect(screen.getByText("El short dura 5 s")).toBeInTheDocument();
  const video = within(scene).getByRole("region", { name: "Cuadro" }).querySelector("video");
  expect(video).toHaveProperty("muted", true);

  putDuration(scene, "11");
  await settle();
  expect(within(scene).getByText("5 s")).toBeInTheDocument();
  expect(within(scene).getByText("0 s")).toBeInTheDocument();
  expect(within(scene).queryByText("10 s")).not.toBeInTheDocument();
  expect(within(scene).queryByText("11 s")).not.toBeInTheDocument();
  expect(screen.getByText("El short dura 5 s")).toBeInTheDocument();

  putDuration(scene, "10");
  expect(await within(scene).findByText("10 s")).toBeInTheDocument();
  expect(within(scene).getByText("0 s")).toBeInTheDocument();
  expect(screen.getByText("El short dura 10 s")).toBeInTheDocument();
});

test("reemplazar cambia el medio de esa escena, la deja en su sitio y el corte sigue", async () => {
  stubPlayback();
  const user = userEvent.setup();
  render(<Editor />);

  await addMedium(user, new File(["una"], "foto.png", { type: "image/png" }));
  await addMedium(user, new File(["otra"], "otra.png", { type: "image/png" }));
  await addMedium(user, fileWithDuration("clip.mp4", "video/mp4", 10));
  await addSceneFrom(user, "foto.png");
  await addSceneFrom(user, "otra.png");

  const scene = await openScene(user, "foto.png");
  const replace = within(scene).getByRole("combobox", { name: "Reemplazar" });
  expect(within(replace).queryByRole("option", { name: "nota.mp3" })).not.toBeInTheDocument();
  await user.selectOptions(replace, within(replace).getByRole("option", { name: "clip.mp4" }));

  expect(await within(scene).findByText("clip.mp4", { selector: "p" })).toBeInTheDocument();
  expect(within(scene).queryByText("foto.png", { selector: "p" })).not.toBeInTheDocument();
  expect(within(scene).getByText("3 s")).toBeInTheDocument();
  expect(within(scene).getByText("0 s")).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "Escenas" }));
  expect(
    within(screen.getByRole("list", { name: "Escenas" }))
      .getAllByRole("listitem")
      .map((item) => item.getAttribute("aria-label")),
  ).toEqual(["clip.mp4", "otra.png"]);

  const second = await openScene(user, "otra.png");
  expect(within(second).getByText("otra.png", { selector: "p" })).toBeInTheDocument();
  expect(within(second).getByText("corte directo")).toBeInTheDocument();
  expect(within(second).getByText("3 s")).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "Biblioteca" }));
  const library = screen.getByRole("list", { name: "Medios" });
  expect(within(library).getByRole("listitem", { name: "foto.png imagen" })).toBeInTheDocument();
  expect(within(library).getByRole("listitem", { name: "clip.mp4 video" })).toBeInTheDocument();
});

test("las otras escenas que usan el medio siguen igual y un audio no entra en el reemplazo", async () => {
  stubPlayback();
  const user = userEvent.setup();
  render(<Editor />);

  await addMedium(user, fileWithDuration("clip.mp4", "video/mp4", 10));
  await addMedium(user, new File(["otra"], "otra.png", { type: "image/png" }));
  await addMedium(user, fileWithDuration("nota.mp3", "audio/mpeg", 4));
  await addSceneFrom(user, "clip.mp4");
  await addSceneFrom(user, "clip.mp4");

  const scene = await openScene(user, "clip.mp4", 0);
  const replace = within(scene).getByRole("combobox", { name: "Reemplazar" });
  expect(within(replace).queryByRole("option", { name: "nota.mp3" })).not.toBeInTheDocument();
  expect(within(replace).getAllByRole("option").map((option) => option.textContent)).toEqual([
    "otra.png",
    "clip.mp4",
  ]);
  await user.selectOptions(replace, within(replace).getByRole("option", { name: "otra.png" }));

  expect(await within(scene).findByText("otra.png", { selector: "p" })).toBeInTheDocument();
  expect(within(scene).queryByText("0 s")).not.toBeInTheDocument();

  const other = await openScene(user, "clip.mp4");
  expect(within(other).getByText("clip.mp4", { selector: "p" })).toBeInTheDocument();
  expect(within(other).getByText("0 s")).toBeInTheDocument();
  expect(within(other).getByText("3 s")).toBeInTheDocument();
  expect(within(other).getByText("corte directo")).toBeInTheDocument();
});

test("elegir el mismo medio deja la escena como está y la entrada del video sigue donde está", async () => {
  stubPlayback();
  const user = userEvent.setup();
  const first = render(<Editor />);

  await addMedium(user, fileWithDuration("clip.mp4", "video/mp4", 10));
  await addSceneFrom(user, "clip.mp4");

  const stored = JSON.parse(localStorage.getItem("shorts-editor") ?? "{}");
  stored.projects[0].scenes[0].entry = 2;
  stored.projects[0].scenes[0].duration = 4;
  localStorage.setItem("shorts-editor", JSON.stringify(stored));
  first.unmount();
  render(<Editor />);

  const scene = await openScene(user, "clip.mp4");
  expect(within(scene).getByText("2 s")).toBeInTheDocument();
  expect(within(scene).getByText("4 s")).toBeInTheDocument();

  const replace = within(scene).getByRole("combobox", { name: "Reemplazar" });
  fireEvent.change(replace, { target: { value: (replace as HTMLSelectElement).value } });
  await settle();
  expect(within(scene).getByText("2 s")).toBeInTheDocument();
  expect(within(scene).getByText("4 s")).toBeInTheDocument();
  expect(within(scene).queryByText("0 s")).not.toBeInTheDocument();

  putDuration(scene, "5");
  expect(await within(scene).findByText("5 s")).toBeInTheDocument();
  expect(within(scene).getByText("2 s")).toBeInTheDocument();

  putDuration(scene, "9");
  await settle();
  expect(within(scene).getByText("5 s")).toBeInTheDocument();
  expect(within(scene).getByText("2 s")).toBeInTheDocument();
  expect(within(scene).queryByText("8 s")).not.toBeInTheDocument();

  putDuration(scene, "8");
  expect(await within(scene).findByText("8 s")).toBeInTheDocument();
  expect(within(scene).getByText("2 s")).toBeInTheDocument();
  expect(screen.getByText("El short dura 8 s")).toBeInTheDocument();
});

test("al reemplazar se quedan los textos y la narración, y terminan con la escena", async () => {
  stubPlayback();
  const user = userEvent.setup();
  render(<Editor />);

  await addMedium(user, new File(["imagen"], "foto.png", { type: "image/png" }));
  await addMedium(user, fileWithDuration("voz.mp3", "audio/mpeg", 10));
  await addMedium(user, fileWithDuration("corto.mp4", "video/mp4", 2));
  const scene = await addSceneFrom(user, "foto.png");
  putDuration(scene, "4");
  expect(within(scene).getByText("4 s")).toBeInTheDocument();

  await user.click(within(scene).getByRole("button", { name: "Añadir texto" }));
  await user.click(within(scene).getByRole("button", { name: "Añadir texto" }));
  const contents = within(scene).getAllByRole("textbox", { name: "Contenido" });
  await user.clear(contents[0]);
  await user.type(contents[0], "Arriba");
  fireEvent.input(within(scene).getAllByRole("spinbutton", { name: "Horizontal" })[0], {
    target: { value: "20" },
  });
  fireEvent.input(within(scene).getAllByRole("spinbutton", { name: "Vertical" })[0], {
    target: { value: "30" },
  });
  fireEvent.input(within(scene).getAllByRole("spinbutton", { name: "Tamaño" })[0], {
    target: { value: "15" },
  });
  fireEvent.input(within(scene).getAllByLabelText("Color")[0], { target: { value: "#ff0000" } });
  await user.selectOptions(within(scene).getAllByRole("combobox", { name: "Alineación" })[0], "right");
  await user.clear(contents[1]);
  await user.type(contents[1], "Abajo");

  const narration = within(scene).getByRole("combobox", { name: "Narración" });
  await user.selectOptions(narration, within(narration).getByRole("option", { name: "voz.mp3" }));
  expect(scene.querySelector("audio")).not.toBeNull();

  const replace = within(scene).getByRole("combobox", { name: "Reemplazar" });
  await user.selectOptions(replace, within(replace).getByRole("option", { name: "corto.mp4" }));

  expect(await within(scene).findByText("2 s")).toBeInTheDocument();
  expect(within(scene).queryByText("4 s")).not.toBeInTheDocument();
  expect(within(scene).getByText("0 s")).toBeInTheDocument();
  expect(within(scene).getByText("corto.mp4", { selector: "p" })).toBeInTheDocument();
  expect(screen.getByText("El short dura 2 s")).toBeInTheDocument();

  const frame = within(scene).getByRole("region", { name: "Cuadro" });
  expect(frame.querySelector("video")).toHaveProperty("muted", true);
  expect(frame.querySelector("video")).toHaveProperty("loop", false);
  expect(within(frame).getByText("Arriba")).toHaveStyle({
    left: "20%",
    top: "30%",
    fontSize: "15cqh",
  });
  expect(within(frame).getByText("Abajo")).toBeInTheDocument();
  const stacked = within(frame).getAllByText(/Arriba|Abajo/);
  expect(stacked.map((node) => node.textContent)).toEqual(["Arriba", "Abajo"]);

  expect(within(scene).getAllByRole("textbox", { name: "Contenido" })[0]).toHaveValue("Arriba");
  expect(within(scene).getAllByRole("textbox", { name: "Contenido" })[1]).toHaveValue("Abajo");
  expect(within(scene).getAllByRole("spinbutton", { name: "Horizontal" })[0]).toHaveValue(20);
  expect(within(scene).getAllByRole("spinbutton", { name: "Vertical" })[0]).toHaveValue(30);
  expect(within(scene).getAllByRole("spinbutton", { name: "Tamaño" })[0]).toHaveValue(15);
  expect(within(scene).getAllByLabelText("Color")[0]).toHaveValue("#ff0000");
  expect(within(scene).getAllByRole("combobox", { name: "Alineación" })[0]).toHaveValue("right");
  expect(within(scene).getByRole("combobox", { name: "Narración" })).not.toHaveValue("");

  const audio = scene.querySelector("audio")!;
  const pause = vi.fn();
  Object.defineProperty(audio, "pause", { configurable: true, value: pause });
  let time = 1.9;
  Object.defineProperty(audio, "currentTime", {
    configurable: true,
    get: () => time,
    set: (value: number) => {
      time = value;
    },
  });
  fireEvent.timeUpdate(audio);
  expect(pause).not.toHaveBeenCalled();
  time = 2;
  fireEvent.timeUpdate(audio);
  expect(pause).toHaveBeenCalledTimes(1);
});

test("una imagen nueva conserva la duración sin recorte y un video nuevo entra desde el inicio", async () => {
  stubPlayback();
  const user = userEvent.setup();
  render(<Editor />);

  await addMedium(user, fileWithDuration("clip.mp4", "video/mp4", 10));
  await addMedium(user, new File(["imagen"], "foto.png", { type: "image/png" }));
  let scene = await addSceneFrom(user, "clip.mp4");
  putDuration(scene, "5");
  expect(await within(scene).findByText("5 s")).toBeInTheDocument();

  let replace = within(scene).getByRole("combobox", { name: "Reemplazar" });
  await user.selectOptions(replace, within(replace).getByRole("option", { name: "foto.png" }));
  expect(await within(scene).findByText("foto.png", { selector: "p" })).toBeInTheDocument();
  expect(within(scene).getByText("5 s")).toBeInTheDocument();
  expect(within(scene).queryByText("0 s")).not.toBeInTheDocument();
  expect(screen.getByText("El short dura 5 s")).toBeInTheDocument();
  expect(within(scene).getByRole("region", { name: "Cuadro" }).querySelector("video")).toBeNull();

  replace = within(scene).getByRole("combobox", { name: "Reemplazar" });
  await user.selectOptions(replace, within(replace).getByRole("option", { name: "clip.mp4" }));
  expect(await within(scene).findByText("0 s")).toBeInTheDocument();
  expect(within(scene).getByText("5 s")).toBeInTheDocument();
  expect(within(scene).getByText("clip.mp4", { selector: "p" })).toBeInTheDocument();
  const video = within(scene).getByRole("region", { name: "Cuadro" }).querySelector("video");
  expect(video).toHaveProperty("muted", true);
  expect(video).toHaveProperty("loop", false);

  scene = await openScene(user, "clip.mp4");
  expect(within(scene).getByText("5 s")).toBeInTheDocument();
  expect(within(scene).getByText("0 s")).toBeInTheDocument();
});

test("un video sin duración positiva se niega como reemplazo y puede seguir en la biblioteca", async () => {
  stubPlayback();
  const user = userEvent.setup();
  render(<Editor />);

  await addMedium(user, new File(["imagen"], "foto.png", { type: "image/png" }));
  await addMedium(user, fileWithDuration("vacio.mp4", "video/mp4", 0));
  const scene = await addSceneFrom(user, "foto.png");
  const replace = within(scene).getByRole("combobox", { name: "Reemplazar" });
  await user.selectOptions(replace, within(replace).getByRole("option", { name: "vacio.mp4" }));
  await settle();

  expect(within(scene).getByText("foto.png", { selector: "p" })).toBeInTheDocument();
  expect(within(scene).getByText("3 s")).toBeInTheDocument();
  expect(within(scene).queryByText("0 s")).not.toBeInTheDocument();
  expect(screen.getByText("El short dura 3 s")).toBeInTheDocument();
  expect(within(scene).getByRole("region", { name: "Cuadro" }).querySelector("img")).not.toBeNull();
  expect((replace as HTMLSelectElement).value).not.toBe("");
  expect(within(replace).getByRole("option", { name: "foto.png" })).toHaveProperty("selected", true);

  await user.click(screen.getByRole("button", { name: "Biblioteca" }));
  expect(
    within(screen.getByRole("list", { name: "Medios" })).getByRole("listitem", {
      name: "vacio.mp4 video",
    }),
  ).toBeInTheDocument();
});

async function chooseCut(
  user: ReturnType<typeof userEvent.setup>,
  scene: HTMLElement,
  kind: "corte directo" | "fundido",
) {
  const cut = within(scene).getByRole("combobox", { name: "Fundido" });
  const label = kind === "fundido" ? "Fundido" : "Corte directo";
  await user.selectOptions(cut, within(cut).getByRole("option", { name: label }));
}

test("pasar un corte a fundido nace en medio segundo y la barra descuenta ese tiempo", async () => {
  const user = userEvent.setup();
  render(<Editor />);

  await addMedium(user, new File(["una"], "foto.png", { type: "image/png" }));
  await addMedium(user, new File(["otra"], "otra.png", { type: "image/png" }));
  await addSceneFrom(user, "foto.png");
  await addSceneFrom(user, "otra.png");
  expect(screen.getByText("El short dura 6 s")).toBeInTheDocument();

  const scene = await openScene(user, "foto.png");
  expect(within(scene).queryByRole("spinbutton", { name: "Tiempo del fundido" })).not.toBeInTheDocument();
  await chooseCut(user, scene, "fundido");

  expect(within(scene).getByRole("spinbutton", { name: "Tiempo del fundido" })).toHaveValue(0.5);
  expect(within(scene).getByText("3 s")).toBeInTheDocument();
  expect(screen.getByText("El short dura 5.5 s")).toBeInTheDocument();

  const second = await openScene(user, "otra.png");
  expect(within(second).getByText("fundido")).toBeInTheDocument();
  expect(within(second).getByText("3 s")).toBeInTheDocument();
  expect(within(second).queryByRole("combobox", { name: "Fundido" })).not.toBeInTheDocument();
});

test("si la escena más corta dura menos de medio segundo, el fundido nace con esa duración", async () => {
  const user = userEvent.setup();
  render(<Editor />);

  await addMedium(user, new File(["una"], "foto.png", { type: "image/png" }));
  await addMedium(user, new File(["otra"], "otra.png", { type: "image/png" }));
  const scene = await addSceneFrom(user, "foto.png");
  putDuration(scene, "0.4");
  expect(within(scene).getByText("0.4 s")).toBeInTheDocument();
  await addSceneFrom(user, "otra.png");

  const first = await openScene(user, "foto.png");
  await chooseCut(user, first, "fundido");
  expect(within(first).getByRole("spinbutton", { name: "Tiempo del fundido" })).toHaveValue(0.4);
  expect(within(first).getByText("0.4 s")).toBeInTheDocument();
  expect(screen.getByText("El short dura 3 s")).toBeInTheDocument();
});

test("el tiempo del fundido llega hasta la escena más corta y pedir más o cero se niega", async () => {
  const user = userEvent.setup();
  render(<Editor />);

  await addMedium(user, new File(["una"], "foto.png", { type: "image/png" }));
  await addMedium(user, new File(["otra"], "otra.png", { type: "image/png" }));
  await addSceneFrom(user, "foto.png");
  await addSceneFrom(user, "otra.png");
  const scene = await openScene(user, "foto.png");
  await chooseCut(user, scene, "fundido");
  const time = within(scene).getByRole("spinbutton", { name: "Tiempo del fundido" });

  fireEvent.input(time, { target: { value: "3" } });
  expect(time).toHaveValue(3);
  expect(within(scene).getByText("3 s")).toBeInTheDocument();
  expect(screen.getByText("El short dura 3 s")).toBeInTheDocument();

  fireEvent.input(time, { target: { value: "3.1" } });
  expect(time).toHaveValue(3);
  expect(screen.getByText("El short dura 3 s")).toBeInTheDocument();

  time.focus();
  fireEvent.input(time, { target: { value: "0" } });
  expect(screen.getByText("El short dura 3 s")).toBeInTheDocument();
  fireEvent.blur(time);
  expect(time).toHaveValue(3);
  expect(within(scene).getByRole("combobox", { name: "Fundido" })).toHaveValue("fundido");
});

test("volver a corte directo olvida el tiempo y un fundido nuevo nace otra vez en medio segundo", async () => {
  const user = userEvent.setup();
  render(<Editor />);

  await addMedium(user, new File(["una"], "foto.png", { type: "image/png" }));
  await addMedium(user, new File(["otra"], "otra.png", { type: "image/png" }));
  await addSceneFrom(user, "foto.png");
  await addSceneFrom(user, "otra.png");
  let scene = await openScene(user, "foto.png");
  await chooseCut(user, scene, "fundido");
  fireEvent.input(within(scene).getByRole("spinbutton", { name: "Tiempo del fundido" }), {
    target: { value: "2" },
  });
  expect(screen.getByText("El short dura 4 s")).toBeInTheDocument();

  await chooseCut(user, scene, "corte directo");
  expect(within(scene).queryByRole("spinbutton", { name: "Tiempo del fundido" })).not.toBeInTheDocument();
  expect(screen.getByText("El short dura 6 s")).toBeInTheDocument();
  const second = await openScene(user, "otra.png");
  expect(within(second).getByText("corte directo")).toBeInTheDocument();
  expect(within(second).queryByText("fundido")).not.toBeInTheDocument();

  scene = await openScene(user, "foto.png");
  await chooseCut(user, scene, "fundido");
  expect(within(scene).getByRole("spinbutton", { name: "Tiempo del fundido" })).toHaveValue(0.5);
  expect(screen.getByText("El short dura 5.5 s")).toBeInTheDocument();
});

test("una escena puede estar en dos fundidos y la barra descuenta los dos", async () => {
  const user = userEvent.setup();
  render(<Editor />);

  await addMedium(user, new File(["una"], "uno.png", { type: "image/png" }));
  await addMedium(user, new File(["dos"], "dos.png", { type: "image/png" }));
  await addMedium(user, new File(["tres"], "tres.png", { type: "image/png" }));
  await addSceneFrom(user, "uno.png");
  await addSceneFrom(user, "dos.png");
  await addSceneFrom(user, "tres.png");

  let scene = await openScene(user, "uno.png");
  await chooseCut(user, scene, "fundido");
  scene = await openScene(user, "dos.png");
  expect(within(scene).getByText("fundido")).toBeInTheDocument();
  await chooseCut(user, scene, "fundido");
  expect(within(scene).getByRole("combobox", { name: "Fundido" })).toHaveValue("fundido");
  expect(within(scene).getByRole("spinbutton", { name: "Tiempo del fundido" })).toHaveValue(0.5);

  scene = await openScene(user, "tres.png");
  expect(within(scene).getByText("fundido")).toBeInTheDocument();
  expect(within(scene).getByText("3 s")).toBeInTheDocument();
  expect(screen.getByText("El short dura 8 s")).toBeInTheDocument();
});

test("un fundido no trae la escena vecina al cuadro, aunque el bloque se esté editando", async () => {
  stubPlayback();
  const user = userEvent.setup();
  render(<Editor />);

  await addMedium(user, fileWithDuration("sale.mp4", "video/mp4", 10));
  await addMedium(user, fileWithDuration("entra.mp4", "video/mp4", 10));
  await addMedium(user, fileWithDuration("voz-sale.mp3", "audio/mpeg", 10));
  await addMedium(user, fileWithDuration("voz-entra.mp3", "audio/mpeg", 10));

  let scene = await addSceneFrom(user, "sale.mp4");
  await user.click(within(scene).getByRole("button", { name: "Añadir texto" }));
  const saleText = within(scene).getByRole("textbox", { name: "Contenido" });
  await user.clear(saleText);
  await user.type(saleText, "Sale");
  let narration = within(scene).getByRole("combobox", { name: "Narración" });
  await user.selectOptions(narration, within(narration).getByRole("option", { name: "voz-sale.mp3" }));

  scene = await addSceneFrom(user, "entra.mp4");
  await user.click(within(scene).getByRole("button", { name: "Añadir texto" }));
  const entraText = within(scene).getByRole("textbox", { name: "Contenido" });
  await user.clear(entraText);
  await user.type(entraText, "Entra");
  narration = within(scene).getByRole("combobox", { name: "Narración" });
  await user.selectOptions(narration, within(narration).getByRole("option", { name: "voz-entra.mp3" }));

  scene = await openScene(user, "sale.mp4");
  await chooseCut(user, scene, "fundido");
  expect(within(scene).getByText("3 s")).toBeInTheDocument();
  expect(screen.getByText("El short dura 5.5 s")).toBeInTheDocument();

  const frame = within(scene).getByRole("region", { name: "Cuadro" });
  expect(within(frame).getByText("Sale")).toBeInTheDocument();
  expect(within(frame).queryByText("Entra")).not.toBeInTheDocument();
  expect(frame.querySelectorAll("video")).toHaveLength(1);
  const video = frame.querySelector("video");
  expect(video).toHaveProperty("muted", true);
  expect(video).toHaveProperty("loop", false);
  expect(frame.querySelectorAll("audio")).toHaveLength(1);
  expect(frame.querySelector("audio")).toHaveProperty("muted", false);

  fireEvent.input(within(scene).getByRole("spinbutton", { name: "Tiempo del fundido" }), {
    target: { value: "2" },
  });
  expect(screen.getByText("El short dura 4 s")).toBeInTheDocument();
  expect(within(frame).getByText("Sale")).toBeInTheDocument();
  expect(within(frame).queryByText("Entra")).not.toBeInTheDocument();
  expect(frame.querySelectorAll("video")).toHaveLength(1);
  expect(frame.querySelectorAll("audio")).toHaveLength(1);
  expect(video?.parentElement).toHaveStyle({ opacity: "1" });

  const second = await openScene(user, "entra.mp4");
  const secondFrame = within(second).getByRole("region", { name: "Cuadro" });
  expect(within(secondFrame).getByText("Entra")).toBeInTheDocument();
  expect(within(secondFrame).queryByText("Sale")).not.toBeInTheDocument();
  expect(secondFrame.querySelectorAll("video")).toHaveLength(1);
  expect(secondFrame.querySelectorAll("audio")).toHaveLength(1);
  expect(within(second).getByText("3 s")).toBeInTheDocument();
  expect(within(second).getByText("fundido")).toBeInTheDocument();
});

test("acortar una escena baja el fundido vecino y alargar después no lo restaura", async () => {
  const user = userEvent.setup();
  render(<Editor />);

  await addMedium(user, new File(["una"], "foto.png", { type: "image/png" }));
  await addMedium(user, new File(["otra"], "otra.png", { type: "image/png" }));
  await addSceneFrom(user, "foto.png");
  await addSceneFrom(user, "otra.png");
  const scene = await openScene(user, "foto.png");
  await chooseCut(user, scene, "fundido");
  const time = within(scene).getByRole("spinbutton", { name: "Tiempo del fundido" });
  fireEvent.input(time, { target: { value: "2" } });
  expect(screen.getByText("El short dura 4 s")).toBeInTheDocument();

  putDuration(scene, "1");
  expect(within(scene).getByText("1 s")).toBeInTheDocument();
  expect(time).toHaveValue(1);
  expect(screen.getByText("El short dura 3 s")).toBeInTheDocument();

  putDuration(scene, "3");
  expect(within(scene).getByText("3 s")).toBeInTheDocument();
  expect(time).toHaveValue(1);
  expect(screen.getByText("El short dura 5 s")).toBeInTheDocument();
});

test("reemplazar por un video más corto baja el fundido y alargar después no lo restaura", async () => {
  stubPlayback();
  const user = userEvent.setup();
  render(<Editor />);

  await addMedium(user, new File(["una"], "foto.png", { type: "image/png" }));
  await addMedium(user, new File(["otra"], "otra.png", { type: "image/png" }));
  await addMedium(user, fileWithDuration("corto.mp4", "video/mp4", 1));
  await addSceneFrom(user, "foto.png");
  await addSceneFrom(user, "otra.png");
  let scene = await openScene(user, "foto.png");
  await user.click(within(scene).getByRole("button", { name: "Añadir texto" }));
  const content = within(scene).getByRole("textbox", { name: "Contenido" });
  await user.clear(content);
  await user.type(content, "Sigue");
  await chooseCut(user, scene, "fundido");
  fireEvent.input(within(scene).getByRole("spinbutton", { name: "Tiempo del fundido" }), {
    target: { value: "2" },
  });

  const replace = within(scene).getByRole("combobox", { name: "Reemplazar" });
  await user.selectOptions(replace, within(replace).getByRole("option", { name: "corto.mp4" }));
  expect(await within(scene).findByText("1 s")).toBeInTheDocument();
  expect(within(scene).getByText("0 s")).toBeInTheDocument();
  expect(within(scene).getByRole("spinbutton", { name: "Tiempo del fundido" })).toHaveValue(1);
  expect(within(scene).getByRole("textbox", { name: "Contenido" })).toHaveValue("Sigue");
  expect(screen.getByText("El short dura 3 s")).toBeInTheDocument();

  const back = within(scene).getByRole("combobox", { name: "Reemplazar" });
  await user.selectOptions(back, within(back).getByRole("option", { name: "foto.png" }));
  expect(await within(scene).findByText("foto.png", { selector: "p" })).toBeInTheDocument();
  expect(within(scene).getByText("1 s")).toBeInTheDocument();
  expect(within(scene).queryByText("0 s")).not.toBeInTheDocument();

  putDuration(scene, "3");
  expect(within(scene).getByText("3 s")).toBeInTheDocument();
  expect(within(scene).getByRole("spinbutton", { name: "Tiempo del fundido" })).toHaveValue(1);
  expect(screen.getByText("El short dura 5 s")).toBeInTheDocument();
  scene = await openScene(user, "otra.png");
  expect(within(scene).getByText("fundido")).toBeInTheDocument();
  expect(within(scene).getByText("3 s")).toBeInTheDocument();
});

test("añadir una escena no crea un fundido", async () => {
  const user = userEvent.setup();
  render(<Editor />);

  await addMedium(user, new File(["una"], "uno.png", { type: "image/png" }));
  await addMedium(user, new File(["dos"], "dos.png", { type: "image/png" }));
  await addMedium(user, new File(["tres"], "tres.png", { type: "image/png" }));
  await addSceneFrom(user, "uno.png");
  await addSceneFrom(user, "dos.png");
  const scene = await openScene(user, "uno.png");
  await chooseCut(user, scene, "fundido");
  expect(screen.getByText("El short dura 5.5 s")).toBeInTheDocument();

  const added = await addSceneFrom(user, "tres.png");
  expect(within(added).getByText("corte directo")).toBeInTheDocument();
  expect(within(added).queryByText("fundido")).not.toBeInTheDocument();
  expect(screen.getByText("El short dura 8.5 s")).toBeInTheDocument();

  const first = await openScene(user, "uno.png");
  expect(within(first).getByRole("spinbutton", { name: "Tiempo del fundido" })).toHaveValue(0.5);
  const middle = await openScene(user, "dos.png");
  expect(within(middle).getByText("fundido")).toBeInTheDocument();
  expect(within(middle).getByRole("combobox", { name: "Fundido" })).toHaveValue(
    "corte directo",
  );
});

async function sceneAction(
  user: ReturnType<typeof userEvent.setup>,
  name: string,
  action: "Eliminar" | "Mover antes" | "Mover después",
) {
  if (!screen.queryByRole("region", { name: "Escenas" })) {
    await user.click(screen.getByRole("button", { name: "Escenas" }));
  }
  const item = within(screen.getByRole("list", { name: "Escenas" })).getByRole("listitem", { name });
  await user.click(within(item).getByRole("button", { name: action }));
}

test("eliminar saca la escena con sus textos y su narración, y el medio sigue en la biblioteca", async () => {
  stubPlayback();
  const user = userEvent.setup();
  render(<Editor />);

  await addMedium(user, new File(["imagen"], "foto.png", { type: "image/png" }));
  await addMedium(user, new File(["otra"], "otra.png", { type: "image/png" }));
  await addMedium(user, fileWithDuration("voz.mp3", "audio/mpeg", 4));
  let scene = await addSceneFrom(user, "foto.png");
  await user.click(within(scene).getByRole("button", { name: "Añadir texto" }));
  const content = within(scene).getByRole("textbox", { name: "Contenido" });
  await user.clear(content);
  await user.type(content, "Adiós");
  const narration = within(scene).getByRole("combobox", { name: "Narración" });
  await user.selectOptions(narration, within(narration).getByRole("option", { name: "voz.mp3" }));
  await addSceneFrom(user, "otra.png");

  await sceneAction(user, "foto.png", "Eliminar");
  const list = screen.getByRole("list", { name: "Escenas" });
  expect(libraryLabels(list)).toEqual(["otra.png"]);
  expect(screen.getByText("El short dura 3 s")).toBeInTheDocument();
  expect(screen.queryByText("Adiós")).not.toBeInTheDocument();

  scene = await openScene(user, "otra.png");
  expect(within(scene).queryByText("Adiós")).not.toBeInTheDocument();
  expect(within(scene).getByRole("combobox", { name: "Narración" })).toHaveValue("");
  expect(scene.querySelector("audio")).toBeNull();
  expect(within(scene).queryByText("corte directo")).not.toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "Biblioteca" }));
  const library = screen.getByRole("list", { name: "Medios" });
  expect(within(library).getByRole("listitem", { name: "foto.png imagen" })).toBeInTheDocument();
  expect(within(library).getByRole("listitem", { name: "voz.mp3 audio" })).toBeInTheDocument();
  await removeLibraryMedium(user, library, "voz.mp3 audio");
  expect(within(library).queryByRole("listitem", { name: "voz.mp3 audio" })).not.toBeInTheDocument();
});

test("al eliminar desaparecen sus cortes y el par que queda junto por primera vez nace en corte directo", async () => {
  const user = userEvent.setup();
  render(<Editor />);

  await addMedium(user, new File(["una"], "uno.png", { type: "image/png" }));
  await addMedium(user, new File(["dos"], "dos.png", { type: "image/png" }));
  await addMedium(user, new File(["tres"], "tres.png", { type: "image/png" }));
  await addSceneFrom(user, "uno.png");
  await addSceneFrom(user, "dos.png");
  await addSceneFrom(user, "tres.png");
  let scene = await openScene(user, "uno.png");
  await chooseCut(user, scene, "fundido");
  fireEvent.input(within(scene).getByRole("spinbutton", { name: "Tiempo del fundido" }), {
    target: { value: "2" },
  });
  scene = await openScene(user, "dos.png");
  await chooseCut(user, scene, "fundido");
  fireEvent.input(within(scene).getByRole("spinbutton", { name: "Tiempo del fundido" }), {
    target: { value: "1" },
  });
  expect(screen.getByText("El short dura 6 s")).toBeInTheDocument();

  await sceneAction(user, "dos.png", "Eliminar");
  expect(libraryLabels(screen.getByRole("list", { name: "Escenas" }))).toEqual(["uno.png", "tres.png"]);
  expect(screen.getByText("El short dura 6 s")).toBeInTheDocument();

  scene = await openScene(user, "tres.png");
  expect(within(scene).getByText("corte directo")).toBeInTheDocument();
  expect(within(scene).queryByText("fundido")).not.toBeInTheDocument();
  expect(within(scene).queryByRole("spinbutton", { name: "Tiempo del fundido" })).not.toBeInTheDocument();
});

test("eliminar la primera conserva el corte siguiente y eliminar la última no crea un corte", async () => {
  const user = userEvent.setup();
  render(<Editor />);

  await addMedium(user, new File(["una"], "uno.png", { type: "image/png" }));
  await addMedium(user, new File(["dos"], "dos.png", { type: "image/png" }));
  await addMedium(user, new File(["tres"], "tres.png", { type: "image/png" }));
  await addSceneFrom(user, "uno.png");
  await addSceneFrom(user, "dos.png");
  await addSceneFrom(user, "tres.png");
  let scene = await openScene(user, "uno.png");
  await chooseCut(user, scene, "fundido");
  scene = await openScene(user, "dos.png");
  await chooseCut(user, scene, "fundido");
  fireEvent.input(within(scene).getByRole("spinbutton", { name: "Tiempo del fundido" }), {
    target: { value: "2" },
  });

  await sceneAction(user, "uno.png", "Eliminar");
  expect(libraryLabels(screen.getByRole("list", { name: "Escenas" }))).toEqual(["dos.png", "tres.png"]);
  scene = await openScene(user, "dos.png");
  expect(within(scene).queryByText("fundido")).not.toBeInTheDocument();
  expect(within(scene).queryByText("corte directo")).not.toBeInTheDocument();
  scene = await openScene(user, "tres.png");
  expect(within(scene).getByText("fundido")).toBeInTheDocument();
  expect(screen.getByText("El short dura 4 s")).toBeInTheDocument();

  await sceneAction(user, "tres.png", "Eliminar");
  expect(libraryLabels(screen.getByRole("list", { name: "Escenas" }))).toEqual(["dos.png"]);
  scene = await openScene(user, "dos.png");
  expect(within(scene).queryByText("fundido")).not.toBeInTheDocument();
  expect(within(scene).queryByText("corte directo")).not.toBeInTheDocument();
  expect(within(scene).queryByRole("combobox", { name: "Fundido" })).not.toBeInTheDocument();
  expect(screen.getByText("El short dura 3 s")).toBeInTheDocument();
});

test("eliminar la única deja el proyecto sin escenas y la duración del short en cero", async () => {
  const user = userEvent.setup();
  render(<Editor />);

  await addMedium(user, new File(["imagen"], "foto.png", { type: "image/png" }));
  await addSceneFrom(user, "foto.png");
  await sceneAction(user, "foto.png", "Eliminar");

  expect(screen.getByRole("list", { name: "Escenas" })).toBeEmptyDOMElement();
  expect(screen.getByText("El proyecto no tiene escenas.")).toBeInTheDocument();
  expect(screen.getByText("El short dura 0 s")).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "Escena" }));
  expect(screen.getByText("No hay una escena que editar.")).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "Biblioteca" }));
  expect(
    within(screen.getByRole("list", { name: "Medios" })).getByRole("listitem", {
      name: "foto.png imagen",
    }),
  ).toBeInTheDocument();
});

test("reordenar conserva el corte solo cuando las dos escenas siguen juntas y en el mismo orden", async () => {
  const user = userEvent.setup();
  render(<Editor />);

  await addMedium(user, new File(["una"], "uno.png", { type: "image/png" }));
  await addMedium(user, new File(["dos"], "dos.png", { type: "image/png" }));
  await addMedium(user, new File(["tres"], "tres.png", { type: "image/png" }));
  await addMedium(user, new File(["cuatro"], "cuatro.png", { type: "image/png" }));
  await addSceneFrom(user, "uno.png");
  await addSceneFrom(user, "dos.png");
  await addSceneFrom(user, "tres.png");
  await addSceneFrom(user, "cuatro.png");
  let scene = await openScene(user, "uno.png");
  await chooseCut(user, scene, "fundido");
  fireEvent.input(within(scene).getByRole("spinbutton", { name: "Tiempo del fundido" }), {
    target: { value: "2" },
  });

  await user.click(screen.getByRole("button", { name: "Escenas" }));
  const list = screen.getByRole("list", { name: "Escenas" });
  const items = within(list).getAllByRole("listitem");
  expect(within(items[0]).getByRole("button", { name: "Mover antes" })).toBeDisabled();
  expect(within(items[3]).getByRole("button", { name: "Mover después" })).toBeDisabled();

  await sceneAction(user, "cuatro.png", "Mover antes");
  expect(libraryLabels(screen.getByRole("list", { name: "Escenas" }))).toEqual([
    "uno.png",
    "dos.png",
    "cuatro.png",
    "tres.png",
  ]);

  scene = await openScene(user, "dos.png");
  expect(within(scene).getByText("fundido")).toBeInTheDocument();
  scene = await openScene(user, "uno.png");
  expect(within(scene).getByRole("spinbutton", { name: "Tiempo del fundido" })).toHaveValue(2);
  scene = await openScene(user, "cuatro.png");
  expect(within(scene).getByText("corte directo")).toBeInTheDocument();
  expect(within(scene).queryByText("fundido")).not.toBeInTheDocument();
  expect(screen.getByText("El short dura 10 s")).toBeInTheDocument();

  await sceneAction(user, "dos.png", "Mover después");
  expect(libraryLabels(screen.getByRole("list", { name: "Escenas" }))).toEqual([
    "uno.png",
    "cuatro.png",
    "dos.png",
    "tres.png",
  ]);
  scene = await openScene(user, "dos.png");
  expect(within(scene).getByText("corte directo")).toBeInTheDocument();
  expect(within(scene).queryByText("fundido")).not.toBeInTheDocument();
  expect(screen.getByText("El short dura 12 s")).toBeInTheDocument();
});

test("si el par se invierte el corte desaparece y el par nuevo nace en corte directo", async () => {
  const user = userEvent.setup();
  render(<Editor />);

  await addMedium(user, new File(["una"], "uno.png", { type: "image/png" }));
  await addMedium(user, new File(["dos"], "dos.png", { type: "image/png" }));
  await addSceneFrom(user, "uno.png");
  await addSceneFrom(user, "dos.png");
  const scene = await openScene(user, "uno.png");
  await chooseCut(user, scene, "fundido");
  fireEvent.input(within(scene).getByRole("spinbutton", { name: "Tiempo del fundido" }), {
    target: { value: "2" },
  });
  expect(screen.getByText("El short dura 4 s")).toBeInTheDocument();

  await sceneAction(user, "dos.png", "Mover antes");
  expect(libraryLabels(screen.getByRole("list", { name: "Escenas" }))).toEqual(["dos.png", "uno.png"]);
  const moved = await openScene(user, "uno.png");
  expect(within(moved).getByText("corte directo")).toBeInTheDocument();
  expect(within(moved).queryByText("fundido")).not.toBeInTheDocument();
  expect(within(moved).queryByRole("spinbutton", { name: "Tiempo del fundido" })).not.toBeInTheDocument();
  expect(screen.getByText("El short dura 6 s")).toBeInTheDocument();
});

test("el video del cuadro queda en la entrada y no sigue hasta el final del archivo", async () => {
  stubPlayback();
  const user = userEvent.setup();
  render(<Editor />);

  await addMedium(user, fileWithDuration("clip.mp4", "video/mp4", 10));
  const scene = await addSceneFrom(user, "clip.mp4");
  const video = within(scene).getByRole("region", { name: "Cuadro" }).querySelector("video");
  expect(video).not.toBeNull();
  expect(video).toHaveProperty("paused", true);
  expect(video).not.toHaveAttribute("autoplay");
  expect(video).toHaveProperty("currentTime", 0);
  expect(screen.getByText("El short dura 3 s")).toBeInTheDocument();
  expect(within(scene).getByText("0 s")).toBeInTheDocument();
  expect(within(scene).getByText("3 s")).toBeInTheDocument();

  fireEvent.timeUpdate(video!);
  expect(video).toHaveProperty("paused", true);
  expect(video).toHaveProperty("currentTime", 0);
});

test("de arriba abajo están el cuadro, la lista de escenas y el recorrido", async () => {
  const user = userEvent.setup();
  render(<Editor />);

  await user.click(screen.getByRole("button", { name: "Vista previa" }));
  const preview = screen.getByRole("region", { name: "Vista previa" });
  const cuadro = within(preview).getByRole("region", { name: "Cuadro" });
  const list = within(preview).getByRole("list", { name: "Escenas" });
  const recorrido = within(preview).getByRole("slider", { name: "Recorrido" });

  expect(preview).toHaveStyle({ display: "flex", flexDirection: "column" });
  expect(cuadro.compareDocumentPosition(list) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
    Node.DOCUMENT_POSITION_FOLLOWING,
  );
  expect(list.compareDocumentPosition(recorrido) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
    Node.DOCUMENT_POSITION_FOLLOWING,
  );
});

test("el cuadro usa la altura del modo, conserva la proporción del short y no mide 120 px de ancho", async () => {
  const user = userEvent.setup();
  render(<Editor />);

  await user.click(screen.getByRole("button", { name: "Vista previa" }));
  const preview = screen.getByRole("region", { name: "Vista previa" });
  const cuadro = within(preview).getByRole("region", { name: "Cuadro" });

  expect(preview).toHaveStyle({ flexGrow: "1", minHeight: "0" });
  expect(cuadro).toHaveStyle({
    flexGrow: "1",
    flexBasis: "auto",
    minHeight: "0",
    aspectRatio: "9 / 16",
    width: "auto",
    maxWidth: "100%",
    alignSelf: "center",
  });
  expect(cuadro.style.width).not.toBe("120px");
  expect(getComputedStyle(cuadro).width).not.toBe("120px");
});

function shownOpacity(node: HTMLElement): number {
  let current: HTMLElement | null = node;
  while (current && current.getAttribute("aria-label") !== "Cuadro") {
    if (current.style.opacity !== "") return Number(current.style.opacity);
    current = current.parentElement;
  }
  return Number(getComputedStyle(node).opacity);
}

function expectSilent(cuadro: HTMLElement) {
  for (const video of cuadro.querySelectorAll("video")) {
    expect(video).toHaveProperty("muted", true);
    expect(video).toHaveProperty("paused", true);
  }
  for (const audio of cuadro.querySelectorAll("audio")) {
    expect(audio.paused).toBe(true);
  }
}

test("el cuadro muestra el momento del recorrido, fundido incluido, con los textos y el medio visual en silencio", async () => {
  stubPlayback();
  const user = userEvent.setup();
  render(<Editor />);

  await addMedium(user, fileWithDuration("sale.mp4", "video/mp4", 10));
  await addMedium(user, fileWithDuration("entra.mp4", "video/mp4", 10));
  await addMedium(user, fileWithDuration("voz.mp3", "audio/mpeg", 10));

  let scene = await addSceneFrom(user, "sale.mp4");
  await user.click(within(scene).getByRole("button", { name: "Añadir texto" }));
  const saleText = within(scene).getByRole("textbox", { name: "Contenido" });
  await user.clear(saleText);
  await user.type(saleText, "Sale");
  const narration = within(scene).getByRole("combobox", { name: "Narración" });
  await user.selectOptions(narration, within(narration).getByRole("option", { name: "voz.mp3" }));

  scene = await addSceneFrom(user, "entra.mp4");
  await user.click(within(scene).getByRole("button", { name: "Añadir texto" }));
  const entraText = within(scene).getByRole("textbox", { name: "Contenido" });
  await user.clear(entraText);
  await user.type(entraText, "Entra");

  scene = await openScene(user, "sale.mp4");
  await chooseCut(user, scene, "fundido");
  fireEvent.input(within(scene).getByRole("spinbutton", { name: "Tiempo del fundido" }), {
    target: { value: "1" },
  });
  expect(screen.getByText("El short dura 5 s")).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "Vista previa" }));
  const cuadro = within(screen.getByRole("region", { name: "Vista previa" })).getByRole("region", {
    name: "Cuadro",
  });
  const recorrido = screen.getByRole("slider", { name: "Recorrido" });

  fireEvent.change(recorrido, { target: { value: "0" } });
  expect(within(cuadro).getByText("Sale")).toBeInTheDocument();
  expect(within(cuadro).queryByText("Entra")).not.toBeInTheDocument();
  expect(cuadro.querySelectorAll("video")).toHaveLength(1);
  expect(shownOpacity(within(cuadro).getByText("Sale"))).toBeCloseTo(1, 2);
  expectSilent(cuadro);

  fireEvent.change(recorrido, { target: { value: "2.5" } });
  expect(within(cuadro).getByText("Sale")).toBeInTheDocument();
  expect(within(cuadro).getByText("Entra")).toBeInTheDocument();
  expect(cuadro.querySelectorAll("video")).toHaveLength(2);
  expect(shownOpacity(within(cuadro).getByText("Sale"))).toBeCloseTo(0.5, 2);
  expect(shownOpacity(within(cuadro).getByText("Entra"))).toBeCloseTo(0.5, 2);
  expectSilent(cuadro);

  fireEvent.change(recorrido, { target: { value: "4" } });
  expect(within(cuadro).queryByText("Sale")).not.toBeInTheDocument();
  expect(within(cuadro).getByText("Entra")).toBeInTheDocument();
  expect(cuadro.querySelectorAll("video")).toHaveLength(1);
  expect(shownOpacity(within(cuadro).getByText("Entra"))).toBeCloseTo(1, 2);
  expectSilent(cuadro);
});

test("con la vista previa detenida, mover el recorrido deja el cuadro en el momento nuevo, en silencio, y sigue pausada", async () => {
  stubPlayback();
  const user = userEvent.setup();
  render(<Editor />);

  await addMedium(user, new File(["una"], "foto.png", { type: "image/png" }));
  await addMedium(user, fileWithDuration("clip.mp4", "video/mp4", 10));
  await addSceneFrom(user, "foto.png");
  await addSceneFrom(user, "clip.mp4");

  await user.click(screen.getByRole("button", { name: "Vista previa" }));
  const preview = screen.getByRole("region", { name: "Vista previa" });
  const cuadro = within(preview).getByRole("region", { name: "Cuadro" });
  const recorrido = within(preview).getByRole("slider", { name: "Recorrido" });
  expect(within(preview).queryByRole("button", { name: "Reproducir" })).not.toBeInTheDocument();
  expect(within(preview).queryByRole("button", { name: "Pausar" })).not.toBeInTheDocument();

  fireEvent.change(recorrido, { target: { value: "0" } });
  expect(within(cuadro).getByRole("img", { name: "foto.png" })).toBeInTheDocument();
  expect(cuadro.querySelector("video")).toBeNull();
  expectSilent(cuadro);

  fireEvent.change(recorrido, { target: { value: "4" } });
  expect(within(cuadro).queryByRole("img", { name: "foto.png" })).not.toBeInTheDocument();
  const video = cuadro.querySelector("video");
  expect(video).not.toBeNull();
  expect(video).toHaveProperty("paused", true);
  expect(video).toHaveProperty("muted", true);
  await waitFor(() => {
    expect(video!.currentTime).toBeCloseTo(1, 2);
  });
  expect(recorrido).toHaveValue("4");
  expectSilent(cuadro);
  expect(within(preview).queryByRole("button", { name: "Reproducir" })).not.toBeInTheDocument();
});

test("un gesto que no cambia el momento no arranca la reproducción", async () => {
  stubPlayback();
  const user = userEvent.setup();
  render(<Editor />);

  await addMedium(user, fileWithDuration("clip.mp4", "video/mp4", 10));
  await addSceneFrom(user, "clip.mp4");
  await user.click(screen.getByRole("button", { name: "Vista previa" }));

  const preview = screen.getByRole("region", { name: "Vista previa" });
  const cuadro = within(preview).getByRole("region", { name: "Cuadro" });
  const recorrido = within(preview).getByRole("slider", { name: "Recorrido" });
  const video = cuadro.querySelector("video");
  expect(video).not.toBeNull();
  const play = vi.spyOn(video!, "play");

  await user.click(cuadro);
  fireEvent.change(recorrido, { target: { value: "0" } });

  expect(play).not.toHaveBeenCalled();
  expect(video).toHaveProperty("paused", true);
  expect(video).toHaveProperty("muted", true);
  expect(recorrido).toHaveValue("0");
  expect(within(preview).queryByRole("button", { name: "Reproducir" })).not.toBeInTheDocument();
  expect(within(preview).queryByRole("button", { name: "Pausar" })).not.toBeInTheDocument();
  expectSilent(cuadro);
});

test("la lista sigue el orden del proyecto, con el encaje de siempre y el fotograma de la entrada", async () => {
  stubPlayback();
  const user = userEvent.setup();
  const first = render(<Editor />);

  await addMedium(user, fileWithDuration("anim.gif", "image/gif", 10));
  await addMedium(user, fileWithDuration("clip.mp4", "video/mp4", 10));
  await addMedium(user, new File(["imagen"], "foto.png", { type: "image/png" }));
  await addSceneFrom(user, "foto.png");
  await addSceneFrom(user, "clip.mp4");
  await addSceneFrom(user, "anim.gif");

  const stored = JSON.parse(localStorage.getItem("shorts-editor") ?? "{}");
  stored.projects[0].scenes[1].entry = 2;
  localStorage.setItem("shorts-editor", JSON.stringify(stored));
  first.unmount();
  render(<Editor />);

  await user.click(screen.getByRole("button", { name: "Vista previa" }));
  const list = within(screen.getByRole("region", { name: "Vista previa" })).getByRole("list", {
    name: "Escenas",
  });
  const items = within(list).getAllByRole("listitem");
  expect(items.map((item) => item.getAttribute("aria-label"))).toEqual([
    "foto.png",
    "clip.mp4",
    "anim.gif",
  ]);

  const image = within(items[0]).getByRole("img", { name: "foto.png" });
  expect(image).toHaveStyle({ objectFit: "cover", objectPosition: "center" });

  const video = items[1].querySelector("video");
  expect(video).not.toBeNull();
  expect(items[1].querySelector("img")).toBeNull();
  expect(video).toHaveProperty("paused", true);
  expect(video).toHaveProperty("loop", false);
  expect(video).toHaveStyle({ objectFit: "cover", objectPosition: "center" });
  await waitFor(() => {
    expect(video!.currentTime).toBeCloseTo(2, 2);
  });

  const gif = items[2].querySelector("video");
  expect(gif).not.toBeNull();
  expect(items[2].querySelector("img")).toBeNull();
  expect(gif).toHaveProperty("paused", true);
  expect(gif).toHaveProperty("loop", false);
  expect(gif).not.toHaveAttribute("loop");
  expect(gif).toHaveStyle({ objectFit: "cover", objectPosition: "center" });
  await waitFor(() => {
    expect(gif!.currentTime).toBeCloseTo(0, 2);
  });
});

test("desde la lista no se añade, no se elimina y no se reordena, y no marca la escena del recorrido", async () => {
  const user = userEvent.setup();
  render(<Editor />);

  await addMedium(user, new File(["una"], "uno.png", { type: "image/png" }));
  await addMedium(user, new File(["dos"], "dos.png", { type: "image/png" }));
  await addSceneFrom(user, "uno.png");
  await addSceneFrom(user, "dos.png");
  await user.click(screen.getByRole("button", { name: "Vista previa" }));

  const preview = screen.getByRole("region", { name: "Vista previa" });
  const list = within(preview).getByRole("list", { name: "Escenas" });
  expect(within(preview).queryByRole("button", { name: "Añadir" })).not.toBeInTheDocument();
  expect(within(preview).queryByRole("button", { name: "Eliminar" })).not.toBeInTheDocument();
  expect(within(preview).queryByRole("button", { name: "Mover antes" })).not.toBeInTheDocument();
  expect(within(preview).queryByRole("button", { name: "Mover después" })).not.toBeInTheDocument();
  expect(within(preview).queryByRole("button", { name: "Quitar" })).not.toBeInTheDocument();

  fireEvent.change(within(preview).getByRole("slider", { name: "Recorrido" }), {
    target: { value: "4" },
  });
  for (const item of within(list).getAllByRole("listitem")) {
    expect(item).not.toHaveAttribute("aria-current");
    expect(item).not.toHaveAttribute("aria-selected");
    expect(within(item).queryByRole("button", { pressed: true })).not.toBeInTheDocument();
  }
  expect(within(list).getAllByRole("listitem").map((item) => item.getAttribute("aria-label"))).toEqual([
    "uno.png",
    "dos.png",
  ]);
});

test("elegir una escena lleva el recorrido al inicio de esa escena y el proyecto queda igual", async () => {
  const user = userEvent.setup();
  render(<Editor />);

  await addMedium(user, new File(["una"], "uno.png", { type: "image/png" }));
  await addMedium(user, new File(["dos"], "dos.png", { type: "image/png" }));
  await addSceneFrom(user, "uno.png");
  await addSceneFrom(user, "dos.png");
  const scene = await openScene(user, "uno.png");
  await chooseCut(user, scene, "fundido");
  fireEvent.input(within(scene).getByRole("spinbutton", { name: "Tiempo del fundido" }), {
    target: { value: "1" },
  });
  expect(screen.getByText("El short dura 5 s")).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "Vista previa" }));
  const preview = screen.getByRole("region", { name: "Vista previa" });
  const list = within(preview).getByRole("list", { name: "Escenas" });
  const recorrido = within(preview).getByRole("slider", { name: "Recorrido" });
  fireEvent.change(recorrido, { target: { value: "4" } });
  expect(recorrido).toHaveValue("4");

  await user.click(within(list).getByRole("button", { name: "dos.png" }));
  expect(recorrido).toHaveValue("2");

  const cuadro = within(preview).getByRole("region", { name: "Cuadro" });
  expect(within(cuadro).getByRole("img", { name: "uno.png" })).toBeInTheDocument();
  expect(within(cuadro).getByRole("img", { name: "dos.png" })).toBeInTheDocument();
  expect(screen.getByText("El short dura 5 s")).toBeInTheDocument();
  expect(within(list).getAllByRole("listitem").map((item) => item.getAttribute("aria-label"))).toEqual([
    "uno.png",
    "dos.png",
  ]);

  await user.click(within(list).getByRole("button", { name: "uno.png" }));
  expect(recorrido).toHaveValue("0");
  expect(within(cuadro).getByRole("img", { name: "uno.png" })).toBeInTheDocument();
  expect(within(cuadro).queryByRole("img", { name: "dos.png" })).not.toBeInTheDocument();

  const second = await openScene(user, "dos.png");
  expect(within(second).getByText("fundido")).toBeInTheDocument();
  expect(within(second).getByText("3 s")).toBeInTheDocument();
  expect(screen.getByText("El short dura 5 s")).toBeInTheDocument();
});

test("un video muestra su recorte desde la entrada, y un GIF no se repite para llenar la escena", async () => {
  stubPlayback();
  const user = userEvent.setup();
  const first = render(<Editor />);

  await addMedium(user, fileWithDuration("anim.gif", "image/gif", 10));
  await addMedium(user, fileWithDuration("clip.mp4", "video/mp4", 10));
  await addSceneFrom(user, "clip.mp4");
  await addSceneFrom(user, "anim.gif");

  const stored = JSON.parse(localStorage.getItem("shorts-editor") ?? "{}");
  stored.projects[0].scenes[0].entry = 2;
  stored.projects[0].scenes[0].duration = 4;
  localStorage.setItem("shorts-editor", JSON.stringify(stored));
  first.unmount();
  render(<Editor />);

  await user.click(screen.getByRole("button", { name: "Vista previa" }));
  const preview = screen.getByRole("region", { name: "Vista previa" });
  const cuadro = within(preview).getByRole("region", { name: "Cuadro" });
  const recorrido = within(preview).getByRole("slider", { name: "Recorrido" });
  expect(screen.getByText("El short dura 7 s")).toBeInTheDocument();

  fireEvent.change(recorrido, { target: { value: "1" } });
  const video = cuadro.querySelector("video");
  expect(video).not.toBeNull();
  await waitFor(() => {
    expect(video!.currentTime).toBeCloseTo(3, 2);
  });
  expect(video).toHaveProperty("muted", true);
  expect(video).toHaveProperty("paused", true);
  expect(video).toHaveProperty("loop", false);

  fireEvent.change(recorrido, { target: { value: "6.5" } });
  const gif = cuadro.querySelector("video");
  expect(gif).not.toBeNull();
  expect(gif).not.toBe(video);
  expect(gif).toHaveProperty("loop", false);
  expect(gif).not.toHaveAttribute("loop");
  expect(gif).toHaveProperty("paused", true);
  expect(gif).toHaveProperty("muted", true);
  await waitFor(() => {
    expect(gif!.currentTime).toBeCloseTo(2.5, 2);
  });
});

test("el medio llena el cuadro, centrado, sin bandas, y el encaje no es un control", async () => {
  stubPlayback();
  const user = userEvent.setup();
  render(<Editor />);

  await addMedium(user, fileWithDuration("clip.mp4", "video/mp4", 10));
  await addMedium(user, new File(["imagen"], "foto.png", { type: "image/png" }));
  await addSceneFrom(user, "foto.png");
  await addSceneFrom(user, "clip.mp4");
  await user.click(screen.getByRole("button", { name: "Vista previa" }));

  const preview = screen.getByRole("region", { name: "Vista previa" });
  const cuadro = within(preview).getByRole("region", { name: "Cuadro" });
  const recorrido = within(preview).getByRole("slider", { name: "Recorrido" });

  fireEvent.change(recorrido, { target: { value: "0" } });
  expect(within(cuadro).getByRole("img", { name: "foto.png" })).toHaveStyle({
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: "center",
  });

  fireEvent.change(recorrido, { target: { value: "4" } });
  const video = cuadro.querySelector("video");
  expect(video).not.toBeNull();
  expect(video).toHaveStyle({
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: "center",
  });
  expect(within(preview).queryByRole("combobox", { name: "Encaje" })).not.toBeInTheDocument();
  expect(within(preview).queryByRole("checkbox")).not.toBeInTheDocument();
  expect(within(preview).queryByLabelText("Encaje")).not.toBeInTheDocument();

  const composition = [...cuadro.querySelectorAll("div")].find(
    (node) => node.style.width === "1080px" && node.style.height === "1920px",
  );
  expect(composition).toBeTruthy();
});

test("sin escenas, la duración es cero, la lista está vacía, el cuadro no tiene nada que mostrar y el recorrido no tiene otro momento", async () => {
  const user = userEvent.setup();
  render(<Editor />);

  await user.click(screen.getByRole("button", { name: "Vista previa" }));
  const preview = screen.getByRole("region", { name: "Vista previa" });
  expect(within(screen.getByRole("banner")).getByText("El short dura 0 s")).toBeInTheDocument();
  expect(within(preview).getByRole("list", { name: "Escenas" })).toBeEmptyDOMElement();

  const cuadro = within(preview).getByRole("region", { name: "Cuadro" });
  expect(cuadro.querySelector("img, video, canvas")).toBeNull();
  expect(cuadro).toBeEmptyDOMElement();

  const recorrido = within(preview).getByRole("slider", { name: "Recorrido" });
  expect(recorrido).toHaveAttribute("min", "0");
  expect(recorrido).toHaveAttribute("max", "0");
  expect(recorrido).toHaveValue("0");
  fireEvent.change(recorrido, { target: { value: "3" } });
  expect(recorrido).toHaveValue("0");
  expect(cuadro).toBeEmptyDOMElement();
});
