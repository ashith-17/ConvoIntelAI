import { useState } from 'react'
import { Card } from '../ResultsDashboard'

export default function TranscriptCard({ transcript, language, processingTime }) {
  const [expanded, setExpanded] = useState(false)
  const preview = transcript?.slice(0, 600)
  const isLong = transcript?.length > 600

  return (
    <Card title="Full Transcript" icon="📝" color="var(--text)">
      {transcript ? (
        <>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, lineHeight: 1.8, color: 'var(--text-muted)', whiteSpace: 'pre-wrap', maxHeight: expanded ? 'none' : 280, overflow: 'hidden', position: 'relative' }}>
            {expanded ? transcript : preview}
            {!expanded && isLong && (
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, background: 'linear-gradient(transparent, var(--surface))' }} />
            )}
          </div>
          {isLong && (
            <button onClick={() => setExpanded(!expanded)} style={{ marginTop: 10, background: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: '5px 12px', color: 'var(--primary)', fontSize: 12, cursor: 'pointer' }}>
              {expanded ? '▲ Show less' : '▼ Show full transcript'}
            </button>
          )}
          <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Tag label="Language" value={language} color="var(--cyan)" />
            <Tag label="Words" value={transcript.split(' ').length} color="var(--primary)" />
            <Tag label="Time" value={processingTime} color="var(--green)" />
          </div>
        </>
      ) : (
        <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No transcript available. Check audio quality.</p>
      )}
    </Card>
  )
}

function Tag({ label, value, color }) {
  return (
    <span style={{ background: `${color}15`, border: `1px solid ${color}30`, color, borderRadius: 6, padding: '2px 10px', fontSize: 11 }}>
      {label}: <strong>{value}</strong>
    </span>
  )
}
