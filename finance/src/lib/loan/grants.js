const GRANTS_AS_OF = "14 October 2026";
const SCHEMES = [
  {
    id: "ggs",
    name: "Growth Guarantee Scheme",
    kind: "Guarantee to the lender. Not a grant.",
    verdict: "not-a-grant",
    timing: "The lender still decides. Not this month.",
    why: "Open. The government covers 70% of the lender\u2019s loss. James would still owe all of it. Term loans start at \xA325,001. The borrower must not be a business in difficulty, and the lender has to call the business viable. Three returned Capital on Tap debits fail that test before the guarantee is worth anything.",
    url: "https://www.british-business-bank.co.uk/finance-options/debt-finance/growth-guarantee-scheme"
  },
  {
    id: "startup",
    name: "Start Up Loans",
    kind: "Personal loan. Not a grant.",
    verdict: "not-a-grant",
    timing: "Same decision as the loan arm.",
    why: "Up to \xA325,000, in the director\u2019s own name, at 7.5% fixed on this desk\u2019s book. Free mentoring does not change the bank statements. Applying here as well would be a second search on James for the same no.",
    url: "https://www.startuploans.co.uk/"
  },
  {
    id: "innovate",
    name: "Innovate UK competitions",
    kind: "Grant, for a research project.",
    verdict: "do-not-apply",
    timing: "Months, and only for the project.",
    why: "Rounds open on 14 October 2026 are climate technology, batteries, engineering biology and frontier AI. A fit-out contractor applying so the wages get paid would be a false application. They also want match funding.",
    url: "https://www.ukri.org/opportunity/"
  },
  {
    id: "madesmarter",
    name: "Made Smarter",
    kind: "Matched grant for manufacturers.",
    verdict: "do-not-apply",
    timing: "Not this sector.",
    why: "It is for manufacturing businesses buying digital kit. Treun Roc is a contractor. Applying would be refused on the sector before anyone read the bank.",
    url: "https://www.madesmarter.uk/"
  },
  {
    id: "women",
    name: "Women in Innovation",
    kind: "Grant and support.",
    verdict: "do-not-apply",
    timing: "Not this company.",
    why: "It is for women founders. James Alexander Lindsay is the director and the person with control.",
    url: "https://www.ukri.org/opportunity/"
  },
  {
    id: "kings",
    name: "King\u2019s Trust enterprise",
    kind: "Grant and mentoring for young founders.",
    verdict: "do-not-apply",
    timing: "Not this company.",
    why: "It is for young founders. James was born in 1956. Ryan is 40.",
    url: "https://www.kingstrust.org.uk/"
  },
  {
    id: "herts",
    name: "Hertfordshire Growth Hub",
    kind: "Advice. Not a cheque.",
    verdict: "phone",
    timing: "No cash in four weeks.",
    why: "The published Hertfordshire money in 2026 is \xA34 million for a Watford innovation hub and for DomeWorks workspace. That builds premises. It is not a grant to this company. The hub is who to ask if a local grant actually opens. Do not expect wages out of it.",
    url: "https://www.hertsgrowthhub.com/"
  },
  {
    id: "finder",
    name: "Government finance finder",
    kind: "The official list.",
    verdict: "do-not-apply",
    timing: "A directory, not a fund.",
    why: "There is no national grant for a trading builder\u2019s wages. Working through this list and sending the same pack to every scheme is how a company gets marked as a bad applicant. This desk has already tested the schemes that are open.",
    url: "https://www.gov.uk/business-finance-support"
  },
  {
    id: "rd",
    name: "R&D tax relief",
    kind: "Tax, after a claim. Not a grant.",
    verdict: "not-a-grant",
    timing: "Not before the corporation tax return.",
    why: "First accounts are due 14 May 2027. Ordinary fit-out labour is not research. The software is only a conversation if the work solved a real technical uncertainty. Even then the cash follows the claim. It does not bridge four weeks.",
    url: "https://www.gov.uk/guidance/corporation-tax-research-and-development-rd-relief"
  },
  {
    id: "citb",
    name: "CITB training grants",
    kind: "Money back on training, if registered.",
    verdict: "do-not-apply",
    timing: "Not wages.",
    why: "Only if the company is a CITB levy payer and the spend is training. It does not pay labour, merchants or the Capital on Tap debit.",
    url: "https://www.citb.co.uk/levy-grants-and-funding/grants-funding/"
  },
  {
    id: "seis",
    name: "SEIS and EIS",
    kind: "Tax relief for an investor. Not a grant.",
    verdict: "do-not-apply",
    timing: "Does not pay this company a cheque.",
    why: "An investor may get tax relief. The company does not get a government payment. Property development is an excluded trade, and a contractor should not rebadge itself as a tech startup to force a claim. A private loan is a different thing, and it is not SEIS.",
    url: "https://www.gov.uk/guidance/venture-capital-schemes-apply-for-the-seed-enterprise-investment-scheme"
  },
  {
    id: "hmrc",
    name: "HMRC Time to Pay",
    kind: "Time. Not new money.",
    verdict: "phone",
    timing: "A phone call, if tax is part of the hole.",
    why: "If VAT, CIS or PAYE has to go out before the client money lands, James can ask for time. Business Payment Support Service, 0300 200 3835. It does not put cash in. It can stop a tax bill taking the \xA3100,000 when it arrives.",
    url: "https://www.gov.uk/difficulties-paying-hmrc"
  }
];
function schemesToSend() {
  return SCHEMES.filter((s) => s.verdict !== "do-not-apply" && s.verdict !== "not-a-grant" && s.verdict !== "phone");
}
function grantDecisionText() {
  const lines = [
    "TREUN ROC CONTRACTS LTD \u2014 GRANT DECISION",
    `Checked ${GRANTS_AS_OF}.`,
    "Company 16649937. Director James Alexander Lindsay. Construction. Incorporated 14 August 2025.",
    "",
    "NOTHING TO SEND.",
    "No open scheme pays wages or materials for this company in the next four weeks.",
    "Applying to all of them would be a set of false applications.",
    "",
    ...SCHEMES.flatMap((s) => [
      s.name.toUpperCase(),
      s.kind,
      s.verdict === "phone" ? "Phone. Do not expect cash." : s.verdict === "not-a-grant" ? "Not a grant. Do not apply from this arm." : "Do not apply.",
      s.timing,
      s.why,
      s.url,
      ""
    ])
  ];
  return lines.join("\n");
}
export {
  GRANTS_AS_OF,
  SCHEMES,
  grantDecisionText,
  schemesToSend
};
