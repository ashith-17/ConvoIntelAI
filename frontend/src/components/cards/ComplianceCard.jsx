import { Card } from '../ResultsDashboard'

const CHECK_LABELS = {
  greeting: 'Proper Greeting',
  identification: 'Customer Identification',
  disclosure: 'Required Disclosures',
  resolution: 'Issue Resolution Attempt',
  closing: 'Proper Call Closing',
  profanity_free: 'Profanity-Free Interaction',
  data_privacy: 'Data Privacy Compliance',
}

export default function ComplianceCard({ data }) {
  if (!data) return null
  const pct = Math.round((data.compliance_score || 0) * 100)
  const status = data.adherence_status
  const statusColor = status === 'followed' ? 'var(--green)' : status === 'partial' ? 'var(--amber)' : 'var(--red)'

  return (
    <Card title="Compliance Score" icon="✅" color={statusColor}>
      {/* Score Circle */}
      <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginBottom: 18 }}>
        <div style={{ position: 'relative', width: 80, height: 80, flexShrink: 0 }}>
          <svg width="80" height="80" viewBox="0 0 80 80" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="40" cy="40" r="32" fill="none" stroke="var(--border)" strokeWidth="8" />
            <circle cx="40" cy="40" r="32" fill="none" stroke={statusColor} strokeWidth="8"
              strokeDasharray={`${2 * Math.PI * 32 * pct / 100} ${2 * Math.PI * 32}`}
              strokeLinecap="round" />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
            <span style={{ fontWeight: 800, fontSize: 18, color: statusColor, lineHeight: 1 }}>{pct}%</span>
          </div>
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: statusColor, textTransform: 'capitalize', marginBottom: 4 }}>
            {status?.replace('_', ' ')}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{data.explanation?.slice(0, 120)}</div>
        </div>
      </div>

      {/* Checklist */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {Object.entries(data.checks || {}).map(([key, passed]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 18, height: 18, borderRadius: 4, background: passed ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.1)', border: `1px solid ${passed ? 'var(--green)' : 'var(--red)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: passed ? 'var(--green)' : 'var(--red)', flexShrink: 0 }}>
              {passed ? '✓' : '✗'}
            </div>
            <span style={{ fontSize: 12, color: passed ? 'var(--text)' : 'var(--text-muted)' }}>{CHECK_LABELS[key] || key}</span>
          </div>
        ))}
      </div>

      {data.violations?.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 11, color: 'var(--red)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Violations</div>
          {data.violations.map((v, i) => (
            <div key={i} style={{ fontSize: 12, color: 'var(--red)', marginBottom: 4, display: 'flex', gap: 6 }}>
              <span>✗</span>{v}
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
