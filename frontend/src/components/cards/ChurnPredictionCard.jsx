import { Card } from '../ResultsDashboard'

const RISK_COLORS = { Low: 'var(--green)', Medium: 'var(--amber)', High: 'var(--red)' }
const RISK_BG = { Low: 'rgba(74,222,128,0.08)', Medium: 'rgba(251,191,36,0.08)', High: 'rgba(248,113,113,0.08)' }

export default function ChurnPredictionCard({ data }) {
  if (!data) return null
  const color = RISK_COLORS[data.risk_level] || 'var(--amber)'
  const bg = RISK_BG[data.risk_level] || 'transparent'

  return (
    <Card title="Churn Risk Prediction" icon="📉" color="var(--red)">
      <div style={{ background: bg, border: `1px solid ${color}30`, borderRadius: 'var(--radius-sm)', padding: '18px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 18 }}>
        {/* Gauge */}
        <div style={{ flexShrink: 0 }}>
          <GaugeMeter value={data.churn_probability} color={color} />
        </div>
        <div>
          <div style={{ fontSize: 32, fontWeight: 800, color, lineHeight: 1 }}>{data.churn_probability}%</div>
          <div style={{ color, fontWeight: 600, marginBottom: 4 }}>Churn Probability</div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: `${color}20`, border: `1px solid ${color}40`, borderRadius: 20, padding: '2px 10px', fontSize: 12, color }}>
            ● {data.risk_level} Risk
          </div>
        </div>
      </div>

      {data.reasons?.length > 0 && (
        <Section title="Risk Signals" color="var(--red)">
          {data.reasons.map((r, i) => (
            <Item key={i} text={r} icon="⚠" color="var(--red)" />
          ))}
        </Section>
      )}

      {data.retention_suggestions?.length > 0 && (
        <Section title="Retention Actions" color="var(--green)" style={{ marginTop: 12 }}>
          {data.retention_suggestions.map((s, i) => (
            <Item key={i} text={s} icon="✦" color="var(--green)" />
          ))}
        </Section>
      )}
    </Card>
  )
}

function GaugeMeter({ value, color }) {
  const r = 40
  const circ = 2 * Math.PI * r
  const filled = (circ * value) / 100
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
      <circle cx="50" cy="50" r={r} fill="none" stroke="var(--border)" strokeWidth="10" />
      <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="10"
        strokeDasharray={`${filled} ${circ}`} strokeLinecap="round" />
    </svg>
  )
}

function Section({ title, color, children, style = {} }) {
  return (
    <div style={style}>
      <div style={{ fontSize: 11, color, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>{children}</div>
    </div>
  )
}

function Item({ text, icon, color }) {
  return (
    <div style={{ display: 'flex', gap: 8, fontSize: 12, color: 'var(--text-muted)', alignItems: 'flex-start' }}>
      <span style={{ color, flexShrink: 0, marginTop: 1 }}>{icon}</span>{text}
    </div>
  )
}
