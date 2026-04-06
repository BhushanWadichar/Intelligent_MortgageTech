import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

export function Table({ children, className = '' }) {
  return (
    <div className={`overflow-x-auto scrollbar-thin ${className}`}>
      <table className="w-full text-sm">
        {children}
      </table>
    </div>
  );
}

export function THead({ children }) {
  return (
    <thead className="bg-slate-50 border-b border-slate-200">
      {children}
    </thead>
  );
}

export function TH({ children, sortable, sorted, dir, onSort, className = '' }) {
  return (
    <th
      className={`
        px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap
        ${sortable ? 'cursor-pointer select-none hover:text-slate-700 hover:bg-slate-100 transition-colors' : ''}
        ${className}
      `}
      onClick={sortable ? onSort : undefined}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        {sortable && (
          <span className="flex flex-col">
            <ChevronUpIcon  className={`w-2.5 h-2.5 ${sorted && dir === 'asc'  ? 'text-blue-600' : 'text-slate-300'}`} />
            <ChevronDownIcon className={`w-2.5 h-2.5 -mt-0.5 ${sorted && dir === 'desc' ? 'text-blue-600' : 'text-slate-300'}`} />
          </span>
        )}
      </span>
    </th>
  );
}

export function TBody({ children }) {
  return (
    <tbody className="divide-y divide-slate-100">
      {children}
    </tbody>
  );
}

export function TR({ children, onClick, className = '', selected = false }) {
  return (
    <tr
      onClick={onClick}
      className={`
        transition-colors duration-100
        ${onClick ? 'cursor-pointer' : ''}
        ${selected ? 'bg-blue-50' : 'hover:bg-slate-50'}
        ${className}
      `}
    >
      {children}
    </tr>
  );
}

export function TD({ children, className = '' }) {
  return (
    <td className={`px-4 py-3 text-slate-700 ${className}`}>
      {children}
    </td>
  );
}
