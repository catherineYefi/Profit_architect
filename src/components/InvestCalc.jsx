import React, { useMemo, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useAppStore } from '../store/useAppStore'
import { buildGrowthProjection, formatMoney } from '../utils/financialMath'
import { SectionLabel, Card, Slider, BtnSecondary, BtnPrimary, MetricCard } from './ui'
import ConfirmDialog from './ConfirmDialog'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:8, padding:'10px 14px', fontSize:12 }}>
      <div style={{ color:'var(--text3)', marginBottom:6 }}>{label}</div>
      {payload.map((p,i) => (
        <div key={i} style={{ color:p.color, marginBottom:3 }}>
          {p.name}: <strong>{formatMoney(p.value)} ₽</strong>
        </div>
      ))}
    </div>
  )
}

// Куда идут инвестиции по нише
const INVEST_DIRECTION = {
  marketplace: { text:'товарный запас', hint:'Увеличивает покрытие прибыльного спроса и ускоряет оборачиваемость' },
  infobiz:     { text:'рекламный трафик', hint:'Масштабирует воронку при условии положительного LTV/CAC' },
  broker:      { text:'привлечение лидов', hint:'Увеличивает поток при условии прибыльной юнит-экономики сделки' },
  rental:      { text:'pipeline объектов', hint:'Позволяет брать больше объектов с входным дисконтом' },
  event:       { text:'заполнение слабых слотов', hint:'Маркетинг на корпоративы и ДР в непиковое время' },
  clinic:      { text:'маркетинг доверия', hint:'Контент, кейсы, отзывы — снижает CAC и повышает конверсию консультации' },
}

export default function InvestCalc() {
  const { state, set, prevStep, nextStep } = useAppStore()
  const [showConfirm, setShowConfirm] = useState(false)

  const targetProfit  = state.targetProfit  || 500_000
  const targetMargin  = state.targetMargin  || 25
  const dividendTotal = Math.min((state.dividendClient || 30) + (state.dividendFund || 10), 95)
  const extraInvest   = state.extraInvestment || 0

  const chartData = useMemo(
    () => buildGrowthProjection(targetProfit, dividendTotal, extraInvest, targetMargin),
    [targetProfit, dividendTotal, extraInvest, targetMargin]
  )

  const totalBase   = chartData.reduce((s,p) => s+(p.baseProfit||0), 0)
  const totalInvest = chartData.reduce((s,p) => s+(p.investProfit||0), 0)
  const uplift      = totalBase > 0 ? Math.round((totalInvest-totalBase)/totalBase*100) : 0

  const nicheId   = state.selectedNiche
  const direction = INVEST_DIRECTION[nicheId] || { text:'развитие бизнеса', hint:'Направляется в ключевые точки роста модели 2.0' }

  return (
    <div>
      <SectionLabel>Шаг 6 из 7</SectionLabel>
      <h2 style={{ fontFamily:'Syne', fontSize:20, fontWeight:700, color:'#fff', marginBottom:6 }}>
        Инвестиционный калькулятор
      </h2>
      <p style={{ fontSize:12, color:'var(--text3)', marginBottom:20 }}>
        Прогноз накопленной прибыли за 12 месяцев при достижении модели 2.0
      </p>

      {/* Метрики */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:20 }}>
        <MetricCard label="За 12 мес (базовый сценарий)"  value={formatMoney(totalBase)}           color="var(--purple)" />
        <MetricCard label="За 12 мес (с инвестициями)"    value={formatMoney(totalInvest)}         color="var(--green)"  />
        <MetricCard label="Прирост от инвестиций"         value={uplift>0?`+${uplift}%`:'—'}       color="var(--amber)"  />
      </div>

      {/* График */}
      <Card style={{ marginBottom:16, padding:'16px 12px 8px' }}>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData} margin={{ top:4, right:8, left:0, bottom:0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="month" tick={{ fontSize:10, fill:'var(--text3)' }} />
            <YAxis tick={{ fontSize:10, fill:'var(--text3)' }} tickFormatter={v=>formatMoney(v)} width={52} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="baseProfit"   name="Базовый сценарий"  stroke="#8B7CF6" strokeWidth={1.5} dot={false} strokeOpacity={.7} />
            <Line type="monotone" dataKey="investProfit" name="С инвестициями"    stroke="#2DBF8A" strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
        <div style={{ display:'flex', gap:20, padding:'8px 4px 0', fontSize:11, color:'var(--text2)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}><div style={{ width:16, height:2, background:'#2DBF8A', borderRadius:1 }}/>С инвестициями</div>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}><div style={{ width:16, height:2, background:'#8B7CF6', borderRadius:1, opacity:.7 }}/>Базовый сценарий</div>
        </div>
        {extraInvest === 0 && (
          <div style={{ marginTop:10, fontSize:11, color:'var(--text3)', textAlign:'center' }}>
            ↕ Подвигайте ползунок ниже — увидите эффект инвестиций
          </div>
        )}
        {/* Объяснение механики */}
        <div style={{ marginTop:10, padding:'8px 12px', background:'var(--bg3)', borderRadius:6, fontSize:10, color:'var(--text3)', lineHeight:1.6 }}>
          Базовый сценарий — рост за счёт реинвестирования {state.reinvestPct ?? 0}% прибыли в {direction.text}.
          {extraInvest > 0 && ` Второй сценарий — плюс ${(extraInvest/1_000_000).toFixed(1)} млн ₽ разовых внешних вложений.`}
          {' '}Маржинальность модели {state.targetMargin || 25}%. Прогноз на 12 мес при достижении модели 2.0.
        </div>
      </Card>

      {/* Ползунок инвестиций с пояснением */}
      <Card style={{ marginBottom:20 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
          <div>
            <div style={{ fontSize:12, fontWeight:600, color:'var(--text)', marginBottom:3 }}>
              Дополнительные инвестиции в модель
            </div>
            <div style={{ fontSize:11, color:'var(--text3)', lineHeight:1.5 }}>
              Разовая сумма, которую Фонд вкладывает на старте перехода к модели 2.0.
              Направляется в <strong style={{ color:'var(--text2)' }}>{direction.text}</strong>.
            </div>
          </div>
          <div style={{ fontSize:14, fontWeight:700, color:'var(--green)', fontFamily:'Syne', flexShrink:0, marginLeft:16 }}>
            {(extraInvest/1_000_000).toFixed(1)} млн ₽
          </div>
        </div>

        <Slider
          label=""
          value={extraInvest/1_000_000}
          min={0} max={20} step={0.5}
          onChange={v => set({ extraInvestment: v*1_000_000 })}
          valueSuffix=" млн ₽"
          color="var(--green)"
        />

        {/* Пояснение куда идут деньги */}
        {extraInvest > 0 && (
          <div style={{
            marginTop:10, padding:'8px 12px',
            background:'rgba(45,191,138,.06)', border:'1px solid rgba(45,191,138,.15)',
            borderRadius:6, fontSize:11, color:'var(--text2)', lineHeight:1.55,
            display:'flex', alignItems:'flex-start', gap:6,
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0, marginTop:1}}>
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            {direction.hint}
          </div>
        )}

        {/* Шкала */}
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:'var(--text3)', marginTop:6 }}>
          <span>0 — без инвестиций</span>
          <span>20 млн — максимум</span>
        </div>
      </Card>

      {state.diagnostic?.realisticGrowth && (
        <div style={{ padding:'10px 14px', background:'var(--green-dim)', border:'1px solid rgba(45,191,138,.2)', borderRadius:8, fontSize:13, color:'var(--green)', marginBottom:20 }}>
          Потенциал роста прибыли: {state.diagnostic.realisticGrowth}
        </div>
      )}

      <div style={{ display:'flex', gap:10 }}>
        <BtnSecondary onClick={prevStep}>← Назад</BtnSecondary>
        <BtnPrimary onClick={nextStep}>Итоговый разбор →</BtnPrimary>
        <button
          onClick={() => setShowConfirm(true)}
          style={{ background:'none', border:'1px solid var(--border)', color:'var(--text3)', fontSize:12, padding:'10px 14px', borderRadius:8, cursor:'pointer' }}
        >
          Новый анализ
        </button>
      </div>

      <ConfirmDialog
        open={showConfirm}
        title="Начать новый анализ?"
        desc="Все данные текущей сессии будут сброшены."
        confirmLabel="Сбросить и начать заново"
        cancelLabel="Остаться"
        danger
        onConfirm={() => window.location.reload()}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  )
}