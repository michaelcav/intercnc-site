(() => {
  const footer=document.querySelector('.site-footer');
  if(!footer)return;
  if(document.body.classList.contains('home-page'))footer.id='contato';
  const button=document.createElement('button');
  button.className='back-to-top';button.type='button';button.setAttribute('aria-label','Voltar ao topo');
  button.innerHTML='<svg class="top-progress" viewBox="0 0 60 60" aria-hidden="true"><circle cx="30" cy="30" r="27"></circle></svg><i data-lucide="arrow-up"></i>';
  document.body.append(button);
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const update=()=>{
    const progress=scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight);
    button.classList.toggle('is-visible',scrollY>300);
    button.querySelector('circle').style.strokeDashoffset=String(170*(1-progress));
  };
  button.addEventListener('click',()=>{
    window.homeCancelScroll?.();
    if(document.body.classList.contains('home-page')&&window.homeScrollToSection)homeScrollToSection(document.querySelector('.hero'));
    else scrollTo({top:0,behavior:reduced.matches?'instant':'smooth'});
  });
  addEventListener('scroll',update,{passive:true});addEventListener('resize',update);update();
  window.lucide?.createIcons();
})();
