export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const base =
    'inline-flex items-center justify-center rounded-(--radius) px-3 py-2 text-sm transition';
  const styles =
    variant === 'ghost'
      ? 'bg-surface border border-border text-text hover:bg-primary-50 shadow-sm'
      : 'bg-primary-600 text-white hover:bg-primary-500 shadow-sm';

  return (
    <button className={`${base} ${styles} ${className}`} {...props}>
      {children}
    </button>
  );
}
