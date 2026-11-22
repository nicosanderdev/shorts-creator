import { fireEvent, render, screen, within } from "@testing-library/react";
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
