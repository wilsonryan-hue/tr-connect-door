import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { APPROVAL, COPELAND, DOORS, FACTORING_AS_OF, INVOICE_LINES, STRUCTURE, WHO, factoringText } from "../../lib/loan/factoring.js";
const VERDICT = {
  "do-not-send": "Do not send",
  "not-this-invoice": "Not this invoice",
  "phone-the-debtor": "Phone Copeland"
};
function Factoring() {
  const [saved, setSaved] = useState(false);
  function download() {
    const blob = new Blob([factoringText()], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "treun-roc-factoring-decision.txt";
    a.click();
    URL.revokeObjectURL(url);
    setSaved(true);
  }
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs("section", { className: "rounded-xl border border-gold-dim bg-panel p-4", children: [
      /* @__PURE__ */ jsxs("p", { className: "text-sm text-gold", children: [
        "Checked ",
        FACTORING_AS_OF
      ] }),
      /* @__PURE__ */ jsx("h2", { className: "serif text-2xl", children: "One invoice can be funded. The whole book cannot." }),
      /* @__PURE__ */ jsxs("p", { className: "mt-3 text-sm text-ivory", children: [
        APPROVAL.before,
        "% until Copeland confirms the invoice in writing. About ",
        APPROVAL.pack,
        "% once that email, the purchase order and the finished work are in the pack, at one manual funder. About ",
        APPROVAL.panel,
        "% if it is sprayed at an online panel. This is the desk\u2019s judgment, not a funder\u2019s score."
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "mt-3 text-sm", children: [
        "One call: ",
        WHO.name,
        ", ",
        WHO.legal,
        ", ",
        WHO.number,
        ". ",
        WHO.range,
        " ",
        WHO.why
      ] }),
      /* @__PURE__ */ jsx("ol", { className: "mt-4 grid gap-1 text-sm", children: INVOICE_LINES.map((line) => /* @__PURE__ */ jsx("li", { children: line }, line)) }),
      /* @__PURE__ */ jsx("ol", { className: "mt-4 list-decimal space-y-1 pl-5 text-sm", children: STRUCTURE.map((line) => /* @__PURE__ */ jsx("li", { children: line }, line)) }),
      /* @__PURE__ */ jsx("button", { type: "button", className: "mt-4 min-h-11 rounded-lg bg-gold px-4 font-medium text-ink", onClick: download, children: saved ? "Decision downloaded" : "Download the decision" })
    ] }),
    /* @__PURE__ */ jsx("section", { className: "mt-4 grid gap-3 sm:grid-cols-2", children: COPELAND.map((c) => /* @__PURE__ */ jsxs("article", { className: "rounded-xl border border-line bg-panel p-4", children: [
      /* @__PURE__ */ jsx("h3", { className: "serif text-xl", children: c.name }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-gold", children: c.number }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm", children: c.office }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-mute", children: c.note })
    ] }, c.number)) }),
    /* @__PURE__ */ jsx("section", { className: "mt-4 grid gap-3", children: DOORS.map((d) => /* @__PURE__ */ jsxs("article", { className: "rounded-xl border border-line bg-panel p-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-baseline justify-between gap-2", children: [
        /* @__PURE__ */ jsx("h3", { className: "serif text-xl", children: d.name }),
        /* @__PURE__ */ jsx("p", { className: d.verdict === "phone-the-debtor" ? "text-warn" : "text-bad", children: VERDICT[d.verdict] })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-mute", children: d.kind }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm", children: d.timing }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-ivory", children: d.why })
    ] }, d.id)) })
  ] });
}
export {
  Factoring
};
