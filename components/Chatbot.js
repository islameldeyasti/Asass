'use client';

import {useEffect, useId, useRef, useState} from 'react';
import {Bot, MessageSquare, Send, X} from 'lucide-react';
import {chatKnowledge} from '@/data/chat-knowledge';
import {company} from '@/data/company';

const copy = {
  en: {
    open: 'Open ASAS assistant',
    close: 'Close assistant',
    title: 'ASAS Assistant',
    subtitle: 'Services, office & project enquiry help',
    placeholder: 'Ask about services, office, or starting a project…',
    send: 'Send',
    thinking: 'Thinking…',
    error: 'Something went wrong. Please try again or email us.',
    human: 'Prefer a person?',
    email: 'Email',
    whatsapp: 'WhatsApp',
  },
  ar: {
    open: 'فتح مساعد أساس',
    close: 'إغلاق المساعد',
    title: 'مساعد أساس',
    subtitle: 'مساعدة حول الخدمات والمكتب واستفسار المشروع',
    placeholder: 'اسأل عن الخدمات أو المكتب أو بدء مشروع…',
    send: 'إرسال',
    thinking: 'جاري التحضير…',
    error: 'حدث خطأ. حاول مرة أخرى أو راسلنا بالبريد.',
    human: 'تفضل التحدث مع الفريق؟',
    email: 'البريد',
    whatsapp: 'واتساب',
  },
};

export default function Chatbot({locale = 'en'}) {
  const ar = locale === 'ar';
  const t = copy[ar ? 'ar' : 'en'];
  const panelId = useId();
  const listRef = useRef(null);
  const inputRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [pending, setPending] = useState(false);
  const [messages, setMessages] = useState(() => [
    {
      id: 'hello',
      role: 'assistant',
      content: chatKnowledge.greeting[ar ? 'ar' : 'en'],
    },
  ]);
  const [suggestions, setSuggestions] = useState(
    () => chatKnowledge.suggestions[ar ? 'ar' : 'en'],
  );

  useEffect(() => {
    setMessages([
      {
        id: 'hello',
        role: 'assistant',
        content: chatKnowledge.greeting[ar ? 'ar' : 'en'],
      },
    ]);
    setSuggestions(chatKnowledge.suggestions[ar ? 'ar' : 'en']);
  }, [ar]);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, pending, open]);

  useEffect(() => {
    if (open) {
      const id = window.setTimeout(() => inputRef.current?.focus(), 80);
      return () => window.clearTimeout(id);
    }
    return undefined;
  }, [open]);

  async function sendMessage(raw) {
    const text = String(raw || '').trim();
    if (!text || pending) return;

    const userMsg = {id: `u-${Date.now()}`, role: 'user', content: text};
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setPending(true);

    try {
      const history = [...messages, userMsg]
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .slice(-8)
        .map((m) => ({role: m.role, content: m.content}));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({message: text, locale, history}),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'fail');

      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: data.reply || t.error,
        },
      ]);
      if (Array.isArray(data.suggestions) && data.suggestions.length) {
        setSuggestions(data.suggestions);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {id: `e-${Date.now()}`, role: 'assistant', content: t.error},
      ]);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={`asas-chat${open ? ' is-open' : ''}`} data-locale={locale}>
      {open ? (
        <div
          id={panelId}
          className="asas-chat-panel"
          role="dialog"
          aria-modal="true"
          aria-label={t.title}
        >
          <header className="asas-chat-head">
            <div className="asas-chat-brand">
              <span className="asas-chat-avatar" aria-hidden="true">
                <Bot size={18} />
              </span>
              <div className="asas-chat-brand-copy">
                <strong>{t.title}</strong>
                <small>{t.subtitle}</small>
              </div>
            </div>
            <button
              type="button"
              className="asas-chat-icon-btn"
              aria-label={t.close}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setOpen(false);
              }}
            >
              <X size={18} aria-hidden="true" />
            </button>
          </header>

          <div className="asas-chat-body" ref={listRef}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`asas-chat-bubble asas-chat-bubble--${msg.role}`}
              >
                <p>{msg.content}</p>
              </div>
            ))}
            {pending ? (
              <div className="asas-chat-bubble asas-chat-bubble--assistant is-pending">
                <p>{t.thinking}</p>
              </div>
            ) : null}
          </div>

          {!pending && suggestions?.length ? (
            <div className="asas-chat-suggestions" aria-label={ar ? 'اقتراحات' : 'Suggestions'}>
              {suggestions.map((item) => (
                <button key={item} type="button" onClick={() => sendMessage(item)}>
                  {item}
                </button>
              ))}
            </div>
          ) : null}

          <form
            className="asas-chat-form"
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage(input);
            }}
          >
            <label className="asas-chat-sr" htmlFor={`${panelId}-input`}>
              {t.placeholder}
            </label>
            <input
              id={`${panelId}-input`}
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={t.placeholder}
              autoComplete="off"
              maxLength={2000}
              disabled={pending}
            />
            <button type="submit" aria-label={t.send} disabled={pending || !input.trim()}>
              <Send size={16} aria-hidden="true" />
            </button>
          </form>

          <footer className="asas-chat-foot">
            <span>{t.human}</span>
            <a href={`mailto:${company.email}`} dir="ltr">
              {t.email}
            </a>
            <a href={`https://wa.me/${company.whatsapp}`} target="_blank" rel="noreferrer">
              {t.whatsapp}
            </a>
          </footer>
        </div>
      ) : null}

      <button
        type="button"
        className="asas-chat-fab"
        aria-label={open ? t.close : t.open}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X size={22} aria-hidden="true" /> : <MessageSquare size={22} aria-hidden="true" />}
      </button>
    </div>
  );
}
