import React from 'react'
import { useAppStore } from '../store/useAppStore'
import { nicheConfigs } from '../data/nicheConfigs'
import {
  formatMoney,
  getMarginFromParams,
  getFixedCosts,
  getRevenueFromParams,
  NICHE_TARGET_MARGINS,
} from '../utils/financialMath'
import { SectionLabel, Card, Slider, BtnPrimary, BtnSecondary, StreamBadge } from './ui'

// Считает % разрыв между двумя числами
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
  const currentProfit  = currentRevenue > 0
    ? Math.max(0, currentRevenue * currentMargin / 100 - fixedCosts)
    : 0
  const currentRent = currentRevenue > 0 && currentProfit > 0
    ? parseFloat((currentProfit / currentRevenue * 100).toFixed(1))
    : 0

  // ── Целевые показатели ──
  const targetMargin  = NICHE_TARGET_MARGINS[nicheId] || 30
  const targetRevenue = Math.round(currentRevenue * 1.4)
  const targetCosts   = Math.round(fixedCosts * 1.1)
  const targetProfit  = Math.max(0, targetRevenue * targetMargin / 100 - targetCosts)
  const targetRent    = targetRevenue > 0 && targetProfit > 0
    ? parseFloat((targetProfit / targetRevenue * 100).toFixed(1))
    : targetMargin

  // ── Дивиденды ──
  const dividendClient = state.dividendClient || 30
  const dividendFund   = state.dividendFund   || 10
  const dividendTotal  = Math.min(dividendClient + dividendFund, 95)
  const reinvest       = Math.round(targetProfit * (100 - dividendTotal) / 100)
  const clientDiv      = Math.round(targetProfit * dividendClient / 100)
  const fundDiv        = Math.round(targetProfit * dividendFund / 100)

  // ── P&L строки с двойным разрывом ──
  const pnlRows = [
    {
      label:   'Выручка / мес',
      current: formatMoney(currentRevenue),
      target:  formatMoney(targetRevenue),
      gapAbs:  `+${formatMoney(targetRevenue - currentRevenue)}`,
      gapPct:  calcPctGap(currentRevenue, targetRevenue),
      color:   'var(--green)',
    },
    {
      label:   'Маржа',
      current: `${currentMargin}%`,
      target:  `${targetMargin}%`,
      gapAbs:  `+${(targetMargin - currentMargin).toFixed(1)} п.п.`,
      gapPct:  null, // п.п. не конвертируем в %
      color:   'var(--green)',
    },
    {
      label:   'Косты / мес',
      current: formatMoney(fixedCosts),
      target:  formatMoney(targetCosts),
      gapAbs:  `+${formatMoney(targetCosts - fixedCosts)}`,
      gapPct:  calcPctGap(fixedCosts, targetCosts),
      color:   'var(--amber)',
    },
    {
      label:   'Рентабельность',
      current: `${currentRent}%`,
      target:  `${targetRent}%`,
      gapAbs:  `+${(targetRent - currentRent).toFixed(1)} п.п.`,
      gapPct:  null,
      color:   'var(--green)',
    },
    {
      label:   'Чистая прибыль',
      current: formatMoney(currentProfit),
      target:  formatMoney(targetProfit),
      gapAbs:  `+${formatMoney(targetProfit - currentProfit)}`,
      gapPct:  calcPctGap(currentProfit, targetProfit),
      color:   'var(--green)',
      bold:    true,
    },
    {
      label:   'Дивиденды клиент',
      current: formatMoney(currentProfit * dividendClient / 100),
      target:  formatMoney(clientDiv),
      gapAbs:  '',
      gapPct:  null,
      color:   'var(--amber)',
    },
    {
      label:   'Дивиденды фонд',
      current: formatMoney(currentProfit * dividendFund / 100),
      target:  formatMoney(fundDiv),
      gapAbs:  '',
      gapPct:  null,
      color:   'var(--purple)',
    },
  ]

  const revGap    = formatMoney(targetRevenue - currentRevenue)
  const marginGap = (targetMargin - currentMargin).toFixed(1)
  const costGap   = formatMoney(targetCosts - fixedCosts)

  return (
    <div>
      <SectionLabel>Шаг 5 из 7</SectionLabel>
      <h2 style={{ fontFamily: 'Syne', fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 20 }}>
        Финансовый прогноз · Сравнительный P&L
      </h2>

      {/* P&L таблица */}
      <Card style={{ marginBottom: 14 }}>
        {/* Заголовок */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 80px 80px 1fr',
          fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase',
          color: 'var(--text3)', paddingBottom: 8, marginBottom: 4,
          borderBottom: '1px solid var(--border)', gap: 8,
        }}>
          <div />
          <div style={{ textAlign: 'right' }}>Сейчас</div>
          <div style={{ textAlign: 'right', color: 'var(--green)' }}>Цель 2.0</div>
          <div style={{ textAlign: 'center' }}>Разрыв</div>
        </div>

        {pnlRows.map((r, i) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: '1fr 80px 80px 1fr',
            gap: 8, padding: '7px 0',
            borderBottom: i < pnlRows.length - 1 ? '1px solid var(--border)' : 'none',
            fontWeight: r.bold ? 600 : 400,
          }}>
            <div style={{ fontSize: 12, color: r.bold ? 'var(--text)' : 'var(--text2)' }}>{r.label}</div>
            <div style={{ textAlign: 'right', fontSize: 12, color: 'var(--text2)' }}>{r.current}</div>
            <div style={{ textAlign: 'right', fontSize: 12, color: r.color }}>{r.target}</div>

            {/* Двойной разрыв: абсолютный + % */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
              {r.gapAbs && (
                <span style={{ fontSize: 11, color: r.color }}>{r.gapAbs}</span>
              )}
              {r.gapPct !== null && r.gapPct !== undefined && (
                <span style={{
                  fontSize: 10, padding: '1px 5px', borderRadius: 3, fontWeight: 600,
                  background: r.color === 'var(--green)'
                    ? 'rgba(45,191,138,.12)' : r.color === 'var(--amber)'
                    ? 'rgba(245,158,42,.1)' : 'rgba(139,124,246,.12)',
                  color: r.color,
                }}>
                  {r.gapPct > 0 ? '+' : ''}{r.gapPct}%
                </span>
              )}
            </div>
          </div>
        ))}
      </Card>

      {/* Ползунки */}
      <Card style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 12 }}>
          Распределение прибыли
        </div>
        <Slider label="Дивиденды клиенту" value={dividendClient} min={0} max={80} step={5} onChange={v => set({ dividendClient: v })} color="var(--amber)" />
        <Slider label="Дивиденды фонду"   value={dividendFund}   min={10} max={25} step={5} onChange={v => set({ dividendFund: v })}   color="var(--purple)" />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text3)', marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
          <span>Реинвестируется {100 - dividendTotal}%</span>
          <span style={{ color: 'var(--green)', fontWeight: 600 }}>= {formatMoney(reinvest)} ₽ / мес</span>
        </div>
        {dividendClient + dividendFund > 95 && (
          <div style={{ fontSize: 11, color: 'var(--amber)', marginTop: 6 }}>
            ⚠ Сумма дивидендов превышает 95% — реинвестирование минимально
          </div>
        )}
      </Card>

      {/* 3 стрима */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 8 }}>Стримы для трекера</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <StreamBadge num={1} label={`Как растим выручку · разрыв +${revGap} (+${calcPctGap(currentRevenue, targetRevenue)}%)`}    color="var(--blue)"  dimColor="var(--blue-dim)" />
          <StreamBadge num={2} label={`Как повышаем маржу · разрыв +${marginGap} п.п.`}                                              color="var(--green)" dimColor="var(--green-dim)" />
          <StreamBadge num={3} label={`Как снижаем косты · контроль +${costGap} (+${calcPctGap(fixedCosts, targetCosts)}%)`}         color="var(--amber)" dimColor="var(--amber-dim)" />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <BtnSecondary onClick={prevStep}>← Назад</BtnSecondary>
        <BtnPrimary onClick={() => { set({ targetProfit, targetRevenue, targetMargin, targetCosts, reinvest }); nextStep() }}>
          Далее — инвестиционный калькулятор →
        </BtnPrimary>
      </div>
    </div>
  )
}