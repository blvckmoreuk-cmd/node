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
}

export const categories: Category[] = [
  { id: 'vst',         label: 'VSTs',         hex: '#a855f7', wire: 'bg-purple-500', glow: 'shadow-[0_0_8px_rgba(168,85,247,0.9)]' },
  { id: 'rack',        label: 'Racks',        hex: '#2f6fed', wire: 'bg-accent',     glow: 'shadow-[0_0_8px_rgba(47,111,237,0.9)]' },
  { id: 'template',    label: 'Templates',    hex: '#22c55e', wire: 'bg-green-500',  glow: 'shadow-[0_0_8px_rgba(34,197,94,0.9)]' },
  { id: 'sample-pack', label: 'Sample Packs', hex: '#f97316', wire: 'bg-orange-500', glow: 'shadow-[0_0_8px_rgba(249,115,22,0.9)]' },
];

export const products: Product[] = [
  {
    num: '01', title: 'Nodegen', slug: 'nodegen-vst', category: 'vst',
    tagline: 'Chord Generator / Stab Sequencer',
    price: '£15', priceNote: 'one-time, lifetime updates',
    badge: 'New',
    detail: 'A chord generator and stab sequencer in one plugin. Roll out progressions, lock them to a scale, and fire rhythmic stabs without leaving the box. Built for fast idea-to-arrangement writing.',
    features: [
      'Chord generator with scale-locked voicings.',
      'Built-in stab sequencer with per-step gate and velocity.',
      'MIDI drag-out to any instrument in your DAW.',
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
    tagline: 'Sample Pack / Vol. 1',
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
    image: '/products/nodepack001.jpg',
  },
];
