(() => {
  if(!document.body.classList.contains('product-premium'))return;
  const {product,features}=window.productLandingData;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const tabs=[...document.querySelectorAll('[data-feature]')];
  function select(button){
    tabs.forEach(tab=>{tab.setAttribute('aria-selected',String(tab===button));tab.tabIndex=tab===button?0:-1;});
    const feature=features[button.dataset.feature],panel=document.querySelector('#lp-feature-content');
    panel.setAttribute('aria-labelledby',button.id);
    panel.querySelector('span').textContent=feature.eyebrow;panel.querySelector('h3').textContent=feature.title;panel.querySelector('p').textContent=feature.text;
    document.querySelector('.lp-tech-visual').dataset.mode=button.dataset.feature;
    if(window.gsap&&!reduced.matches)gsap.fromTo(panel,{y:12,opacity:0},{y:0,opacity:1,duration:.4});
  }
  tabs.forEach((tab,i)=>{
    tab.addEventListener('click',()=>select(tab));
    tab.addEventListener('keydown',event=>{
      if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
      event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(i+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;
      select(tabs[next]);tabs[next].focus();
    });
  });
  const imageDialog=document.querySelector('.lp-image-dialog');
  document.querySelectorAll('.lp-image-expand,.lp-gallery-expand').forEach(button=>button.addEventListener('click',()=>imageDialog.showModal()));
  imageDialog.querySelector('button').addEventListener('click',()=>imageDialog.close());
  imageDialog.addEventListener('click',event=>{if(event.target===imageDialog)imageDialog.close();});
  document.querySelector('.lp-export').addEventListener('click',()=>{
    const csv='\uFEFF'+[['Especificação',product.model],...product.specs].map(row=>row.map(cell=>'"'+cell.replaceAll('"','""')+'"').join(';')).join('\r\n');
    const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'}));
    const link=document.createElement('a');link.href=url;link.download=`InterCNC-${product.model}-ficha-tecnica.csv`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  const video=document.querySelector('.lp-film video');let visible=false;
  const updateVideo=()=>{if(visible&&!reduced.matches)video.play().catch(()=>{});else video.pause();};
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;updateVideo();},{threshold:.1}).observe(video);
  reduced.addEventListener('change',updateVideo);
  const track=document.querySelector('.lp-gallery-track');
  const cards=[...track.querySelectorAll('.lp-gallery-card')];
  const dots=[...document.querySelectorAll('[data-gallery-to]')];
  let galleryIndex=0,drag=null;
  function updateGallery(){
    const center=track.scrollLeft+track.clientWidth/2;
    galleryIndex=cards.reduce((best,card,i)=>Math.abs(card.offsetLeft+card.offsetWidth/2-center)<Math.abs(cards[best].offsetLeft+cards[best].offsetWidth/2-center)?i:best,0);
    dots.forEach((dot,i)=>{dot.classList.toggle('active',i===galleryIndex);dot.setAttribute('aria-current',String(i===galleryIndex));});
    document.querySelector('.lp-gallery-count').textContent=`0${galleryIndex+1} / 03`;
  }
  function galleryTo(index){
    const card=cards[(index+cards.length)%cards.length];
    track.scrollTo({left:card.offsetLeft-(track.clientWidth-card.offsetWidth)/2,behavior:reduced.matches?'instant':'smooth'});
  }
  document.querySelector('.lp-gallery-prev').addEventListener('click',()=>galleryTo(galleryIndex-1));
  document.querySelector('.lp-gallery-next').addEventListener('click',()=>galleryTo(galleryIndex+1));
  dots.forEach(dot=>dot.addEventListener('click',()=>galleryTo(Number(dot.dataset.galleryTo))));
  track.addEventListener('scroll',updateGallery,{passive:true});
  track.addEventListener('keydown',event=>{if(['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();galleryTo(galleryIndex+(event.key==='ArrowRight'?1:-1));}});
  track.addEventListener('pointerdown',event=>{if(event.pointerType!=='mouse'||event.target.closest('button'))return;drag={x:event.clientX,left:track.scrollLeft};track.setPointerCapture(event.pointerId);track.classList.add('is-dragging');});
  track.addEventListener('pointermove',event=>{if(drag)track.scrollLeft=drag.left-(event.clientX-drag.x);});
  const stopDrag=()=>{drag=null;track.classList.remove('is-dragging');};
  track.addEventListener('pointerup',stopDrag);track.addEventListener('pointercancel',stopDrag);
  addEventListener('resize',updateGallery);updateGallery();
  if(window.gsap&&!reduced.matches){
    gsap.from('.lp-hero-copy>*',{opacity:0,y:30,stagger:.1,duration:.8,ease:'power3.out'});
    gsap.from('.lp-hero-machine',{opacity:0,x:70,duration:1.2,ease:'power3.out'});
    const reveals=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){gsap.fromTo(entry.target,{y:35,opacity:0},{y:0,opacity:1,duration:.8,ease:'power2.out'});reveals.unobserve(entry.target);}}),{threshold:.12});
    document.querySelectorAll('.lp-intro-content,.lp-tech-copy,.lp-capacity>div:first-child,.lp-spec-heading,.lp-gallery-heading,.lp-workspace,.lp-solution-features-heading,.lp-resource-list>div,.lp-spec-highlights>div,.lp-quote-form-heading').forEach(el=>reveals.observe(el));
    document.querySelectorAll('.lp-spec-group').forEach(group=>group.addEventListener('toggle',()=>{
      if(group.open&&!reduced.matches)gsap.fromTo(group.querySelector('table'),{opacity:0,y:8},{opacity:1,y:0,duration:.3,clearProps:'transform,opacity'});
    }));
    if(window.ScrollTrigger){gsap.registerPlugin(ScrollTrigger);gsap.to('.lp-film video',{yPercent:10,ease:'none',scrollTrigger:{trigger:'.lp-film',start:'top bottom',end:'bottom top',scrub:true}});}
  }
  window.lucide?.createIcons();
})();
