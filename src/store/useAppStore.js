import { create } from 'zustand'

const STORAGE_KEY = 'profit_architect_v1'
const PERSIST_KEYS = ['currentStep', 'selectedNiche', 'params', 'dividendClient', 'dividendFund']

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw)
  } catch { return {} }
}

function save(stateObj) {
  try {
    const data = PERSIST_KEYS.reduce((acc, k) => {
      if (stateObj[k] !== undefined) acc[k] = stateObj[k]
      return acc
    }, {})
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {}
}

const defaults = {
  currentStep: 0, selectedNiche: null, params: {},
  diagnostic: null, diagnosticLoading: false, diagnosticError: null,
  dividendClient: 30, dividendFund: 10,
  targetProfit: 0, targetRevenue: 0, targetMargin: 25, targetCosts: 0, reinvest: 0,
  extraInvestment: 0,
}

const saved = loadSaved()

// Zustand-стор — внутренний
const useZustand = create((set, get) => ({
  ...defaults,
  ...saved,
  _set: (updates) => {
    set(updates)
    save({ ...get(), ...updates })
  },
}))

// Хук с совместимым API (state, set, nextStep, prevStep, goToStep, reset)
export function useAppStore() {
  const store = useZustand()

  // state — вложенный объект как раньше (все компоненты используют state.X)
  const state = {
    currentStep:       store.currentStep,
    selectedNiche:     store.selectedNiche,
    params:            store.params,
    diagnostic:        store.diagnostic,
    diagnosticLoading: store.diagnosticLoading,
    diagnosticError:   store.diagnosticError,
    dividendClient:    store.dividendClient,
    dividendFund:      store.dividendFund,
    targetProfit:      store.targetProfit,
    targetRevenue:     store.targetRevenue,
    targetMargin:      store.targetMargin,
    targetCosts:       store.targetCosts,
    reinvest:          store.reinvest,
    extraInvestment:   store.extraInvestment,
  }

  return {
    state,

    set: (updates) => store._set(updates),

    nextStep: () => {
      if (store.currentStep < 7) store._set({ currentStep: store.currentStep + 1 })
    },

    prevStep: () => {
      if (store.currentStep > 0) store._set({ currentStep: store.currentStep - 1 })
    },

    goToStep: (step) => {
      if (step <= store.currentStep || step === 7) store._set({ currentStep: step })
    },

    reset: () => {
      try { localStorage.removeItem(STORAGE_KEY) } catch {}
      store._set({ ...defaults })
    },
  }
}