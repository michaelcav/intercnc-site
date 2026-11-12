const {spawn}=require('node:child_process');
const fs=require('node:fs');
const path=require('node:path');
const browser=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless','--disable-gpu','--no-first-run','--no-default-browser-check','--remote-debugging-pipe',`--user-data-dir=${path.join(__dirname,'.browser-check')}`],{stdio:['ignore','ignore','ignore','pipe','pipe'],windowsHide:true});
let next=0,buffer='';const pending=new Map();let session;
browser.stdio[4].on('data',chunk=>{buffer+=chunk.toString();let end;while((end=buffer.indexOf('\0'))>=0){const raw=buffer.slice(0,end);buffer=buffer.slice(end+1);if(!raw)continue;const message=JSON.parse(raw);if(pending.has(message.id)){const {resolve,reject}=pending.get(message.id);pending.delete(message.id);message.error?reject(new Error(JSON.stringify(message.error))):resolve(message.result);}}});
function call(method,params={},s=session){return new Promise((resolve,reject)=>{const id=++next;pending.set(id,{resolve,reject});browser.stdio[3].write(JSON.stringify({id,method,params,...(s?{sessionId:s}:{})})+'\0');});}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function evaluate(expression){const r=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw new Error(JSON.stringify(r.exceptionDetails));return r.result.value;}
function assert(ok,message){if(!ok)throw new Error(message);console.log('PASS',message);}
async function waitReady(){for(let i=0;i<150;i++){if(await evaluate('!!document.querySelector(".back-to-top")'))return;await sleep(100);}throw new Error('Page initialization timeout');}
(async()=>{
 const target=await call('Target.createTarget',{url:'about:blank'},null);
 session=(await call('Target.attachToTarget',{targetId:target.targetId,flatten:true},null)).sessionId;
 await call('Page.enable');await call('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
 let shot;
 if(process.argv.includes('--layout-only')){
  for(const width of [1440,390])for(const model of ['650','800']){
   await call('Emulation.setDeviceMetricsOverride',{width,height:width===390?844:1000,deviceScaleFactor:1,mobile:width===390});
   await call('Page.navigate',{url:`http://127.0.0.1:8080/produto-itmc-${model}.html`});await waitReady();await sleep(1350);
   assert(await evaluate('!document.querySelector(".lp-next-model") && !document.querySelector(".lp-resources")'),`Removed duplicate sections ${model}/${width}`);
   assert(await evaluate('document.querySelector(".lp-hero-figures").nextElementSibling.classList.contains("lp-button") && !document.querySelector(".lp-hero-bottom .lp-hero-figures")'),`Figures immediately precede hero CTA ${model}/${width}`);
   assert(await evaluate('document.querySelector(".lp-hero-figures").getBoundingClientRect().bottom<=document.querySelector(".lp-hero .lp-button").getBoundingClientRect().top && document.documentElement.scrollWidth<=innerWidth'),`Hero figures do not overlap CTA or overflow ${model}/${width}`);
   shot=await call('Page.captureScreenshot',{format:'png'});fs.writeFileSync(`preview-product-${model}-hero-${width}.png`,Buffer.from(shot.data,'base64'));
   await evaluate('document.querySelector(".lp-solutions").scrollIntoView({behavior:"instant"})');await sleep(700);
   assert(await evaluate('getComputedStyle(document.querySelector(".lp-solutions")).backgroundColor==="rgb(255, 255, 255)" && document.querySelectorAll(".lp-solutions .lp-resource-list>div").length===4 && !!document.querySelector(".lp-solutions .lp-workspace")'),`Unified white capacity and resources section ${model}/${width}`);
   assert(await evaluate('document.documentElement.scrollWidth<=innerWidth'),`Unified section fits viewport ${model}/${width}`);
   shot=await call('Page.captureScreenshot',{format:'png'});fs.writeFileSync(`preview-product-${model}-solutions-${width}.png`,Buffer.from(shot.data,'base64'));
  }
  console.log('Product layout QA complete');return;
 }
 if(!process.argv.includes('--mobile-only')){
 await call('Page.navigate',{url:'http://127.0.0.1:8080'});await waitReady();await sleep(1600);
 assert(await evaluate('document.querySelectorAll("main [data-home-layer]").length===3 && !document.querySelector("main #sobre") && !document.querySelector("main .contact-form")'),'Last two home sections removed');
 assert(await evaluate('getComputedStyle(document.querySelector(".site-footer")).backgroundColor==="rgb(255, 255, 255)" && document.querySelector("footer").id==="contato"'),'White footer retains home contact destination');
 await evaluate('scrollTo({top:document.querySelector("footer").offsetTop,behavior:"instant"})');await sleep(300);
 assert(await evaluate('document.querySelector(".back-to-top").classList.contains("is-visible")'),'Floating back-to-top appears after scrolling');
 shot=await call('Page.captureScreenshot',{format:'png'});fs.writeFileSync('preview-footer.png',Buffer.from(shot.data,'base64'));
 await evaluate('document.querySelector(".back-to-top").click()');await sleep(1300);
 assert(await evaluate('scrollY<3'),'Back-to-top returns home to opening');
 for(const model of ['650','800']){
  await call('Page.navigate',{url:`http://127.0.0.1:8080/produto-itmc-${model}.html`});await waitReady();await sleep(1400);
  assert(await evaluate(`document.body.classList.contains('product-premium') && document.querySelector('h1').textContent==='ITMC-${model}'`),`Customized product landing ${model}`);
  await evaluate('Promise.all([...document.images].map(i=>{i.loading="eager";return i.decode().catch(()=>{})}))');
  assert(await evaluate('[...document.images].every(i=>i.complete&&i.naturalWidth>0) && document.documentElement.scrollWidth<=innerWidth'),`All product images load, no horizontal overflow ${model}`);
  assert(await evaluate(`document.querySelector('#machine').value.includes('ITMC-${model}') && document.querySelectorAll('.lp-spec-group').length===3`),`Correct quote model and technical sections ${model}`);
  shot=await call('Page.captureScreenshot',{format:'png'});fs.writeFileSync(`preview-product-${model}.png`,Buffer.from(shot.data,'base64'));
  assert(await evaluate('!document.querySelector(".lp-navigation") && document.querySelector("main>section:nth-child(2)").classList.contains("lp-gallery")'),'No internal submenu; gallery is second chapter');
  assert(await evaluate('getComputedStyle(document.querySelector(".lp-hero .lp-button")).backgroundColor==="rgba(0, 0, 0, 0)"'),'Hero CTA has transparent background');
  await evaluate('document.querySelector(".lp-gallery").scrollIntoView({behavior:"instant"})');await sleep(300);
  assert(await evaluate('document.querySelectorAll(".lp-gallery-card").length===3'),'Three editorial carousel cards');
  shot=await call('Page.captureScreenshot',{format:'png'});fs.writeFileSync(`preview-product-${model}-gallery.png`,Buffer.from(shot.data,'base64'));
  await evaluate('document.querySelector(".lp-gallery-next").click()');await sleep(750);
  assert(await evaluate('document.querySelectorAll("[data-gallery-to]")[1].getAttribute("aria-current")==="true"'),'Gallery next arrow selects next card');
  await evaluate('document.querySelectorAll("[data-gallery-to]")[2].click()');await sleep(750);
  assert(await evaluate('document.querySelector(".lp-gallery-count").textContent==="03 / 03"'),'Gallery indicators navigate to third card');
  await evaluate('document.querySelector(".lp-gallery-next").click()');await sleep(800);
  assert(await evaluate('document.querySelector(".lp-gallery-count").textContent==="01 / 03"'),'Gallery wraps back to first card');
  await evaluate('document.querySelector(".lp-gallery-expand").click()');assert(await evaluate('document.querySelector(".lp-image-dialog").open'),'Gallery plus opens image');await evaluate('document.querySelector(".lp-image-dialog>button").click()');
  await evaluate('document.querySelector("#especificacoes").scrollIntoView({behavior:"instant"})');await sleep(700);
  assert(await evaluate('getComputedStyle(document.querySelector(".lp-specifications")).backgroundColor==="rgb(32, 36, 39)" && document.querySelectorAll(".lp-spec-highlights>div").length===3'),'Dark technical chapter with three highlighted figures');
  shot=await call('Page.captureScreenshot',{format:'png'});fs.writeFileSync(`preview-product-${model}-specs.png`,Buffer.from(shot.data,'base64'));
  await evaluate('document.querySelector("#contato").scrollIntoView({behavior:"instant"})');await sleep(300);
  assert(await evaluate('getComputedStyle(document.querySelector(".contact-form")).backgroundColor==="rgb(248, 250, 249)" && !!document.querySelector(".lp-quote-form-heading")'),'Redesigned light quotation card');
  shot=await call('Page.captureScreenshot',{format:'png'});fs.writeFileSync(`preview-product-${model}-quote.png`,Buffer.from(shot.data,'base64'));
  await evaluate('document.querySelector("#tecnologia").scrollIntoView({behavior:"instant"})');await sleep(700);shot=await call('Page.captureScreenshot',{format:'png'});fs.writeFileSync(`preview-product-${model}-technology.png`,Buffer.from(shot.data,'base64'));await evaluate('document.querySelector("[data-feature=area]").click()');
  assert(await evaluate(`document.querySelector('#lp-feature-content h3').textContent.includes('${model==='650'?'750':'1.000'}') && document.querySelector('[data-feature=area]').getAttribute('aria-selected')==='true'`),`Interactive work area tab ${model}`);
  await evaluate('document.querySelector("[data-feature=ferramentas]").click()');
  assert(await evaluate(`document.querySelector('#lp-feature-content h3').textContent.includes('${model==='650'?'16':'24'}')`),`Tooling content reflects model ${model}`);
  await evaluate('document.querySelector(".lp-image-expand").click()');
  assert(await evaluate('document.querySelector(".lp-image-dialog").open'),`Image enlargement ${model}`);
  await evaluate('document.querySelector(".lp-image-dialog>button").click()');
  await evaluate('document.querySelectorAll(".lp-spec-group")[1].open=true');
  assert(await evaluate('document.querySelectorAll(".lp-spec-group")[1].querySelectorAll("tr").length>=3'),`Technical accordion content ${model}`);
  await evaluate(`(()=>{const originalClick=HTMLAnchorElement.prototype.click;const originalURL=URL.createObjectURL;HTMLAnchorElement.prototype.click=function(){window.exportFilename=this.download};URL.createObjectURL=function(blob){window.exportBlob=blob;return originalURL(blob)};document.querySelector('.lp-export').click();HTMLAnchorElement.prototype.click=originalClick;URL.createObjectURL=originalURL;})()`);
  assert(await evaluate(`(async()=>window.exportFilename.includes('ITMC-${model}') && (await window.exportBlob.text()).includes('BT40'))()`),`CSV technical sheet export ${model}`);
  await evaluate(`window.open=url=>window.testQuote=url;const values={name:'Maria Teste',email:'maria@example.com',phone:'19999999999',company:'Industria Teste',city:'Indaiatuba',state:'SP'};for(const [id,value] of Object.entries(values))document.getElementById(id).value=value;document.querySelector('[type=checkbox]').checked=true;document.querySelector('.contact-form').requestSubmit();`);
  assert(await evaluate(`decodeURIComponent(window.testQuote||'').includes('ITMC-${model}')`),`WhatsApp quotation ${model}`);
 }
 await call('Page.navigate',{url:'http://127.0.0.1:8080/produto-itb-420.html'});await waitReady();await sleep(500);
 assert(await evaluate('!document.body.classList.contains("product-premium") && !!document.querySelector(".detail-hero")'),'Other product keeps existing layout');
 }
 await call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
 for(const model of ['650','800']){
  await call('Page.navigate',{url:`http://127.0.0.1:8080/produto-itmc-${model}.html`});await waitReady();await sleep(1200);
  assert(await evaluate('document.documentElement.scrollWidth<=innerWidth'),`Mobile product has no horizontal overflow ${model}`);
  shot=await call('Page.captureScreenshot',{format:'png'});fs.writeFileSync(`preview-product-${model}-mobile.png`,Buffer.from(shot.data,'base64'));
  await evaluate('document.querySelector(".lp-gallery").scrollIntoView({behavior:"instant"})');await sleep(300);
  await evaluate('document.querySelector(".lp-gallery-next").click()');await sleep(750);
  assert(await evaluate('document.querySelector(".lp-gallery-count").textContent==="02 / 03" && document.documentElement.scrollWidth<=innerWidth'),'Mobile carousel advances without page overflow');
  shot=await call('Page.captureScreenshot',{format:'png'});fs.writeFileSync(`preview-product-${model}-gallery-mobile.png`,Buffer.from(shot.data,'base64'));
  await evaluate('document.querySelector("#contato").scrollIntoView({behavior:"instant"})');await sleep(300);
  assert(await evaluate('document.querySelector("#name").getBoundingClientRect().width>100 && document.querySelector("#email").getBoundingClientRect().right<=innerWidth'),'Mobile form fields fit the card');
  shot=await call('Page.captureScreenshot',{format:'png'});fs.writeFileSync(`preview-product-${model}-quote-mobile.png`,Buffer.from(shot.data,'base64'));
  await evaluate('document.querySelector("#tecnologia").scrollIntoView({behavior:"instant"})');await sleep(600);
  assert(await evaluate('document.querySelector("[data-feature=area]").getBoundingClientRect().width>20'),`Mobile technical tabs reachable ${model}`);
 }
 console.log('Footer and product landing QA complete');
})().then(()=>call('Browser.close',{},null)).catch(async error=>{console.error(error);process.exitCode=1;await call('Browser.close',{},null);});
setTimeout(()=>{browser.kill();process.exit(1)},90000).unref();
