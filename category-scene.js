(() => {
  const scene = document.querySelector('.category-scene');
  if (!scene) return;
  const descriptions = {
    centro: 'Fresamento, furação e usinagem CNC. Precisão para transformar o seu projeto.',
    fresadora: 'Versatilidade para ferramentaria, manutenção e fabricação de peças.',
    convencional: 'Controle e robustez para os desafios diários da sua operação.',
    paralelo: 'Soluções CNC para eixos e peças longas. Capacidade em cada movimento.',
    inclinado: 'Conheça as configurações de tornos CNC de barramento inclinado.'
  };
  const labels = {centro:'Centro de usinagem',fresadora:'Fresadora',convencional:'Torno convencional',paralelo:'Torno CNC paralelo',inclinado:'Torno CNC inclinado'};
  scene.innerHTML = `<video class="category-scene-video" autoplay muted loop playsinline preload="none" poster="assets/category-poster.jpg" aria-hidden="true"><source data-src="assets/categorias-usinagem.mp4" type="video/mp4"><source data-src="assets/categorias-usinagem.webm" type="video/webm"></video><div class="category-scene-preview" aria-hidden="true">${categories.map(c=>`<img loading="lazy" class="category-scene-photo" data-preview="${c[0]}" src="assets/${c[2]}" srcset="assets/${c[2].replace('.webp','-480.webp')} 480w, assets/${c[2].replace('.webp','-800.webp')} 800w, assets/${c[2]} 1000w" sizes="(max-width: 760px) 90vw, 55vw" decoding="async" alt="">`).join('')}</div><div class="category-scene-shade" aria-hidden="true"></div><div class="category-scene-heading"><div class="eyebrow">Cinco caminhos para evoluir</div><h2 id="category-scene-title">Qual é o seu próximo <em>desafio?</em></h2><p>Encontre a tecnologia que acompanha a sua ambição.</p></div><div class="category-scene-rail">${categories.map((c,i)=>`<a class="category-lane" href="#category-machine-dialog" aria-haspopup="dialog" aria-controls="category-machine-dialog" data-showroom-category="${c[0]}"><span class="category-lane-number">0${i+1} / INTERCNC</span><div class="category-lane-content"><span class="category-lane-line" aria-hidden="true"></span><h3>${labels[c[0]]}</h3><p>${descriptions[c[0]]}</p><span class="category-lane-cta">Explorar categoria <i data-lucide="arrow-up-right"></i></span></div></a>`).join('')}</div><span class="category-scene-hint">CINCO SEGMENTOS. INFINITAS POSSIBILIDADES.</span>`;
  window.lucide?.createIcons();
  scene.querySelectorAll('[data-showroom-category]').forEach(link=>link.addEventListener('click',event=>{
    event.preventDefault();
    document.dispatchEvent(new CustomEvent('catalog:open',{detail:{category:link.dataset.showroomCategory,opener:link}}));
  }));
  const lanes=[...scene.querySelectorAll('[data-showroom-category]')];
  const preview=category=>{
    scene.classList.toggle('has-category-preview',!!category);
    scene.querySelectorAll('[data-preview]').forEach(image=>image.classList.toggle('is-active',image.dataset.preview===category));
  };
  const hover=matchMedia('(hover:hover)');
  lanes.forEach(link=>{
    link.addEventListener('pointerenter',()=>{if(hover.matches)preview(link.dataset.showroomCategory);});
    link.addEventListener('focus',()=>preview(link.dataset.showroomCategory));
  });
  scene.addEventListener('pointerleave',()=>preview(null));
  scene.addEventListener('focusout',()=>{requestAnimationFrame(()=>{if(!scene.contains(document.activeElement))preview(null);});});
  const video=scene.querySelector('video');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let visible=false;
  const update=()=>{if(visible&&!reduced.matches)video.play().catch(()=>{});else video.pause();};
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;update();},{threshold:.05});
  observer.observe(scene);
  reduced.addEventListener('change',update);
})();
