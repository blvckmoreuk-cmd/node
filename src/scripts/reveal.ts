// Scroll reveals. Content is visible by default (no-JS safe): only elements that
// start below the fold are marked pending, then released as they scroll in.
// Opacity-only fade. Skipped entirely for reduced motion
// and on the home page (audio player / canvas / knob are never touched).
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isHome = !!document.getElementById('canvas-container');

if (!reduce && !isHome && 'IntersectionObserver' in window) {
  const targets: HTMLElement[] = [];
  document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
    if (el.dataset.reveal === 'children') targets.push(...(Array.from(el.children) as HTMLElement[]));
    else targets.push(el);
  });

  const vh = window.innerHeight;
  const pending = targets.filter((el) => {
    if (el.id === 'canvas-container' || el.id === 'knob-hit-area' || el.closest('.knob-rotation-wrapper')) return false;
    return el.getBoundingClientRect().top > vh; // keep above-the-fold content untouched (LCP)
  });

  if (pending.length) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const el = e.target as HTMLElement;
          io.unobserve(el);
          el.setAttribute('data-reveal-in', '');
          el.removeAttribute('data-reveal-pending');
        }
      },
      { threshold: 0.01, rootMargin: '0px 0px -6% 0px' },
    );
    for (const el of pending) {
      el.setAttribute('data-reveal-pending', '');
      io.observe(el);
    }
  }
}
