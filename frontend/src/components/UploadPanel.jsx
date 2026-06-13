import { useState, useRef } from 'react'
import { analyzeCall, fileToBase64, getAudioFormat } from '../utils/api'

const LANGUAGES = [
  { label: 'Auto-Detect', api: 'Auto-Detect' },
  { label: 'Hindi / Hinglish', api: 'Hindi' },
  { label: 'Tamil / Tanglish', api: 'Tamil' },
  { label: 'English', api: 'English' },
]

const STAGES = [
  'Decoding audio file',
  'Transcribing speech (Whisper)',
  'Generating AI summary',
  'Analyzing sentiment timeline',
  'Scoring agent performance',
  'Predicting churn risk',
  'Detecting customer intent',
  'Finding objections',
  'Identifying upsell signals',
  'Generating action items',
  'Checking compliance',
]

export default function UploadPanel({ onResult, loading, setLoading }) {
  const [file, setFile] = useState(null)
  const [language, setLanguage] = useState(LANGUAGES[0])
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState('')
  const [stageIdx, setStageIdx] = useState(0)
  const inputRef = useRef()
  const intervalRef = useRef()

  const handleFile = (f) => {
    if (!f) return
    const allowed = ['audio/mpeg', 'audio/mp3', 'audio/ogg', 'audio/wav', 'audio/x-wav',
      'audio/m4a', 'audio/mp4', 'audio/webm', 'audio/flac', 'video/webm', 'video/mp4']
    if (!allowed.some(t => f.type.startsWith('audio/') || f.type.startsWith('video/'))) {
      setError('Please upload an audio file (MP3, OGG, WAV, M4A, FLAC)')
      return
    }
    if (f.size > 25 * 1024 * 1024) {
      setError('File too large — maximum 25MB')
      return
    }
    setError('')
    setFile(f)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer.files[0])
  }

  const handleSubmit = async () => {
    if (!file) return
    setLoading(true)
    setError('')
    setStageIdx(0)

    intervalRef.current = setInterval(() => {
      setStageIdx(prev => (prev < STAGES.length - 1 ? prev + 1 : prev))
    }, 2800)

    try {
      const audioBase64 = await fileToBase64(file)
      const audioFormat = getAudioFormat(file)
      const result = await analyzeCall({ audioBase64, language: language.api, audioFormat })
      clearInterval(intervalRef.current)
      onResult(result)
    } catch (e) {
      clearInterval(intervalRef.current)
      setError(e.message || 'Analysis failed. Check backend connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section style={{ padding: '40px 0 32px' }}>
      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--primary-dim)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 20, padding: '4px 14px', marginBottom: 20, fontSize: 12, color: 'var(--primary)' }}>
          ✦ Powered by Groq Whisper + Llama 3.3 70B
        </div>
        <h1 style={{ fontSize: 42, fontWeight: 800, letterSpacing: '-1px', lineHeight: 1.1, marginBottom: 14 }}>
          AI Customer Conversation<br />
          <span style={{ background: 'linear-gradient(90deg, var(--primary), var(--cyan))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Intelligence Platform</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 16, maxWidth: 560, margin: '0 auto' }}>
          Upload any sales or support call — get deep AI insights including sentiment timeline, agent scorecard, churn risk, and more in seconds.
        </p>
      </div>

      {/* Feature Pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 36 }}>
        {['📝 Full Transcript', '🧠 AI Summary', '😊 Sentiment Timeline', '🏆 Agent Scorecard',
          '✅ Compliance Score', '⚠️ Objection Detection', '🎯 Customer Intent',
          '💰 Upsell Opportunities', '📉 Churn Prediction', '📋 Action Items'].map(f => (
          <span key={f} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '5px 14px', fontSize: 12, color: 'var(--text-muted)' }}>{f}</span>
        ))}
      </div>

      {/* Upload Card */}
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <div style={{ background: 'var(--surface)', border: `2px dashed ${dragOver ? 'var(--primary)' : 'var(--border)'}`, borderRadius: 'var(--radius)', padding: '40px 32px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', position: 'relative' }}
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !loading && inputRef.current.click()}
        >
          <input ref={inputRef} type="file" accept="audio/*,video/webm,video/mp4" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />

          <div style={{ fontSize: 40, marginBottom: 12 }}>
            {file ? '🎵' : '⬆️'}
          </div>
          {file ? (
            <>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{file.name}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{(file.size / (1024 * 1024)).toFixed(2)} MB • Click to change</div>
            </>
          ) : (
            <>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>Drop your audio file here</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>MP3, OGG, WAV, M4A, FLAC, WEBM — up to 25MB</div>
            </>
          )}
        </div>

        {/* Language + Submit */}
        <div style={{ display: 'flex', gap: 12, marginTop: 16, alignItems: 'stretch' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: 11, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Language</label>
            <select
              value={language.api}
              onChange={e => setLanguage(LANGUAGES.find(l => l.api === e.target.value))}
              disabled={loading}
              style={{ width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', color: 'var(--text)', fontSize: 14, cursor: 'pointer', outline: 'none' }}
            >
              {LANGUAGES.map(l => <option key={l.api} value={l.api}>{l.label}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
            <label style={{ display: 'block', color: 'transparent', fontSize: 11, marginBottom: 6 }}>-</label>
            <button
              onClick={handleSubmit}
              disabled={!file || loading}
              style={{ padding: '10px 28px', borderRadius: 'var(--radius-sm)', border: 'none', background: !file || loading ? 'var(--border)' : 'linear-gradient(135deg, var(--primary), #818cf8)', color: 'white', fontWeight: 600, fontSize: 14, cursor: !file || loading ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s' }}
            >
              {loading ? 'Analyzing...' : '⚡ Analyze Call'}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ marginTop: 14, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', color: 'var(--red)', fontSize: 13 }}>
            ⚠ {error}
          </div>
        )}

        {/* Loading stages */}
        {loading && (
          <div style={{ marginTop: 20, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid var(--primary)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
              <span style={{ fontWeight: 600, fontSize: 13 }}>Processing your call...</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {STAGES.map((stage, i) => (
                <div key={stage} style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: i <= stageIdx ? 1 : 0.3, transition: 'opacity 0.4s' }}>
                  <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${i < stageIdx ? 'var(--green)' : i === stageIdx ? 'var(--primary)' : 'var(--border)'}`, background: i < stageIdx ? 'var(--green)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, flexShrink: 0, transition: 'all 0.3s' }}>
                    {i < stageIdx ? '✓' : ''}
                  </div>
                  <span style={{ fontSize: 12, color: i === stageIdx ? 'var(--text)' : 'var(--text-muted)' }}>{stage}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
