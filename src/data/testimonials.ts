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
  { quote: 'Fast turnaround and the master translated perfectly on every system. Booking again.', author: 'SAMPLE — replace', source: 'Fiverr', rating: 5 },
  { quote: 'Took my rough mix and made it sound like a proper release. Exactly the reference I sent.', author: 'SAMPLE — replace', source: 'Fiverr', rating: 5 },
  { quote: 'Really clear feedback on the arrangement, not just the mix. Helped me finish the track.', author: 'SAMPLE — replace', source: 'Direct', rating: 5 },
  { quote: 'Loudness and low end are exactly where I wanted them. Two revisions, no fuss.', author: 'SAMPLE — replace', source: 'Instagram', rating: 5 },
];
