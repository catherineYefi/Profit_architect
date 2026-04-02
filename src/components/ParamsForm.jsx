import React, { useState } from 'react'
import { nicheConfigs } from '../data/nicheConfigs'
import { useAppStore } from '../store/useAppStore'
import { SectionLabel, BtnPrimary, BtnSecondary } from './ui'

export default function ParamsForm() {
  const { state, set, nextStep, prevStep } = useAppStore()
  const niche = nicheConfigs[state.selectedNiche]
  const [localParams, setLocalParams] = useState({ ...state.params })

  if (!niche) return null

  const filled = niche.params.filter(p => localParams[p.key]?.toString().trim()).length
  const total  = niche.params.length
  const pct    = Math.round(filled / total * 100)

  const handleChange = (key, val) => {
    setLocalParams(prev => ({ ...prev, [key]: val }))
  }

  const handleNext = () => {
    set({ params: localParams })
    nextStep()
  }

  return (
    <div>
      <SectionLabel>Шаг 2 из 5</SectionLabel>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <span style={{ fontSize: 22 }}>{niche.icon}</span>
        <div>
          <h2 style={{ fontFamily: 'Syne', fontSize: 20, fontWeight: 700, color: '#fff' }}>
            {niche.name} · Текущие показатели
          </h2>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>
            Введите реальные цифры бизнеса
          </div>
        </div>
      </div>

      {/* Progress */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <div style={{ flex: 1, height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: 'var(--green)', borderRadius: 2, transition: 'width .3s' }} />
        </div>
        <span style={{ fontSize: 11, color: 'var(--text3)', whiteSpace: 'nowrap' }}>{filled} из {total}</span>
      </div>

      {/* Params grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28 }}>
        {niche.params.map((p, i) => (
          <div key={p.key}>
            <label style={{ display: 'block', fontSize: 11, color: 'var(--text2)', marginBottom: 5, fontWeight: 500 }}>
              {p.name}
              <span style={{ color: 'var(--text3)', marginLeft: 4 }}>({p.unit})</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                inputMode="decimal"
                placeholder={p.example}
                value={localParams[p.key] || ''}
                onChange={e => handleChange(p.key, e.target.value)}
                style={{ paddingRight: 36 }}
              />
              <span style={{
                position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                fontSize: 11, color: 'var(--text3)', pointerEvents: 'none',
              }}>
                {p.unit}
              </span>
            </div>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 20 }}>
        Незаполненные поля — инструмент использует средние значения по нише.
      </p>

      <div style={{ display: 'flex', gap: 10 }}>
        <BtnSecondary onClick={prevStep}>← Назад</BtnSecondary>
        <BtnPrimary onClick={handleNext}>Далее — диагностика →</BtnPrimary>
      </div>
    </div>
  )
}
