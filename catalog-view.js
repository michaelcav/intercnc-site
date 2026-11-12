// Shared product markup keeps the header submenu and category dialog consistent.
window.renderMachineCatalog = (root, category) => {
  const group=categories.find(c=>c[0]===category);
  if(!group)return;
  root.querySelectorAll('[data-mega-category]').forEach(button=>{
    const active=button.dataset.megaCategory===category;
    button.classList.toggle('active',active);
    button.setAttribute('aria-pressed',String(active));
  });
  const items=products.filter(p=>p.filter===category);
  root.querySelector('.mega-products').innerHTML=items.length
    ?items.map(p=>`<article class="mega-product"><a class="mega-product-image" href="${productHref(p)}"><h3>${p.model}</h3><img src="assets/${p.image}" srcset="assets/${p.image.replace('.webp','-480.webp')} 480w, assets/${p.image.replace('.webp','-800.webp')} 800w, assets/${p.image} 1000w" sizes="(max-width: 760px) 90vw, 24vw" decoding="async" alt="${p.category} ${p.model}"></a><p>${p.category}</p><div class="mega-product-actions"><a href="${productHref(p)}">Conhecer máquina</a><a href="${productHref(p)}#contato">Cotação</a></div></article>`).join('')
    :`<div class="mega-consult"><img src="assets/${group[2]}" srcset="assets/${group[2].replace('.webp','-480.webp')} 480w, assets/${group[2].replace('.webp','-800.webp')} 800w, assets/${group[2]} 1000w" sizes="(max-width: 760px) 90vw, 24vw" decoding="async" alt="${group[1]}"><div><span class="mega-label">SOLUÇÕES PARA SUA OPERAÇÃO</span><h3>${group[1]}</h3><p>Converse com nossa equipe para conhecer os modelos e as configurações disponíveis.</p><a class="text-link mega-quote" href="#contato">Consultar modelos</a></div></div>`;
  root.querySelector('.mega-quote')?.addEventListener('click',()=>{
    const field=document.querySelector('#machine');if(field)field.value=category==='inclinado'?'Torno CNC inclinado':'Torno convencional';
  });
  window.lucide?.createIcons();
};
