import { useEffect, useRef } from 'react';
import Icon from './Icon';

export default function Modal({ title, onClose, children }) {
  const ref = useRef(null);
  useEffect(() => {
    const previousFocus = document.activeElement;
    const dialog = ref.current;
    dialog.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, []);
  return <dialog ref={ref} aria-labelledby="dialog-title" onCancel={event => { event.preventDefault(); onClose(); }}
    onClick={event => { if (event.target === ref.current) { const rect = ref.current.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose(); } }}
    className="dialog-enter w-[calc(100%-32px)] max-w-xl overflow-y-auto rounded-3xl border border-outline bg-surface p-0 text-stone-100 shadow-2xl">
    <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
      <h2 id="dialog-title" className="text-xl">{title}</h2>
      <button className="icon-btn" aria-label="Close dialog" onClick={onClose}><Icon name="close" /></button>
    </div>
    {children}
  </dialog>;
}
