// ============================================================
// financialMath.js — математика реинвестирования
// ============================================================
// Строит 12 точек роста прибыли для графика-клюшки
// ============================================================

/**
 * Считает прогноз на 12 месяцев при реинвестировании
 * @param {number} monthlyProfit   — чистая прибыль / мес в целевой модели (₽)
 * @param {number} dividendPct     — суммарный % дивидендов (клиент + фонд), 0–100
 * @param {number} extraInvestment — разовые доп. инвестиции в месяц 0 (₽)
 * @param {number} marginPct       — маржинальность в целевой модели, 0–100
 * @returns {Array<{month, baseProfit, investProfit}>} — 12 точек для Recharts
 */
export function buildGrowthProjection(monthlyProfit, dividendPct, extraInvestment, marginPct) {
  const months = 12
  const reinvestRatio = (100 - dividendPct) / 100
  const marginRatio = marginPct / 100

  // Каждый реинвестированный рубль генерирует прибыль пропорционально марже
  // Упрощённая модель: реинвест добавляется к базе следующего месяца
  // Эффект от инвестиций лагируется на 1 мес (реалистично)

  const base = []
  const withInvest = []

  let baseAccum = monthlyProfit
  let investAccum = monthlyProfit + extraInvestment * marginRatio

  for (let i = 1; i <= months; i++) {
    const baseReinvest = baseAccum * reinvestRatio * marginRatio * 0.8 // 0.8 — коэф. реализации
    baseAccum = monthlyProfit + baseReinvest * Math.min(i, 6) / 6      // плавный разгон 6 мес

    const investReinvest = investAccum * reinvestRatio * marginRatio * 0.8
    investAccum = monthlyProfit + investReinvest * Math.min(i, 6) / 6 + (extraInvestment * marginRatio * Math.min(i, 3) / 3)

    base.push({ month: `${i} мес`, baseProfit: Math.round(baseAccum), investProfit: Math.round(investAccum) })
  }

  return base
}

/**
 * Считает целевую прибыль исходя из выручки и целевой маржи
 */
export function calcTargetProfit(revenue, targetMarginPct, fixedCosts) {
  const grossProfit = revenue * targetMarginPct / 100
  return Math.max(0, grossProfit - fixedCosts)
}

/**
 * Форматирует число в читаемый вид: 1 800 000 → «1.8M» или «180K»
 */
export function formatMoney(n) {
  if (!n && n !== 0) return '—'
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (Math.abs(n) >= 1_000) return `${Math.round(n / 1_000)}K`
  return String(Math.round(n))
}

/**
 * Считает разрыв между текущим значением и бенчмарком
 * Возвращает { level: 'weak'|'normal'|'strong', gapText }
 */
export function benchmarkLevel(value, bench) {
  // bench: { weak: '< 10%', normal: '10–20%', strong: '> 25%' }
  // Простейший парсер — берём числа из строк
  const parseNum = (s) => parseFloat((s || '').replace(/[^0-9.]/g, ''))

  const weakNum   = parseNum(bench.weak)
  const strongNum = parseNum(bench.strong)
  const v = typeof value === 'string' ? parseFloat(value) : value

  if (isNaN(v) || isNaN(weakNum)) return { level: 'normal', gapText: '' }

  // Определяем направление (< плохо или > плохо)
  const isLessBad = bench.weak.startsWith('<')  // слабо это "мало"
  if (isLessBad) {
    if (v < weakNum) return { level: 'weak',   gapText: `+${(weakNum - v).toFixed(1)} до нормы` }
    if (v >= strongNum) return { level: 'strong', gapText: '' }
    return { level: 'normal', gapText: `+${(strongNum - v).toFixed(1)} до сильного` }
  } else {
    // слабо это "много" (например, churn, ДРР)
    if (v > weakNum) return { level: 'weak',   gapText: `−${(v - weakNum).toFixed(1)} до нормы` }
    if (v <= strongNum) return { level: 'strong', gapText: '' }
    return { level: 'normal', gapText: `−${(v - strongNum).toFixed(1)} до сильного` }
  }
}
