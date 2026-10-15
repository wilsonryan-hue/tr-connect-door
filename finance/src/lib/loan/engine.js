const INCORPORATED = "2025-08-14";
function tradingMonths(asOf = /* @__PURE__ */ new Date()) {
  const start = new Date(INCORPORATED);
  const months = (asOf.getFullYear() - start.getFullYear()) * 12 + (asOf.getMonth() - start.getMonth());
  return Math.max(0, months);
}
function pmt(aprPct, months, principal) {
  if (principal <= 0 || months <= 0) return 0;
  const r = aprPct / 100 / 12;
  if (r === 0) return principal / months;
  return principal * r / (1 - Math.pow(1 + r, -months));
}
import { buildPlan, packText, retune, scoreLender } from "./underwrite.js";
export {
  INCORPORATED,
  buildPlan,
  packText,
  pmt,
  retune,
  scoreLender,
  tradingMonths
};
