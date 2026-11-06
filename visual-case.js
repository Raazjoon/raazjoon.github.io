document.querySelectorAll('[data-decisions]').forEach(section => {
  const choices = [...section.querySelectorAll('[data-panel]')];
  function select(active) {
    choices.forEach(choice => {
      const selected = choice === active;
      choice.setAttribute('aria-pressed', String(selected));
      document.getElementById(choice.dataset.panel).hidden = !selected;
    });
  }
  choices.forEach(choice => choice.addEventListener('click', () => select(choice)));
  select(choices[0]);
});

document.querySelectorAll('[data-sequence]').forEach(opener => {
  const dialog = document.getElementById(opener.dataset.sequence);
  const track = dialog.querySelector('.carousel-track');
  opener.addEventListener('click', () => {
    dialog.showModal();
    track.scrollLeft = 0;
    dialog.querySelector('.dialog-close').focus();
  });
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => opener.focus());
});

const landing = document.querySelector('.landing-window');
if (landing) {
  document.querySelectorAll('[data-landing-jump]').forEach(button => {
    button.addEventListener('click', () => {
      const top = landing.scrollHeight * Number(button.dataset.landingJump);
      landing.scrollTo({top, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
    });
  });
}
