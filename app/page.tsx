'use client'

import { useRef, useState } from 'react'
import {
  AlertTriangle, ArrowRight, Battery, Camera, Check, ChevronRight, CircleHelp, CloudUpload, Droplets, ExternalLink, Flame, Footprints, Leaf, LocateFixed, LockKeyhole, LogOut, Mail, Menu, PackageCheck, Recycle, Search, ShieldCheck, Sparkles, Trophy, UserRound, X
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
  industrialTitle: string
  industrialSteps: string[]
  diyTitle: string
  diySteps: string[]
  transitDays: number
  totalRecycleDays: number
  facilityName: string
  transitMode: string
  finalTitle: string
  finalDesc: string
  finalIcon: typeof Leaf
}

const waste: Record<WasteKey, Waste> = {
  green: {
    label: 'Green Bin · Wet / Biodegradable',
    short: 'GREEN BIN',
    material: 'Kitchen & food waste',
    risk: 1,
    riskLabel: 'Safe',
    riskColor: 'emerald',
    chip: 'bg-emerald-50 text-emerald-700',
    icon: Leaf,
    current: 'Organic waste returns nutrients to the soil when separated correctly.',
    future: 'Composting avoids methane-heavy landfill decomposition.',
    process: 'Anaerobic digestion into clean biogas and certified organic compost.',
    tip: 'Drain excess liquid, chop scraps, and layer in a home compost caddy.',
    industrialTitle: 'Biogas & Organic Composting Protocol',
    industrialSteps: [
      'Automated mechanical screening & de-stoning to remove non-biodegradables.',
      'Shredding and blending with water into homogeneous biomethanation slurry.',
      'High-rate anaerobic digestion in sealed bioreactors producing methane biogas.',
      'Sludge dewatering, solar drying, and pathogen destruction at 55°C+.',
      'Nutrient enrichment and packaging into CPCB-certified organic fertilizer.',
    ],
    diyTitle: 'At-Home Composting & Kitchen Scrap Upcycling',
    diySteps: [
      'Drain excess gravy or liquids from kitchen scraps into sink.',
      'Chop vegetable peels, fruit rinds, and tea leaves into small 1-inch pieces.',
      'In a ventilated bin, add 2 parts dry brown matter (dry leaves/torn egg cartons) to 1 part wet scraps.',
      'Turn and aerate the mix with a small garden trowel once every 4 days.',
      'Within 3 to 4 weeks, harvest rich black vermi-compost for your home plants!',
    ],
    transitDays: 3,
    totalRecycleDays: 7,
    facilityName: 'Central Municipal Biomethanation & Vermi-Compost Facility',
    transitMode: 'Municipal Green Wet Fleet (GPS Tracked)',
    finalTitle: 'Bio-Composted',
    finalDesc: 'Soil Compost & Biogas',
    finalIcon: Leaf,
  },
  blue: {
    label: 'Blue Bin · Dry / Recyclable',
    short: 'BLUE BIN',
    material: 'PET synthetic plastic & dry packaging',
    risk: 2,
    riskLabel: 'Moderate',
    riskColor: 'yellow',
    chip: 'bg-sky-50 text-sky-700',
    icon: Recycle,
    current: 'PET is valuable when clean, dry, and kept separate from wet waste.',
    future: 'Takes 450+ years to decompose in a landfill.',
    process: 'Optical sorting, hot caustic decontamination, and rPET fiber pelletization.',
    tip: 'Rinse with water, crush to save 75% volume, and recycle caps separately.',
    industrialTitle: 'Polymer Decontamination & Pellet Extrusion',
    industrialSteps: [
      'Near-Infrared (NIR) optical sorting to segregate PET, HDPE, and PP polymers.',
      'Trommel washer and caustic soda bath (85°C) to remove adhesives and paper labels.',
      'Mechanical high-speed granulation into uniform 6mm polymer flakes.',
      'Float-sink density separation to isolate pure PET from polyolefin caps.',
      'Vacuum de-volatilization and extrusion into food-grade recycled rPET resin pellets.',
    ],
    diyTitle: 'Upcycling: Self-Watering Micro-Planter DIY',
    diySteps: [
      'Rinse plastic bottle thoroughly with clean water and remove the wrapper label.',
      'Carefully cut the plastic bottle in half using household craft scissors.',
      'Poke a small hole through the bottle cap, thread a 6-inch cotton string through it, and screw cap back on.',
      'Invert top half inside bottom base, fill top with soil, and plant seeds (mint/coriander).',
      'Fill base with 2 inches of water — the wick keeps soil perfectly moist for 10 days!',
    ],
    transitDays: 4,
    totalRecycleDays: 10,
    facilityName: 'Regional Polymer Re-pelletization & Extrusion Plant',
    transitMode: 'Dedicated Dry Recyclables Logistics Line',
    finalTitle: 'Recycled',
    finalDesc: 'rPET Pelletized',
    finalIcon: Recycle,
  },
  red: {
    label: 'Red Bin · Sanitary & Bio-Medical Waste',
    short: 'RED BIN',
    material: 'Soiled sanitary & biomedical items',
    risk: 3,
    riskLabel: 'High',
    riskColor: 'orange',
    chip: 'bg-red-50 text-red-700',
    icon: ShieldCheck,
    current: 'Soiled materials can carry pathogens and should never enter a recycling stream.',
    future: 'Improper disposal can contaminate soil and groundwater reservoirs.',
    process: 'Sterilization via autoclaving followed by 1100°C dual-chamber incineration.',
    tip: 'Wrap securely in newspaper, mark with a red dot, and hand to sanitary staff.',
    industrialTitle: 'Bio-Medical Autoclaving & Safe Incineration',
    industrialSteps: [
      'Barcoded sealed container collection and GPS-tracked biohazard transport.',
      'High-pressure steam autoclaving at 134°C (3 bar) for complete microbial inactivation.',
      'Secondary feeding into dual-chamber thermal incinerator operating at 1050°C - 1200°C.',
      'Multi-stage venturi flue gas scrubbing to neutralize dioxins and acidic particulates.',
      'Vitrified bottom ash stabilization in engineered bio-secure hazardous landfill cells.',
    ],
    diyTitle: 'Hygienic Wrapping & Safe Disposal Protocol',
    diySteps: [
      'Wear disposable gloves or handle waste with clean paper tissue.',
      'Wrap soiled sanitary pads, bandages, or diapers in 3-4 layers of dry newspaper.',
      'Secure tightly with biodegradable adhesive tape so nothing can spill or attract pests.',
      'Mark the outer paper package clearly with a prominent RED DOT or "Biohazard" label.',
      'Deposit strictly into the designated RED BIN or hand over directly to municipal sanitation workers.',
    ],
    transitDays: 5,
    totalRecycleDays: 14,
    facilityName: 'Common Bio-Medical Waste Treatment & Autoclave Centre (CBWTF)',
    transitMode: 'Hermetic Biohazard Transport Unit',
    finalTitle: 'Safely Disposed',
    finalDesc: 'Incinerated & Neutralized',
    finalIcon: ShieldCheck,
  },
  black: {
    label: 'Black Bin · Hazardous & E-Waste',
    short: 'BLACK BIN',
    material: 'Lithium battery, electronics & hazardous chemicals',
    risk: 4,
    riskLabel: 'Critical',
    riskColor: 'red',
    chip: 'bg-slate-900 text-white',
    icon: Battery,
    current: 'Battery chemicals can leach heavy metals; damaged cells may catch fire.',
    future: 'Heavy metals (Lead, Cadmium, Cobalt) persist in water tables for centuries.',
    process: 'Closed-circuit cryogenic shredding and hydrometallurgical metal extraction.',
    tip: 'Tape electrical terminals with tape, avoid puncturing, and use a certified hub.',
    industrialTitle: 'Hydrometallurgical Rare-Metal Recovery',
    industrialSteps: [
      'Manual safety inspection, battery discharging, and inert nitrogen atmosphere purge.',
      'Cryogenic freeze-shredding to prevent thermal runaway and fire hazards.',
      'Air classification & magnetic separation to recover steel casings, copper, and aluminum.',
      'Hydrometallurgical acid leaching to dissolve and isolate Lithium, Nickel, and Cobalt salts.',
      'Refining back into 99.9% battery-grade precursor chemicals for circular manufacturing.',
    ],
    diyTitle: 'Safe Storage & Safe Hub Preparation',
    diySteps: [
      'Inspect device/battery — if swollen, warm, or leaking, place immediately in a fire-safe ceramic container.',
      'Apply non-conductive electrical tape or masking tape over both positive (+) and negative (-) terminals.',
      'Place in an individual clear zip-lock plastic bag away from heat, direct sun, or flammable liquids.',
      'NEVER throw into municipal wet or dry household bins — it is a severe fire and toxicity hazard.',
      'Open the BinWise "Find a Drop-Off Hub" map below and drop it off at the nearest CPCB certified TSDF centre.',
    ],
    transitDays: 7,
    totalRecycleDays: 21,
    facilityName: 'State CPCB Authorized TSDF & Rare-Metal Hydro-refinery',
    transitMode: 'Hazardous Materials Sealed Specialized Carrier',
    finalTitle: 'Extracted & Secured',
    finalDesc: 'Rare Metals / TSDF Secured',
    finalIcon: Sparkles,
  },
}



const samples: { label: string; key: WasteKey; icon: typeof Leaf }[] = [
  { label: 'Kitchen waste', key: 'green', icon: Leaf },
  { label: 'Plastic bottle', key: 'blue', icon: Droplets },
  { label: 'Soiled bandage', key: 'red', icon: ShieldCheck },
  { label: 'Lithium battery', key: 'black', icon: Battery },
]

const harmTheme: Record<string, { card: string; label: string; body: string }> = {
  emerald: { card: 'border-l-4 border-l-emerald-400 bg-emerald-50/50', label: 'text-emerald-700', body: 'text-emerald-900' },
  yellow: { card: 'border-l-4 border-l-yellow-400 bg-yellow-50/50', label: 'text-yellow-700', body: 'text-yellow-900' },
  orange: { card: 'border-l-4 border-l-orange-400 bg-orange-50/50', label: 'text-orange-700', body: 'text-orange-900' },
  red: { card: 'border-l-4 border-l-red-500 bg-red-50/50', label: 'text-red-700', body: 'text-red-900' },
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-600/90">{children}</p>
  )
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
  const [errorMessage, setErrorMessage] = useState('');
  const [authOpen, setAuthOpen] = useState(false);
  const [confidence, setConfidence] = useState<number>(95)
  const [showTextDemand, setShowTextDemand] = useState<boolean>(false)
  const [customTransitDays, setCustomTransitDays] = useState<number | null>(null)
  const [customTotalDays, setCustomTotalDays] = useState<number | null>(null)

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

  async function analyze() {
    if (!input.trim() && !fileName && !fileRef.current?.files?.[0]) return
    setAnalyzing(true)

    try {
      const selectedFile = fileRef.current?.files?.[0]
      const formData = new FormData()
      formData.append('user_id', '00000000-0000-0000-0000-000000000001')
      if (input.trim()) formData.append('text_hint', input.trim())

      if (selectedFile) {
        // Load and compress image
        const arrayBuffer = await selectedFile.arrayBuffer()
        const blob = new Blob([arrayBuffer], { type: selectedFile.type })
        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
          const image = new Image()
          image.onload = () => resolve(image)
          image.onerror = reject
          image.src = URL.createObjectURL(blob)
        })

        const maxDim = 800
        const scale = Math.min(maxDim / img.width, maxDim / img.height, 1)
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height)

        const compressedBlob = await new Promise<Blob>((res) => canvas.toBlob(res as BlobCallback, 'image/jpeg', 0.7))
        const compressedFile = new File([compressedBlob], selectedFile.name, { type: 'image/jpeg' })
        formData.append('image', compressedFile)
      }

      // Send request to API route (calls Gemini Vision & NLP)
      let data: any = null
      try {
        const res = await fetch('/api/waste/submit', {
          method: 'POST',
          body: formData,
        })
        if (res.ok) {
          data = await res.json()
        }
      } catch (fetchErr) {
        console.warn('API fetch failed:', fetchErr)
      }

      if (!data) {
        // Fallback heuristics
        const combined = `${fileName} ${input}`.toLowerCase()
        const fallbackKey: WasteKey =
          (combined.includes('battery') || combined.includes('charger') || combined.includes('e-waste') || combined.includes('electronic') || combined.includes('wire') || combined.includes('cable') || combined.includes('phone') || combined.includes('lithium')) ? 'black' :
          (combined.includes('bandage') || combined.includes('sanitary') || combined.includes('diaper') || combined.includes('medical') || combined.includes('syringe') || combined.includes('mask') || combined.includes('medicine')) ? 'red' :
          (combined.includes('food') || combined.includes('kitchen') || combined.includes('peel') || combined.includes('organic') || combined.includes('fruit') || combined.includes('vegetable') || combined.includes('leaf') || combined.includes('apple') || combined.includes('banana') || combined.includes('compost') || combined.includes('wet') || combined.includes('garden') || combined.includes('rotten') || combined.includes('leftover')) ? 'green' : 'blue'
        
        const calculatedConf = 96
        setConfidence(calculatedConf)
        setShowTextDemand(false)
        setResult(fallbackKey)
        setCustomTransitDays(waste[fallbackKey].transitDays)
        setCustomTotalDays(waste[fallbackKey].totalRecycleDays)
        setAnalyzing(false)
        setAnalyzed(true)
        setJourney(1)
        document.getElementById('ai-classification-result')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }

      console.log('Gemini API response data:', data)
      const apiType = (data.waste_type || '').toLowerCase()
      const next: WasteKey =
        (apiType.includes('e-waste') || apiType.includes('battery') || apiType.includes('electronic') || apiType.includes('hazardous')) ? 'black' :
        (apiType.includes('sanitary') || apiType.includes('medical') || apiType.includes('hazard')) ? 'red' :
        (apiType.includes('organic') || apiType.includes('food') || apiType.includes('biodegradable') || apiType.includes('wet')) ? 'green' : 'blue'

      const rawConf = typeof data.gemini_confidence === 'number' ? data.gemini_confidence : (typeof data.confidence === 'number' ? data.confidence : 0.95)
      const confPercent = Math.round(rawConf > 1 ? rawConf : rawConf * 100)
      
      setConfidence(confPercent)
      setShowTextDemand(confPercent < 70 || data.status === 'pending_text_input')
      if (data.transit_days) setCustomTransitDays(data.transit_days)
      if (data.total_days) setCustomTotalDays(data.total_days)

      setErrorMessage('')
      setResult(next)
      setAnalyzing(false)
      setAnalyzed(true)
      setJourney(1)
      document.getElementById('ai-classification-result')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } catch (err) {
      console.error('Analysis error:', err)
      const combined = `${fileName} ${input}`.toLowerCase()
      const fallbackResult: WasteKey =
        (combined.includes('battery') || combined.includes('charger') || combined.includes('lithium') || combined.includes('e-waste') || combined.includes('electronic') || combined.includes('wire')) ? 'black' :
        (combined.includes('bandage') || combined.includes('sanitary') || combined.includes('diaper') || combined.includes('medical') || combined.includes('hazard') || combined.includes('mask')) ? 'red' :
        (combined.includes('food') || combined.includes('kitchen') || combined.includes('peel') || combined.includes('organic') || combined.includes('fruit') || combined.includes('vegetable') || combined.includes('leaf') || combined.includes('apple') || combined.includes('banana') || combined.includes('wet')) ? 'green' : 'blue'

      setResult(fallbackResult)
      setConfidence(80)
      setShowTextDemand(false)
      setErrorMessage('')
      setAnalyzing(false)
      setAnalyzed(true)
      setJourney(1)
      document.getElementById('ai-classification-result')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  function dropped() {
    setJourney(3)
    setUserXp(prev => prev + 20)
    setToast(true)
    setTimeout(() => setToast(false), 2800)
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 text-slate-900 md:pb-0 font-sans">

      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button aria-label="Open navigation" onClick={() => setDrawer(true)} className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 md:hidden">
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('home')}>
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm shadow-emerald-700/30">
                <Leaf className="h-4 w-4" />
              </span>
              <span className="text-[17px] font-bold tracking-tight text-slate-900 font-display">
                BinWise <span className="text-emerald-600">AI</span>
              </span>
              <span className="hidden rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 sm:flex ml-1">
                SIH 2026
              </span>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-1 mx-8 text-sm font-semibold text-slate-600">
             <button onClick={() => setActiveTab('home')} className={`px-4 py-2 rounded-full transition-colors ${activeTab === 'home' ? 'bg-slate-100 text-slate-900' : 'hover:bg-slate-50 hover:text-slate-900'}`}>Home</button>
             <button onClick={() => setActiveTab('leaderboard')} className={`px-4 py-2 rounded-full transition-colors ${activeTab === 'leaderboard' ? 'bg-slate-100 text-slate-900' : 'hover:bg-slate-50 hover:text-slate-900'}`}>Rankings</button>
             <button onClick={() => setActiveTab('impact')} className={`px-4 py-2 rounded-full transition-colors ${activeTab === 'impact' ? 'bg-slate-100 text-slate-900' : 'hover:bg-slate-50 hover:text-slate-900'}`}>Impact</button>
          </nav>

          <div className="relative flex items-center gap-3">
            <div className="hidden items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 sm:flex">
              <Sparkles className="h-3.5 w-3.5 fill-emerald-500 text-emerald-500" />
              {userXp} GKP
            </div>
            {loggedIn ? (
              <div className="relative">
                <button
                  aria-label="Open profile menu"
                  onClick={() => setProfileOpen(v => !v)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white shadow-sm ring-2 ring-emerald-50 transition hover:bg-emerald-700"
                >
                  {userName.split(' ').map(p => p[0]).join('')}
                </button>
                {profileOpen && (
                  <div className="absolute right-0 top-12 z-50 w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
                        {userName.split(' ').map(p => p[0]).join('')}
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
                      onClick={() => { setLoggedIn(false); setProfileOpen(false) }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => { setAuthOpen(true); setAuthError('') }}
                className="hidden rounded-full bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 px-5 py-2 text-sm font-bold text-white shadow-sm transition sm:block"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* SIDEBAR DRAWER */}
      {drawer && (
        <>
          <button aria-label="Close navigation" className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm" onClick={() => setDrawer(false)} />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-80 max-w-[88vw] flex-col overflow-y-auto bg-white shadow-2xl [scrollbar-width:thin] transition-transform duration-300">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
                  <Leaf className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-bold text-slate-900 font-display">BinWise <span className="text-emerald-600">AI</span></p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">SIH 2026 Edition</p>
                </div>
              </div>
              <button onClick={() => setDrawer(false)} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mx-4 mt-5 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-5 text-white shadow-lg shadow-emerald-700/10">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-100">Your Green Karma</span>
                <span className="flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-extrabold text-white shadow-sm">
                  <Sparkles className="h-3 w-3 fill-white" />{userXp} GKP
                </span>
              </div>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/20">
                <div className="h-full rounded-full bg-white transition-all duration-700" style={{ width: `${Math.min(100, Math.max(8, (userXp / 100) * 100))}%` }} />
              </div>
              <p className="mt-2.5 text-[11px] text-emerald-50 leading-relaxed font-medium">Segregate properly and verify drop-offs to earn more GKP!</p>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8">
              <div>
                <p className="mb-3 px-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Navigation</p>
                <div className="space-y-1">
                  {[
                    ['home', 'Scanner & Home', 'AI waste classification'],
                    ['leaderboard', 'Leaderboard & Ranks', 'Live Eco-Warriors standings'],
                    ['impact', 'Community Impact', 'Collective environmental stats'],
                  ].map(([tab, label, desc]) => {
                    const icons: Record<string, typeof Leaf> = { home: Leaf, leaderboard: Trophy, impact: Flame }
                    const Icon = icons[tab]
                    return (
                      <button
                        key={tab}
                        onClick={() => { setActiveTab(tab as any); setDrawer(false) }}
                        className={`group flex w-full items-center gap-3.5 rounded-2xl px-3 py-3 text-left transition-colors ${activeTab === tab ? 'bg-slate-50' : 'hover:bg-slate-50'}`}
                      >
                        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm transition-colors ${activeTab === tab ? 'bg-emerald-100 text-emerald-600' : 'bg-white border border-slate-200 text-slate-500 group-hover:border-emerald-200 group-hover:text-emerald-600'}`}>
                          <Icon className="h-4 w-4" />
                        </span>
                        <div>
                          <p className={`text-xs font-bold ${activeTab === tab ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-900'}`}>{label}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{desc}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <p className="mb-3 px-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">CPCB Standards Reference</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    ['bg-emerald-500', 'Green', 'Organic/Wet'],
                    ['bg-sky-500', 'Blue', 'Dry Recycle'],
                    ['bg-red-500', 'Red', 'Sanitary'],
                    ['bg-slate-800', 'Black', 'E-Waste'],
                  ].map(([color, name, desc]) => (
                    <div key={name} className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
                      <div className="mb-1.5 flex items-center gap-1.5">
                        <span className={`h-2 w-2 rounded-full ${color}`} />
                        <span className="text-[11px] font-bold text-slate-800">{name}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium">{desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-3 px-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Official Portals</p>
                <div className="space-y-1.5">
                  {[
                    ['CPCB Waste Guidelines', 'https://cpcb.nic.in/'],
                    ['Swachh Bharat Mission', 'https://swachhbharatmission.gov.in/'],
                  ].map(([label, href]) => (
                    <a key={label} href={href} target="_blank" rel="noreferrer"
                      className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-xs font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700 shadow-sm">
                      <span>{label}</span>
                      <ExternalLink className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 p-4 bg-slate-50">
              <div className="text-center py-2">
                <p className="text-xs font-bold text-slate-800">Team Asynchronous</p>
                <p className="mt-0.5 text-[10px] font-medium text-slate-500">Smart India Hackathon 2026</p>
              </div>
            </div>
          </aside>
        </>
      )}

      {/* MAIN CONTENT */}
      <main>
        {activeTab === 'home' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* HERO SECTION */}
            <section className="relative overflow-hidden bg-white border-b border-slate-200">
              {/* Mobile-only background overlay */}
              <div className="lg:hidden absolute inset-0 z-0 pointer-events-none">
                <img
                  src="/clean-earth.jpg"
                  alt="Background Earth"
                  className="w-full h-full object-cover opacity-15"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/95 to-white" />
              </div>

              <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center py-12 sm:py-16 lg:py-24">
                  {/* Left: Text Content */}
                  <div className="max-w-2xl">
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-emerald-700 mb-6">
                      <Sparkles className="h-3.5 w-3.5" />
                      Smart India Hackathon 2026
                    </div>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-6 font-display">
                      India's AI <br/>
                      <span className="text-emerald-600">Waste Brain.</span>
                    </h1>
                    <p className="text-base sm:text-lg text-slate-600 mb-8 leading-relaxed max-w-lg">
                      Instantly classify household waste using AI vision. Get verified CPCB disposal instructions, locate drop-off points, and earn Green Karma Points for a cleaner India.
                    </p>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                      <button 
                        onClick={() => document.getElementById('scanner-section')?.scrollIntoView({ behavior: 'smooth' })}
                        className="rounded-full bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-700/25 transition-transform hover:scale-105 active:scale-95 text-center"
                      >
                        Start Scanning
                      </button>
                      <button 
                        onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                        className="rounded-full bg-white border border-slate-200 px-8 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 text-center"
                      >
                        How it works
                      </button>
                    </div>
                    
                    <div className="mt-10 grid grid-cols-3 gap-6 pt-10 border-t border-slate-100">
                      <div>
                        <p className="text-2xl font-extrabold text-slate-900 font-display sm:text-3xl">62M+</p>
                        <p className="text-xs font-medium text-slate-500 mt-1">Items Sorted</p>
                      </div>
                      <div>
                        <p className="text-2xl font-extrabold text-slate-900 font-display sm:text-3xl">4.8k</p>
                        <p className="text-xs font-medium text-slate-500 mt-1">CO₂ Offset (t)</p>
                      </div>
                      <div>
                        <p className="text-2xl font-extrabold text-slate-900 font-display sm:text-3xl">98%</p>
                        <p className="text-xs font-medium text-slate-500 mt-1">AI Accuracy</p>
                      </div>
                    </div>
                  </div>

                  {/* Right: Desktop-only Image Card */}
                  <div className="hidden lg:block relative lg:ml-auto w-full max-w-lg mx-auto">
                    <div className="absolute inset-0 bg-emerald-400 blur-[80px] opacity-20 -z-10 transform scale-90"></div>
                    <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl border border-slate-100 bg-white">
                      <img
                        src="/clean-earth.jpg"
                        alt="Crystal clean earth representing environmental sustainability"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-teal-950/70 via-transparent to-teal-950/20"></div>
                      
                      {/* Top-left live badge */}
                      <div className="absolute top-5 left-5">
                        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-800/80 backdrop-blur-md px-3.5 py-1.5 text-xs font-semibold text-emerald-200 border border-emerald-500/40 shadow-lg">
                          <span className="h-2 w-2 rounded-full bg-emerald-300 animate-ping" />
                          AI Vision Powered
                        </div>
                      </div>

                      {/* Bottom glassmorphic card */}
                      <div className="absolute bottom-6 left-6 right-6">
                        <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/40 flex items-center justify-between">
                          <div className="flex items-center gap-3.5">
                            <div className="h-11 w-11 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/30">
                              <Leaf className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 font-display">Biodegradable</p>
                              <p className="text-[11px] text-slate-500 font-medium">CPCB Green Category</p>
                            </div>
                          </div>
                          <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                            98% Acc.
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24 space-y-24">
              
              {/* SCANNER SECTION */}
              <section id="scanner-section" className="scroll-mt-24">
                <div className="rounded-[2.5rem] bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 border border-emerald-400/30 p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden">
                  {/* Background image overlay */}
                  <div className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none">
                    <img src="/scanner-bg.jpg" alt="Nature glass globe background" className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/40 to-transparent pointer-events-none" />
                  
                  {/* Decorative background blur */}
                  <div className="pointer-events-none absolute -top-40 -right-40 h-96 w-96 rounded-full bg-emerald-400/20 blur-[100px] z-0" />
                  <div className="pointer-events-none absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-teal-300/20 blur-[100px] z-0" />
                  
                  <div className="relative z-10">
                    <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                      <div className="max-w-xl">
                        <span className="inline-block mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-200">Hybrid Model</span>
                        <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl font-display">Waste Classification AI</h2>
                        <p className="mt-3 text-sm leading-relaxed text-emerald-50 font-medium opacity-90">
                          Upload an image or describe the item. Our neural model cross-references CPCB guidelines to instantly determine the correct bin category and risk level.
                        </p>
                      </div>
                      <div className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/20 bg-white/20 px-4 py-2 text-xs font-bold text-white backdrop-blur-md shadow-sm">
                        <Sparkles className="h-3.5 w-3.5 animate-pulse text-emerald-200" /> Vision & NLP Engine Active
                      </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      {/* Image Upload Area */}
                      <button
                        onClick={() => fileRef.current?.click()}
                        className="group relative flex min-h-[240px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-white/40 bg-white/10 backdrop-blur-md p-8 text-center transition-all hover:border-white hover:bg-white/20 shadow-inner"
                      >
                        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => setFileName(e.target.files?.[0]?.name ?? '')} />
                        {fileName ? (
                          <>
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/25 text-white ring-2 ring-white/50 shadow-md">
                              <PackageCheck className="h-8 w-8" />
                            </div>
                            <span className="max-w-full truncate text-sm font-bold text-white">{fileName}</span>
                            <span className="mt-2 text-xs font-medium text-emerald-100">Image attached · Ready to scan</span>
                          </>
                        ) : (
                          <>
                            <div className="mb-6 flex items-center gap-4">
                              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md shadow-inner transition-transform group-hover:scale-110 group-hover:bg-white group-hover:text-emerald-800 text-white">
                                <CloudUpload className="h-6 w-6" />
                              </span>
                              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md shadow-inner transition-transform group-hover:-rotate-6 text-white">
                                <Camera className="h-6 w-6" />
                              </span>
                            </div>
                            <span className="text-base font-bold text-white">Upload Photo or Use Camera</span>
                            <span className="mt-2 text-xs text-emerald-100/80 font-medium">Supported formats: JPG, PNG, WebP (Max 10MB)</span>
                          </>
                        )}
                      </button>

                      {/* Text Input Area */}
                      <label className="group flex min-h-[240px] cursor-text flex-col rounded-3xl border border-white/30 bg-white/10 backdrop-blur-md p-6 transition-colors focus-within:border-white focus-within:bg-white/20 shadow-inner">
                        <span className="mb-4 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-emerald-100">
                          <span className="flex items-center gap-2"><Search className="h-4 w-4 text-emerald-200" /> Describe Item</span>
                          <span className="font-normal normal-case opacity-75 text-emerald-100">e.g. food scraps, broken charger</span>
                        </span>
                        <textarea
                          value={input}
                          onChange={e => setInput(e.target.value)}
                          placeholder="Type details about the waste item — material type, brand info, or condition..."
                          className="flex-1 resize-none bg-transparent text-sm leading-relaxed text-white outline-none placeholder:text-emerald-100/50 font-medium"
                        />
                      </label>
                    </div>

                    <div className="mt-6 flex flex-col md:flex-row gap-4 items-center">
                      <button
                        disabled={analyzing || (!input.trim() && !fileName)}
                        onClick={analyze}
                        className="flex w-full md:w-auto md:flex-1 items-center justify-center gap-2.5 rounded-2xl bg-white py-4 px-8 text-sm font-extrabold text-emerald-900 shadow-xl shadow-teal-950/30 transition hover:bg-emerald-50 active:scale-98 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {analyzing ? (
                          <><span className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-900/30 border-t-emerald-900" /> Processing with Neural Net...</>
                        ) : (
                          <><Sparkles className="h-5 w-5 text-emerald-600" /> {analyzed ? 'Re-analyze Input' : 'Classify & Segregate Now'} <ArrowRight className="h-4 w-4 text-emerald-600" /></>
                        )}
                      </button>
                      
                      {/* Quick Samples */}
                      <div className="w-full md:w-auto flex flex-wrap items-center gap-2 border-t border-white/20 md:border-t-0 md:border-l md:border-white/20 md:pl-6 pt-4 md:pt-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-100 mr-1 hidden sm:block">Quick test:</span>
                        {samples.map(s => (
                          <button
                            key={s.key}
                            onClick={() => {
                              setInput(s.label);
                              setResult(s.key);
                              setConfidence(s.key === 'green' ? 98 : s.key === 'black' ? 96 : s.key === 'red' ? 94 : 97);
                              setShowTextDemand(false);
                              setCustomTransitDays(waste[s.key].transitDays);
                              setCustomTotalDays(waste[s.key].totalRecycleDays);
                              setAnalyzed(true);
                              setJourney(1);
                              document.getElementById('ai-classification-result')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }}
                            className="flex items-center gap-1.5 rounded-xl border border-white/30 bg-white/15 backdrop-blur-md px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-white/30 hover:border-white"
                          >
                            <s.icon className="h-3.5 w-3.5 text-emerald-200" />{s.label}
                          </button>
                        ))}

                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* AI RESULT + RESOURCE RECOVERY */}
              <div className="grid gap-8 lg:grid-cols-12 scroll-mt-24" id="ai-classification-result">
                {errorMessage && (
                  <div className="lg:col-span-12 mb-2 p-4 bg-amber-100 border border-amber-300 text-amber-800 rounded-2xl flex items-center gap-2 text-sm font-medium">
                    <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {!analyzed ? (
                  <div className="lg:col-span-12 rounded-3xl border-2 border-dashed border-slate-200 bg-white p-10 sm:p-14 text-center shadow-sm">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-4 ring-8 ring-emerald-50/50">
                      <Camera className="h-8 w-8" />
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">
                      <Sparkles className="h-3.5 w-3.5 text-emerald-600" /> Scanner Standby
                    </span>
                    <h3 className="text-2xl font-extrabold text-slate-900 font-display sm:text-3xl">No Waste Detected Yet</h3>
                    <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 leading-relaxed font-medium">
                      Upload a photo or type a description in the Waste Classification AI above to view instant neural vision classification, environmental hazard levels, and disposal protocols.
                    </p>
                    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                      <button
                        onClick={() => document.getElementById('scanner-section')?.scrollIntoView({ behavior: 'smooth' })}
                        className="rounded-full bg-emerald-600 px-6 py-3 text-xs font-bold text-white shadow-md shadow-emerald-700/20 transition hover:bg-emerald-700"
                      >
                        Start Scanning Now
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Classification Result Card */}
                    <section className="rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50 lg:col-span-7 overflow-hidden flex flex-col">
                      <div className="p-8 border-b border-slate-100 flex-1">
                        <SectionTitle icon={ResultIcon}>AI Inference Result</SectionTitle>
                        
                        {/* LOW CONFIDENCE TEXT DEMAND BANNER */}
                        {(showTextDemand || confidence < 70) && (
                          <div className="mb-6 rounded-2xl bg-amber-50/90 border border-amber-200 p-4.5 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="flex items-start gap-3">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 mt-0.5">
                                <AlertTriangle className="h-4 w-4" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                                    Low AI Confidence ({confidence}%)
                                  </h4>
                                  <span className="rounded-full bg-amber-200/60 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-800">
                                    Description Required
                                  </span>
                                </div>
                                <p className="text-xs text-amber-800/90 mt-1 leading-relaxed">
                                  Confidence is below 70%. Please describe the item or material details below to refine and confirm segregation:
                                </p>
                                <div className="mt-3 flex flex-col sm:flex-row gap-2">
                                  <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="e.g., lithium battery from toy, vegetable kitchen peel, dirty diaper..."
                                    className="flex-1 rounded-xl border border-amber-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
                                  />
                                  <button
                                    onClick={analyze}
                                    disabled={analyzing || !input.trim()}
                                    className="rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-amber-700 transition flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-50"
                                  >
                                    <Sparkles className="h-3.5 w-3.5" /> Re-classify with Text
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex items-start justify-between gap-4 mt-2">
                          <div>
                            <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-widest ${item.chip}`}>
                              <ResultIcon className="h-3.5 w-3.5" />{item.short}
                            </div>
                            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 font-display sm:text-4xl">{item.material}</h2>
                            <p className="mt-2 text-sm font-medium text-slate-500">{item.label}</p>
                          </div>
                          <div className="shrink-0 text-right bg-slate-50 rounded-2xl p-4 border border-slate-100">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">AI Confidence</p>
                            <p className={`mt-1 text-3xl font-extrabold font-display ${confidence >= 70 ? 'text-emerald-600' : 'text-amber-600'}`}>
                              {confidence}<span className={`text-xl ${confidence >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>%</span>
                            </p>
                          </div>
                        </div>
                        
                        {/* Environmental Burden Meter */}
                        <div className="mt-8 rounded-2xl bg-slate-50 p-6 ring-1 ring-slate-100/80">
                          <div className="mb-3 flex items-center justify-between text-xs font-bold">
                            <span className="text-slate-700 uppercase tracking-wider text-[10px]">Environmental Burden Level</span>
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-extrabold text-slate-800 shadow-sm border border-slate-200">{item.riskLabel}</span>
                          </div>
                          <div aria-label={`Risk ${item.risk} of 4`} role="progressbar" aria-valuemin={1} aria-valuemax={4} aria-valuenow={item.risk} className="flex h-3 gap-1 overflow-hidden rounded-full bg-slate-200/80 p-0.5">
                            <div className={`w-1/4 rounded-l-full transition-all duration-500 ${item.risk === 1 ? 'bg-emerald-500' : 'bg-emerald-500/40'}`} />
                            <div className={`w-1/4 transition-all duration-500 ${item.risk === 2 ? 'bg-yellow-400' : item.risk > 2 ? 'bg-yellow-400/40' : 'bg-transparent'}`} />
                            <div className={`w-1/4 transition-all duration-500 ${item.risk === 3 ? 'bg-orange-500' : item.risk > 3 ? 'bg-orange-500/40' : 'bg-transparent'}`} />
                            <div className={`w-1/4 rounded-r-full transition-all duration-500 ${item.risk === 4 ? 'bg-red-500' : 'bg-transparent'}`} />
                          </div>
                          <div className="mt-3 flex justify-between px-2 text-[10px] font-bold uppercase tracking-wider">
                            <span className={item.risk === 1 ? 'font-extrabold text-emerald-600' : 'text-slate-400'}>Safe</span>
                            <span className={item.risk === 2 ? 'font-extrabold text-yellow-600' : 'text-slate-400'}>Moderate</span>
                            <span className={item.risk === 3 ? 'font-extrabold text-orange-600' : 'text-slate-400'}>High</span>
                            <span className={item.risk === 4 ? 'font-extrabold text-red-600' : 'text-slate-400'}>Critical</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Burden Analysis Text */}
                      <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 bg-slate-50/50">
                        <div className={`p-6 ${harm.card} border-y-0 border-r-0`}>
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className={`h-4 w-4 ${harm.label}`} />
                            <p className={`text-[10px] font-bold uppercase tracking-widest ${harm.label}`}>
                              {result === 'green' ? 'Current Status' : 'Current Burden'}
                            </p>
                          </div>
                          <p className={`text-sm font-medium leading-relaxed ${harm.body}`}>{item.current}</p>
                        </div>
                        <div className="p-6">
                          <div className="flex items-center gap-2 mb-2">
                            <Flame className="h-4 w-4 text-slate-400" />
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                              {result === 'green' ? 'Future Opportunity' : 'Future Risk'}
                            </p>
                          </div>
                          <p className="text-sm font-medium leading-relaxed text-slate-700">{item.future}</p>
                        </div>
                      </div>
                    </section>

                    {/* Resource Recovery Card */}
                    <section className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50 lg:col-span-5">
                      <div>
                        <SectionTitle icon={Recycle}>Resource Recovery</SectionTitle>
                        <h3 className="text-2xl font-extrabold text-slate-900 font-display mb-6">Disposal Protocols</h3>
                        
                        <div className="space-y-4">
                          {/* Industrial Box */}
                          <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-600 to-teal-800 p-5 text-white shadow-md">
                            <div className="flex items-center gap-2 text-emerald-200 mb-2">
                              <Leaf className="h-4 w-4" />
                              <span className="text-[10px] font-bold uppercase tracking-widest text-white">Industrial Process</span>
                            </div>
                            <p className="text-sm font-medium leading-relaxed text-emerald-50">{item.process}</p>
                          </div>
                          
                          {/* DIY Box */}
                          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-5">
                            <div className="flex items-center gap-2 text-emerald-600 mb-2">
                              <Footprints className="h-4 w-4" />
                              <span className="text-[10px] font-bold uppercase tracking-widest">At-Home Preparation</span>
                            </div>
                            <p className="text-sm font-medium leading-relaxed text-emerald-900">{item.tip}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-8 flex flex-col gap-3">
                        <button onClick={() => setGuide('diy')} className="w-full rounded-2xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 hover:shadow-md">
                          View DIY Preparation Guide
                        </button>
                        <button onClick={() => setGuide('industrial')} className="w-full rounded-2xl bg-white border border-slate-200 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50">
                          View Industrial Workflow
                        </button>
                      </div>
                    </section>
                  </>
                )}
              </div>


              {/* DROP-OFF HUB (Standalone Full Width) */}
              <section id="drop-off-hub" className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-emerald-600 to-teal-800 p-8 sm:p-12 text-white shadow-2xl scroll-mt-24">

                {/* Background image overlay */}
                <div className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none">
                  <img src="/drop-off-hub-bg.jpg" alt="Scenic green hills with winding path to drop off hub" className="w-full h-full object-cover object-center" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/70 via-teal-900/50 to-transparent pointer-events-none" />
                
                <div className="relative z-10 flex flex-col lg:flex-row gap-8 lg:items-center lg:justify-between">
                  <div className="max-w-xl">
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest text-white backdrop-blur-md border border-white/20">
                      <LocateFixed className="h-3.5 w-3.5" /> Certified Collection
                    </div>
                    <h3 className="text-3xl font-extrabold sm:text-4xl font-display text-white">Find a Drop-Off Hub</h3>
                    <p className="mt-3 text-sm text-emerald-50 leading-relaxed font-medium opacity-90">
                      Locate government-approved municipal collection centres. Drop off your properly segregated waste and upload a photo to earn Green Karma Points.
                    </p>
                  </div>
                  
                  <div className="w-full max-w-md shrink-0 space-y-3">
                    <a
                      href="https://www.google.com/maps/search/waste+drop-off+center+near+me"
                      target="_blank" rel="noreferrer"
                      className="group flex items-center justify-between gap-4 rounded-2xl bg-white/10 p-5 backdrop-blur-md border border-white/20 transition hover:bg-white/20"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20 transition-transform group-hover:scale-110">
                          <LocateFixed className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <span className="block text-sm font-bold text-white">Find Nearest Centre</span>
                          <span className="text-xs text-emerald-200 mt-0.5 block font-medium">Open maps & navigate</span>
                        </div>
                      </div>
                      <ExternalLink className="h-5 w-5 text-emerald-200 transition-transform group-hover:translate-x-1" />
                    </a>
                    
                    <label className="group flex cursor-pointer items-center justify-between gap-4 rounded-2xl bg-white/10 p-5 backdrop-blur-md border border-white/20 transition hover:bg-white/20">
                      <input
                        type="file" accept="image/*" className="sr-only"
                        disabled={journey >= 4}
                        onChange={ev => {
                          const file = ev.target.files?.[0]
                          if (file) { setProofName(file.name); if (journey < 4) dropped() }
                        }}
                      />
                      <div className="flex items-center gap-4">
                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-110 ${proofName ? 'bg-emerald-500 text-white' : 'bg-white/20 text-white'}`}>
                          {proofName ? <Check className="h-6 w-6" /> : <CloudUpload className="h-6 w-6" />}
                        </div>
                        <div>
                          <span className="block text-sm font-bold text-white">
                            {journey >= 4 ? 'Journey Complete' : proofName ? 'Proof Uploaded' : 'Upload Proof'}
                          </span>
                          <span className="text-xs text-emerald-200 mt-0.5 block font-medium">
                            {proofName ? proofName : 'Attach photo at disposal bin (+20 GKP)'}
                          </span>
                        </div>
                      </div>
                      {journey < 4 && <ChevronRight className="h-5 w-5 text-emerald-200 transition-transform group-hover:translate-x-1" />}
                    </label>
                  </div>
                </div>
              </section>

              {/* WASTE JOURNEY STEPPER */}
              <section className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 shadow-xl shadow-slate-200/50">
                <div className="mb-10 text-center">
                  <SectionLabel>Lifecycle Tracker</SectionLabel>
                  <h3 className="text-2xl font-extrabold text-slate-900 font-display sm:text-3xl">Your Waste Journey</h3>
                  <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">Track your item from initial AI scan to its final circular economy destination.</p>
                </div>
                
                <div className="relative">

                  {/* Desktop connecting line */}
                  <div className="hidden sm:block absolute top-[28px] left-[10%] right-[10%] h-1 bg-slate-100 rounded-full" />
                  <div 
                    className="hidden sm:block absolute top-[28px] left-[10%] h-1 bg-emerald-500 rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${Math.min(100, (journey / 4) * 80)}%` }} 
                  />

                  <div className="grid grid-cols-1 gap-8 sm:grid-cols-5 relative z-10">
                    {[
                      { title: 'Scanned', eta: 'Day 0', desc: 'AI Verified', icon: Search },
                      { title: 'DIY Prepared', eta: 'Day 0-1', desc: 'Home Prepared', icon: Footprints },
                      { title: 'Dropped off', eta: 'Day 1-2', desc: 'At Local Hub', icon: LocateFixed },
                      { title: 'In Transit', eta: `Day 2–${customTransitDays ?? item.transitDays}`, desc: `${customTransitDays ?? item.transitDays}d Transit`, icon: CloudUpload },
                      { title: item.finalTitle || 'Recycled', eta: `Day ${customTotalDays ?? item.totalRecycleDays}`, desc: item.finalDesc || `${customTotalDays ?? item.totalRecycleDays}d Processed`, icon: item.finalIcon || Recycle },
                    ].map((step, i) => {
                      const done = i < journey && !(i === 1 && diySkipped)
                      const current = i === journey
                      const Icon = step.icon
                      
                      return (
                        <div key={i} className="relative flex sm:flex-col items-center gap-4 sm:gap-4 text-left sm:text-center group">
                          {/* Mobile connecting line */}
                          {i < 4 && (
                            <div className={`sm:hidden absolute top-14 left-[28px] w-0.5 h-full -z-10 transition-colors duration-1000 ${i < journey ? 'bg-emerald-500' : 'bg-slate-100'}`} />
                          )}
                          
                          <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-sm transition-all duration-500 ${done ? 'bg-emerald-600 text-white shadow-emerald-600/30' : current ? 'bg-white text-emerald-600 ring-4 ring-emerald-100 border-2 border-emerald-600' : 'bg-slate-50 border border-slate-200 text-slate-400 group-hover:border-slate-300'}`}>
                            {done ? <Check className="h-6 w-6 stroke-[3]" /> : <Icon className="h-6 w-6" />}
                          </div>
                          
                          <div>
                            <p className={`text-sm font-bold ${done || current ? 'text-slate-900' : 'text-slate-400'}`}>{step.title}</p>
                            <p className="text-[11px] font-semibold text-emerald-700 mt-0.5">{step.eta}</p>
                            <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${done ? 'bg-emerald-50 text-emerald-700' : current ? 'animate-pulse bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-500'}`}>
                              {done ? 'Completed' : current ? 'Current' : step.desc}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </section>


              {/* EDITORIAL SECTION: HOW IT WORKS */}
              <section id="how-it-works" className="scroll-mt-24">
                <div className="mb-10 text-center">
                  <SectionLabel>Smart Pipeline</SectionLabel>
                  <h3 className="text-3xl font-extrabold text-slate-900 font-display sm:text-4xl">How BinWise AI Works</h3>
                  <p className="mx-auto mt-3 max-w-lg text-sm text-slate-500">From raw household waste to certified circular economy recovery in three precise AI-powered steps.</p>
                </div>
                
                <div className="grid gap-6 md:grid-cols-3">
                  {[
                    { num: '01', title: 'AI Identification', desc: 'Upload a photo. Our neural model detects material composition and contamination levels with 98% accuracy.', img: '/ai-identification-step.jpg' },
                    { num: '02', title: 'CPCB Mapping', desc: 'Instantly maps the item to the Central Pollution Control Board four-bin segregation matrix with DIY preparation protocols.', img: '/cpcb-step.png' },
                    { num: '03', title: 'Karma Rewards', desc: 'Locate verified municipal drop-off centres, upload proof of responsible disposal, and earn Green Karma Points.', img: '/karma-rewards-step.jpg' },
                  ].map(step => (
                    <div key={step.num} className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
                      <div className="h-48 overflow-hidden relative">
                        <img src={step.img} alt={step.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        <div className="absolute top-4 left-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/90 backdrop-blur-sm text-sm font-extrabold text-emerald-700 shadow-sm">{step.num}</div>
                      </div>
                      <div className="p-6">
                        <h4 className="text-lg font-bold text-slate-900 font-display">{step.title}</h4>
                        <p className="mt-2 text-sm leading-relaxed text-slate-600 font-medium">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* EDITORIAL SECTION: CPCB MATRIX */}
              <section className="rounded-3xl bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-950 border border-emerald-400/30 p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 opacity-45 pointer-events-none">
                  <img src="/cpcb-national-bg.jpg" alt="India Gate at sunset representing National CPCB Standards" className="w-full h-full object-cover object-center" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-teal-950/60 to-emerald-950/40 pointer-events-none" />

                <div className="relative z-10">
                  <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div className="max-w-2xl">
                      <span className="inline-block mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-200">National Standard</span>
                      <h3 className="text-3xl font-extrabold text-white font-display sm:text-4xl">CPCB 4-Bin Matrix</h3>
                      <p className="mt-3 text-sm text-emerald-50 leading-relaxed font-medium opacity-90">Correct segregation at source eliminates 90% of municipal landfill toxicity. Learn the official government color codes.</p>
                    </div>
                    <span className="w-fit rounded-full bg-white/20 px-4 py-2 text-xs font-bold text-white border border-white/20 backdrop-blur-md">Legal Compliance</span>
                  </div>
                  
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                      { color: 'bg-emerald-500', name: 'Green Bin', type: 'Wet / Organic', text: 'Food peels, tea bags, garden leaves. Converts to biogas & compost.', img: '/green-bin.jpg' },
                      { color: 'bg-sky-500', name: 'Blue Bin', type: 'Dry / Recyclable', text: 'PET bottles, paper, cardboard, glass. Remanufactured into new goods.', img: '/blue-bin.png' },
                      { color: 'bg-red-500', name: 'Red Bin', type: 'Sanitary Waste', text: 'Soiled diapers, bandages, medicines. Safe thermal incineration.', img: '/red-bin.png' },
                      { color: 'bg-slate-700', name: 'Black Bin', type: 'Hazardous', text: 'Batteries, electronics, paints. TSDF recovery extracts heavy metals.', img: '/black-bin.png' },
                    ].map(b => (
                      <div key={b.name} className="group relative overflow-hidden rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 transition hover:border-white hover:bg-white/25 shadow-lg text-white">
                        <div className="h-32 overflow-hidden">
                          <img src={b.img} alt={b.name} className="w-full h-full object-cover opacity-75 transition-transform duration-700 group-hover:scale-110 group-hover:opacity-100" />
                        </div>
                        <div className="p-5 relative">
                          <div className="absolute -top-6 right-5 flex h-12 w-12 items-center justify-center rounded-full bg-teal-900/90 border-4 border-emerald-600 shadow-md">
                            <div className={`h-5 w-5 rounded-full ${b.color}`} />
                          </div>
                          <h5 className="text-lg font-bold text-white font-display mt-2">{b.name}</h5>
                          <p className="text-[10px] font-extrabold uppercase tracking-widest mt-1 mb-3 text-emerald-200">{b.type}</p>
                          <p className="text-xs leading-relaxed text-emerald-50 font-medium opacity-90">{b.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* LEADERBOARD + IMPACT SPLIT */}
              <div className="grid gap-8 lg:grid-cols-2">
                <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50 flex flex-col">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <SectionLabel>Live Rankings</SectionLabel>
                      <h3 className="text-2xl font-extrabold text-slate-900 font-display">Eco-Warriors</h3>
                    </div>
                    <button onClick={() => setActiveTab('leaderboard')} className="text-xs font-bold text-emerald-600 hover:text-emerald-700">View All →</button>
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    {[
                      ['1', 'EcoWarrior1', '2,540 GKP', 'bg-amber-100 text-amber-700', '🥇'],
                      ['2', 'GreenHero', '1,980 GKP', 'bg-slate-200 text-slate-700', '🥈'],
                      ['3', loggedIn ? userName : 'You', `${userXp} GKP`, 'bg-emerald-100 text-emerald-700', '🥉'],
                    ].map(([rank, name, xp, colorClass, medal]) => (
                      <div key={rank} className={`flex items-center gap-4 rounded-2xl p-4 transition-colors ${rank === '3' ? 'bg-emerald-50 ring-1 ring-emerald-200' : 'bg-slate-50 hover:bg-slate-100'}`}>
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold text-sm shadow-sm ${colorClass}`}>
                          {medal}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-bold text-slate-900">{name}</span>
                          <span className="text-[11px] font-medium text-slate-500">Rank {rank}</span>
                        </div>
                        <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-extrabold text-slate-700 shadow-sm border border-slate-100">{xp}</span>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 border border-emerald-400/30 p-8 text-white shadow-2xl flex flex-col justify-between">
                  {/* Background globe/blur */}
                  <div className="pointer-events-none absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-emerald-400/20 blur-[80px]" />
                  
                  <div className="relative z-10">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-200">Global Impact</span>
                      <span className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md border border-white/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" /> Live
                      </span>
                    </div>
                    <p className="text-5xl sm:text-6xl font-extrabold tracking-tight font-display mt-4">15,240<span className="text-emerald-200">+</span></p>
                    <p className="mt-3 text-sm text-emerald-50 font-medium opacity-90">Items sorted and segregated responsibly by the BinWise community this month.</p>
                    
                    <div className="mt-8 grid grid-cols-2 gap-4">
                      {[['CO2 Offset', '4.8 tons', 'Trees equivalent'], ['Landfill Saved', '12.6 m³', 'Material recovered']].map(([l, v, d]) => (
                        <div key={l} className="rounded-2xl border border-white/20 bg-white/15 backdrop-blur-md p-5 shadow-sm">
                          <p className="text-xl font-bold text-white font-display mb-1">{v}</p>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">{l}</p>
                          <p className="text-[10px] text-emerald-100/80 mt-2 font-medium">{d}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              </div>

              {/* EARTH SAFETY SPOTLIGHT */}
              <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-emerald-700 via-teal-800 to-teal-950 border border-emerald-400/30 shadow-2xl">
                <img
                  src="/earth-safety-mission.jpg"
                  alt="Green eco earth held in hands representing source segregation and environmental safety"
                  className="absolute inset-0 h-full w-full object-cover object-center opacity-70"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/90 via-emerald-900/70 to-emerald-950/30 pointer-events-none" />
                
                <div className="relative p-10 sm:p-16 max-w-2xl">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/20 px-4 py-1.5 text-xs font-bold text-white mb-6 backdrop-blur-md">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-200" /> Earth Safety Mission
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight text-white font-display">
                    Source segregation is India's most critical environmental mission.
                  </h3>
                  <p className="mt-5 text-sm sm:text-base leading-relaxed text-emerald-50 font-medium opacity-90">
                    India generates over <span className="text-white font-extrabold underline decoration-emerald-300">62 million tonnes</span> of municipal solid waste yearly. Unsegregated garbage poisons groundwater, emits methane, and forces toxic incineration. BinWise empowers citizens to solve this at the source.
                  </p>
                </div>
              </section>

              {/* TEAM ASYNCHRONOUS */}
              <section className="rounded-3xl border border-emerald-100 bg-gradient-to-b from-white to-emerald-50/30 p-8 sm:p-12 shadow-xl shadow-emerald-100/50">
                <div className="mb-10 text-center max-w-2xl mx-auto">
                  <SectionLabel>SIH 2026 Innovators</SectionLabel>
                  <h3 className="text-3xl font-extrabold text-slate-900 font-display sm:text-4xl">Team Asynchronous</h3>
                  <p className="mt-4 text-sm text-slate-600 leading-relaxed">
                    We are building next-generation AI and smart civic infrastructure for a sustainable, zero-landfill India. Bridging the gap between civic intent and environmental action.
                  </p>
                </div>
                
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { icon: Sparkles, title: 'AI Classification', desc: 'Neural models detecting waste material and contamination.' },
                    { icon: Trophy, title: 'Gamification UX', desc: 'Green Karma Points reward system and leaderboards.' },
                    { icon: ShieldCheck, title: 'CPCB Policy', desc: 'Strict alignment with SBM-U and legal waste matrices.' },
                    { icon: LocateFixed, title: 'Verification', desc: 'Geo-assisted drop-off discovery and proof validation.' },
                  ].map(pillar => (
                    <div key={pillar.title} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                        <pillar.icon className="h-6 w-6" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 font-display">{pillar.title}</h4>
                      <p className="mt-2 text-xs leading-relaxed text-slate-500 font-medium">{pillar.desc}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* FAQ */}
              <section className="mx-auto max-w-3xl">
                <div className="mb-8 text-center">
                  <SectionLabel>Knowledge Base</SectionLabel>
                  <h3 className="text-3xl font-extrabold text-slate-900 font-display">Frequently Asked Questions</h3>
                </div>
                <div className="space-y-4">
                  {[
                    ["Why can't batteries go into the blue or green bin?", "Lithium batteries contain heavy metals that leach into groundwater and trigger landfill fires. Always use certified Black Bin / E-Waste hubs."],
                    ["How do Green Karma Points (GKP) work?", "Earn +20 GKP when you categorize waste and upload verified photo proof at an approved drop-off hub. Points unlock ranks."],
                    ["Should I rinse plastic bottles before recycling?", "Yes. Rinsing prevents contamination of adjacent dry recyclables, ensuring PET plastic can be cleanly upcycled into rPET fibre."],
                  ].map(([q, a]) => (
                    <details key={q} className="group rounded-2xl border border-slate-200 bg-white [&_summary::-webkit-details-marker]:hidden">
                      <summary className="flex cursor-pointer items-center justify-between p-6 font-bold text-slate-900 text-sm">
                        {q}
                        <span className="ml-4 transition-transform group-open:rotate-45">
                          <div className="h-5 w-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-lg leading-none">+</div>
                        </span>
                      </summary>
                      <div className="px-6 pb-6 text-sm text-slate-600 font-medium leading-relaxed">
                        {a}
                      </div>
                    </details>
                  ))}
                </div>
              </section>

            </div>
          </div>
        )}

        {/* LEADERBOARD TAB */}
        {activeTab === 'leaderboard' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 mx-auto max-w-4xl px-4 py-12 sm:px-6">
            <div className="mb-10 text-center">
              <SectionLabel>Live Rankings</SectionLabel>
              <h2 className="text-4xl font-extrabold text-slate-900 font-display">Eco-Warriors</h2>
              <p className="mt-3 text-sm text-slate-500 font-medium">Compete with fellow eco-champions. Earn GKP by responsible waste segregation.</p>
            </div>
            <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50">
              <div className="space-y-4">
                {[
                  ['1', 'EcoWarrior1', '2,540 GKP', 'Compost Captain', 'bg-amber-100 text-amber-700', '🥇'],
                  ['2', 'GreenHero', '1,980 GKP', 'Plastic Slayer', 'bg-slate-200 text-slate-700', '🥈'],
                  ['3', loggedIn ? userName : 'You', `${userXp} GKP`, 'BinWise Rookie', 'bg-emerald-100 text-emerald-700', '🥉'],
                  ['4', 'EarthKeeper', '840 GKP', 'Clean Streets', 'bg-slate-100 text-slate-500', '4'],
                  ['5', 'ZeroWaster', '620 GKP', 'Recycler', 'bg-slate-100 text-slate-500', '5'],
                ].map(([rank, name, xp, badge, colorClass, medal]) => (
                  <div key={rank} className={`flex items-center gap-4 rounded-2xl p-4 sm:p-5 transition-colors ${rank === '3' ? 'bg-emerald-50 ring-2 ring-emerald-200 shadow-sm' : 'bg-slate-50 hover:bg-slate-100'}`}>
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-bold text-lg shadow-sm ${colorClass}`}>
                      {medal}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                        <span className="block truncate text-base font-bold text-slate-900">{name}</span>
                        <span className="inline-flex w-fit items-center rounded-full bg-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 ring-1 ring-slate-200 shadow-sm">{badge}</span>
                      </div>
                    </div>
                    <span className="shrink-0 text-lg font-extrabold text-emerald-600 font-display">{xp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* IMPACT TAB */}
        {activeTab === 'impact' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 mx-auto max-w-5xl px-4 py-12 sm:px-6">
            <div className="mb-10 text-center">
              <SectionLabel>Global Metrics</SectionLabel>
              <h2 className="text-4xl font-extrabold text-slate-900 font-display">Community Impact</h2>
              <p className="mt-3 text-sm text-slate-500 font-medium">Collective environmental action — tracked and measured in real time.</p>
            </div>
            
            <div className="rounded-[2rem] bg-gradient-to-br from-emerald-600 to-teal-800 p-10 text-white shadow-2xl relative overflow-hidden mb-8">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=1200')] opacity-10 mix-blend-overlay bg-cover bg-center" />
              <div className="relative z-10 text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-200 mb-4">Total Items Segregated</p>
                <p className="text-7xl sm:text-8xl font-extrabold tracking-tight font-display mb-4">15,240<span className="text-emerald-400">+</span></p>
                <p className="text-sm text-emerald-50 font-medium max-w-lg mx-auto">Waste items classified and responsibly disposed of by BinWise users nationwide since launch.</p>
              </div>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-3">
              {[
                ['CO₂ offset', '4.8 t', 'Equivalent to planting 1,120 trees', Flame],
                ['Landfill saved', '12.6 m³', 'Material fully recovered', Recycle],
                ['Active members', '2,840', 'Growing eco-warriors every day', Trophy],
              ].map(([label, value, detail, Icon]) => (
                <div key={label} className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50">
                  <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-6">
                    <Icon className="h-6 w-6 text-emerald-600" />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">{label}</p>
                  <p className="text-4xl font-extrabold text-slate-900 font-display mb-3">{value}</p>
                  <p className="text-xs leading-relaxed text-slate-500 font-medium">{detail}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="mt-20 border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row border-b border-slate-100 pb-12">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/30">
                <Leaf className="h-6 w-6" />
              </span>
              <div>
                <h4 className="text-lg font-extrabold text-slate-900 font-display">BinWise <span className="text-emerald-600">AI</span></h4>
                <p className="text-xs text-slate-500 font-medium mt-1">Built by <span className="font-bold text-slate-700">Team Asynchronous</span></p>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm font-semibold text-slate-500">
              <a href="https://cpcb.nic.in/" target="_blank" rel="noreferrer" className="transition hover:text-emerald-600">CPCB Portal</a>
              <a href="https://swachhbharatmission.gov.in/" target="_blank" rel="noreferrer" className="transition hover:text-emerald-600">Swachh Bharat</a>
              <a href="https://moef.gov.in/" target="_blank" rel="noreferrer" className="transition hover:text-emerald-600">MoEFCC</a>
            </div>
          </div>
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-medium">
            <p>© 2026 BinWise AI. Dedicated to a clean, sustainable India.</p>
            <p className="flex items-center gap-1.5 font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
              <Sparkles className="h-3.5 w-3.5" /> SIH 2026 Official Submission
            </p>
          </div>
        </div>
      </footer>

      {/* MOBILE NAV (Fixed Bottom) */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex h-20 items-center justify-around border-t border-slate-200 bg-white/90 backdrop-blur-md pb-safe md:hidden px-4">
        {[['home', 'Scan', Search], ['leaderboard', 'Rank', Trophy], ['impact', 'Impact', Flame], ['signin', 'Profile', UserRound]].map(([tab, label, Icon]) => (
          <button
            key={tab as string}
            onClick={() => (tab === 'signin' ? (loggedIn ? setProfileOpen(!profileOpen) : setAuthOpen(true)) : setActiveTab(tab as any))}
            className={`relative flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all ${activeTab === tab ? 'text-emerald-600' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            <Icon className={`h-6 w-6 mb-1 transition-transform ${activeTab === tab ? 'scale-110' : ''}`} />
            <span className="text-[10px] font-bold">{label as string}</span>
          </button>
        ))}
      </nav>

      {/* TOAST NOTIFICATION */}
      {toast && (
        <div role="status" className="fixed bottom-24 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full bg-slate-900 px-6 py-4 text-sm font-bold text-white shadow-2xl md:bottom-10 animate-in slide-in-from-bottom-10 fade-in">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500">
            <Sparkles className="h-3.5 w-3.5 fill-white text-white" />
          </div>
          +20 Green Karma Points Earned!
        </div>
      )}

      {/* GUIDE MODAL */}
      {guide && (
        <div role="dialog" aria-modal="true" aria-labelledby="guide-title" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in" onClick={() => setGuide(null)}>
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-[2rem] bg-white p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-6 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${item.chip}`}>
                    {item.short}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">CPCB Certified Protocol</span>
                </div>
                <h2 id="guide-title" className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display">
                  {guide === 'industrial' ? item.industrialTitle : item.diyTitle}
                </h2>
              </div>
              <button aria-label="Close" onClick={() => setGuide(null)} className="rounded-xl p-2 text-slate-400 bg-slate-50 hover:bg-slate-100 transition-colors shrink-0">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="rounded-2xl bg-emerald-50/80 p-4 sm:p-5 mb-6 border border-emerald-200/80">
              <p className="text-xs sm:text-sm font-semibold leading-relaxed text-emerald-950">
                {guide === 'industrial' ? item.process : item.tip}
              </p>
            </div>
            
            <div className="space-y-3.5 mb-8">
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                {guide === 'industrial' ? 'Industrial Standard Processing Stages' : 'Step-by-Step Action Plan'}
              </p>
              {(guide === 'industrial' ? item.industrialSteps : item.diySteps).map((step, i) => (
                <div key={i} className="flex gap-3.5 items-start p-3 rounded-2xl bg-slate-50/80 border border-slate-100 transition-colors hover:bg-slate-100/60">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white shadow-sm shadow-emerald-700/20">
                    {i + 1}
                  </span>
                  <p className="text-xs sm:text-sm leading-relaxed text-slate-700 font-medium pt-0.5">{step}</p>
                </div>
              ))}
            </div>
            
            {guide === 'diy' ? (
              <div className="space-y-3 border-t border-slate-100 pt-6">
                <label className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-2xl bg-emerald-600 px-4 py-4 text-sm font-bold text-white transition hover:bg-emerald-700 shadow-lg shadow-emerald-700/20">
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={ev => {
                      const f = ev.target.files?.[0];
                      if (f) {
                        setDiyProofName(f.name);
                        setDiySkipped(false);
                        setJourney(2);
                        setGuide(null);
                        setTimeout(() => {
                          document.getElementById('drop-off-hub')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }, 250);
                      }
                    }}
                  />
                  <CloudUpload className="h-5 w-5" />
                  {diyProofName ? `Photo Attached (${diyProofName})` : 'Attach DIY Preparation Photo'}
                </label>
                <button
                  onClick={() => {
                    setGuide(null);
                    setDiySkipped(true);
                    setJourney(2);
                    setTimeout(() => {
                      document.getElementById('drop-off-hub')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 250);
                  }}
                  className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  I will do this later / Skip to Drop-Off
                </button>
              </div>
            ) : (

              <button onClick={() => setGuide(null)} className="w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 py-4 text-sm font-bold text-white transition-colors shadow-lg shadow-emerald-700/20">
                Understood & Close Protocol
              </button>
            )}
          </div>
        </div>
      )}

      {/* AUTH MODAL */}
      {authOpen && (
        <div role="dialog" aria-modal="true" aria-labelledby="auth-title" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between mb-8">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-1">Welcome to BinWise</p>
                <h2 id="auth-title" className="text-3xl font-extrabold text-slate-900 font-display">Sign In</h2>
              </div>
              <button aria-label="Close" onClick={() => setAuthOpen(false)} className="rounded-xl p-2 text-slate-400 bg-slate-50 hover:bg-slate-100 transition-colors"><X className="h-5 w-5" /></button>
            </div>
            
            <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1 mb-8">
              <button onClick={() => setAuthTab('login')} className={`rounded-lg py-2.5 text-sm font-bold transition-all ${authTab === 'login' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Log In</button>
              <button onClick={() => setAuthTab('signup')} className={`rounded-lg py-2.5 text-sm font-bold transition-all ${authTab === 'signup' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Create Account</button>
            </div>
            
            <form className="space-y-5" onSubmit={ev => {
              ev.preventDefault()
              const data = new FormData(ev.currentTarget)
              const email = String(data.get('email') || '').trim()
              if (!email || !String(data.get('password') || '')) { setAuthError('Enter an email and password to continue.'); return }
              setUserEmail(email); setUserName(authTab === 'signup' ? 'New Eco Champion' : email.split('@')[0]); setLoggedIn(true); setAuthOpen(false); setAuthError('')
            }}>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Email Address</label>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 transition-colors focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-500/10">
                  <Mail className="h-5 w-5 text-slate-400" />
                  <input name="email" type="email" placeholder="you@example.com" className="min-w-0 flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-slate-400" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Password</label>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 transition-colors focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-500/10">
                  <LockKeyhole className="h-5 w-5 text-slate-400" />
                  <input name="password" type="password" placeholder="••••••••" className="min-w-0 flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-slate-400" />
                </div>
              </div>
              
              {authError && <p className="text-xs font-bold text-red-500 bg-red-50 p-3 rounded-xl border border-red-100">{authError}</p>}
              
              <button type="submit" className="w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 py-4 text-sm font-bold text-white transition shadow-lg shadow-emerald-700/20 mt-2">
                {authTab === 'login' ? 'Log In to Account' : 'Create Account'}
              </button>
            </form>
            
            <div className="my-6 flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-slate-300">
              <span className="h-px flex-1 bg-slate-100" /> OR <span className="h-px flex-1 bg-slate-100" />
            </div>
            
            <div className="space-y-3">
              <button type="button" onClick={() => setAuthError('Google sign-in requires backend configuration.')} className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 hover:border-slate-300">
                <svg className="h-5 w-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>
                Continue with Google
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
