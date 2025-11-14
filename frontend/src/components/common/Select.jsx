export default function Select({ children, className = '', ...props }) {
  return (
    <select
      {...props}
      className={`bg-surface border-border w-full rounded-(--radius) border px-3 py-2 text-sm shadow-sm ${className}`}
    >
      {children}
    </select>
  );
}
