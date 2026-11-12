(() => {
  const main=document.querySelector('.home-page main');
  if(!main)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const trust=main.querySelector('.trust-strip'), about=main.querySelector('#sobre');
  if(trust&&about){
    const stage=document.createElement('div');stage.className='about-stage';
    about.before(stage);stage.append(trust,about);
  }
  const layers=[...main.children].filter(el=>el.matches('.hero,.machine-story,.category-scene,.about-stage,.contact'));
  const entries=layers.map((layer,index)=>{
    const anchor=document.createElement('div');anchor.className='home-layer-anchor';anchor.setAttribute('aria-hidden','true');
    layer.before(anchor);layer.dataset.homeLayer=String(index);
    layer.style.setProperty('--layer-order',index+1);
    const shade=document.createElement('div');shade.className='home-layer-shade';shade.setAttribute('aria-hidden','true');
    // Dynamic sections replace their children at initialization, so append later.
    requestAnimationFrame(()=>layer.append(shade));
    return {layer,anchor,shade};
  });
  window.homeSectionTop=element=>{
    const layer=element.closest('[data-home-layer]');
    return entries.find(entry=>entry.layer===layer)?.anchor.offsetTop??element.offsetTop;
  };
  let tween, busy=false, consumed=false, lastWheel=0, pending=false;
  function update(){
    pending=false;
    entries.forEach((entry,i)=>{
      entry.layer.style.setProperty('--layer-top',`${Math.min(0,innerHeight-entry.layer.offsetHeight)}px`);
      const next=entries[i+1];
      const cover=next?Math.max(0,Math.min(1,(scrollY+innerHeight-next.anchor.offsetTop)/innerHeight)):0;
      entry.layer.style.setProperty('--layer-cover',cover);
    });
  }
  function requestUpdate(){if(!pending){pending=true;requestAnimationFrame(update);}}
  const resize=new ResizeObserver(requestUpdate);entries.forEach(entry=>resize.observe(entry.layer));
  addEventListener('scroll',requestUpdate,{passive:true});addEventListener('resize',requestUpdate);
  function applyPreference(){
    tween?.kill();busy=false;window.homeScrolling=false;
    main.classList.toggle('home-layers',!reduced.matches);
    update();window.ScrollTrigger?.refresh();
  }
  function moveTo(top){
    if(reduced.matches||!window.gsap){scrollTo({top,behavior:'instant'});return;}
    tween?.kill();busy=true;window.homeScrolling=true;
    const position={y:scrollY};
    tween=gsap.to(position,{y:top,duration:1.05,ease:'power3.inOut',onUpdate:()=>{
      scrollTo({top:position.y,behavior:'instant'});
    },onComplete:()=>{busy=false;window.homeScrolling=false;window.ScrollTrigger?.update();},onInterrupt:()=>{busy=false;window.homeScrolling=false;}});
  }
  window.homeScrollToSection=element=>moveTo(window.homeSectionTop(element));
  const cancel=()=>{tween?.kill();busy=false;window.homeScrolling=false;};
  window.homeCancelScroll=cancel;
  document.addEventListener('catalog:open',cancel);
  document.addEventListener('navigation:close',cancel);
  document.querySelector('.menu-toggle').addEventListener('click',cancel);
  function wheel(event){
    if(reduced.matches||event.defaultPrevented||event.ctrlKey||Math.abs(event.deltaY)<2||Math.abs(event.deltaX)>Math.abs(event.deltaY))return;
    if(main.inert||document.querySelector('dialog[open]')||document.querySelector('.header').matches('.mega-open,.menu-open'))return;
    if(event.target.closest('input,select,textarea,[contenteditable],.mega-categories,.showroom-steps'))return;
    if(busy){event.preventDefault();return;}
    const now=performance.now(),quiet=now-lastWheel>170;
    lastWheel=now;if(quiet)consumed=false;
    const index=entries.findLastIndex(entry=>scrollY>=entry.anchor.offsetTop-3);
    if(index<0)return;
    const current=entries[index], direction=event.deltaY>0?1:-1;
    const start=current.anchor.offsetTop, end=start+Math.max(0,current.layer.offsetHeight-innerHeight);
    if(direction>0&&scrollY<end-3||direction<0&&scrollY>start+3)return;
    const next=entries[index+direction];if(!next)return;
    if(consumed){event.preventDefault();return;}
    event.preventDefault();consumed=true;
    const target=direction>0?next.anchor.offsetTop:next.anchor.offsetTop+Math.max(0,next.layer.offsetHeight-innerHeight);
    moveTo(target);
  }
  addEventListener('wheel',wheel,{passive:false});
  let touchStart=null,touchConsumed=false;
  addEventListener('touchstart',event=>{
    touchStart=event.touches.length===1?{x:event.touches[0].clientX,y:event.touches[0].clientY}:null;
    touchConsumed=false;
  },{passive:true});
  addEventListener('touchmove',event=>{
    if(!touchStart||event.touches.length!==1||event.defaultPrevented||reduced.matches)return;
    const deltaY=touchStart.y-event.touches[0].clientY,deltaX=touchStart.x-event.touches[0].clientX;
    if(Math.abs(deltaY)<40||Math.abs(deltaX)>Math.abs(deltaY))return;
    if(touchConsumed){event.preventDefault();return;}
    wheel({deltaY,deltaX,target:event.target,ctrlKey:false,defaultPrevented:false,preventDefault:()=>event.preventDefault()});
    if(busy)touchConsumed=true;
  },{passive:false});
  document.addEventListener('click',event=>{
    const link=event.target.closest('a[href]');if(!link||event.defaultPrevented||event.metaKey||event.ctrlKey||event.shiftKey||link.target==='_blank')return;
    const url=new URL(link.href,location.href);
    if(url.origin!==location.origin||!url.hash||!(url.pathname===location.pathname||/\/(index\.html)?$/.test(url.pathname)&&/\/(index\.html)?$/.test(location.pathname)))return;
    const element=document.getElementById(decodeURIComponent(url.hash.slice(1)));
    if(!element?.closest('[data-home-layer]'))return;
    event.preventDefault();moveTo(window.homeSectionTop(element));
    history.replaceState(null,'',url.hash);
  });
  reduced.addEventListener('change',applyPreference);applyPreference();
})();
