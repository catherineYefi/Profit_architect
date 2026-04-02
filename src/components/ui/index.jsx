import React from 'react'

// ─── StepIndicator ───────────────────────────────────────────
export function StepIndicator({ current, total = 5 }) {
  return (
    <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
      {Array.from({ length: total }, (_, i) => {
        const n = i + 1
        const done   = n < current
        const active = n === current
        return (
          <div key={n} style={{
            width: 7, height: 7, borderRadius: '50%',
            background: active ? 'var(--green)' : done ? 'rgba(45,191,138,.4)' : 'var(--border)',
            transition: 'background .2s',
          }} />
        )
      })}
    </div>
  )
}

// ─── Card ────────────────────────────────────────────────────
export function Card({ children, style, accent }) {
  return (
    <div style={{
      background: 'var(--bg2)',
      border: `1px solid ${accent ? `rgba(45,191,138,.3)` : 'var(--border)'}`,
      borderRadius: 'var(--radius)',
      padding: '16px 20px',
      position: 'relative',
      overflow: 'hidden',
      ...(accent && { borderTop: '2px solid var(--green)' }),
      ...style,
    }}>
      {children}
    </div>
  )
}

// ─── SectionLabel ────────────────────────────────────────────
export function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase',
      color: 'var(--text3)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10,
    }}>
      {children}
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
    </div>
  )
}

// ─── MetricCard ──────────────────────────────────────────────
export function MetricCard({ label, value, sub, color = 'var(--text)', delta }) {
  return (
    <div style={{
      background: 'var(--bg3)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-sm)', padding: '12px 14px', textAlign: 'center',
    }}>
      <div style={{ fontSize: 20, fontWeight: 700, color, fontFamily: 'Syne', lineHeight: 1.2 }}>
        {value}
      </div>
      {delta && (
        <div style={{ fontSize: 10, color: delta > 0 ? 'var(--green)' : 'var(--red)', marginTop: 2 }}>
          {delta > 0 ? '+' : ''}{delta}%
        </div>
      )}
      <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 10, color: 'var(--text2)', marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

// ─── Slider ──────────────────────────────────────────────────
export function Slider({ label, value, min = 0, max = 100, step = 1, onChange, color = 'var(--green)', valueSuffix = '%' }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text2)', marginBottom: 6 }}>
        <span>{label}</span>
        <span style={{ color, fontWeight: 600 }}>{value}{valueSuffix}</span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{
          width: '100%', height: 4, appearance: 'none',
          background: `linear-gradient(to right, ${color} 0%, ${color} ${((value - min) / (max - min)) * 100}%, var(--border) ${((value - min) / (max - min)) * 100}%, var(--border) 100%)`,
          borderRadius: 2, outline: 'none', cursor: 'pointer',
          border: 'none', padding: 0,
        }}
      />
    </div>
  )
}

// ─── BtnPrimary / BtnSecondary ───────────────────────────────
export function BtnPrimary({ children, onClick, disabled, style }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: disabled ? 'var(--border2)' : 'var(--green)',
      color: disabled ? 'var(--text3)' : '#0D0F14',
      fontWeight: 700, fontSize: 13, padding: '10px 22px',
      borderRadius: 8, border: 'none', transition: 'opacity .15s',
      cursor: disabled ? 'not-allowed' : 'pointer',
      ...style,
    }}>
      {children}
    </button>
  )
}

export function BtnSecondary({ children, onClick, style }) {
  return (
    <button onClick={onClick} style={{
      background: 'var(--bg3)', color: 'var(--text2)', fontWeight: 500, fontSize: 13,
      padding: '10px 18px', borderRadius: 8, border: '1px solid var(--border)',
      transition: 'all .15s', ...style,
    }}>
      {children}
    </button>
  )
}

// ─── FlagBadge ───────────────────────────────────────────────
export function FlagBadge({ flag }) {
  const map = {
    real: { label: '✓ Реально',   bg: 'var(--green-dim)', color: 'var(--green)' },
    hard: { label: '~ Сложно',    bg: 'var(--amber-dim)',  color: 'var(--amber)' },
    no:   { label: '✕ Нереально', bg: 'var(--red-dim)',    color: 'var(--red)'   },
  }
  const f = map[flag] || map.hard
  return (
    <span style={{
      fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 3,
      background: f.bg, color: f.color, letterSpacing: '.04em', textTransform: 'uppercase',
    }}>
      {f.label}
    </span>
  )
}

// ─── LoadingSpinner ──────────────────────────────────────────
export function LoadingSpinner({ text = 'Анализирую...' }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text2)' }}>
      <div style={{
        width: 32, height: 32, border: '2px solid var(--border)',
        borderTop: '2px solid var(--green)', borderRadius: '50%',
        animation: 'spin .8s linear infinite', margin: '0 auto 16px',
      }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ fontSize: 13 }}>{text}</div>
    </div>
  )
}

// ─── StreamBadge ─────────────────────────────────────────────
export function StreamBadge({ num, label, gap, color, dimColor }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      background: dimColor, border: `1px solid ${color}33`,
      borderRadius: 6, padding: '7px 10px',
    }}>
      <span style={{ fontWeight: 700, fontSize: 11, color }}>{`0${num}`}</span>
      <span style={{ fontSize: 12, color: 'var(--text2)', flex: 1 }}>{label}</span>
      {gap && <span style={{ fontSize: 11, color, fontWeight: 600 }}>{gap}</span>}
    </div>
  )
}
