// ============================================================
// useAppStore.js — центральный стейт на Zustand
// + localStorage для сохранения сессии
// ============================================================
import { create } from 'zustand'

const STORAGE_KEY = 'profit_architect_session'

// Что сохраняем в localStorage (не всё — диагностику не сохраняем)
const PERSIST_KEYS = ['currentStep', 'selectedNiche', 'params', 'dividendClient', 'dividendFund']

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    // Безопасно берём только нужные ключи
    return PERSIST_KEYS.reduce((acc, key) => {
      if (parsed[key] !== undefined) acc[key] = parsed[key]
      return acc
    }, {})
  } catch {
    return {}
  }
}

function saveToStorage(state) {
  try {
    const toSave = PERSIST_KEYS.reduce((acc, key) => {
      if (state[key] !== undefined) acc[key] = state[key]
      return acc
    }, {})
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
  } catch {
    // localStorage недоступен — просто игнорируем
  }
}

// Начальное состояние с восстановлением из localStorage
const savedState = loadFromStorage()

const initialState = {
  // Навигация
  currentStep: 0,

  // Шаг 1 — выбор ниши
  selectedNiche: null,

  // Шаг 3 — параметры
  params: {},

  // Шаг 4 — диагностика (не персистируется)
  diagnostic:        null,
  diagnosticLoading: false,
  diagnosticError:   null,

  // Шаг 5 — финансовый прогноз
  dividendClient: 30,
  dividendFund:   10,

  // Шаг 5 → 6 — передача целевых значений
  targetProfit:  0,
  targetRevenue: 0,
  targetMargin:  25,
  targetCosts:   0,
  reinvest:      0,

  // Шаг 6 — инвестиции
  extraInvestment: 0,
}

export const useAppStore = create((set, get) => ({
  // Мержим initialState с сохранёнными данными
  ...initialState,
  ...savedState,

  // ─── Общий setter ───────────────────────────────────────
  set: (updates) => {
    set(updates)
    // Сохраняем в localStorage после каждого изменения
    saveToStorage({ ...get(), ...updates })
  },

  // ─── Навигация ──────────────────────────────────────────
  nextStep: () => {
    const current = get().currentStep
    if (current < 7) {
      const next = current + 1
      set({ currentStep: next })
      saveToStorage({ ...get(), currentStep: next })
    }
  },

  prevStep: () => {
    const current = get().currentStep
    if (current > 0) {
      const prev = current - 1
      set({ currentStep: prev })
      saveToStorage({ ...get(), currentStep: prev })
    }
  },

  goToStep: (step) => {
    const current = get().currentStep
    if (step <= current || step === 7) {
      set({ currentStep: step })
      saveToStorage({ ...get(), currentStep: step })
    }
  },

  // ─── Сброс сессии ───────────────────────────────────────
  reset: () => {
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
    set({ ...initialState })
  },
}))