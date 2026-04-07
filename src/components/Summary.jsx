import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useAppStore } from '../store/useAppStore'
import { nicheConfigs } from '../data/nicheConfigs'
import { buildGrowthProjection, formatMoney, getMarginFromParams, getFixedCosts, getRevenueFromParams, NICHE_TARGET_MARGINS } from '../utils/financialMath'
import { BLACKBOX_METRICS, getKpiValue, formatKpiValue, assessKpi } from '../data/blackboxMetrics'
import { Card, SectionLabel, FlagBadge } from './ui'

const LEVEL_COLORS = ['var(--text3)','var(--blue)','var(--amber)','var(--purple)','var(--green)']

const NICHE_ICONS = {
  marketplace: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>,
  infobiz:     <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>,
  broker:      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  rental:      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>,
  event:       <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  clinic:      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
  production:  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M5.34 18.66l-1.41 1.41M12 2v2M12 20v2M4.93 4.93l1.41 1.41M18.66 18.66l1.41 1.41M2 12h2M20 12h2"/></svg>,
  b2b:         <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>,
}

const LEVEL_COLORS_ASSESS = {
  strong:  { bg: 'rgba(45,191,138,.08)',  border: 'rgba(45,191,138,.25)',  text: 'var(--green)' },
  normal:  { bg: 'rgba(245,158,42,.06)',  border: 'rgba(245,158,42,.2)',   text: 'var(--amber)' },
  weak:    { bg: 'rgba(240,96,96,.06)',   border: 'rgba(240,96,96,.2)',    text: 'var(--red)'   },
  neutral: { bg: 'var(--bg3)',            border: 'var(--border)',          text: 'var(--text2)' },
}

// ─── BLACK BOX ───────────────────────────────────────────────
function BlackBox({ nicheId, params, targetRevenue, targetMargin, targetProfit, niche }) {
  const nicheMetrics = BLACKBOX_METRICS[nicheId]

  // Базовые финансовые показатели
  const revenue    = getRevenueFromParams(params, nicheId)
  const margin     = getMarginFromParams(params, nicheId)
  const fixedCosts = getFixedCosts(params, nicheId)
  const profit1    = Math.max(0, revenue * margin / 100 - fixedCosts)

  const tMargin  = targetMargin  || NICHE_TARGET_MARGINS[nicheId] || 30
  const tRevenue = targetRevenue || (revenue * 1.4)
  const tProfit  = targetProfit  || Math.max(0, tRevenue * tMargin / 100 - fixedCosts * 1.1)

  const ArrowRow = ({ color, delay }) => (
    <div style={{ height: 2, background: 'var(--border)', borderRadius: 1, overflow: 'hidden', position: 'relative' }}>
      <div style={{
        position: 'absolute', top: 0, left: '-30%', height: '100%', width: '30%',
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        animation: 'bb-flow 1.6s linear infinite',
        animationDelay: delay,
      }} />
    </div>
  )

  return (
    <div style={{ marginBottom: 28 }}>
      <style>{`
        @keyframes bb-flow    { 0%{left:-30%} 100%{left:130%} }
        @keyframes bb-pulse   { 0%,100%{opacity:0} 50%{opacity:1} }
        @keyframes bb-particle{ 0%{left:-4px;opacity:0}10%{opacity:.8}90%{opacity:.8}100%{left:calc(100% + 4px);opacity:0} }
      `}</style>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 144px 1fr', alignItems: 'center' }}>

        {/* ── LEFT: Модель 1.0 ── */}
        <div>
          <div style={{ fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 8 }}>
            Модель 1.0 · сейчас
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>

            {/* КФУ-метрики из params */}
            {nicheMetrics?.kpis.map((kpi, i) => {
              const val    = getKpiValue(kpi, params)
              const level  = assessKpi(kpi, val)
              const colors = LEVEL_COLORS_ASSESS[level]
              return (
                <div key={i} style={{
                  background: colors.bg, border: `1px solid ${colors.border}`,
                  borderRadius: 7, padding: '7px 11px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <span style={{ fontSize: 10, color: 'var(--text3)' }}>{kpi.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: colors.text }}>
                    {formatKpiValue(kpi, val)}
                  </span>
                </div>
              )
            })}

            {/* Выручка и прибыль всегда */}
            <div style={{ height: 1, background: 'var(--border)', margin: '3px 0' }} />
            {[
              { label: 'Выручка / мес', val: revenue  ? formatMoney(revenue) + ' ₽'  : '—' },
              { label: 'Прибыль / мес', val: profit1  ? formatMoney(profit1) + ' ₽'  : '—' },
            ].map((m, i) => (
              <div key={i} style={{
                background: 'var(--bg3)', border: '1px solid var(--border)',
                borderRadius: 7, padding: '7px 11px',
                display: 'flex', justifyContent: 'space-between', opacity: .55,
              }}>
                <span style={{ fontSize: 10, color: 'var(--text3)' }}>{m.label}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)' }}>{m.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── CENTER: Ящик ── */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', padding: '0 6px', gap: 5 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {['.0s','.3s','.6s','.15s','.45s'].map((d,i) => <ArrowRow key={i} color="#3a3a3a" delay={d} />)}
          </div>
          <div style={{
            background: 'var(--bg2)', border: '1px solid #2a2f3d',
            borderRadius: 12, padding: '14px 8px',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 7, position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position:'absolute', inset:-1, borderRadius:13, background:'linear-gradient(135deg,rgba(45,191,138,.1),rgba(139,124,246,.07),rgba(45,191,138,.1))', animation:'bb-pulse 3s ease-in-out infinite' }}/>
            {['22%','48%','74%'].map((y,i) => (
              <div key={i} style={{ position:'absolute', width:3, height:3, borderRadius:'50%', background:i===1?'#8B7CF6':'#2DBF8A', top:y, left:'-4px', animation:`bb-particle ${1.4+i*.3}s linear infinite`, animationDelay:`${i*.4}s`, opacity:.7 }}/>
            ))}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2DBF8A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ position:'relative', filter:'drop-shadow(0 0 5px rgba(45,191,138,.4))' }}>
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.07 4.93l-1.41 1.41M5.34 18.66l-1.41 1.41M12 2v2M12 20v2M4.93 4.93l1.41 1.41M18.66 18.66l1.41 1.41M2 12h2M20 12h2"/>
            </svg>
            <div style={{ fontFamily:'Syne', fontSize:9, fontWeight:700, color:'#fff', textAlign:'center', position:'relative', lineHeight:1.3 }}>Архитектор<br/>прибыли</div>
            <div style={{ fontSize:8, padding:'2px 6px', borderRadius:3, position:'relative', background:'rgba(45,191,138,.15)', border:'1px solid rgba(45,191,138,.3)', color:'var(--green)', letterSpacing:'.06em', fontWeight:600 }}>ФОНД</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {['.0s','.3s','.6s','.15s','.45s'].map((d,i) => <ArrowRow key={i} color="#2DBF8A" delay={d} />)}
          </div>
        </div>

        {/* ── RIGHT: Модель 2.0 ── */}
        <div>
          <div style={{ fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: 8 }}>
            Модель 2.0 · цель с Фондом
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>

            {/* Целевые КФУ-метрики */}
            {nicheMetrics?.kpis.map((kpi, i) => (
              <div key={i} style={{
                background: 'rgba(45,191,138,.06)', border: '1px solid rgba(45,191,138,.2)',
                borderRadius: 7, padding: '7px 11px',
              }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: kpi.hint ? 2 : 0 }}>
                  <span style={{ fontSize: 10, color: 'var(--text2)' }}>{kpi.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--green)' }}>{kpi.targetLabel}</span>
                </div>
                {kpi.hint && (
                  <div style={{ fontSize: 9, color: 'var(--text3)', lineHeight: 1.4 }}>{kpi.hint}</div>
                )}
              </div>
            ))}

            <div style={{ height: 1, background: 'var(--border)', margin: '3px 0' }} />

            {/* Целевая выручка и прибыль */}
            {[
              {
                label: 'Выручка / мес',
                val: formatMoney(Math.round(tRevenue)) + ' ₽',
                delta: revenue ? `+${Math.round((tRevenue / revenue - 1) * 100)}%` : null,
              },
              {
                label: 'Прибыль / мес',
                val: formatMoney(Math.round(tProfit)) + ' ₽',
                delta: profit1 && tProfit > profit1 ? `×${(tProfit / Math.max(profit1, 1)).toFixed(1)}` : null,
              },
            ].map((m, i) => (
              <div key={i} style={{
                background: 'rgba(45,191,138,.06)', border: '1px solid rgba(45,191,138,.2)',
                borderRadius: 7, padding: '7px 11px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ fontSize: 10, color: 'var(--text2)' }}>{m.label}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--green)' }}>{m.val}</span>
                  {m.delta && (
                    <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 3, background: 'rgba(45,191,138,.15)', color: 'var(--green)', fontWeight: 600 }}>
                      {m.delta}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

// ─── MAIN SUMMARY ────────────────────────────────────────────
export default function Summary() {
  const { state } = useAppStore()
  const niche   = nicheConfigs[state.selectedNiche]
  const nicheId = state.selectedNiche
  if (!niche) return null

  const d = state.diagnostic
  const chartData = buildGrowthProjection(
    state.targetProfit || 500000,
    Math.min((state.dividendClient || 30) + (state.dividendFund || 10), 95),
    state.extraInvestment || 0,
    state.targetMargin || NICHE_TARGET_MARGINS[nicheId] || 30
  )

  return (
    <div>
      <SectionLabel>Шаг 7 из 7 · Итоговый разбор</SectionLabel>
      <h2 style={{ fontFamily:'Syne', fontSize:22, fontWeight:800, color:'#fff', marginBottom:6 }}>
        Полный разбор бизнес-модели
      </h2>
      <p style={{ fontSize:12, color:'var(--text3)', marginBottom:24 }}>
        Скролл вниз — весь анализ от ниши до инвестиционного прогноза
      </p>

      {/* BLACK BOX */}
      <BlackBox
        nicheId={nicheId}
        params={state.params}
        targetRevenue={state.targetRevenue}
        targetMargin={state.targetMargin}
        targetProfit={state.targetProfit}
        niche={niche}
      />

      {/* 01 — Ниша */}
      <div style={{ fontSize:10, letterSpacing:'.15em', textTransform:'uppercase', color:'var(--green)', marginBottom:10 }}>01 · Компания и тип бизнеса</div>
      <Card accent style={{ marginBottom:20 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
          <div style={{ color:'var(--green)' }}>{NICHE_ICONS[nicheId]}</div>
          <div>
            <div style={{ fontFamily:'Syne', fontSize:18, fontWeight:700, color:'#fff' }}>{niche.name}</div>
            <div style={{ fontSize:12, color:'var(--text3)', marginTop:2 }}>{niche.desc}</div>
          </div>
        </div>
        <p style={{ fontSize:13, color:'var(--text2)', lineHeight:1.7, marginBottom:10 }}>{niche.businessType}</p>
        <div style={{ padding:'10px 14px', background:'var(--green-dim)', border:'1px solid rgba(45,191,138,.2)', borderRadius:8, fontSize:13, color:'var(--green)', lineHeight:1.65 }}>
          {niche.mainConclusion}
        </div>
      </Card>

      {/* 02 — Формулы */}
      <div style={{ fontSize:10, letterSpacing:'.15em', textTransform:'uppercase', color:'var(--green)', marginBottom:10 }}>02 · Формулы прибыли — 5 уровней</div>
      <Card style={{ marginBottom:20 }}>
        {niche.formulaLevels.map((f,i) => (
          <div key={i} style={{ display:'flex', gap:10, marginBottom:10, paddingBottom:10, borderBottom:i<niche.formulaLevels.length-1?'1px solid var(--border)':'none' }}>
            <div style={{ width:20, height:20, borderRadius:'50%', background:'var(--bg3)', border:`1px solid ${LEVEL_COLORS[i]}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color:LEVEL_COLORS[i], fontWeight:700, flexShrink:0, marginTop:2 }}>{f.level}</div>
            <div>
              <div style={{ fontSize:10, color:LEVEL_COLORS[i], fontWeight:600, marginBottom:3, textTransform:'uppercase', letterSpacing:'.06em' }}>{f.name}</div>
              <div style={{ fontSize:12, color:'var(--text2)', fontFamily:'monospace', lineHeight:1.55 }}>{f.formula}</div>
            </div>
          </div>
        ))}
      </Card>

      {/* 03 — КФУ */}
      <div style={{ fontSize:10, letterSpacing:'.15em', textTransform:'uppercase', color:'var(--green)', marginBottom:10 }}>03 · Ключевые факторы успеха</div>
      <Card style={{ marginBottom:20 }}>
        {niche.kfus.map((k,i) => (
          <div key={i} style={{ display:'flex', gap:10, marginBottom:8, paddingBottom:8, borderBottom:i<niche.kfus.length-1?'1px solid var(--border)':'none' }}>
            <div style={{ width:18, height:18, borderRadius:'50%', background:k.weight==='high'?'var(--green-dim)':'var(--bg3)', border:`1px solid ${k.weight==='high'?'rgba(45,191,138,.3)':'var(--border)'}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color:k.weight==='high'?'var(--green)':'var(--text3)', fontWeight:700, flexShrink:0, marginTop:1 }}>{i+1}</div>
            <div>
              <span style={{ fontSize:13, fontWeight:600, color:'var(--text)' }}>{k.name}</span>
              <span style={{ fontSize:12, color:'var(--text2)', marginLeft:8 }}>{k.why}</span>
            </div>
          </div>
        ))}
      </Card>

      {/* 04 — Бенчмарки */}
      <div style={{ fontSize:10, letterSpacing:'.15em', textTransform:'uppercase', color:'var(--green)', marginBottom:10 }}>04 · Бенчмарки модели</div>
      <Card style={{ marginBottom:20 }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:6, fontSize:10, color:'var(--text3)', marginBottom:8, padding:'0 2px' }}>
          <div>Показатель</div>
          <div style={{ color:'var(--red)' }}>Слабо</div>
          <div style={{ color:'var(--amber)' }}>Нормально</div>
          <div style={{ color:'var(--green)' }}>Сильно</div>
        </div>
        {niche.benchmarks.map((b,i) => (
          <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:6, padding:'7px 0', borderBottom:i<niche.benchmarks.length-1?'1px solid var(--border)':'none', alignItems:'start' }}>
            <div style={{ fontSize:12, color:'var(--text2)', fontWeight:500 }}>{b.metric}</div>
            <div style={{ fontSize:11, color:'var(--red)' }}>{b.weak}</div>
            <div style={{ fontSize:11, color:'var(--amber)' }}>{b.normal}</div>
            <div style={{ fontSize:11, color:'var(--green)' }}>{b.strong}</div>
          </div>
        ))}
      </Card>

      {/* 05 — Финансовая модель */}
      <div style={{ fontSize:10, letterSpacing:'.15em', textTransform:'uppercase', color:'var(--green)', marginBottom:10 }}>05 · Финансовая модель 1.0 → 2.0</div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
        <Card>
          <div style={{ fontSize:10, letterSpacing:'.1em', textTransform:'uppercase', color:'var(--text3)', marginBottom:8 }}>Модель 1.0 · сейчас</div>
          <div style={{ fontSize:13, color:'var(--text2)', lineHeight:1.65, whiteSpace:'pre-line' }}>{d?.model1Summary || 'Введите параметры на шаге 3'}</div>
        </Card>
        <Card>
          <div style={{ fontSize:10, letterSpacing:'.1em', textTransform:'uppercase', color:'var(--green)', marginBottom:8 }}>Модель 2.0 · цель</div>
          <div style={{ fontSize:13, color:'var(--text)', lineHeight:1.65, whiteSpace:'pre-line' }}>{d?.model2Summary || niche.benchmarks.slice(0,3).map(b=>`${b.metric}: ${b.strong}`).join('\n')}</div>
        </Card>
      </div>
      <Card style={{ marginBottom:10 }}>
        <div style={{ fontSize:10, letterSpacing:'.1em', textTransform:'uppercase', color:'var(--text3)', marginBottom:8 }}>Переход 1.0 → 2.0</div>
        <p style={{ fontSize:13, color:'var(--text2)', lineHeight:1.7 }}>{niche.model1to2}</p>
      </Card>

      {/* Распределение прибыли */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:20 }}>
        {[
          { label:'Прибыль / мес (цель)',                    value:formatMoney(state.targetProfit||0),                                              color:'var(--green)'  },
          { label:`Дивиденды клиент ${state.dividendClient||30}%`, value:formatMoney((state.targetProfit||0)*(state.dividendClient||30)/100), color:'var(--amber)'  },
          { label:`Дивиденды фонд ${state.dividendFund||10}%`,     value:formatMoney((state.targetProfit||0)*(state.dividendFund||10)/100),   color:'var(--purple)' },
        ].map((m,i) => (
          <div key={i} style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:8, padding:'12px', textAlign:'center' }}>
            <div style={{ fontSize:18, fontWeight:700, color:m.color, fontFamily:'Syne' }}>{m.value}</div>
            <div style={{ fontSize:10, color:'var(--text3)', marginTop:4 }}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* 06 — Рычаги роста */}
      <div style={{ fontSize:10, letterSpacing:'.15em', textTransform:'uppercase', color:'var(--green)', marginBottom:10 }}>06 · Рычаги роста</div>
      <Card style={{ marginBottom:20 }}>
        {niche.levers.map((l,i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:7, paddingBottom:7, borderBottom:i<niche.levers.length-1?'1px solid var(--border)':'none' }}>
            <div style={{ width:5, height:5, borderRadius:'50%', background:l.flag==='real'?'var(--green)':l.flag==='hard'?'var(--amber)':'var(--red)', flexShrink:0 }}/>
            <span style={{ fontSize:13, color:'var(--text2)', flex:1 }}>{l.action}</span>
            <span style={{ fontSize:11, color:'var(--text3)', marginRight:6 }}>{l.months} мес</span>
            <FlagBadge flag={l.flag}/>
          </div>
        ))}
      </Card>

      {/* 07 — 5 стримов */}
      <div style={{ fontSize:10, letterSpacing:'.15em', textTransform:'uppercase', color:'var(--green)', marginBottom:10 }}>07 · 5 стримов следующего шага</div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:8, marginBottom:20 }}>
        {niche.nextStepStreams.map((s,i) => {
          const colors = ['var(--green)','var(--purple)','var(--amber)','var(--blue)','var(--green)']
          return (
            <div key={i} style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:8, padding:'12px 10px', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:colors[i] }}/>
              <div style={{ fontSize:18, fontWeight:800, fontFamily:'Syne', color:colors[i], opacity:.25, marginBottom:6 }}>0{i+1}</div>
              <div style={{ fontSize:10, color:'var(--text2)', lineHeight:1.5 }}>{s}</div>
            </div>
          )
        })}
      </div>

      {/* 08 — График */}
      <div style={{ fontSize:10, letterSpacing:'.15em', textTransform:'uppercase', color:'var(--green)', marginBottom:10 }}>08 · Инвестиционный прогноз на 12 месяцев</div>
      <Card style={{ marginBottom:28, padding:'16px 12px 8px' }}>
        <p style={{ fontSize:11, color:'var(--text3)', marginBottom:12 }}>Прогноз при достижении целевой модели 2.0</p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData} margin={{ top:4, right:8, left:0, bottom:0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
            <XAxis dataKey="month" tick={{ fontSize:10, fill:'var(--text3)' }}/>
            <YAxis tick={{ fontSize:10, fill:'var(--text3)' }} tickFormatter={v=>formatMoney(v)} width={52}/>
            <Tooltip formatter={v=>[`${formatMoney(v)} ₽`]} contentStyle={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:8, fontSize:12 }}/>
            <Line type="monotone" dataKey="baseProfit"   name="Без доп. инвестиций" stroke="#8B7CF6" strokeWidth={1.5} dot={false} strokeOpacity={.7}/>
            <Line type="monotone" dataKey="investProfit" name="С инвестициями"       stroke="#2DBF8A" strokeWidth={2.5} dot={false}/>
          </LineChart>
        </ResponsiveContainer>
        <div style={{ display:'flex', gap:20, padding:'8px 4px 0', fontSize:11, color:'var(--text2)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}><div style={{ width:16, height:2, background:'#2DBF8A', borderRadius:1 }}/>С инвестициями</div>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}><div style={{ width:16, height:2, background:'#8B7CF6', borderRadius:1, opacity:.7 }}/>Без доп. вложений</div>
        </div>
      </Card>

      <button onClick={()=>{ if(window.confirm('Начать новый анализ?')) window.location.reload() }}
        style={{ background:'var(--green)', color:'#0D0F14', fontWeight:700, fontSize:14, padding:'12px 28px', borderRadius:10, border:'none', cursor:'pointer', width:'100%' }}>
        Начать новый анализ
      </button>
    </div>
  )
}