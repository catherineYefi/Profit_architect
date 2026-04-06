import React from 'react'
import { useAppStore } from './store/useAppStore'
import { StepIndicator } from './components/ui'
import NicheSelector    from './components/NicheSelector'
import ParamsForm       from './components/ParamsForm'
import DiagnosticPanel  from './components/DiagnosticPanel'
import FinancialForecast from './components/FinancialForecast'
import InvestCalc       from './components/InvestCalc'
import NichePreview from './components/NichePreview'
import Summary from './components/Summary'

const STEPS = {
  1: NicheSelector,
  2: ParamsForm,
  3: DiagnosticPanel,
  4: FinancialForecast,
  5: InvestCalc,
  6: Summary,
}

const STEP_LABELS = ['Ниша','Превью','Параметры','Диагностика','Прогноз','Итог']

export default function App() {
  const { state, set, nextStep, prevStep } = useAppStore()
  const StepComponent = STEPS[state.currentStep] || NicheSelector
  const current = state.currentStep

  const goToStep = (step) => {
    // Можно переходить только на пройденные шаги или текущий
    if (step <= current) {
      set({ currentStep: step })
    }
  }

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
        <div style={{ fontSize: 11, color: 'var(--text3)' }}>MVP · для трекера</div>

        {/* Кликабельные шаги */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
          {STEP_LABELS.map((label, i) => {
            const step    = i + 1
            const active  = step === current
            const done    = step < current
            const future  = step > current
            return (
              <button
                key={step}
                onClick={() => goToStep(step)}
                disabled={future}
                style={{
                  padding: '5px 11px', borderRadius: 6, fontSize: 11, fontWeight: 500,
                  border: active ? '1px solid rgba(45,191,138,.4)' : '1px solid transparent',
                  background: active ? 'var(--green-dim)' : done ? 'rgba(255,255,255,.04)' : 'transparent',
                  color: active ? 'var(--green)' : done ? 'var(--text2)' : 'var(--text3)',
                  cursor: future ? 'not-allowed' : 'pointer',
                  transition: 'all .15s',
                  textDecoration: done ? 'underline' : 'none',
                  textDecorationColor: 'var(--border2)',
                }}
              >
                {step}. {label}
              </button>
            )
          })}
        </div>
      </header>

      {/* Main */}
      <main style={{
        flex: 1, maxWidth: 780, width: '100%',
        margin: '0 auto', padding: '40px 24px 100px',
      }}>
        <StepIndicator current={current} total={6} />
        <StepComponent />
      </main>

      {/* Нижняя навигация — всегда видна */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'var(--bg2)', borderTop: '1px solid var(--border)',
        padding: '12px 32px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', zIndex: 9,
      }}>
        {/* Назад */}
        <button
          onClick={prevStep}
          disabled={current === 1}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'none', border: '1px solid var(--border)',
            borderRadius: 8, padding: '8px 16px',
            color: current === 1 ? 'var(--text3)' : 'var(--text2)',
            fontSize: 13, cursor: current === 1 ? 'not-allowed' : 'pointer',
            opacity: current === 1 ? 0.4 : 1, transition: 'all .15s',
          }}
        >
          ← {current > 1 ? STEP_LABELS[current - 2] : 'Назад'}
        </button>

        {/* Точки прогресса */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {STEP_LABELS.map((label, i) => {
            const step   = i + 1
            const active = step === current
            const done   = step < current
            return (
              <button
                key={step}
                onClick={() => goToStep(step)}
                disabled={step > current}
                title={label}
                style={{
                  width: active ? 24 : 8,
                  height: 8, borderRadius: 4,
                  background: active ? 'var(--green)' : done ? 'rgba(45,191,138,.4)' : 'var(--border)',
                  border: 'none', cursor: step > current ? 'not-allowed' : 'pointer',
                  transition: 'all .25s', padding: 0,
                }}
              />
            )
          })}
        </div>

        {/* Вперёд */}
        <button
          onClick={nextStep}
          disabled={current === 6}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: current === 6 ? 'none' : 'var(--green)',
            border: current === 6 ? '1px solid var(--border)' : 'none',
            borderRadius: 8, padding: '8px 16px',
            color: current === 6 ? 'var(--text3)' : '#0D0F14',
            fontSize: 13, fontWeight: current === 6 ? 400 : 700,
            cursor: current === 6 ? 'not-allowed' : 'pointer',
            opacity: current === 6 ? 0.4 : 1, transition: 'all .15s',
          }}
        >
          {current < 6 ? STEP_LABELS[current] : 'Готово'} →
        </button>
      </div>

      <div style={{
        paddingBottom: 60,
        textAlign: 'center', fontSize: 11, color: 'var(--text3)',
        padding: '8px 0 70px',
      }}>
        Прогноз при достижении целевой модели 2.0
      </div>
    </div>
  )
}
