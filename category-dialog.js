(() => {
  if(!document.querySelector('.category-scene'))return;
  const dialog=document.createElement('dialog');
  dialog.className='machine-dialog';
  dialog.id='category-machine-dialog';
  dialog.setAttribute('aria-labelledby','machine-dialog-title');
  dialog.innerHTML=`<div class="machine-dialog-panel"><div class="mega-sidebar"><span class="mega-label">NOSSA LINHA DE MÁQUINAS</span><div class="mega-categories" role="group" aria-label="Categorias de máquinas">${categories.map(c=>`<button type="button" data-mega-category="${c[0]}" aria-pressed="false">${c[1]}</button>`).join('')}</div><p class="machine-dialog-caption">Tecnologia para o próximo passo da sua indústria.</p></div><div class="mega-main"><div class="mega-heading"><h2 class="mega-label" id="machine-dialog-title">ENCONTRE SUA PRÓXIMA MÁQUINA</h2><button type="button" class="mega-close" aria-label="Fechar catálogo" autofocus><i data-lucide="x"></i></button></div><div class="mega-products"></div></div></div>`;
  document.body.append(dialog);
  let opener, savedOverflow, currentCategory, closeTimer;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  function requestClose(after){
    if(!dialog.open||dialog.classList.contains('is-closing'))return;
    dialog.classList.add('is-closing');
    const finish=()=>{dialog.close();dialog.classList.remove('is-closing');after?.();};
    if(reduced.matches)finish();else closeTimer=setTimeout(finish,280);
  }
  dialog.querySelectorAll('[data-mega-category]').forEach(button=>{
    const label=document.createElement('span');label.textContent=button.textContent;
    button.textContent='';button.append(label);
    const icon=document.createElement('i');icon.dataset.lucide='arrow-up-right';button.append(icon);
  });
  function select(category){
    currentCategory=category;
    dialog.dataset.category=category;
    window.renderMachineCatalog(dialog,category);
    requestAnimationFrame(()=>{
      if(!dialog.open||!matchMedia('(max-width:760px)').matches)return;
      const selected=dialog.querySelector('.mega-categories .active');
      const rail=selected.parentElement;
      const target=rail.scrollLeft+selected.getBoundingClientRect().left-rail.getBoundingClientRect().left-(rail.clientWidth-selected.clientWidth)/2;
      rail.scrollTo({left:target,behavior:'instant'});
    });
  }
  document.addEventListener('catalog:open',event=>{
    const category=event.detail?.category;
    if(!categories.some(c=>c[0]===category))return;
    clearTimeout(closeTimer);dialog.classList.remove('is-closing');
    document.dispatchEvent(new Event('navigation:close'));
    opener=event.detail?.opener||document.activeElement;
    select(category);
    if(!dialog.open){savedOverflow=document.body.style.overflow;document.body.style.overflow='hidden';dialog.showModal();}
  });
  dialog.querySelector('.mega-close').addEventListener('click',()=>requestClose());
  dialog.addEventListener('cancel',event=>{event.preventDefault();requestClose();});
  dialog.addEventListener('click',event=>{
    if(event.target===dialog){
      const bounds=dialog.getBoundingClientRect();
      if(event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom)requestClose();
    }
    const link=event.target.closest('a');
    if(link&&!event.metaKey&&!event.ctrlKey&&!event.shiftKey){
      event.preventDefault();
      requestClose(()=>{
        if(link.getAttribute('href')==='#contato')window.homeScrollToSection(document.querySelector('#contato'));
        else location.assign(link.href);
      });
    }
  });
  dialog.addEventListener('close',()=>{
    clearTimeout(closeTimer);dialog.classList.remove('is-closing');
    document.body.style.overflow=savedOverflow||'';
    if(opener?.isConnected)opener.focus({preventScroll:true});
  });
  const desktop=matchMedia('(min-width:1001px) and (hover:hover)');
  dialog.querySelectorAll('[data-mega-category]').forEach(button=>{
    const update=()=>{if(currentCategory!==button.dataset.megaCategory)select(button.dataset.megaCategory);};
    button.addEventListener('click',update);
    button.addEventListener('focus',update);
    button.addEventListener('pointerenter',()=>{if(desktop.matches)update();});
  });
  window.lucide?.createIcons();
})();
