// Single source of truth for the shop catalogue. Imported by shop.astro (cards
// + filter tabs) and the shared ProductModal so the detail panel stays in sync.
// Add a product by appending to `products`; add a category by appending to
// `categories`. Prices are display strings — the Stripe wiring comes later and
// will add a `stripePriceId` field alongside these.

export interface Category {
  id: string;        // matches Product.category
  label: string;     // tab + card label
  hex: string;       // accent dot / glow colour
  wire: string;      // tailwind bg-* for the dot
  glow: string;      // tailwind shadow for the dot glow
}

export interface Product {
  num: string;
  title: string;
  slug: string;
  category: string;      // one of Category.id
  tagline: string;       // short strapline under the title
  price: string;         // display price, e.g. '£15'
  priceNote: string;     // small print under the price
  detail: string;        // paragraph shown on card + modal
  features: string[];    // "what's inside" bullet list in the modal
  meta: { label: string; value: string }[]; // spec rows: Format, DAW, Size...
  badge?: string;        // optional flag: 'New', 'Bestseller'
  image?: string;        // cover art path, e.g. '/products/nodegen.jpg' (drop file in public/products/)
  preview?: string;      // audio preview embed URL (Spotify/SoundCloud track). Shown as an iframe in the modal.
}

export const categories: Category[] = [
  { id: 'vst',         label: 'VSTs',         hex: '#a08cb4', wire: 'bg-ch-tools',      glow: '' },
  { id: 'rack',        label: 'Racks',        hex: '#e3a83b', wire: 'bg-ch-mastering',  glow: '' },
  { id: 'template',    label: 'Templates',    hex: '#a8b25a', wire: 'bg-ch-education',  glow: '' },
  { id: 'sample-pack', label: 'Sample Packs', hex: '#d78d5c', wire: 'bg-ch-analysis',   glow: '' },
];

export const products: Product[] = [
  {
    num: '01', title: 'Nodegen', slug: 'nodegen-vst', category: 'vst',
    tagline: 'Analog-style stab synth',
    price: 'TBA', priceNote: 'coming soon',
    badge: 'Coming soon',
    detail: 'A stab synth built around an analog synth workflow. Outputs audio straight from a sample-based oscillator, with the option to save MIDI. Perfect for making classic minimal house stabs.',
    features: [
      'Analog synth workflow, tuned for stab writing.',
      'Sample-based oscillator with audio output.',
      'Save your patterns out as MIDI when you need it.',
      'Preset bank of house, garage and techno progressions.',
      'macOS only — native Apple Silicon (M-series) build.',
      'Lifetime updates included with purchase.',
    ],
    meta: [
      { label: 'Format', value: 'VST3 / AU' },
      { label: 'Platform', value: 'macOS (Apple Silicon)' },
      { label: 'Licence', value: 'Single user' },
    ],
    image: '', // drop cover at public/products/nodegen.jpg then set to '/products/nodegen.jpg'
  },
  {
    num: '02', title: 'Node Pack 001', slug: 'node-pack-001', category: 'sample-pack',
    tagline: 'Sample pack, volume 1',
    price: '£10', priceNote: 'royalty-free, one-time',
    badge: 'New',
    detail: 'The first Node sample pack: drums, one-shots and loops pulled from the same sessions behind our releases. Mixed and tagged, ready to drop straight into a project.',
    features: [
      'Drum one-shots: kicks, snares, hats, percussion.',
      'Bass and synth loops, key- and tempo-labelled.',
      'Foley, textures and FX risers.',
      'Royalty-free for use in your own releases.',
      '24-bit WAV, works in any DAW.',
    ],
    meta: [
      { label: 'Format', value: '24-bit WAV' },
      { label: 'Licence', value: 'Royalty-free' },
      { label: 'DAW', value: 'Any' },
    ],
    image: '/products/nodepack001.png',
    preview: '', // add embed URL, e.g. 'https://w.soundcloud.com/player/?url=...' or Spotify track embed
  },
  {
    num: '03', title: 'Nodescope', slug: 'nodescope-vst', category: 'vst',
    tagline: 'Analog-style visual analyser',
    price: 'TBA', priceNote: 'coming soon',
    badge: 'Coming soon',
    detail: 'Nodescope is on the way. A new Node VST built to sit in the same workflow as Nodegen. Full details, pricing and preview land at launch.',
    features: [
      'Details revealed at launch.',
      'macOS only — native Apple Silicon (M-series) build.',
      'Lifetime updates included with purchase.',
    ],
    meta: [
      { label: 'Format', value: 'VST3 / AU' },
      { label: 'Platform', value: 'macOS (Apple Silicon)' },
      { label: 'Status', value: 'Coming soon' },
    ],
    image: '', // drop cover at public/products/nodescope.jpg then set to '/products/nodescope.jpg'
  },
  {
    num: '04', title: 'Node Pack 002', slug: 'node-pack-002', category: 'sample-pack',
    tagline: 'Sample pack, volume 2',
    price: 'TBA', priceNote: 'coming soon',
    badge: 'Coming soon',
    detail: 'The second Node sample pack. More drums, one-shots and loops from the same sessions behind our releases. Full contents and pricing land at launch.',
    features: [
      'Contents revealed at launch.',
      'Royalty-free for use in your own releases.',
      '24-bit WAV, works in any DAW.',
    ],
    meta: [
      { label: 'Format', value: '24-bit WAV' },
      { label: 'Licence', value: 'Royalty-free' },
      { label: 'Status', value: 'Coming soon' },
    ],
    image: '', // drop cover at public/products/nodepack002.png then set to '/products/nodepack002.png'
  },
];
