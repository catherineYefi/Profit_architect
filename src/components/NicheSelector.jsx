cat > src/components/NicheSelector.jsx << 'EOF'
import React from 'react'
import { nicheList } from '../data/nicheConfigs'
import { useAppStore } from '../store/useAppStore'
import { SectionLabel, BtnPrimary } from './ui'

const NICHE_ICONS = {
  marketplace: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>,
  infobiz: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>,
  broker: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  rental: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>,
  event: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  clinic: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
  production: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M5.34 18.66l-1.41 1.41M12 2v2M12 20v2M4.93 4.93l1.41 1.41M18.66 18.66l1.41 1.41M2 12h2M20 12h2"/></svg>,
  b2b: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>,
}

export default function NicheSelector() {
  const { state, set, nextStep } = useAppStore()
  const selected = state.selectedNiche

  return (
    <div>
      <SectionLabel>Шаг 1 из 6</SectionLabel>
      <h2 style={{ fontFamily:'Syne', fontSize:22, fontWeight:700, color:'#fff', marginBottom:8 }}>
        Выберите тип бизнеса
      </h2>
      <p style={{ color:'var(--text2)', fontSize:13, marginBottom:24, maxWidth:480 }}>
        Под каждую нишу своя формула прибыли, КФУ и бенчмарки.
      </p>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px,1fr))', gap:10, marginBottom:28 }}>
        {nicheList.map(n => {
          const isSelected = selected === n.id
          const isEmpty = !n.params?.length
          return (
            <button
              key={n.id}
              onClick={() => !isEmpty && set({ selectedNiche:n.id, params:{}, diagnostic:null })}
              disabled={isEmpty}
              style={{
                background: isSelected ? 'var(--green-dim)' : 'var(--bg2)',
                border: `1px solid ${isSelected ? 'rgba(45,191,138,.4)' : 'var(--border)'}`,
                borderRadius:10, padding:'16px', textAlign:'left',
                cursor: isEmpty ? 'not-allowed' : 'pointer',
                opacity: isEmpty ? 0.35 : 1, transition:'all .15s',
              }}
            >
              <div style={{ color: isSelected ? 'var(--green)' : 'var(--text2)', marginBottom:10 }}>
                {NICHE_ICONS[n.id]}
              </div>
              <div style={{ fontWeight:600, fontSize:14, color: isSelected ? 'var(--green)' : 'var(--text)' }}>
                {n.name}
              </div>
              <div style={{ fontSize:11, color:'var(--text3)', marginTop:3 }}>
                {isEmpty ? 'Скоро' : n.desc}
              </div>
            </button>
          )
        })}
      </div>

      <BtnPrimary onClick={nextStep} disabled={!selected}>
        Далее — посмотреть модель →
      </BtnPrimary>
    </div>
  )
}
EOF