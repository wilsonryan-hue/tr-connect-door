import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { buildPlan, retune } from "../../lib/loan/engine.js";
import { MARKET_AS_OF, MARKET_NEXT, HOUSE_RULES, LENDERS } from "../../lib/loan/market.js";
import { COMPANY, DEFAULT_DOCS, PEOPLE } from "../../lib/loan/profiles.js";
import { MAIL_HITS, advise, buildDataPack, classifyFile } from "../../lib/loan/datapack.js";
import { Autopilot } from "../../components/loan/Autopilot.js";
import { Factoring } from "../../components/loan/Factoring.js";
import { Grants } from "../../components/loan/Grants.js";
import { BOOKS } from "../../lib/loan/books.js";
const KEY = "tr-loan-desk-v4";
const DEFAULT_INPUT = {
  amount: 2e4,
  purpose: "materials",
  speed: "month",
  cashNow: Math.round(BOOKS.close),
  monthlyIn: Math.round(BOOKS.paidIn / BOOKS.months.length),
  monthlyOut: Math.round(BOOKS.paidOut / BOOKS.months.length),
  oneOff: 2e4,
  hasInvoices: false,
  applicant: "james"
};
function money(n) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0
  }).format(n);
}
function Field({
  label,
  children
}) {
  return /* @__PURE__ */ jsxs("label", { className: "block", children: [
    /* @__PURE__ */ jsx("span", { className: "mb-1 block text-sm text-mute", children: label }),
    children
  ] });
}
const inputClass = "min-h-11 w-full rounded-lg border border-line bg-ink px-3 text-ivory outline-none focus:border-gold";
function Desk() {
  const [input, setInput] = useState(DEFAULT_INPUT);
  const [docs, setDocs] = useState(DEFAULT_DOCS);
  const [approved, setApproved] = useState(null);
  const [ready, setReady] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showMarket, setShowMarket] = useState(false);
  const [acceptance, setAcceptance] = useState(null);
  const [files, setFiles] = useState([]);
  const [arm, setArm] = useState("run");
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved.input) setInput({ ...DEFAULT_INPUT, ...saved.input });
        if (saved.docs?.length) setDocs(saved.docs);
        if (saved.approved) setApproved(saved.approved);
        if (typeof saved.acceptance === "number") setAcceptance(saved.acceptance);
      }
    } catch {
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    const payload = { input, docs, approved, acceptance };
    localStorage.setItem(KEY, JSON.stringify(payload));
  }, [input, docs, approved, acceptance, ready]);
  const plan = useMemo(
    () => buildPlan(
      {
        ...input,
        cashNow: Math.round(BOOKS.close),
        monthlyIn: Math.round(BOOKS.paidIn / BOOKS.months.length),
        monthlyOut: Math.round(BOOKS.paidOut / BOOKS.months.length)
      },
      /* @__PURE__ */ new Date(`${MARKET_AS_OF}T12:00:00Z`)
    ),
    [input]
  );
  const anchor = plan.planApprovalPct > 0 ? plan.planApprovalPct : plan.fileChancePct;
  const target = acceptance ?? anchor;
  const priced = useMemo(() => retune(input, plan, target), [input, plan, target]);
  const advice = useMemo(() => advise(input, plan), [input, plan]);
  const dossier = useMemo(() => buildDataPack(input, plan, files), [input, plan, files]);
  function set(key, value) {
    setInput((prev) => ({ ...prev, [key]: value }));
    setApproved(null);
    setAcceptance(null);
  }
  function setAmount(raw) {
    const n = Number(raw.replace(/[^0-9.]/g, ""));
    set("amount", Number.isFinite(n) ? Math.round(n) : 0);
  }
  function setNum(key, raw) {
    const n = Number(raw.replace(/[^0-9.]/g, ""));
    set(key, Number.isFinite(n) ? Math.round(n) : 0);
  }
  async function approve() {
    const text = dossier;
    setApproved({
      at: (/* @__PURE__ */ new Date()).toISOString(),
      text,
      headline: priced.headline
    });
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "TR-loan-sprint.txt";
    link.click();
    URL.revokeObjectURL(link.href);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }
  function onFiles(list) {
    if (!list) return;
    const names = Array.from(list).map((f) => f.name);
    setFiles((prev) => [...prev, ...names.filter((n) => !prev.includes(n))]);
    setDocs(
      (prev) => prev.map((d) => {
        const hit = names.some((n) => {
          const kind = classifyFile(n);
          if (kind === "memo") return false;
          if (d.id === "passport-james" && kind === "passport") return true;
          if (d.id === "banks" && kind === "statements") return true;
          if (d.id === "orders" && kind === "orders") return true;
          if (d.id === "plan" && kind === "plan") return true;
          if (d.id === "insurance" && kind === "insurance") return true;
          return false;
        });
        return hit ? { ...d, state: "laptop", note: "File added from this computer. The desk keeps the name, not a copy of the document." } : d;
      })
    );
    setApproved(null);
  }
  const person = PEOPLE[input.applicant];
  const struggle = priced.months.some((m) => m.flag === "struggle");
  const shownMode = priced.mode;
  return /* @__PURE__ */ jsxs("main", { className: "mx-auto min-h-screen max-w-6xl px-4 py-6 sm:px-6", children: [
    /* @__PURE__ */ jsxs("header", { className: "mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm tracking-widest text-gold", children: "TREUN ROC \xB7 FINANCE" }),
        /* @__PURE__ */ jsx("h1", { className: "serif text-4xl text-ivory", children: arm === "run" ? "Autopilot" : arm === "loans" ? "Loans" : arm === "grants" ? "Grants" : "Factoring" }),
        /* @__PURE__ */ jsxs("p", { className: "mt-1 max-w-xl text-mute", children: [
          COMPANY.legal,
          " \xB7 ",
          COMPANY.number,
          " \xB7 trading ",
          plan.tradingMonths,
          " months \xB7 market book ",
          MARKET_AS_OF,
          ". Next refresh ",
          MARKET_NEXT
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            className: `min-h-11 rounded-lg border px-4 ${arm === "run" ? "border-gold bg-gold text-ink" : "border-line text-ivory"}`,
            onClick: () => setArm("run"),
            children: "Autopilot"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            className: `min-h-11 rounded-lg border px-4 ${arm === "loans" ? "border-gold bg-gold text-ink" : "border-line text-ivory"}`,
            onClick: () => setArm("loans"),
            children: "Loans"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            className: `min-h-11 rounded-lg border px-4 ${arm === "grants" ? "border-gold bg-gold text-ink" : "border-line text-ivory"}`,
            onClick: () => setArm("grants"),
            children: "Grants"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            className: `min-h-11 rounded-lg border px-4 ${arm === "factoring" ? "border-gold bg-gold text-ink" : "border-line text-ivory"}`,
            onClick: () => setArm("factoring"),
            children: "Factoring"
          }
        )
      ] })
    ] }),
    arm === "run" ? /* @__PURE__ */ jsx(Autopilot, {}) : arm === "grants" ? /* @__PURE__ */ jsx(Grants, {}) : arm === "factoring" ? /* @__PURE__ */ jsx(Factoring, {}) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("section", { className: "grid gap-4 lg:grid-cols-5", children: [
        /* @__PURE__ */ jsxs("form", { className: "grid gap-3 rounded-xl border border-line bg-panel p-4 lg:col-span-2", onSubmit: (e) => e.preventDefault(), children: [
          /* @__PURE__ */ jsx("h2", { className: "serif text-2xl", children: "The ask" }),
          /* @__PURE__ */ jsx(Field, { label: "Amount we need", children: /* @__PURE__ */ jsx("input", { className: inputClass, inputMode: "numeric", value: input.amount, onChange: (e) => setAmount(e.target.value) }) }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsx(Field, { label: "What it is for", children: /* @__PURE__ */ jsxs("select", { className: inputClass, value: input.purpose, onChange: (e) => set("purpose", e.target.value), children: [
              /* @__PURE__ */ jsx("option", { value: "materials", children: "Materials for a live job" }),
              /* @__PURE__ */ jsx("option", { value: "wages", children: "Wages" }),
              /* @__PURE__ */ jsx("option", { value: "tax", children: "Tax or CIS" }),
              /* @__PURE__ */ jsx("option", { value: "plant", children: "Plant" }),
              /* @__PURE__ */ jsx("option", { value: "growth", children: "Growth" })
            ] }) }),
            /* @__PURE__ */ jsx(Field, { label: "How fast", children: /* @__PURE__ */ jsxs("select", { className: inputClass, value: input.speed, onChange: (e) => set("speed", e.target.value), children: [
              /* @__PURE__ */ jsx("option", { value: "week", children: "This week" }),
              /* @__PURE__ */ jsx("option", { value: "month", children: "This month" }),
              /* @__PURE__ */ jsx("option", { value: "wait", children: "Can wait" })
            ] }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsx(Field, { label: `Closed ${BOOKS.to}`, children: /* @__PURE__ */ jsx("input", { className: inputClass, readOnly: true, value: BOOKS.close.toFixed(2) }) }),
            /* @__PURE__ */ jsx(Field, { label: "Extra out this month", children: /* @__PURE__ */ jsx("input", { className: inputClass, inputMode: "numeric", value: input.oneOff, onChange: (e) => setNum("oneOff", e.target.value) }) }),
            /* @__PURE__ */ jsx(Field, { label: `Average month in, last ${BOOKS.months.length} statements`, children: /* @__PURE__ */ jsx("input", { className: inputClass, readOnly: true, value: Math.round(BOOKS.paidIn / BOOKS.months.length) }) }),
            /* @__PURE__ */ jsx(Field, { label: `Average month out, last ${BOOKS.months.length} statements`, children: /* @__PURE__ */ jsx("input", { className: inputClass, readOnly: true, value: Math.round(BOOKS.paidOut / BOOKS.months.length) }) })
          ] }),
          /* @__PURE__ */ jsxs("label", { className: "flex min-h-11 items-center gap-3 text-sm", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "checkbox",
                className: "size-4 accent-gold",
                checked: input.hasInvoices,
                onChange: (e) => set("hasInvoices", e.target.checked)
              }
            ),
            "We have unpaid invoices a lender could take"
          ] }),
          /* @__PURE__ */ jsx(Field, { label: "Who signs", children: /* @__PURE__ */ jsxs("select", { className: inputClass, value: input.applicant, onChange: (e) => set("applicant", e.target.value), children: [
            /* @__PURE__ */ jsx("option", { value: "james", children: PEOPLE.james.name }),
            /* @__PURE__ */ jsx("option", { value: "ryan", children: PEOPLE.ryan.name })
          ] }) }),
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-mute", children: [
            person.role,
            ". ",
            person.credit
          ] })
        ] }),
        /* @__PURE__ */ jsxs("section", { className: "rounded-xl border border-line bg-panel p-4 lg:col-span-3", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gold", children: shownMode === "apply" ? "Sprint ready" : "Hold" }),
          /* @__PURE__ */ jsx("h2", { className: "serif mt-1 text-3xl", children: priced.moved ? priced.headline : plan.headline }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 text-ivory", children: priced.moved ? priced.detail : plan.detail }),
          !priced.moved && /* @__PURE__ */ jsx("p", { className: "mt-2 text-mute", children: plan.whyCount }),
          /* @__PURE__ */ jsxs("label", { className: "mt-4 block", children: [
            /* @__PURE__ */ jsxs("span", { className: "mb-1 flex items-baseline justify-between text-sm text-mute", children: [
              /* @__PURE__ */ jsx("span", { children: "Chance of a yes" }),
              /* @__PURE__ */ jsxs("span", { className: "serif text-2xl text-ivory", children: [
                advice.chance === 0 ? 0 : target,
                "%"
              ] })
            ] }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "range",
                min: 5,
                max: 80,
                step: 1,
                value: advice.chance === 0 ? 5 : target,
                disabled: advice.chance === 0,
                className: "min-h-11 w-full accent-gold disabled:opacity-40",
                onChange: (e) => {
                  setAcceptance(Number(e.target.value));
                  setApproved(null);
                }
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "mt-1 block text-sm text-mute", children: advice.chance === 0 ? "The statements set this at zero. A slider cannot talk a lender past a returned direct debit." : "Move this and the price, the term and the monthly figure move with it. It does not make a lender exist." })
          ] }),
          advice.chance !== 0 && /* @__PURE__ */ jsxs("p", { className: "mt-2 text-sm text-mute", children: [
            "The file says ",
            anchor,
            "%. Drag onto another lender\u2019s real chance. A chance nobody offers cannot be bought.",
            " ",
            priced.moved && /* @__PURE__ */ jsx("button", { type: "button", className: "min-h-11 text-gold underline", onClick: () => setAcceptance(null), children: "Put it back" })
          ] }),
          advice.chance !== 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsxs("p", { className: `mt-3 text-sm ${priced.verdict === "bad" ? "text-bad" : priced.verdict === "expensive" ? "text-warn" : priced.verdict === "good" ? "text-good" : "text-ivory"}`, children: [
              priced.verdictLabel,
              priced.lenderName ? ` \xB7 ${priced.lenderName}` : "",
              priced.costOfCredit > 0 ? ` \xB7 cost about ${money(priced.costOfCredit)}` : ""
            ] }),
            /* @__PURE__ */ jsxs("dl", { className: "mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4", children: [
              /* @__PURE__ */ jsx(Stat, { label: "Rate", value: priced.rateLabel }),
              /* @__PURE__ */ jsx(Stat, { label: priced.payLabel, value: priced.repayment > 0 ? money(priced.repayment) : "\u2014" }),
              /* @__PURE__ */ jsx(
                Stat,
                {
                  label: "Risk to us",
                  value: `${priced.riskPct}%`,
                  tone: priced.riskPct >= 55 ? "bad" : priced.riskPct >= 35 ? "warn" : "good"
                }
              ),
              /* @__PURE__ */ jsx(Stat, { label: "They release", value: priced.released > 0 ? money(priced.released) : "\u2014" })
            ] }),
            priced.moved && /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm text-mute", children: priced.coverLabel }),
              /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-mute", children: priced.shapeLabel })
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "mt-1 text-sm text-mute", children: [
              "Search: ",
              priced.searchLabel,
              "."
            ] }),
            priced.factors.length > 0 && /* @__PURE__ */ jsx("ul", { className: "mt-3 space-y-1 text-sm", children: priced.factors.map((f) => /* @__PURE__ */ jsxs("li", { className: f.points < 0 ? "text-warn" : "text-ivory", children: [
              f.points > 0 ? "+" : "",
              f.points,
              " \xB7 ",
              f.label
            ] }, f.label)) }),
            /* @__PURE__ */ jsx("ul", { className: "mt-3 space-y-1", children: priced.flags.map((f) => /* @__PURE__ */ jsx("li", { className: struggle && f.includes("below zero") ? "text-bad" : "text-warn", children: f }, f)) })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: "mt-4 min-h-11 w-full rounded-lg bg-gold px-4 font-medium text-ink hover:opacity-90 disabled:opacity-50",
              onClick: approve,
              disabled: !ready,
              children: shownMode === "apply" ? "Run this sprint" : "Lock the hold"
            }
          ),
          approved && /* @__PURE__ */ jsxs("p", { className: "mt-3 text-sm text-good", children: [
            "Locked ",
            new Date(approved.at).toLocaleString("en-GB"),
            ". ",
            copied ? "Pack copied." : "Pack is below.",
            " Changing the ask clears it."
          ] })
        ] })
      ] }),
      plan.picks.length > 0 && /* @__PURE__ */ jsx("section", { className: "mt-4 grid gap-3 md:grid-cols-2", children: plan.picks.map((p) => /* @__PURE__ */ jsxs("article", { className: "rounded-xl border border-gold-dim bg-panel-2 p-4", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-gold", children: p.action === "hard-apply" ? "Send this one" : "Quote only" }),
        /* @__PURE__ */ jsx("h3", { className: "serif text-2xl", children: p.lender.name }),
        /* @__PURE__ */ jsx("p", { className: "text-mute", children: p.lender.rateLabel }),
        /* @__PURE__ */ jsxs("p", { className: "mt-2 text-sm", children: [
          p.verdict === "good" ? "Good loan" : "Acceptable",
          ". Yes about ",
          p.approvalPct,
          "%. Risk ",
          p.riskPct,
          "%. They release ",
          money(p.offered),
          ". Cost about ",
          money(p.costOfCredit),
          "."
        ] }),
        /* @__PURE__ */ jsx("ul", { className: "mt-2 list-disc pl-4 text-sm text-mute", children: p.reasons.slice(0, 3).map((r) => /* @__PURE__ */ jsx("li", { children: r }, r)) }),
        /* @__PURE__ */ jsx("a", { className: "mt-3 inline-flex min-h-11 items-center text-gold underline", href: p.lender.url, target: "_blank", rel: "noreferrer", children: "Open their site" })
      ] }, p.lender.id)) }),
      /* @__PURE__ */ jsxs("section", { className: "mt-6 rounded-xl border border-gold-dim bg-panel p-4", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-gold", children: advice.ready ? "Sprint decided" : "Not this month" }),
        /* @__PURE__ */ jsx("h2", { className: "serif text-2xl", children: "The pack" }),
        /* @__PURE__ */ jsxs("p", { className: "mt-2 text-ivory", children: [
          "The last HSBC statement, ",
          BOOKS.to,
          ", closed \xA342.98 overdrawn. Not this month."
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-3 overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-left text-sm", children: [
          /* @__PURE__ */ jsx("thead", { className: "text-mute", children: /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("th", { className: "py-1 pr-3 font-normal", children: "Statement" }),
            /* @__PURE__ */ jsx("th", { className: "py-1 pr-3 font-normal", children: "In" }),
            /* @__PURE__ */ jsx("th", { className: "py-1 pr-3 font-normal", children: "Out" }),
            /* @__PURE__ */ jsx("th", { className: "py-1 font-normal", children: "Closed" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { children: BOOKS.months.map((m) => /* @__PURE__ */ jsxs("tr", { className: "border-t border-line", children: [
            /* @__PURE__ */ jsx("td", { className: "py-1 pr-3", children: m.period }),
            /* @__PURE__ */ jsx("td", { className: "py-1 pr-3", children: money(m.inn) }),
            /* @__PURE__ */ jsx("td", { className: "py-1 pr-3", children: money(m.out) }),
            /* @__PURE__ */ jsx("td", { className: "py-1", children: money(m.close) })
          ] }, m.period)) })
        ] }) }),
        /* @__PURE__ */ jsxs("p", { className: "mt-2 text-ivory", children: [
          advice.amount > 0 ? `Type ${money(advice.amount)}.` : "Type nothing. Do not apply.",
          " ",
          advice.outcome
        ] }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-mute", children: advice.amountWhy }),
        /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm text-ivory", children: advice.say }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-warn", children: advice.doNotSay }),
        /* @__PURE__ */ jsxs("div", { className: "mt-4", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm text-mute", children: "From the mailbox" }),
          /* @__PURE__ */ jsx("ul", { className: "mt-1 space-y-1 text-sm", children: MAIL_HITS.map((h) => /* @__PURE__ */ jsxs("li", { children: [
            h.name,
            " \xB7 ",
            h.when,
            " \xB7 ",
            h.attach ? "Attach" : "Do not attach"
          ] }, h.id)) })
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "mt-4 block", children: [
          /* @__PURE__ */ jsx("span", { className: "mb-1 block text-sm text-mute", children: "Drop a file from the laptop or OneDrive" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "file",
              multiple: true,
              className: "block min-h-11 w-full text-sm file:mr-3 file:min-h-11 file:rounded-lg file:border-0 file:bg-gold file:px-3 file:text-ink",
              onChange: (e) => onFiles(e.target.files)
            }
          )
        ] }),
        files.length > 0 && /* @__PURE__ */ jsx("ul", { className: "mt-2 text-sm text-mute", children: files.map((f) => /* @__PURE__ */ jsxs("li", { children: [
          f,
          " \xB7 ",
          classifyFile(f) === "memo" ? "Do not attach" : "Noted"
        ] }, f)) }),
        /* @__PURE__ */ jsx("ul", { className: "mt-3 space-y-1 text-sm text-warn", children: advice.gaps.map((g) => /* @__PURE__ */ jsx("li", { children: g }, g)) })
      ] }),
      /* @__PURE__ */ jsxs("section", { className: "mt-6", children: [
        /* @__PURE__ */ jsx("h2", { className: "serif text-2xl", children: "Twelve months" }),
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-mute", children: [
          shownMode === "apply" ? "With the repayment on." : "As priced. No draw if we are holding.",
          " Gold is fine, amber is tight, red is under zero."
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6 lg:grid-cols-12", children: priced.months.map((m) => /* @__PURE__ */ jsxs(
          "div",
          {
            className: `rounded-lg border p-2 ${m.flag === "struggle" ? "border-bad bg-panel" : m.flag === "tight" ? "border-warn bg-panel" : "border-line bg-panel"}`,
            children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm text-mute", children: m.label }),
              /* @__PURE__ */ jsx("p", { className: `font-medium ${m.flag === "struggle" ? "text-bad" : m.flag === "tight" ? "text-warn" : "text-ivory"}`, children: money(m.close) })
            ]
          },
          m.label
        )) })
      ] }),
      /* @__PURE__ */ jsxs("section", { className: "mt-6 grid gap-4 lg:grid-cols-2", children: [
        /* @__PURE__ */ jsxs("article", { className: "rounded-xl border border-line bg-panel p-4", children: [
          /* @__PURE__ */ jsx("h2", { className: "serif text-2xl", children: "Company" }),
          /* @__PURE__ */ jsx("p", { className: "mt-2", children: COMPANY.legal }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-mute", children: COMPANY.office }),
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-mute", children: [
            "Incorporated ",
            COMPANY.incorporated,
            ". ",
            COMPANY.sic,
            "."
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4 grid gap-3 sm:grid-cols-2", children: [
            /* @__PURE__ */ jsxs("article", { className: "rounded-lg border border-line p-3", children: [
              /* @__PURE__ */ jsx("h3", { className: "font-medium", children: PEOPLE.james.name }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-mute", children: PEOPLE.james.detail })
            ] }),
            /* @__PURE__ */ jsxs("article", { className: "rounded-lg border border-line p-3", children: [
              /* @__PURE__ */ jsx("h3", { className: "font-medium", children: PEOPLE.ryan.name }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-mute", children: PEOPLE.ryan.detail })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("article", { className: "rounded-xl border border-line bg-panel p-4", children: [
          /* @__PURE__ */ jsx("h2", { className: "serif text-2xl", children: "Papers" }),
          /* @__PURE__ */ jsx("ul", { className: "mt-2 divide-y divide-line", children: docs.map((d) => /* @__PURE__ */ jsxs("li", { className: "flex items-center justify-between gap-3 py-2", children: [
            /* @__PURE__ */ jsxs("span", { children: [
              /* @__PURE__ */ jsx("span", { className: "block", children: d.label }),
              /* @__PURE__ */ jsx("span", { className: "block text-sm text-mute", children: d.note })
            ] }),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                className: `min-h-11 shrink-0 rounded-lg border px-3 text-sm ${d.state === "laptop" ? "border-good text-good" : "border-line text-mute"}`,
                onClick: () => setDocs(
                  (prev) => prev.map(
                    (x) => x.id === d.id ? { ...x, state: x.state === "laptop" ? "missing" : "laptop" } : x
                  )
                ),
                children: d.state === "laptop" ? "On the laptop" : "Missing"
              }
            )
          ] }, d.id)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("section", { className: "mt-6", children: [
        /* @__PURE__ */ jsx("button", { type: "button", className: "min-h-11 text-gold underline", onClick: () => setShowMarket((v) => !v), children: showMarket ? "Hide the market book" : "Show who we will not apply to" }),
        showMarket && /* @__PURE__ */ jsxs("div", { className: "mt-3 grid gap-2", children: [
          /* @__PURE__ */ jsxs("article", { className: "rounded-lg border border-line bg-panel px-3 py-3", children: [
            /* @__PURE__ */ jsx("h3", { className: "font-medium", children: "How the book decides" }),
            /* @__PURE__ */ jsx("ul", { className: "mt-2 list-disc space-y-1 pl-4 text-sm text-mute", children: HOUSE_RULES.map((rule) => /* @__PURE__ */ jsx("li", { children: rule }, rule)) })
          ] }),
          LENDERS.map((l) => {
            const ex = plan.excluded.find((e) => e.name === l.name);
            const inSprint = plan.picks.some((p) => p.lender.id === l.id);
            return /* @__PURE__ */ jsxs("article", { className: "rounded-lg border border-line bg-panel px-3 py-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-baseline justify-between gap-2", children: [
                /* @__PURE__ */ jsx("h3", { className: "font-medium", children: l.name }),
                /* @__PURE__ */ jsx("span", { className: l.stance === "bad" ? "text-bad" : l.stance === "good" ? "text-good" : "text-warn", children: inSprint ? "In this sprint" : l.stance === "good" ? "Good door" : l.stance === "bad" ? "Bad door" : l.stance === "later" ? "Later" : "Watch the price" })
              ] }),
              /* @__PURE__ */ jsxs("p", { className: "text-sm text-mute", children: [
                l.rateLabel,
                ". ",
                l.bestFor
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-sm", children: ex?.why ?? (inSprint ? "Selected." : l.goodIf) })
            ] }, l.id);
          })
        ] })
      ] }),
      approved && /* @__PURE__ */ jsxs("section", { className: "mt-6 rounded-xl border border-line bg-panel p-4", children: [
        /* @__PURE__ */ jsx("h2", { className: "serif text-2xl", children: "Sprint pack" }),
        /* @__PURE__ */ jsx("pre", { className: "mt-3 overflow-x-auto whitespace-pre-wrap text-sm text-ivory", children: approved.text })
      ] })
    ] })
  ] });
}
function Stat({ label, value, tone = "plain" }) {
  const color = tone === "bad" ? "text-bad" : tone === "warn" ? "text-warn" : tone === "good" ? "text-good" : "text-ivory";
  return /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-line px-3 py-2", children: [
    /* @__PURE__ */ jsx("dt", { className: "text-sm text-mute", children: label }),
    /* @__PURE__ */ jsx("dd", { className: `serif text-2xl ${color}`, children: value })
  ] });
}
export {
  Desk
};
