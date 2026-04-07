import React from 'react'

/**
 * Кастомный диалог подтверждения вместо window.confirm
 * Использование:
 *   const [confirm, setConfirm] = useState(null)
 *   <ConfirmDialog
 *     open={!!confirm}
 *     title="Начать новый анализ?"
 *     desc="Все введённые данные будут сброшены"
 *     onConfirm={() => { window.location.reload() }}
 *     onCancel={() => setConfirm(null)}
 *   />
 */
export default function ConfirmDialog({ open, title, desc, confirmLabel = 'Подтвердить', cancelLabel = 'Отмена', onConfirm, onCancel, danger = false }) {
  if (!open) return null

  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: '20px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg2)', border: '1px solid var(--border)',
          borderRadius: 14, padding: '28px 28px 24px',
          maxWidth: 400, width: '100%',
          boxShadow: '0 24px 48px rgba(0,0,0,.5)',
        }}
      >
        {/* Icon */}
        <div style={{
          width: 44, height: 44, borderRadius: 10, marginBottom: 16,
          background: danger ? 'var(--red-dim)' : 'var(--amber-dim)',
          border: `1px solid ${danger ? 'rgba(240,96,96,.25)' : 'rgba(245,158,42,.2)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {danger
            ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          }
        </div>

        <div style={{ fontFamily: 'Syne', fontSize: 17, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
          {title}
        </div>
        {desc && (
          <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.65, marginBottom: 24 }}>
            {desc}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, background: 'var(--bg3)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '10px', color: 'var(--text2)',
              fontFamily: 'Manrope', fontSize: 13, fontWeight: 500, cursor: 'pointer',
            }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              background: danger ? 'var(--red)' : 'var(--green)',
              border: 'none', borderRadius: 8, padding: '10px',
              color: danger ? '#fff' : '#0D0F14',
              fontFamily: 'Manrope', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}