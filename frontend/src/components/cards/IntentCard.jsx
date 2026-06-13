import { Card } from '../ResultsDashboard'

const INTENT_COLORS = {
  Purchase: 'var(--green)', Complaint: 'var(--red)', Inquiry: 'var(--cyan)',
  Cancellation: 'var(--red)', Support: 'var(--amber)', Renewal: 'var(--green)',
  Refund: 'var(--amber)', Unknown: 'var(--text-muted)',
}

const INTENT_ICONS = {
  Purchase: '🛒', Complaint: '😤', Inquiry: '❓', Cancellation: '❌',
  Support: '🛠', Renewal: '🔄', Refund: '💳', Unknown: '❔',
}

export default function IntentCard({ data }) {
  if (!data) return null
  const primaryColor = INTENT_COLORS[data.primary_intent] || 'var(--primary)'
  const secondaryColor = INTENT_COLORS[data.secondary_intent] || 'var(--text-muted)'

  return (
    <Card title="Customer Intent" icon="🎯" color="var(--pink)">
      <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
        <IntentBadge label="Primary" intent={data.primary_intent} color={primaryColor} confidence={data.confidence} />
        {data.secondary_intent !== 'Unknown' && (
          <IntentBadge label="Secondary" intent={data.secondary_intent} color={secondaryColor} />
        )}
      </div>

      {data.topic && (
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12, padding: '8px 12px', background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', borderLeft: `3px solid var(--pink)` }}>
          {data.topic}
        </div>
      )}

      {data.intent_signals?.length > 0 && (
        <div>
          <div style={{ fontSize: 11, color: 'var(--pink)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Signals</div>
          {data.intent_signals.map((s, i) => (
            <div key={i} style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, display: 'flex', gap: 6 }}>
              <span style={{ color: 'var(--pink)' }}>→</span>{s}
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

function IntentBadge({ label, intent, color, confidence }) {
  return (
    <div style={{ flex: 1, background: `${color}12`, border: `1px solid ${color}30`, borderRadius: 'var(--radius-sm)', padding: '10px 12px', textAlign: 'center' }}>
      <div style={{ fontSize: 24, marginBottom: 4 }}>{INTENT_ICONS[intent] || '❔'}</div>
      <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color }}>{intent}</div>
      {confidence != null && <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{confidence}% confidence</div>}
    </div>
  )
}
