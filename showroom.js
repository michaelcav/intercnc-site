(() => {
  const story = document.querySelector('.machine-story');
  if (!story) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let currentCategory = 'centro', cleanup, activeIndex = 0, navigate = () => false;
  const count = n => String(n).padStart(2,'0');
  const headings = {centro:'Precisão sem limites.',fresadora:'Versatilidade para criar.',paralelo:'Força em cada movimento.'};
  story.innerHTML = `<div class="showroom"><div class="showroom-grid" aria-hidden="true"></div><div class="showroom-orbit" aria-hidden="true"></div><div class="showroom-top"><span class="eyebrow">Centro de usinagem</span><span class="showroom-edition">INTERCNC / COLLECTION</span></div><div class="showroom-slides" id="showroom-models"></div><div class="showroom-bottom"><div class="showroom-steps" role="group" aria-label="Categorias de máquinas">${categories.map((c,i) => `<button type="button" class="showroom-step ${i===0?'active':''}" data-story-category="${c[0]}" aria-controls="showroom-models" aria-pressed="${i===0}"><span>${count(i+1)}</span><span class="showroom-step-track"><i></i></span><span>${c[1]}</span><svg class="category-frame" viewBox="0 0 200 60" preserveAspectRatio="none" aria-hidden="true"><rect x="1" y="1" width="198" height="58" pathLength="100" vector-effect="non-scaling-stroke"></rect></svg></button>`).join('')}</div><div class="showroom-navigation"><button type="button" class="showroom-prev" aria-label="Máquina anterior"><i data-lucide="arrow-left"></i></button><span class="showroom-count" aria-label="Máquina atual">01 / 03</span><button type="button" class="showroom-next" aria-label="Próxima máquina"><i data-lucide="arrow-right"></i></button></div></div></div>`;
  const slideRoot = story.querySelector('.showroom-slides');
  const buttons = [...story.querySelectorAll('[data-story-category]')];
  function render(category, reposition = false) {
    if(reposition)window.homeCancelScroll?.();
    cleanup?.(); cleanup = undefined;
    currentCategory = category; activeIndex = 0;
    const categoryData = categories.find(c => c[0]===category);
    const items = products.filter(p => p.filter===category);
    story.dataset.category = category;
    story.querySelector('.showroom-top .eyebrow').textContent = categoryData[1];
    buttons.forEach(button => {
      const active=button.dataset.storyCategory===category;
      button.classList.toggle('active',active);
      button.setAttribute('aria-pressed',String(active));
      button.querySelector('i').style.transform='scaleX(0)';
    });
    slideRoot.innerHTML = items.length ? items.map((p,i) => `<article class="showroom-slide ${i===0?'is-active':''}" data-slide="${i}" data-model="${p.id}" ${i?'inert aria-hidden="true"':'aria-hidden="false"'}><span class="showroom-watermark" aria-hidden="true">${p.model}</span><div class="showroom-copy"><span class="showroom-category">${count(i+1)} / ${p.category}</span><h2>${p.model}</h2><h3>${headings[category]||p.headline}</h3><p>${p.description}</p><a class="showroom-cta" href="${productHref(p)}"><span>Conheça a máquina</span><span class="showroom-cta-icon"><i data-lucide="arrow-up-right"></i></span></a></div><div class="showroom-machine"><div class="showroom-platform" aria-hidden="true"></div><img loading="lazy" src="assets/${p.image}" srcset="assets/${p.image.replace('.webp','-480.webp')} 480w, assets/${p.image.replace('.webp','-800.webp')} 800w, assets/${p.image} 1000w" sizes="(max-width: 760px) 90vw, 55vw" decoding="async" alt="${p.category} ${p.model}" width="1000" height="1000"></div><div class="showroom-specs">${p.stats.map(s=>`<div><strong>${s[0]}</strong><span>${s[1]}</span></div>`).join('')}</div></article>`).join('') : `<article class="showroom-slide showroom-consult is-active"><span class="showroom-watermark" aria-hidden="true">INTERCNC</span><div class="showroom-copy"><span class="showroom-category">${categoryData[1]}</span><h2>Seu próximo<br>projeto.</h2><h3>Encontre a configuração ideal.</h3><p>Consulte nossa equipe para conhecer os modelos e as configurações disponíveis nesta categoria.</p><a class="showroom-cta" href="#contato"><span>Consultar modelos</span><span class="showroom-cta-icon"><i data-lucide="arrow-up-right"></i></span></a></div><div class="showroom-machine"><div class="showroom-platform" aria-hidden="true"></div><img loading="lazy" src="assets/${categoryData[2]}" srcset="assets/${categoryData[2].replace('.webp','-480.webp')} 480w, assets/${categoryData[2].replace('.webp','-800.webp')} 800w, assets/${categoryData[2]} 1000w" sizes="(max-width: 760px) 90vw, 55vw" decoding="async" alt="Linha de ${categoryData[1]}" width="1000" height="1000"></div></article>`;
    story.querySelector('.showroom-count').textContent=items.length?`01 / ${count(items.length)}`:'SOB CONSULTA';
    slideRoot.querySelector('.showroom-consult .showroom-cta')?.addEventListener('click',()=>{
      const field=document.querySelector('#machine');if(field)field.value=category==='inclinado'?'Torno CNC inclinado':'Torno convencional';
    });
    window.lucide?.createIcons();
    const animated = !reduced.matches && window.gsap && window.ScrollTrigger;
    story.classList.toggle('story-static',!animated);
    story.style.height=animated?'100svh':'';
    const slides=[...slideRoot.querySelectorAll('.showroom-slide')];
    function setActive(index) {
      activeIndex=index;
      slides.forEach((slide,i)=>{
        slide.inert=i!==index;
        slide.setAttribute('aria-hidden',String(i!==index));
        slide.classList.toggle('is-active',i===index);
      });
      if(items.length)story.querySelector('.showroom-count').textContent=`${count(index+1)} / ${count(items.length)}`;
    }
    setActive(0);
    if(reposition)window.scrollTo({top:(window.homeSectionTop?.(story)??story.offsetTop),behavior:'instant'});
    if(!animated){
      navigate=()=>false;
      story.querySelector('.showroom-prev').disabled=true;
      story.querySelector('.showroom-next').disabled=true;
      slides.forEach(slide=>{slide.inert=false;slide.setAttribute('aria-hidden','false');});
      return;
    }
    cleanup=window.createShowroomMotion({story,slides,buttons,category,setActive,onNavigate:handler=>{navigate=handler;}});
    if(reposition){window.scrollTo({top:(window.homeSectionTop?.(story)??story.offsetTop),behavior:'instant'});ScrollTrigger.update();}
  }
  story.querySelector('.showroom-prev').addEventListener('click',()=>navigate(-1));
  story.querySelector('.showroom-next').addEventListener('click',()=>navigate(1));

  buttons.forEach(button=>button.addEventListener('click',()=>{
    if(button.dataset.storyCategory!==currentCategory)render(button.dataset.storyCategory,true);
  }));
  render('centro');
  document.addEventListener('showroom:category',event=>{
    const category=event.detail?.category;
    if(categories.some(c=>c[0]===category))render(category,true);
  });
  reduced.addEventListener('change',()=>render(currentCategory));
})();
