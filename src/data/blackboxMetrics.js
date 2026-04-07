// ============================================================
// blackboxMetrics.js — КФУ-метрики для BlackBox визуала
// ============================================================
// Для каждой ниши определяет:
// - kpis: 3 ключевых показателя (берутся из params пользователя)
// - для каждого: ключ, название, единица, целевое значение
// ============================================================

export const BLACKBOX_METRICS = {

  marketplace: {
    kpis: [
      {
        key: 'orderMargin',
        label: 'Чистая маржа',
        unit: '%',
        targetValue: 25,
        targetLabel: '25%+',
        higherBetter: true,
        hint: 'После комиссий МП, логистики, рекламы',
      },
      {
        key: 'drr',
        label: 'ДРР / TACoS',
        unit: '%',
        targetValue: 10,
        targetLabel: '< 10%',
        higherBetter: false,
        hint: 'Доля рекламных расходов от выручки',
      },
      {
        key: 'turnover',
        label: 'Оборачиваемость',
        unit: 'дн',
        targetValue: 30,
        targetLabel: '< 30 дн',
        higherBetter: false,
        hint: 'Скорость возврата капитала из товара',
      },
    ],
  },

  infobiz: {
    kpis: [
      {
        key: 'ltv',
        label: 'LTV клиента',
        unit: '₽',
        targetLabel: 'LTV > 3×CAC',
        higherBetter: true,
        hint: 'Суммарная ценность клиента в продуктовой линейке',
        formatAs: 'money',
      },
      {
        key: 'cac',
        label: 'CAC',
        unit: '₽',
        targetLabel: 'CAC окупается за 3 мес',
        higherBetter: false,
        hint: 'Стоимость привлечения одного платящего клиента',
        formatAs: 'money',
      },
      {
        key: 'conversion',
        label: 'Конверсия воронки',
        unit: '%',
        targetValue: 3,
        targetLabel: '3%+',
        higherBetter: true,
        hint: 'Лид → оплата первого продукта',
      },
    ],
  },

  broker: {
    kpis: [
      {
        key: 'commissionPct',
        label: '% комиссии застройщика',
        unit: '%',
        targetValue: 4.5,
        targetLabel: '4.5%+',
        higherBetter: true,
        hint: 'Главный мультипликатор — сдвиг условий меняет прибыль кратно',
      },
      {
        key: 'conversion',
        label: 'Конверсия лид → сделка',
        unit: '%',
        targetValue: 2,
        targetLabel: '2%+',
        higherBetter: true,
        hint: 'Дырявая воронка превращает трафик в дорогой шум',
      },
      {
        key: 'brokerRevenue',
        label: 'Выручка на брокера',
        unit: '₽/мес',
        targetValue: 500000,
        targetLabel: '500K+/мес',
        higherBetter: true,
        hint: 'Производительность брокера без хаоса и перегруза',
        formatAs: 'money',
      },
    ],
  },

  rental: {
    kpis: [
      {
        key: '_discount',           // computed: (exitPrice - entryPrice) / exitPrice * 100
        label: 'Входной дисконт',
        unit: '%',
        targetValue: 25,
        targetLabel: '25%+',
        higherBetter: true,
        computed: true,
        hint: 'Запас прибыли закладывается при входе в объект',
      },
      {
        key: 'yield',
        label: 'Yield для инвестора',
        unit: '%',
        targetValue: 12,
        targetLabel: '12%+',
        higherBetter: true,
        hint: 'То, что инвестор реально покупает в экономическом смысле',
      },
      {
        key: 'packCycle',
        label: 'Срок упаковки',
        unit: 'мес',
        targetValue: 3,
        targetLabel: '< 3 мес',
        higherBetter: false,
        hint: 'Чем дольше цикл — тем сильнее сгорает капитал и маржа',
      },
    ],
  },

  event: {
    kpis: [
      {
        key: 'loadFactor',
        label: 'Загрузка площадки',
        unit: '%',
        targetValue: 70,
        targetLabel: '70%+',
        higherBetter: true,
        hint: 'Пустой слот — мёртвый актив, нельзя продать задним числом',
      },
      {
        key: 'eventAvgCheck',
        label: 'Чек мероприятия',
        unit: '₽',
        targetValue: 80000,
        targetLabel: '80K+',
        higherBetter: true,
        hint: 'Именно чек события определяет сильную ивент-модель',
        formatAs: 'money',
      },
      {
        key: 'eventShare',
        label: 'Доля ивент-выручки',
        unit: '%',
        targetValue: 60,
        targetLabel: '60%+',
        higherBetter: true,
        hint: 'Корпоративы, ДР, банкеты = основная прибыль',
      },
    ],
  },

  clinic: {
    kpis: [
      {
        key: 'consultConversion',
        label: 'Конверсия консультации',
        unit: '%',
        targetValue: 50,
        targetLabel: '50%+',
        higherBetter: true,
        hint: 'Главный этап, где деньги либо появляются, либо исчезают',
      },
      {
        key: 'avgCheck',
        label: 'Средний чек операции',
        unit: '₽',
        targetValue: 250000,
        targetLabel: '250K+',
        higherBetter: true,
        hint: 'Доверие позволяет брать премию к рынку',
        formatAs: 'money',
      },
      {
        key: 'capacityLoad',
        label: 'Загрузка операционных',
        unit: '%',
        targetValue: 80,
        targetLabel: '80%+',
        higherBetter: true,
        hint: 'Пустая дорогая мощность разрушает экономику клиники',
      },
    ],
  },
}

// ─── Получить текущее значение KPI из params ─────────────────
export function getKpiValue(kpi, params) {
  if (!kpi.computed) {
    const raw = params?.[kpi.key]
    return raw !== undefined && raw !== '' ? parseFloat(raw) : null
  }
  // Вычисляемые значения
  if (kpi.key === '_discount') {
    const exit  = parseFloat(params?.exitPrice || 0)
    const entry = parseFloat(params?.entryPrice || 0)
    return exit > 0 ? Math.round((exit - entry) / exit * 100) : null
  }
  return null
}

// ─── Форматировать значение KPI ──────────────────────────────
export function formatKpiValue(kpi, value) {
  if (value === null || value === undefined || isNaN(value)) return '—'
  if (kpi.formatAs === 'money') {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M ₽`
    if (value >= 1_000)     return `${Math.round(value / 1_000)}K ₽`
    return `${value} ₽`
  }
  return `${value}${kpi.unit}`
}

// ─── Оценить уровень KPI (для цветового индикатора) ──────────
export function assessKpi(kpi, value) {
  if (value === null || !kpi.targetValue) return 'neutral'
  const ratio = value / kpi.targetValue
  if (kpi.higherBetter) {
    if (ratio >= 0.9)  return 'strong'   // >= 90% от цели → зелёный
    if (ratio >= 0.6)  return 'normal'   // >= 60% → жёлтый
    return 'weak'
  } else {
    // Меньше = лучше (ДРР, оборачиваемость, срок)
    if (ratio <= 1.1)  return 'strong'   // не хуже цели → зелёный
    if (ratio <= 1.5)  return 'normal'
    return 'weak'
  }
}