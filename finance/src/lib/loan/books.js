const BOOKS = {
  bank: "HSBC UK",
  sort: "40-45-27",
  account: "72374331",
  from: "4 March 2026",
  to: "3 October 2026",
  open: 50071.44,
  close: -42.98,
  paidIn: 411507.49,
  paidOut: 461621.91,
  /** Named payments on the statements. The pack says "about" because the earlier six were parsed, not keyed. October is keyed. */
  ryan: 103766,
  kacey: 100868,
  ryan2: 25458,
  months: [
    { period: "4 Mar \u2013 3 Apr", inn: 59424.14, out: 100797.87, close: 8697.71 },
    { period: "4 Apr \u2013 3 May", inn: 52081.6, out: 57179.76, close: 3599.55 },
    { period: "4 May \u2013 3 Jun", inn: 35875.45, out: 38228.18, close: 1246.82 },
    { period: "4 Jun \u2013 3 Jul", inn: 39384.06, out: 39899.21, close: 731.67 },
    { period: "4 Jul \u2013 3 Aug", inn: 90619, out: 90905.19, close: 445.48 },
    { period: "4 Aug \u2013 3 Sep", inn: 100955.65, out: 101314.07, close: 87.06 },
    { period: "4 Sep \u2013 3 Oct", inn: 33167.59, out: 33297.63, close: -42.98 }
  ]
};
function statementsBlock() {
  return BOOKS.paidOut > BOOKS.paidIn || BOOKS.close < 2e3;
}
const FACILITIES = [
  "Capital on Tap is already a lender. On the October statement their direct debit of \xA33,510.69 was returned on 18 September, 25 September and 1 October. HSBC charged \xA32.50 each time.",
  "Travelodge Business Pay was signed on 4 August 2026 for \xA31,000 a month. The direct debit of \xA3432.73 was returned on 15 September and again on 28 September.",
  "Lords Builders Merchants: James signed a personal guarantee and a \xA35,000 credit limit on 25 September 2026. Wet-ink form. Not a reason to open another account this month.",
  "Elliotts, Christchurch: customer code TREURO. Invoice SI9917440 dated 28 August 2026 for \xA3506.88, due by the end of September. That is a bill the company owes, not an invoice to finance."
];
const REOPEN = [
  "A full statement with no returned direct debit.",
  "A closing balance of at least \xA35,000, which is the Capital on Tap collection currently being attempted plus the Travelodge debit, with something left.",
  "That balance still there on the next statement.",
  "For money against work: a VAT invoice for work already done, to a client who has paid before. A purchase order is not that. Companies House showed no charge registered, so a charge is not the block. The returned debits are."
];
export {
  BOOKS,
  FACILITIES,
  REOPEN,
  statementsBlock
};
