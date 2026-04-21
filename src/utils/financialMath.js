// ============================================================
// financialMath.js — финансовая математика
// ============================================================
// ВАЖНАЯ АРХИТЕКТУРНАЯ ЗАМЕТКА:
// getMarginFromParams() возвращает ОПЕРАЦИОННУЮ МАРЖУ —
// для marketplace это ВАЛОВАЯ маржа (до ФОТ),
// для остальных ниш — чистая после всех переменных и постоянных затрат.
// Поэтому прибыль считается через getNetProfit(), а не через margin - costs.
// ============================================================

// ─── ЦЕЛЕВЫЕ МАРЖИ ───────────────────────────────────────────
export const NICHE_TARGET_MARGINS = {
  marketplace: 25,
  infobiz:     40,
  broker:      30,
  rental:      35,
  event:       35,
  clinic:      35,
  production:  25,
  b2b:         30,
}

// ─── ЧИСТАЯ ПРИБЫЛЬ НАПРЯМУЮ ─────────────────────────────────
// Правильно считает прибыль для каждой ниши без двойного вычета костов
export function getNetProfit(params, nicheId) {
  const p = params || {}

  switch (nicheId) {
    case 'marketplace': {
      // Маржа вводится как % после комиссий МП и рекламы, но ДО ФОТ
      const rev    = parseFloat(p.revenue || 0)
      const margin = parseFloat(p.orderMargin || 0)
      const payroll = parseFloat(p.payroll || 0)
      return Math.max(0, rev * margin / 100 - payroll)
    }

    case 'infobiz': {
      // Маржа = (выручка - реклама - ФОТ) / выручка
      // Значит profit = выручка - реклама - ФОТ
      const rev = parseFloat(p.revenue || 0)
      const ad  = parseFloat(p.adBudget || 0)
      const pay = parseFloat(p.payroll || 0)
      return Math.max(0, rev - ad - pay)
    }

    case 'broker': {
      // Выручка = сделки × комиссия, косты = ФОТ + реклама
      const deals = parseFloat(p.dealCount || 0)
      const comm  = parseFloat(p.commission || 0)
      const pay   = parseFloat(p.payroll || 0)
      const ad    = parseFloat(p.adBudget || 0)
      return Math.max(0, deals * comm - pay - ad)
    }

    case 'rental': {
      // Прибыль = (цена выхода - вход - подготовка) × объекты / цикл - ФОТ
      const exit    = parseFloat(p.exitPrice || 0)
      const entry   = parseFloat(p.entryPrice || 0)
      const prep    = parseFloat(p.prepCost || 0)
      const objects = parseFloat(p.objectCount || 1)
      const cycle   = parseFloat(p.packCycle || 4)
      const payroll = parseFloat(p.payroll || 0)
      const profitPerObj = exit - entry - prep
      return cycle > 0 ? Math.max(0, (profitPerObj * objects / cycle) - payroll) : 0
    }

    case 'event': {
      // Прибыль = выручка - постоянные косты
      const rev   = parseFloat(p.revenue || 0)
      const fixed = parseFloat(p.fixedCosts || p.payroll || 0)
      return Math.max(0, rev - fixed)
    }

    case 'clinic': {
      // Прибыль = выручка - ФОТ - постоянные - переменные мед.косты
      const rev   = parseFloat(p.revenue || 0)
      const pay   = parseFloat(p.payroll || 0)
      const fixed = parseFloat(p.fixedCosts || 0)
      const medC  = parseFloat(p.medCosts || 0)
      const ops   = parseFloat(p.operationCount || 0)
      return Math.max(0, rev - pay - fixed - medC * ops)
    }

    default: {
      const rev    = parseFloat(p.revenue || 0)
      const margin = parseFloat(p.orderMargin || p.margin || 20)
      const pay    = parseFloat(p.payroll || 200_000)
      return Math.max(0, rev * margin / 100 - pay)
    }
  }
}

// ─── ВЫРУЧКА ─────────────────────────────────────────────────
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

// ─── МАРЖА % ─────────────────────────────────────────────────
// Возвращает операционную маржу для отображения в UI
// Для marketplace — валовая (ДО ФОТ), для остальных — по факту вычисленная
export function getMarginFromParams(params, nicheId) {
  const p   = params || {}
  const rev = getRevenueFromParams(params, nicheId)

  switch (nicheId) {
    case 'marketplace':
      return parseFloat(p.orderMargin || 0)

    default: {
      // Для остальных ниш — считаем маржу из прибыли
      const profit = getNetProfit(params, nicheId)
      return rev > 0 ? parseFloat((profit / rev * 100).toFixed(1)) : 0
    }
  }
}

// ─── ПОСТОЯННЫЕ КОСТЫ ────────────────────────────────────────
// Используется только для P&L-таблицы (строка "Косты")
export function getFixedCosts(params, nicheId) {
  const p       = params || {}
  const payroll = parseFloat(p.payroll || 0)
  const fixed   = parseFloat(p.fixedCosts || 0)
  const ad      = parseFloat(p.adBudget || 0)
  switch (nicheId) {
    case 'marketplace': return payroll
    case 'infobiz':     return payroll + ad
    case 'broker':      return payroll + ad
    case 'rental':      return payroll
    case 'event':       return fixed || payroll
    case 'clinic':      return payroll + fixed + parseFloat(p.medCosts || 0) * parseFloat(p.operationCount || 0)
    default:            return payroll || 200_000
  }
}

// ─── 5 ФУНДАМЕНТАЛЬНЫХ МЕТРИК ────────────────────────────────
export function getFundamentals(params, nicheId) {
  const revenue    = getRevenueFromParams(params, nicheId)
  const profit     = getNetProfit(params, nicheId)
  const fixedCosts = getFixedCosts(params, nicheId)

  // Маржа в ₽ — выручка минус все переменные затраты (до постоянных)
  // Для marketplace это gross margin, для других — net
  const marginPct  = getMarginFromParams(params, nicheId)
  const marginAbs  = revenue > 0 ? Math.round(revenue * marginPct / 100) : 0

  // Рентабельность = чистая прибыль / выручка
  const rentPct    = revenue > 0 && profit > 0
    ? parseFloat((profit / revenue * 100).toFixed(1))
    : 0

  return { revenue, marginPct, marginAbs, profit, rentPct, fixedCosts }
}

// ─── ПРОГНОЗ РОСТА 12 МЕС ────────────────────────────────────
export function buildGrowthProjection(monthlyProfit, reinvestPct, extraInvestment, marginPct) {
  if (!monthlyProfit || monthlyProfit <= 0) {
    return Array.from({ length: 12 }, (_, i) => ({
      month: `${i + 1} мес`, baseProfit: 0, investProfit: 0,
    }))
  }

  const reinvestRatio = Math.max(0, Math.min((reinvestPct || 0) / 100, 0.95))
  const marginRatio   = Math.max(0, Math.min((marginPct || 25) / 100, 1))

  const result = []
  let baseAccum   = monthlyProfit
  let investAccum = monthlyProfit + (extraInvestment > 0 ? extraInvestment * marginRatio : 0)

  for (let i = 1; i <= 12; i++) {
    const ramp = Math.min(i, 6) / 6
    const baseReinvest   = baseAccum   * reinvestRatio * marginRatio * 0.75
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