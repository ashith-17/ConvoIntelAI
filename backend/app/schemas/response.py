from pydantic import BaseModel
from typing import List, Optional, Dict, Any


class SentimentPoint(BaseModel):
    timestamp: str
    emotion: str
    text_snippet: str
    score: float


class SentimentTimeline(BaseModel):
    timeline: List[SentimentPoint]
    dominant_emotion: str
    emotion_journey: str


class AgentScorecard(BaseModel):
    communication: int
    professionalism: int
    listening_skills: int
    resolution_quality: int
    empathy: int
    overall_score: int
    strengths: List[str]
    improvements: List[str]
    grade: str


class ChurnPrediction(BaseModel):
    churn_probability: int
    risk_level: str
    reasons: List[str]
    retention_suggestions: List[str]


class CustomerIntent(BaseModel):
    primary_intent: str
    secondary_intent: str
    confidence: int
    intent_signals: List[str]
    topic: str


class Objection(BaseModel):
    type: str
    statement: str
    severity: str
    was_addressed: bool


class ObjectionDetection(BaseModel):
    objections: List[Objection]
    total_objections: int
    unaddressed_count: int
    objection_summary: str


class UpsellOpportunity(BaseModel):
    product_service: str
    trigger: str
    potential_value: str
    was_attempted: bool
    recommendation: str


class UpsellOpportunities(BaseModel):
    opportunities: List[UpsellOpportunity]
    total_opportunities: int
    missed_opportunities: int
    revenue_potential: str
    upsell_summary: str


class ActionItem(BaseModel):
    action: str
    owner: str
    priority: str
    deadline: str
    category: str


class ActionItems(BaseModel):
    action_items: List[ActionItem]
    summary: str
    escalation_required: bool


class Compliance(BaseModel):
    compliance_score: float
    checks: Dict[str, bool]
    violations: List[str]
    adherence_status: str
    explanation: str


class CallIntelligenceResponse(BaseModel):
    status: str
    language: str
    transcript: str
    summary: str
    sentiment_timeline: SentimentTimeline
    agent_scorecard: AgentScorecard
    churn_prediction: ChurnPrediction
    customer_intent: CustomerIntent
    objection_detection: ObjectionDetection
    upsell_opportunities: UpsellOpportunities
    action_items: ActionItems
    compliance: Compliance
    processingTime: Optional[str] = None
