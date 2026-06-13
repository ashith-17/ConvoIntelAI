import { Card } from '../ResultsDashboard'

const SEV_COLORS = { High: 'var(--red)', Medium: 'var(--amber)', Low: 'var(--green)' }

export default function ObjectionCard({ data }) {
  if (!data) return null

  return (
    <Card title="Objection Detection" icon="⚠️" color="var(--amber)">
      <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
        <StatBox label="Total" value={data.total_objections} color="var(--amber)" />
        <StatBox label="Unaddressed" value={data.unaddressed_count} color="var(--red)" />
        <StatBox label="Addressed" value={data.total_objections - data.unaddressed_count} color="var(--green)" />
      </div>

      {data.objections?.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {data.objections.map((obj, i) => {
            const color = SEV_COLORS[obj.severity] || 'var(--amber)'
            return (
              <div key={i} style={{ background: 'var(--surface-2)', border: `1px solid ${color}25`, borderRadius: 'var(--radius-sm)', padding: '10px 12px', borderLeft: `3px solid ${color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color }}>{obj.type}</span>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <Badge label={obj.severity} color={color} />
                    <Badge label={obj.was_addressed ? '✓ Addressed' : '✗ Missed'} color={obj.was_addressed ? 'var(--green)' : 'var(--red)'} />
                  </div>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>"{obj.statement}"</p>
              </div>
            )
          })}
        </div>
      ) : (
        <p style={{ color: 'var(--green)', fontSize: 13 }}>✓ No objections detected</p>
      )}

      {data.objection_summary && (
        <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>{data.objection_summary}</div>
      )}
    </Card>
  )
}

function StatBox({ label, value, color }) {
  return (
    <div style={{ flex: 1, textAlign: 'center', background: `${color}10`, border: `1px solid ${color}25`, borderRadius: 'var(--radius-sm)', padding: '10px 8px' }}>
      <div style={{ fontSize: 24, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>{label}</div>
    </div>
  )
}

function Badge({ label, color }) {
  return (
    <span style={{ fontSize: 10, background: `${color}18`, border: `1px solid ${color}35`, color, borderRadius: 4, padding: '1px 6px' }}>{label}</span>
  )
}
