function BlackBox({ niche, model1, model2, streams }) {
  const metrics1 = [
    { name:'Выручка / мес',  val: model1.revenue || '—' },
    { name:'Маржа',          val: model1.margin  || '—' },
    { name:'Рентабельность', val: model1.rent    || '—' },
    { name:'Прибыль / мес',  val: model1.profit  || '—' },
  ]
  const metrics2 = [
    { name:'Выручка / мес',  val: model2.revenue || '—', delta: model2.dRevenue },
    { name:'Маржа',          val: model2.margin  || '—', delta: model2.dMargin  },
    { name:'Рентабельность', val: model2.rent    || '—', delta: model2.dRent    },
    { name:'Прибыль / мес',  val: model2.profit  || '—', delta: model2.dProfit  },
  ]
  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 140px 1fr', gap:0, alignItems:'center', marginBottom:20 }}>
      {/* LEFT */}
      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
        <div style={{ fontSize:10, letterSpacing:'.15em', textTransform:'uppercase', color:'var(--text3)', marginBottom:4 }}>Модель 1.0 · сейчас</div>
        {metrics1.map((m,i) => (
          <div key={i} style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:8, padding:'9px 12px', display:'flex', justifyContent:'space-between', opacity:.6 }}>
            <span style={{ fontSize:11, color:'var(--text3)' }}>{m.name}</span>
            <span style={{ fontSize:12, fontWeight:600, color:'var(--text2)' }}>{m.val}</span>
          </div>
        ))}
      </div>

      {/* CENTER BOX */}
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'0 8px', gap:8 }}>
        {/* arrows in */}
        <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:4 }}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{ height:2, width:'100%', position:'relative', overflow:'hidden', background:'var(--border)', borderRadius:1 }}>
              <div style={{
                position:'absolute', top:0, left:0, height:'100%', width:'30%',
                background:'linear-gradient(90deg,transparent,var(--green),transparent)',
                animation:`flow ${1.4+i*.2}s linear infinite`,
                animationDelay:`${i*.3}s`
              }}/>
            </div>
          ))}
        </div>

        {/* Box */}
        <div style={{
          width:120, height:140, background:'var(--bg2)',
          border:'1px solid var(--border)', borderRadius:12,
          display:'flex', flexDirection:'column', alignItems:'center',
          justifyContent:'center', gap:8, position:'relative', overflow:'hidden',
        }}>
          <div style={{ position:'absolute', inset:-1, borderRadius:13, background:'linear-gradient(135deg,rgba(45,191,138,.1),rgba(139,124,246,.08))', animation:'pulse 3s ease-in-out infinite' }}/>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2DBF8A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ position:'relative' }}>
            <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M5.34 18.66l-1.41 1.41M12 2v2M12 20v2M4.93 4.93l1.41 1.41M18.66 18.66l1.41 1.41M2 12h2M20 12h2"/>
          </svg>
          <div style={{ fontFamily:'Syne', fontSize:10, fontWeight:700, color:'#fff', textAlign:'center', position:'relative', lineHeight:1.3 }}>Архитектор<br/>прибыли</div>
          <div style={{ fontSize:9, padding:'2px 7px', borderRadius:3, background:'rgba(45,191,138,.15)', border:'1px solid rgba(45,191,138,.3)', color:'var(--green)', position:'relative' }}>ФОНД</div>
        </div>
      </div>

      {/* RIGHT */}
      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
        <div style={{ fontSize:10, letterSpacing:'.15em', textTransform:'uppercase', color:'var(--green)', marginBottom:4 }}>Модель 2.0 · цель</div>
        {metrics2.map((m,i) => (
          <div key={i} style={{ background:'rgba(45,191,138,.04)', border:'1px solid rgba(45,191,138,.2)', borderRadius:8, padding:'9px 12px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontSize:11, color:'var(--text2)' }}>{m.name}</span>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <span style={{ fontSize:12, fontWeight:600, color:'var(--green)' }}>{m.val}</span>
              {m.delta && <span style={{ fontSize:9, padding:'1px 5px', borderRadius:3, background:'rgba(45,191,138,.15)', color:'var(--green)' }}>{m.delta}</span>}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes flow{0%{left:-30%}100%{left:130%}}
        @keyframes pulse{0%,100%{opacity:0}50%{opacity:1}}
      `}</style>
    </div>
  )
}