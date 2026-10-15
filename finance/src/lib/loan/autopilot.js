import { BOOKS, FACILITIES, REOPEN, statementsBlock } from "./books.js";
import { DOORS } from "./factoring.js";
import { SCHEMES, schemesToSend } from "./grants.js";
import { LENDERS } from "./market.js";
import { COMPANY, PEOPLE } from "./profiles.js";
function money(n) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(n);
}
function runFile() {
  const blocked = statementsBlock();
  const toSend = schemesToSend();
  const steps = [
    {
      action: "Read the company",
      result: `${COMPANY.legal}, ${COMPANY.number}. Director ${PEOPLE.james.name}. VAT ${COMPANY.vat}.`
    },
    {
      action: "Read the bank",
      result: `${BOOKS.bank} ${BOOKS.sort} ${BOOKS.account}. ${BOOKS.months.length} statements to ${BOOKS.to}. Closed ${money(BOOKS.close)}.`
    },
    {
      action: "Read existing credit",
      result: "Capital on Tap and Travelodge direct debits were returned on the last statement. Lords guarantee is already signed. No charge is registered at Companies House."
    },
    {
      action: "Fill a lender application",
      result: blocked ? `${LENDERS.length} lenders filled. None sent. A search on James would not be repaid.` : `${LENDERS.length} lenders filled.`
    },
    {
      action: "Fill a grant application",
      result: `${SCHEMES.length} schemes filled. ${toSend.length} are eligible to send.`
    },
    {
      action: "Fill a factoring application",
      result: "Whole ledger is the wrong product. Spot factoring of one Copeland Limited invoice is the product. Not sent until their accounts confirm the debt in writing."
    },
    {
      action: "Submit",
      result: blocked || toSend.length === 0 ? "Not submitted. The file stops itself." : "Ready for one send."
    }
  ];
  return { blocked, steps, application: applicationText() };
}
function applicationText() {
  const close = BOOKS.close < 0 ? `${money(Math.abs(BOOKS.close))} overdrawn` : money(BOOKS.close);
  return [
    "TREUN ROC CONTRACTS LTD",
    "APPLICATION \u2014 FILLED BY THE DESK, NOT SUBMITTED",
    "",
    "STATUS",
    "Do not submit. The account cannot service a new repayment, and no open grant pays this company in the next four weeks.",
    "",
    "1. BUSINESS",
    `Legal name: ${COMPANY.legal}`,
    `Number: ${COMPANY.number}`,
    `Incorporated: ${COMPANY.incorporated}`,
    `Registered office: ${COMPANY.office}`,
    `SIC: ${COMPANY.sic}`,
    `VAT: ${COMPANY.vat}`,
    `Phone: ${COMPANY.phone}`,
    `Email: ${COMPANY.email}`,
    "Trading: construction, fit-out, installation, painting.",
    "Website: the public site currently names Ryan Wilson as director. The register does not. Any form uses the register.",
    "",
    "2. DIRECTOR \u2014 THE ONLY APPLICANT",
    `Name: ${PEOPLE.james.name}`,
    "Role: director and person with significant control. 75% or more.",
    "Born: 8 August 1956, Harrow. British citizen.",
    "Passport: seen, in date until 4 December 2028. The number is not stored here. He attaches the photo himself if a form asks.",
    "Address on the British Gas bill: 5 Mulberry Close, Watford, WD17 4UZ. That bill is dated 17 June 2026 and is too old to attach.",
    "Personal credit: no marker is stored. Unknown is not the same as clean.",
    "",
    "NOT AN APPLICANT",
    `${PEOPLE.ryan.name}. ${PEOPLE.ryan.role}. ${PEOPLE.ryan.credit}`,
    "",
    "3. BANK",
    `${BOOKS.bank}, sort ${BOOKS.sort}, account ${BOOKS.account}.`,
    `Opened the period at ${money(BOOKS.open)} on ${BOOKS.from}.`,
    `Paid in ${money(BOOKS.paidIn)}. Paid out ${money(BOOKS.paidOut)}.`,
    `Closed ${close} on ${BOOKS.to}.`,
    "Paid-in is not turnover. It includes direct debits that were returned and reversed.",
    ...BOOKS.months.map((m) => `${m.period}: in ${money(m.inn)}, out ${money(m.out)}, closed ${money(m.close)}.`),
    "",
    "4. CREDIT ALREADY IN PLACE",
    ...FACILITIES.map((f) => f),
    "",
    "5. THE ASK",
    "Amount applied for: none.",
    "Purpose: none. Do not write working capital, growth, or materials on a form this month.",
    "Security offered: none.",
    "Personal guarantee offered: none. James has already signed one for Lords, at \xA35,000.",
    "",
    "6. LENDERS \u2014 FILLED, NOT SENT",
    ...LENDERS.map(
      (l) => `${l.name} (${l.rateLabel}). ${l.badIf} Not sent, because the account is overdrawn and existing direct debits are being returned. ${l.url}`
    ),
    "",
    "7. FACTORING",
    ...DOORS.map((d) => `${d.name}. ${d.timing} ${d.why}`),
    "",
    "8. GRANTS AND GOVERNMENT SCHEMES \u2014 FILLED, NOT SENT",
    ...SCHEMES.map((s) => `${s.name}. ${s.kind} ${s.why} ${s.url}`),
    "",
    "9. WHAT WOULD MAKE THE DESK SUBMIT",
    ...REOPEN.map((r) => r),
    "",
    "10. WHAT A PERSON STILL HAS TO DO",
    "Ask the client who owes the coming money to pay now, or to pay a deposit if the work has not been done. This desk does not have the invoice.",
    "Do not sign the private memo at 14% flat to cover four weeks. On \xA340,000 that charge is \xA35,600.",
    "If VAT, CIS or PAYE is due before that money lands, James calls HMRC on 0300 200 3835.",
    "Correct the website so it names James as director.",
    "",
    "The desk cannot log into a bank, a lender, or a government gateway. It fills this file and it stops."
  ].join("\n");
}
export {
  runFile
};
