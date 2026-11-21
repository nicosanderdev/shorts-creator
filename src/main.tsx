import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Editor } from "./Editor";

const root = document.getElementById("root");
if (!root) throw new Error("No está el raíz del editor.");

createRoot(root).render(
  <StrictMode>
    <Editor />
  </StrictMode>,
);
