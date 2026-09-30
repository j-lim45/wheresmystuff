import Icon from './Icon';

export default function SearchBar({ value, onChange, placeholder = 'Search your things, containers, or locations…' }) {
  return <div className="relative w-full">
    <Icon name="search" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
    <input type="search" aria-label="Search inventory" placeholder={placeholder} value={value} onChange={event => onChange(event.target.value)} className="border-white/10 bg-surface py-3.5 pl-12 pr-4 text-sm" />
  </div>;
}
