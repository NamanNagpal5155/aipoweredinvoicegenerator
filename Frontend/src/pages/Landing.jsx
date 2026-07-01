import { useNavigate } from 'react-router-dom'
import { useAuth, SignInButton, SignUpButton } from '@clerk/react'

export default function Landing() {
  const { isSignedIn } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="absolute top-1/4 -left-10 w-72 h-72 rounded-full blur-3xl opacity-60 bg-gradient-to-r from-blue-200/40 to-cyan-300/40 animate-float-slow" />
      <div className="absolute bottom-1/4 -right-10 w-96 h-96 rounded-full blur-3xl opacity-50 bg-gradient-to-r from-violet-200/30 to-fuchsia-300/30 animate-float-medium" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.8)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />

      <div className="relative max-w-7xl mx-auto px-6 py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div className="space-y-8 lg:space-y-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/80 backdrop-blur-xl border border-gray-200/60 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-500 animate-pulse" />
              <span className="text-sm font-medium text-gray-700">AI-Powered Invoice Generator</span>
            </div>

            <h1 className="text-4xl lg:text-6xl xl:text-7xl font-bold leading-tight tracking-tight">
              <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Invoices,</span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">Supercharged by AI</span>
              <br />
              <span className="text-gray-600">in Seconds</span>
            </h1>

            <p className="text-xl lg:text-2xl text-gray-600 leading-relaxed max-w-2xl">
              Generate professional invoices with natural language. Powered by Google Gemini AI, secured by Clerk, styled with Tailwind.
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:gap-6">
              {isSignedIn ? (
                <button onClick={() => navigate('/dashboard')} className="group relative inline-flex items-center justify-center gap-3 px-8 lg:px-10 py-4 lg:py-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 overflow-hidden">
                  <span className="relative">Go to Dashboard</span>
                  <svg className="w-5 h-5 relative group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </button>
              ) : (
                <>
                  <SignUpButton mode="modal">
                    <button className="group relative inline-flex items-center justify-center gap-3 px-8 lg:px-10 py-4 lg:py-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 overflow-hidden">
                      <span className="relative">Get Started Free</span>
                      <svg className="w-5 h-5 relative group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                    </button>
                  </SignUpButton>
                  <SignInButton mode="modal">
                    <button className="group inline-flex items-center justify-center gap-2 px-8 lg:px-10 py-4 lg:py-5 rounded-2xl bg-white/80 backdrop-blur-xl border border-gray-200/60 text-gray-700 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                      Sign In
                    </button>
                  </SignInButton>
                </>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 pt-6 lg:pt-8">
              {[
                { icon: '⚡', label: 'AI Generated', desc: 'Describe & create' },
                { icon: '🛡️', label: 'Secure', desc: 'Clerk auth' },
                { icon: '📄', label: 'Professional', desc: 'Print-ready PDFs' },
              ].map(f => (
                <div key={f.label} className="flex items-center gap-3 group">
                  <div className="w-12 h-12 rounded-xl bg-white/80 backdrop-blur-xl border border-gray-200/60 flex items-center justify-center text-xl shadow-lg group-hover:scale-110 transition-transform duration-300">{f.icon}</div>
                  <div>
                    <p className="font-semibold text-gray-900">{f.label}</p>
                    <p className="text-sm text-gray-600">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/60 p-8 transform transition-all duration-500 hover:scale-[1.02]">
              <div className="flex items-start justify-between pb-6 border-b border-gray-200/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">AI</div>
                  <div>
                    <p className="font-bold text-gray-900">InvoiceAI Pro</p>
                    <p className="text-sm text-gray-500">GST: 22AAAAA0000A1Z5</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Invoice</p>
                  <p className="font-bold text-gray-900">INV-2024-001</p>
                  <span className="text-sm text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded-full mt-1 inline-block">Paid</span>
                </div>
              </div>
              <div className="py-6 space-y-4">
                {[
                  { desc: 'Web Development - Frontend', amt: '$3,500' },
                  { desc: 'UI/UX Design Consultation', amt: '$1,500' },
                ].map(item => (
                  <div key={item.desc} className="flex justify-between items-center p-3 rounded-lg hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500" />
                      <span className="text-gray-700 font-medium">{item.desc}</span>
                    </div>
                    <span className="font-semibold text-gray-900">{item.amt}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-3 pt-4 border-t border-gray-200/60">
                <div className="flex justify-between text-sm"><span className="text-gray-600">Subtotal</span><span className="font-medium text-gray-900">$5,000</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-600">Tax (18%)</span><span className="font-medium text-gray-900">$900</span></div>
                <div className="flex justify-between text-lg font-bold pt-3 border-t border-gray-200/60">
                  <span className="text-gray-900">Total</span>
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">$5,900</span>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-xl rounded-2xl px-4 py-3 shadow-lg border border-gray-200/60">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Powered by <span className="font-medium text-gray-900">Gemini AI</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
