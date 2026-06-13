import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts'
import { Card } from '../ResultsDashboard'

const GRADE_COLORS = {
  Excellent: 'var(--green)',
  Good: 'var(--cyan)',
  Average: 'var(--amber)',
  'Needs Improvement': 'var(--red)',
}

export default function AgentScorecardCard({ data }) {
  if (!data) return null

  const radarData = [
    { metric: 'Communication', score: data.communication },
    { metric: 'Professionalism', score: data.professionalism },
    { metric: 'Listening', score: data.listening_skills },
    { metric: 'Resolution', score: data.resolution_quality },
    { metric: 'Empathy', score: data.empathy },
  ]

  const gradeColor = GRADE_COLORS[data.grade] || 'var(--primary)'

  return (
    <Card title="Agent Performance Scorecard" icon="🏆" color="var(--primary)">
      {/* Overall Score */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
        <div style={{ position: 'relative', width: 90, height: 90, flexShrink: 0 }}>
          <svg width="90" height="90" viewBox="0 0 90 90" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="45" cy="45" r="36" fill="none" stroke="var(--border)" strokeWidth="8" />
            <circle cx="45" cy="45" r="36" fill="none" stroke={gradeColor} strokeWidth="8"
              strokeDasharray={`${2 * Math.PI * 36 * data.overall_score / 100} ${2 * Math.PI * 36}`}
              strokeLinecap="round" style={{ transition: 'stroke-dasharray 1s ease' }} />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontWeight: 800, fontSize: 20, color: gradeColor, lineHeight: 1 }}>{data.overall_score}</span>
            <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>/100</span>
          </div>
        </div>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: gradeColor }}>{data.grade}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>Overall Performance</div>
        </div>
      </div>

      {/* Radar */}
      <div style={{ height: 200, marginBottom: 16 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData}>
            <PolarGrid stroke="rgba(255,255,255,0.08)" />
            <PolarAngleAxis dataKey="metric" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
            <Radar dataKey="score" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.15} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Dimension bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {radarData.map(({ metric, score }) => (
          <ScoreBar key={metric} label={metric} value={score} />
        ))}
      </div>

      {/* Strengths/Improvements */}
      {data.strengths?.length > 0 && (
        <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <FeedbackList title="Strengths" items={data.strengths} color="var(--green)" icon="✓" />
          <FeedbackList title="Improve" items={data.improvements} color="var(--amber)" icon="↑" />
        </div>
      )}
    </Card>
  )
}

function ScoreBar({ label, value }) {
  const color = value >= 85 ? 'var(--green)' : value >= 70 ? 'var(--cyan)' : value >= 55 ? 'var(--amber)' : 'var(--red)'
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 600, color }}>{value}</span>
      </div>
      <div style={{ height: 5, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${value}%`, background: color, borderRadius: 4, transition: 'width 0.8s ease' }} />
      </div>
    </div>
  )
}

function FeedbackList({ title, items, color, icon }) {
  return (
    <div>
      <div style={{ fontSize: 11, color, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>{title}</div>
      {items?.map((item, i) => (
        <div key={i} style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, display: 'flex', gap: 5 }}>
          <span style={{ color, flexShrink: 0 }}>{icon}</span>{item}
        </div>
      ))}
    </div>
  )
}
