export default function MetricCard({ label, value, icon, color = 'violet', trend }) {
  const colorMap = {
    violet:  { bg: 'bg-violet-500/10',  border: 'border-violet-500/20',  val: 'text-violet-400'  },
    emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', val: 'text-emerald-400' },
    amber:   { bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   val: 'text-amber-400'   },
    sky:     { bg: 'bg-sky-500/10',     border: 'border-sky-500/20',     val: 'text-sky-400'     },
    rose:    { bg: 'bg-rose-500/10',    border: 'border-rose-500/20',    val: 'text-rose-400'    },
  };
  const c = colorMap[color] || colorMap.violet;

  return (
    <div className="card p-6 flex items-start gap-4 animate-slide-up">
      <div className={`w-11 h-11 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center text-xl flex-shrink-0`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-zinc-400 font-medium">{label}</p>
        <p className={`text-3xl font-bold mt-0.5 tracking-tight ${c.val}`}>{value}</p>
        {trend && <p className="text-xs text-zinc-600 mt-1">{trend}</p>}
      </div>
    </div>
  );
}
