export default function DataTable({ columns, rows, renderActions }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
        <thead className="bg-slate-50 dark:bg-slate-800">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400"
              >
                {column.label}
              </th>
            ))}
            {renderActions ? (
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                Actions
              </th>
            ) : null}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
          {rows.map((row, index) => (
            <tr
              key={row._id || row.id || index}
              className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300"
                >
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
              {renderActions ? (
                <td className="px-4 py-3">{renderActions(row)}</td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
