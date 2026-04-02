import React, { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useAppStore } from '../store/useAppStore'
import { buildGrowthProjection, formatMoney } from '../utils/financialMath'
import { SectionLabel, Card, Slider, BtnSecondary, MetricCard } from './ui'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
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
  const { state, set, prevStep } = useAppStore()

  const targetProfit  = state.targetProfit  || 500_000
  const targetMargin  = state.targetMargin  || 25
  const dividendTotal = state.dividendClient + state.dividendFund
  const extraInvest   = state.extraInvestment || 0

  const chartData = useMemo(
    () => buildGrowthProjection(targetProfit, dividendTotal, extraInvest, targetMargin),
    [targetProfit, dividendTotal, extraInvest, targetMargin]
  )

  const totalBase   = chartData.reduce((s, p) => s + p.baseProfit, 0)
  const totalInvest = chartData.reduce((s, p) => s + p.investProfit, 0)
  const uplift      = totalBase > 0 ? Math.round((totalInvest - totalBase) / totalBase * 100) : 0

  return (
    <div>
      <SectionLabel>Шаг 5 из 5</SectionLabel>
      <h2 style={{ fontFamily: 'Syne', fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
        Инвестиционный калькулятор
      </h2>
      <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 20 }}>
        Прогноз при достижении целевой модели 2.0
      </p>

      {/* Итоговые метрики */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
        <MetricCard label="Прибыль за 12 мес (без доп. инвестиций)" value={formatMoney(totalBase)} color="var(--purple)" />
        <MetricCard label="Прибыль за 12 мес (с инвестициями)"       value={formatMoney(totalInvest)} color="var(--green)" />
        <MetricCard label="Рост от инвестиций"                        value={`+${uplift}%`} color="var(--amber)" />
      </div>

      {/* График */}
      <Card style={{ marginBottom: 16 }}>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--text3)' }} />
            <YAxis
              tick={{ fontSize: 10, fill: 'var(--text3)' }}
              tickFormatter={v => formatMoney(v)}
              width={48}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 11, color: 'var(--text2)', paddingTop: 8 }}
            />
            <Line
              type="monotone" dataKey="baseProfit" name="Без доп. инвестиций"
              stroke="var(--purple)" strokeWidth={1.5} dot={false} strokeOpacity={0.6}
            />
            <Line
              type="monotone" dataKey="investProfit" name="С инвестициями"
              stroke="var(--green)" strokeWidth={2.5} dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Ползунок инвестиций */}
      <Card style={{ marginBottom: 20 }}>
        <Slider
          label="Дополнительные инвестиции"
          value={extraInvest / 1_000_000}
          min={0} max={20} step={0.5}
          onChange={v => set({ extraInvestment: v * 1_000_000 })}
          valueSuffix=" млн ₽"
          color="var(--green)"
        />
        {extraInvest > 0 && (
          <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>
            {(() => {
              const niche = state.selectedNiche
              if (niche === 'marketplace') return 'Направляется в товарный запас'
              if (niche === 'infobiz')     return 'Направляется в рекламный трафик'
              if (niche === 'broker')      return 'Направляется в привлечение лидов'
              if (niche === 'production')  return 'Направляется в загрузку мощностей'
              return 'Направляется в развитие бизнеса'
            })()}
          </div>
        )}
      </Card>

      {/* Рост прибыли к-во */}
      {d?.realisticGrowth && (
        <div style={{ padding: '10px 14px', background: 'var(--green-dim)', border: '1px solid rgba(45,191,138,.2)', borderRadius: 8, fontSize: 13, color: 'var(--green)', marginBottom: 20 }}>
          Реалистичный потенциал роста прибыли: {state.diagnostic.realisticGrowth}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        <BtnSecondary onClick={prevStep}>← Назад</BtnSecondary>
        <button
          onClick={() => { if (confirm('Начать новый анализ?')) { window.location.reload() } }}
          style={{
            background: 'var(--purple)', color: '#fff', fontWeight: 700, fontSize: 13,
            padding: '10px 22px', borderRadius: 8, border: 'none', cursor: 'pointer',
          }}
        >
          Новый анализ
        </button>
      </div>
    </div>
  )
}
