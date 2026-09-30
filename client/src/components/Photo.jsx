import { useState } from 'react';
import Icon from './Icon';

export default function Photo({ src, alt, className = '', icon = 'image' }) {
  const [failed, setFailed] = useState(null);
  return <div className={`photo ${className}`}>
    {src && failed !== src ? <img src={src} alt={alt} loading="lazy" onError={() => setFailed(src)} /> : <Icon name={icon} size={32} />}
  </div>;
}
