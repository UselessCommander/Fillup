import { X } from 'lucide-react';

const GREEN = '#94CF53';
const BLUE = '#139ED2';

export default function FilterModal({ open, categories, activeCategory, onSelect, onClose }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      style={{ backgroundColor: '#00000040' }}
      role="dialog"
      aria-modal="true"
      aria-label="Filtrer kategorier"
    >
      <button type="button" className="absolute inset-0 cursor-default" onClick={onClose} aria-label="Luk" />
      <div className="relative z-10 mx-4 mb-0 w-full max-w-md rounded-t-3xl bg-white p-5 shadow-2xl sm:mb-4 sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Filtrer produkter</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-[5px] p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Luk filter"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mb-3 text-sm text-slate-600">Vælg kategori — f.eks. shampoo eller vaskemiddel.</p>
        <div className="flex max-h-[45vh] flex-wrap gap-2 overflow-y-auto pb-2 scrollbar-hide">
          {categories.map((c) => {
            const on = c === activeCategory;
            return (
              <button
                key={c}
                type="button"
                onClick={() => {
                  onSelect(c);
                  onClose();
                }}
                className="rounded-[5px] border px-4 py-2 text-sm font-medium transition"
                style={
                  on
                    ? { backgroundColor: BLUE, borderColor: BLUE, color: '#fff' }
                    : { borderColor: '#e2e8f0', color: '#334155', backgroundColor: '#fff' }
                }
              >
                {c}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => {
            onSelect('Alle');
            onClose();
          }}
          className="mt-4 w-full rounded-[5px] py-3 text-sm font-semibold text-slate-800"
          style={{ backgroundColor: GREEN }}
        >
          Nulstil til Alle
        </button>
      </div>
    </div>
  );
}
