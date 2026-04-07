// ============================================================
// financialMath.js — математика финансового прогноза
// ============================================================

// ─── ЦЕЛЕВЫЕ МАРЖИ ПО НИШАМ ──────────────────────────────────
// Числовые значения — "сильный" уровень рентабельности для ниши
export const NICHE_TARGET_MARGINS = {
  marketplace: 25,   // чистая маржа после всех расходов МП
  infobiz:     40,   // рентабельность после CAC и команды
  broker:      30,   // рентабельность агентства
  rental:      35,   // маржа на упакованный объект
  event:       35,   // рентабельность ивент-пространства
  clinic:      35,   // рентабельность клиники
  production:  25,
  b2b:         30,
}

// ─── ИЗВЛЕЧЕНИЕ ТЕКУЩЕЙ МАРЖИ ПО НИШЕ ───────────────────────
export function getMarginFromParams(params, nicheId) {
  const p = params || {}
  switch (nicheId) {
    case 'marketplace': {
      return parseFloat(p.orderMargin || 0)
    }
    case 'infobiz': {
      const rev = parseFloat(p.revenue || 0)
      const ad  = parseFloat(p.adBudget || 0)
      const pay = parseFloat(p.payroll || 0)
      return rev > 0 ? Math.max(0, Math.round((rev - ad - pay) / rev * 100)) : 0
    }
    case 'broker': {
      const deals = parseFloat(p.dealCount || 0)
      const comm  = parseFloat(p.commission || 0)
      const pay   = parseFloat(p.payroll || 0)
      const ad    = parseFloat(p.adBudget || 0)
      const brokerRev = deals * comm
      return brokerRev > 0 ? Math.max(0, Math.round((brokerRev - pay - ad) / brokerRev * 100)) : 0
    }
    case 'rental': {
      const exit  = parseFloat(p.exitPrice || 0)
      const entry = parseFloat(p.entryPrice || 0)
      const prep  = parseFloat(p.prepCost || 0)
      return exit > 0 ? Math.max(0, Math.round((exit - entry - prep) / exit * 100)) : 0
    }
    case 'event': {
      const rev   = parseFloat(p.revenue || 0)
      const fixed = parseFloat(p.fixedCosts || p.payroll || 0)
      return rev > 0 ? Math.max(0, Math.round((rev - fixed) / rev * 100)) : 0
    }
    case 'clinic': {
      const rev   = parseFloat(p.revenue || 0)
      const pay   = parseFloat(p.payroll || 0)
      const fixed = parseFloat(p.fixedCosts || 0)
      const medC  = parseFloat(p.medCosts || 0)
      const ops   = parseFloat(p.operationCount || 0)
      return rev > 0 ? Math.max(0, Math.round((rev - pay - fixed - medC * ops) / rev * 100)) : 0
    }
    default:
      return parseFloat(p.orderMargin || p.margin || 20)
  }
}

// ─── ПОСТОЯННЫЕ КОСТЫ ПО НИШЕ ────────────────────────────────
export function getFixedCosts(params, nicheId) {
  const p = params || {}
  const payroll    = parseFloat(p.payroll || 0)
  const fixedCosts = parseFloat(p.fixedCosts || 0)
  const adBudget   = parseFloat(p.adBudget || 0)
  switch (nicheId) {
    case 'marketplace': return payroll
    case 'infobiz':     return payroll + adBudget
    case 'broker':      return payroll + adBudget
    case 'rental':      return payroll
    case 'event':       return fixedCosts || payroll
    case 'clinic':      return payroll + fixedCosts
    default:            return payroll || 200_000
  }
}

// ─── ВЫРУЧКА ПО НИШЕ ─────────────────────────────────────────
export function getRevenueFromParams(params, nicheId) {
  const p = params || {}
  const direct = parseFloat(p.revenue || 0)
  if (direct > 0) return direct
  switch (nicheId) {
    case 'broker': {
      return parseFloat(p.dealCount || 0) * parseFloat(p.commission || 0)
    }
    case 'rental': {
      const objects = parseFloat(p.objectCount || 1)
      const exit    = parseFloat(p.exitPrice || 0)
      const cycle   = parseFloat(p.packCycle || 4)
      return cycle > 0 ? Math.round(objects * exit / cycle) : 0
    }
    default: return 0
  }
}

// ─── ПРОГНОЗ РОСТА НА 12 МЕС ─────────────────────────────────
export function buildGrowthProjection(monthlyProfit, dividendPct, extraInvestment, marginPct) {
  if (!monthlyProfit || monthlyProfit <= 0) {
    return Array.from({ length: 12 }, (_, i) => ({
      month: `${i + 1} мес`, baseProfit: 0, investProfit: 0,
    }))
  }

  const clampedDiv    = Math.min(Math.max(dividendPct || 0), 95)
  const reinvestRatio = (100 - clampedDiv) / 100
  const marginRatio   = Math.max(0, Math.min((marginPct || 25) / 100, 1))

  const result = []
  let baseAccum   = monthlyProfit
  let investAccum = monthlyProfit + (extraInvestment > 0 ? extraInvestment * marginRatio : 0)

  for (let i = 1; i <= 12; i++) {
    const ramp = Math.min(i, 6) / 6

    const baseReinvest = baseAccum * reinvestRatio * marginRatio * 0.75
    baseAccum = monthlyProfit + baseReinvest * ramp

    const investReinvest = investAccum * reinvestRatio * marginRatio * 0.75
    const investBonus    = extraInvestment > 0 ? extraInvestment * marginRatio * Math.min(i, 3) / 3 : 0
    investAccum = monthlyProfit + investReinvest * ramp + investBonus

    result.push({
      month: `${i} мес`,
      baseProfit:   Math.round(Math.max(0, baseAccum)),
      investProfit: Math.round(Math.max(0, investAccum)),
    })
  }
  return result
}

// ─── ФОРМАТИРОВАНИЕ ──────────────────────────────────────────
export function formatMoney(n) {
  if (n === null || n === undefined || isNaN(n) || n === '') return '—'
  const num = typeof n === 'string' ? parseFloat(n) : n
  if (isNaN(num)) return '—'
  if (Math.abs(num) >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
  if (Math.abs(num) >= 1_000)     return `${Math.round(num / 1_000)}K`
  return String(Math.round(num))
}