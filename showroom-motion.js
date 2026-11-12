// Infinite model carousel; page scrolling is handled only by the home chapters.
window.createShowroomMotion = ({story,slides,buttons,category,setActive,onNavigate}) => {
  let index=0,tween,busy=false;
  const previous=story.querySelector('.showroom-prev'),next=story.querySelector('.showroom-next');
  const context=gsap.context(()=>gsap.set(slides.slice(1),{autoAlpha:0}),story);
  function controls(){
    previous.disabled=next.disabled=busy||slides.length<2;
    story.setAttribute('aria-busy',String(busy));
  }
  function navigate(direction){
    if(busy||slides.length<2)return false;
    const target=(index+direction+slides.length)%slides.length;
    const old=slides[index],incoming=slides[target];index=target;busy=true;
    previous.classList.toggle('is-selected',direction<0);next.classList.toggle('is-selected',direction>0);
    previous.setAttribute('aria-pressed',String(direction<0));next.setAttribute('aria-pressed',String(direction>0));
    setActive(index);controls();
    buttons.find(b=>b.dataset.storyCategory===category).querySelector('i').style.transform=`scaleX(${(index+1)/slides.length})`;
    context.add(()=>{
      gsap.set(slides.filter(s=>s!==old&&s!==incoming),{autoAlpha:0});gsap.set(incoming,{autoAlpha:0});
      tween=gsap.timeline({onComplete:()=>{busy=false;controls();}})
        .to(old.querySelector('.showroom-copy'),{y:-35*direction,autoAlpha:0,duration:.3,ease:'power2.in'},0)
        .to(old.querySelector('.showroom-machine'),{x:90*direction,scale:.94,autoAlpha:0,duration:.4,ease:'power2.in'},0)
        .to(old,{autoAlpha:0,duration:.35},0).set(incoming,{autoAlpha:1},.22)
        .fromTo(incoming.querySelector('.showroom-copy'),{y:50*direction,autoAlpha:0},{y:0,autoAlpha:1,duration:.55,ease:'power3.out'},.22)
        .fromTo(incoming.querySelector('.showroom-machine'),{x:120*direction,scale:1.06,autoAlpha:0},{x:0,scale:1,autoAlpha:1,duration:.65,ease:'power3.out'},.22)
        .fromTo(incoming.querySelector('.showroom-specs'),{y:15,autoAlpha:0},{y:0,autoAlpha:1,duration:.4},.35);
      gsap.to(story.querySelector('.showroom-orbit'),{rotation:`+=${direction*28}`,duration:.9,ease:'power2.out',overwrite:true});
    });return true;
  }
  function keyboard(event){
    const start=window.homeSectionTop?.(story)??story.offsetTop;
    if(Math.abs(scrollY-start)>3||window.homeScrolling||document.querySelector('dialog[open]')||document.querySelector('main').inert||event.altKey||event.ctrlKey||event.metaKey||event.target.closest('input,select,textarea,[contenteditable],.showroom-steps'))return;
    if(!['ArrowRight','ArrowLeft'].includes(event.key))return;
    event.preventDefault();navigate(event.key==='ArrowRight'?1:-1);
  }
  previous.classList.remove('is-selected');next.classList.add('is-selected');
  previous.setAttribute('aria-pressed','false');next.setAttribute('aria-pressed','true');
  onNavigate(navigate);controls();addEventListener('keydown',keyboard);
  return ()=>{tween?.kill();context.revert();removeEventListener('keydown',keyboard);story.removeAttribute('aria-busy');};
};
