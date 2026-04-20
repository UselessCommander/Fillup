import { Home, Map, User } from 'lucide-react';

const BLUE = '#139ED2';

export default function BottomNav({ active, onChange }) {
  const Item = ({ id, icon: Icon, label }) => {
    const isOn = active === id;
    return (
      <button
        type="button"
        onClick={() => onChange(id)}
        className="flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-[5px] py-2"
      >
        <Icon
          className="h-6 w-6"
          strokeWidth={isOn ? 2.4 : 2}
          style={{ color: isOn ? BLUE : '#9ca3af' }}
        />
        <span
          className="text-[11px] font-medium truncate max-w-full px-1"
          style={{ color: isOn ? BLUE : '#9ca3af' }}
        >
          {label}
        </span>
      </button>
    );
  };

  return (
    <nav className="relative z-30 shrink-0 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-md items-stretch justify-around">
        <Item id="home" icon={Home} label="Hjem" />
        <Item id="map" icon={Map} label="Find refill" />
        <Item id="profile" icon={User} label="Profil" />
      </div>
    </nav>
  );
}
