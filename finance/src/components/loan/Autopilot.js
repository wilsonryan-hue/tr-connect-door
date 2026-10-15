import { jsx, jsxs } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import { runFile } from "../../lib/loan/autopilot.js";
function Autopilot() {
  const file = useMemo(() => runFile(), []);
  const [saved, setSaved] = useState(false);
  function download() {
    const blob = new Blob([file.application], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "treun-roc-application.txt";
    a.click();
    URL.revokeObjectURL(url);
    setSaved(true);
  }
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs("section", { className: "rounded-xl border border-gold-dim bg-panel p-4", children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm text-gold", children: "Ran on open. Nothing was submitted." }),
      /* @__PURE__ */ jsx("h2", { className: "serif text-2xl", children: "The application is filled. It stops itself." }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 max-w-3xl text-ivory", children: "Every lender on the book, and every government scheme that is actually open, is written out below. None is sent. A search on James would not be repaid, and no open grant pays the next four weeks." }),
      /* @__PURE__ */ jsx("button", { type: "button", className: "mt-4 min-h-11 rounded-lg bg-gold px-4 font-medium text-ink", onClick: download, children: saved ? "Application downloaded" : "Download the application" })
    ] }),
    /* @__PURE__ */ jsx("ol", { className: "mt-4 grid gap-2", children: file.steps.map((step) => /* @__PURE__ */ jsxs("li", { className: "rounded-xl border border-line bg-panel px-4 py-3", children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm text-gold", children: step.action }),
      /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-ivory", children: step.result })
    ] }, step.action)) }),
    /* @__PURE__ */ jsxs("section", { className: "mt-4 rounded-xl border border-line bg-panel p-4", children: [
      /* @__PURE__ */ jsx("h2", { className: "serif text-2xl", children: "Filled application" }),
      /* @__PURE__ */ jsx("pre", { className: "mt-3 max-h-[32rem] overflow-auto whitespace-pre-wrap text-sm text-ivory", children: file.application })
    ] })
  ] });
}
export {
  Autopilot
};
