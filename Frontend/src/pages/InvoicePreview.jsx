import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { invoiceApi } from '../api'
import StatusBadge from '../components/StatusBadge'

const currencySymbol = { INR: '₹', USD: '$' }

export default function InvoicePreview() {
  const { id } = useParams()
  const navigate = useNavigate()
  const printRef = useRef()
  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    invoiceApi.getById(id)
      .then(res => setInvoice(res.data))
      .catch(() => navigate('/invoices'))
      .finally(() => setLoading(false))
  }, [id])

  function handlePrint() {
    window.print()
  }

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>
  if (!invoice) return null

  const subtotal = invoice.items?.reduce((s, it) => s + (Number(it.qty) || 0) * (Number(it.unitPrice) || 0), 0) || 0
  const tax = (subtotal * Number(invoice.taxPercent || 0)) / 100
  const sym = currencySymbol[invoice.currency] || '$'

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 no-print">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">Invoice Preview</h1>
          <p className="mt-2 text-lg text-gray-600">
            Invoice <span className="font-semibold text-blue-600">{invoice.invoiceNumber}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={() => navigate(`/invoices/${id}/edit`)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-all duration-200 font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            Edit
          </button>
          <button onClick={() => { if (window.confirm('Delete this invoice?')) { invoiceApi.delete(id).then(() => navigate('/invoices')).catch(console.error) } }} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 bg-white text-red-600 hover:bg-red-50 transition-all duration-200 font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            Delete
          </button>
          <button onClick={handlePrint} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            Print / PDF
          </button>
        </div>
      </div>

      <div id="print-area" ref={printRef}>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-10">
          {/* Header: Company Info left, Invoice Info right */}
          <div className="flex flex-col md:flex-row justify-between gap-8 pb-8 border-b border-gray-200">
            <div className="space-y-3">
              {invoice.logoDataUrl && (
                <div>
                  <img src={invoice.logoDataUrl} alt="Logo" className="h-16 object-contain" />
                </div>
              )}
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">From</p>
                <h2 className="text-xl font-bold text-gray-900">{invoice.fromBusinessName || 'N/A'}</h2>
                {invoice.fromAddress && <p className="text-sm text-gray-600 mt-1">{invoice.fromAddress}</p>}
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                {invoice.fromEmail && <p>{invoice.fromEmail}</p>}
                {invoice.fromPhone && <p>{invoice.fromPhone}</p>}
                {invoice.fromGst && <p>GST: {invoice.fromGst}</p>}
              </div>
            </div>
            <div className="text-left md:text-right">
              <h1 className="text-3xl font-bold text-gray-900 mb-1">INVOICE</h1>
              <p className="text-lg text-gray-600 mb-4">{invoice.invoiceNumber}</p>
              <div className="space-y-2 text-sm">
                <div className="flex md:justify-end gap-4">
                  <span className="text-gray-500 font-medium">Issue Date:</span>
                  <span className="font-semibold text-gray-900 min-w-[100px] text-left md:text-right">{invoice.issueDate || 'N/A'}</span>
                </div>
                <div className="flex md:justify-end gap-4">
                  <span className="text-gray-500 font-medium">Due Date:</span>
                  <span className="font-semibold text-gray-900 min-w-[100px] text-left md:text-right">{invoice.dueDate || 'N/A'}</span>
                </div>
                <div className="flex md:justify-end mt-3">
                  <StatusBadge status={invoice.status} />
                </div>
              </div>
            </div>
          </div>

          {/* Bill To */}
          <div className="py-6 border-b border-gray-200">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Bill To</p>
            <p className="font-semibold text-gray-900 text-lg">{invoice.client?.name || 'N/A'}</p>
            <div className="space-y-1 mt-1 text-sm text-gray-600">
              {invoice.client?.email && <p>{invoice.client.email}</p>}
              {invoice.client?.phone && <p>{invoice.client.phone}</p>}
              {invoice.client?.address && <p>{invoice.client.address}</p>}
            </div>
          </div>

          {/* Items Table */}
          <div className="py-6 border-b border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="py-3 pr-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/2">Description</th>
                  <th className="py-3 px-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-[12%]">Qty</th>
                  <th className="py-3 px-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-[19%]">Unit Price</th>
                  <th className="py-3 pl-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-[19%]">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items?.map((item, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-3 pr-4 font-medium text-gray-900">{item.description || '-'}</td>
                    <td className="py-3 px-2 text-center text-gray-700">{item.qty}</td>
                    <td className="py-3 px-2 text-right text-gray-700">{sym}{Number(item.unitPrice).toFixed(2)}</td>
                    <td className="py-3 pl-2 text-right font-semibold text-gray-900">{sym}{((Number(item.qty) || 0) * (Number(item.unitPrice) || 0)).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="pt-6 flex justify-end">
            <div className="w-full max-w-xs space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium text-gray-900">{sym}{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax ({invoice.taxPercent || 0}%):</span>
                <span className="font-medium text-gray-900">{sym}{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t-2 border-gray-900">
                <span>Total:</span>
                <span>{sym}{(subtotal + tax).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-2">Notes</p>
              <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-200">{invoice.notes}</p>
            </div>
          )}

          {/* Signature & Stamp: stamp left, signature right */}
          {(invoice.signatureDataUrl || invoice.stampDataUrl) && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="flex justify-between items-start flex-wrap gap-8">
                {invoice.stampDataUrl && (
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-700 mb-3">Stamp</p>
                    <div className="flex justify-center">
                      <img src={invoice.stampDataUrl} alt="Stamp" className="h-20 object-contain" />
                    </div>
                  </div>
                )}
                {invoice.signatureDataUrl && (
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-700 mb-3">Authorized Signature</p>
                    <div className="flex justify-center">
                      <img src={invoice.signatureDataUrl} alt="Signature" className="h-14 object-contain" />
                    </div>
                    {invoice.signatureName && <p className="font-semibold text-gray-900 mt-2">{invoice.signatureName}</p>}
                    {invoice.signatureTitle && <p className="text-xs text-gray-500">{invoice.signatureTitle}</p>}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">Thank you for your business!</p>
            <p className="text-xs text-gray-400 mt-1">This is a computer-generated invoice</p>
          </div>
        </div>
      </div>
    </div>
  )
}
