import { useState, useCallback } from 'react'

// Центральное хранилище состояния приложения
// Экспортируем хук useAppStore — используй везде вместо локального useState

const initialState = {
  // Навигация
  currentStep: 1, // 1–5
  
  // Шаг 1 — выбор ниши
  selectedNiche: null, // id ниши: 'marketplace' | 'infobiz' | 'broker' | 'production' | 'b2b'
  
  // Шаг 2 — входные параметры
  params: {}, // { [paramKey]: value }
  
  // Шаг 3 — диагностика (результат от GPT)
  diagnostic: null, // { formulaText, kfuList, model1, model2, levers, wrdp }
  diagnosticLoading: false,
  diagnosticError: null,
  
  // Шаг 4 — финансовый прогноз
  dividendClient: 30,  // % дивидендов клиента
  dividendFund: 10,    // % дивидендов фонда (10–25%)
  
  // Шаг 5 — инвестиционный калькулятор
  extraInvestment: 0,  // доп. инвестиции в рублях
}

// Простой глобальный стор через замыкание + callback
// Для MVP достаточно, потом можно заменить на Zustand

let globalState = { ...initialState }
const listeners = new Set()

function notifyListeners() {
  listeners.forEach(fn => fn({ ...globalState }))
}

export function useAppStore() {
  const [state, setState] = useState({ ...globalState })

  const subscribe = useCallback(() => {
    const handler = (newState) => setState(newState)
    listeners.add(handler)
    return () => listeners.delete(handler)
  }, [])

  // Подписываемся при первом рендере
  useState(() => {
    const unsub = subscribe()
    return unsub
  })

  const set = useCallback((updates) => {
    globalState = { ...globalState, ...updates }
    notifyListeners()
  }, [])

  const goToStep = useCallback((step) => {
    globalState = { ...globalState, currentStep: step }
    notifyListeners()
  }, [])

  const nextStep = useCallback(() => {
    if (globalState.currentStep < 5) {
      globalState = { ...globalState, currentStep: globalState.currentStep + 1 }
      notifyListeners()
    }
  }, [])

  const prevStep = useCallback(() => {
    if (globalState.currentStep > 1) {
      globalState = { ...globalState, currentStep: globalState.currentStep - 1 }
      notifyListeners()
    }
  }, [])

  const reset = useCallback(() => {
    globalState = { ...initialState }
    notifyListeners()
  }, [])

  return { state, set, goToStep, nextStep, prevStep, reset }
}
