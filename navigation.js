(() => {
  const toggle = document.querySelector('.menu-toggle');
  const siteHeader = document.querySelector('.header');
  const overlay = document.createElement('div');
  overlay.id = 'full-navigation';
  overlay.className = 'full-navigation';
  overlay.setAttribute('aria-label', 'Navegação principal');
  overlay.setAttribute('aria-hidden', 'true');
  overlay.inert = true;
  overlay.innerHTML = `<div class="full-navigation-inner"><div class="navigation-intro">INTERCNC / EXPLORE NOVAS POSSIBILIDADES</div><nav class="fullscreen-links" aria-label="Menu principal"><a href="index.html"><span>01</span>Início</a><a href="index.html#sobre"><span>02</span>A InterCNC</a><a href="index.html#modelos"><span>03</span>Tecnologia</a><a href="https://intercncmaquinas.com.br/blog/" target="_blank" rel="noopener"><span>04</span>Blog</a><a href="index.html#contato"><span>05</span>Contato</a></nav><aside class="navigation-contact"><span class="navigation-label">VAMOS CONSTRUIR O PRÓXIMO PASSO.</span><h2>Grandes projetos<br>começam com<br>uma conversa.</h2><a href="mailto:adm@intercnc.com.br">adm@intercnc.com.br</a><a href="tel:+5519999410294">+55 (19) 99941-0294</a><p>Indaiatuba, São Paulo<br>Atendimento em todo o Brasil.</p></aside><div class="navigation-bottom"><span>ENGENHARIA PARA IR ALÉM.</span><span>PRECISÃO EM CADA DETALHE.</span></div></div>`;
  siteHeader.after(overlay);
  let open = false;
  let previousOverflow;
  function setOpen(value, restoreFocus = false) {
    if (value === open) return;
    open = value;
    if (open) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    } else document.body.style.overflow = previousOverflow || '';
    siteHeader.classList.toggle('menu-open', open);
    overlay.classList.toggle('is-open', open);
    overlay.inert = !open;
    overlay.setAttribute('aria-hidden', String(!open));
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    toggle.querySelector('.menu-caption').textContent = open ? 'Fechar' : 'Menu';
    document.querySelector('main').inert = open;
    document.querySelector('footer').inert = open;
    if (restoreFocus) toggle.focus();
  }
  toggle.addEventListener('click', () => setOpen(!open));
  overlay.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setOpen(false)));
  siteHeader.querySelector('.logo').addEventListener('click', () => setOpen(false));
  document.addEventListener('navigation:close', () => setOpen(false));
  document.addEventListener('keydown', event => {
    if (!open) return;
    if (event.key === 'Escape') setOpen(false, true);
    if (event.key === 'Tab') {
      const focusable = [...siteHeader.querySelectorAll('a,button'), ...overlay.querySelectorAll('a')].filter(el => !el.closest('[hidden]'));
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
})();
