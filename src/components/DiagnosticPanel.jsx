import React, { useEffect } from 'react'
import { useAppStore } from '../store/useAppStore'
import { nicheConfigs } from '../data/nicheConfigs'
import { generateDiagnostic } from '../services/gptService'
import { SectionLabel, Card, BtnPrimary, BtnSecondary, FlagBadge, LoadingSpinner } from './ui'

export default function DiagnosticPanel() {
  const { state, set, nextStep, prevStep } = useAppStore()
  const niche = nicheConfigs[state.selectedNiche]

  useEffect(() => {
    if (!state.diagnostic && !state.diagnosticLoading) {
      runDiagnostic()
    }
  }, [])

  async function runDiagnostic() {
    set({ diagnosticLoading: true, diagnosticError: null })
    try {
      const result = await generateDiagnostic(niche, state.params)
      set({ diagnostic: result, diagnosticLoading: false })
    } catch (err) {
      set({ diagnosticError: err.message, diagnosticLoading: false })
    }
  }

  if (state.diagnosticLoading) {
    return <LoadingSpinner text="Анализирую бизнес-модель..." />
  }

  if (state.diagnosticError) {
    return (
      <div>
        <SectionLabel>Шаг 4 из 7</SectionLabel>
        <div style={{
          padding: '14px 16px', background: 'var(--red-dim)',
          border: '1px solid rgba(240,96,96,.2)', borderRadius: 8,
          fontSize: 13, color: 'var(--red)', marginBottom: 16,
        }}>
          Ошибка: {state.diagnosticError}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <BtnSecondary onClick={prevStep}>← Назад</BtnSecondary>
          <BtnPrimary onClick={runDiagnostic}>Попробовать снова</BtnPrimary>
        </div>
      </div>
    )
  }

  if (!state.diagnostic) return null
  const d = state.diagnostic

  return (
    <div>
      <SectionLabel>Шаг 4 из 7</SectionLabel>

      {/* Заголовок + кнопка Обновить рядом */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, gap: 12 }}>
        <h2 style={{ fontFamily: 'Syne', fontSize: 20, fontWeight: 700, color: '#fff' }}>
          Диагностика бизнес-модели
        </h2>
        <button
          onClick={runDiagnostic}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
            background: 'var(--bg3)', border: '1px solid var(--border2)',
            borderRadius: 8, padding: '8px 14px',
            color: 'var(--text2)', fontSize: 12, fontWeight: 500, cursor: 'pointer',
            transition: 'all .15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.color = 'var(--green)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.color = 'var(--text2)' }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
          </svg>
          Обновить анализ
        </button>
      </div>

      {/* Формула прибыли */}
      <Card accent style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 8 }}>
          Формула прибыли · {niche.name}
        </div>
        <div style={{ fontSize: 13, color: 'var(--green)', fontWeight: 600, marginBottom: 8, fontFamily: 'monospace' }}>
          {niche.formulaShort}
        </div>
        {d.formulaInsight && (
          <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.65 }}>{d.formulaInsight}</div>
        )}
        {d.mainConstraint && (
          <div style={{ marginTop: 10, padding: '8px 12px', background: 'var(--red-dim)', border: '1px solid rgba(240,96,96,.2)', borderRadius: 6, fontSize: 12, color: 'var(--red)' }}>
            ⚠ Главное ограничение: {d.mainConstraint}
          </div>
        )}
      </Card>

      {/* КФУ */}
      <Card style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 10 }}>
          Ключевые факторы успеха
        </div>
        {niche.kfus.map((k, i) => (
          <div key={i} style={{
            display: 'flex', gap: 10, paddingBottom: 10, marginBottom: 10,
            borderBottom: i < niche.kfus.length - 1 ? '1px solid var(--border)' : 'none',
          }}>
            <div style={{
              width: 20, height: 20, borderRadius: '50%', flexShrink: 0, marginTop: 2,
              background: k.weight === 'high' ? 'var(--green-dim)' : 'var(--bg3)',
              border: `1px solid ${k.weight === 'high' ? 'rgba(45,191,138,.3)' : 'var(--border)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, color: k.weight === 'high' ? 'var(--green)' : 'var(--text3)', fontWeight: 700,
            }}>
              {i + 1}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)', marginBottom: 2 }}>{k.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text2)' }}>{k.why}</div>
              {d.kfuInsights?.[i] && (
                <div style={{ fontSize: 11, color: 'var(--green)', marginTop: 4 }}>→ {d.kfuInsights[i]}</div>
              )}
            </div>
          </div>
        ))}
      </Card>

      {/* Модель 1.0 → 2.0 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
        <Card>
          <div style={{ fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 8 }}>
            Модель 1.0 · сейчас
          </div>
          <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.65, whiteSpace: 'pre-line' }}>
            {d.model1Summary || 'Заполните параметры на шаге 3'}
          </div>
        </Card>
        <Card>
          <div style={{ fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: 8 }}>
            Модель 2.0 · цель
          </div>
          <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.65, whiteSpace: 'pre-line' }}>
            {d.model2Summary || '—'}
          </div>
        </Card>
      </div>

      {/* Рычаги */}
      <Card style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 10 }}>
          Рычаги роста
        </div>
        {d.topLever && (
          <div style={{ padding: '8px 12px', background: 'var(--green-dim)', border: '1px solid rgba(45,191,138,.2)', borderRadius: 6, fontSize: 13, color: 'var(--green)', marginBottom: 10 }}>
            ★ {d.topLever}
          </div>
        )}
        {niche.levers.map((l, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', flexShrink: 0, background: l.flag === 'real' ? 'var(--green)' : l.flag === 'hard' ? 'var(--amber)' : 'var(--red)' }} />
            <span style={{ fontSize: 13, color: 'var(--text2)', flex: 1 }}>{l.action}</span>
            <span style={{ fontSize: 11, color: 'var(--text3)' }}>{l.months} мес</span>
            <FlagBadge flag={l.flag} />
          </div>
        ))}
      </Card>

      {/* WRDP */}
      {(niche.wrdp?.mechanism || d.wrdpInsight) && (
        <Card style={{ marginBottom: 24, borderColor: 'rgba(139,124,246,.25)' }}>
          <div style={{ fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--purple)', marginBottom: 8 }}>
            Что реально двигает прибыль
          </div>
          <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.65 }}>
            {d.wrdpInsight || niche.wrdp?.mechanism}
          </div>
          {niche.wrdp?.falseDriver && (
            <div style={{ marginTop: 10, fontSize: 12, color: 'var(--amber)' }}>
              ✕ Ложный драйвер: {niche.wrdp.falseDriver}
            </div>
          )}
        </Card>
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        <BtnSecondary onClick={prevStep}>← Назад</BtnSecondary>
        <BtnPrimary onClick={nextStep}>Далее — финансовый прогноз →</BtnPrimary>
      </div>
    </div>
  )
}