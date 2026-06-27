const STATUS_CONFIG = {
  pending:     { label: 'Pending',     className: 'tag-amber',   dot: 'bg-amber-400' },
  accepted:    { label: 'Accepted',    className: 'tag-emerald', dot: 'bg-emerald-500' },
  approved:    { label: 'Approved',    className: 'tag-emerald', dot: 'bg-emerald-500' },
  rejected:    { label: 'Rejected',    className: 'tag-rose',    dot: 'bg-rose-500' },
  open:        { label: 'Open',        className: 'tag-violet',  dot: 'bg-violet-500' },
  filled:      { label: 'Filled',      className: 'tag-emerald', dot: 'bg-emerald-500' },
  in_progress: { label: 'In Progress', className: 'tag-sky',     dot: 'bg-sky-400' },
  funded:      { label: 'Funded',      className: 'tag-emerald', dot: 'bg-emerald-500' },
  completed:   { label: 'Completed',   className: 'tag-emerald', dot: 'bg-emerald-500' },
  cancelled:   { label: 'Cancelled',   className: 'tag-zinc',    dot: 'bg-zinc-400' },
  pending_signatures: { label: 'Pending Signatures', className: 'tag-amber', dot: 'bg-amber-400' },
  fully_signed: { label: 'Fully Signed', className: 'tag-sky', dot: 'bg-sky-400' },
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
