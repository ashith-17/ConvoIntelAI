import { Card } from '../ResultsDashboard'

const PRIORITY_COLORS = { High: 'var(--red)', Medium: 'var(--amber)', Low: 'var(--green)' }
const OWNER_COLORS = {
  Agent: 'var(--primary)', 'Team Lead': 'var(--cyan)', 'Technical Team': 'var(--amber)',
  Customer: 'var(--pink)', Management: 'var(--red)',
}
const CAT_ICONS = {
  'Follow-up': '📞', Resolution: '✅', Escalation: '🔴', Documentation: '📄',
  Training: '📚', Compensation: '💳',
}

export default function ActionItemsCard({ data }) {
  if (!data) return null

  return (
    <Card title="Auto-Generated Action Items" icon="📋" color="var(--cyan)">
      {data.escalation_required && (
        <div style={{ marginBottom: 14, padding: '8px 12px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 'var(--radius-sm)', fontSize: 12, color: 'var(--red)', fontWeight: 600 }}>
          🔴 Escalation Required — Needs management attention
        </div>
      )}

      {data.action_items?.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {data.action_items.map((item, i) => {
            const prColor = PRIORITY_COLORS[item.priority] || 'var(--amber)'
            const ownerColor = OWNER_COLORS[item.owner] || 'var(--primary)'
            return (
              <div key={i} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', borderLeft: `3px solid ${prColor}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <span style={{ fontSize: 14 }}>{CAT_ICONS[item.category] || '📌'}</span>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{item.action}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <Chip label={item.priority} color={prColor} />
                  <Chip label={item.owner} color={ownerColor} />
                  <Chip label={item.deadline} color="var(--text-muted)" />
                  <Chip label={item.category} color="var(--text-dim)" />
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: 13 }}>No action items identified.</p>
      )}

      {data.summary && (
        <div style={{ marginTop: 14, padding: '8px 12px', background: 'var(--cyan-dim)', border: '1px solid rgba(34,211,238,0.15)', borderRadius: 'var(--radius-sm)', fontSize: 12, color: 'var(--text-muted)' }}>
          <strong style={{ color: 'var(--cyan)' }}>Next Steps:</strong> {data.summary}
        </div>
      )}
    </Card>
  )
}

function Chip({ label, color }) {
  return (
    <span style={{ fontSize: 10, background: `${color}12`, border: `1px solid ${color}28`, color, borderRadius: 4, padding: '1px 6px' }}>{label}</span>
  )
}
