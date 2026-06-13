import { Card } from '../ResultsDashboard'

const VAL_COLORS = { High: 'var(--green)', Medium: 'var(--cyan)', Low: 'var(--text-muted)' }

export default function UpsellCard({ data }) {
  if (!data) return null

  return (
    <Card title="Upsell Opportunities" icon="💰" color="var(--green)">
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <StatBox label="Total Found" value={data.total_opportunities} color="var(--green)" />
        <StatBox label="Missed" value={data.missed_opportunities} color="var(--amber)" />
        <StatBox label="Revenue" value={data.revenue_potential} color={VAL_COLORS[data.revenue_potential] || 'var(--cyan)'} />
      </div>

      {data.opportunities?.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {data.opportunities.map((opp, i) => {
            const color = VAL_COLORS[opp.potential_value] || 'var(--cyan)'
            return (
              <div key={i} style={{ background: 'var(--surface-2)', border: `1px solid ${color}20`, borderRadius: 'var(--radius-sm)', padding: '10px 12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <span style={{ fontWeight: 600, fontSize: 13, color }}>{opp.product_service}</span>
                  <div style={{ display: 'flex', gap: 5, flexShrink: 0, marginLeft: 8 }}>
                    <Chip label={opp.potential_value} color={color} />
                    <Chip label={opp.was_attempted ? '✓ Tried' : '✗ Missed'} color={opp.was_attempted ? 'var(--green)' : 'var(--red)'} />
                  </div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
                  <strong style={{ color: 'var(--text-muted)' }}>Trigger:</strong> {opp.trigger}
                </div>
                <div style={{ fontSize: 11, color: 'var(--green)', padding: '5px 8px', background: 'rgba(74,222,128,0.06)', borderRadius: 4 }}>
                  💡 {opp.recommendation}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: 13 }}>No upsell opportunities identified in this call.</p>
      )}

      {data.upsell_summary && (
        <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)' }}>{data.upsell_summary}</div>
      )}
    </Card>
  )
}

function StatBox({ label, value, color }) {
  return (
    <div style={{ flex: 1, textAlign: 'center', background: `${color}10`, border: `1px solid ${color}25`, borderRadius: 'var(--radius-sm)', padding: '10px 8px' }}>
      <div style={{ fontSize: 20, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>{label}</div>
    </div>
  )
}

function Chip({ label, color }) {
  return (
    <span style={{ fontSize: 10, background: `${color}15`, border: `1px solid ${color}30`, color, borderRadius: 4, padding: '1px 6px', whiteSpace: 'nowrap' }}>{label}</span>
  )
}
