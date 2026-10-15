import { BOOKS, FACILITIES, REOPEN, statementsBlock } from "./books.js";
const MAIL_HITS = [
  {
    id: "memo",
    name: "TR Loan Doc v2.docx",
    when: "13 Oct 2026",
    from: "Ryan Wilson to Kacey Lindsay",
    note: "Private investor memo. \xA340,000, 14% flat or 8% plus shares. It says it is not a banking submission. Do not attach it to a lender.",
    attach: false
  }
];
const MEMO_NEED = 4e4;
const SCHEME_CAP = 25e3;
function gbp2(n) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(n);
}
function gbp(n) {
  return `\xA3${Math.abs(Math.round(n)).toLocaleString("en-GB")}`;
}
const GAPS = [
  "The October statement is in. It closed \xA342.98 overdrawn. Capital on Tap\u2019s \xA33,510.69 direct debit was returned three times. Travelodge\u2019s \xA3432.73 was returned twice.",
  "A purchase order does not replace that. An order is not an invoice, and it is not cash left in the account."
];
function blockedAdvice() {
  return {
    amount: 0,
    amountWhy: `The HSBC account closed \xA342.98 overdrawn on ${BOOKS.to}. Over the seven statements it took in ${gbp2(BOOKS.paidIn)} and paid out ${gbp2(BOOKS.paidOut)}. It opened the period at ${gbp2(BOOKS.open)}. In September the bank returned the Capital on Tap and Travelodge direct debits. Applying would put a search on James and still not pay out.`,
    say: "Do not put a purpose on a form this month.",
    doNotSay: "Do not send the Copeland Master sheet (the \xA324 million one, with the Americas line). Do not send the private investor memo. Do not send the \xA33.81 million 2027 plan as turnover. Do not describe the account as having \xA318,000 in it. Do not call Ryan the director. Companies House lists James. The company website currently says Ryan Wilson.",
    outcome: `Predicted outcome: decline. Not a close call. The account is \xA342.98 overdrawn and the bank is already returning the existing lenders. ${FACILITIES[0]} ${FACILITIES[1]} About \xA3104,000 went to Ryan Wilson, about \xA3101,000 to Kacey Lindsay and about \xA325,000 to Ryan2 across the seven statements. A purchase order does not change this.`,
    chance: 0,
    ready: false,
    gaps: GAPS
  };
}
function purposeLine(purpose, hold) {
  if (hold && purpose === "tax") {
    return {
      say: "Do not put a purpose on a form. Ask HMRC for time to pay.",
      doNotSay: "Do not call tax arrears materials, wages or growth."
    };
  }
  if (purpose === "plant") {
    return {
      say: "Purchase of plant for contracted fit-out and installation. The kit is the security. The company borrows, not the director.",
      doNotSay: "Do not call it cash flow, tax, or a director\u2019s drawing."
    };
  }
  if (purpose === "wages") {
    return {
      say: "Payroll on contracted fit-out and installation jobs, for the weeks between doing the work and the client paying.",
      doNotSay: "Do not call it a director\u2019s drawing, and do not attach the private investor memo."
    };
  }
  return {
    say: "Working capital to mobilise contracted fit-out and installation: materials, labour and travel, for the gap before the client pays. Jobs already named in the company\u2019s papers include Iford Golf Centre, Weird Fish and the Delta Hotels Manchester Airport Verdant work.",
    doNotSay: "Do not mention equity, a 14% investor return, or the \xA33.81m 2027 plan. That plan is not contracted turnover. Do not attach TR Loan Doc v2."
  };
}
function advise(input, plan) {
  if (statementsBlock()) return blockedAdvice();
  const live = plan.picks[0];
  const line = purposeLine(input.purpose, plan.mode === "hold");
  const gaps = [...GAPS];
  if (input.applicant === "ryan") gaps.unshift("Ryan\u2019s IVA default is on the file. James has to be the name on the form.");
  if (plan.mode !== "apply" || !live) {
    return {
      amount: 0,
      amountWhy: plan.detail,
      say: line.say,
      doNotSay: line.doNotSay,
      outcome: "Predicted outcome: no application. A decline is not the risk. Applying is.",
      chance: 0,
      ready: false,
      gaps
    };
  }
  let amount = live.offered;
  let amountWhy = `${live.lender.name} is the door. They would look at ${gbp(live.offered)}.`;
  if (live.lender.id === "startup") {
    amount = Math.min(SCHEME_CAP, Math.max(input.amount, Math.min(MEMO_NEED, SCHEME_CAP)));
    amount = Math.min(SCHEME_CAP, Math.max(amount, 500));
    amountWhy = `The October memo asks a private investor for ${gbp(MEMO_NEED)}. The scheme stops at ${gbp(SCHEME_CAP)}, so that is the number on the form. Their Option A is 14% flat, about 24% a year once the payment holiday is counted, and it costs ${gbp(5600)} in a year. The scheme is 7.5% on a reducing balance. Take the scheme for the first ${gbp(SCHEME_CAP)}. Do not run the private loan in the same month.`;
  } else if (live.lender.id === "iwoca") {
    amount = Math.min(live.offered, Math.max(input.oneOff, 1e3));
    amountWhy = `This is a 30-day bridge for the bill in front of us, ${gbp(amount)}, not a ${gbp(MEMO_NEED)} term loan. Clear it when the client pays.`;
  } else if (live.lender.id === "asset") {
    amount = input.amount;
    amountWhy = `Ask for the plant cost, ${gbp(amount)}. The kit secures it.`;
  } else if (live.lender.id === "invoice") {
    amount = live.offered;
    amountWhy = `Ask for ${gbp(amount)}. Fit-out invoices are advanced at about 70%, and retention is left out.`;
  }
  const shape = plan.book.find((s) => s.lender.id === live.lender.id)?.shapeLabel ?? "";
  const decline = live.approvalPct < 50;
  const outcome = decline ? `More likely a no. ${100 - live.approvalPct} out of 100 files like this are declined. If it is a yes, expect ${gbp(amount)} from ${live.lender.name}. ${shape}` : `More likely a yes. Expect ${gbp(amount)} from ${live.lender.name}. ${shape}`;
  return {
    amount,
    amountWhy,
    say: line.say,
    doNotSay: line.doNotSay,
    outcome,
    chance: live.approvalPct,
    ready: input.applicant === "james" || live.lender.id === "invoice",
    gaps: gaps.filter((g) => !g.startsWith("Ryan") || input.applicant === "ryan")
  };
}
function classifyFile(name) {
  const n = name.toLowerCase();
  if (n.includes("passport") || n.includes("licence") || n.includes("license")) return "passport";
  if (n.includes("loan doc") || n.includes("investor") || n.includes("memorandum") || n.includes("master") || n.includes("forecast") || n.includes("forcast")) return "memo";
  if (n.includes("statement") || n.includes("bank")) return "statements";
  if (n.includes("order") || n.includes("pipeline") || n.includes("valuation")) return "orders";
  if (n.includes("insurance") || n.includes("policy") || n.includes("liability")) return "insurance";
  if (n.includes("plan") || n.includes("account")) return "plan";
  return "other";
}
function buildDataPack(input, plan, files) {
  const advice = advise(input, plan);
  const person = input.applicant === "james" ? "James Alexander Lindsay" : "Ryan Wilson";
  const lines = [
    "TREUN ROC CONTRACTS LTD \u2014 application pack",
    "Prepared by the loan desk. One lender. One search.",
    "",
    "COMPANY",
    "Legal name: TREUN ROC CONTRACTS LTD",
    "Number: 16649937",
    "Incorporated: 14 August 2025",
    "Office: 5 Mulberry Close, Watford, England, WD17 4UZ",
    "SIC: 41201, 41202, 43290, 43341",
    "Email: enquiries@treunroccontracts.com",
    "Phone: 0333 090 9073",
    "VAT: 515175406",
    "James: born 8 August 1956, Harrow. British citizen. Passport seen and in date until 4 December 2028. The passport number is not written here.",
    "On the letterhead he is styled Owner. On a lender form he is the director.",
    "Work: commercial fit-out, refurbishment, and specialist installation.",
    "Named jobs in the company\u2019s own papers: Iford Golf Centre, Weird Fish, Joe Browns, Delta Hotels Manchester Airport (Verdant).",
    "",
    "WHO SIGNS",
    person,
    input.applicant === "james" ? advice.amount > 0 ? "Director and person with significant control. 75% or more. British. Born August 1956. The scheme loan is in his name." : "Director and person with significant control. 75% or more. British. Born August 1956. He does not sign anything this month." : "Do not sign. IVA default around June 2026.",
    "",
    "AMOUNT TO TYPE",
    advice.amount > 0 ? gbp(advice.amount) : "Nothing. Do not apply.",
    advice.amountWhy,
    "",
    "PURPOSE \u2014 USE THIS SENTENCE",
    advice.say,
    "",
    "DO NOT SAY",
    advice.doNotSay,
    "",
    "NUMBERS A LENDER WILL USE",
    `${BOOKS.bank}, sort code ${BOOKS.sort}, account ${BOOKS.account}.`,
    `Statements from ${BOOKS.from} to ${BOOKS.to}. October is not in the pack.`,
    ...BOOKS.months.map((m) => `${m.period}: in ${gbp2(m.inn)}, out ${gbp2(m.out)}, closed ${gbp2(m.close)}.`),
    `Six months in ${gbp2(BOOKS.paidIn)}. Six months out ${gbp2(BOOKS.paidOut)}. Opened ${gbp2(BOOKS.open)}. Closed ${gbp2(BOOKS.close)}.`,
    "About \xA395,000 went to Ryan Wilson, about \xA398,000 to Kacey Lindsay, and about \xA325,000 to Ryan2. About half of the money that left.",
    "Customer receipts on these statements include about \xA3165,000 from Playgolf Management, about \xA3108,000 from Edge of World, and about \xA354,000 from Smith Brewer.",
    "Capital on Tap is already lending to this account. About \xA330,000 was drawn in the May statement and \xA38,000 in the June statement. Three Capital on Tap payments of \xA33,073.67 reversed in June. Direct debits of \xA34,016.36 and \xA33,754.78 then left.",
    ...FACILITIES.slice(1),
    "British Gas bills James Lindsay at 5 Mulberry Close. The bill on file is dated 17 June 2026 and shows \xA349.94 debit. It is too old to attach as proof of address.",
    "Copeland Forecast Oct26 shows about \xA380,400 of Treun Roc sales in October and about \xA336,000 of margin. The bank did not keep a margin like that.",
    "The Copeland Master sheet shows about \xA324 million over 15 months, including an Americas line of \xA312.5 million. It is not turnover.",
    "The October memo\u2019s debtors of \xA378,615 are a timing note, not extra turnover.",
    "First accounts are not due until 14 May 2027.",
    "",
    "PREDICTED OUTCOME",
    advice.outcome,
    plan.headline,
    plan.detail,
    "",
    "WHERE",
    ...advice.amount > 0 && plan.picks[0] ? [
      `${plan.picks[0].lender.name}`,
      plan.picks[0].lender.url,
      plan.picks[0].action === "hard-apply" ? "Create the account in James\u2019s name, paste this pack, attach the files below, submit once." : "Get the quote. Do not accept it inside this sprint unless the price on the screen matches this pack."
    ] : ["Nowhere. Not this month."],
    "",
    "FROM THE MAILBOX (14 Oct 2026)",
    ...MAIL_HITS.map((h) => `${h.when} \u2014 ${h.name} \u2014 ${h.from}. ${h.note}`),
    "",
    "FILES",
    ...files.length ? files.map((f) => `Added from this computer: ${f} \u2014 ${classifyFile(f) === "memo" ? "do not attach" : "can attach"}`) : ["Nothing dropped in yet."],
    "The seven HSBC statements are already read, through 3 October 2026. The second copy of the August\u2013September statement is the same sheet, not a new month.",
    "Do not attach: the Copeland Master sheet, or the private investor memo.",
    "",
    "WHAT WOULD REOPEN THIS",
    ...REOPEN,
    "",
    "FORM",
    "Business: TREUN ROC CONTRACTS LTD, 16649937.",
    `Applicant: ${person}.`,
    `Amount: ${advice.amount > 0 ? gbp(advice.amount) : "\u2014"}.`,
    `Purpose: ${advice.say}`,
    "Term: 5 years if it is the scheme. 30 days if it is the flexi line. The term of the asset if it is plant.",
    "Security: none offered on the scheme. The plant secures an asset line. A guarantee is normal on a flexi line and James is the one who can sign it.",
    "",
    "GAPS BEFORE ANYONE PRESSES SUBMIT",
    ...advice.gaps
  ];
  return lines.join("\n");
}
export {
  MAIL_HITS,
  advise,
  buildDataPack,
  classifyFile
};
