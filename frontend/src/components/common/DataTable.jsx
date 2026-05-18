const DataTable = ({ columns, data, keyField = 'id' }) => {
  if (!data || data.length === 0) {
    return <div className="bg-white p-8 text-center text-slate-500 rounded-xl border border-slate-200">No data available.</div>;
  }
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {columns.map((col, index) => (
                <th key={index} className="py-3 px-6 text-xs font-semibold text-slate-600 uppercase tracking-wider">{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {data.map((row) => (
              <tr key={row[keyField]} className="hover:bg-slate-50 transition-colors">
                {columns.map((col, index) => (
                  <td key={index} className="py-4 px-6 text-sm text-slate-700 whitespace-nowrap">
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default DataTable;