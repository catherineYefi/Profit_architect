// gptService.js — режим без GPT API
// Генерирует диагностику из nicheConfigs без внешних запросов
// Когда будет готов API ключ — раскомментируй настоящий вызов

export async function generateDiagnostic(niche, params) {
  // Имитируем небольшую задержку для UX
  await new Promise(r => setTimeout(r, 800))

  const revenue = parseFloat(params?.revenue || 0)
  const margin  = parseFloat(params?.orderMargin || params?.margin || 20)

  // Находим главный КФУ (первый с weight=high)
  const mainKFU = niche.kfus?.find(k => k.weight === 'high') || niche.kfus?.[0]

  // Находим слабый бенчмарк по текущим данным
  const weakBench = niche.benchmarks?.find(b => {
    const val = parseFloat(b.weak?.replace(/[^0-9.]/g, '') || '0')
    return margin < val
  })

  return {
    formulaInsight: `${niche.wrdp?.mechanism
      ? `Прибыль в этой нише держится на: ${niche.wrdp.mechanism}.`
      : `Формула прибыли: ${niche.formulaShort}`
    } Посмотри на каждый множитель — где самое слабое место?`,

    mainConstraint: mainKFU
      ? `${mainKFU.name} — ${mainKFU.why}`
      : 'Введите параметры для точного анализа',

    kfuInsights: niche.kfus?.map(k =>
      k.weight === 'high'
        ? `Приоритет №1 — именно это ограничивает рост прямо сейчас`
        : `Важно, но только после решения главного ограничения`
    ) || [],

    model1Summary: revenue
      ? `Выручка: ${(revenue / 1e6).toFixed(1)}M ₽/мес\nМаржа: ${margin}%\nПрибыль: ~${((revenue * margin / 100) / 1e3).toFixed(0)}K ₽/мес`
      : 'Заполните параметры на шаге 2',

    model2Summary: niche.benchmarks?.slice(0, 3)
      .map(b => `${b.metric}: ${b.strong}`)
      .join('\n') || 'Данные бенчмарков не заполнены',

    topLever: niche.levers?.find(l => l.flag === 'real')?.action || '',

    wrdpInsight: niche.wrdp?.falseDriver
      ? `Ловушка: ${niche.wrdp.falseDriver}. ${niche.wrdp.scalingMistake || ''}`
      : niche.wrdp?.mechanism || '',

    streams: {
      revenue: 'Как растим выручку без роста затрат',
      margin:  'Как повышаем маржу через выбор ниши товара',
      costs:   'Как контролируем и снижаем косты',
    },

    realisticGrowth: '2–4× за 12 месяцев при переходе в модель 2.0',
    niche,
    params,
    rawRevenue: revenue,
  }
}
