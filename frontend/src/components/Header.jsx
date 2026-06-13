export default function Header() {
  return (
    <header style={{ borderBottom: '1px solid var(--border)', padding: '20px 24px', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 100, background: 'rgba(6,6,17,0.8)' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, var(--primary), var(--cyan))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
            ◈
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.3px' }}>ConvoIntel AI</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 11, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Conversation Intelligence Platform</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Tag color="var(--green)">STT: Groq Whisper</Tag>
          <Tag color="var(--primary)">LLM: Llama 3.3 70B</Tag>
          <Tag color="var(--cyan)">v2.0</Tag>
        </div>
      </div>
    </header>
  )
}

function Tag({ children, color }) {
  return (
    <span style={{ background: `${color}18`, border: `1px solid ${color}33`, color, borderRadius: 6, padding: '3px 10px', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', letterSpacing: 0.5 }}>
      {children}
    </span>
  )
}
