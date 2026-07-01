import { useState, useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { invoiceApi, businessProfileApi } from '../api'

const currencySymbol = { INR: '₹', USD: '$' }

function computeTotals(items, taxPercent) {
  const subtotal = items.reduce((s, it) => s + (Number(it.qty) || 0) * (Number(it.unitPrice) || 0), 0)
  const tax = (subtotal * Number(taxPercent || 0)) / 100
  return { subtotal, tax, total: subtotal + tax }
}

export default function CreateInvoice() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const aiData = location.state?.aiData

  const [form, setForm] = useState({
    invoiceNumber: '',
    issueDate: new Date().toISOString().slice(0, 10),
    dueDate: '',
    fromBusinessName: '',
    fromEmail: '',
    fromAddress: '',
    fromPhone: '',
    fromGst: '',
    client: { name: '', email: '', address: '', phone: '' },
    items: [{ id: '1', description: '', qty: 1, unitPrice: 0 }],
    taxPercent: 18,
    notes: '',
    currency: 'INR',
    status: 'draft',
    logoDataUrl: '',
    stampDataUrl: '',
    signatureDataUrl: '',
    signatureName: '',
    signatureTitle: '',
  })
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(isEdit)
  const totals = computeTotals(form.items, form.taxPercent)

  useEffect(() => {
    if (isEdit) {
      invoiceApi.getById(id).then(res => {
        const d = res.data
        setForm({
          invoiceNumber: d.invoiceNumber || '',
          issueDate: d.issueDate || '',
          dueDate: d.dueDate || '',
          fromBusinessName: d.fromBusinessName || '',
          fromEmail: d.fromEmail || '',
          fromAddress: d.fromAddress || '',
          fromPhone: d.fromPhone || '',
          fromGst: d.fromGst || '',
          client: d.client || { name: '', email: '', address: '', phone: '' },
          items: d.items?.length ? d.items : [{ id: '1', description: '', qty: 1, unitPrice: 0 }],
          taxPercent: d.taxPercent ?? 18,
          notes: d.notes || '',
          currency: d.currency || 'INR',
          status: d.status || 'draft',
          logoDataUrl: d.logoDataUrl || '',
          stampDataUrl: d.stampDataUrl || '',
          signatureDataUrl: d.signatureDataUrl || '',
          signatureName: d.signatureName || '',
          signatureTitle: d.signatureTitle || '',
        })
        setLoading(false)
      }).catch(() => navigate('/invoices'))
    } else if (aiData) {
      const d = aiData
      setForm(prev => ({
        ...prev,
        invoiceNumber: d.invoiceNumber || '',
        issueDate: d.issueDate || '',
        dueDate: d.dueDate || '',
        fromBusinessName: d.fromBusinessName || '',
        fromEmail: d.fromEmail || '',
        fromAddress: d.fromAddress || '',
        fromPhone: d.fromPhone || '',
        fromGst: d.fromGst || '',
        client: d.client || { name: '', email: '', address: '', phone: '' },
        items: d.items?.length ? d.items : [{ id: '1', description: '', qty: 1, unitPrice: 0 }],
        taxPercent: d.taxPercent ?? 18,
        notes: d.notes || '',
      }))
      // Also load business profile to fill Bill From if AI didn't provide it
      businessProfileApi.get().then(res => {
        const p = res.data
        if (p) {
          setForm(prev => ({
            ...prev,
            fromBusinessName: prev.fromBusinessName || p.businessName || '',
            fromEmail: prev.fromEmail || p.email || '',
            fromAddress: prev.fromAddress || p.address || '',
            fromPhone: prev.fromPhone || p.phone || '',
            fromGst: prev.fromGst || p.gst || '',
            logoDataUrl: p.logoUrl || '',
            stampDataUrl: p.stampUrl || '',
            signatureDataUrl: p.signatureUrl || '',
            signatureName: p.signatureOwnerName || '',
            signatureTitle: p.signatureOwnerTitle || '',
            taxPercent: prev.taxPercent ?? p.defaultTaxPercent ?? 18,
          }))
        }
      }).catch(err => console.warn('Failed to load business profile:', err))
    } else {
      businessProfileApi.get().then(res => {
        const p = res.data
        if (p) {
          setForm(prev => ({
            ...prev,
            fromBusinessName: p.businessName || '',
            fromEmail: p.email || '',
            fromAddress: p.address || '',
            fromPhone: p.phone || '',
            fromGst: p.gst || '',
            logoDataUrl: p.logoUrl || '',
            stampDataUrl: p.stampUrl || '',
            signatureDataUrl: p.signatureUrl || '',
            signatureName: p.signatureOwnerName || '',
            signatureTitle: p.signatureOwnerTitle || '',
            taxPercent: p.defaultTaxPercent ?? prev.taxPercent,
          }))
        }
      }).catch(err => console.warn('Failed to load business profile:', err))
    }
  }, [id])

  function updateField(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function updateClient(field, value) {
    setForm(prev => ({ ...prev, client: { ...prev.client, [field]: value } }))
  }

  function updateItem(index, field, value) {
    setForm(prev => {
      const items = [...prev.items]
      items[index] = { ...items[index], [field]: value }
      return { ...prev, items }
    })
  }

  function addItem() {
    setForm(prev => ({
      ...prev,
      items: [...prev.items, { id: String(Date.now()), description: '', qty: 1, unitPrice: 0 }],
    }))
  }

  function removeItem(index) {
    setForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }))
  }

  async function handleSave() {
    setSaving(true)
    try {
      const payload = {
        ...form,
        items: form.items.filter(it => it.description.trim()),
        subtotal: totals.subtotal,
        tax: totals.tax,
        total: totals.total,
      }
      if (isEdit) {
        await invoiceApi.update(id, payload)
      } else {
        await invoiceApi.create(payload)
      }
      navigate('/invoices')
    } catch (err) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>

  const currencies = [
    { code: 'INR', symbol: '₹' },
    { code: 'USD', symbol: '$' },
  ]

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">{isEdit ? 'Edit Invoice' : 'Create Invoice'}</h1>
          <p className="mt-2 text-lg text-gray-600">{isEdit ? 'Update invoice details' : 'Fill in the details for your new invoice'}</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/invoices')} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-all duration-200 font-medium shadow-sm">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
            {saving ? 'Saving...' : isEdit ? 'Update Invoice' : 'Save Invoice'}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 sm:p-6 md:p-8 border border-gray-200/60 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Bill From</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
                <input value={form.fromBusinessName} onChange={e => updateField('fromBusinessName', e.target.value)} className="w-full rounded-xl border border-gray-300 px-4 py-3 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input value={form.fromEmail} onChange={e => updateField('fromEmail', e.target.value)} className="w-full rounded-xl border border-gray-300 px-4 py-3 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input value={form.fromPhone} onChange={e => updateField('fromPhone', e.target.value)} className="w-full rounded-xl border border-gray-300 px-4 py-3 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <textarea value={form.fromAddress} onChange={e => updateField('fromAddress', e.target.value)} rows={2} className="w-full rounded-xl border border-gray-300 px-4 py-3 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">GST No.</label>
                <input value={form.fromGst} onChange={e => updateField('fromGst', e.target.value)} className="w-full rounded-xl border border-gray-300 px-4 py-3 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 sm:p-6 md:p-8 border border-gray-200/60 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Bill To</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Client Name</label>
                <input value={form.client.name} onChange={e => updateClient('name', e.target.value)} className="w-full rounded-xl border border-gray-300 px-4 py-3 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Client Email</label>
                <input value={form.client.email} onChange={e => updateClient('email', e.target.value)} className="w-full rounded-xl border border-gray-300 px-4 py-3 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Client Phone</label>
                <input value={form.client.phone} onChange={e => updateClient('phone', e.target.value)} className="w-full rounded-xl border border-gray-300 px-4 py-3 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Client Address</label>
                <textarea value={form.client.address} onChange={e => updateClient('address', e.target.value)} rows={2} className="w-full rounded-xl border border-gray-300 px-4 py-3 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 sm:p-6 md:p-8 border border-gray-200/60 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Items</h2>
              </div>
            </div>

            <div className="hidden lg:grid lg:grid-cols-12 gap-4 mb-4 px-2 text-sm font-medium text-gray-700">
              <div className="lg:col-span-5">Description</div>
              <div className="lg:col-span-2 text-center">Qty</div>
              <div className="lg:col-span-2 text-right">Unit Price</div>
              <div className="lg:col-span-2 text-right">Total</div>
              <div className="lg:col-span-1" />
            </div>

            <div className="space-y-4">
              {form.items.map((item, i) => (
                <div key={item.id} className="grid grid-cols-6 sm:grid-cols-12 gap-4 items-center p-3 rounded-xl hover:bg-gray-50 transition-all">
                  <div className="col-span-6 sm:col-span-5">
                    <label className="block lg:hidden text-xs font-medium text-gray-600 mb-1">Description</label>
                    <input value={item.description} onChange={e => updateItem(i, 'description', e.target.value)} placeholder="Item description" className="w-full rounded-xl border border-gray-300 px-4 py-3 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm" />
                  </div>
                  <div className="col-span-2 sm:col-span-2">
                    <label className="block lg:hidden text-xs font-medium text-gray-600 mb-1">Qty</label>
                    <input type="number" value={item.qty} onChange={e => updateItem(i, 'qty', Number(e.target.value))} min={1} className="w-full rounded-xl border border-gray-300 px-3 py-3 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-right" />
                  </div>
                  <div className="col-span-2 sm:col-span-2">
                    <label className="block lg:hidden text-xs font-medium text-gray-600 mb-1">Unit Price</label>
                    <input type="number" value={item.unitPrice} onChange={e => updateItem(i, 'unitPrice', Number(e.target.value))} min={0} step={0.01} className="w-full rounded-xl border border-gray-300 px-3 py-3 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-right" />
                  </div>
                    <div className="col-span-1 sm:col-span-2 text-right font-medium text-gray-900 flex items-center justify-end">
                        {(currencySymbol[form.currency] || '$')}{((Number(item.qty) || 0) * (Number(item.unitPrice) || 0)).toFixed(2)}
                    </div>
                  <div className="col-span-1 sm:col-span-1 flex justify-center">
                    <button onClick={() => removeItem(i)} disabled={form.items.length === 1} className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={addItem} className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-dashed border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-all duration-200 font-medium group">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              Add Item
            </button>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 sm:p-6 md:p-8 border border-gray-200/60 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Notes</h2>
            </div>
            <textarea value={form.notes} onChange={e => updateField('notes', e.target.value)} rows={3} placeholder="Additional notes, payment terms, etc..." className="w-full rounded-xl border border-gray-300 px-4 py-3 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" />
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 sm:p-6 md:p-8 border border-gray-200/60 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Number</label>
                <input value={form.invoiceNumber} onChange={e => updateField('invoiceNumber', e.target.value)} className="w-full rounded-xl border border-gray-300 px-4 py-3 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 font-medium" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Issue Date</label>
                <input type="date" value={form.issueDate} onChange={e => updateField('issueDate', e.target.value)} className="w-full rounded-xl border border-gray-300 px-4 py-3 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                <input type="date" value={form.dueDate} onChange={e => updateField('dueDate', e.target.value)} className="w-full rounded-xl border border-gray-300 px-4 py-3 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                <div className="flex gap-3">
                  {currencies.map(c => (
                    <button key={c.code} onClick={() => updateField('currency', c.code)}
                      className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all duration-200 font-medium ${form.currency === c.code ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}
                    >
                      {c.symbol} {c.code}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <div className="flex flex-wrap gap-2">
                  {['draft', 'unpaid', 'paid', 'overdue'].map(s => (
                    <button key={s} onClick={() => updateField('status', s)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 capitalize ${form.status === s ? 'ring-2 ring-offset-2 ring-blue-500 bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                <label className="block text-sm font-medium text-gray-700 mb-2">Tax Percent</label>
                <div className="flex items-center gap-3">
                  <input type="number" value={form.taxPercent} onChange={e => updateField('taxPercent', Number(e.target.value))} min={0} max={100} className="w-32 rounded-xl border border-gray-300 px-4 py-3 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 font-medium text-center" />
                  <span className="text-2xl font-bold text-gray-600">%</span>
                </div>
                <p className="text-xs text-gray-500 mt-3">Tax rate applied to subtotal</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 sm:p-6 md:p-8 border border-gray-200/60 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-600">Subtotal</span>
                <span className="font-semibold text-gray-900">{(currencySymbol[form.currency] || '$')}{totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm font-medium text-gray-600">Tax ({form.taxPercent}%)</span>
                <span className="font-semibold text-gray-900">{(currencySymbol[form.currency] || '$')}{totals.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-3 border-t border-gray-200">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-lg font-bold text-gray-900">{(currencySymbol[form.currency] || '$')}{totals.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
