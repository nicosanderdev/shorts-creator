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
