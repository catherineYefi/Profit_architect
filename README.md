# Архитектор прибыли — MVP

Трекерский диагностический инструмент Фонда Дашкиева.  
За 5–10 минут показывает механику прибыли, узкое место и целевую модель.

---

## Быстрый старт

```bash
# 1. Установить зависимости
npm install

# 2. Создать .env с ключом OpenAI
cp .env.example .env
# Вставь свой ключ: VITE_OPENAI_API_KEY=sk-...

# 3. Запустить локально
npm run dev

# 4. Собрать для деплоя
npm run build
```

---

## Структура проекта

```
src/
├── data/
│   └── nicheConfigs.js     ← СЮДА вставить JSON от Жени
├── services/
│   └── gptService.js       ← интеграция GPT-4o
├── utils/
│   └── financialMath.js    ← математика реинвестирования
├── store/
│   └── useAppStore.js      ← центральный стейт
├── components/
│   ├── NicheSelector.jsx   ← Шаг 1
│   ├── ParamsForm.jsx       ← Шаг 2
│   ├── DiagnosticPanel.jsx  ← Шаг 3
│   ├── FinancialForecast.jsx← Шаг 4
│   ├── InvestCalc.jsx       ← Шаг 5
│   └── ui/index.jsx         ← переиспользуемые компоненты
├── App.jsx                  ← лейаут + роутинг шагов
├── main.jsx
└── index.css
```

---

## Как добавить данные от Жени

1. Женя заполняет форму `niche_config_builder.html`
2. Нажимает «Экспорт JSON» → копирует текст
3. Ты открываешь `src/data/nicheConfigs.js`
4. Вставляешь данные по каждой нише (структура уже есть)
5. `npm run build` → деплой

---

## Деплой на GitHub Pages

```bash
# Разовая настройка:
# 1. Создать репо на GitHub
# 2. В vite.config.js поменять base: '/имя-репо/'
# 3. В Settings → Pages → Source: GitHub Actions

# После каждого пуша в main — деплоится автоматически
git add .
git commit -m "update"
git push origin main
```

---

## Переменные окружения

| Переменная | Описание |
|---|---|
| `VITE_OPENAI_API_KEY` | Ключ OpenAI API (GPT-4o) |

Для GitHub Pages: Settings → Secrets → Actions → New secret.  
Имя: `VITE_OPENAI_API_KEY`

---

## Стек

- React 18 + Vite
- Recharts (графики)
- OpenAI API (GPT-4o)
- GitHub Pages (хостинг)
- Vanilla CSS (дизайн-токены в `index.css`)
