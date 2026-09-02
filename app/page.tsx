'use client'

import { useRef, useState } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  Battery,
  LogOut,
  LockKeyhole,
  Mail,
  Camera,
  Check,
  ChevronRight,
  CircleHelp,
  UserRound,
  Clock3,
  CloudUpload,
  Droplets,
  ExternalLink,
  Flame,
  Footprints,
  Leaf,
  LocateFixed,
  Menu,
  PackageCheck,
  Recycle,
  Search,
  ShieldCheck,
  Sparkles,
  Trophy,
  Upload,
  X,
  Zap,
} from 'lucide-react'

type WasteKey = 'green' | 'blue' | 'red' | 'black'
type Waste = {
  label: string
  short: string
  material: string
  risk: number
  riskLabel: string
  riskColor: string
  chip: string
  icon: typeof Leaf
  current: string
  future: string
  process: string
  tip: string
}

const waste: Record<WasteKey, Waste> = {
  green: { label: 'Green Bin · Wet / Biodegradable', short: 'GREEN BIN', material: 'Kitchen & food waste', risk: 1, riskLabel: 'Safe', riskColor: 'emerald', chip: 'bg-emerald-50 text-emerald-700', icon: Leaf, current: 'Organic waste returns nutrients to the soil when separated correctly.', future: 'Composting avoids methane-heavy landfill decomposition.', process: 'Anaerobic digestion into biogas and nutrient-rich compost.', tip: 'Drain excess liquid, then add food scraps to your home compost caddy.' },
  blue: { label: 'Blue Bin · Dry / Recyclable', short: 'BLUE BIN', material: 'PET synthetic plastic', risk: 2, riskLabel: 'Moderate', riskColor: 'yellow', chip: 'bg-sky-50 text-sky-700', icon: Recycle, current: 'PET is valuable when clean, dry, and kept separate from wet waste.', future: 'Takes 450+ years to decompose in a landfill.', process: 'Shredded, washed, and remade into rPET flakes and fibre.', tip: 'Rinse and crush the bottle, then remove the cap before recycling.' },
  red: { label: 'Red Bin · Sanitary Waste', short: 'RED BIN', material: 'Soiled sanitary waste', risk: 3, riskLabel: 'High', riskColor: 'orange', chip: 'bg-red-50 text-red-700', icon: ShieldCheck, current: 'Soiled materials can carry pathogens and should never enter a recycling stream.', future: 'Improper disposal can contaminate soil and groundwater.', process: 'Controlled treatment and safe incineration at a certified facility.', tip: 'Wrap securely, label sanitary waste, and use a certified collection point.' },
  black: { label: 'Black Bin · Hazardous / E-waste', short: 'BLACK BIN', material: 'Lithium battery / e-waste', risk: 4, riskLabel: 'Critical', riskColor: 'red', chip: 'bg-slate-900 text-white', icon: Battery, current: 'Battery chemicals can leach into soil; damaged cells may ignite.', future: 'Heavy metals persist for centuries and can enter food systems.', process: 'TSDF extraction recovers metals under controlled conditions.', tip: 'Do not puncture or bin it. Tape terminals and take it to a certified hub.' },
}

const samples: { label: string; key: WasteKey; icon: typeof Leaf }[] = [
  { label: 'Kitchen waste', key: 'green', icon: Leaf },
  { label: 'Plastic bottle', key: 'blue', icon: Droplets },
  { label: 'Soiled bandage', key: 'red', icon: ShieldCheck },
  { label: 'Lithium battery', key: 'black', icon: Battery },
]

const harmTheme: Record<string, { card: string; label: string; body: string }> = {
  emerald: { card: 'border border-emerald-200 bg-emerald-50', label: 'text-emerald-700', body: 'text-emerald-900' },
  yellow: { card: 'border border-yellow-200 bg-yellow-50', label: 'text-yellow-700', body: 'text-yellow-900' },
  orange: { card: 'border border-orange-200 bg-orange-50', label: 'text-orange-700', body: 'text-orange-900' },
  red: { card: 'border border-red-200 bg-red-50', label: 'text-red-700', body: 'text-red-900' },
}

function SectionTitle({ icon: Icon, children }: { icon: typeof Leaf; children: React.ReactNode }) {
  return <div className="mb-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500"><Icon className="h-4 w-4 text-emerald-600" />{children}</div>
}

export default function Page() {
  const [drawer, setDrawer] = useState(false)
  const [activeTab, setActiveTab] = useState<'home' | 'leaderboard' | 'impact'>('home')
  const [input, setInput] = useState('')
  const [fileName, setFileName] = useState('')
  const [result, setResult] = useState<WasteKey>('blue')
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzed, setAnalyzed] = useState(false)
  const [journey, setJourney] = useState(1)
  const [proofName, setProofName] = useState('')
  const [toast, setToast] = useState(false)
  const [dialog, setDialog] = useState(false)
  const [guide, setGuide] = useState<'industrial' | 'diy' | null>(null)
  const [diyProofName, setDiyProofName] = useState('')
  const [diySkipped, setDiySkipped] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('login')
  const [profileOpen, setProfileOpen] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)
  const [userEmail, setUserEmail] = useState('alex@example.com')
  const [userName, setUserName] = useState('Alex Morgan')
  const [userXp, setUserXp] = useState(0)
  const [authError, setAuthError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const item = waste[result]
  const ResultIcon = item.icon
  const harm = harmTheme[item.riskColor]

  function analyze() {
    if (!input.trim() && !fileName) return
    setAnalyzing(true)
    setTimeout(() => {
      const text = input.toLowerCase()
      const next: WasteKey = text.includes('battery') || text.includes('charger') || text.includes('lithium') ? 'black' : text.includes('bandage') || text.includes('sanitary') || text.includes('diaper') ? 'red' : text.includes('food') || text.includes('kitchen') || text.includes('peel') ? 'green' : 'blue'
      setResult(next)
      setAnalyzing(false)
      setAnalyzed(true)
      setJourney(1)
      document.getElementById('ai-classification-result')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 1500)
  }

  function dropped() {
    setJourney(3)
    if (proofName) setUserXp(20)
    setToast(true)
    setTimeout(() => setToast(false), 2800)
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 text-slate-900 md:pb-8">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3"><button aria-label="Open navigation" onClick={() => setDrawer(true)} className="rounded-lg p-2 hover:bg-slate-100"><Menu className="h-5 w-5" /></button><div className="flex items-center gap-2 text-lg font-bold tracking-tight"><span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700"><Leaf className="h-4 w-4" /></span>BinWise <span className="text-emerald-600">AI</span></div></div>
          <div className="relative flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 md:flex">
              <Sparkles className="h-3.5 w-3.5 fill-emerald-500 text-emerald-600" />
              {userXp} GKP
            </div>
            {loggedIn ? (
              <>
                <button
                  aria-label="Open profile menu"
                  onClick={() => setProfileOpen((value) => !value)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white shadow-sm ring-2 ring-emerald-100 hover:bg-emerald-700"
                >
                  {userName.split(' ').map((part) => part[0]).join('')}
                </button>
                {profileOpen && (
                  <div className="absolute right-0 top-12 z-40 w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">
                        {userName.split(' ').map((part) => part[0]).join('')}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-900">{userName}</p>
                        <p className="truncate text-xs text-slate-500">{userEmail}</p>
                      </div>
                    </div>
                    <div className="my-3 flex items-center justify-between rounded-xl bg-emerald-50 px-3 py-2 text-xs">
                      <span className="font-semibold text-emerald-800">Green Karma Points</span>
                      <span className="font-bold text-emerald-700">{userXp} GKP</span>
                    </div>
                    <button
                      onClick={() => {
                        setLoggedIn(false)
                        setProfileOpen(false)
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </>
            ) : (
              <button
                onClick={() => {
                  setAuthOpen(true)
                  setAuthError('')
                }}
                className="hidden rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 md:block"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {drawer && (
        <>
          <button aria-label="Close navigation" className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs transition-opacity" onClick={() => setDrawer(false)} />
          <aside data-navigation-drawer className="fixed inset-y-0 left-0 z-50 flex w-88 max-w-[88vw] flex-col overflow-y-auto bg-white p-6 shadow-2xl [scrollbar-width:thin]">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5 font-extrabold text-slate-900">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 shadow-sm">
                  <Leaf className="h-5 w-5" />
                </span>
                <div>
                  <span className="text-base tracking-tight">BinWise <span className="text-emerald-600">AI</span></span>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">SIH 2026 Edition</span>
                </div>
              </div>
              <button aria-label="Close menu" onClick={() => setDrawer(false)} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* User Karma Mini Card */}
            <div className="mb-6 rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/80 to-teal-50/50 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Your Green Karma</span>
                <span className="flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[11px] font-extrabold text-emerald-700 shadow-xs">
                  <Sparkles className="h-3 w-3 fill-emerald-500 text-emerald-500" />
                  {userXp} GKP
                </span>
              </div>
              <div className="mt-2.5 flex items-center gap-2">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-emerald-200/60">
                  <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${Math.min(100, Math.max(15, (userXp / 100) * 100))}%` }} />
                </div>
                <span className="text-[10px] font-bold text-emerald-800">Tier 1</span>
              </div>
              <p className="mt-1.5 text-[11px] text-emerald-900/70">Segregate items & upload drop-off proofs to earn points!</p>
            </div>

            {/* Main Navigation */}
            <p className="mb-2.5 text-[11px] font-bold uppercase tracking-widest text-slate-400">Main Navigation</p>
            <div className="mb-6 space-y-1.5">
              {[
                ['home', 'Scanner & Home', Leaf, 'AI waste classification'],
                ['leaderboard', 'Leaderboard & Ranks', Trophy, 'Live Eco-Warriors standings'],
                ['impact', 'Community Impact', Flame, 'Collective environmental stats']
              ].map(([tab, label, Icon, desc]) => (
                <button
                  key={tab as string}
                  onClick={() => {
                    setActiveTab(tab as 'home' | 'leaderboard' | 'impact')
                    setDrawer(false)
                  }}
                  className={`group flex w-full items-center gap-3 rounded-2xl p-3 text-left transition ${
                    activeTab === tab
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-700/20 font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition ${
                    activeTab === tab ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-emerald-50 group-hover:text-emerald-600'
                  }`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className="block text-xs font-bold leading-tight">{label}</span>
                    <span className={`block text-[10px] truncate ${activeTab === tab ? 'text-emerald-100' : 'text-slate-400'}`}>{desc}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Quick Municipal CPCB Bin Reference */}
            <p className="mb-2.5 text-[11px] font-bold uppercase tracking-widest text-slate-400">CPCB Bin Color Standards</p>
            <div className="mb-6 grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-2.5">
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Green Bin
                </span>
                <p className="mt-1 text-[10px] font-medium text-emerald-950/80">Wet & Biodegradable (Kitchen & food waste)</p>
              </div>
              <div className="rounded-xl border border-sky-100 bg-sky-50/60 p-2.5">
                <span className="flex items-center gap-1.5 text-xs font-bold text-sky-800">
                  <span className="h-2.5 w-2.5 rounded-full bg-sky-500" /> Blue Bin
                </span>
                <p className="mt-1 text-[10px] font-medium text-sky-950/80">Dry & Recyclable (Plastics, papers, glass)</p>
              </div>
              <div className="rounded-xl border border-red-100 bg-red-50/60 p-2.5">
                <span className="flex items-center gap-1.5 text-xs font-bold text-red-800">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500" /> Red Bin
                </span>
                <p className="mt-1 text-[10px] font-medium text-red-950/80">Sanitary & Biohazard (Soiled medical waste)</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-100/70 p-2.5">
                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-900" /> Black Bin
                </span>
                <p className="mt-1 text-[10px] font-medium text-slate-900/80">Hazardous & E-Waste (Batteries, electronics)</p>
              </div>
            </div>

            {/* Official Resources */}
            <p className="mb-2.5 text-[11px] font-bold uppercase tracking-widest text-slate-400">Official Portals</p>
            <div className="mb-6 space-y-2">
              <a
                href="https://cpcb.nic.in/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/30"
              >
                <span>CPCB Waste Guidelines</span>
                <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
              </a>
              <a
                href="https://swachhbharatmission.gov.in/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/30"
              >
                <span>Swachh Bharat Mission (SBM-U)</span>
                <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
              </a>
            </div>

            {/* SIH Project Badge Footer */}
            <div className="mt-auto pt-4 border-t border-slate-100">
              <div className="rounded-2xl bg-slate-50 p-3.5 text-center">
                <p className="text-[11px] font-extrabold text-slate-800">Smart India Hackathon 2026</p>
                <p className="mt-0.5 text-[10px] text-slate-500">AI-Powered Solid Waste Segregation & Lifecycle Tracker</p>
              </div>
            </div>
          </aside>
        </>
      )}

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
        <div className="relative mb-10 overflow-hidden rounded-3xl bg-slate-950 shadow-2xl ring-1 ring-emerald-500/20">
          <img
            src="/clean-earth.jpg"
            alt="Clean Earth in Green Nature"
            className="h-80 w-full object-cover object-center opacity-70 sm:h-[420px]"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent p-6 text-center">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-900/60 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-emerald-200 shadow-sm backdrop-blur-md">
              <Sparkles className="h-4 w-4 text-emerald-400" /> SIH 2026 Initiative · Clean Earth
            </p>
            <h1 className="text-balance text-4xl font-extrabold tracking-tight text-white drop-shadow-md sm:text-6xl">
              Sort smarter. <span className="text-emerald-400">Live cleaner.</span>
            </h1>
            <p className="mt-4 max-w-2xl text-balance text-sm font-medium leading-relaxed text-slate-200 drop-shadow sm:text-base">
              Empowering communities with AI-driven waste segregation. Identify any household item instantly and get CPCB-guided advice for proper disposal.
            </p>
          </div>
        </div>
        {activeTab === 'home' && (
          <div className="space-y-8">
            {/* Full-width Hybrid Waste Scanner matching hero banner size */}
            <section className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-white p-6 shadow-xl shadow-emerald-950/5 sm:p-8">
              {/* Decorative background eco gradients */}
              <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-100/40 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-teal-100/30 blur-3xl" />

              <div className="relative">
                <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 shadow-sm">
                        <Camera className="h-5 w-5" />
                      </span>
                      <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">Hybrid Waste Scanner</h2>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      Snap a photo, describe your item, or use both for high-accuracy CPCB waste segregation.
                    </p>
                  </div>
                  <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-700">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
                    AI Vision & NLP Ready
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {/* Image Upload Box */}
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="group relative flex min-h-44 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-200/80 bg-slate-50/70 p-6 text-center transition hover:border-emerald-500 hover:bg-emerald-50/50"
                  >
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => setFileName(e.target.files?.[0]?.name ?? '')}
                    />
                    {fileName ? (
                      <>
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-3 shadow-sm">
                          <PackageCheck className="h-6 w-6" />
                        </div>
                        <span className="max-w-full truncate text-sm font-bold text-slate-800">{fileName}</span>
                        <span className="mt-1 text-xs font-medium text-emerald-600">Image attached · Ready to scan</span>
                      </>
                    ) : (
                      <>
                        <div className="mb-3 flex items-center justify-center gap-3">
                          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 group-hover:scale-105 transition">
                            <CloudUpload className="h-5 w-5 text-emerald-600" />
                          </span>
                          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 group-hover:scale-105 transition">
                            <Camera className="h-5 w-5 text-slate-600" />
                          </span>
                        </div>
                        <span className="text-sm font-bold text-slate-800">Upload Photo or Use Camera</span>
                        <span className="mt-1 text-xs text-slate-400">Supports JPG, PNG, WebP up to 10MB</span>
                      </>
                    )}
                  </button>

                  {/* Text Description Box */}
                  <label className="group flex min-h-44 cursor-text flex-col rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-emerald-400 hover:bg-emerald-50/20 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-100">
                    <span className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
                      <span className="flex items-center gap-1.5"><Search className="h-3.5 w-3.5 text-emerald-600" /> Describe Item Details</span>
                      <span className="text-[11px] font-normal lowercase text-slate-400">e.g. food scraps, broken charger</span>
                    </span>
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Type details about the waste item, material type, contamination status..."
                      className="min-h-24 flex-1 resize-none bg-transparent text-sm leading-relaxed text-slate-800 outline-none placeholder:text-slate-400"
                    />
                  </label>
                </div>

                {/* Submit Action Button */}
                <button
                  disabled={analyzing || (!input.trim() && !fileName)}
                  onClick={analyze}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-4 text-base font-bold text-white shadow-lg shadow-emerald-700/20 transition hover:bg-emerald-700 hover:shadow-emerald-700/30 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {analyzing ? (
                    <>
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Analyzing waste with AI model...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" />
                      {analyzed ? 'Re-analyze Waste Item' : 'Classify & Segregate Waste'}
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>

                {/* Quick Samples Section */}
                <div className="mt-6 flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1">Quick Test Samples:</span>
                  {samples.map((sample) => (
                    <button
                      key={sample.key}
                      onClick={() => {
                        setInput(sample.label)
                        setResult(sample.key)
                      }}
                      className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                    >
                      <sample.icon className="h-3.5 w-3.5 text-emerald-600" />
                      {sample.label}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Full-width AI Classification & Resource Recovery Suite */}
            <div className="grid gap-6 lg:grid-cols-12">
              {/* Card 1: AI Classification Result */}
              <section id="ai-classification-result" className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-7 lg:col-span-7">
                <SectionTitle icon={ResultIcon}>AI Classification Result</SectionTitle>
                
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold shadow-sm ${item.chip}`}>
                      <ResultIcon className="h-4 w-4" />
                      {item.short}
                    </div>
                    <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">{item.material}</h2>
                    <p className="mt-1 text-sm font-medium text-slate-500">{item.label}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Confidence</p>
                    <p className="mt-0.5 text-2xl font-extrabold text-emerald-600 sm:text-3xl">98%</p>
                  </div>
                </div>

                {/* Harm Meter */}
                <div className="mt-6 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
                  <div className="mb-2.5 flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-700">Environmental Burden Level</span>
                    <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-bold text-slate-800 shadow-sm ring-1 ring-slate-200">{item.riskLabel}</span>
                  </div>
                  <div aria-label={`Harm risk level ${item.risk} of 4`} role="progressbar" aria-valuemin={1} aria-valuemax={4} aria-valuenow={item.risk} className="flex h-3 gap-1.5 overflow-hidden rounded-full bg-slate-200/80 p-0.5">
                    <div className={`w-1/4 rounded-l-full transition-all ${item.risk === 1 ? 'bg-emerald-500 opacity-100 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-emerald-500 opacity-40'}`} />
                    <div className={`w-1/4 transition-all ${item.risk === 2 ? 'bg-yellow-400 opacity-100 shadow-[0_0_10px_rgba(250,204,21,0.5)]' : item.risk > 2 ? 'bg-yellow-400 opacity-40' : 'bg-slate-200 opacity-20'}`} />
                    <div className={`w-1/4 transition-all ${item.risk === 3 ? 'bg-orange-500 opacity-100 shadow-[0_0_10px_rgba(249,115,22,0.5)]' : item.risk > 3 ? 'bg-orange-500 opacity-40' : 'bg-slate-200 opacity-20'}`} />
                    <div className={`w-1/4 rounded-r-full transition-all ${item.risk === 4 ? 'bg-red-500 opacity-100 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-slate-200 opacity-20'}`} />
                  </div>
                  <div className="mt-2 flex justify-between text-[10px] font-bold uppercase tracking-wider">
                    <span className={item.risk === 1 ? 'font-extrabold text-emerald-600' : 'text-slate-400'}>Safe</span>
                    <span className={item.risk === 2 ? 'font-extrabold text-yellow-600' : 'text-slate-400'}>Moderate</span>
                    <span className={item.risk === 3 ? 'font-extrabold text-orange-600' : 'text-slate-400'}>High</span>
                    <span className={item.risk === 4 ? 'font-extrabold text-red-600' : 'text-slate-400'}>Critical</span>
                  </div>
                </div>

                {/* Facts & Risks */}
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className={`rounded-2xl p-4 transition-colors ${harm.card}`}>
                    <p className={`mb-1.5 text-xs font-bold uppercase tracking-wider ${harm.label}`}>
                      {result === 'green' ? 'Current Burden: None' : 'Current Burden'}
                    </p>
                    <p className={`text-xs font-medium leading-relaxed sm:text-sm ${harm.body}`}>{item.current}</p>
                  </div>
                  <div className={`rounded-2xl p-4 transition-colors ${harm.card}`}>
                    <p className={`mb-1.5 text-xs font-bold uppercase tracking-wider ${harm.label}`}>
                      {result === 'green' ? 'Future Risk: Precaution' : 'Future Risk'}
                    </p>
                    <p className={`text-xs font-medium leading-relaxed sm:text-sm ${harm.body}`}>{item.future}</p>
                  </div>
                </div>
              </section>

              {/* Card 2: Resource Recovery & DIY Guide */}
              <section className="relative flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-7 lg:col-span-5">
                <div>
                  <SectionTitle icon={Recycle}>Resource Recovery & DIY Guide</SectionTitle>
                  
                  <div className="space-y-4">
                    {/* Industrial Process Box */}
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 transition hover:bg-emerald-50">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Industrial Recycling</span>
                        <button onClick={() => setGuide('industrial')} className="text-xs font-bold text-emerald-600 underline underline-offset-2 hover:text-emerald-800">
                          View full workflow →
                        </button>
                      </div>
                      <p className="mt-2 text-xs font-semibold leading-relaxed text-emerald-950 sm:text-sm">{item.process}</p>
                    </div>

                    {/* DIY Tip Box */}
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 transition hover:bg-slate-100/70">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Home Action & DIY Tip</span>
                        <button onClick={() => setGuide('diy')} className="text-xs font-bold text-emerald-600 underline underline-offset-2 hover:text-emerald-800">
                          Step-by-step →
                        </button>
                      </div>
                      <p className="mt-2 text-xs font-semibold leading-relaxed text-slate-800 sm:text-sm">{item.tip}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex gap-2">
                  <button onClick={() => setGuide('industrial')} className="flex-1 rounded-xl bg-emerald-700 py-2.5 text-center text-xs font-bold text-white shadow-sm transition hover:bg-emerald-800">
                    Industrial Guide
                  </button>
                  <button onClick={() => setGuide('diy')} className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-center text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700">
                    DIY Guide
                  </button>
                </div>
              </section>
            </div>

            {/* Dedicated Action Hub: Nearest Drop-off & Verification Proof */}
            <section className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/50 p-6 shadow-xl shadow-emerald-950/5 sm:p-7">
              <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                    <LocateFixed className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 sm:text-lg">Certified Drop-Off & Drop Verification</h3>
                    <p className="text-xs text-slate-500">Locate approved municipal recycling hubs and upload drop-off proof to earn Green Karma Points.</p>
                  </div>
                </div>
                <span className="w-fit rounded-full bg-emerald-100/80 px-3 py-1 text-xs font-bold text-emerald-800">
                  +20 Green Karma Points
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <a
                  href="https://www.google.com/maps/search/waste+drop-off+center+near+me"
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm transition hover:border-emerald-500 hover:bg-emerald-50/30 hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 group-hover:scale-105 transition">
                      <LocateFixed className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="block text-sm font-bold text-slate-900">Find Nearest Drop-Off Centre</span>
                      <span className="text-xs text-slate-500">Open maps & navigate to certified hub</span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-emerald-600 group-hover:translate-x-1 transition-transform" />
                </a>

                <label className="group flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm transition hover:border-emerald-500 hover:bg-emerald-50/30 hover:shadow-md">
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    disabled={journey >= 4}
                    onChange={(event) => {
                      const file = event.target.files?.[0]
                      if (file) {
                        setProofName(file.name)
                        setUserXp(20)
                        if (journey < 4) dropped()
                      }
                    }}
                  />
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 group-hover:scale-105 transition">
                      <CloudUpload className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="block text-sm font-bold text-slate-900">
                        {journey >= 4 ? 'Journey Complete' : proofName ? 'Proof Uploaded' : 'Upload Proof of Drop-Off'}
                      </span>
                      <span className="text-xs text-slate-500">
                        {proofName ? proofName : 'Attach photo at disposal bin (+20 GKP)'}
                      </span>
                    </div>
                  </div>
                  {journey < 4 && <ChevronRight className="h-5 w-5 text-emerald-600 group-hover:translate-x-1 transition-transform" />}
                </label>
              </div>
            </section>

            {/* Full-width Horizontal Waste Journey Stepper */}
            <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8">
              <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <div>
                  <SectionTitle icon={Footprints}>Your Waste Journey</SectionTitle>
                  <p className="text-xs font-medium text-slate-500">Track your waste item from scan to recycling verification.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                    Step {journey + 1} of 5 · {journey >= 4 ? 'Complete' : 'In Progress'}
                  </span>
                </div>
              </div>

              {/* Horizontal Stepper Timeline */}
              <div className="relative mt-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
                  {['Scanned', 'DIY Prepared', 'Dropped at Center', 'In Transit (Est)', 'Recycled (Est)'].map((step, index) => {
                    const done = index < journey && !(index === 1 && diySkipped);
                    const current = index === journey;
                    return (
                      <div key={step} className="relative flex flex-col items-start sm:items-center text-left sm:text-center group">
                        {/* Connecting Line between steps on desktop */}
                        {index < 4 && (
                          <div
                            className={`hidden sm:block absolute top-4 left-1/2 w-full h-1 -z-0 transition-all ${
                              index < journey ? 'bg-emerald-500' : 'bg-slate-200'
                            }`}
                          />
                        )}

                        {/* Step Icon Badge */}
                        <div
                          className={`z-10 flex h-9 w-9 items-center justify-center rounded-2xl border-2 transition-all shadow-sm ${
                            done
                              ? 'border-emerald-600 bg-emerald-600 text-white shadow-emerald-500/20'
                              : current
                              ? 'border-emerald-600 bg-white text-emerald-600 ring-4 ring-emerald-100 shadow-emerald-500/10'
                              : 'border-slate-200 bg-slate-50 text-slate-400'
                          }`}
                        >
                          {done ? (
                            <Check className="h-4 w-4 stroke-[3]" />
                          ) : (
                            <span className="text-xs font-bold">{index + 1}</span>
                          )}
                        </div>

                        {/* Step Details */}
                        <div className="mt-3">
                          <p className={`text-xs font-bold sm:text-sm ${done || current ? 'text-slate-900' : 'text-slate-400'}`}>
                            {step}
                          </p>
                          <span
                            className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              done
                                ? 'bg-emerald-50 text-emerald-700'
                                : current
                                ? 'bg-emerald-600 text-white animate-pulse'
                                : 'bg-slate-100 text-slate-400'
                            }`}
                          >
                            {done ? 'Completed' : current ? 'Current Step' : 'Estimated'}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </section>

            {/* Balanced 2-Column Community & Impact Hub */}
            <div className="grid gap-6 lg:grid-cols-12">
              {/* Left Column: Live Leaderboard */}
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-7 lg:col-span-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <SectionTitle icon={Trophy}>Live Eco-Warriors Leaderboard</SectionTitle>
                  <div className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
                    <Sparkles className="h-3.5 w-3.5 fill-emerald-500 text-emerald-600" />
                    {userXp} GKP
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    ['1', 'EcoWarrior1', '520 GKP', '🥇 Gold Eco'],
                    ['2', 'GreenHero', '410 GKP', '🥈 Silver Eco'],
                    ['3', loggedIn ? userName : 'You', `${userXp} GKP`, '🥉 Bronze Eco']
                  ].map(([rank, name, xp, badge]) => (
                    <div
                      key={rank}
                      className={`flex items-center justify-between gap-3 rounded-2xl p-4 transition ${
                        rank === '3' ? 'bg-emerald-50/90 ring-1 ring-emerald-300' : 'bg-slate-50 hover:bg-slate-100/70'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-xs font-extrabold text-slate-700 shadow-sm">
                          {rank}
                        </span>
                        <div>
                          <span className="block text-sm font-bold text-slate-900">{name}</span>
                          <span className="text-[11px] font-semibold text-slate-500">{badge}</span>
                        </div>
                      </div>
                      <span className="rounded-xl bg-white px-3 py-1 text-xs font-extrabold text-emerald-700 shadow-sm ring-1 ring-slate-100">
                        {xp}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Right Column: Global Community Impact & Eco Metrics */}
              <section className="relative flex flex-col justify-between overflow-hidden rounded-3xl bg-emerald-600 p-6 text-white shadow-xl shadow-emerald-950/10 sm:p-7 lg:col-span-6">
                <div className="pointer-events-none absolute -bottom-12 -right-12 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
                
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-100">
                      <Leaf className="h-4 w-4" />
                      <span className="text-xs font-bold uppercase tracking-[0.14em]">Global Community Impact</span>
                    </div>
                    <span className="rounded-full bg-emerald-700/60 px-3 py-1 text-xs font-bold text-emerald-200">Live</span>
                  </div>

                  <p className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
                    15,240<span className="text-emerald-300">+</span>
                  </p>
                  <p className="mt-1 text-sm font-medium text-emerald-100">items sorted & segregated responsibly by the community</p>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-emerald-700/40 p-3.5 backdrop-blur-sm">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-200">CO₂ Offset</p>
                      <p className="mt-1 text-xl font-bold text-white">4.8 tons</p>
                      <p className="text-[11px] text-emerald-200">~1,120 trees equivalent</p>
                    </div>
                    <div className="rounded-2xl bg-emerald-700/40 p-3.5 backdrop-blur-sm">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-200">Landfill Saved</p>
                      <p className="mt-1 text-xl font-bold text-white">12.6 m³</p>
                      <p className="text-[11px] text-emerald-200">Material fully recovered</p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-700/60 px-4 py-2.5 text-xs font-semibold text-emerald-100 backdrop-blur-sm">
                  <Flame className="h-4 w-4 text-amber-300 animate-bounce" />
                  Together we've reached 85% of this month's clean city goal!
                </div>
              </section>
            </div>

            {/* 3-Step AI Workflow Infographic */}
            <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8">
              <div className="text-center max-w-2xl mx-auto mb-8">
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">Smart Technology Pipeline</p>
                <h3 className="text-2xl font-extrabold text-slate-900 sm:text-3xl mt-1">How BinWise AI Works</h3>
                <p className="text-xs text-slate-500 mt-2">From raw household waste to certified circular economy recovery in three automated steps.</p>
              </div>

              <div className="grid gap-6 sm:grid-cols-3">
                <div className="group rounded-2xl border border-slate-100 bg-slate-50/70 p-5 transition hover:border-emerald-200 hover:bg-emerald-50/30 hover:shadow-md">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 font-extrabold text-lg mb-4 shadow-sm group-hover:scale-110 transition-transform">
                    01
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">Multimodal AI Vision & NLP</h4>
                  <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                    Upload an image or describe your waste item. Our neural model identifies material composition, degradation risks, and contamination.
                  </p>
                </div>

                <div className="group rounded-2xl border border-slate-100 bg-slate-50/70 p-5 transition hover:border-emerald-200 hover:bg-emerald-50/30 hover:shadow-md">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 font-extrabold text-lg mb-4 shadow-sm group-hover:scale-110 transition-transform">
                    02
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">CPCB Compliance Engine</h4>
                  <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                    Instantly maps items to the Central Pollution Control Board four-bin matrix, calculating immediate burden and safe DIY preparation protocols.
                  </p>
                </div>

                <div className="group rounded-2xl border border-slate-100 bg-slate-50/70 p-5 transition hover:border-emerald-200 hover:bg-emerald-50/30 hover:shadow-md">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 font-extrabold text-lg mb-4 shadow-sm group-hover:scale-110 transition-transform">
                    03
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">Drop-Off & Karma Rewards</h4>
                  <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                    Locate verified local drop-off centers, upload proof of disposal, track the complete lifecycle, and earn Green Karma Points (GKP).
                  </p>
                </div>
              </div>
            </section>

            {/* Visual 4-Bin CPCB Waste Segregation Guide */}
            <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8">
              <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                <div>
                  <SectionTitle icon={Recycle}>National Waste Matrix</SectionTitle>
                  <h3 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">CPCB 4-Bin Segregation Standard</h3>
                  <p className="text-xs text-slate-500 mt-1">Proper segregation at source prevents 90% of municipal landfill toxicity.</p>
                </div>
                <span className="w-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                  Government Norms
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Green Bin */}
                <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 transition hover:shadow-md">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="h-3.5 w-3.5 rounded-full bg-emerald-500 shadow-sm" />
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">Green Bin · Wet</span>
                  </div>
                  <div className="relative h-28 overflow-hidden rounded-xl bg-emerald-950/10 mb-3">
                    <img
                      src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=600"
                      alt="Biodegradable waste"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <h5 className="text-xs font-bold text-slate-900">Organic & Kitchen Waste</h5>
                  <p className="mt-1 text-[11px] text-slate-600 leading-relaxed">Food peels, tea bags, garden leaves, leftover vegetables. Converts to biogas & rich compost.</p>
                </div>

                {/* Blue Bin */}
                <div className="overflow-hidden rounded-2xl border border-sky-200 bg-sky-50/40 p-4 transition hover:shadow-md">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="h-3.5 w-3.5 rounded-full bg-sky-500 shadow-sm" />
                    <span className="text-xs font-bold uppercase tracking-wider text-sky-900">Blue Bin · Dry</span>
                  </div>
                  <div className="relative h-28 overflow-hidden rounded-xl bg-sky-950/10 mb-3">
                    <img
                      src="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=600"
                      alt="Recyclable plastics"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <h5 className="text-xs font-bold text-slate-900">Recyclables & Clean Dry Waste</h5>
                  <p className="mt-1 text-[11px] text-slate-600 leading-relaxed">PET bottles, paper, cardboard, clean foil, glass containers. Remanufactured into new materials.</p>
                </div>

                {/* Red Bin */}
                <div className="overflow-hidden rounded-2xl border border-red-200 bg-red-50/40 p-4 transition hover:shadow-md">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="h-3.5 w-3.5 rounded-full bg-red-500 shadow-sm" />
                    <span className="text-xs font-bold uppercase tracking-wider text-red-900">Red Bin · Sanitary</span>
                  </div>
                  <div className="relative h-28 overflow-hidden rounded-xl bg-red-950/10 mb-3">
                    <img
                      src="https://images.unsplash.com/photo-1584744982491-665216d95f8b?auto=format&fit=crop&q=80&w=600"
                      alt="Sanitary safety"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <h5 className="text-xs font-bold text-slate-900">Sanitary & Biohazard</h5>
                  <p className="mt-1 text-[11px] text-slate-600 leading-relaxed">Soiled diapers, sanitary napkins, bandages, expired medicines. Requires safe high-temperature incineration.</p>
                </div>

                {/* Black Bin */}
                <div className="overflow-hidden rounded-2xl border border-slate-300 bg-slate-100/60 p-4 transition hover:shadow-md">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="h-3.5 w-3.5 rounded-full bg-slate-900 shadow-sm" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-900">Black Bin · Hazardous</span>
                  </div>
                  <div className="relative h-28 overflow-hidden rounded-xl bg-slate-950/10 mb-3">
                    <img
                      src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=600"
                      alt="E-waste and batteries"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <h5 className="text-xs font-bold text-slate-900">E-Waste & Toxic Materials</h5>
                  <p className="mt-1 text-[11px] text-slate-600 leading-relaxed">Lithium batteries, CFL bulbs, broken electronics, paints. Processed in TSDF facilities to recover heavy metals.</p>
                </div>
              </div>
            </section>

            {/* Earth Safety & Circular Economy Spotlight */}
            <section className="relative overflow-hidden rounded-3xl bg-slate-950 p-6 text-white shadow-2xl sm:p-8 ring-1 ring-emerald-500/20">
              <div className="grid gap-8 lg:grid-cols-12 items-center">
                <div className="lg:col-span-7">
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-400">
                    <Sparkles className="h-3.5 w-3.5" /> Circular Economy & Earth Protection
                  </div>
                  <h3 className="mt-4 text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
                    Why Source Segregation is India's Most Critical Environmental Mission
                  </h3>
                  <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
                    India produces over <span className="font-bold text-emerald-400">62 million tonnes of municipal solid waste</span> annually. Unsegregated garbage ends up in burning open dumps, polluting groundwater aquifers and generating potent methane gas.
                  </p>
                  <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3.5">
                      <p className="text-2xl font-extrabold text-emerald-400">70%</p>
                      <p className="mt-1 text-[11px] text-slate-400">Waste recyclable if sorted at source</p>
                    </div>
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3.5">
                      <p className="text-2xl font-extrabold text-emerald-400">450+ Yrs</p>
                      <p className="mt-1 text-[11px] text-slate-400">Plastic decomposition time in landfill</p>
                    </div>
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3.5 col-span-2 sm:col-span-1">
                      <p className="text-2xl font-extrabold text-emerald-400">Zero</p>
                      <p className="mt-1 text-[11px] text-slate-400">Toxicity when diverted to certified TSDF</p>
                    </div>
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-2xl lg:col-span-5 h-64 sm:h-80 ring-1 ring-white/10 shadow-xl">
                  <img
                    src="https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800"
                    alt="Clean Earth and Community"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent flex items-end p-5">
                    <p className="text-xs font-semibold text-emerald-100">
                      "Cleanliness is not just an act, it is a duty to our planet and future generations."
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* About Us: Team Asynchronous (SIH 2026) */}
            <section className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-white via-emerald-50/30 to-white p-6 shadow-xl shadow-emerald-950/5 sm:p-8">
              <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <div>
                  <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-700 mb-1">
                    <Sparkles className="h-4 w-4 text-emerald-600" />
                    SIH 2026 Innovators
                  </div>
                  <h3 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">About Team Asynchronous</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Building next-generation AI and smart civic infrastructure for a sustainable, zero-landfill India.
                  </p>
                </div>
                <span className="w-fit rounded-full border border-emerald-300 bg-emerald-100/70 px-3.5 py-1.5 text-xs font-bold text-emerald-800 shadow-xs">
                  Smart India Hackathon 2026
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm hover:border-emerald-300 transition">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 font-bold mb-3">
                    AI
                  </div>
                  <h5 className="text-xs font-bold text-slate-900">Computer Vision & Classification</h5>
                  <p className="mt-1 text-[11px] text-slate-500">Fine-tuned models classifying waste items with material risk & harm profiling.</p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm hover:border-emerald-300 transition">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 font-bold mb-3">
                    UI
                  </div>
                  <h5 className="text-xs font-bold text-slate-900">Citizen UX & Gamification</h5>
                  <p className="mt-1 text-[11px] text-slate-500">Engaging Green Karma Points (GKP) system and interactive waste journey stepper.</p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm hover:border-emerald-300 transition">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 font-bold mb-3">
                    CP
                  </div>
                  <h5 className="text-xs font-bold text-slate-900">CPCB Policy Alignment</h5>
                  <p className="mt-1 text-[11px] text-slate-500">Direct mapping to Central Pollution Control Board four-bin matrix and SBM guidelines.</p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm hover:border-emerald-300 transition">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 font-bold mb-3">
                    RT
                  </div>
                  <h5 className="text-xs font-bold text-slate-900">Drop-off Verification</h5>
                  <p className="mt-1 text-[11px] text-slate-500">Certified local drop-off center locator with camera proof verification.</p>
                </div>
              </div>
            </section>

            {/* FAQs Accordion / Grid */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8">
              <div className="text-center max-w-xl mx-auto mb-6">
                <SectionTitle icon={CircleHelp}>Help & Knowledge Base</SectionTitle>
                <h3 className="text-xl font-extrabold text-slate-900 sm:text-2xl mt-1">Frequently Asked Questions</h3>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                  <h5 className="text-xs font-bold text-slate-900">Why can't batteries go into the blue or green bin?</h5>
                  <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">
                    Lithium and heavy-metal batteries contain lead, mercury, and cadmium that leach into groundwater and can cause landfill fires. They must always go into Black Bins or certified E-Waste collection points.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                  <h5 className="text-xs font-bold text-slate-900">How do Green Karma Points (GKP) work?</h5>
                  <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">
                    You earn +20 GKP every time you correctly categorize waste and upload proof at an approved municipal drop-off hub. Points contribute to your city rank and leaderboard badges!
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                  <h5 className="text-xs font-bold text-slate-900">Should I wash recyclable plastic bottles before binning?</h5>
                  <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">
                    Yes. Rinsing and crushing plastic bottles prevents contamination of other paper and dry recyclables, ensuring the PET plastic can be cleanly shredded and upcycled into new fiber.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                  <h5 className="text-xs font-bold text-slate-900">What is the role of CPCB in BinWise AI?</h5>
                  <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">
                    BinWise uses the official rules and hazard risk classifications defined by the Central Pollution Control Board (CPCB) of India to give legally and environmentally accurate advice.
                  </p>
                </div>
              </div>
            </section>

            {/* Official Platform Footer */}
            <footer className="mt-12 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 shadow-sm">
                    <Leaf className="h-5 w-5" />
                  </span>
                  <div>
                    <h4 className="text-base font-extrabold text-slate-900">BinWise <span className="text-emerald-600">AI</span></h4>
                    <p className="text-xs text-slate-500">Built by <span className="font-bold text-emerald-700">Team Asynchronous</span> · Smart India Hackathon 2026</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600">
                  <a href="https://cpcb.nic.in/" target="_blank" rel="noreferrer" className="hover:text-emerald-600 transition">CPCB Portal</a>
                  <span className="text-slate-300">·</span>
                  <a href="https://swachhbharatmission.gov.in/" target="_blank" rel="noreferrer" className="hover:text-emerald-600 transition">Swachh Bharat</a>
                  <span className="text-slate-300">·</span>
                  <a href="https://moef.gov.in/" target="_blank" rel="noreferrer" className="hover:text-emerald-600 transition">MoEFCC</a>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col items-center justify-between gap-2 sm:flex-row text-[11px] text-slate-400">
                <p>© 2026 BinWise AI · Team Asynchronous. Dedicated to Clean India & Global Sustainability.</p>
                <p className="flex items-center gap-1 font-medium text-emerald-600">
                  <Sparkles className="h-3.5 w-3.5" /> SIH 2026 Official Submission
                </p>
              </div>
            </footer>
          </div>
        )}
        {activeTab === 'leaderboard' && <section className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"><SectionTitle icon={Trophy}>Live Eco-Warriors Leaderboard</SectionTitle><div className="space-y-3">{[['1','EcoWarrior1','2,540 GKP','Compost Captain'],['2','GreenHero','1,980 GKP','Plastic Slayer'],['3',loggedIn ? userName : 'You',`${userXp} GKP`,'BinWise Rookie'],['4','EarthKeeper','840 GKP','Clean Streets']].map(([rank,name,xp,badge]) => <div key={rank} className={`flex items-center gap-1 rounded-2xl px-2 py-3 sm:gap-3 sm:p-4 ${rank === '3' ? 'bg-emerald-50 ring-1 ring-emerald-200' : 'bg-slate-50'}`}><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-slate-500 sm:h-10 sm:w-10">{rank}</span><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700 sm:h-10 sm:w-10">{String(name).slice(0,1).toUpperCase()}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold">{name}</span><span className="mt-1 inline-flex rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-emerald-700">{badge}</span></span><span className="shrink-0 whitespace-nowrap text-xs font-bold text-slate-600 sm:text-sm">{xp}</span></div>)}</div></section>}
        {activeTab === 'impact' && <section className="mx-auto max-w-4xl space-y-6"><div className="rounded-2xl bg-emerald-600 p-6 text-white shadow-sm sm:p-8"><p className="text-xs font-bold uppercase tracking-widest text-emerald-100">Global Community Stats</p><p className="mt-4 text-5xl font-bold">15,240+</p><p className="mt-2 text-sm text-emerald-100">items segregated responsibly by the BinWise community</p></div><div className="grid gap-4 sm:grid-cols-3">{[['CO₂ offset','4.8 t','Equivalent to 1,120 trees'],['Landfill space saved','12.6 m³','Material recovered'],['Active eco-warriors','2,840','Growing every day']].map(([label,value,detail]) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-3 text-3xl font-bold text-emerald-600">{value}</p><p className="mt-2 text-xs leading-5 text-slate-500">{detail}</p></div>)}</div></section>}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-20 flex h-16 items-center justify-around border-t border-slate-200 bg-white px-8 md:hidden">{[['home','Home',Leaf],['leaderboard','Ranks',Trophy],['impact','Impact',GlobeIcon],['signin','Sign In',UserRound]].map(([tab,label,Icon]) => <button key={tab as string} onClick={() => tab === 'signin' ? setAuthOpen(true) : setActiveTab(tab as 'home' | 'leaderboard' | 'impact')} className={`relative flex flex-col items-center gap-1 px-3 py-1 text-xs font-semibold transition ${activeTab === tab ? 'text-emerald-600' : 'text-slate-400'}`}><Icon className="h-5 w-5" /><span>{label}</span>{activeTab === tab && <span className="absolute -top-2 h-1 w-8 rounded-full bg-emerald-500" />}</button>)}</nav>
      {toast && <div role="status" className="fixed bottom-20 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-xl md:bottom-8"><Sparkles className="h-4 w-4 fill-emerald-400 text-emerald-400" />+20 Green Karma Points Earned!</div>}
      {guide && <div role="dialog" aria-modal="true" aria-labelledby="guide-title" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4" onClick={() => setGuide(null)}><div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-emerald-600">BinWise process guide</p><h2 id="guide-title" className="mt-1 text-xl font-bold">{guide === 'industrial' ? 'How the industrial process works' : 'How to do it at home'}</h2></div><button aria-label="Close process guide" onClick={() => setGuide(null)} className="rounded-lg p-2 hover:bg-slate-100"><X className="h-5 w-5" /></button></div><div className="mt-5 rounded-xl bg-emerald-50 p-4"><p className="text-sm font-semibold leading-6 text-emerald-950">{guide === 'industrial' ? item.process : item.tip}</p></div><div className="mt-5 space-y-3">{(guide === 'industrial' ? ['Waste is collected and separated at a certified facility.', 'The material is treated using the appropriate controlled process.', 'Recovered materials are converted into useful products or energy.'] : ['Prepare the item using the recommended safety steps.', 'Keep it separate from other household waste.', 'Take it to the correct bin or certified collection point.']).map((step, index) => <div key={step} className="flex gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">{index + 1}</span><p className="text-sm leading-6 text-slate-600">{step}</p></div>)}</div>{guide === 'diy' ? <label className="mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 transition hover:bg-emerald-100"><input type="file" accept="image/*" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) { setDiyProofName(file.name); setDiySkipped(false) } }} /><CloudUpload className="h-4 w-4" />{diyProofName ? 'DIY prepared — proof uploaded' : 'Upload proof: DIY prepared'}</label> : <button onClick={() => setGuide(null)} className="mt-6 w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-700">Done</button>}{guide === 'diy' && <button onClick={() => { setGuide(null); setDiySkipped(true); setJourney(2) }} className="mt-3 w-full rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50">Continue without DIY</button>}</div></div>}
      {dialog && <div role="dialog" aria-modal="true" aria-labelledby="dialog-title" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4"><div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"><div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-red-600">Certified collection</p><h2 id="dialog-title" className="mt-1 text-xl font-bold">Nearby drop-off hubs</h2></div><button aria-label="Close dialog" onClick={() => setDialog(false)} className="rounded-lg p-2 hover:bg-slate-100"><X className="h-5 w-5" /></button></div><div className="mt-5 space-y-3">{[['GreenCycle Hub', '1.2 km · Open today'], ['EcoSafe Collection Center', '2.8 km · Closes 6:00 PM'], ['CPCB Partner Point', '4.1 km · Open today']].map(([name, details]) => <button key={name} onClick={() => setDialog(false)} className="flex w-full items-center gap-3 rounded-xl border border-slate-200 p-4 text-left hover:border-emerald-300"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><LocateFixed className="h-4 w-4" /></span><span className="flex-1"><span className="block text-sm font-bold">{name}</span><span className="mt-1 block text-xs text-slate-500">{details}</span></span><ArrowRight className="h-4 w-4 text-slate-400" /></button>)}</div></div></div>}
      {authOpen && <div role="dialog" aria-modal="true" aria-labelledby="auth-title" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4"><div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"><div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-emerald-600">Welcome to BinWise</p><h2 id="auth-title" className="mt-1 text-2xl font-bold">Your cleaner journey starts here</h2></div><button aria-label="Close authentication dialog" onClick={() => setAuthOpen(false)} className="rounded-lg p-2 hover:bg-slate-100"><X className="h-5 w-5" /></button></div><div className="mt-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1"><button onClick={() => setAuthTab('login')} className={`rounded-lg py-2 text-sm font-bold ${authTab === 'login' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500'}`}>Log In</button><button onClick={() => setAuthTab('signup')} className={`rounded-lg py-2 text-sm font-bold ${authTab === 'signup' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500'}`}>Sign Up</button></div><form className="mt-6 space-y-4" onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); const email = String(data.get('email') || '').trim(); if (!email || !String(data.get('password') || '')) { setAuthError('Enter an email and password to continue.'); return }; setUserEmail(email); setUserName(authTab === 'signup' ? 'New Eco Champion' : email.split('@')[0]); setLoggedIn(true); setAuthOpen(false); setAuthError('') }}><label className="block text-sm font-semibold">Email Address<div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 focus-within:border-emerald-500"><Mail className="h-4 w-4 text-slate-400" /><input name="email" type="email" placeholder="alex@example.com" className="min-w-0 flex-1 bg-transparent text-sm outline-none" /></div></label><label className="block text-sm font-semibold">Password<div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 focus-within:border-emerald-500"><LockKeyhole className="h-4 w-4 text-slate-400" /><input name="password" type="password" placeholder="••••••••" className="min-w-0 flex-1 bg-transparent text-sm outline-none" /></div></label>{authError && <p className="text-xs font-semibold text-red-600">{authError}</p>}<button type="submit" className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-700">{authTab === 'login' ? 'Log In' : 'Create Account'}</button></form><div className="my-5 flex items-center gap-3 text-xs text-slate-400"><span className="h-px flex-1 bg-slate-200" />or<span className="h-px flex-1 bg-slate-200" /></div><div className="grid gap-2 sm:grid-cols-2"><button type="button" onClick={() => setAuthError('Magic link sent to your inbox.')} className="flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 py-2.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100"><Mail className="h-4 w-4" />Send OTP / Magic Link</button><button type="button" onClick={() => setAuthError('Google sign-in is ready for the next release.')} className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"><span className="font-bold text-base">G</span>Continue with Google</button></div></div></div>}
    </div>
  )
}

function GlobeIcon() { return <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-current text-[9px]">◎</span> }
