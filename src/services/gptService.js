// ============================================================
// gptService.js — диагностика бизнес-модели
// Режим 1: умный mock — анализирует реальные цифры без GPT
// Режим 2: GPT-4o — включается при наличии API ключа
// ============================================================

import { getFundamentals, getMarginFromParams, getRevenueFromParams, NICHE_TARGET_MARGINS } from '../utils/financialMath'
import { BLACKBOX_METRICS, getKpiValue, assessKpi } from '../data/blackboxMetrics'

export async function generateDiagnostic(niche, params) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY

  // Если есть ключ — используем GPT
  if (apiKey && apiKey !== 'sk-...your-key-here...') {
    try {
      return await callGPT(niche, params, apiKey)
    } catch (err) {
      console.warn('GPT недоступен, использую умный mock:', err.message)
      // fallback на mock если GPT упал
    }
  }

  // Умный mock — анализирует реальные цифры
  return buildSmartMock(niche, params)
}

// ─── УМНЫЙ MOCK ──────────────────────────────────────────────
function buildSmartMock(niche, params) {
  // Небольшая задержка для UX
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(analyzeParams(niche, params))
    }, 900)
  })
}

function analyzeParams(niche, params) {
  const nicheId  = niche.id
  const f        = getFundamentals(params, nicheId)
  const tMargin  = NICHE_TARGET_MARGINS[nicheId] || 30
  const kpiDefs  = BLACKBOX_METRICS[nicheId]?.kpis || []
  const fm       = formatM

  // ── Оцениваем каждый КФУ ─────────────────────────────────
  const kpiAssessments = kpiDefs.map(kpi => {
    const val   = getKpiValue(kpi, params)
    const level = assessKpi(kpi, val)
    return { kpi, val, level }
  })

  const weakKpis   = kpiAssessments.filter(a => a.level === 'weak')
  const strongKpis = kpiAssessments.filter(a => a.level === 'strong')
  const mainWeak   = weakKpis[0]

  // ── Формула инсайт ───────────────────────────────────────
  const formulaInsight = buildFormulaInsight(niche, f, tMargin)

  // ── Главное ограничение ──────────────────────────────────
  const mainConstraint = mainWeak
    ? `${mainWeak.kpi.label} — ${mainWeak.kpi.hint}`
    : f.profit === 0
      ? 'Прибыль равна нулю — возможно не все параметры заполнены'
      : `${niche.kfus[0]?.name} — определяет потолок роста прямо сейчас`

  // ── КФУ инсайты ──────────────────────────────────────────
  const kfuInsights = niche.kfus.map((k, i) => {
    const kpiMatch = kpiAssessments.find(a => a.kpi.label.toLowerCase().includes(k.name.toLowerCase().split(' ')[0]))
    if (kpiMatch) {
      if (kpiMatch.level === 'weak')   return `Ниже целевого уровня — это главный тормоз роста`
      if (kpiMatch.level === 'strong') return `На сильном уровне — можно масштабировать`
      return `В рабочей зоне — есть потенциал для улучшения`
    }
    return k.weight === 'high' ? `Приоритет №1 — проверьте этот показатель` : `Важно, но не критично на текущем этапе`
  })

  // ── Модель 1.0 — текущее состояние ───────────────────────
  const model1Summary = buildModel1Summary(niche, f, params, kpiAssessments)

  // ── Модель 2.0 — целевое состояние ───────────────────────
  const model2Summary = buildModel2Summary(niche, f, tMargin)

  // ── Топ рычаг ────────────────────────────────────────────
  const topLever = niche.levers?.find(l => l.flag === 'real')?.action
    || niche.nextStepStreams?.[0]
    || 'Начните с пересборки юнит-экономики'

  // ── WRDP инсайт ──────────────────────────────────────────
  const wrdpInsight = niche.wrdp?.mechanism
    ? `В этом бизнесе прибыль определяется: ${niche.wrdp.mechanism}. ${
        mainWeak
          ? `Сейчас слабое место — ${mainWeak.kpi.label}.`
          : strongKpis.length > 0
            ? `Сильная сторона — ${strongKpis[0].kpi.label}.`
            : 'Заполните все параметры для точного анализа.'
      }`
    : 'Заполните параметры для полного анализа'

  // ── Стримы ───────────────────────────────────────────────
  const streams = buildStreams(niche, f, tMargin)

  // ── Потенциал роста ──────────────────────────────────────
  const growthPotential = buildGrowthPotential(f, tMargin)

  return {
    formulaInsight,
    mainConstraint,
    kfuInsights,
    model1Summary,
    model2Summary,
    topLever,
    wrdpInsight,
    streams,
    realisticGrowth: growthPotential,
    niche,
    params,
    rawRevenue: f.revenue,
  }
}

// ─── ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ─────────────────────────────────

function formatM(n) {
  if (!n || isNaN(n)) return '—'
  if (n >= 1_000_000) return `${(n/1_000_000).toFixed(1)}M ₽`
  if (n >= 1_000)     return `${Math.round(n/1_000)}K ₽`
  return `${n} ₽`
}
const fm = formatM

function buildFormulaInsight(niche, f, tMargin) {
  const hasData = f.revenue > 0

  if (!hasData) {
    return `${niche.formulaShort}. Введите параметры для персонального анализа.`
  }

  const marginGap = tMargin - f.marginPct
  const profitStatus = f.profit > 0
    ? `Текущая прибыль ${fm(f.profit)}/мес при рентабельности ${f.rentPct}%.`
    : `Прибыль пока нулевая — маржа ${f.marginPct}% не перекрывает косты.`

  if (marginGap > 15) {
    return `${profitStatus} До целевой маржи ${tMargin}% — разрыв ${marginGap} п.п. Это главная точка роста: каждый процент маржи при выручке ${fm(f.revenue)} даёт +${fm(f.revenue * 0.01)}/мес прибыли.`
  } else if (marginGap > 5) {
    return `${profitStatus} Маржа в рабочей зоне, до целевых ${tMargin}% — ${marginGap} п.п. При текущей выручке ${fm(f.revenue)} потенциал роста прибыли через маржу: +${fm(f.revenue * marginGap / 100)}/мес.`
  } else {
    return `${profitStatus} Маржа близка к целевому уровню. Основной рычаг — рост выручки при удержании маржи.`
  }
}

function buildModel1Summary(niche, f, params, kpiAssessments) {
  const lines = []

  if (f.revenue > 0) lines.push(`Выручка: ${fm(f.revenue)}/мес`)
  if (f.marginPct > 0) lines.push(`Маржа: ${f.marginPct}% (${fm(f.marginAbs)}/мес)`)
  if (f.profit > 0) lines.push(`Прибыль: ${fm(f.profit)}/мес`)
  if (f.rentPct > 0) lines.push(`Рентабельность: ${f.rentPct}%`)

  // Добавляем слабые КФУ
  const weakOnes = kpiAssessments.filter(a => a.level === 'weak' && a.val !== null)
  weakOnes.slice(0, 2).forEach(a => {
    const formatted = a.kpi.formatAs === 'money' ? fm(a.val) : `${a.val}${a.kpi.unit}`
    lines.push(`${a.kpi.label}: ${formatted} ⚠`)
  })

  if (lines.length === 0) return 'Заполните параметры на шаге 3 для анализа текущей модели'
  return lines.join('\n')
}

function buildModel2Summary(niche, f, tMargin) {
  const lines = []
  const tRevenue = f.revenue > 0 ? Math.round(f.revenue * 1.4) : null
  const tCosts   = f.fixedCosts > 0 ? Math.round(f.fixedCosts * 1.1) : null

  if (tRevenue) {
    const tMarginAbs = Math.round(tRevenue * tMargin / 100)
    const tProfit    = tCosts ? Math.max(0, tMarginAbs - tCosts) : tMarginAbs
    const tRent      = tRevenue > 0 ? parseFloat((tProfit / tRevenue * 100).toFixed(1)) : tMargin

    lines.push(`Выручка: ${fm(tRevenue)}/мес (+40%)`)
    lines.push(`Маржа: ${tMargin}% (${fm(tMarginAbs)}/мес)`)
    lines.push(`Прибыль: ${fm(tProfit)}/мес`)
    lines.push(`Рентабельность: ${tRent}%`)
  }

  // Целевые КФУ
  const kpiDefs = BLACKBOX_METRICS[niche.id]?.kpis || []
  kpiDefs.slice(0, 2).forEach(kpi => {
    lines.push(`${kpi.label}: ${kpi.targetLabel} (цель)`)
  })

  if (lines.length === 0) {
    return niche.benchmarks.slice(0, 3).map(b => `${b.metric}: ${b.strong}`).join('\n')
  }
  return lines.join('\n')
}

function buildStreams(niche, f, tMargin) {
  const revGap    = f.revenue > 0 ? `+${Math.round(f.revenue * 0.4 / 1000)}K/мес` : ''
  const marginGap = f.marginPct > 0 ? `+${tMargin - f.marginPct} п.п.` : `до ${tMargin}%`

  const revenueStream = niche.nextStepStreams?.[0]
    || `Рост выручки ${revGap} через ключевые рычаги ниши`

  const marginStream = niche.wrdp?.mechanism
    ? `Улучшить: ${niche.wrdp.mechanism}`
    : `Повысить маржу ${marginGap} до целевого уровня`

  const costStream = niche.levers?.find(l => l.action.toLowerCase().includes('оптимизир') || l.action.toLowerCase().includes('снизить') || l.action.toLowerCase().includes('убрать'))?.action
    || 'Оптимизировать структуру затрат'

  return {
    revenue: revenueStream,
    margin:  marginStream,
    costs:   costStream,
  }
}

function buildGrowthPotential(f, tMargin) {
  if (!f.revenue || !f.profit) return '2–4× за 12 месяцев при переходе в модель 2.0'

  const tRevenue   = Math.round(f.revenue * 1.4)
  const tCosts     = Math.round(f.fixedCosts * 1.1)
  const tProfit    = Math.max(0, tRevenue * tMargin / 100 - tCosts)
  const multiplier = f.profit > 0 ? (tProfit / f.profit).toFixed(1) : '∞'

  if (f.profit === 0) return `С текущего нуля до ${fm(tProfit)}/мес — фокус на марже`
  return `×${multiplier} прибыли (${fm(f.profit)} → ${fm(tProfit)}/мес) при переходе в модель 2.0`
}

// ─── GPT-4o (включается при наличии ключа) ───────────────────
async function callGPT(niche, params, apiKey) {
  const paramLines = (niche.params || [])
    .map(p => `${p.name}: ${params[p.key] ?? '—'} ${p.unit}`)
    .join('\n')

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'gpt-4o',
      max_tokens: 1500,
      temperature: 0.4,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: buildGPTPrompt(niche, paramLines) },
      ],
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || `OpenAI error ${res.status}`)
  }

  const data = await res.json()
  const raw  = data.choices?.[0]?.message?.content || ''

  try {
    const clean  = raw.replace(/```json/g, '').replace(/```/g, '').trim()
    const parsed = JSON.parse(clean)
    return { ...parsed, niche, params, rawRevenue: parseFloat(params.revenue || 0) }
  } catch {
    // GPT вернул не JSON — используем mock
    return analyzeParams(niche, params)
  }
}

const SYSTEM_PROMPT = `Ты — старший трекер бизнеса Фонда Дашкиева.
Анализируй финансовые показатели бизнеса и возвращай ТОЛЬКО валидный JSON без markdown.
Формат строго:
{
  "formulaInsight": "1–2 предложения о механике прибыли с конкретными цифрами",
  "mainConstraint": "главное ограничение прибыли — 1 предложение",
  "kfuInsights": ["инсайт по КФУ 1", "инсайт по КФУ 2", "..."],
  "model1Summary": "текущие показатели с цифрами, по строке на метрику",
  "model2Summary": "целевые показатели с конкретными ориентирами",
  "topLever": "самый важный рычаг прямо сейчас",
  "wrdpInsight": "что реально двигает прибыль в этом конкретном бизнесе",
  "streams": {
    "revenue": "узкое место по выручке",
    "margin": "узкое место по марже",
    "costs": "узкое место по костам"
  },
  "realisticGrowth": "потенциал роста прибыли за 12 мес"
}`

function buildGPTPrompt(niche, paramLines) {
  return `Ниша: ${niche.name}
Тип бизнеса: ${niche.businessType}
Главный вывод: ${niche.mainConclusion}

Формула: ${niche.formulaShort}
Механизм прибыли: ${niche.wrdp?.mechanism || ''}
Ложный драйвер: ${niche.wrdp?.falseDriver || ''}

КФУ:
${(niche.kfus || []).map((k,i) => `${i+1}. ${k.name} — ${k.why}`).join('\n')}

Текущие показатели:
${paramLines}

Бенчмарки:
${(niche.benchmarks || []).map(b => `${b.metric}: слабо — ${b.weak} / норма — ${b.normal} / сильно — ${b.strong}`).join('\n')}

Подсказка: ${niche.gptHint || ''}

Дай глубокий анализ именно этих цифр. Называй конкретные числа. Не давай общих фраз.`
}