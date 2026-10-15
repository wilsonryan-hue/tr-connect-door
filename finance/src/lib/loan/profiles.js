const DEFAULT_DOCS = [
  { id: "passport-james", label: "James Alexander Lindsay \u2014 passport", state: "laptop", note: "Seen. British passport, in date until 4 December 2028. The number is not stored in this desk." },
  { id: "passport-ryan", label: "Ryan Wilson \u2014 passport", state: "missing", note: "Only needed if Ryan is the applicant." },
  { id: "plan", label: "Business plan", state: "laptop", note: "On the laptop." },
  { id: "figures", label: "Management figures", state: "laptop", note: "No Companies House accounts yet. First period ends 31 Aug 2026, due 14 May 2027." },
  { id: "forecast", label: "Forecast", state: "laptop", note: "On the laptop. This desk also runs its own 12-month look." },
  { id: "banks", label: "HSBC statements, 4 Mar to 3 Oct 2026", state: "laptop", note: "Seven statements read. Closed \xA342.98 overdrawn on 3 October. Direct debits returned." },
  { id: "insurance", label: "Public liability and professional indemnity", state: "laptop", note: "About \xA31m cover on the company file. Suited Insurance is on the statements." },
  { id: "orders", label: "Order book / live jobs", state: "missing", note: "Playgolf, Smith Brewer and Edge of World are on the bank. The order book itself is not." },
  { id: "letterhead", label: "Letterhead", state: "laptop", note: "Seen. Jim Lindsay is styled Owner. On a lender form he is the director." },
  { id: "address", label: "Proof of address", state: "missing", note: "British Gas bill is dated 17 June 2026, in James\u2019s name at 5 Mulberry Close. Too old to attach. Lords want one under three months." }
];
const COMPANY = {
  legal: "TREUN ROC CONTRACTS LTD",
  number: "16649937",
  incorporated: "14 August 2025",
  office: "5 Mulberry Close, Watford, England, WD17 4UZ",
  sic: "Commercial and domestic construction, other installation, painting",
  email: "enquiries@treunroccontracts.com",
  phone: "0333 090 9073",
  vat: "515175406"
};
const PEOPLE = {
  james: {
    id: "james",
    name: "James Alexander Lindsay",
    role: "Director and person with significant control",
    detail: "On the public register since incorporation. Born 8 August 1956 in Harrow. British citizen. Owns 75% or more. Passport in date until 4 December 2028.",
    credit: "No adverse marker stored. Treated as unknown, not as a default."
  },
  ryan: {
    id: "ryan",
    name: "Ryan Wilson",
    role: "Operator \u2014 contracts and the desk",
    detail: "Harlow. Not the Companies House director on the current register.",
    credit: "IVA default around June 2026. Do not put this file on a personal loan."
  }
};
export {
  COMPANY,
  DEFAULT_DOCS,
  PEOPLE
};
