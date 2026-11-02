document.documentElement.classList.add('js');

document.querySelectorAll('[data-carousel]').forEach(carousel => {
  const track = carousel.querySelector('.carousel-track');
  const back = carousel.querySelector('[data-carousel-prev]');
  const forward = carousel.querySelector('[data-carousel-next]');
  const update = () => {
    back.disabled = track.scrollLeft < 2;
    forward.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 2;
  };
  const move = direction => {
    const slides = Array.from(track.children);
    const step = slides[1].offsetLeft - slides[0].offsetLeft;
    track.scrollBy({left: direction * step, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
  };
  back.addEventListener('click', () => move(-1));
  forward.addEventListener('click', () => move(1));
  track.addEventListener('scroll', update, {passive: true});
  new ResizeObserver(update).observe(track);
  update();
});

const toggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.nav-links');
function closeMenu(returnFocus = false) {
  if (!toggle || !nav) return;
  toggle.setAttribute('aria-expanded', 'false');
  toggle.textContent = 'Menu';
  nav.classList.remove('is-open');
  if (returnFocus) toggle.focus();
}
toggle?.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') !== 'true';
  toggle.setAttribute('aria-expanded', String(open));
  toggle.textContent = open ? 'Close menu' : 'Menu';
  nav.classList.toggle('is-open', open);
});
nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMenu()));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && toggle?.getAttribute('aria-expanded') === 'true') closeMenu(true);
});
window.matchMedia('(min-width: 761px)').addEventListener('change', event => {
  if (event.matches) closeMenu();
});

const copyButton = document.querySelector('[data-copy-email]');
const copyStatus = document.querySelector('[data-copy-status]');
copyButton?.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText('razieeslami@gmail.com');
    copyStatus.textContent = 'Email address copied.';
    copyButton.textContent = 'Copied';
  } catch {
    const address = document.querySelector('.email-address');
    const range = document.createRange();
    range.selectNodeContents(address);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    copyStatus.textContent = 'The address is selected. Use your device’s copy command.';
  }
});

const dialog = document.querySelector('#image-viewer');
const viewerImage = dialog?.querySelector('.lightbox-image');
const viewerCaption = dialog?.querySelector('.lightbox-caption');
const viewerCount = dialog?.querySelector('.lightbox-count');
const previous = dialog?.querySelector('[data-previous]');
const next = dialog?.querySelector('[data-next]');
let activeGroup = [];
let activeIndex = 0;
let opener;

function showImage(index) {
  if (!activeGroup.length) return;
  activeIndex = (index + activeGroup.length) % activeGroup.length;
  const source = activeGroup[activeIndex];
  viewerImage.src = source.dataset.full;
  dialog.querySelector('[data-original]').href = source.dataset.full;
  viewerImage.alt = source.querySelector('img').alt;
  viewerCaption.textContent = source.dataset.caption || viewerImage.alt;
  viewerCount.textContent = `${activeIndex + 1} / ${activeGroup.length}`;
  previous.disabled = next.disabled = activeGroup.length === 1;
}
document.querySelectorAll('[data-full]').forEach(button => {
  button.addEventListener('click', () => {
    opener = button;
    activeGroup = Array.from(document.querySelectorAll('[data-full]'))
      .filter(candidate => candidate.dataset.group === button.dataset.group);
    showImage(activeGroup.indexOf(button));
    dialog.showModal();
    dialog.querySelector('.dialog-close').focus();
  });
});
dialog?.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
previous?.addEventListener('click', () => showImage(activeIndex - 1));
next?.addEventListener('click', () => showImage(activeIndex + 1));
dialog?.addEventListener('keydown', event => {
  if (event.key === 'ArrowRight') { event.preventDefault(); showImage(activeIndex + 1); }
  if (event.key === 'ArrowLeft') { event.preventDefault(); showImage(activeIndex - 1); }
});
dialog?.addEventListener('click', event => {
  if (event.target === dialog) {
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
  }
});
dialog?.addEventListener('close', () => {
  viewerImage.removeAttribute('src');
  opener?.focus();
});
