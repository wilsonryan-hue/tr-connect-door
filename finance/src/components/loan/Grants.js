import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { GRANTS_AS_OF, SCHEMES, grantDecisionText, schemesToSend } from "../../lib/loan/grants.js";
const VERDICT = {
  "do-not-apply": "Do not apply",
  "not-a-grant": "Not a grant",
  phone: "Phone only"
};
function Grants() {
  const [saved, setSaved] = useState(false);
  const send = schemesToSend();
  function download() {
    const blob = new Blob([grantDecisionText()], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "treun-roc-grant-decision.txt";
    a.click();
    URL.revokeObjectURL(url);
    setSaved(true);
  }
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs("section", { className: "rounded-xl border border-gold-dim bg-panel p-4", children: [
      /* @__PURE__ */ jsxs("p", { className: "text-sm text-gold", children: [
        "Checked ",
        GRANTS_AS_OF
      ] }),
      /* @__PURE__ */ jsx("h2", { className: "serif text-2xl", children: "Nothing to send" }),
      /* @__PURE__ */ jsxs("p", { className: "mt-2 max-w-3xl text-ivory", children: [
        send.length,
        " schemes qualify for an application. The open ones were checked against this company. None of them pay the next four weeks. Sending a pack to all of them would be a false application."
      ] }),
      /* @__PURE__ */ jsx("button", { type: "button", className: "mt-4 min-h-11 rounded-lg bg-gold px-4 font-medium text-ink", onClick: download, children: saved ? "Decision downloaded" : "Download the decision" })
    ] }),
    /* @__PURE__ */ jsx("section", { className: "mt-4 grid gap-3", children: SCHEMES.map((s) => /* @__PURE__ */ jsxs("article", { className: "rounded-xl border border-line bg-panel p-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-baseline justify-between gap-2", children: [
        /* @__PURE__ */ jsx("h3", { className: "serif text-xl", children: s.name }),
        /* @__PURE__ */ jsx("p", { className: s.verdict === "phone" ? "text-warn" : "text-bad", children: VERDICT[s.verdict] })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-mute", children: s.kind }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm", children: s.timing }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-ivory", children: s.why }),
      /* @__PURE__ */ jsx("a", { className: "mt-3 inline-flex min-h-11 items-center text-gold underline", href: s.url, target: "_blank", rel: "noreferrer", children: "Official page" })
    ] }, s.id)) })
  ] });
}
export {
  Grants
};
