import { Link } from 'react-router-dom';

const BLUE = '#139ED2';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 bg-slate-50 px-6 pb-28 text-center">
      <div className="text-6xl font-black text-slate-200">404</div>
      <h1 className="text-lg font-bold text-slate-900">Siden findes ikke</h1>
      <p className="max-w-xs text-sm text-slate-600">
        Tjek linket, eller gå tilbage til forsiden eller kortet.
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <Link
          to="/"
          className="rounded-[5px] px-4 py-2 text-sm font-semibold text-white"
          style={{ backgroundColor: BLUE }}
        >
          Forside
        </Link>
        <Link
          to="/map"
          className="rounded-[5px] border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800"
        >
          Kort
        </Link>
      </div>
    </div>
  );
}
