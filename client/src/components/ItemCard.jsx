import { useNavigate } from 'react-router-dom';

export default function ItemCard({ item }) {
  const navigate = useNavigate();

  return (
    <div
      className="item-card"
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/items/${item.id}`)}
    >
      <div className="item-card__title">{item.name}</div>
      {item.container_name && (
        <div className="item-card__caption">{item.container_name}</div>
      )}
    </div>
  );
}
