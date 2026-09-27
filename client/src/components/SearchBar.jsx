export default function SearchBar({ value, onChange }) {
  return (
    <div className="search-bar">
      <span aria-hidden="true">🔍</span>
      <input
        type="text"
        placeholder="Search containers or items..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
