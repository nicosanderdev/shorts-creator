import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";
import { Editor } from "./Editor";

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
