export default function Input({ className = '', ...props }) {
  return (
    <input
      {...props}
      className={[
        // 通常状態
        'bg-surface border-border w-full rounded-(--radius) border px-3 py-2 text-sm shadow-sm outline-none',
        'focus:ring-primary-100 focus:border-transparent focus:ring-2',
        // disabled 状態
        'disabled:bg-surface-1 disabled:text-muted disabled:border-border/70',
        'disabled:cursor-not-allowed disabled:shadow-none',
        className,
      ].join(' ')}
    />
  );
}
