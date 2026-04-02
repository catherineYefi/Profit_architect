// ============================================================
// gptService.js — интеграция с OpenAI GPT-4o
// ============================================================
// Принимает нишу + введённые параметры + nicheConfig
// Возвращает структурированный анализ для шага 3
// ============================================================

/**
 * Главная функция — генерирует диагностику бизнеса
 * @param {object} niche       — конфиг ниши из nicheConfigs.js
 * @param {object} params      — введённые пользователем значения { [paramKey]: value }
 * @returns {object}           — { formulaText, kfuInsights, model1, model2, levers, wrdpInsight, streams }
 */
export async function generateDiagnostic(niche, params) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  if (!apiKey) throw new Error('VITE_OPENAI_API_KEY не задан в .env')

  const paramLines = (niche.params || [])
    .map(p => `${p.name}: ${params[p.key] ?? '—'} ${p.unit}`)
    .join('\n')

  const prompt = buildPrompt(niche, paramLines)

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      max_tokens: 1500,
      temperature: 0.4,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: prompt },
      ],
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || `OpenAI error ${res.status}`)
  }

  const data = await res.json()
  const raw = data.choices?.[0]?.message?.content || ''

  return parseResponse(raw, niche, params)
}

// ============================================================
// SYSTEM PROMPT — роль и формат ответа
// ============================================================
const SYSTEM_PROMPT = `Ты — старший трекер бизнеса и эксперт по бизнес-моделям.
Твоя задача: за 5–10 минут помочь трекеру увидеть механику прибыли клиента, узкое место и целевую модель.
Отвечай ТОЛЬКО валидным JSON без markdown, без пояснений вокруг JSON.
Формат ответа строго:
{
  "formulaInsight": "1–2 предложения: как работает формула прибыли в этом бизнесе",
  "mainConstraint": "1 предложение: что сейчас главное ограничение прибыли",
  "kfuInsights": ["краткий инсайт по КФУ 1", "краткий инсайт по КФУ 2", "..."],
  "model1Summary": "3–4 ключевых параметра текущей модели с оценкой",
  "model2Summary": "3–4 ключевых параметра целевой модели с конкретными ориентирами",
  "topLever": "самый важный рычаг роста прямо сейчас — 1 предложение",
  "wrdpInsight": "1–2 предложения: что реально двигает прибыль в этом конкретном бизнесе",
  "streams": {
    "revenue": "конкретное узкое место по выручке",
    "margin": "конкретное узкое место по марже",
    "costs": "конкретное узкое место по костам"
  },
  "realisticGrowth": "оценка потенциала роста прибыли за 12 мес при переходе в модель 2.0 — в %"
}`

// ============================================================
// Сборка промпта
// ============================================================
function buildPrompt(niche, paramLines) {
  return `Ниша: ${niche.name}
  
Формула прибыли в этой нише:
${niche.formulaShort}
${niche.formulaLong}

Главный механизм прибыли: ${niche.wrdp?.mechanism || ''}
Ложный драйвер: ${niche.wrdp?.falseDriver || ''}
Ошибка масштаба: ${niche.wrdp?.scalingMistake || ''}

КФУ (в порядке влияния):
${(niche.kfus || []).map((k, i) => `${i + 1}. ${k.name} — ${k.why}`).join('\n')}

Дополнительный контекст: ${niche.gptHint || ''}
Типичные ошибки: ${niche.mistake1 || ''}, ${niche.mistake2 || ''}

Текущие показатели бизнеса:
${paramLines}

Бенчмарки (слабо / нормально / сильно):
${(niche.benchmarks || []).map(b => `${b.metric}: слабо ${b.weak} / нормально ${b.normal} / сильно ${b.strong}`).join('\n')}

Проанализируй этот бизнес и верни JSON по формату.`
}

// ============================================================
// Парсер ответа GPT
// ============================================================
function parseResponse(raw, niche, params) {
  try {
    // Убираем возможные markdown-блоки
    const clean = raw.replace(/```json/g, '').replace(/```/g, '').trim()
    const parsed = JSON.parse(clean)
    return {
      ...parsed,
      niche,
      params,
      // Добавляем сырые данные для расчётов на шагах 4–5
      rawRevenue: parseFloat(params['revenue'] || params['выручка'] || 0),
    }
  } catch {
    // Fallback если GPT вернул не JSON
    return {
      formulaInsight: 'Не удалось распарсить ответ GPT. Попробуй ещё раз.',
      mainConstraint: '',
      kfuInsights: [],
      model1Summary: '',
      model2Summary: '',
      topLever: '',
      wrdpInsight: '',
      streams: { revenue: '', margin: '', costs: '' },
      realisticGrowth: '',
      niche,
      params,
      rawRevenue: 0,
    }
  }
}
