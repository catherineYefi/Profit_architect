import React, { useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { nicheConfigs } from '../data/nicheConfigs'
import { SectionLabel, BtnPrimary, BtnSecondary, Card } from './ui'

const LEVEL_COLORS = ['var(--text3)','var(--blue)','var(--amber)','var(--purple)','var(--green)']

export default function NichePreview() {
  const { state, nextStep, prevStep } = useAppStore()
  const niche = nicheConfigs[state.selectedNiche]
  const [expanded, setExpanded] = useState(false)
  if (!niche) return null

  return (
    <div>
      <SectionLabel>Шаг 2 из 6</SectionLabel>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
        <span style={{fontSize:28}}>{niche.icon}</span>
        <div>
          <h2 style={{fontFamily:'Syne',fontSize:20,fontWeight:700,color:'#fff'}}>{niche.name}</h2>
          <p style={{fontSize:12,color:'var(--text3)',marginTop:2}}>{niche.desc}</p>
        </div>
      </div>

      {/* Тип бизнеса */}
      <Card accent style={{marginBottom:14}}>
        <div style={{fontSize:10,letterSpacing:'.12em',textTransform:'uppercase',color:'var(--text3)',marginBottom:8}}>Тип бизнеса и механика монетизации</div>
        <p style={{fontSize:13,color:'var(--text2)',lineHeight:1.7}}>{niche.businessType}</p>
        <div style={{marginTop:12,padding:'10px 14px',background:'var(--green-dim)',border:'1px solid rgba(45,191,138,.2)',borderRadius:8,fontSize:13,color:'var(--green)',lineHeight:1.65}}>
          <strong>Главный вывод:</strong> {niche.mainConclusion}
        </div>
      </Card>

      {/* 5 уровней формул */}
      <Card style={{marginBottom:14}}>
        <div style={{fontSize:10,letterSpacing:'.12em',textTransform:'uppercase',color:'var(--text3)',marginBottom:12}}>Формулы прибыли — 5 уровней</div>
        {niche.formulaLevels.map((f,i) => (
          <div key={i} style={{display:'flex',gap:10,marginBottom:10,paddingBottom:10,borderBottom:i<niche.formulaLevels.length-1?'1px solid var(--border)':'none'}}>
            <div style={{width:20,height:20,borderRadius:'50%',background:'var(--bg3)',border:`1px solid ${LEVEL_COLORS[i]}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,color:LEVEL_COLORS[i],fontWeight:700,flexShrink:0,marginTop:2}}>{f.level}</div>
            <div>
              <div style={{fontSize:11,color:LEVEL_COLORS[i],fontWeight:600,marginBottom:3,textTransform:'uppercase',letterSpacing:'.06em'}}>{f.name}</div>
              <div style={{fontSize:12,color:'var(--text2)',fontFamily:'monospace',lineHeight:1.55}}>{f.formula}</div>
            </div>
          </div>
        ))}
      </Card>

      {/* КФУ */}
      <Card style={{marginBottom:14}}>
        <div style={{fontSize:10,letterSpacing:'.12em',textTransform:'uppercase',color:'var(--text3)',marginBottom:12}}>КФУ — в порядке влияния на прибыль</div>
        {niche.kfus.map((k,i) => (
          <div key={i} style={{display:'flex',gap:10,marginBottom:8,paddingBottom:8,borderBottom:i<niche.kfus.length-1?'1px solid var(--border)':'none'}}>
            <div style={{width:18,height:18,borderRadius:'50%',background:k.weight==='high'?'var(--green-dim)':'var(--bg3)',border:`1px solid ${k.weight==='high'?'rgba(45,191,138,.3)':'var(--border)'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,color:k.weight==='high'?'var(--green)':'var(--text3)',fontWeight:700,flexShrink:0,marginTop:1}}>{i+1}</div>
            <div>
              <span style={{fontSize:13,fontWeight:600,color:'var(--text)'}}>{k.name}</span>
              <span style={{fontSize:12,color:'var(--text2)',marginLeft:8}}>{k.why}</span>
            </div>
          </div>
        ))}
      </Card>

      {/* Бенчмарки */}
      <Card style={{marginBottom:14}}>
        <div style={{fontSize:10,letterSpacing:'.12em',textTransform:'uppercase',color:'var(--text3)',marginBottom:12}}>Бенчмарки — три уровня</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:6,fontSize:10,color:'var(--text3)',marginBottom:6,padding:'0 2px'}}>
          <div>Показатель</div><div style={{color:'var(--red)'}}>Слабо</div><div style={{color:'var(--amber)'}}>Нормально</div><div style={{color:'var(--green)'}}>Сильно</div>
        </div>
        {niche.benchmarks.map((b,i) => (
          <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:6,padding:'6px 0',borderBottom:i<niche.benchmarks.length-1?'1px solid var(--border)':'none',alignItems:'start'}}>
            <div style={{fontSize:12,color:'var(--text2)',fontWeight:500}}>{b.metric}</div>
            <div style={{fontSize:11,color:'var(--red)'}}>{b.weak}</div>
            <div style={{fontSize:11,color:'var(--amber)'}}>{b.normal}</div>
            <div style={{fontSize:11,color:'var(--green)'}}>{b.strong}</div>
          </div>
        ))}
      </Card>

      {/* Модель 1→2 */}
      <Card style={{marginBottom:14}}>
        <div style={{fontSize:10,letterSpacing:'.12em',textTransform:'uppercase',color:'var(--text3)',marginBottom:8}}>Переход модели 1.0 → 2.0</div>
        <p style={{fontSize:13,color:'var(--text2)',lineHeight:1.7}}>{niche.model1to2}</p>
      </Card>

      {/* WRDP */}
      {niche.wrdp?.falseDriver && (
        <Card style={{marginBottom:24,borderColor:'rgba(240,96,96,.2)'}}>
          <div style={{fontSize:10,letterSpacing:'.12em',textTransform:'uppercase',color:'var(--red)',marginBottom:10}}>Ловушки и ошибки масштаба</div>
          <div style={{fontSize:12,color:'var(--red)',marginBottom:6}}>✕ Ложный драйвер: {niche.wrdp.falseDriver}</div>
          <div style={{fontSize:12,color:'var(--amber)'}}>⚠ Ошибка масштаба: {niche.wrdp.scalingMistake}</div>
        </Card>
      )}

      <div style={{display:'flex',gap:10}}>
        <BtnSecondary onClick={prevStep}>← Выбор ниши</BtnSecondary>
        <BtnPrimary onClick={nextStep}>Ввести цифры бизнеса →</BtnPrimary>
      </div>
    </div>
  )
}