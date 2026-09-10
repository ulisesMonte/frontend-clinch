/** Smooth-scroll to an element id, accounting for the sticky header. */
export function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const header = document.querySelector('.site-header') as HTMLElement | null;
  const offset = (header?.offsetHeight ?? 72) + 12;
  const top = el.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior: 'smooth' });
}
