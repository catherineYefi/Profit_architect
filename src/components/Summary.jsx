import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useAppStore } from '../store/useAppStore'
import { nicheConfigs } from '../data/nicheConfigs'
import { buildGrowthProjection, formatMoney } from '../utils/financialMath'
import { Card, SectionLabel, FlagBadge } from './ui'

const LEVEL_COLORS = ['var(--text3)','var(--blue)','var(--amber)','var(--purple)','var(--green)']

export default function Summary() {
  const { state, set } = useAppStore()
  const niche = nicheConfigs[state.selectedNiche]
  if (!niche) return null
  const d = state.diagnostic
  const chartData = buildGrowthProjection(
    state.targetProfit || 500000,
    (state.dividendClient||30)+(state.dividendFund||10),
    state.extraInvestment||0,
    state.targetMargin||25
  )

  return (
    <div>
      <SectionLabel>Шаг 6 из 6 · Итоговый разбор</SectionLabel>
      <h2 style={{fontFamily:'Syne',fontSize:22,fontWeight:800,color:'#fff',marginBottom:6}}>
        Полный разбор бизнес-модели
      </h2>
      <p style={{fontSize:12,color:'var(--text3)',marginBottom:28}}>
        Скролл вниз — весь анализ от ниши до инвестиционного прогноза
      </p>

      {/* 1. Компания и ниша */}
      <div style={{fontSize:10,letterSpacing:'.15em',textTransform:'uppercase',color:'var(--green)',marginBottom:10}}>01 · Компания и тип бизнеса</div>
      <Card accent style={{marginBottom:20}}>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
          <span style={{fontSize:28}}>{niche.icon}</span>
          <div>
            <div style={{fontFamily:'Syne',fontSize:18,fontWeight:700,color:'#fff'}}>{niche.name}</div>
            <div style={{fontSize:12,color:'var(--text3)',marginTop:2}}>{niche.desc}</div>
          </div>
        </div>
        <p style={{fontSize:13,color:'var(--text2)',lineHeight:1.7,marginBottom:10}}>{niche.businessType}</p>
        <div style={{padding:'10px 14px',background:'var(--green-dim)',border:'1px solid rgba(45,191,138,.2)',borderRadius:8,fontSize:13,color:'var(--green)',lineHeight:1.65}}>
          {niche.mainConclusion}
        </div>
      </Card>

      {/* 2. Формулы прибыли */}
      <div style={{fontSize:10,letterSpacing:'.15em',textTransform:'uppercase',color:'var(--green)',marginBottom:10}}>02 · Формулы прибыли — 5 уровней</div>
      <Card style={{marginBottom:20}}>
        {niche.formulaLevels.map((f,i) => (
          <div key={i} style={{display:'flex',gap:10,marginBottom:10,paddingBottom:10,borderBottom:i<niche.formulaLevels.length-1?'1px solid var(--border)':'none'}}>
            <div style={{width:20,height:20,borderRadius:'50%',background:'var(--bg3)',border:`1px solid ${LEVEL_COLORS[i]}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,color:LEVEL_COLORS[i],fontWeight:700,flexShrink:0,marginTop:2}}>{f.level}</div>
            <div>
              <div style={{fontSize:10,color:LEVEL_COLORS[i],fontWeight:600,marginBottom:3,textTransform:'uppercase',letterSpacing:'.06em'}}>{f.name}</div>
              <div style={{fontSize:12,color:'var(--text2)',fontFamily:'monospace',lineHeight:1.55}}>{f.formula}</div>
            </div>
          </div>
        ))}
      </Card>

      {/* 3. КФУ */}
      <div style={{fontSize:10,letterSpacing:'.15em',textTransform:'uppercase',color:'var(--green)',marginBottom:10}}>03 · Ключевые факторы успеха</div>
      <Card style={{marginBottom:20}}>
        {niche.kfus.map((k,i) => (
          <div key={i} style={{display:'flex',gap:10,marginBottom:8,paddingBottom:8,borderBottom:i<niche.kfus.length-1?'1px solid var(--border)':'none'}}>
            <div style={{width:18,height:18,borderRadius:'50%',background:k.weight==='high'?'var(--green-dim)':'var(--bg3)',border:`1px solid ${k.weight==='high'?'rgba(45,191,138,.3)':'var(--border)'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,color:k.weight==='high'?'var(--green)':'var(--text3)',fontWeight:700,flexShrink:0,marginTop:1}}>{i+1}</div>
            <div><span style={{fontSize:13,fontWeight:600,color:'var(--text)'}}>{k.name}</span><span style={{fontSize:12,color:'var(--text2)',marginLeft:8}}>{k.why}</span></div>
          </div>
        ))}
      </Card>

      {/* 4. Бенчмарки */}
      <div style={{fontSize:10,letterSpacing:'.15em',textTransform:'uppercase',color:'var(--green)',marginBottom:10}}>04 · Бенчмарки модели</div>
      <Card style={{marginBottom:20}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:6,fontSize:10,color:'var(--text3)',marginBottom:8,padding:'0 2px'}}>
          <div>Показатель</div><div style={{color:'var(--red)'}}>Слабо</div><div style={{color:'var(--amber)'}}>Нормально</div><div style={{color:'var(--green)'}}>Сильно</div>
        </div>
        {niche.benchmarks.map((b,i) => (
          <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:6,padding:'7px 0',borderBottom:i<niche.benchmarks.length-1?'1px solid var(--border)':'none',alignItems:'start'}}>
            <div style={{fontSize:12,color:'var(--text2)',fontWeight:500}}>{b.metric}</div>
            <div style={{fontSize:11,color:'var(--red)'}}>{b.weak}</div>
            <div style={{fontSize:11,color:'var(--amber)'}}>{b.normal}</div>
            <div style={{fontSize:11,color:'var(--green)'}}>{b.strong}</div>
          </div>
        ))}
      </Card>

      {/* 5. Финансовая модель */}
      <div style={{fontSize:10,letterSpacing:'.15em',textTransform:'uppercase',color:'var(--green)',marginBottom:10}}>05 · Финансовая модель 1.0 → 2.0</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
        <Card>
          <div style={{fontSize:10,letterSpacing:'.1em',textTransform:'uppercase',color:'var(--text3)',marginBottom:8}}>Модель 1.0 · сейчас</div>
          <div style={{fontSize:13,color:'var(--text2)',lineHeight:1.65,whiteSpace:'pre-line'}}>{d?.model1Summary || 'Введите параметры на шаге 3'}</div>
        </Card>
        <Card>
          <div style={{fontSize:10,letterSpacing:'.1em',textTransform:'uppercase',color:'var(--green)',marginBottom:8}}>Модель 2.0 · цель</div>
          <div style={{fontSize:13,color:'var(--text)',lineHeight:1.65,whiteSpace:'pre-line'}}>{d?.model2Summary || niche.benchmarks.slice(0,3).map(b=>`${b.metric}: ${b.strong}`).join('\n')}</div>
        </Card>
      </div>
      <Card style={{marginBottom:10}}>
        <div style={{fontSize:10,letterSpacing:'.1em',textTransform:'uppercase',color:'var(--text3)',marginBottom:8}}>Переход 1.0 → 2.0</div>
        <p style={{fontSize:13,color:'var(--text2)',lineHeight:1.7}}>{niche.model1to2}</p>
      </Card>

      {/* Распределение прибыли */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginBottom:20}}>
        {[
          {label:'Прибыль / мес (цель)',value:formatMoney(state.targetProfit||0),color:'var(--green)'},
          {label:`Дивиденды клиент ${state.dividendClient||30}%`,value:formatMoney((state.targetProfit||0)*(state.dividendClient||30)/100),color:'var(--amber)'},
          {label:`Дивиденды фонд ${state.dividendFund||10}%`,value:formatMoney((state.targetProfit||0)*(state.dividendFund||10)/100),color:'var(--purple)'},
        ].map((m,i)=>(
          <div key={i} style={{background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:8,padding:'12px',textAlign:'center'}}>
            <div style={{fontSize:18,fontWeight:700,color:m.color,fontFamily:'Syne'}}>{m.value}</div>
            <div style={{fontSize:10,color:'var(--text3)',marginTop:4}}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* 6. Рычаги роста */}
      <div style={{fontSize:10,letterSpacing:'.15em',textTransform:'uppercase',color:'var(--green)',marginBottom:10}}>06 · Рычаги роста</div>
      <Card style={{marginBottom:20}}>
        {niche.levers.map((l,i)=>(
          <div key={i} style={{display:'flex',alignItems:'center',gap:8,marginBottom:7,paddingBottom:7,borderBottom:i<niche.levers.length-1?'1px solid var(--border)':'none'}}>
            <div style={{width:5,height:5,borderRadius:'50%',background:l.flag==='real'?'var(--green)':l.flag==='hard'?'var(--amber)':'var(--red)',flexShrink:0}}/>
            <span style={{fontSize:13,color:'var(--text2)',flex:1}}>{l.action}</span>
            <span style={{fontSize:11,color:'var(--text3)',marginRight:6}}>{l.months} мес</span>
            <FlagBadge flag={l.flag}/>
          </div>
        ))}
      </Card>

      {/* 5 стримов */}
      <div style={{fontSize:10,letterSpacing:'.15em',textTransform:'uppercase',color:'var(--green)',marginBottom:10}}>07 · 5 стримов следующего шага</div>
      <Card style={{marginBottom:20}}>
        {niche.nextStepStreams.map((s,i)=>(
          <div key={i} style={{display:'flex',gap:10,marginBottom:8,paddingBottom:8,borderBottom:i<niche.nextStepStreams.length-1?'1px solid var(--border)':'none'}}>
            <div style={{width:18,height:18,borderRadius:4,background:'var(--green-dim)',border:'1px solid rgba(45,191,138,.3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,color:'var(--green)',fontWeight:700,flexShrink:0}}>{i+1}</div>
            <span style={{fontSize:13,color:'var(--text2)'}}>{s}</span>
          </div>
        ))}
      </Card>

      {/* 8. Инвестиционный график */}
      <div style={{fontSize:10,letterSpacing:'.15em',textTransform:'uppercase',color:'var(--green)',marginBottom:10}}>08 · Инвестиционный прогноз на 12 месяцев</div>
      <Card style={{marginBottom:20,padding:'16px 12px 8px'}}>
        <p style={{fontSize:11,color:'var(--text3)',marginBottom:12}}>Прогноз при достижении целевой модели 2.0</p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData} margin={{top:4,right:8,left:0,bottom:0}}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
            <XAxis dataKey="month" tick={{fontSize:10,fill:'var(--text3)'}}/>
            <YAxis tick={{fontSize:10,fill:'var(--text3)'}} tickFormatter={v=>formatMoney(v)} width={52}/>
            <Tooltip formatter={(v)=>[`${formatMoney(v)} ₽`]} contentStyle={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:8,fontSize:12}}/>
            <Line type="monotone" dataKey="baseProfit" name="Без доп. инвестиций" stroke="#8B7CF6" strokeWidth={1.5} dot={false} strokeOpacity={.7}/>
            <Line type="monotone" dataKey="investProfit" name="С инвестициями" stroke="#2DBF8A" strokeWidth={2.5} dot={false}/>
          </LineChart>
        </ResponsiveContainer>
        <div style={{display:'flex',gap:20,padding:'8px 4px 0',fontSize:11,color:'var(--text2)'}}>
          <div style={{display:'flex',alignItems:'center',gap:6}}><div style={{width:16,height:2,background:'#2DBF8A',borderRadius:1}}/>С инвестициями</div>
          <div style={{display:'flex',alignItems:'center',gap:6}}><div style={{width:16,height:2,background:'#8B7CF6',borderRadius:1,opacity:.7}}/>Без доп. вложений</div>
        </div>
      </Card>

      <button onClick={()=>{if(window.confirm('Начать новый анализ?'))window.location.reload()}}
        style={{background:'var(--green)',color:'#0D0F14',fontWeight:700,fontSize:14,padding:'12px 28px',borderRadius:10,border:'none',cursor:'pointer',width:'100%'}}>
        Начать новый анализ
      </button>
    </div>
  )
}