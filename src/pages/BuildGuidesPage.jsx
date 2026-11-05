import { useState } from 'react';
import { Link } from 'react-router-dom';

const COMPONENT_GUIDES = [
  {
    id: 'cpu',
    name: 'Processor (CPU)',
    tabLabel: 'CPU',
    tag: 'THE CENTRAL ENGINE',
    summary: 'The central processing unit performs all general computations, game physics, AI pathfinding, and operating system instructions.',
    image: '/assets/cpu.png',
    storePath: '/products/cpu',
    keySpecs: [
      { label: 'Cores & Threads', detail: 'More cores enhance multitasking & video editing; 6–8 fast cores are the gaming sweet spot.' },
      { label: 'Clock Speed (GHz)', detail: 'Single-core boost clock directly correlates with high frame rates in modern titles.' },
      { label: '3D V-Cache (X3D)', detail: 'AMD 3D V-Cache (e.g., 7800X3D) triples L3 cache, eliminating memory bottlenecks in gaming.' },
      { label: 'TDP / Power Draw', detail: 'Determines the minimum thermal capacity required from your CPU cooler.' },
      { label: 'Integrated Graphics', detail: 'Look out for "F" / "KF" (Intel) which lack display output and require a dedicated GPU.' }
    ],
    compatibilityPoints: [
      'Socket Match: AM5 for AMD Ryzen 7000/9000, LGA 1700 for Intel 12th–14th Gen, LGA 1851 for Core Ultra.',
      'Motherboard Chipset: Verify that the BIOS version on older motherboards supports newer CPU steppings.',
      'Cooler Clearance: Ensure your cooler TDP rating exceeds the CPU peak boost consumption.'
    ],
    tiers: [
      { tier: 'Budget (<$160)', recommendation: 'AMD Ryzen 5 5600 / Intel Core i5-12400F', idealFor: 'High FPS 1080p competitive esports & budget builds' },
      { tier: 'Sweet Spot ($200–$320)', recommendation: 'AMD Ryzen 5 7600X / Intel Core i5-13600KF', idealFor: 'Ultra 1440p gaming & balanced productivity' },
      { tier: 'High-End ($400+)', recommendation: 'AMD Ryzen 7 7800X3D / Intel Core i7-14700K', idealFor: 'Top-tier 4K/240Hz gaming and heavy creator workloads' }
    ],
    proTip: 'Never cheap out on cooling for high-end CPUs. If choosing AMD Ryzen 7000/9000, enable EXPO in the BIOS on your first boot to achieve rated memory speeds.'
  },
  {
    id: 'gpu',
    name: 'Graphics Card (GPU)',
    tabLabel: 'GPU',
    tag: 'VISUAL RENDERING CORE',
    summary: 'Renders 3D geometry, high-resolution textures, ray-traced reflections, and accelerates AI frame generation.',
    image: '/assets/gpu.png',
    storePath: '/products/gpu',
    keySpecs: [
      { label: 'VRAM Capacity', detail: 'Minimum 8GB for 1080p; 12GB–16GB strongly advised for modern AAA titles at 1440p and 4K.' },
      { label: 'Upscaling & Tech', detail: 'NVIDIA DLSS 3.5 / AMD FSR 3.1 / Intel XeSS provide AI upscaling and frame interpolation.' },
      { label: 'TGP / Power Needs', detail: 'Total graphics power determines your PSU capacity and case ventilation requirements.' },
      { label: 'Physical Length (mm)', detail: 'Triple-fan cards often exceed 320mm—verify clearance against case front fans or radiators.' },
      { label: 'Ray Tracing Cores', detail: 'Dedicated RT and Tensor cores calculate realistic lighting and path-traced reflections.' }
    ],
    compatibilityPoints: [
      'Case Clearance: Measure maximum GPU length support in your chosen case before purchase.',
      'Power Connectors: ATX 3.0 12V-2x6 / 12VHPWR 16-pin vs standard 8-pin PCIe cables. Never daisy-chain high-power cables.',
      'PCIe Slot Thickness: High-end cards take 3 to 3.5 expansion slots; ensure lower motherboard slots remain usable if needed.'
    ],
    tiers: [
      { tier: '1080p Esports', recommendation: 'AMD Radeon RX 6600 / NVIDIA RTX 4060', idealFor: 'High FPS CS2, Valorant, Fortnite, Apex' },
      { tier: '1440p Sweet Spot', recommendation: 'AMD Radeon RX 7800 XT / NVIDIA RTX 4070 Super', idealFor: 'Max settings 1440p with Ray Tracing & DLSS/FSR' },
      { tier: '4K Ultra & Enthusiast', recommendation: 'NVIDIA RTX 4080 Super / RTX 4090 / RX 7900 XTX', idealFor: 'Native 4K path tracing and VR headsets' }
    ],
    proTip: 'Allocate 40% to 50% of your total gaming PC budget to the GPU. It is the single most critical component determining gaming visual fidelity.'
  },
  {
    id: 'motherboard',
    name: 'Motherboard',
    tabLabel: 'MOBO',
    tag: 'NERVOUS SYSTEM & BUS',
    summary: 'The main circuit board connecting every component, regulating power delivery, and routing PCIe data lanes.',
    image: '/assets/motherboard.png',
    storePath: '/products/motherboard',
    keySpecs: [
      { label: 'Form Factor', detail: 'ATX (standard expansion), Micro-ATX (compact value leader), Mini-ITX (small form factor).' },
      { label: 'Chipset Tier', detail: 'AMD B650 / X670 / X870 vs Intel B760 / Z790. Chipset determines PCIe lane allocation and USB count.' },
      { label: 'VRM Power Delivery', detail: 'High-phase count VRMs with heavy heatsinks prevent CPU throttling under heavy continuous load.' },
      { label: 'M.2 Slots', detail: 'Look for at least two M.2 NVMe slots with integrated aluminum thermal heatspreaders.' },
      { label: 'Wireless & I/O', detail: 'Built-in Wi-Fi 6E/7, Bluetooth 5.3, 2.5G LAN, and USB-C 20Gbps front/rear headers.' }
    ],
    compatibilityPoints: [
      'Socket Match: Must strictly match CPU generation (AM5 for Ryzen 7000/9000, LGA 1700 for Intel 12–14th Gen).',
      'RAM Standard: DDR4 and DDR5 slots are physically distinct and keyed differently; they cannot be interchanged.',
      'Chassis Standoffs: Ensure your case accommodates the motherboard form factor (e.g., Micro-ATX vs ATX).'
    ],
    tiers: [
      { tier: 'Budget Solid Value', recommendation: 'B650M Micro-ATX / B760M DDR5', idealFor: 'Core gaming systems without extreme overclocking' },
      { tier: 'Feature-Rich Mainstream', recommendation: 'ATX B650 / Z790 with Wi-Fi 6E', idealFor: 'Optimal balance of M.2 storage, premium audio, and aesthetics' },
      { tier: 'Enthusiast / Extreme', recommendation: 'X670E / X870 / Z790 Dark Hero', idealFor: 'Multi-GPU, dual Gen 5 NVMe drives, USB4, custom loop cooling' }
    ],
    proTip: 'Look for "BIOS Flashback" button on the rear I/O. It allows updating the motherboard firmware from a USB stick without needing an older CPU installed.'
  },
  {
    id: 'ram',
    name: 'Memory (RAM)',
    tabLabel: 'RAM',
    tag: 'HIGH-SPEED CACHE BUS',
    summary: 'Ultra-fast volatile system memory holding current running programs, textures, and active game data.',
    image: '/assets/ram.png',
    storePath: '/products/ram',
    keySpecs: [
      { label: 'Memory Generation', detail: 'DDR5 is the modern gold standard (4800–6400+ MT/s); DDR4 remains in entry-level budget rigs.' },
      { label: 'Capacity', detail: '16GB is the entry baseline; 32GB (2x16GB) is strongly recommended for modern gaming and multitasking.' },
      { label: 'Speed & Latency', detail: 'DDR5-6000 CL30 is the universal sweet spot for AMD AM5; DDR5-6400+ CL32 for Intel.' },
      { label: 'Dual Channel', detail: 'Always install in matched pairs of 2 sticks to activate 128-bit memory bus bandwidth.' },
      { label: 'Module Height', detail: 'Low-profile modules (33–35mm) prevent physical conflicts with large dual-tower air coolers.' }
    ],
    compatibilityPoints: [
      'Motherboard Compatibility: Confirm motherboard DDR4 or DDR5 support.',
      'EXPO / XMP: AMD builds favor EXPO profiles; Intel builds use XMP 3.0 for one-click overclocking.',
      'Slot Populating: On 4-slot motherboards, always populate slots 2 and 4 (A2 & B2) first.'
    ],
    tiers: [
      { tier: 'Baseline Budget', recommendation: '16GB (2x8GB) DDR4-3200 CL16', idealFor: 'Ultra-tight budget setups and entry-level 1080p' },
      { tier: 'Modern Sweet Spot', recommendation: '32GB (2x16GB) DDR5-6000 CL30', idealFor: 'Ideal gaming performance with optimal frame pacing' },
      { tier: 'Heavy Workstation', recommendation: '64GB (2x32GB) DDR5-6400 CL32', idealFor: '4K video rendering, 3D modeling, high-density simulation games' }
    ],
    proTip: 'Never mix and match sticks from different kits or brands. Even identical model numbers can have different underlying memory ICs that cause blue screens.'
  },
  {
    id: 'disk',
    name: 'Storage (NVMe SSD)',
    tabLabel: 'STORAGE',
    tag: 'FAST NON-VOLATILE FLASH',
    summary: 'High-speed solid state storage for the operating system, games, and large files with near-instant boot and load times.',
    image: '/assets/disk.png',
    storePath: '/products/disk',
    keySpecs: [
      { label: 'Interface & Gen', detail: 'PCIe Gen 4 NVMe M.2 is the gold standard (up to 7,400 MB/s); Gen 5 reaches 14,000 MB/s.' },
      { label: 'Capacity Needs', detail: 'Modern games exceed 100GB each. Aim for minimum 1TB, preferably 2TB for gaming drives.' },
      { label: 'DRAM Cache vs HMB', detail: 'DRAM cache maintains peak write speeds during massive file transfers; HMB uses system RAM.' },
      { label: 'Endurance (TBW)', detail: 'Higher TBW ratings guarantee years of heavy read/write endurance without flash memory decay.' },
      { label: 'Form Factor', detail: 'M.2 2280 (22mm wide, 80mm long) installs directly on the motherboard without cables.' }
    ],
    compatibilityPoints: [
      'Slot Generation: Gen 4 drives work in Gen 3 slots (capped at ~3,500 MB/s), maintaining backward compatibility.',
      'Heatsink Clearance: Most motherboards include M.2 shield heatsinks; ensure your SSD fits underneath.',
      'DirectStorage: Modern titles utilize DirectStorage to stream assets directly from NVMe to GPU VRAM.'
    ],
    tiers: [
      { tier: 'Value 1TB', recommendation: 'Crucial P3 Plus / Kingston NV2 1TB', idealFor: 'Budget OS and library drive' },
      { tier: 'Performance 2TB', recommendation: 'WD Black SN770 / Lexar NM790 2TB', idealFor: 'High-speed gaming drive without overheating' },
      { tier: 'Enthusiast Flagship', recommendation: 'Samsung 990 PRO / WD Black SN850X 2TB-4TB', idealFor: 'Heavy video editing, huge databases, uncompromised speed' }
    ],
    proTip: 'Avoid installing modern games on mechanical hard drives (HDDs). Modern game engines stream textures dynamically and will stutter badly on spinning disks.'
  },
  {
    id: 'cooler',
    name: 'CPU Cooler',
    tabLabel: 'COOLER',
    tag: 'THERMAL DISSIPATION',
    summary: 'Dissipates CPU heat to prevent thermal throttling and ensure maximum boost clock performance.',
    image: '/assets/cooler.png',
    storePath: '/products/cooler',
    keySpecs: [
      { label: 'Air vs Liquid (AIO)', detail: 'Air coolers offer unbeatable reliability; AIO liquid coolers offer sleek looks and superior burst cooling.' },
      { label: 'Radiator Sizes', detail: '240mm (dual 120mm fans), 280mm (dual 140mm fans), 360mm (triple 120mm fans).' },
      { label: 'Thermal Headroom', detail: 'High TDP chips (Intel i7/i9, AMD 7900X) require dual-tower air coolers or 280/360mm AIOs.' },
      { label: 'Acoustic Noise', detail: 'Larger heatsinks and slower spinning 140mm fans yield near-silent operation.' },
      { label: 'RAM Clearance', detail: 'Large air coolers can hang over RAM slots; check cooler fin cutouts or use low-profile RAM.' }
    ],
    compatibilityPoints: [
      'CRITICAL: Remove the transparent plastic peel from the cooler copper base before mounting!',
      'Socket Bracket: Ensure cooler box includes the proper bracket for your CPU socket (AM5 / LGA1700 / LGA1851).',
      'Case Clearance: Verify CPU cooler maximum height (in mm) or AIO radiator mount points (top/front).'
    ],
    tiers: [
      { tier: 'Budget Air Champion', recommendation: 'Thermalright Assassin X 120 Refined SE', idealFor: '65W CPUs (Ryzen 5 5600/7600, i5-12400F)' },
      { tier: 'Dual-Tower Dominator', recommendation: 'Thermalright Phantom Spirit 120 EVO / Peerless Assassin', idealFor: 'Cools virtually any CPU up to 200W for under $45' },
      { tier: 'Premium 360mm AIO', recommendation: 'ARCTIC Liquid Freezer III 360 / DeepCool LT720', idealFor: 'Extreme Intel Core i7/i9 and ultra-clean glass builds' }
    ],
    proTip: 'Apply a pea-sized dot or an "X" pattern of thermal paste in the center of the CPU heatspreader. Mounting pressure will spread it evenly across the surface.'
  },
  {
    id: 'psu',
    name: 'Power Supply (PSU)',
    tabLabel: 'PSU',
    tag: 'ELECTRICAL POWER REGULATOR',
    summary: 'Converts wall AC current into clean DC voltages (+12V, +5V, +3.3V) with safety protections for all components.',
    image: '/assets/psu.png',
    storePath: '/products/psu',
    keySpecs: [
      { label: 'Wattage Capacity', detail: 'Aim for peak system draw + 150–200W headroom to operate in the 50%–70% peak efficiency curve.' },
      { label: 'ATX 3.0 / PCIe 5.0', detail: 'Includes native 12V-2x6 / 12VHPWR cable engineered to sustain 200% transient power spikes.' },
      { label: 'Modularity', detail: 'Fully modular PSUs let you attach only required cables, simplifying case cable management.' },
      { label: '80 PLUS / Cybenetics', detail: 'Efficiency certifications: Bronze (82%), Gold (90%), Platinum (92%), and Cybenetics noise ratings.' },
      { label: 'Protections Suite', detail: 'Must have OVP, UVP, OCP, OPP, OTP, and SCP to shield your PC from electrical faults.' }
    ],
    compatibilityPoints: [
      'Transient Spikes: High-end GPUs (RTX 4080/4090, RX 7900 XTX) can briefly spike +150W over rating; use Tier A/B PSUs.',
      'PSU Shroud Clearance: Check PSU depth (mm) vs case drive cages underneath the basement shroud.',
      'Cable Type: Never reuse modular cables from an old or different brand PSU! Pinouts are not standardized.'
    ],
    tiers: [
      { tier: 'Entry 650W Bronze/Gold', recommendation: 'Corsair CX650 / MSI MAG A650BN', idealFor: 'Budget rigs paired with RTX 4060 / RX 7600' },
      { tier: 'Mainstream 750W-850W Gold', recommendation: 'Corsair RM750e / be quiet! Pure Power 12 M 850W', idealFor: 'RTX 4070 Ti Super / RX 7800 XT systems' },
      { tier: 'Enthusiast 1000W+ Platinum', recommendation: 'Seasonic Focus GX-1000 ATX3 / Corsair RM1000x', idealFor: 'RTX 4090 / future 50-series flagship builds' }
    ],
    proTip: 'Consult the community SPL PSU Tier List (detailed below) before purchasing! Never select a PSU solely based on wattage and cheap price.'
  },
  {
    id: 'case',
    name: 'Case (Chassis)',
    tabLabel: 'CASE',
    tag: 'STRUCTURAL AIRFLOW ENCLOSURE',
    summary: 'The physical enclosure that holds components securely, directs cool airflow, and dampens acoustic noise.',
    image: '/assets/case.png',
    storePath: '/products/case',
    keySpecs: [
      { label: 'Front Panel Airflow', detail: 'Mesh front panels provide drastically lower component temps and lower fan RPMs vs solid glass.' },
      { label: 'Included Fans', detail: 'Cases with 3–4 pre-installed PWM fans offer the highest out-of-the-box cooling value.' },
      { label: 'GPU Clearance', detail: 'Check maximum GPU length in mm, accounting for front radiators or fans.' },
      { label: 'Cable Routing Space', detail: 'Look for 20mm+ depth behind the motherboard tray and rubber grommets.' },
      { label: 'Front I/O Connectivity', detail: 'Ensure front panel includes USB 3.2 Gen 2 Type-C, dual USB-A, and a combined audio jack.' }
    ],
    compatibilityPoints: [
      'Motherboard Size: ATX cases fit Micro-ATX and Mini-ITX boards; Micro-ATX cases cannot fit standard ATX motherboards.',
      'Radiator Mount Locations: Verify top vs front radiator thickness to avoid hitting tall motherboard VRM heatsinks.',
      'Dust Filtration: Removable magnetic dust filters on front, top, and PSU intake keep your hardware clean.'
    ],
    tiers: [
      { tier: 'High-Value Budget', recommendation: 'Montech AIR 903 BASE / DeepCool CC560', idealFor: 'Sub-$70 case with outstanding mesh airflow & pre-installed fans' },
      { tier: 'Premium Mid-Tower', recommendation: 'Lian Li LANCOOL 216 / Fractal Pop Air / NZXT H5 Flow', idealFor: 'Clean cable management, whisper-quiet fans, exceptional build quality' },
      { tier: 'Dual-Chamber Showcase', recommendation: 'Lian Li O11 Dynamic EVO / NZXT H9 Flow', idealFor: 'Panoramic glass showpiece builds with vertical GPU mounting' }
    ],
    proTip: 'Maintain positive air pressure (more intake CFM than exhaust CFM) to force air out of small panel gaps and prevent dust from settling inside.'
  }
];

const PSU_TIER_DATA = [
  {
    tier: 'Tier A',
    subtitle: 'High-End / Flagship Systems',
    color: 'border-purple-500 bg-purple-500/10 text-purple-400',
    badge: 'TOP TIER RECOMMENDED',
    description: 'Flawless voltage regulation, top-grade 105°C Japanese capacitors, multi-rail protection, native ATX 3.0 / PCIe 5.0 compatibility, low ripple (<25mV), 10–12 year manufacturer warranty.',
    bestFor: 'NVIDIA RTX 4080 / 4090 / 50-Series, AMD RX 7900 XTX, Intel Core i9 / AMD Ryzen 9 heavy gaming & creator workstations.',
    examples: [
      'Corsair RMx / RMx Shift / HX Series',
      'Seasonic Focus GX (ATX 3.0) / Vertex GX / Prime',
      'be quiet! Dark Power 13 / Straight Power 12',
      'MSI MAG A850GL / MEG Ai1300P',
      'Thermaltake Toughpower GF3 / GF A3'
    ]
  },
  {
    tier: 'Tier B',
    subtitle: 'Mid-Range / Mainstream Gaming',
    color: 'border-blue-500 bg-blue-500/10 text-blue-400',
    badge: 'MAINSTREAM SWEET SPOT',
    description: 'Solid, reliable internal topology (LLC resonant converter + DC-DC), comprehensive safety protections (OVP, UVP, OCP, OPP, OTP, SCP), quiet fan curves, 5–7 year warranty.',
    bestFor: 'NVIDIA RTX 4070 / Super, AMD RX 7800 XT / 7700 XT, Intel Core i5 / AMD Ryzen 5 & 7 gaming builds.',
    examples: [
      'Corsair RMe Series (RM750e, RM850e)',
      'Cooler Master MWE Gold V2',
      'Seasonic Core GC / GM Series',
      'be quiet! Pure Power 11 FM / 12 M',
      'Thermaltake Toughpower GF1'
    ]
  },
  {
    tier: 'Tier C',
    subtitle: 'Entry-Level / Budget Focused',
    color: 'border-emerald-500 bg-emerald-500/10 text-emerald-400',
    badge: 'ACCEPTABLE BUDGET',
    description: 'Competent entry-level designs with verified basic protections. Usually 80+ Bronze or baseline Gold, standard Taiwanese or Chinese capacitors rated at 85°C–105°C, 3–5 year warranty.',
    bestFor: 'Entry-level budget gaming rigs with low power draw (RTX 4060, RX 6600, Ryzen 5 5600/7600 without extreme GPU transients).',
    examples: [
      'MSI MAG A550BN / A650BN',
      'Corsair CX / CX-M Series (Grey label)',
      'be quiet! System Power 10 / 9',
      'Apevia Prestige (Standard Bronze)',
      'EVGA BR / BQ Series'
    ]
  },
  {
    tier: 'Tier D & E',
    subtitle: 'Avoid / Deprecated / Hazardous',
    color: 'border-amber-500 bg-amber-500/10 text-amber-400',
    badge: 'NOT RECOMMENDED',
    description: 'Outdated group-regulated topologies, missing Over-Temperature Protection (OTP), high ripple voltage exceeding ATX specifications, poor cross-load voltage stability.',
    bestFor: 'Only low-draw office PCs without discrete graphics cards, or scheduled for near-term replacement.',
    examples: [
      'EVGA W1 / N1 / White Series',
      'Thermaltake Smart 80+ White / TR2',
      'Corsair VS Series (Orange label - obsolete)'
    ]
  },
  {
    tier: 'Tier F',
    subtitle: 'Replace Immediately / Hazardous',
    color: 'border-red-500 bg-red-500/10 text-red-400',
    badge: 'CRITICAL DANGER',
    description: 'Units documented to explode, suffer catastrophic transistor failure during load tests, or lack fundamental short-circuit protections. Extreme risk of damaging connected hardware or causing fires.',
    bestFor: 'DO NOT USE. Replace immediately before powering connected components.',
    examples: [
      'Gigabyte GP-P750GM / GP-P850GM (Early serial batches)',
      'Generic unbranded / grey-box Chinese imports',
      'Diablotek, Logisys, and uncertified budget clones'
    ]
  }
];

export default function BuildGuidesPage() {
  const [activeTab, setActiveTab] = useState('cpu');
  const [psuSearch, setPsuSearch] = useState('');

  const currentGuide = COMPONENT_GUIDES.find((g) => g.id === activeTab) || COMPONENT_GUIDES[0];

  const filteredPsuTiers = PSU_TIER_DATA.map((tierGroup) => {
    if (!psuSearch.trim()) return tierGroup;
    const q = psuSearch.toLowerCase();
    const matchesGroup =
      tierGroup.tier.toLowerCase().includes(q) ||
      tierGroup.subtitle.toLowerCase().includes(q) ||
      tierGroup.description.toLowerCase().includes(q) ||
      tierGroup.bestFor.toLowerCase().includes(q);
    const matchedExamples = tierGroup.examples.filter((ex) => ex.toLowerCase().includes(q));

    if (matchesGroup || matchedExamples.length > 0) {
      return {
        ...tierGroup,
        examples: matchedExamples.length > 0 ? matchedExamples : tierGroup.examples
      };
    }
    return null;
  }).filter(Boolean);

  return (
    <div className="font-chakra py-12 space-y-16">

      {/* Page Title & Breadcrumbs */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono text-text-secondary uppercase mb-2">
          <Link to="/" className="hover:text-text-primary transition-colors">// HOME</Link>
          <span>/</span>
          <span className="text-text-primary">// BUILD_GUIDES</span>
        </div>
        <div className="border-l-4 border-text-accent pl-6">
          <h1 className="text-4xl font-black text-text-primary tracking-tight uppercase">
            Hardware Architecture & Build Guides
          </h1>
          <p className="text-text-secondary text-sm mt-2 max-w-3xl leading-relaxed">
            // Comprehensive component buying blueprints, curated step-by-step video masterclasses, and community-verified power supply safety indices.
          </p>
        </div>
      </div>

      {/* Quick Navigation Anchor Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a
          href="#components-section"
          className="bg-bg-panel border border-border-muted hover:border-text-primary p-4 transition-all duration-150 group flex items-center justify-between"
        >
          <div>
            <span className="text-[11px] font-mono text-text-accent tracking-wider">// SECTION 01</span>
            <div className="text-base font-bold text-text-primary group-hover:text-text-accent transition-colors">
              Component Buying Guides
            </div>
          </div>
          <span className="text-text-secondary group-hover:text-text-primary transition-transform group-hover:translate-x-1">↓</span>
        </a>

        <a
          href="#video-tutorials-section"
          className="bg-bg-panel border border-border-muted hover:border-text-primary p-4 transition-all duration-150 group flex items-center justify-between"
        >
          <div>
            <span className="text-[11px] font-mono text-text-accent tracking-wider">// SECTION 02</span>
            <div className="text-base font-bold text-text-primary group-hover:text-text-accent transition-colors">
              Visual Build Tutorials
            </div>
          </div>
          <span className="text-text-secondary group-hover:text-text-primary transition-transform group-hover:translate-x-1">↓</span>
        </a>

        <a
          href="#psu-tierlist-section"
          className="bg-bg-panel border border-border-muted hover:border-text-primary p-4 transition-all duration-150 group flex items-center justify-between"
        >
          <div>
            <span className="text-[11px] font-mono text-text-accent tracking-wider">// SECTION 03</span>
            <div className="text-base font-bold text-text-primary group-hover:text-text-accent transition-colors">
              SPL PSU Tier List
            </div>
          </div>
          <span className="text-text-secondary group-hover:text-text-primary transition-transform group-hover:translate-x-1">↓</span>
        </a>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: COMPONENT BUYING GUIDES TABS                                    */}
      {/* ========================================================================= */}
      <section id="components-section" className="space-y-6 pt-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-border-muted pb-4 gap-4">
          <div>
            <div className="text-xs font-mono text-text-accent tracking-widest uppercase">// SECTION 01</div>
            <h2 className="text-2xl font-black text-text-primary uppercase tracking-wide">
              Component Buying Architecture
            </h2>
          </div>
          <p className="text-xs text-text-secondary font-mono max-w-md">
            // Select any hardware category below to inspect critical specifications, compatibility bottlenecks, and budget recommendations.
          </p>
        </div>

        {/* Component Tabs Bar - Single Row Grid */}
        <div className="grid grid-cols-8 gap-1.5 border-b border-border-muted pb-2 overflow-x-auto">
          {COMPONENT_GUIDES.map((guide) => {
            const isActive = activeTab === guide.id;
            return (
              <button
                key={guide.id}
                onClick={() => setActiveTab(guide.id)}
                className={`flex items-center justify-center gap-1.5 px-1.5 lg:px-2 py-2.5 text-xs lg:text-sm font-bold uppercase transition-all duration-150 cursor-pointer whitespace-nowrap min-w-0 ${isActive
                    ? 'bg-text-primary text-bg-main shadow-[0_2px_10px_rgba(143,37,245,0.4)]'
                    : 'bg-bg-panel text-text-secondary hover:text-text-primary hover:bg-bg-panel-hover border border-border-muted'
                  }`}
              >
                <img
                  src={guide.image}
                  alt={guide.name}
                  className={`w-3.5 h-3.5 lg:w-4 lg:h-4 shrink-0 object-contain ${isActive ? 'brightness-0' : 'opacity-80'}`}
                />
                <span className="tracking-normal lg:tracking-wider truncate">{guide.tabLabel}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Component Guide Detail Panel */}
        <div className="bg-bg-panel border border-border-muted p-6 md:p-8 space-y-8">

          {/* Header of Active Component */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border-muted">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 p-3 bg-bg-main border border-border-muted flex items-center justify-center shrink-0">
                <img src={currentGuide.image} alt={currentGuide.name} className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="text-[11px] font-mono text-text-accent tracking-widest">{currentGuide.tag}</span>
                <h3 className="text-3xl font-black text-text-primary tracking-wide uppercase">
                  {currentGuide.name}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to={currentGuide.storePath}
                className="bg-bg-main border border-border-muted hover:border-text-primary text-text-secondary hover:text-text-primary px-4 py-2 text-xs font-mono uppercase tracking-wider transition-colors"
              >
                // BROWSE {currentGuide.name.split(' ')[0]} CATALOG →
              </Link>
              <Link
                to="/configurator"
                className="bg-text-primary text-bg-main font-bold px-4 py-2 text-xs font-mono uppercase tracking-wider hover:opacity-90 transition-opacity"
              >
                + ADD TO CONFIGURATOR
              </Link>
            </div>
          </div>

          <p className="text-base text-text-secondary leading-relaxed max-w-4xl">
            {currentGuide.summary}
          </p>

          {/* Key Specifications Grid */}
          <div className="space-y-3">
            <h4 className="text-sm font-mono text-text-accent tracking-wider uppercase">
              // 01. Key Hardware Specifications to Inspect
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentGuide.keySpecs.map((spec, idx) => (
                <div key={idx} className="bg-bg-main border border-border-muted p-4 space-y-1">
                  <div className="text-sm font-bold text-text-primary tracking-wide">{spec.label}</div>
                  <div className="text-xs text-text-secondary leading-relaxed">{spec.detail}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Compatibility Bottlenecks */}
          <div className="space-y-3">
            <h4 className="text-sm font-mono text-text-accent tracking-wider uppercase">
              // 02. Critical System Compatibility Rules
            </h4>
            <div className="bg-bg-main border-l-4 border-amber-500 border-r border-t border-b border-border-muted p-4 space-y-2">
              {currentGuide.compatibilityPoints.map((point, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm text-text-secondary">
                  <span className="text-amber-400 font-mono text-xs mt-0.5">▶</span>
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Tiers */}
          <div className="space-y-3">
            <h4 className="text-sm font-mono text-text-accent tracking-wider uppercase">
              // 03. Market Tiers & Recommendations
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {currentGuide.tiers.map((t, idx) => (
                <div key={idx} className="bg-bg-main border border-border-muted p-4 space-y-2 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-bg-panel border border-border-muted text-text-accent uppercase">
                      {t.tier}
                    </span>
                    <div className="text-sm font-bold text-text-primary mt-2">{t.recommendation}</div>
                  </div>
                  <div className="text-xs text-text-secondary pt-2 border-t border-border-muted">
                    <span className="text-text-accent font-mono">Target: </span>
                    {t.idealFor}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pro Tip Box */}
          <div className="bg-purple-950/20 border border-purple-500/40 p-4 flex items-start gap-3">
            <span className="text-purple-400 text-lg font-mono"></span>
            <div>
              <span className="text-xs font-mono text-purple-400 font-bold uppercase tracking-widest">BUILDER PRO TIP</span>
              <p className="text-sm text-text-secondary mt-1 leading-relaxed">
                {currentGuide.proTip}
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: VISUAL BUILD TUTORIALS (YOUTUBE VIDEOS)                         */}
      {/* ========================================================================= */}
      <section id="video-tutorials-section" className="space-y-6 pt-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-border-muted pb-4 gap-4">
          <div>
            <div className="text-xs font-mono text-text-accent tracking-widest uppercase">// SECTION 02</div>
            <h2 className="text-2xl font-black text-text-primary uppercase tracking-wide">
              Visual Build Tutorials
            </h2>
          </div>
          <p className="text-xs text-text-secondary font-mono max-w-md">
            // Masterclasses recorded by veteran hardware builders covering complete assembly, anti-static safety, and POV precision angles.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Video 1: LTT Definitive PC Build Guide 2024 */}
          <div className="bg-bg-panel border border-border-muted flex flex-col justify-between overflow-hidden">
            <div>
              {/* Responsive 16:9 iframe embed */}
              <div className="relative w-full aspect-video bg-bg-main border-b border-border-muted">
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube-nocookie.com/embed/s1fxZ-VWs2U"
                  title="How to Build a PC, the last guide you'll ever need! (2024 Update)"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono px-2 py-0.5 bg-bg-main border border-border-muted text-text-primary uppercase">
                    Linus Tech Tips • Comprehensive Masterclass
                  </span>
                  <span className="text-[10px] font-mono text-text-secondary">2024 UPDATE</span>
                </div>

                <h3 className="text-xl font-bold text-text-primary tracking-wide">
                  How to Build a PC, the Last Guide You'll Ever Need!
                </h3>

                <p className="text-xs text-text-secondary leading-relaxed">
                  The definitive all-in-one desktop assembly manual. Covers everything from ESD safety and component unboxing to motherboard bench testing, cable management channels, BIOS configuration, and Windows 11 installation.
                </p>

                {/* Key Timestamps / Topics */}
                <div className="space-y-1.5 pt-2 border-t border-border-muted text-xs">
                  <div className="font-mono text-text-accent text-[11px] uppercase tracking-wider mb-1">
                    Key Chapters Covered:
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-text-secondary font-mono text-[11px]">
                    <div>• Anti-Static Workspace Prep</div>
                    <div>• Out-of-Case POST Test</div>
                    <div>• CPU & RAM Insertion</div>
                    <div>• Case Standoff Alignment</div>
                    <div>• PSU Cable Routing</div>
                    <div>• BIOS EXPO/XMP Enable</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 pt-0">
              <a
                href="https://www.youtube.com/watch?v=s1fxZ-VWs2U"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 bg-bg-main border border-border-muted hover:border-text-primary text-text-primary text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
              >
                <span>OPEN ON YOUTUBE</span>
                <span>↗</span>
              </a>
            </div>
          </div>

          {/* Video 2: LTT First Person View POV Guide */}
          <div className="bg-bg-panel border border-border-muted flex flex-col justify-between overflow-hidden">
            <div>
              {/* Responsive 16:9 iframe embed */}
              <div className="relative w-full aspect-video bg-bg-main border-b border-border-muted">
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube-nocookie.com/embed/DC-Xn2C_L1U"
                  title="First Person View POV PC BUILD Guide!"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono px-2 py-0.5 bg-bg-main border border-border-muted text-text-primary uppercase">
                    Linus Tech Tips • First Person POV
                  </span>
                  <span className="text-[10px] font-mono text-text-secondary">TACTILE ANGLES</span>
                </div>

                <h3 className="text-xl font-bold text-text-primary tracking-wide">
                  First Person View POV PC Build Guide!
                </h3>

                <p className="text-xs text-text-secondary leading-relaxed">
                  Shot entirely from the builder's eye-level perspective. Ideal for visual learners who want to see exact finger grips, CPU retention lever resistance, front-panel pin alignments (Power SW / Reset / HDD LED), and delicate cooler mounting tension.
                </p>

                {/* Key Timestamps / Topics */}
                <div className="space-y-1.5 pt-2 border-t border-border-muted text-xs">
                  <div className="font-mono text-text-accent text-[11px] uppercase tracking-wider mb-1">
                    Key Chapters Covered:
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-text-secondary font-mono text-[11px]">
                    <div>• First-Person Socket Seating</div>
                    <div>• Front Panel Header Pinout</div>
                    <div>• Cooler Mounting Screws</div>
                    <div>• PCIe Latch Audible Click</div>
                    <div>• 24-Pin ATX Seating Force</div>
                    <div>• GPU Sag Bracket Mounting</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 pt-0">
              <a
                href="https://www.youtube.com/watch?v=DC-Xn2C_L1U"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 bg-bg-main border border-border-muted hover:border-text-primary text-text-primary text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
              >
                <span>OPEN ON YOUTUBE</span>
                <span>↗</span>
              </a>
            </div>
          </div>

        </div>

        {/* Builder Safety & Setup Checklist Callout */}
        <div className="bg-bg-panel border border-border-muted p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1">
            <div className="text-text-primary font-bold text-sm tracking-wide uppercase">// 01. REQUIRED TOOLS</div>
            <p className="text-xs text-text-secondary leading-relaxed">
              #2 Phillips magnetic screwdriver, small zip ties or velcro straps, flashlight or headlamp, USB 3.0 flash drive (8GB+) for Windows media creation.
            </p>
          </div>
          <div className="space-y-1">
            <div className="text-text-primary font-bold text-sm tracking-wide uppercase">// 02. WORKSPACE SAFETY</div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Work on a non-carpeted floor with a clean wooden or laminate desk. Touch a grounded metal object (like a plugged-in PSU case) periodically to discharge static electricity.
            </p>
          </div>
          <div className="space-y-1">
            <div className="text-text-primary font-bold text-sm tracking-wide uppercase">// 03. THE MOTHERBOARD BOX RULE</div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Place the motherboard directly on top of its cardboard packaging box to install the CPU, RAM, and M.2 SSDs before transferring it into your PC case chassis.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3: SPL PSU TIER LIST SPREADSHEET MATRIX                           */}
      {/* ========================================================================= */}
      <section id="psu-tierlist-section" className="space-y-6 pt-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-border-muted pb-4 gap-4">
          <div>
            <div className="text-xs font-mono text-text-accent tracking-widest uppercase">// SECTION 03</div>
            <h2 className="text-2xl font-black text-text-primary uppercase tracking-wide">
              SPL PSU Tier List Reference
            </h2>
          </div>
          <p className="text-xs text-text-secondary font-mono max-w-md">
            // Community-curated safety indices maintaining comprehensive electrical test results, capacitor benchmarks, and protection trigger thresholds.
          </p>
        </div>

        {/* Callout Notice about PSU Safety */}
        <div className="bg-bg-panel border-l-4 border-text-primary border-r border-t border-b border-border-muted p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-text-primary font-bold text-sm tracking-wider uppercase font-mono">
              <span>⚡</span>
              <span>WHY POWER SUPPLY SELECTION CANNOT BE OVERLOOKED</span>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 bg-bg-main border border-border-muted text-text-accent">
              HARDWARE BUSTERS / SPL METHODOLOGY
            </span>
          </div>

          <p className="text-sm text-text-secondary leading-relaxed">
            The power supply unit (PSU) is the heart of your desktop. An inferior or poorly regulated unit can cause random system shutoffs, silent blue-screens, or fail to absorb high-transient voltage spikes from modern GPUs (like the RTX 4080/4090). In the worst cases, units lacking basic Over-Temperature (OTP) or Over-Current (OCP) protections can destroy connected components or become fire hazards.
          </p>

          <p className="text-xs text-text-secondary font-mono leading-relaxed">
            // An "80 PLUS Gold" rating solely measures energy efficiency at room temperature—it DOES NOT guarantee high capacitor quality, voltage ripple suppression, or safety mechanisms.
          </p>

          {/* Direct External Links to Google Sheet and Web Database */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href="https://docs.google.com/spreadsheets/d/1akCHL7Vhzk_EhrpIGkz8zTEvYfLDcaSpZRB6Xt6JWkc/edit?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-text-primary text-bg-main font-bold px-5 py-2.5 text-xs font-mono uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center gap-2 shadow-[0_4px_15px_rgba(143,37,245,0.3)]"
            >
              <span>OPEN LIVE GOOGLE SPREADSHEET</span>
              <span>↗</span>
            </a>

            <a
              href="https://psutierlist.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-bg-main border border-border-muted hover:border-text-primary text-text-secondary hover:text-text-primary px-5 py-2.5 text-xs font-mono uppercase tracking-wider transition-colors flex items-center gap-2"
            >
              <span>VISIT PSUTIERLIST.ORG</span>
              <span>↗</span>
            </a>

            <Link
              to="/products/psu"
              className="bg-bg-main border border-border-muted hover:border-text-primary text-text-secondary hover:text-text-primary px-5 py-2.5 text-xs font-mono uppercase tracking-wider transition-colors flex items-center gap-2"
            >
              <span>BROWSE INVENTORY PSUs</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* Quick Search Bar within Tier List */}
        <div className="flex items-center gap-3 bg-bg-panel border border-border-muted px-4 py-3">
          <span className="text-text-secondary font-mono text-sm">🔍</span>
          <input
            type="text"
            placeholder="Search PSU model (e.g. RM750e, Focus GX, Pure Power, Toughpower)..."
            value={psuSearch}
            onChange={(e) => setPsuSearch(e.target.value)}
            className="bg-transparent text-text-primary placeholder:text-text-secondary/50 text-sm focus:outline-none w-full font-mono"
          />
          {psuSearch && (
            <button
              onClick={() => setPsuSearch('')}
              className="text-xs font-mono text-text-secondary hover:text-text-primary px-2 py-0.5 border border-border-muted"
            >
              CLEAR
            </button>
          )}
        </div>

        {/* Interactive Tier Matrix Cards */}
        <div className="space-y-4">
          {filteredPsuTiers.length === 0 ? (
            <div className="bg-bg-panel border border-border-muted p-8 text-center text-text-secondary font-mono text-sm">
              No PSU matching "{psuSearch}" found in quick reference. Check the full Google Spreadsheet linked above.
            </div>
          ) : (
            filteredPsuTiers.map((tierItem) => (
              <div
                key={tierItem.tier}
                className={`bg-bg-panel border ${tierItem.color.split(' ')[0]} p-6 space-y-4 transition-all duration-150`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-border-muted pb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-black tracking-wider uppercase text-text-primary">
                      {tierItem.tier}
                    </span>
                    <span className="text-sm text-text-accent font-medium">
                      // {tierItem.subtitle}
                    </span>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 uppercase tracking-widest border ${tierItem.color}`}>
                    {tierItem.badge}
                  </span>
                </div>

                <p className="text-xs text-text-secondary leading-relaxed">
                  {tierItem.description}
                </p>

                <div className="bg-bg-main border border-border-muted p-3 text-xs space-y-1">
                  <span className="text-text-accent font-mono font-bold uppercase tracking-wider">
                    Recommended Application:
                  </span>
                  <div className="text-text-secondary leading-relaxed">
                    {tierItem.bestFor}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-mono text-text-accent uppercase tracking-wider block mb-2">
                    Verified Benchmark Models:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {tierItem.examples.map((ex, idx) => (
                      <span
                        key={idx}
                        className="bg-bg-main border border-border-muted text-text-primary text-xs font-mono px-2.5 py-1"
                      >
                        {ex}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </section>

    </div>
  );
}
