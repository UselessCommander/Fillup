import { ArrowLeft } from 'lucide-react';

export default function PageHeader({ title, onBack, right }) {
  return (
    <header className="sticky top-0 z-20 flex items-center gap-2 border-b border-slate-100 bg-white px-2 py-3 shadow-sm">
      <button
        type="button"
        onClick={onBack}
        className="rounded-[5px] p-2 text-slate-700 hover:bg-slate-100"
        aria-label="Tilbage"
      >
        <ArrowLeft className="h-6 w-6" />
      </button>
      <h1 className="min-w-0 flex-1 truncate text-lg font-bold text-slate-900">{title}</h1>
      {right && <div className="shrink-0">{right}</div>}
    </header>
  );
}
