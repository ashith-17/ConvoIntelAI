import TranscriptCard from './cards/TranscriptCard'
import SentimentTimelineCard from './cards/SentimentTimelineCard'
import AgentScorecardCard from './cards/AgentScorecardCard'
import ChurnPredictionCard from './cards/ChurnPredictionCard'
import IntentCard from './cards/IntentCard'
import ObjectionCard from './cards/ObjectionCard'
import UpsellCard from './cards/UpsellCard'
import ActionItemsCard from './cards/ActionItemsCard'
import ComplianceCard from './cards/ComplianceCard'
import SummaryBar from './SummaryBar'

export default function ResultsDashboard({ data }) {
  return (
    <div style={{ animation: 'slide-up 0.5s ease' }}>
      {/* Top summary strip */}
      <SummaryBar data={data} />

      {/* Transcript + Summary side-by-side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <TranscriptCard transcript={data.transcript} language={data.language} processingTime={data.processingTime} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <SummaryBox summary={data.summary} />
          <IntentCard data={data.customer_intent} />
        </div>
      </div>

      {/* Sentiment Timeline full width */}
      <SentimentTimelineCard data={data.sentiment_timeline} />

      {/* Agent scorecard + Churn */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
        <AgentScorecardCard data={data.agent_scorecard} />
        <ChurnPredictionCard data={data.churn_prediction} />
      </div>

      {/* Compliance + Objections */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
        <ComplianceCard data={data.compliance} />
        <ObjectionCard data={data.objection_detection} />
      </div>

      {/* Upsell + Action Items */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
        <UpsellCard data={data.upsell_opportunities} />
        <ActionItemsCard data={data.action_items} />
      </div>
    </div>
  )
}

function SummaryBox({ summary }) {
  return (
    <Card title="AI Summary" icon="🧠" color="var(--cyan)">
      <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: 13 }}>
        {summary || 'No summary available.'}
      </p>
    </Card>
  )
}

export function Card({ title, icon, color = 'var(--primary)', children, style = {} }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', ...style }}>
      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 15 }}>{icon}</span>
        <span style={{ fontWeight: 600, fontSize: 13, color }}>{title}</span>
      </div>
      <div style={{ padding: '16px 18px' }}>
        {children}
      </div>
    </div>
  )
}
