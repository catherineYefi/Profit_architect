import React from 'react'
import { useAppStore } from '../store/useAppStore'
import { nicheConfigs } from '../data/nicheConfigs'
import {
  formatMoney,
  getMarginFromParams,
  getFixedCosts,
  getRevenueFromParams,
  getNetProfit,
  NICHE_TARGET_MARGINS,
} from '../utils/financialMath'
import { SectionLabel, Card, Slider, BtnPrimary, BtnSecondary, StreamBadge } from './ui'

function calcPctGap(current, target) {
  if (!current || current === 0) return null
  return Math.round((target - current) / current * 100)
}

export default function FinancialForecast() {
  const { state, set, nextStep, prevStep } = useAppStore()
  const niche   = nicheConfigs[state.selectedNiche]
  const nicheId = state.selectedNiche

  // ── Текущие показатели ──
  const currentRevenue = getRevenueFromParams(state.params, nicheId)
  const currentMargin  = getMarginFromParams(state.params, nicheId)
  const fixedCosts     = getFixedCosts(state.params, nicheId)
  const currentProfit  = getNetProfit(state.params, nicheId)
  const currentRent    = currentRevenue > 0 && currentProfit > 0
    ? parseFloat((currentProfit / currentRevenue * 100).toFixed(1))
    : 0

  // ── Целевые показатели ──
  const targetMargin  = NICHE_TARGET_MARGINS[nicheId] || 30
  const targetRevenue = Math.round(currentRevenue * 1.4)
  const targetCosts   = Math.round(fixedCosts * 1.1)
  const targetProfit  = Math.max(0, targetRevenue * targetMargin / 100)
  const targetRent    = targetMargin

  // ── Реинвест и дивиденды (новая логика Жени) ──
  // Шаг 1: % от прибыли идёт в развитие (0–25%)
  // Шаг 2: из остатка делятся дивиденды клиенту и фонду
  const reinvestPct    = state.reinvestPct    ?? 0
  const dividendClient = state.dividendClient ?? 30
  const dividendFund   = state.dividendFund   ?? 10
  const reinvestAmount = Math.round(targetProfit * reinvestPct / 100)
  const remainingDiv   = targetProfit - reinvestAmount
  const clientDiv      = Math.round(remainingDiv * dividendClient / 100)
  const fundDiv        = Math.round(remainingDiv * dividendFund / 100)
  const undistributed  = Math.max(0, remainingDiv - clientDiv - fundDiv)

  // ── P&L строки ──
  const revGap    = currentRevenue > 0 ? formatMoney(targetRevenue - currentRevenue) : '—'
  const marginGap = (targetMargin - currentMargin).toFixed(1)
  const costGap   = fixedCosts > 0 ? formatMoney(targetCosts - fixedCosts) : '—'

  const pnlRows = [
    {
      label:   'Выручка / мес',
      current: formatMoney(currentRevenue),
      target:  formatMoney(targetRevenue),
      gapAbs:  currentRevenue > 0 ? `+${formatMoney(targetRevenue - currentRevenue)}` : '—',
      gapPct:  calcPctGap(currentRevenue, targetRevenue),
      color:   'var(--green)',
    },
    {
      label:   'Маржа операц.',
      current: `${currentMargin}%`,
      target:  `${targetMargin}%`,
      gapAbs:  currentMargin > 0 ? `+${(targetMargin - currentMargin).toFixed(1)} п.п.` : '—',
      gapPct:  null,
      color:   'var(--green)',
    },
    {
      label:   'Косты / мес',
      current: formatMoney(fixedCosts),
      target:  formatMoney(targetCosts),
      gapAbs:  fixedCosts > 0 ? `+${formatMoney(targetCosts - fixedCosts)}` : '—',
      gapPct:  calcPctGap(fixedCosts, targetCosts),
      color:   'var(--amber)',
    },
    {
      label:   'Рентабельность',
      current: `${currentRent}%`,
      target:  `${targetRent}%`,
      gapAbs:  currentRent > 0 ? `+${(targetRent - currentRent).toFixed(1)} п.п.` : '—',
      gapPct:  null,
      color:   'var(--green)',
    },
    {
      label:   'Чистая прибыль',
      current: formatMoney(currentProfit),
      target:  formatMoney(targetProfit),
      gapAbs:  currentProfit >= 0 ? `+${formatMoney(targetProfit - currentProfit)}` : '—',
      gapPct:  calcPctGap(currentProfit || 1, targetProfit),
      color:   'var(--green)',
      bold:    true,
    },
    {
      label:   `Инвест в развитие (${reinvestPct}%)`,
      current: '—',
      target:  reinvestPct > 0 ? formatMoney(reinvestAmount) : '—',
      gapAbs:  '',
      gapPct:  null,
      color:   'var(--blue)',
    },
    {
      label:   `Дивиденды клиент`,
      current: formatMoney(Math.round(currentProfit * dividendClient / 100)),
      target:  formatMoney(clientDiv),
      gapAbs:  '',
      gapPct:  null,
      color:   'var(--amber)',
    },
    {
      label:   `Дивиденды фонд`,
      current: formatMoney(Math.round(currentProfit * dividendFund / 100)),
      target:  formatMoney(fundDiv),
      gapAbs:  '',
      gapPct:  null,
      color:   'var(--purple)',
    },
  ]

  return (
    <div>
      <SectionLabel>Шаг 5 из 7</SectionLabel>
      <h2 style={{ fontFamily:'Syne', fontSize:20, fontWeight:700, color:'#fff', marginBottom:20 }}>
        Финансовый прогноз · Сравнительный P&L
      </h2>

      {/* P&L таблица */}
      <Card style={{ marginBottom:14 }}>
        <div style={{
          display:'grid', gridTemplateColumns:'1fr 80px 80px 1fr',
          fontSize:10, letterSpacing:'.08em', textTransform:'uppercase',
          color:'var(--text3)', paddingBottom:8, marginBottom:4,
          borderBottom:'1px solid var(--border)', gap:8,
        }}>
          <div/>
          <div style={{ textAlign:'right' }}>Сейчас</div>
          <div style={{ textAlign:'right', color:'var(--green)' }}>Цель 2.0</div>
          <div style={{ textAlign:'center' }}>Разрыв</div>
        </div>
        {pnlRows.map((r, i) => (
          <div key={i} style={{
            display:'grid', gridTemplateColumns:'1fr 80px 80px 1fr',
            gap:8, padding:'7px 0',
            borderBottom: i < pnlRows.length - 1 ? '1px solid var(--border)' : 'none',
            fontWeight: r.bold ? 600 : 400,
          }}>
            <div style={{ fontSize:12, color:r.bold?'var(--text)':'var(--text2)' }}>{r.label}</div>
            <div style={{ textAlign:'right', fontSize:12, color:'var(--text2)' }}>{r.current}</div>
            <div style={{ textAlign:'right', fontSize:12, color:r.color }}>{r.target}</div>
            <div style={{ display:'flex', alignItems:'center', gap:5, justifyContent:'center' }}>
              {r.gapAbs && <span style={{ fontSize:11, color:r.color }}>{r.gapAbs}</span>}
              {r.gapPct !== null && r.gapPct !== undefined && (
                <span style={{
                  fontSize:10, padding:'1px 5px', borderRadius:3, fontWeight:600,
                  background: r.color==='var(--green)'
                    ? 'rgba(45,191,138,.12)'
                    : r.color==='var(--amber)'
                      ? 'rgba(245,158,42,.1)'
                      : 'rgba(139,124,246,.12)',
                  color: r.color,
                }}>
                  {r.gapPct > 0 ? '+' : ''}{r.gapPct}%
                </span>
              )}
            </div>
          </div>
        ))}
      </Card>

      {/* Распределение прибыли */}
      <Card style={{ marginBottom:14 }}>
        <div style={{ fontSize:10, letterSpacing:'.1em', textTransform:'uppercase', color:'var(--text3)', marginBottom:14 }}>
          Распределение прибыли
        </div>

        {/* Рычаг 1: Инвест в развитие */}
        <div style={{ marginBottom:12 }}>
          <Slider
            label={`Инвест в развитие · ${reinvestPct}% от прибыли`}
            value={reinvestPct} min={0} max={25} step={5}
            onChange={v => set({ reinvestPct: v })}
            color="var(--blue)"
          />
          <div style={{ fontSize:11, color: reinvestPct > 0 ? 'var(--blue)' : 'var(--text3)', marginTop:4 }}>
            {reinvestPct > 0
              ? `→ ${formatMoney(reinvestAmount)} ₽ / мес идут в рост модели и в инвест-калькулятор`
              : 'Поставьте % чтобы направить часть прибыли в развитие'
            }
          </div>
        </div>

        {/* Рычаг 2 и 3: Дивиденды из остатка */}
        <div style={{
          paddingTop:12, borderTop:'1px solid var(--border)',
          marginBottom:8, fontSize:11, color:'var(--text3)',
        }}>
          Из {formatMoney(remainingDiv)} ₽ остатка распределяем:
        </div>
        <Slider
          label="Дивиденды клиенту"
          value={dividendClient} min={0} max={80} step={5}
          onChange={v => set({ dividendClient: v })}
          color="var(--amber)"
        />
        <Slider
          label="Дивиденды фонду"
          value={dividendFund} min={10} max={25} step={5}
          onChange={v => set({ dividendFund: v })}
          color="var(--purple)"
        />

        {/* Итоговая разбивка */}
        <div style={{
          marginTop:12, paddingTop:12, borderTop:'1px solid var(--border)',
          display:'flex', flexDirection:'column', gap:5,
        }}>
          {[
            { label:`Инвест в рост (${reinvestPct}%)`,    val: reinvestAmount, color:'var(--blue)'   },
            { label:`Клиент (${dividendClient}%)`,         val: clientDiv,      color:'var(--amber)'  },
            { label:`Фонд (${dividendFund}%)`,             val: fundDiv,        color:'var(--purple)' },
            { label:'Нераспределено',                      val: undistributed,  color:'var(--text3)'  },
          ].filter(item => item.val > 0).map((item, i) => (
            <div key={i} style={{ display:'flex', justifyContent:'space-between', fontSize:11 }}>
              <span style={{ color:'var(--text3)' }}>{item.label}</span>
              <span style={{ color: item.color, fontWeight:600 }}>
                {formatMoney(item.val)} ₽ / мес
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* 3 стрима */}
      <div style={{ marginBottom:24 }}>
        <div style={{ fontSize:10, letterSpacing:'.1em', textTransform:'uppercase', color:'var(--text3)', marginBottom:8 }}>
          Стримы для трекера
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          <StreamBadge num={1} label={`Как растим выручку · разрыв +${revGap} (+${calcPctGap(currentRevenue, targetRevenue) || 40}%)`} color="var(--blue)"  dimColor="var(--blue-dim)" />
          <StreamBadge num={2} label={`Как повышаем маржу · разрыв +${marginGap} п.п.`}                                               color="var(--green)" dimColor="var(--green-dim)" />
          <StreamBadge num={3} label={`Как снижаем косты · контроль +${costGap}`}                                                     color="var(--amber)" dimColor="var(--amber-dim)" />
        </div>
      </div>

      <div style={{ display:'flex', gap:10 }}>
        <BtnSecondary onClick={prevStep}>← Назад</BtnSecondary>
        <BtnPrimary onClick={() => {
          set({ targetProfit, targetRevenue, targetMargin, targetCosts })
          nextStep()
        }}>
          Далее — инвестиционный калькулятор →
        </BtnPrimary>
      </div>
    </div>
  )
}