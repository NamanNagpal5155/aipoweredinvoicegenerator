import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { invoiceApi } from '../api'
import StatusBadge from '../components/StatusBadge'

const currencySymbol = { INR: '₹', USD: '$' }

export default function Dashboard() {
  const [invoices, setInvoices] = useState([])
  const [stats, setStats] = useState({ total: 0, paid: 0, unpaid: 0, overdue: 0, paidAmount: 0, unpaidAmount: 0, overdueAmount: 0 })
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    invoiceApi.list()
      .then(res => {
        const list = res.data || []
        setInvoices(list.slice(0, 5))
        setStats({
          total: list.reduce((s, i) => s + (i.total || 0), 0),
          paid: list.filter(i => i.status === 'paid').length,
          unpaid: list.filter(i => i.status === 'unpaid').length,
          overdue: list.filter(i => i.status === 'overdue').length,
          paidAmount: list.filter(i => i.status === 'paid').reduce((s, i) => s + (i.total || 0), 0),
          unpaidAmount: list.filter(i => i.status === 'unpaid').reduce((s, i) => s + (i.total || 0), 0),
          overdueAmount: list.filter(i => i.status === 'overdue').reduce((s, i) => s + (i.total || 0), 0),
        })
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-8">
      <div className="text-center lg:text-left">
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
        <p className="mt-2 text-lg text-gray-600">Overview of your invoices</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Invoices', count: invoices.length, amount: stats.total, color: 'from-blue-600 to-indigo-700' },
          { label: 'Paid', count: stats.paid, amount: stats.paidAmount, color: 'from-emerald-500 to-emerald-700' },
          { label: 'Unpaid', count: stats.unpaid, amount: stats.unpaidAmount, color: 'from-amber-500 to-amber-700' },
          { label: 'Overdue', count: stats.overdue, amount: stats.overdueAmount, color: 'from-red-500 to-red-700' },
        ].map(card => (
          <div key={card.label} className={`bg-gradient-to-br ${card.color} rounded-2xl p-6 text-white`}>
            <p className="text-blue-100 text-sm font-medium">{card.label}</p>
            <p className="text-3xl font-bold mt-2">{card.count}</p>
            <p className="text-blue-100/80 text-sm mt-1">₹{card.amount.toFixed(0)}</p>
          </div>
        ))}
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200/60 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Recent Invoices</h3>
            <p className="text-sm text-gray-500 mt-1">Your 5 most recent invoices</p>
          </div>
          <button onClick={() => navigate('/invoices')} className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">View All</button>
        </div>
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading...</div>
        ) : invoices.length === 0 ? (
          <div className="p-12 text-center text-gray-500 space-y-3">
            <svg className="w-12 h-12 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            <p className="font-medium">No invoices yet</p>
            <p className="text-sm">Create your first invoice to get started</p>
            <button onClick={() => navigate('/invoices/new')} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 mt-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              Create Invoice
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/80 border-b border-gray-200/60">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Invoice</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/60">
                {invoices.map(inv => (
                  <tr key={inv._id} onClick={() => navigate(`/invoices/${inv._id}`)} className="hover:bg-gray-50/50 transition-colors duration-150 cursor-pointer">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{inv.invoiceNumber}</p>
                      <p className="text-sm text-gray-500">{inv.issueDate}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{inv.client?.name || 'N/A'}</p>
                      <p className="text-sm text-gray-500">{inv.client?.email}</p>
                    </td>
                    <td className="px-6 py-4"><StatusBadge status={inv.status} /></td>
                    <td className="px-6 py-4 text-right font-medium text-gray-900">{(currencySymbol[inv.currency] || '$')}{(inv.total || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
