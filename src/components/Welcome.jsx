import React from 'react'
import { useAppStore } from '../store/useAppStore'

export default function Welcome() {
  const { set } = useAppStore()

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '60px 24px 40px' }}>

      {/* Логотип */}
      <div style={{ marginBottom: 48 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          background: 'var(--bg2)', border: '1px solid var(--border)',
          borderRadius: 10, padding: '8px 14px', marginBottom: 32,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
          </svg>
          <span style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 500 }}>Фонд Дашкиева · Инструмент трекера</span>
        </div>

        <h1 style={{
          fontFamily: 'Syne', fontSize: 36, fontWeight: 800, color: '#fff',
          lineHeight: 1.1, marginBottom: 16,
        }}>
          Архитектор<br />
          <span style={{ color: 'var(--green)' }}>прибыли</span>
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text2)', lineHeight: 1.75, maxWidth: 520 }}>
          Диагностический инструмент для трекерской сессии.
          За 5–10 минут покажет механику прибыли бизнеса,
          главное ограничение и путь к модели 2.0.
        </p>
      </div>

      {/* Как работает */}
      <div style={{ marginBottom: 44 }}>
        <div style={{ fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 16 }}>
          Как работает
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            {
              num: '01',
              title: 'Выбираете нишу и смотрите модель',
              desc: 'Формулы прибыли 5 уровней, КФУ, бенчмарки и переход 1.0→2.0',
              color: 'var(--blue)',
            },
            {
              num: '02',
              title: 'Вводите цифры бизнеса клиента',
              desc: 'Текущие параметры — выручка, маржа, ключевые метрики ниши',
              color: 'var(--purple)',
            },
            {
              num: '03',
              title: 'Получаете разбор и прогноз',
              desc: 'Диагностика, сравнительный P&L, инвестиционный калькулятор, итоговое саммари',
              color: 'var(--green)',
            },
          ].map((s, i) => (
            <div key={i} style={{
              display: 'flex', gap: 16, alignItems: 'flex-start',
              background: 'var(--bg2)', border: '1px solid var(--border)',
              borderRadius: 10, padding: '14px 16px',
            }}>
              <div style={{
                fontFamily: 'Syne', fontSize: 13, fontWeight: 800,
                color: s.color, opacity: .5, flexShrink: 0, marginTop: 2, width: 24,
              }}>
                {s.num}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 3 }}>{s.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.55 }}>{s.desc}</div>
              </div>
              <div style={{
                width: 3, flexShrink: 0, alignSelf: 'stretch',
                borderRadius: 2, background: s.color, opacity: .3, marginLeft: 'auto',
              }} />
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={() => set({ currentStep: 1 })}
        style={{
          width: '100%', background: 'var(--green)', color: '#0D0F14',
          fontFamily: 'Manrope', fontWeight: 700, fontSize: 15,
          padding: '14px 28px', borderRadius: 10, border: 'none',
          cursor: 'pointer', transition: 'opacity .15s',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}
        onMouseEnter={e => e.target.style.opacity = '.88'}
        onMouseLeave={e => e.target.style.opacity = '1'}
      >
        Начать сессию
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </button>

      <div style={{ marginTop: 14, textAlign: 'center', fontSize: 11, color: 'var(--text3)' }}>
        Данные сессии сохраняются в вашем браузере
      </div>
    </div>
  )
}