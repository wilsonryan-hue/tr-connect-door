import { HOUSE_RULES, LENDERS } from "./market.js";
import {
  pmt,
  tradingMonths
} from "./engine.js";
const MONTHS = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"];
const NONE = { draw: 0, monthly: 0, balloonMonth: -1, balloon: 0, delayBill: 0 };
function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, Math.round(n)));
}
function adverse(id) {
  return id === "ryan";
}
function gbp(n) {
  return `\xA3${Math.abs(Math.round(n)).toLocaleString("en-GB")}`;
}
function buildMonths(input, cash) {
  const rows = [];
  let open = input.cashNow;
  const delay = Math.min(Math.max(0, input.oneOff), Math.max(0, cash.delayBill));
  for (let i = 0; i < 12; i++) {
    const oneOff = (i === 0 ? input.oneOff - delay : 0) + (i === 1 ? delay : 0);
    const balloon = i === cash.balloonMonth ? cash.balloon : 0;
    const inn = input.monthlyIn + (i === 0 ? cash.draw : 0);
    const out = input.monthlyOut + oneOff + cash.monthly + balloon;
    const close = open + inn - out;
    const flag = close < 0 ? "struggle" : close < input.monthlyOut * 0.2 ? "tight" : "ok";
    rows.push({ label: MONTHS[i] ?? `M${i + 1}`, open, inn, out, close, flag });
    open = close;
  }
  return rows;
}
function flagsFor(months, surplus, monthlyRepayment) {
  const flags = [];
  const struggle = months.filter((m) => m.flag === "struggle");
  const tight = months.filter((m) => m.flag === "tight");
  if (struggle.length) {
    flags.push(`${struggle.map((m) => m.label).join(", ")} ${struggle.length === 1 ? "goes" : "go"} below zero.`);
  }
  if (tight.length && !struggle.length) {
    flags.push(`${tight.map((m) => m.label).join(", ")} ${tight.length === 1 ? "is" : "are"} tight \u2014 under a fifth of a month\u2019s costs.`);
  }
  if (surplus < 0) {
    flags.push(`The ordinary month loses ${gbp(surplus)}. A loan does not fix that.`);
  }
  if (monthlyRepayment > 0 && surplus > 0 && monthlyRepayment > surplus * 0.6) {
    flags.push("The repayment would eat most of the monthly spare cash.");
  }
  if (!flags.length) flags.push("The next 12 months stay above the line on these numbers.");
  return flags;
}
function blank(lender, input, why) {
  return {
    lender,
    approvalPct: 0,
    riskPct: 84,
    stance: "reject",
    verdict: "bad",
    reasons: [why],
    factors: [],
    offered: 0,
    apr: lender.aprTypical,
    rateLabel: "\u2014",
    shapeLabel: "Not offered",
    payLabel: "A month",
    termMonths: lender.termMonths,
    repayment: 0,
    costOfCredit: 0,
    dscr: null,
    coverLabel: why,
    coversNeed: false,
    search: "none",
    cash: NONE,
    months: buildMonths(input, NONE)
  };
}
function offerOf(lender, input) {
  const annual = Math.max(0, input.monthlyIn * 12);
  if (lender.id === "iwoca") return Math.min(input.amount, lender.amountMax, Math.max(0, annual * 0.2));
  if (lender.id === "invoice") return input.hasInvoices ? Math.min(input.amount, Math.round(input.monthlyIn * 0.7)) : 0;
  if (lender.id === "trade") return input.purpose === "materials" ? Math.min(input.amount, 8e3) : 0;
  if (lender.id === "asset") return input.purpose === "plant" ? Math.min(input.amount, lender.amountMax) : 0;
  if (lender.id === "capify") return Math.min(input.amount, lender.amountMax);
  return Math.min(input.amount, lender.amountMax);
}
function price(lender, input, offered) {
  if (lender.kind === "flexi") {
    const days = input.speed === "week" ? 30 : input.purpose === "materials" && input.speed === "month" ? 60 : 365;
    if (days <= 45) {
      const fee = Math.round(offered * 0.0333);
      return {
        apr: 3.3,
        rateLabel: "3.3%",
        shapeLabel: "Cleared in 30 days. 49% a year only if the draw is held.",
        payLabel: "Payback",
        termMonths: 1,
        repayment: offered + fee,
        costOfCredit: fee,
        holdDays: 30,
        cash: { draw: offered, monthly: 0, balloonMonth: 0, balloon: offered + fee, delayBill: 0 }
      };
    }
    const term2 = days <= 90 ? 3 : 12;
    const repayment2 = Math.round(pmt(49, term2, offered));
    return {
      apr: 49,
      rateLabel: "49%",
      shapeLabel: `Held for ${term2} months, which is the expensive way to use a flexi line.`,
      payLabel: "A month",
      termMonths: term2,
      repayment: repayment2,
      costOfCredit: Math.max(0, repayment2 * term2 - offered),
      holdDays: term2 * 30,
      cash: { draw: offered, monthly: repayment2, balloonMonth: -1, balloon: 0, delayBill: 0 }
    };
  }
  if (lender.kind === "trade") {
    return {
      apr: 0,
      rateLabel: "0%",
      shapeLabel: "30 days, and only if the account is paid on time.",
      payLabel: "Payback",
      termMonths: 1,
      repayment: offered,
      costOfCredit: 0,
      holdDays: 30,
      cash: { draw: 0, monthly: 0, balloonMonth: -1, balloon: 0, delayBill: offered }
    };
  }
  if (lender.kind === "invoice") {
    const fee = Math.round(offered * 0.03);
    return {
      apr: 18,
      rateLabel: "3%",
      shapeLabel: "About 3% of the invoice, taken when the client pays. Retention is not advanced.",
      payLabel: "Payback",
      termMonths: 2,
      repayment: offered + fee,
      costOfCredit: fee,
      holdDays: 60,
      cash: { draw: offered, monthly: 0, balloonMonth: 2, balloon: offered + fee, delayBill: 0 }
    };
  }
  if (lender.kind === "mca") {
    const fee = Math.round(offered * 0.35);
    const repayment2 = Math.round((offered + fee) / 12);
    return {
      apr: 58,
      rateLabel: "58%",
      shapeLabel: "A factor rate, skimmed off turnover. Not a normal loan.",
      payLabel: "A month",
      termMonths: 12,
      repayment: repayment2,
      costOfCredit: fee,
      holdDays: 365,
      cash: { draw: offered, monthly: repayment2, balloonMonth: -1, balloon: 0, delayBill: 0 }
    };
  }
  const term = lender.termMonths;
  const repayment = Math.round(pmt(lender.aprTypical, term, offered));
  const personal = lender.kind === "startup" ? " The loan is in the director\u2019s name." : "";
  return {
    apr: lender.aprTypical,
    rateLabel: `${lender.aprTypical}%`,
    shapeLabel: `Over ${term} months.${personal}`,
    payLabel: "A month",
    termMonths: term,
    repayment,
    costOfCredit: Math.max(0, repayment * term - offered),
    holdDays: term * 30,
    cash: { draw: offered, monthly: repayment, balloonMonth: -1, balloon: 0, delayBill: 0 }
  };
}
function judge(lender, input, priced, breaks, surplus) {
  if (lender.kind === "mca" || lender.stance === "bad") return "bad";
  if (input.purpose === "tax") return "bad";
  if (breaks) return "bad";
  if (adverse(input.applicant) && (lender.kind === "startup" || lender.personalGuarantee)) return "bad";
  if (priced.cash.monthly > 0 && surplus < priced.cash.monthly) return "bad";
  if (lender.kind === "trade") return "good";
  if (lender.kind === "flexi") return priced.holdDays <= 45 ? "acceptable" : priced.holdDays > 120 ? "bad" : "expensive";
  if (lender.kind === "invoice") return "acceptable";
  if (priced.apr <= 12 && (priced.cash.monthly === 0 || surplus >= priced.cash.monthly * 1.25)) return "good";
  if (priced.apr <= 20) return "acceptable";
  if (priced.apr < 35) return "expensive";
  return "bad";
}
function scoreLender(lender, input, monthsTrading) {
  if (input.amount < lender.amountMin) {
    return blank(lender, input, `Ask is below their ${gbp(lender.amountMin)} floor.`);
  }
  if (lender.id === "asset" && input.purpose !== "plant") {
    return blank(lender, input, "Asset finance is for plant, not for cash.");
  }
  if (lender.id === "trade" && input.purpose !== "materials") {
    return blank(lender, input, "A merchant account buys materials. It is not a cash loan.");
  }
  if (lender.id === "invoice" && !input.hasInvoices) {
    return blank(lender, input, "No invoices on the book to fund.");
  }
  const offered = Math.round(offerOf(lender, input));
  if (offered < lender.amountMin) {
    return blank(lender, input, `${lender.name} would not put a facility on this ask.`);
  }
  const priced = price(lender, input, offered);
  const surplus = input.monthlyIn - input.monthlyOut;
  const plain = buildMonths(input, NONE);
  const months = buildMonths(input, priced.cash);
  const breaks = months.some((m) => m.flag === "struggle") && !plain.some((m) => m.flag === "struggle");
  const factors = [];
  const add = (label, points) => {
    if (points !== 0) factors.push({ label, points });
  };
  const badPerson = adverse(input.applicant);
  if (lender.id === "startup") {
    add(`Fit-out Ltd, ${monthsTrading} months in, accounts not filed`, 28);
    add(offered >= input.amount ? "Ask sits inside the \xA325,000 scheme" : "Scheme cap is \xA325,000, so this would not fund the whole ask", offered >= input.amount ? 8 : -8);
    add(badPerson ? "Ryan\u2019s IVA default would sit on a loan in his own name" : "James\u2019s file has no adverse marker stored", badPerson ? -22 : 10);
    add("The debt would be the director\u2019s, not the company\u2019s", -4);
    if (input.speed === "week") add("Start Up Loans takes weeks, not days", -18);
    if (input.purpose === "tax") add("Scheme money is not for paying HMRC", -24);
    if (input.purpose === "plant") add("Plant should be secured on the kit, not borrowed in a personal name", -16);
    if (monthsTrading > 60) add("The scheme is for businesses under five years", -30);
  } else if (lender.id === "iwoca") {
    add("Young Ltd, decided from the bank feed", 24);
    add(monthsTrading >= 3 ? "Past their three-month trading floor" : "Short of their three-month floor", monthsTrading >= 3 ? 6 : -16);
    add(input.monthlyIn * 12 >= 25e3 ? "Turnover clears their \xA325,000 floor" : "Turnover is under their \xA325,000 floor", input.monthlyIn * 12 >= 25e3 ? 4 : -12);
    add(
      priced.holdDays <= 45 && (input.purpose === "materials" || input.purpose === "plant") ? "A short bridge is what this line is for" : "Holding the line is the expensive way to use it",
      priced.holdDays <= 45 && (input.purpose === "materials" || input.purpose === "plant") ? 6 : -8
    );
    add(badPerson ? "They decline insolvency, and an IVA default is too close" : "James can sign the guarantee", badPerson ? -20 : 4);
    add("About 49% a year if the draw is kept", -6);
    if (offered + 1 < input.amount) add("Their limit is about 20% of turnover", -8);
  } else if (lender.id === "asset") {
    add("The kit is the security, so the company borrows", 26);
    add(monthsTrading >= 6 ? "Long enough for a small asset line" : "Short of six months", monthsTrading >= 6 ? 8 : -14);
    add(badPerson ? "The guarantee would lean on the IVA default" : "A director with no stored default can guarantee it", badPerson ? -20 : 6);
    add("The money is buying plant", 6);
  } else if (lender.id === "trade") {
    add("Merchants will look at a trading fit-out Ltd", 22);
    add(offered >= input.amount * 0.8 ? "The limit covers the bill" : "A first limit is about \xA38,000 and does not cover this bill", offered >= input.amount * 0.8 ? 8 : -6);
    add(badPerson ? "The merchant will read the IVA default" : "A director guarantee is normal on a trade account", badPerson ? -18 : 4);
  } else if (lender.id === "invoice") {
    add("There are invoices a funder can read", 32);
    add("Fit-out debtors advance at about 70%. Retention stays out", 4);
    add(badPerson ? "The guarantee still reads the personal file" : "James can sign the guarantee", badPerson ? -16 : 4);
  } else {
    const base = lender.id === "capify" ? 28 : lender.id === "fleximize" ? 24 : lender.id === "funding-circle" ? 20 : 14;
    add(lender.bestFor, base);
    if (monthsTrading < lender.minTradingMonths) {
      add(`They want about ${lender.minTradingMonths} months. The company has ${monthsTrading}.`, -18);
    }
    if (lender.needsFiledAccounts) add("First accounts are not due until 14 May 2027", -18);
    if (lender.id === "funding-circle" || lender.id === "shawbrook") {
      add("Construction subcontractors are turned down more often than the headline rate suggests", -6);
    }
    add(
      badPerson && lender.personalGuarantee ? "A personal guarantee meets an IVA default" : "A clean director can stand behind it",
      badPerson && lender.personalGuarantee ? -18 : 4
    );
    if (input.purpose === "tax") add("Paying HMRC from borrowed money is a distress signal", -16);
    if (lender.kind === "mca") add("A factor rate is the wrong price while any cheaper door exists", -12);
  }
  if (priced.cash.monthly > 0) {
    if (surplus <= 0) add("The ordinary month does not cover a repayment", -18);
    else if (surplus >= priced.cash.monthly * 2) add(`Spare cash covers the repayment about ${Math.round(surplus / priced.cash.monthly)} times`, 6);
    else if (surplus >= priced.cash.monthly * 1.25) add("Spare cash covers the repayment, with a little room", 3);
    else if (surplus >= priced.cash.monthly) add("The repayment uses most of the spare cash", -6);
    else add("The repayment is bigger than the spare cash", -16);
  } else if (priced.cash.balloon > 0 && input.monthlyIn < priced.cash.balloon) {
    add("One month\u2019s income does not cover the payback", -10);
  } else if (priced.holdDays <= 45 && input.monthlyIn >= priced.repayment) {
    add("One month\u2019s income covers the payback", 4);
  }
  if (breaks) add("The draw pushes a month under zero", -14);
  let approval = clamp(factors.reduce((sum, f) => sum + f.points, 0), 0, 72);
  let verdict = judge(lender, input, priced, breaks, surplus);
  if (breaks) verdict = "bad";
  const coversNeed = offered >= input.amount * 0.8;
  let risk = verdict === "good" ? 12 : verdict === "acceptable" ? 26 : verdict === "expensive" ? 46 : 72;
  if (lender.kind === "startup") risk += 6;
  else if (lender.personalGuarantee && !badPerson) risk += 4;
  if (badPerson) risk += 22;
  if (priced.cash.monthly > 0 && surplus > 0 && priced.cash.monthly > surplus * 0.6) risk += 8;
  if (breaks) risk += 12;
  risk = clamp(risk, 4, 96);
  let stance = "hold";
  if (verdict === "bad" || approval < 12 || lender.stance === "bad" || lender.kind === "mca") stance = "reject";
  else if (!coversNeed || verdict === "expensive" || lender.stance === "later" || lender.needsFiledAccounts) stance = "hold";
  else if (input.speed === "week" && (lender.kind === "startup" || lender.kind === "asset")) stance = "hold";
  else if (lender.kind === "startup" && input.purpose === "plant") stance = "hold";
  else if (approval < 18) stance = "hold";
  else if (lender.hardOnApply && (lender.kind === "startup" || lender.kind === "asset")) stance = "sprint";
  else stance = "soft";
  const search = stance === "sprint" ? "hard" : stance === "soft" ? "soft" : "none";
  const negatives = factors.filter((f) => f.points < 0).map((f) => f.label);
  const reasons = (negatives.length ? negatives : factors.map((f) => f.label)).slice(0, 3);
  if (!reasons.length) reasons.push(lender.goodIf);
  let dscr = null;
  let coverLabel = priced.shapeLabel;
  if (priced.cash.monthly > 0 && surplus > 0) {
    dscr = surplus / priced.cash.monthly;
    coverLabel = `Spare cash is ${gbp(surplus)} a month. Repayment is ${gbp(priced.repayment)}. Cover is ${dscr < 10 ? dscr.toFixed(1) : Math.round(dscr).toString()} times.`;
  } else if (priced.cash.balloon > 0) {
    coverLabel = `Payback is ${gbp(priced.cash.balloon)}. An ordinary month brings in ${gbp(input.monthlyIn)}.`;
  } else if (lender.kind === "trade") {
    coverLabel = offered >= input.amount * 0.8 ? "No interest if the bill is paid inside 30 days." : `They would open about ${gbp(offered)}, not the full ${gbp(input.amount)}.`;
  } else if (surplus <= 0) {
    coverLabel = `The ordinary month loses ${gbp(surplus)}.`;
  }
  return {
    lender,
    approvalPct: approval,
    riskPct: risk,
    stance,
    verdict,
    reasons,
    factors,
    offered,
    apr: priced.apr,
    rateLabel: priced.rateLabel,
    shapeLabel: priced.shapeLabel,
    payLabel: priced.payLabel,
    termMonths: priced.termMonths,
    repayment: priced.cash.monthly > 0 ? priced.cash.monthly : priced.repayment,
    costOfCredit: priced.costOfCredit,
    dscr,
    coverLabel,
    coversNeed,
    search,
    cash: priced.cash,
    months
  };
}
const VERDICT_WORD = {
  good: "a good loan",
  acceptable: "acceptable",
  expensive: "expensive",
  bad: "a bad loan"
};
function buildPlan(input, asOf = /* @__PURE__ */ new Date()) {
  const monthsTrading = tradingMonths(asOf);
  const book = LENDERS.map((l) => scoreLender(l, input, monthsTrading));
  const surplus = input.monthlyIn - input.monthlyOut;
  const structuralLoss = surplus < 0;
  const plain = buildMonths(input, NONE);
  const rank = { good: 0, acceptable: 1, expensive: 2, bad: 3 };
  const candidates = book.filter(
    (s) => !structuralLoss && (s.stance === "sprint" || s.stance === "soft") && (s.verdict === "good" || s.verdict === "acceptable") && s.coversNeed && s.approvalPct >= 18 && s.riskPct < 55
  );
  candidates.sort((a, b) => {
    const byVerdict = rank[a.verdict] - rank[b.verdict];
    if (byVerdict) return byVerdict;
    const costA = a.offered > 0 ? a.costOfCredit / a.offered : 9;
    const costB = b.offered > 0 ? b.costOfCredit / b.offered : 9;
    if (Math.abs(costA - costB) > 2e-3) return costA - costB;
    return b.approvalPct - a.approvalPct;
  });
  const best = candidates[0];
  const picks = [];
  if (best) {
    picks.push({
      lender: best.lender,
      action: best.search === "hard" ? "hard-apply" : "soft-quote",
      approvalPct: best.approvalPct,
      riskPct: best.riskPct,
      reasons: best.reasons,
      verdict: best.verdict,
      offered: best.offered,
      rateLabel: best.rateLabel,
      costOfCredit: best.costOfCredit
    });
  }
  let mode = picks.length ? "apply" : "hold";
  const withLoan = mode === "apply" && best ? best.months : plain;
  const loanBreaks = withLoan.some((m) => m.flag === "struggle") && !plain.some((m) => m.flag === "struggle");
  if (loanBreaks || structuralLoss) {
    mode = "hold";
    picks.length = 0;
  }
  const shown = mode === "apply" && best ? best.months : plain;
  const flags = flagsFor(shown, surplus, mode === "apply" && best ? best.cash.monthly : 0);
  const excluded = book.filter((s) => !picks.some((p) => p.lender.id === s.lender.id)).map((s) => ({
    name: s.lender.name,
    why: s.reasons[0] ?? (s.lender.stance === "bad" ? s.lender.badIf : "Not this sprint.")
  }));
  let headline = "Do not apply this week.";
  let detail = "Nobody on the book is a loan we should take on this ask.";
  let whyCount = "Zero hard applications. A decline still marks the file.";
  if (mode === "apply" && best) {
    const hard = best.search === "hard";
    headline = hard ? `One application. ${best.lender.name}.` : `Quote only. ${best.lender.name}. Nothing is sent.`;
    detail = `${best.lender.name} is ${VERDICT_WORD[best.verdict]}. ${best.coverLabel} ${best.shapeLabel}`;
    whyCount = hard ? "One hard search. A second application this month would mark the file for nothing." : "No hard search. We price it, and we do not accept a bad offer inside this sprint.";
  } else if (structuralLoss) {
    detail = `Money out beats money in by ${gbp(surplus)} a month. Borrowing on top of that is the bad loan.`;
    whyCount = "Zero. Fix the month before anyone\u2019s credit file is touched.";
  } else if (input.purpose === "tax") {
    detail = "Do not borrow to pay HMRC. Ask for a time-to-pay first. A lender reads tax arrears as distress, and the expensive houses are the only ones that still say yes.";
    whyCount = "Zero. The taxman is the first call, not a lender.";
  } else if (adverse(input.applicant)) {
    detail = "Every door we would actually use wants James or a guarantee. Ryan\u2019s IVA default makes that a poor bet. Switch the applicant to James if his file is clean.";
    whyCount = "Zero until the right person is on the form.";
  } else if (input.speed === "week") {
    detail = "Nothing worth signing arrives inside a week at a price we should take. A flexi line is only a maybe, and only if it clears inside 30 days.";
    whyCount = "Zero hard applications. Speed is not a reason to take a bad rate.";
  } else if (input.amount > 25e3 && !input.hasInvoices && input.purpose !== "plant") {
    detail = "Over \xA325,000, with no filed accounts and no invoices, is not a market we should knock on. The scheme stops at \xA325,000. The banks want accounts that are not due until May 2027.";
    whyCount = "Zero. Wait for accounts, fund real invoices, or buy plant on the kit.";
  }
  const live = mode === "apply" ? best : void 0;
  return {
    mode,
    headline,
    detail,
    whyCount,
    applicationCount: picks.length,
    hardCount: mode === "apply" && live?.search === "hard" ? 1 : 0,
    softCount: mode === "apply" && live?.search === "soft" ? 1 : 0,
    picks,
    excluded,
    months: plain,
    withLoan: shown,
    flags,
    planRiskPct: mode === "hold" ? structuralLoss ? 78 : 22 : live?.riskPct ?? 22,
    planApprovalPct: mode === "hold" ? 0 : live?.approvalPct ?? 0,
    fileChancePct: Math.max(...book.map((s) => s.approvalPct)),
    repayment: mode === "apply" && live ? live.repayment : 0,
    surplus,
    tradingMonths: monthsTrading,
    book
  };
}
const VERDICT_LABEL = {
  good: "Good loan",
  acceptable: "Acceptable",
  expensive: "Expensive",
  bad: "Do not take"
};
function view(score, plan, moved, target, hold, headline, detail) {
  const send = !hold && plan.surplus >= 0 && score.coversNeed && (score.verdict === "good" || score.verdict === "acceptable") && (score.stance === "sprint" || score.stance === "soft");
  const months = moved ? score.months : plan.withLoan;
  const ranked = [...score.factors].sort((a, b) => Math.abs(b.points) - Math.abs(a.points));
  const factors = ranked.slice(0, 4);
  const worst = [...score.factors].sort((a, b) => a.points - b.points)[0];
  if (worst && worst.points < 0 && !factors.includes(worst)) factors[factors.length - 1] = worst;
  return {
    target,
    moved,
    apr: score.apr,
    rateLabel: score.rateLabel,
    termMonths: score.termMonths,
    shapeLabel: score.shapeLabel,
    payLabel: score.payLabel,
    riskPct: !moved && plan.mode === "hold" ? plan.planRiskPct : score.riskPct,
    repayment: !moved && plan.mode === "hold" ? 0 : score.repayment,
    released: score.offered,
    mode: !moved ? plan.mode : send ? "apply" : "hold",
    headline,
    detail,
    months,
    flags: moved ? flagsFor(score.months, plan.surplus, score.cash.monthly) : plan.flags,
    verdict: score.verdict,
    verdictLabel: VERDICT_LABEL[score.verdict],
    costOfCredit: score.costOfCredit,
    coverLabel: score.coverLabel,
    factors,
    lenderName: score.lender.name,
    searchLabel: !moved ? plan.mode === "hold" ? "None" : plan.hardCount ? "1 hard" : "Quote only" : send && score.search === "hard" ? "1 hard" : send ? "Quote only" : "None"
  };
}
function retune(_input, plan, target) {
  const pool = plan.book.filter((s) => s.approvalPct >= 8);
  const source = pool.length ? pool : plan.book;
  const current = plan.book.find((s) => s.lender.id === plan.picks[0]?.lender.id) ?? source.reduce((a, b) => a.approvalPct >= b.approvalPct ? a : b);
  const anchor = plan.planApprovalPct > 0 ? plan.planApprovalPct : plan.fileChancePct;
  if (Math.abs(target - anchor) < 1) {
    return view(current, plan, false, anchor, plan.mode !== "apply", plan.headline, plan.detail);
  }
  const max = Math.max(...source.map((s) => s.approvalPct));
  if (target > max + 4) {
    const best = source.reduce((a, b) => a.approvalPct >= b.approvalPct ? a : b);
    return view(
      best,
      plan,
      true,
      target,
      true,
      `Nobody offers ${target}%.`,
      `The best real chance on this file is ${best.approvalPct}% at ${best.lender.name}. We do not invent a rate to fill the gap.`
    );
  }
  const nearest = source.reduce(
    (a, b) => Math.abs(a.approvalPct - target) <= Math.abs(b.approvalPct - target) ? a : b
  );
  const min = Math.min(...source.map((s) => s.approvalPct));
  if (target < min - 6) {
    return view(
      nearest,
      plan,
      true,
      target,
      true,
      `Nobody is down at ${target}%.`,
      `The thinnest real chance is ${nearest.approvalPct}% at ${nearest.lender.name}.`
    );
  }
  const hold = plan.surplus < 0 || nearest.verdict === "bad" || nearest.verdict === "expensive" || !nearest.coversNeed || nearest.stance === "reject" || nearest.stance === "hold" || nearest.approvalPct < 15;
  const headline = hold ? `${nearest.lender.name} is not one we send.` : `${nearest.lender.name}. ${nearest.approvalPct}% yes.`;
  const detail = `${nearest.coverLabel} ${nearest.reasons[0] ?? ""}`.trim();
  return view(nearest, plan, true, nearest.approvalPct, hold, headline, detail);
}
function packText(input, plan) {
  const applicant = input.applicant === "james" ? "James Alexander Lindsay" : "Ryan Wilson";
  const live = plan.book.find((s) => s.lender.id === plan.picks[0]?.lender.id);
  const lines = [
    "TREUN ROC CONTRACTS LTD \u2014 loan sprint pack",
    "Company number 16649937",
    "Incorporated 14 August 2025",
    "Registered office: 5 Mulberry Close, Watford, England, WD17 4UZ",
    "SIC: 41201, 41202, 43290, 43341",
    `Applicant on this sprint: ${applicant}`,
    `Amount: ${gbp(input.amount)}`,
    `Purpose: ${input.purpose}`,
    "",
    plan.headline,
    plan.detail,
    plan.whyCount,
    ""
  ];
  if (live) {
    lines.push(
      `${plan.picks[0]?.action === "hard-apply" ? "APPLY" : "QUOTE ONLY"} \u2014 ${live.lender.name}`,
      `Chance ${live.approvalPct}%. Risk ${live.riskPct}%. ${VERDICT_LABEL[live.verdict]}.`,
      `They release ${gbp(live.offered)}. Cost of the credit about ${gbp(live.costOfCredit)}.`,
      live.coverLabel,
      live.shapeLabel,
      live.lender.url,
      ""
    );
  } else {
    lines.push("No application in this sprint.", "");
  }
  lines.push("Rules used:", ...HOUSE_RULES, "", "Attach from the laptop, do not retype secrets into chat:", "- James Alexander Lindsay passport", "- Business plan", "- Management figures and the forecast", "- Last six months of bank statements", "- Insurance schedule", "- Live order book");
  return lines.join("\n");
}
export {
  buildMonths,
  buildPlan,
  flagsFor,
  gbp,
  packText,
  retune,
  scoreLender
};
