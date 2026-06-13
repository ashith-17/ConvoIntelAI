import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { Card } from '../ResultsDashboard'

const EMOTION_COLORS = {
  Happy: '#4ade80',
  Satisfied: '#22d3ee',
  Neutral: '#94a3b8',
  Confused: '#fbbf24',
  Frustrated: '#f97316',
  Angry: '#f87171',
}

const EMOTION_EMOJI = {
  Happy: '😊', Satisfied: '😌', Neutral: '😐', Confused: '😕', Frustrated: '😤', Angry: '😡'
}

export default function SentimentTimelineCard({ data }) {
  const timeline = data?.timeline || []
  const chartData = timeline.map(p => ({ ...p, scoreDisplay: Math.round(p.score * 100) }))

  return (
    <Card title="Customer Sentiment Timeline" icon="📈" color="var(--cyan)" style={{ marginTop: 0 }}>
      {/* Emotion Badges */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {timeline.map((point, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, background: 'var(--surface-2)', border: `1px solid ${EMOTION_COLORS[point.emotion] || '#94a3b8'}40`, borderRadius: 10, padding: '8px 12px', minWidth: 80 }}>
            <span style={{ fontSize: 18 }}>{EMOTION_EMOJI[point.emotion] || '😐'}</span>
            <span style={{ fontSize: 11, color: EMOTION_COLORS[point.emotion] || '#94a3b8', fontWeight: 600 }}>{point.emotion}</span>
            <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>{point.timestamp}</span>
          </div>
        ))}
      </div>

      {/* Chart */}
      {chartData.length > 1 && (
        <div style={{ height: 180, marginBottom: 16 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="sentGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--cyan)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--cyan)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="timestamp" stroke="var(--text-muted)" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
              <YAxis domain={[-100, 100]} stroke="var(--text-muted)" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
              <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4" />
              <Tooltip
                contentStyle={{ background: '#0f0f1a', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                formatter={(v, n, p) => [p.payload.emotion, 'Emotion']}
                labelFormatter={l => `Time: ${l}`}
              />
              <Area type="monotone" dataKey="scoreDisplay" stroke="var(--cyan)" strokeWidth={2} fill="url(#sentGrad)" dot={{ fill: 'var(--cyan)', r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Snippets */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {timeline.map((point, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--text-muted)', minWidth: 38, paddingTop: 2 }}>{point.timestamp}</span>
            <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: `${EMOTION_COLORS[point.emotion] || '#94a3b8'}18`, color: EMOTION_COLORS[point.emotion] || '#94a3b8', minWidth: 80, textAlign: 'center', fontWeight: 600 }}>{point.emotion}</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: 1.5 }}>"{point.text_snippet}"</span>
          </div>
        ))}
      </div>

      {data?.emotion_journey && (
        <div style={{ marginTop: 14, padding: '10px 14px', background: 'var(--cyan-dim)', border: '1px solid rgba(34,211,238,0.2)', borderRadius: 'var(--radius-sm)', fontSize: 12, color: 'var(--text-muted)' }}>
          <strong style={{ color: 'var(--cyan)' }}>Journey:</strong> {data.emotion_journey}
        </div>
      )}
    </Card>
  )
}
