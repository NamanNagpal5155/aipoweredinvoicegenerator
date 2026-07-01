import { useState, useEffect, useRef } from 'react'
import { businessProfileApi } from '../api'

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function DropZone({ label, field, value, onSelect, onRemove }) {
  const inputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)

  function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return
    readFileAsDataURL(file).then(dataUrl => onSelect(dataUrl))
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      {value ? (
        <div className="text-center space-y-3">
          <div className="inline-flex rounded-xl overflow-hidden border border-gray-200 bg-white">
            <img src={value} alt={label} className="h-28 w-40 object-contain p-2" />
          </div>
          <div className="flex justify-center gap-3">
            <button type="button" onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all duration-200 cursor-pointer font-medium text-sm">
              Change
            </button>
            <button type="button" onClick={onRemove}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 transition-all duration-200 font-medium text-sm">
              Remove
            </button>
          </div>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = '' }} />
        </div>
      ) : (
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files?.[0]) }}
          onClick={() => inputRef.current?.click()}
          className={`border-4 border-dashed rounded-2xl p-8 transition-all duration-300 cursor-pointer text-center group ${
            dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = '' }} />
          <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center text-gray-400 group-hover:scale-110 transition-transform">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
          <p className="text-sm font-medium text-gray-900 mt-3">
            {dragOver ? 'Drop image here' : `Drop ${label} here or click to browse`}
          </p>
          <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
        </div>
      )}
    </div>
  )
}

export default function BusinessProfile() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState({
    businessName: '',
    email: '',
    address: '',
    phone: '',
    gst: '',
    logoUrl: '',
    stampUrl: '',
    signatureUrl: '',
    signatureOwnerName: '',
    signatureOwnerTitle: '',
    defaultTaxPercent: 18,
  })
  const [profileId, setProfileId] = useState(null)

  useEffect(() => {
    businessProfileApi.get()
      .then(res => {
        if (res.data) {
          setProfile(res.data)
          setProfileId(res.data._id)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function update(field, value) {
    setProfile(prev => ({ ...prev, [field]: value }))
  }

  async function handleSave() {
    setSaving(true)
    try {
      if (profileId) {
        await businessProfileApi.update(profileId, profile)
      } else {
        const res = await businessProfileApi.create(profile)
        setProfileId(res.data._id)
      }
      alert('Profile saved successfully')
    } catch (err) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  function handleReset() {
    setProfile({
      businessName: '',
      email: '',
      address: '',
      phone: '',
      gst: '',
      logoUrl: '',
      stampUrl: '',
      signatureUrl: '',
      signatureOwnerName: '',
      signatureOwnerTitle: '',
      defaultTaxPercent: 18,
    })
    setProfileId(null)
  }

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>

  return (
    <div className="space-y-8">
      <div className="text-center lg:text-left">
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">Business Profile</h1>
        <p className="mt-2 text-lg text-gray-600 max-w-3xl">Manage your business details that appear on invoices</p>
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 border border-gray-200/60 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Business Information</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
            <input value={profile.businessName} onChange={e => update('businessName', e.target.value)} className="w-full rounded-xl border border-gray-300 px-4 py-3 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input value={profile.email} onChange={e => update('email', e.target.value)} className="w-full rounded-xl border border-gray-300 px-4 py-3 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <input value={profile.phone} onChange={e => update('phone', e.target.value)} className="w-full rounded-xl border border-gray-300 px-4 py-3 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
            <textarea value={profile.address} onChange={e => update('address', e.target.value)} rows={3} className="w-full rounded-xl border border-gray-300 px-4 py-3 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">GST No.</label>
            <input value={profile.gst} onChange={e => update('gst', e.target.value)} className="w-full rounded-xl border border-gray-300 px-4 py-3 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Default Tax (%)</label>
            <input type="number" value={profile.defaultTaxPercent} onChange={e => update('defaultTaxPercent', Number(e.target.value))} className="w-full rounded-xl border border-gray-300 px-4 py-3 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" />
          </div>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 border border-gray-200/60 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Branding Assets</h2>
        </div>

        <div className="space-y-6">
          <DropZone label="Logo" field="logoUrl" value={profile.logoUrl} onSelect={v => update('logoUrl', v)} onRemove={() => update('logoUrl', '')} />
          <DropZone label="Stamp" field="stampUrl" value={profile.stampUrl} onSelect={v => update('stampUrl', v)} onRemove={() => update('stampUrl', '')} />
          <DropZone label="Signature" field="signatureUrl" value={profile.signatureUrl} onSelect={v => update('signatureUrl', v)} onRemove={() => update('signatureUrl', '')} />
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/60 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
            <button onClick={handleReset} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-all duration-200 font-medium">
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
