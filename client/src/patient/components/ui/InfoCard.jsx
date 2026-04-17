export default function InfoCard({
  icon: Icon,
  title,
  value,
  hint,
  accent = "teal",
}) {
  const accentMap = {
    teal: "bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400",
    amber:
      "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400",
    red: "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400",
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400",
    emerald:
      "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400",
  };
  const iconClass = accentMap[accent] || accentMap.teal;

  return (
    <article className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {value}
          </p>
          {hint ? (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {hint}
            </p>
          ) : null}
        </div>
        {Icon ? (
          <div className={`rounded-xl p-2 ${iconClass}`}>
            <Icon size={18} />
          </div>
        ) : null}
      </div>
    </article>
  );
}
