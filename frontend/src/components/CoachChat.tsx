import { useEffect, useMemo, useRef, useState } from 'react'

export type ChatMessage = { role: 'user' | 'assistant'; text: string; ts: number }

function markdownToHtml(md: string): string {
  let html = md
  html = html.replace(/```([\s\S]*?)```/g, (_m, p1) => `<pre><code>${escapeHtml(p1)}</code></pre>`) // code blocks
  html = html.replace(/`([^`]+)`/g, (_m, p1) => `<code>${escapeHtml(p1)}</code>`) // inline code
  html = html.replace(/^######\s?(.*)$/gm, '<h6>$1</h6>')
  html = html.replace(/^#####\s?(.*)$/gm, '<h5>$1</h5>')
  html = html.replace(/^####\s?(.*)$/gm, '<h4>$1</h4>')
  html = html.replace(/^###\s?(.*)$/gm, '<h3>$1</h3>')
  html = html.replace(/^##\s?(.*)$/gm, '<h2>$1</h2>')
  html = html.replace(/^#\s?(.*)$/gm, '<h1>$1</h1>')
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>') // bold
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>') // italics
  html = html.replace(/^\s*[-*]\s+(.*)$/gm, '<li>$1</li>')
  html = html.replace(/(<li>.*<\/li>)(?![\s\S]*<li>)/gs, '<ul>$1</ul>') // wrap last list group
  html = html.replace(/\n/g, '<br/>')
  return html
}

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function CoachChat({
  userId,
  dateIso,
  onSend,
}: {
  userId: string
  dateIso: string
  onSend: (text: string) => Promise<string>
}) {
  const storageKey = useMemo(() => `nutrio_chat_${userId}_${dateIso}`, [userId, dateIso])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [typingDots, setTypingDots] = useState('.')
  const scrollerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) {
        const saved = JSON.parse(raw) as ChatMessage[]
        if (Array.isArray(saved)) setMessages(saved)
      }
    } catch {}
  }, [storageKey])

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages))
    } catch {}
    if (scrollerRef.current) {
      scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight
    }
  }, [messages, storageKey])

  useEffect(() => {
    if (!busy) return
    const id = setInterval(() => {
      setTypingDots((d) => (d.length >= 3 ? '.' : d + '.'))
    }, 400)
    return () => clearInterval(id)
  }, [busy])

  const send = async (inputOverride?: string) => {
    const input = (inputOverride ?? text).trim()
    if (!input || busy) return
    setBusy(true)
    setMessages((m) => [...m, { role: 'user', text: input, ts: Date.now() }])
    setText('')
    try {
      const reply = await onSend(input)
      setMessages((m) => [...m, { role: 'assistant', text: reply, ts: Date.now() }])
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateRows: '1fr auto', height: '100%', minHeight: 0 }}>
      <div ref={scrollerRef} style={{ overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 10, minHeight: 0 }}>
        {messages.length === 0 ? (
          <div style={{ fontSize: 13, color: '#6b7280' }}>Ask the coach anything about your nutrition.</div>
        ) : null}
        {messages.map((m) => (
          m.role === 'assistant' ? (
            <div key={m.ts} style={{ alignSelf: 'flex-start', background: '#e5e7eb', color: '#111827', padding: '8px 12px', borderRadius: 12, maxWidth: '85%' }}>
              <div dangerouslySetInnerHTML={{ __html: markdownToHtml(m.text) }} />
            </div>
          ) : (
            <div key={m.ts} style={{ alignSelf: 'flex-end', background: '#dcfce7', color: '#111827', padding: '8px 12px', borderRadius: 12, maxWidth: '85%', whiteSpace: 'pre-wrap' }}>
              {m.text}
            </div>
          )
        ))}
        {busy ? (
          <div style={{ alignSelf: 'flex-start', background: '#e5e7eb', color: '#6b7280', padding: '8px 12px', borderRadius: 12, display: 'inline-block' }}>
            {typingDots}
          </div>
        ) : null}
      </div>
      <div style={{ padding: 12, borderTop: '1px solid #e5e7eb', display: 'flex', gap: 8 }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ask coach..."
          onKeyDown={(e) => { if (e.key === 'Enter') send() }}
          style={{ flex: 1, border: '1px solid #e5e7eb', borderRadius: 12, padding: '10px 12px', outline: 'none' }}
        />
        <button onClick={() => send()} disabled={busy} style={{ border: 'none', background: '#10b981', color: '#fff', borderRadius: 12, padding: '10px 14px', fontWeight: 600, cursor: 'pointer' }}>Send</button>
      </div>
    </div>
  )
}
