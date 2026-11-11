// Single source of truth for the service catalogue. Imported by the homepage
// cards, the services page, and the shared ServiceModal so the detail panel
// stays identical everywhere. Prices here must match prices.astro and
// PriceReadout.astro.
export interface Service {
  num: string;
  title: string;
  slug: string;
  tagline: string;
  price: string;
  note: string;
  revisions: string;
  detail: string;
  wire: string;
  glow: string;
  hex: string;
  reqs: string[];
  tier: 'feat' | 'std' | 'sml'; // card size on the services grid
  cardNote?: string; // overrides the revisions line in the card footer
  reqsLabel?: string; // overrides the modal "What to send" heading; list hides when reqs is empty
  shopHref?: string; // when set, the modal CTA points here (the shop) instead of /contact
}

const productionReqs = [
  'Your DAW session or any stems/ideas you already have, exported from 0:00.',
  'At least one reference track (.mp3 or a link in a text file).',
  'A short note on the genre, target vibe and any parts you want kept.',
];

export const services: Service[] = [
  {
    num: '01', title: 'Ghost production', slug: 'production', tagline: 'Your track, written and produced by us', tier: 'feat',
    price: 'from £250', note: 'fully exclusive and royalty-free', revisions: 'Revision count set per project',
    cardNote: 'Revisions set per project',
    detail: 'A blank session or a rough idea, taken to a finished record. We handle composition, arrangement and sound selection. Fully exclusive and royalty-free.',
    wire: 'bg-ch-production', glow: '', hex: '#d0483a',
    reqs: productionReqs,
  },
  {
    num: '02', title: 'Mixing', slug: 'mixing', tagline: 'Balance, width and depth', tier: 'feat',
    price: 'from £50', note: '10 stems £50, 20 stems £85, 30 stems £100. Mastering included', revisions: '2 revisions included on every order',
    cardNote: 'Quoted per project',
    detail: 'Your stems mixed into a cohesive, club-ready record: gain staging, EQ, dynamics and space. Mastering is included, so the track leaves release-ready. 10 stems £50, 20 stems £85, 30 stems £100.',
    wire: 'bg-ch-mixing', glow: '', hex: '#8aa69a',
    reqs: [
      'All stems exported from 0:00 and clearly named (e.g. Kick, Bass, Lead).',
      'Sent as a single .zip at the project sample rate, 24-bit WAV.',
      'A reference track (.mp3 or a link in a text file).',
      'No master-bus processing left on the stems.',
      'A rough mix if you have one.',
      'Any notes and preferences you have so far.',
    ],
  },
  {
    num: '03', title: 'Track finishing', slug: 'finishing', tagline: 'Get your idea over the line', tier: 'feat',
    price: 'from £120', note: 'price varies with complexity', revisions: 'Revision count set per project',
    cardNote: 'Revisions set per project',
    detail: 'Half-finished project? We complete the arrangement, sound selection and structure to a mix-ready stage.',
    wire: 'bg-ch-production', glow: '', hex: '#d0483a',
    reqs: productionReqs,
  },
  {
    num: '04', title: 'Mastering', slug: 'mastering', tagline: 'Loud, clear and translating on any system', tier: 'std',
    price: '£30', note: '48-hour turnaround. £20/track on EPs (2+)', revisions: '2 revisions included on every order',
    cardNote: '48-hour turnaround. 2 revisions included',
    detail: 'A final master on an already-mixed track: commercial loudness, tonal balance and translation across systems via an analogue chain. Discounted per-track rate for EPs.',
    wire: 'bg-ch-mastering', glow: '', hex: '#e3a83b',
    reqs: [
      'One stereo mixdown, 24-bit WAV exported from 0:00.',
      'Leave roughly -3dB of headroom on the mix.',
      'No limiter or dynamic processing on the master bus.',
      'A reference track (.mp3 or a link in a text file).',
      'Any notes and preferences you have so far.',
    ],
  },
  {
    num: '05', title: 'Track analysis', slug: 'consulting', tagline: 'Feedback and breakdown', tier: 'std',
    price: '£30', note: 'per track', revisions: '', cardNote: 'per track',
    detail: 'A detailed listen-through of your track with honest technical and creative feedback: mix balance, arrangement, sound selection and where it stands next to reference records. Includes technical analysis with annotated screenshots (metering, EQ, spectrum) and clear explanations of what each one shows and how to fix it. Delivered as written notes or a call.',
    wire: 'bg-ch-analysis', glow: '', hex: '#d78d5c',
    reqs: [
      'The track as an .mp3 or WAV, or a private streaming link.',
      'A reference track or two for context (.mp3 or a link).',
      'The genre and where you feel it is falling short.',
      'Any specific areas or questions you want focused on.',
    ],
  },
  {
    num: '06', title: 'Education', slug: 'education', tagline: 'One-to-one Ableton sessions', tier: 'std',
    price: '£25', note: 'per hour', revisions: '', cardNote: 'per hour',
    detail: 'One-to-one sessions on Ableton workflow, sound design fundamentals, or a technical breakdown of your own session. Book a single call or an ongoing run of lessons.',
    wire: 'bg-ch-education', glow: '', hex: '#a8b25a',
    reqs: [
      'The session or project you want to work through (Ableton preferred).',
      'A list of goals or questions for the call.',
      'A stable connection for Discord or Muse screen-share.',
    ],
  },
  {
    num: '07', title: 'Tools & samples', slug: 'sounddesign', tagline: 'Custom patches, sample packs, VSTs', tier: 'sml',
    price: 'from £5', note: 'tools from £5, custom on enquiry', revisions: '', cardNote: 'Tools from £5, custom on enquiry',
    detail: 'Bespoke patches, racks and one-shots built around your reference. Prefer something off-the-shelf? Sample packs, stock FX racks and the Nodegen VST are fixed-price tools.',
    wire: 'bg-ch-tools', glow: '', hex: '#a08cb4', shopHref: '/shop/',
    reqsLabel: 'Workflow and production tools',
    reqs: [],
  },
];
