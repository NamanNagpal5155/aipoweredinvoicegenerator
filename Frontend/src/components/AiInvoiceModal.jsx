import { useState } from 'react'
import { aiInvoiceApi } from '../api'
import AnimatedButton from '../GenerateBtn/Gbtn'

export default function AiInvoiceModal({ isOpen, onClose, onGenerated }) {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  async function handleGenerate() {
    if (!prompt.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await aiInvoiceApi.generate(prompt)
      onGenerated(res.data)
      onClose()
    } catch (err) {
      setError(err.message || 'Generation failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-w-lg w-full bg-white rounded-2xl shadow-xl p-6 z-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">AI Invoice Generator</h3>
            <p className="text-sm text-gray-500 mt-1">Describe the invoice you need in plain English</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <label className="block text-sm font-medium text-gray-700 mb-2">Describe your invoice</label>
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="e.g. Create an invoice for Acme Corp for web development services totaling $5,000 with 18% tax..."
          rows={5}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-vertical"
        />

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <div className="mt-4 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 transition-all duration-200">Cancel</button>
          <AnimatedButton isLoading={loading} onClick={handleGenerate} disabled={!prompt.trim()} label="Generate Invoice" />
        </div>
      </div>
    </div>
  )
}
