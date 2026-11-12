(() => {
  const trigger = document.querySelector('.machines-trigger');
  const siteHeader = document.querySelector('.header');
  if (!trigger) return;

  const panel = document.createElement('section');
  panel.id = 'machines-panel';
  panel.className = 'machines-panel';
  panel.setAttribute('aria-label', 'Explore as máquinas InterCNC');
  panel.hidden = true;
  panel.innerHTML = `<div class="mega-sidebar"><span class="mega-label">NOSSA LINHA DE MÁQUINAS</span><div class="mega-categories" role="group" aria-label="Categorias de máquinas">${categories.map(c => `<button type="button" data-mega-category="${c[0]}" aria-pressed="false">${c[1]} </button>`).join('')}</div><a class="mega-catalog" href="index.html#produtos">Explorar o portfólio completo </a></div><div class="mega-main"><div class="mega-heading"><span class="mega-label">ENCONTRE SUA PRÓXIMA MÁQUINA</span><button type="button" class="mega-close" aria-label="Fechar menu de máquinas"><i data-lucide="x"></i></button></div><div class="mega-products"></div></div>`;
  siteHeader.append(panel);
  const backdrop = document.createElement('button');
  backdrop.type = 'button';
  backdrop.className = 'mega-backdrop';
  backdrop.setAttribute('aria-label', 'Fechar menu de máquinas');
  backdrop.tabIndex = -1;
  backdrop.hidden = true;
  document.body.append(backdrop);

  let closeTimer;
  let active = 'centro';
  const desktop = matchMedia('(min-width:1001px) and (hover:hover)');
  function render(category) {
    active = category;
    window.renderMachineCatalog(panel,category);
  }

  function open() {
    document.dispatchEvent(new Event('navigation:close'));
    clearTimeout(closeTimer);
    panel.hidden = false;
    backdrop.hidden = false;
    siteHeader.classList.add('mega-open');
    trigger.setAttribute('aria-expanded', 'true');
  }
  function close(returnFocus = false) {
    clearTimeout(closeTimer);
    panel.hidden = true;
    backdrop.hidden = true;
    siteHeader.classList.remove('mega-open');
    trigger.setAttribute('aria-expanded', 'false');
    if (returnFocus) trigger.focus();
  }
  trigger.addEventListener('click', event => {
    event.preventDefault();
    panel.hidden ? open() : close();
  });
  trigger.addEventListener('pointerenter', () => { if (desktop.matches) open(); });
  panel.addEventListener('pointerenter', () => clearTimeout(closeTimer));
  siteHeader.addEventListener('pointerleave', () => { if (desktop.matches) closeTimer = setTimeout(close, 180); });
  document.querySelectorAll('.header nav a:not(.machines-trigger)').forEach(link => link.addEventListener('pointerenter', () => { if (desktop.matches) close(); }));
  panel.querySelectorAll('[data-mega-category]').forEach(button => {
    const select = () => { if (active !== button.dataset.megaCategory) render(button.dataset.megaCategory); };
    button.addEventListener('click', select);
    button.addEventListener('focus', select);
    button.addEventListener('pointerenter', () => { if (desktop.matches) select(); });
  });
  panel.querySelector('.mega-close').addEventListener('click', () => close(true));
  backdrop.addEventListener('click', () => close());
  panel.addEventListener('click', event => { if (event.target.closest('a')) close(); });
  siteHeader.querySelector('.menu-toggle').addEventListener('click', () => close());
  siteHeader.addEventListener('focusout', () => setTimeout(() => { if (!siteHeader.contains(document.activeElement)) close(); }, 0));
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !panel.hidden) close(true); });
  document.addEventListener('click', event => { if (!siteHeader.contains(event.target)) close(); });
  addEventListener('resize', () => close());
  render('centro');
})();
