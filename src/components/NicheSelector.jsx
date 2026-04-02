import React from 'react'
import { nicheList } from '../data/nicheConfigs'
import { useAppStore } from '../store/useAppStore'
import { SectionLabel, BtnPrimary } from './ui'

export default function NicheSelector() {
  const { state, set, nextStep } = useAppStore()
  const selected = state.selectedNiche

  const handleSelect = (id) => {
    set({ selectedNiche: id, params: {}, diagnostic: null })
  }

  return (
    <div>
      <SectionLabel>Шаг 1 из 5</SectionLabel>
      <h2 style={{ fontFamily: 'Syne', fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
        Выберите тип бизнеса
      </h2>
      <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 24, maxWidth: 480 }}>
        Под каждую нишу своя формула прибыли, КФУ и бенчмарки.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10, marginBottom: 28 }}>
        {nicheList.map(n => {
          const isSelected = selected === n.id
          const isEmpty = !n.params?.length
          return (
            <button
              key={n.id}
              onClick={() => handleSelect(n.id)}
              disabled={isEmpty}
              style={{
                background: isSelected ? 'var(--green-dim)' : 'var(--bg2)',
                border: `1px solid ${isSelected ? 'rgba(45,191,138,.4)' : 'var(--border)'}`,
                borderRadius: 10, padding: '14px 16px', textAlign: 'left',
                cursor: isEmpty ? 'not-allowed' : 'pointer',
                opacity: isEmpty ? 0.45 : 1,
                transition: 'all .15s',
              }}
            >
              <div style={{ fontSize: 22, marginBottom: 8 }}>{n.icon}</div>
              <div style={{ fontWeight: 600, fontSize: 14, color: isSelected ? 'var(--green)' : 'var(--text)' }}>
                {n.name}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3 }}>
                {isEmpty ? 'Скоро' : n.desc}
              </div>
            </button>
          )
        })}
      </div>

      <BtnPrimary onClick={nextStep} disabled={!selected}>
        Далее — ввести параметры →
      </BtnPrimary>
    </div>
  )
}
