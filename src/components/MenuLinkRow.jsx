import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const BLUE = '#139ED2';

export default function MenuLinkRow({ to, icon: Icon, label, hint }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-[5px] border border-slate-100 bg-white px-4 py-3 shadow-sm transition hover:border-slate-200 hover:bg-slate-50/80 active:scale-[0.99]"
    >
      {Icon && <Icon className="h-5 w-5 shrink-0" style={{ color: BLUE }} strokeWidth={2} />}
      <div className="min-w-0 flex-1">
        <div className="font-medium text-slate-900">{label}</div>
        {hint ? <div className="text-xs text-slate-500">{hint}</div> : null}
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" />
    </Link>
  );
}
