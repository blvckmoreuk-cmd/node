// Client reviews shown in the ReviewsCarousel (homepage + portfolio).
//
// REPLACE the samples below with your real reviews. Only ship genuine quotes
// with real attribution. For Fiverr/external reviews there is no official
// embed, so transcribe the text and credit it: set `source` to where it came
// from (e.g. 'Fiverr', 'Instagram', 'Direct') and `author` to their name/handle.
// Keep quotes short (1-2 lines) so the cards stay tidy.
export interface Testimonial {
  quote: string;
  author: string;
  source: string; // 'Fiverr' | 'Instagram' | 'Direct' | ...
  rating: number; // 1-5
}

export const testimonials: Testimonial[] = [
  { quote: 'Super professional, attentive to detail and clearly understands UKG/bass music. The track came back punchy, clean and club-ready. Really appreciated the communication and flexibility throughout. Looking forward to working together again.', author: 'brg_mzk (Italy)', source: 'Fiverr', rating: 5 },
  { quote: 'James was a pleasure to work with and delivered the perfect extended version for my track. Would recommend everyone to use him.', author: 'A-Niche (UK)', source: 'Direct', rating: 5 },
];
