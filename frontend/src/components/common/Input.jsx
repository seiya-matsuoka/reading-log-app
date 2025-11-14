export default function Input({ className = '', ...props }) {
  return (
    <input
      {...props}
      className={`bg-surface focus:ring-primary-100 border-border w-full rounded-(--radius) border px-3 py-2 text-sm shadow-sm outline-none focus:border-transparent focus:ring-2 ${className}`}
    />
  );
}
