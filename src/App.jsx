import React from 'react'
import { useAppStore } from './store/useAppStore'
import Welcome         from './components/Welcome'
import NicheSelector   from './components/NicheSelector'
import NichePreview    from './components/NichePreview'
import ParamsForm      from './components/ParamsForm'
import DiagnosticPanel from './components/DiagnosticPanel'
import FinancialForecast from './components/FinancialForecast'
import InvestCalc      from './components/InvestCalc'
import Summary         from './components/Summary'

const STEPS = {
  0: Welcome,
  1: NicheSelector,
  2: NichePreview,
  3: ParamsForm,
  4: DiagnosticPanel,
  5: FinancialForecast,
  6: InvestCalc,
  7: Summary,
}

const STEP_LABELS = ['Ниша', 'Превью', 'Параметры', 'Диагностика', 'Прогноз', 'Инвестиции', 'Итог']

export default function App() {
  const { state, set, nextStep, prevStep, goToStep } = useAppStore()
  const StepComponent = STEPS[state.currentStep] || Welcome
  const current = state.currentStep
  const isWelcome = current === 0

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>

      {/* Header — скрыт на экране Welcome */}
      {!isWelcome && (
        <header style={{
          background: 'var(--bg2)', borderBottom: '1px solid var(--border)',
          padding: '12px 28px', display: 'flex', alignItems: 'center', gap: 16,
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          {/* Логотип — кликабельный, ведёт на Welcome */}
          <button
            onClick={() => set({ currentStep: 0 })}
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, padding: 0 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
            </svg>
            <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 15, color: '#fff' }}>
              Архитектор <span style={{ color: 'var(--green)' }}>прибыли</span>
            </div>
          </button>
          <div style={{ fontSize: 10, color: 'var(--text3)', paddingLeft: 4, borderLeft: '1px solid var(--border)' }}>
            Beta
          </div>

          {/* Шаги — только номер, название в title */}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 3 }}>
            {STEP_LABELS.map((label, i) => {
              const step   = i + 1
              const active = step === current
              const done   = step < current
              const future = step > current
              return (
                <button
                  key={step}
                  onClick={() => goToStep(step)}
                  disabled={future}
                  title={label}
                  style={{
                    padding: '5px 10px', borderRadius: 6, fontSize: 11, fontWeight: 500,
                    border: active ? '1px solid rgba(45,191,138,.4)' : '1px solid transparent',
                    background: active ? 'var(--green-dim)' : done ? 'rgba(255,255,255,.04)' : 'transparent',
                    color: active ? 'var(--green)' : done ? 'var(--text2)' : 'var(--text3)',
                    cursor: future ? 'not-allowed' : 'pointer',
                    transition: 'all .15s',
                    textDecoration: done ? 'underline' : 'none',
                    textDecorationColor: 'var(--border2)',
                  }}
                >
                  {step}
                </button>
              )
            })}
          </div>
        </header>
      )}

      {/* Main */}
      <main style={{
        flex: 1,
        maxWidth: isWelcome ? '100%' : 780,
        width: '100%',
        margin: '0 auto',
        padding: isWelcome ? 0 : '36px 24px 100px',
      }}>
        <StepComponent />
      </main>

      {/* Bottom nav — скрыта на Welcome и Summary */}
      {!isWelcome && current !== 7 && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: 'var(--bg2)', borderTop: '1px solid var(--border)',
          padding: '12px 28px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', zIndex: 9,
        }}>
          {/* Назад */}
          <button
            onClick={prevStep}
            disabled={current <= 1}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'none', border: '1px solid var(--border)',
              borderRadius: 8, padding: '8px 14px',
              color: current <= 1 ? 'var(--text3)' : 'var(--text2)',
              fontSize: 12, cursor: current <= 1 ? 'not-allowed' : 'pointer',
              opacity: current <= 1 ? 0.4 : 1, transition: 'all .15s',
            }}
          >
            ←&nbsp;{current > 1 ? STEP_LABELS[current - 2] : 'Назад'}
          </button>

          {/* Прогресс-бар вместо точек */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
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
                    width: active ? 20 : 6, height: 6, borderRadius: 3,
                    background: active ? 'var(--green)' : done ? 'rgba(45,191,138,.4)' : 'var(--border)',
                    border: 'none', cursor: step > current ? 'default' : 'pointer',
                    transition: 'all .2s', padding: 0, flexShrink: 0,
                  }}
                />
              )
            })}
          </div>

          {/* Вперёд */}
          <button
            onClick={nextStep}
            disabled={current >= 7}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: current >= 7 ? 'none' : 'var(--green)',
              border: current >= 7 ? '1px solid var(--border)' : 'none',
              borderRadius: 8, padding: '8px 14px',
              color: current >= 7 ? 'var(--text3)' : '#0D0F14',
              fontSize: 12, fontWeight: current >= 7 ? 400 : 700,
              cursor: current >= 7 ? 'not-allowed' : 'pointer',
              opacity: current >= 7 ? 0.4 : 1, transition: 'all .15s',
            }}
          >
            {current < 7 ? STEP_LABELS[current] : 'Готово'}&nbsp;→
          </button>
        </div>
      )}
    </div>
  )
}