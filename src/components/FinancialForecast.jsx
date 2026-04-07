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

export default function FinancialForecast() {
  const { state, set, nextStep, prevStep } = useAppStore()
  const niche   = nicheConfigs[state.selectedNiche]
  const nicheId = state.selectedNiche

  // ── Текущие показатели ──────────────────────────────────────
  const currentRevenue = getRevenueFromParams(state.params, nicheId)
  const currentMargin  = getMarginFromParams(state.params, nicheId)
  const fixedCosts     = getFixedCosts(state.params, nicheId)

  // Текущая прибыль = Выручка × Маржа% − Постоянные косты
  const currentProfit = currentRevenue > 0
    ? Math.max(0, currentRevenue * currentMargin / 100 - fixedCosts)
    : 0

  // Рентабельность = Прибыль / Выручка × 100
  const currentRent = currentRevenue > 0 && currentProfit > 0
    ? (currentProfit / currentRevenue * 100).toFixed(1)
    : 0

  // ── Целевые показатели ──────────────────────────────────────
  const targetMargin  = NICHE_TARGET_MARGINS[nicheId] || 30
  const targetRevenue = Math.round(currentRevenue * 1.4)              // +40% ориентир
  const targetCosts   = Math.round(fixedCosts * 1.1)                  // косты растут медленнее
  const targetProfit  = Math.max(0, targetRevenue * targetMargin / 100 - targetCosts)
  const targetRent    = targetRevenue > 0 && targetProfit > 0
    ? (targetProfit / targetRevenue * 100).toFixed(1)
    : targetMargin

  // ── Дивиденды (с защитой от превышения 100%) ────────────────
  const dividendClient = state.dividendClient || 30
  const dividendFund   = state.dividendFund   || 10
  const dividendTotal  = Math.min(dividendClient + dividendFund, 95) // защита
  const reinvest       = Math.round(targetProfit * (100 - dividendTotal) / 100)
  const clientDiv      = Math.round(targetProfit * dividendClient / 100)
  const fundDiv        = Math.round(targetProfit * dividendFund / 100)

  // ── Разрывы ─────────────────────────────────────────────────
  const revGap    = formatMoney(targetRevenue - currentRevenue)
  const marginGap = (targetMargin - currentMargin).toFixed(1)
  const costGap   = formatMoney(targetCosts - fixedCosts)
  const profitGap = formatMoney(targetProfit - currentProfit)

  const pnlRows = [
    {
      label: 'Выручка / мес',
      current: formatMoney(currentRevenue),
      target:  formatMoney(targetRevenue),
      gap: revGap !== '—' ? `+${revGap}` : '—',
      gapColor: 'var(--green)',
    },
    {
      label: 'Маржа',
      current: `${currentMargin}%`,
      target:  `${targetMargin}%`,
      gap: `+${marginGap} п.п.`,
      gapColor: 'var(--green)',
    },
    {
      label: 'Косты / мес',
      current: formatMoney(fixedCosts),
      target:  formatMoney(targetCosts),
      gap: costGap !== '—' ? `+${costGap}` : '—',
      gapColor: 'var(--amber)',
    },
    {
      label: 'Рентабельность',
      current: `${currentRent}%`,
      target:  `${targetRent}%`,
      gap: `+${(parseFloat(targetRent) - parseFloat(currentRent)).toFixed(1)} п.п.`,
      gapColor: 'var(--green)',
    },
    {
      label: 'Чистая прибыль',
      current: formatMoney(currentProfit),
      target:  formatMoney(targetProfit),
      gap: profitGap !== '—' ? `+${profitGap}` : '—',
      gapColor: 'var(--green)',
      bold: true,
    },
    {
      label: 'Дивиденды клиент',
      current: formatMoney(currentProfit * dividendClient / 100),
      target:  formatMoney(clientDiv),
      gap: '',
      gapColor: 'var(--amber)',
    },
    {
      label: 'Дивиденды фонд',
      current: formatMoney(currentProfit * dividendFund / 100),
      target:  formatMoney(fundDiv),
      gap: '',
      gapColor: 'var(--purple)',
    },
  ]

  return (
    <div>
      <SectionLabel>Шаг 5 из 7</SectionLabel>
      <h2 style={{ fontFamily: 'Syne', fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 20 }}>
        Финансовый прогноз · Сравнительный P&L
      </h2>

      {/* P&L таблица */}
      <Card style={{ marginBottom: 14 }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 90px 90px 90px',
          fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase',
          color: 'var(--text3)', paddingBottom: 8, marginBottom: 4,
          borderBottom: '1px solid var(--border)', gap: 8,
        }}>
          <div></div>
          <div style={{ textAlign: 'right' }}>Сейчас</div>
          <div style={{ textAlign: 'right', color: 'var(--green)' }}>Цель 2.0</div>
          <div style={{ textAlign: 'right' }}>Разрыв</div>
        </div>
        {pnlRows.map((r, i) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: '1fr 90px 90px 90px',
            gap: 8, padding: '7px 0',
            borderBottom: i < pnlRows.length - 1 ? '1px solid var(--border)' : 'none',
            fontWeight: r.bold ? 600 : 400,
          }}>
            <div style={{ fontSize: 12, color: r.bold ? 'var(--text)' : 'var(--text2)' }}>{r.label}</div>
            <div style={{ textAlign: 'right', fontSize: 12, color: 'var(--text2)' }}>{r.current}</div>
            <div style={{ textAlign: 'right', fontSize: 12, color: r.gapColor }}>{r.target}</div>
            <div style={{ textAlign: 'right', fontSize: 11, color: r.gapColor }}>{r.gap}</div>
          </div>
        ))}
      </Card>

      {/* Ползунки дивидендов */}
      <Card style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 12 }}>
          Распределение прибыли
        </div>
        <Slider
          label="Дивиденды клиенту"
          value={dividendClient}
          min={0} max={80} step={5}
          onChange={v => set({ dividendClient: v })}
          color="var(--amber)"
        />
        <Slider
          label="Дивиденды фонду"
          value={dividendFund}
          min={10} max={25} step={5}
          onChange={v => set({ dividendFund: v })}
          color="var(--purple)"
        />
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          fontSize: 11, color: 'var(--text3)',
          marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border)',
        }}>
          <span>Реинвестируется {100 - dividendTotal}%</span>
          <span style={{ color: 'var(--green)', fontWeight: 600 }}>
            = {formatMoney(reinvest)} ₽ / мес
          </span>
        </div>
        {dividendClient + dividendFund > 95 && (
          <div style={{ fontSize: 11, color: 'var(--amber)', marginTop: 6 }}>
            ⚠ Сумма дивидендов превышает 95% — реинвестирование минимально
          </div>
        )}
      </Card>

      {/* 3 стрима трекера */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 8 }}>
          Стримы для трекера
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <StreamBadge num={1} label={`Как растим выручку · разрыв +${revGap}/мес`}      color="var(--blue)"  dimColor="var(--blue-dim)" />
          <StreamBadge num={2} label={`Как повышаем маржу · разрыв +${marginGap} п.п.`}  color="var(--green)" dimColor="var(--green-dim)" />
          <StreamBadge num={3} label={`Как снижаем косты · контроль +${costGap}/мес`}    color="var(--amber)" dimColor="var(--amber-dim)" />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <BtnSecondary onClick={prevStep}>← Назад</BtnSecondary>
        <BtnPrimary onClick={() => {
          set({ targetProfit, targetRevenue, targetMargin, targetCosts, reinvest })
          nextStep()
        }}>
          Далее — инвестиционный калькулятор →
        </BtnPrimary>
      </div>
    </div>
  )
}