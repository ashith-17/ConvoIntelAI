import time
from app.core.logging import get_logger
from app.utils.helpers import decode_base64_audio, cleanup_file
from app.utils.enums import ResponseStatus
from app.services.stt_service import transcribe_audio
from app.services.summarizer import summarize_transcript
from app.services.sentiment_timeline import extract_sentiment_timeline
from app.services.agent_scorecard import evaluate_agent
from app.services.churn_predictor import predict_churn
from app.services.intent_detector import detect_intent
from app.services.objection_detector import detect_objections
from app.services.upsell_detector import detect_upsell_opportunities
from app.services.action_items import generate_action_items
from app.services.compliance_checker import check_compliance

logger = get_logger(__name__)


def run_pipeline(audio_base64: str, language: str, audio_format: str = "mp3") -> dict:
    start_time = time.perf_counter()
    audio_path = None

    try:
        suffix = "." + audio_format.lower().lstrip(".") if audio_format else ".mp3"
        logger.info("pipeline_stage", stage="1_decode", language=language)
        audio_path = decode_base64_audio(audio_base64, suffix=suffix)

        logger.info("pipeline_stage", stage="2_stt")
        stt_result = transcribe_audio(audio_path, language)
        transcript = stt_result.get("transcript", "")
        detected_language = stt_result.get("detected_language", language)
        response_language = detected_language if detected_language else language

        logger.info("pipeline_stage", stage="3_summarize")
        summary = summarize_transcript(transcript) if transcript else ""

        logger.info("pipeline_stage", stage="4_sentiment_timeline")
        sentiment_timeline = extract_sentiment_timeline(transcript)

        logger.info("pipeline_stage", stage="5_agent_scorecard")
        agent_scorecard = evaluate_agent(transcript, summary)

        logger.info("pipeline_stage", stage="6_churn")
        churn = predict_churn(transcript, summary)

        logger.info("pipeline_stage", stage="7_intent")
        intent = detect_intent(transcript)

        logger.info("pipeline_stage", stage="8_objections")
        objections = detect_objections(transcript)

        logger.info("pipeline_stage", stage="9_upsell")
        upsell = detect_upsell_opportunities(transcript, summary)

        logger.info("pipeline_stage", stage="10_action_items")
        action_items = generate_action_items(transcript, summary)

        logger.info("pipeline_stage", stage="11_compliance")
        compliance = check_compliance(transcript)

        processing_time = round(time.perf_counter() - start_time, 2)
        logger.info("pipeline_complete", total_seconds=processing_time)

        return {
            "status": ResponseStatus.SUCCESS.value,
            "language": str(response_language),
            "transcript": str(transcript or ""),
            "summary": str(summary or ""),
            "sentiment_timeline": sentiment_timeline,
            "agent_scorecard": agent_scorecard,
            "churn_prediction": churn,
            "customer_intent": intent,
            "objection_detection": objections,
            "upsell_opportunities": upsell,
            "action_items": action_items,
            "compliance": compliance,
            "processingTime": f"{processing_time}s",
        }

    except Exception as e:
        processing_time = round(time.perf_counter() - start_time, 2)
        logger.error("pipeline_failed", error=str(e), total_seconds=processing_time)
        return _safe_fallback(language, str(e), processing_time)

    finally:
        if audio_path:
            cleanup_file(audio_path)


def _safe_fallback(language: str, error: str, processing_time: float) -> dict:
    return {
        "status": ResponseStatus.SUCCESS.value,
        "language": language,
        "transcript": "",
        "summary": "",
        "sentiment_timeline": {"timeline": [], "dominant_emotion": "Neutral", "emotion_journey": ""},
        "agent_scorecard": {"communication": 0, "professionalism": 0, "listening_skills": 0,
                            "resolution_quality": 0, "empathy": 0, "overall_score": 0,
                            "strengths": [], "improvements": [], "grade": "Average"},
        "churn_prediction": {"churn_probability": 0, "risk_level": "Low", "reasons": [],
                             "retention_suggestions": []},
        "customer_intent": {"primary_intent": "Unknown", "secondary_intent": "Unknown",
                            "confidence": 0, "intent_signals": [], "topic": ""},
        "objection_detection": {"objections": [], "total_objections": 0,
                                "unaddressed_count": 0, "objection_summary": ""},
        "upsell_opportunities": {"opportunities": [], "total_opportunities": 0,
                                 "missed_opportunities": 0, "revenue_potential": "Low",
                                 "upsell_summary": ""},
        "action_items": {"action_items": [], "summary": "", "escalation_required": False},
        "compliance": {"compliance_score": 0.0, "checks": {}, "violations": [],
                       "adherence_status": "not_followed", "explanation": error},
        "processingTime": f"{processing_time}s",
    }
