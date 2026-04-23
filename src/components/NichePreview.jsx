import React, { useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { nicheConfigs } from '../data/nicheConfigs'
import { SectionLabel, BtnPrimary, BtnSecondary, Card } from './ui'

const LEVEL_COLORS = ['var(--text3)', 'var(--blue)', 'var(--amber)', 'var(--purple)', 'var(--green)']

const NICHE_ICONS = {
  marketplace: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>,
  infobiz:     <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>,
  broker:      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  rental:      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>,
  event:       <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  clinic:      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
  production:  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M5.34 18.66l-1.41 1.41M12 2v2M12 20v2M4.93 4.93l1.41 1.41M18.66 18.66l1.41 1.41M2 12h2M20 12h2"/></svg>,
  b2b:         <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>,
}

function CollapseSection({ title, badge, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <Card style={{ marginBottom: 10 }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{ width:'100%', background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:10, padding:0 }}
      >
        <span style={{ fontSize:12, fontWeight:600, color:'var(--text)', flex:1, textAlign:'left' }}>{title}</span>
        {badge && (
          <span style={{ fontSize:9, padding:'2px 7px', borderRadius:4, background:'var(--green-dim)', color:'var(--green)', fontWeight:600, letterSpacing:'.06em' }}>
            {badge}
          </span>
        )}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition:'transform .2s', flexShrink:0 }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {open && (
        <div style={{ marginTop:14, paddingTop:14, borderTop:'1px solid var(--border)' }}>
          {children}
        </div>
      )}
    </Card>
  )
}

export default function NichePreview() {
  const { state, nextStep, prevStep } = useAppStore()
  const niche = nicheConfigs[state.selectedNiche]

  // ✅ useState вместо document.getElementById
  const [formulaExpanded, setFormulaExpanded] = useState(false)

  if (!niche) return null

  return (
    <div>
      <SectionLabel>Шаг 2 из 7</SectionLabel>

      <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:20 }}>
        <div style={{ color:'var(--green)' }}>{NICHE_ICONS[state.selectedNiche]}</div>
        <div>
          <h2 style={{ fontFamily:'Syne', fontSize:20, fontWeight:700, color:'#fff' }}>{niche.name}</h2>
          <p style={{ fontSize:12, color:'var(--text3)', marginTop:2 }}>{niche.desc}</p>
        </div>
      </div>

      {/* Главный вывод */}
      <Card accent style={{ marginBottom:10 }}>
        <div style={{ fontSize:10, letterSpacing:'.12em', textTransform:'uppercase', color:'var(--text3)', marginBottom:8 }}>
          Тип бизнеса
        </div>
        <p style={{ fontSize:13, color:'var(--text2)', lineHeight:1.7, marginBottom:10 }}>{niche.businessType}</p>
        <div style={{ padding:'10px 14px', background:'var(--green-dim)', border:'1px solid rgba(45,191,138,.2)', borderRadius:8, fontSize:13, color:'var(--green)', lineHeight:1.65 }}>
          <strong>Главный вывод:</strong> {niche.mainConclusion}
        </div>
      </Card>

      {/* Ключевая формула + раскрытие всех уровней через useState */}
      <Card style={{ marginBottom:10 }}>
        <div style={{ fontSize:10, letterSpacing:'.12em', textTransform:'uppercase', color:'var(--text3)', marginBottom:8 }}>
          Ключевая формула · Уровень 4
          <span style={{ fontWeight:400, letterSpacing:0, textTransform:'none', marginLeft:6, color:'var(--text3)', fontSize:9 }}>
            — оптимальный уровень глубины для сессии
          </span>
        </div>
        <div style={{ fontSize:12, color:'var(--purple)', fontFamily:'monospace', lineHeight:1.6, marginBottom:10 }}>
          {niche.formulaLevels?.[3]?.formula}
        </div>

        <button
          onClick={() => setFormulaExpanded(v => !v)}
          style={{ background:'none', border:'none', fontSize:11, color:'var(--text3)', cursor:'pointer', padding:0, display:'flex', alignItems:'center', gap:5 }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            style={{ transform: formulaExpanded ? 'rotate(180deg)' : 'none', transition:'transform .2s' }}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
          {formulaExpanded ? 'Скрыть все уровни' : 'Показать все 5 уровней'}
        </button>

        {/* Рендерится условно — никакого DOM-хака */}
        {formulaExpanded && (
          <div style={{ marginTop:14, paddingTop:14, borderTop:'1px solid var(--border)' }}>
            {niche.formulaLevels.map((f, i) => (
              <div key={i} style={{ display:'flex', gap:10, marginBottom:10, paddingBottom:10, borderBottom:i<niche.formulaLevels.length-1?'1px solid var(--border)':'none' }}>
                <div style={{ width:20, height:20, borderRadius:'50%', background:'var(--bg3)', border:`1px solid ${LEVEL_COLORS[i]}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color:LEVEL_COLORS[i], fontWeight:700, flexShrink:0, marginTop:2 }}>{f.level}</div>
                <div>
                  <div style={{ fontSize:10, color:LEVEL_COLORS[i], fontWeight:600, marginBottom:3, textTransform:'uppercase', letterSpacing:'.06em' }}>{f.name}</div>
                  <div style={{ fontSize:12, color:'var(--text2)', fontFamily:'monospace', lineHeight:1.55 }}>{f.formula}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* КФУ — свёрнуты */}
      <CollapseSection title="КФУ — в порядке влияния на прибыль" badge={`${niche.kfus.length} факторов`}>
        {niche.kfus.map((k, i) => (
          <div key={i} style={{ display:'flex', gap:10, marginBottom:8, paddingBottom:8, borderBottom:i<niche.kfus.length-1?'1px solid var(--border)':'none' }}>
            <div style={{ width:18, height:18, borderRadius:'50%', background:k.weight==='high'?'var(--green-dim)':'var(--bg3)', border:`1px solid ${k.weight==='high'?'rgba(45,191,138,.3)':'var(--border)'}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color:k.weight==='high'?'var(--green)':'var(--text3)', fontWeight:700, flexShrink:0, marginTop:1 }}>{i+1}</div>
            <div>
              <span style={{ fontSize:13, fontWeight:600, color:'var(--text)' }}>{k.name}</span>
              <span style={{ fontSize:12, color:'var(--text2)', marginLeft:8 }}>{k.why}</span>
            </div>
          </div>
        ))}
      </CollapseSection>

      {/* Бенчмарки — свёрнуты */}
      <CollapseSection title="Бенчмарки — три уровня" badge="Слабо / Нормально / Сильно">
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:6, fontSize:10, color:'var(--text3)', marginBottom:6 }}>
          <div>Показатель</div>
          <div style={{ color:'var(--red)' }}>Слабо</div>
          <div style={{ color:'var(--amber)' }}>Нормально</div>
          <div style={{ color:'var(--green)' }}>Сильно</div>
        </div>
        {niche.benchmarks.map((b, i) => (
          <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:6, padding:'6px 0', borderBottom:i<niche.benchmarks.length-1?'1px solid var(--border)':'none' }}>
            <div style={{ fontSize:12, color:'var(--text2)', fontWeight:500 }}>{b.metric}</div>
            <div style={{ fontSize:11, color:'var(--red)' }}>{b.weak}</div>
            <div style={{ fontSize:11, color:'var(--amber)' }}>{b.normal}</div>
            <div style={{ fontSize:11, color:'var(--green)' }}>{b.strong}</div>
          </div>
        ))}
      </CollapseSection>

      {/* Переход 1→2 и ловушки — свёрнуты */}
      <CollapseSection title="Переход 1.0 → 2.0 и ловушки">
        <p style={{ fontSize:13, color:'var(--text2)', lineHeight:1.7, marginBottom:12 }}>{niche.model1to2}</p>
        {niche.wrdp?.falseDriver && (
          <div>
            <div style={{ fontSize:12, color:'var(--red)', marginBottom:6, display:'flex', alignItems:'center', gap:5 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{flexShrink:0}}>
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              Ложный драйвер: {niche.wrdp.falseDriver}
            </div>
            <div style={{ fontSize:12, color:'var(--amber)', display:'flex', alignItems:'center', gap:5 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              Ошибка масштаба: {niche.wrdp.scalingMistake}
            </div>
          </div>
        )}
      </CollapseSection>

      <div style={{ display:'flex', gap:10, marginTop:16 }}>
        <BtnSecondary onClick={prevStep}>← Выбор ниши</BtnSecondary>
        <BtnPrimary onClick={nextStep}>Ввести цифры бизнеса →</BtnPrimary>
      </div>
    </div>
  )
}