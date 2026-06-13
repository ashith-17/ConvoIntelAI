export default function SummaryBar({ data }) {
  const compliance = Math.round((data.compliance?.compliance_score || 0) * 100)
  const agentScore = data.agent_scorecard?.overall_score || 0
  const churnRisk = data.churn_prediction?.risk_level || 'Low'
  const intent = data.customer_intent?.primary_intent || 'Unknown'
  const sentiment = data.sentiment_timeline?.dominant_emotion || 'Neutral'
  const actionCount = data.action_items?.action_items?.length || 0
  const upsellCount = data.upsell_opportunities?.total_opportunities || 0
  const objCount = data.objection_detection?.total_objections || 0

  const churnColor = churnRisk === 'High' ? 'var(--red)' : churnRisk === 'Medium' ? 'var(--amber)' : 'var(--green)'

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '18px 20px' }}>
      <Metric label="Agent Score" value={`${agentScore}/100`} sub={gradeLabel(agentScore)} color="var(--primary)" />
      <Metric label="Compliance" value={`${compliance}%`} sub={data.compliance?.adherence_status || ''} color={compliance >= 75 ? 'var(--green)' : compliance >= 50 ? 'var(--amber)' : 'var(--red)'} />
      <Metric label="Churn Risk" value={`${data.churn_prediction?.churn_probability || 0}%`} sub={churnRisk} color={churnColor} />
      <Metric label="Dominant Mood" value={sentiment} sub={`Intent: ${intent}`} color="var(--cyan)" />

      <Metric label="Action Items" value={actionCount} sub={data.action_items?.escalation_required ? '🔴 Escalation needed' : 'No escalation'} color="var(--amber)" />
      <Metric label="Objections" value={objCount} sub={`${data.objection_detection?.unaddressed_count || 0} unaddressed`} color={objCount > 2 ? 'var(--red)' : 'var(--text-muted)'} />
      <Metric label="Upsell Signals" value={upsellCount} sub={`${data.upsell_opportunities?.missed_opportunities || 0} missed`} color="var(--green)" />
      <Metric label="Processing" value={data.processingTime || '—'} sub={`Lang: ${data.language}`} color="var(--text-muted)" />
    </div>
  )
}

function Metric({ label, value, sub, color }) {
  return (
    <div>
      <div style={{ color: 'var(--text-muted)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color, lineHeight: 1, marginBottom: 3 }}>{value}</div>
      <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>{sub}</div>
    </div>
  )
}

function gradeLabel(score) {
  if (score >= 90) return 'Excellent'
  if (score >= 75) return 'Good'
  if (score >= 60) return 'Average'
  return 'Needs Improvement'
}
