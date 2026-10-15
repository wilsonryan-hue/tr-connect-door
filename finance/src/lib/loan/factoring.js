const INVOICE_LINES = [
  "COPELAND LIMITED",
  "Company number NI030547",
  "Ballyreagh Industrial Estate",
  "Sandholes Road",
  "Cookstown",
  "Co Tyrone",
  "BT80 9DG"
];
const FACTORING_AS_OF = "14 October 2026";
const COPELAND = [
  {
    name: "COPELAND LIMITED",
    number: "NI030547",
    office: "Ballyreagh Industrial Estate, Sandholes Road, Cookstown, Co Tyrone, BT80 9DG",
    note: "The Northern Ireland factory. Active. Makes compressors. Accounts made up to 30 September 2025."
  },
  {
    name: "COPELAND CLIMATE TECHNOLOGIES LIMITED",
    number: "01741737",
    office: "Office 109-110, Regus, 3 More London Riverside, London, SE1 2RE",
    note: "The England company. Formerly Emerson Climate Technologies Limited. A sales agent, not the factory."
  }
];
const DOORS = [
  {
    id: "ledger",
    name: "Whole-ledger factoring",
    kind: "They take the sales ledger, tell the customers, and collect.",
    verdict: "do-not-send",
    timing: "Not this month.",
    why: "Wrong product, not proof that an invoice cannot be funded. A whole-ledger factor underwrites Treun Roc. The overdraft and the returned Capital on Tap debits fail that test. They also want a spread of debtors and a contract you keep paying for in quiet months. Do not sign one."
  },
  {
    id: "discount",
    name: "Confidential invoice discounting",
    kind: "Same idea, the customers are not told. For a larger, older file.",
    verdict: "do-not-send",
    timing: "Not this company.",
    why: "No accounts are filed. First accounts are due 14 May 2027. Discounting is a worse fit than factoring, not a way round it."
  },
  {
    id: "spot-canada",
    name: "Single invoice, as addressed to Canada",
    kind: "One invoice, one debtor, usually with recourse.",
    verdict: "not-this-invoice",
    timing: "A UK funder will not score a Canadian bill-to.",
    why: "The debtor is the company named on the invoice, not the site. A street in Cookstown, with a Canadian company still named at the top, is still a Canadian debt. Do not send that version."
  },
  {
    id: "spot-uk",
    name: "Spot factoring \u2014 one invoice to Copeland Limited",
    kind: "Disclosed. They collect from Copeland. The facility ends when that invoice is paid. No whole-ledger contract.",
    verdict: "do-not-send",
    timing: "This is the product. Not sent until Copeland confirms the debt in writing.",
    why: "The funder is buying Copeland Limited\u2019s promise to pay, not Treun Roc\u2019s bank balance. Published deals of this type advance about 70% to 90% of one approved invoice and last for that invoice only. Construction is fundable when the invoice is for finished work, with no retention and no pay-less notice. It is not fundable as a valuation, a Canadian bill-to, or an address with the wrong company name. The returned debits must be shown, not hidden. If they want a guarantee, it stays limited to this invoice. If Copeland does not pay, or disputes the work, Treun Roc repays the advance. Non-recourse cover does not insure a dispute."
  },
  {
    id: "ukef",
    name: "UK Export Finance",
    kind: "A guarantee to a lender. Not factoring, and not cash.",
    verdict: "do-not-send",
    timing: "Only if Canada is truly the buyer. Still not this month.",
    why: "The Export Working Capital Scheme can cover up to 80% of a lender\u2019s loss on a facility for a contract with a business outside the UK. The lender still has to say yes. This lender will not, on these statements. If the buyer is the Cookstown company, it is not an export at all."
  },
  {
    id: "buyer",
    name: "Ask Copeland to pay",
    kind: "Not a funder. The debtor pays early, or confirms which company owes the money.",
    verdict: "phone-the-debtor",
    timing: "The fastest of the three.",
    why: "Phone the accounts office that placed the order. Ask which legal entity pays, and ask them to pay the invoice that is already due. If they run a supplier early-payment scheme, that uses their credit, not Treun Roc\u2019s. No search on James."
  }
];
const APPROVAL = {
  before: 0,
  pack: 30,
  panel: 10
};
const WHO = {
  name: "Select Invoice Finance",
  legal: "SIF (SOUTH) LIMITED",
  number: "13591630",
  office: "27 Old Gloucester Street, London, WC1N 3AX",
  range: "Published facilities \xA325,000 to \xA3250,000, advance up to about 80% of one approved invoice.",
  why: "Their published product is chosen invoices, judged on the customer. Bibby takes construction, but Bibby wants the whole ledger. An online panel reads the bank feed and declines."
};
const STRUCTURE = [
  "Invoice addressed to COPELAND LIMITED, NI030547, Cookstown. Not the Canadian company. Not the street on its own.",
  "Their purchase order on the invoice. Work finished and accepted. No retention. No pay-less notice.",
  "An email from Copeland\u2019s accounts that names the invoice, the amount, and the date they will pay.",
  "One disclosed spot facility. They collect from Copeland. It ends when the invoice is paid.",
  "No whole-ledger contract, no monthly minimum, no all-monies guarantee. A guarantee, if they insist, is limited to this invoice.",
  "The bank statements go in the pack. Hiding the returned debits is a default, not a tactic."
];
function factoringText() {
  return [
    "TREUN ROC CONTRACTS LTD \u2014 FACTORING DECISION",
    `Checked ${FACTORING_AS_OF}.`,
    "Not submitted. One product only: disclosed spot factoring of a single Copeland Limited invoice.",
    `Chance: ${APPROVAL.before}% until Copeland confirms the debt in writing. About ${APPROVAL.pack}% once the email, the order and the finished work are in the pack, at one manual funder. About ${APPROVAL.panel}% at an online panel. This is the desk\u2019s judgment, not a funder\u2019s score.`,
    `One call: ${WHO.name}, ${WHO.legal}, ${WHO.number}. ${WHO.range}`,
    "",
    "THE INVOICE EXPECTED 15 OCTOBER 2026",
    "They have agreed to use the Northern Ireland address. The invoice must name the company, not only the street.",
    ...INVOICE_LINES,
    "Also required: their purchase order, the work finished and accepted, and no retention. A pay-less notice means the debt is not clean.",
    "",
    "HOW A YES IS STRUCTURED",
    ...STRUCTURE,
    "",
    "UK COMPANIES WITH THIS NAME",
    ...COPELAND.flatMap((c) => [`${c.name}, ${c.number}`, c.office, c.note, ""]),
    "DOORS",
    ...DOORS.flatMap((d) => [d.name.toUpperCase(), d.kind, d.timing, d.why, ""]),
    "DO NOT",
    "Do not send the Copeland Master sheet. That is not a sales ledger.",
    "Do not put the Cookstown street under a Canadian company name.",
    "Do not sign a whole-ledger contract to fund one invoice.",
    "Do not hide the bank statements.",
    "Do not apply to a panel. One funder, after Copeland has confirmed the debt."
  ].join("\n");
}
export {
  APPROVAL,
  COPELAND,
  DOORS,
  FACTORING_AS_OF,
  INVOICE_LINES,
  STRUCTURE,
  WHO,
  factoringText
};
