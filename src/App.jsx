import React from 'react'
import { useAppStore } from './store/useAppStore'
import { StepIndicator } from './components/ui'
import NicheSelector  from './components/NicheSelector'
import ParamsForm     from './components/ParamsForm'
import DiagnosticPanel from './components/DiagnosticPanel'
import FinancialForecast from './components/FinancialForecast'
import InvestCalc     from './components/InvestCalc'

const STEPS = {
  1: NicheSelector,
  2: ParamsForm,
  3: DiagnosticPanel,
  4: FinancialForecast,
  5: InvestCalc,
}

const STEP_LABELS = ['Ниша', 'Параметры', 'Диагностика', 'Прогноз', 'Инвестиции']

export default function App() {
  const { state } = useAppStore()
  const StepComponent = STEPS[state.currentStep] || NicheSelector

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <header style={{
        background: 'var(--bg2)', borderBottom: '1px solid var(--border)',
        padding: '14px 32px', display: 'flex', alignItems: 'center', gap: 16,
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 16, color: '#fff' }}>
          Архитектор <span style={{ color: 'var(--green)' }}>прибыли</span>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text3)', marginLeft: 4 }}>
          MVP · для трекера
        </div>

        {/* Step tabs */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
          {STEP_LABELS.map((label, i) => {
            const step = i + 1
            const active = step === state.currentStep
            const done   = step < state.currentStep
            return (
              <div key={step} style={{
                padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 500,
                background: active ? 'var(--green-dim)' : 'transparent',
                color: active ? 'var(--green)' : done ? 'var(--text2)' : 'var(--text3)',
                border: `1px solid ${active ? 'rgba(45,191,138,.3)' : 'transparent'}`,
              }}>
                {step}. {label}
              </div>
            )
          })}
        </div>
      </header>

      {/* Main content */}
      <main style={{
        flex: 1, maxWidth: 780, width: '100%',
        margin: '0 auto', padding: '40px 24px 80px',
      }}>
        <StepIndicator current={state.currentStep} total={5} />
        <StepComponent />
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border)', padding: '12px 32px',
        fontSize: 11, color: 'var(--text3)', textAlign: 'center',
      }}>
        Архитектор прибыли · Фонд Дашкиева · MVP v0.1 · Прогноз при достижении целевой модели 2.0
      </footer>
    </div>
  )
}
