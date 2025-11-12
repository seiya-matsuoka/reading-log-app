export default function Select({ children, className = '', ...props }) {
  return (
    <select
      {...props}
      className={`bg-surface w-full rounded-(--radius) border border-slate-200 px-3 py-2 text-sm shadow-sm ${className}`}
    >
      {children}
    </select>
  );
}
