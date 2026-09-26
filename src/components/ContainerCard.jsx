import { useNavigate } from 'react-router-dom';

export default function ContainerCard({ container }) {
  const navigate = useNavigate();
  const slotCount = Math.min(container.item_count || 0, 3) || 1;

  return (
    <div
      className="container-card"
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/containers/${container.id}`)}
    >
      <div className="container-card__title">{container.name}</div>
      <div className="container-card__caption">
        {container.item_count} item{container.item_count === 1 ? '' : 's'}
      </div>
      <div className="container-card__slots">
        {Array.from({ length: slotCount }).map((_, i) => (
          <div className="container-card__slot" key={i} />
        ))}
      </div>
    </div>
  );
}
