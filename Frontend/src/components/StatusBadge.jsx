const colors = {
  paid: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  unpaid: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  overdue: 'bg-red-50 text-red-700 ring-red-600/20',
  draft: 'bg-gray-50 text-gray-700 ring-gray-600/20',
}

export default function StatusBadge({ status }) {
  const s = (status || 'draft').toLowerCase()
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset capitalize ${colors[s] || colors.draft}`}>
      {s}
    </span>
  )
}
