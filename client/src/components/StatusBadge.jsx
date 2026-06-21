const STATUS_CONFIG = {
  pending:     { label: 'Pending',     className: 'tag-amber',   dot: 'bg-amber-400' },
  accepted:    { label: 'Accepted',    className: 'tag-emerald', dot: 'bg-emerald-400' },
  rejected:    { label: 'Rejected',    className: 'tag-rose',    dot: 'bg-rose-400' },
  open:        { label: 'Open',        className: 'tag-violet',  dot: 'bg-violet-400' },
  in_progress: { label: 'In Progress', className: 'tag-sky',     dot: 'bg-sky-400' },
  completed:   { label: 'Completed',   className: 'tag-emerald', dot: 'bg-emerald-400' },
  cancelled:   { label: 'Cancelled',   className: 'tag-zinc',    dot: 'bg-zinc-400' },
};

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || { label: status, className: 'tag-zinc', dot: 'bg-zinc-400' };
  return (
    <span className={config.className}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${config.dot}`} />
      {config.label}
    </span>
  );
}
