import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { postFeedback } from '../api.js';
import PageHeader from '../components/PageHeader.jsx';

const BLUE = '#139ED2';

const TOPICS = [
  { value: 'generelt', label: 'Generelt' },
  { value: 'forkert-info', label: 'Forkert info om sted' },
  { value: 'forslag', label: 'Forslag til funktion' },
  { value: 'fejl', label: 'Teknisk fejl' },
];

export default function HelpPage() {
  const navigate = useNavigate();
  const [topic, setTopic] = useState('generelt');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState(null);
  const [sending, setSending] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setStatus(null);
    setSending(true);
    try {
      await postFeedback({ topic, name, email, message });
      setStatus('ok');
      setMessage('');
    } catch (err) {
      setStatus(err.message ?? 'Fejl');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-slate-50">
      <PageHeader title="Hjælp & kontakt" onBack={() => navigate('/profile')} />
      <div className="space-y-6 p-4 pb-28">
        <section className="rounded-[5px] border border-slate-100 bg-white p-4 text-sm text-slate-700 shadow-sm">
          <h2 className="font-semibold text-slate-900">Ofte stillede spørgsmål</h2>
          <ul className="mt-3 list-inside list-disc space-y-2 text-slate-600">
            <li>
              <strong className="text-slate-800">Hvordan finder jeg et sted?</strong> Brug søgning og filtre
              på forsiden, eller åbn kortet og tryk på en nål.
            </li>
            <li>
              <strong className="text-slate-800">Er afstanden præcis?</strong> Tryk «Brug min placering» i
              den blå bjælke eller under Indstillinger, så beregnes afstande ud fra din GPS. Ellers bruges
              et fast punkt i København som udgangspunkt.
            </li>
            <li>
              <strong className="text-slate-800">Manglende sted?</strong> Skriv til os nedenfor — så kan vi
              tage det med (i en rigtig version ville det gemmes i en database).
            </li>
          </ul>
        </section>

        <form onSubmit={onSubmit} className="space-y-3 rounded-[5px] border border-slate-100 bg-white p-4 shadow-sm">
          <h2 className="font-semibold text-slate-900">Skriv til os</h2>
          <label className="block text-sm">
            <span className="text-slate-600">Emne</span>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="mt-1 w-full rounded-[5px] border border-slate-200 bg-white px-3 py-2 text-slate-900"
            >
              {TOPICS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="text-slate-600">Navn (valgfrit)</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-[5px] border border-slate-200 px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="text-slate-600">E-mail (valgfrit)</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-[5px] border border-slate-200 px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="text-slate-600">Besked *</span>
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-1 w-full rounded-[5px] border border-slate-200 px-3 py-2"
              placeholder="Beskriv dit spørgsmål eller hvad der er galt…"
            />
          </label>
          {status === 'ok' && <p className="text-sm font-medium text-emerald-600">Tak — din besked er modtaget.</p>}
          {status && status !== 'ok' && <p className="text-sm text-red-600">{status}</p>}
          <button
            type="submit"
            disabled={sending}
            className="w-full rounded-[5px] py-3 text-sm font-semibold text-white disabled:opacity-60"
            style={{ backgroundColor: BLUE }}
          >
            {sending ? 'Sender…' : 'Send besked'}
          </button>
          <p className="text-xs text-slate-500">
            Beskeden logges på serveren til demo. Brug ikke personfølsomme oplysninger.
          </p>
        </form>
      </div>
    </div>
  );
}
