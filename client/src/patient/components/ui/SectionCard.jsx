export default function SectionCard({ title, subtitle, action, children }) {
  return (
    <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm md:p-6">
      {(title || subtitle || action) && (
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            {title ? (
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {title}
              </h2>
            ) : null}
            {subtitle ? (
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {subtitle}
              </p>
            ) : null}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
