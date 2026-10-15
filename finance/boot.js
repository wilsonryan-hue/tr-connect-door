import { jsx } from "react/jsx-runtime";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Desk } from "./src/components/loan/Desk.js";
const root = document.getElementById("root");
if (root) createRoot(root).render(/* @__PURE__ */ jsx(StrictMode, { children: /* @__PURE__ */ jsx(Desk, {}) }));
