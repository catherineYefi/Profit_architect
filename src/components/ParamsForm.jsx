import React, { useState } from 'react'
import { nicheConfigs } from '../data/nicheConfigs'
import { useAppStore } from '../store/useAppStore'
import { BLACKBOX_METRICS } from '../data/blackboxMetrics'
import { SectionLabel, BtnPrimary, BtnSecondary } from './ui'

const PERCENT_KEYS = ['orderMargin','conversion','drr','redemption','costRatio','repeatShare',
  'completion','loadFactor','eventShare','capacityLoad','consultConversion','yield',
  'capitalCost','tenantQuality','commissionPct']

export default function ParamsForm() {
  const { state, set, nextStep, prevStep } = useAppStore()
  const niche   = nicheConfigs[state.selectedNiche]
  const nicheId = state.selectedNiche
  const [localParams, setLocalParams] = useState({ ...state.params })
  const [errors, setErrors]           = useState({})

  if (!niche) return null

  // Ключи КФУ из blackboxMetrics — поля которые критически важны
  const kpiKeys = new Set(
    (BLACKBOX_METRICS[nicheId]?.kpis || [])
      .filter(k => !k.computed)
      .map(k => k.key)
  )

  const filled = niche.params.filter(p => localParams[p.key]?.toString().trim()).length
  const total  = niche.params.length
  const pct    = Math.round(filled / total * 100)

  const handleChange = (key, val) => {
    const num = parseFloat(val)
    const errs = { ...errors }
    if (val !== '' && isNaN(num))                         errs[key] = 'Только числа'
    else if (val !== '' && num < 0)                       errs[key] = 'Не может быть отрицательным'
    else if (PERCENT_KEYS.includes(key) && num > 100)     errs[key] = 'Максимум 100%'
    else                                                   delete errs[key]
    setErrors(errs)
    setLocalParams(prev => ({ ...prev, [key]: val }))
  }

  const handleNext = () => {
    if (Object.keys(errors).length > 0) return
    set({ params: localParams })
    nextStep()
  }

  // Незаполненные КФУ — показываем предупреждение
  const emptyKpis = niche.params.filter(p =>
    kpiKeys.has(p.key) && !localParams[p.key]?.toString().trim()
  )

  return (
    <div>
      <SectionLabel>Шаг 3 из 7</SectionLabel>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontFamily:'Syne', fontSize:20, fontWeight:700, color:'#fff' }}>
          {niche.name} · Текущие показатели
        </h2>
        <div style={{ fontSize:12, color:'var(--text3)', marginTop:3 }}>
          Оставьте пустым — подставится среднее по нише
        </div>
      </div>

      {/* Прогресс */}
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
        <div style={{ flex:1, height:3, background:'var(--border)', borderRadius:2, overflow:'hidden' }}>
          <div style={{ width:`${pct}%`, height:'100%', background:'var(--green)', borderRadius:2, transition:'width .3s' }}/>
        </div>
        <span style={{ fontSize:11, color:'var(--text3)', whiteSpace:'nowrap' }}>{filled} из {total}</span>
      </div>

      {/* Предупреждение о незаполненных КФУ */}
      {emptyKpis.length > 0 && (
        <div style={{
          padding:'10px 14px', background:'rgba(240,96,96,.06)',
          border:'1px solid rgba(240,96,96,.2)', borderRadius:8,
          marginBottom:16, display:'flex', gap:10, alignItems:'flex-start',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0, marginTop:1 }}>
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <div>
            <div style={{ fontSize:12, fontWeight:600, color:'var(--red)', marginBottom:3 }}>
              Незаполнены ключевые показатели
            </div>
            <div style={{ fontSize:11, color:'var(--text2)' }}>
              {emptyKpis.map(p => p.name).join(', ')} — эти метрики критичны для диагностики ниши
            </div>
          </div>
        </div>
      )}

      {/* Сетка полей */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:20 }}>
        {niche.params.map(p => {
          const hasError  = !!errors[p.key]
          const isKpi     = kpiKeys.has(p.key)
          const isEmpty   = !localParams[p.key]?.toString().trim()
          const isKpiWarn = isKpi && isEmpty

          return (
            <div key={p.key}>
              <label style={{ display:'block', fontSize:11, color:'var(--text2)', marginBottom:5, fontWeight:500, display:'flex', alignItems:'center', gap:5 }}>
                {p.name}
                <span style={{ color:'var(--text3)', fontWeight:400 }}>({p.unit})</span>
                {/* КФУ-бейдж */}
                {isKpi && (
                  <span style={{
                    fontSize:8, padding:'1px 5px', borderRadius:3, fontWeight:700,
                    background: isKpiWarn ? 'rgba(240,96,96,.12)' : 'rgba(45,191,138,.12)',
                    color: isKpiWarn ? 'var(--red)' : 'var(--green)',
                    letterSpacing:'.04em', textTransform:'uppercase', marginLeft:2,
                  }}>
                    КФУ
                  </span>
                )}
              </label>
              <div style={{ position:'relative' }}>
                <input
                  type="number"
                  min="0"
                  max={PERCENT_KEYS.includes(p.key) ? 100 : undefined}
                  step={PERCENT_KEYS.includes(p.key) ? 0.1 : 1}
                  placeholder={p.example}
                  value={localParams[p.key] || ''}
                  onChange={e => handleChange(p.key, e.target.value)}
                  style={{
                    paddingRight:36,
                    borderColor: hasError
                      ? 'rgba(240,96,96,.6)'
                      : isKpiWarn
                        ? 'rgba(240,96,96,.35)'
                        : undefined,
                  }}
                />
                <span style={{
                  position:'absolute', right:10, top:'50%', transform:'translateY(-50%)',
                  fontSize:11, color:'var(--text3)', pointerEvents:'none',
                }}>
                  {p.unit}
                </span>
              </div>
              {hasError && (
                <div style={{ fontSize:10, color:'var(--red)', marginTop:3 }}>{errors[p.key]}</div>
              )}
            </div>
          )
        })}
      </div>

      {Object.keys(errors).length > 0 && (
        <div style={{ padding:'10px 14px', background:'var(--red-dim)', border:'1px solid rgba(240,96,96,.2)', borderRadius:8, fontSize:12, color:'var(--red)', marginBottom:16 }}>
          Исправьте ошибки перед продолжением
        </div>
      )}

      <div style={{ display:'flex', gap:10 }}>
        <BtnSecondary onClick={prevStep}>← Назад</BtnSecondary>
        <BtnPrimary onClick={handleNext} disabled={Object.keys(errors).length > 0}>
          Далее — диагностика →
        </BtnPrimary>
      </div>
    </div>
  )
}