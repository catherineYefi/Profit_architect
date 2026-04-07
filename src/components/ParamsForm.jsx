import React, { useState } from 'react'
import { nicheConfigs } from '../data/nicheConfigs'
import { useAppStore } from '../store/useAppStore'
import { SectionLabel, BtnPrimary, BtnSecondary } from './ui'

// Ключи которые могут быть > 100 (рубли, дни, штуки)
const LARGE_VALUE_KEYS = ['revenue','commission','payroll','adBudget','fixedCosts','ltv','cac',
  'avgCheck','traffic','brokerRevenue','entryPrice','exitPrice','prepCost','eventAvgCheck',
  'medCosts','revenuePerHour','leadCost']

// Ключи с %-значениями — max 100
const PERCENT_KEYS = ['orderMargin','conversion','drr','redemption','costRatio','repeatShare',
  'completion','loadFactor','eventShare','capacityLoad','consultConversion','yield',
  'capitalCost','tenantQuality','commissionPct']

export default function ParamsForm() {
  const { state, set, nextStep, prevStep } = useAppStore()
  const niche = nicheConfigs[state.selectedNiche]
  const [localParams, setLocalParams] = useState({ ...state.params })
  const [errors, setErrors] = useState({})

  if (!niche) return null

  const filled = niche.params.filter(p => localParams[p.key]?.toString().trim()).length
  const total  = niche.params.length
  const pct    = Math.round(filled / total * 100)

  const handleChange = (key, val) => {
    const num = parseFloat(val)

    // Валидация
    const errs = { ...errors }
    if (val !== '' && isNaN(num)) {
      errs[key] = 'Только числа'
    } else if (num < 0) {
      errs[key] = 'Не может быть отрицательным'
    } else if (PERCENT_KEYS.includes(key) && num > 100) {
      errs[key] = 'Максимум 100%'
    } else {
      delete errs[key]
    }
    setErrors(errs)
    setLocalParams(prev => ({ ...prev, [key]: val }))
  }

  const handleNext = () => {
    // Не пропускаем если есть ошибки
    if (Object.keys(errors).length > 0) return
    set({ params: localParams })
    nextStep()
  }

  const isPercent = (key) => PERCENT_KEYS.includes(key)

  return (
    <div>
      <SectionLabel>Шаг 3 из 7</SectionLabel>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div>
          <h2 style={{ fontFamily: 'Syne', fontSize: 20, fontWeight: 700, color: '#fff' }}>
            {niche.name} · Текущие показатели
          </h2>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 3 }}>
            Оставьте пустым — подставится среднее по нише
          </div>
        </div>
      </div>

      {/* Прогресс */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <div style={{ flex: 1, height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: 'var(--green)', borderRadius: 2, transition: 'width .3s' }} />
        </div>
        <span style={{ fontSize: 11, color: 'var(--text3)', whiteSpace: 'nowrap' }}>
          {filled} из {total} заполнено
        </span>
      </div>

      {/* Сетка параметров */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
        {niche.params.map((p) => {
          const hasError = !!errors[p.key]
          const val = localParams[p.key] || ''
          const isPct = isPercent(p.key)

          return (
            <div key={p.key}>
              <label style={{
                display: 'block', fontSize: 11, color: 'var(--text2)',
                marginBottom: 5, fontWeight: 500,
              }}>
                {p.name}
                <span style={{ color: 'var(--text3)', marginLeft: 4, fontWeight: 400 }}>({p.unit})</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  min="0"
                  max={isPct ? 100 : undefined}
                  step={isPct ? 0.1 : 1}
                  placeholder={p.example}
                  value={val}
                  onChange={e => handleChange(p.key, e.target.value)}
                  style={{
                    paddingRight: 36,
                    borderColor: hasError ? 'rgba(240,96,96,.6)' : undefined,
                  }}
                />
                <span style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  fontSize: 11, color: 'var(--text3)', pointerEvents: 'none',
                }}>
                  {p.unit}
                </span>
              </div>
              {hasError && (
                <div style={{ fontSize: 10, color: 'var(--red)', marginTop: 3 }}>{errors[p.key]}</div>
              )}
            </div>
          )
        })}
      </div>

      {Object.keys(errors).length > 0 && (
        <div style={{
          padding: '10px 14px', background: 'var(--red-dim)',
          border: '1px solid rgba(240,96,96,.2)', borderRadius: 8,
          fontSize: 12, color: 'var(--red)', marginBottom: 20,
        }}>
          Исправьте ошибки перед продолжением
        </div>
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        <BtnSecondary onClick={prevStep}>← Назад</BtnSecondary>
        <BtnPrimary onClick={handleNext} disabled={Object.keys(errors).length > 0}>
          Далее — диагностика →
        </BtnPrimary>
      </div>
    </div>
  )
}