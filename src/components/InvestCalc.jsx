import React, { useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { useAppStore } from '../store/useAppStore'
import { buildGrowthProjection, formatMoney } from '../utils/financialMath'
import { SectionLabel, Card, Slider, BtnSecondary, BtnPrimary, MetricCard } from './ui'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--bg2)', border: '1px solid var(--border)',
      borderRadius: 8, padding: '10px 14px', fontSize: 12
    }}>
      <div style={{ color: 'var(--text3)', marginBottom: 6 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, marginBottom: 3 }}>
          {p.name}: <strong>{formatMoney(p.value)} ₽</strong>
        </div>
      ))}
    </div>
  )
}

export default function InvestCalc() {
  const { state, set, prevStep, nextStep } = useAppStore()

  const targetProfit  = state.targetProfit  || 500_000
  const targetMargin  = state.targetMargin  || 25
  const dividendTotal = (state.dividendClient || 30) + (state.dividendFund || 10)
  const extraInvest   = state.extraInvestment || 0

  const chartData = useMemo(
    () => buildGrowthProjection(targetProfit, dividendTotal, extraInvest, targetMargin),
    [targetProfit, dividendTotal, extraInvest, targetMargin]
  )

  const totalBase   = chartData.reduce((s, p) => s + (p.baseProfit || 0), 0)
  const totalInvest = chartData.reduce((s, p) => s + (p.investProfit || 0), 0)
  const uplift      = totalBase > 0 ? Math.round((totalInvest - totalBase) / totalBase * 100) : 0

  const nicheId = state.selectedNiche
  const investHint = nicheId === 'marketplace' ? 'в товарный запас'
    : nicheId === 'infobiz'    ? 'в рекламный трафик'
    : nicheId === 'broker'     ? 'в привлечение лидов'
    : nicheId === 'production' ? 'в загрузку мощностей'
    : 'в развитие бизнеса'

  return (
    <div>
      <SectionLabel>Шаг 6 из 7</SectionLabel>
      <h2 style={{
        fontFamily: 'Syne', fontSize: 20, fontWeight: 700,
        color: '#fff', marginBottom: 6
      }}>
        Инвестиционный калькулятор
      </h2>
      <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 20 }}>
        Прогноз при достижении целевой модели 2.0
      </p>

      {/* Метрики */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 10, marginBottom: 20
      }}>
        <MetricCard
          label="За 12 мес без доп. инвестиций"
          value={formatMoney(totalBase)}
          color="var(--purple)"
        />
        <MetricCard
          label="За 12 мес с инвестициями"
          value={formatMoney(totalInvest)}
          color="var(--green)"
        />
        <MetricCard
          label="Рост от инвестиций"
          value={uplift > 0 ? `+${uplift}%` : '—'}
          color="var(--amber)"
        />
      </div>

      {/* График */}
      <Card style={{ marginBottom: 16, padding: '16px 12px 8px' }}>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart
            data={chartData}
            margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 10, fill: 'var(--text3)' }}
            />
            <YAxis
              tick={{ fontSize: 10, fill: 'var(--text3)' }}
              tickFormatter={v => formatMoney(v)}
              width={52}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="baseProfit"
              name="Без доп. инвестиций"
              stroke="#8B7CF6"
              strokeWidth={1.5}
              dot={false}
              strokeOpacity={0.7}
            />
            <Line
              type="monotone"
              dataKey="investProfit"
              name="С инвестициями"
              stroke="#2DBF8A"
              strokeWidth={2.5}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>

        <div style={{ display: 'flex', gap: 20, padding: '8px 4px 0', fontSize: 11, color: 'var(--text2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 16, height: 2, background: '#2DBF8A', borderRadius: 1 }} />
            С инвестициями
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 16, height: 2, background: '#8B7CF6', borderRadius: 1, opacity: .7 }} />
            Без доп. вложений
          </div>
        </div>
      </Card>

      {/* Ползунок */}
      <Card style={{ marginBottom: 20 }}>
        <Slider
          label="Дополнительные инвестиции"
          value={extraInvest / 1_000_000}
          min={0}
          max={20}
          step={0.5}
          onChange={v => set({ extraInvestment: v * 1_000_000 })}
          valueSuffix=" млн ₽"
          color="var(--green)"
        />
        {extraInvest > 0 && (
          <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 6 }}>
            Направляется {investHint}
          </div>
        )}
      </Card>

      {/* Реалистичный рост из диагностики */}
      {state.diagnostic?.realisticGrowth && (
        <div style={{
          padding: '10px 14px',
          background: 'var(--green-dim)',
          border: '1px solid rgba(45,191,138,.2)',
          borderRadius: 8, fontSize: 13,
          color: 'var(--green)', marginBottom: 20
        }}>
          Потенциал роста прибыли: {state.diagnostic.realisticGrowth}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        <BtnSecondary onClick={prevStep}>← Назад</BtnSecondary>
        <BtnPrimary onClick={nextStep}>
          Итоговый разбор →
        </BtnPrimary>
        <button
          onClick={() => { if (window.confirm('Начать новый анализ?')) window.location.reload() }}
          style={{
            background: 'none', border: '1px solid var(--border)',
            color: 'var(--text3)', fontSize: 12, padding: '10px 14px',
            borderRadius: 8, cursor: 'pointer',
          }}
        >
          Новый анализ
        </button>
      </div>
    </div>
  )
}