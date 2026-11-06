(() => {
  const root = document.getElementById('zemora-full-case');
  if (!root) return;
  const brand = [
    'Analytical pages gather and become steps, making the shift from evidence to strategy visible within one continuous scene.',
    'Matte surfaces, soft directional light and believable shadows give the conceptual scene a physical quality.',
    'Muted blue connects the analytical pages with the structure; coral marks selected steps within the transformation.'
  ];
  const steps = [
    ['“Single message the viewer should retain”', 'The brief separates the message, tension, desired shift and outcome before specifying the format and exact copy.'],
    ['“A familiar element and one unexpected but meaningful relationship.”', 'The guidance connects conceptual clarity with material, light, palette and composition, while allowing different subjects and media.'],
    ['“Repair the central relationship first.”', 'Review criteria include meaning, hierarchy, brand coherence, text accuracy and the intended format. These are production checks, not measured audience outcomes.']
  ];
  const web = [
    ['Visitor-led entry points', 'The three cards begin with a recognizable situation: launching, correcting or building better systems.'],
    ['A clear reading order', 'A section label, one main heading and parallel cards give the information a consistent hierarchy.'],
    ['Describe the change', 'Each route ends with “What changes”, connecting the visitor’s situation to the focus of the work.']
  ];
  function select(attribute, value) {
    root.querySelectorAll(`[${attribute}]`).forEach(button => button.setAttribute('aria-pressed', String(button.getAttribute(attribute) === value)));
  }
  root.querySelectorAll('[data-brand]').forEach(button => button.addEventListener('click', () => {
    select('data-brand', button.dataset.brand);
    root.querySelector('#zf-brand-note').textContent = brand[Number(button.dataset.brand)];
  }));
  root.querySelectorAll('[data-step]').forEach(button => button.addEventListener('click', () => {
    select('data-step', button.dataset.step);
    const [quote, note] = steps[Number(button.dataset.step)];
    root.querySelector('#zf-quote').textContent = quote;
    root.querySelector('#zf-step-note').textContent = note;
  }));
  root.querySelectorAll('[data-web]').forEach(button => button.addEventListener('click', () => {
    select('data-web', button.dataset.web);
    const index = Number(button.dataset.web);
    root.querySelector('#zf-web-number').textContent = String(index + 1).padStart(2, '0');
    root.querySelector('#zf-web-heading').textContent = web[index][0];
    root.querySelector('#zf-web-copy').textContent = web[index][1];
  }));
})();
