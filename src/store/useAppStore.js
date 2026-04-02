import { useState, useEffect, useCallback } from 'react'

const initialState = {
  currentStep: 1,
  selectedNiche: null,
  params: {},
  diagnostic: null,
  diagnosticLoading: false,
  diagnosticError: null,
  dividendClient: 30,
  dividendFund: 10,
  extraInvestment: 0,
  targetProfit: 0,
  targetRevenue: 0,
  targetMargin: 25,
  targetCosts: 0,
  reinvest: 0,
}

let globalState = { ...initialState }
const listeners = new Set()

function notifyListeners() {
  listeners.forEach(fn => fn({ ...globalState }))
}

export function useAppStore() {
  const [state, setState] = useState({ ...globalState })

  useEffect(() => {
    const handler = (newState) => setState(newState)
    listeners.add(handler)
    setState({ ...globalState })
    return () => listeners.delete(handler)
  }, [])

  const set = useCallback((updates) => {
    globalState = { ...globalState, ...updates }
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

  return { state, set, nextStep, prevStep, reset }
}