import { Heart } from 'lucide-react';

const BLUE = '#139ED2';

export default function FavoriteHeart({
  active,
  onToggle,
  className = '',
  label = 'Gem som favorit',
  variant = 'default',
}) {
  const color =
    active ? '#ef4444' : variant === 'onDark' ? '#ffffff' : BLUE;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle?.();
      }}
      className={`rounded-[5px] p-2 transition-colors hover:opacity-90 ${variant === 'default' ? 'hover:bg-slate-100' : ''} ${className}`}
      style={{ color }}
      aria-label={label}
      aria-pressed={active}
    >
      <Heart className={`h-5 w-5 ${active ? 'fill-current' : ''}`} strokeWidth={2} />
    </button>
  );
}
