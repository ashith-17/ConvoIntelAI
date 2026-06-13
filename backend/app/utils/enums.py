from enum import Enum


class ResponseStatus(str, Enum):
    SUCCESS = "success"
    ERROR = "error"


class Sentiment(str, Enum):
    POSITIVE = "Positive"
    NEUTRAL = "Neutral"
    NEGATIVE = "Negative"


class EmotionLabel(str, Enum):
    HAPPY = "Happy"
    SATISFIED = "Satisfied"
    NEUTRAL = "Neutral"
    CONFUSED = "Confused"
    FRUSTRATED = "Frustrated"
    ANGRY = "Angry"


class AdherenceStatus(str, Enum):
    FOLLOWED = "followed"
    NOT_FOLLOWED = "not_followed"
    PARTIAL = "partial"


class ChurnRisk(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"


class CustomerIntent(str, Enum):
    PURCHASE = "Purchase"
    COMPLAINT = "Complaint"
    INQUIRY = "Inquiry"
    CANCELLATION = "Cancellation"
    SUPPORT = "Support"
    RENEWAL = "Renewal"
    REFUND = "Refund"
    UNKNOWN = "Unknown"
