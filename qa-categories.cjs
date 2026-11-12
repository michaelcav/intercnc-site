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
  await call('Page.enable');
  await call('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
  await call('Page.navigate',{url:'http://127.0.0.1:8080'});await waitReady();await sleep(1800);
  assert(await evaluate('!document.querySelector("main>.section#produtos") && !document.querySelector("main>.engineering")'),'Catalog grid and engineering sections removed');
  assert(await evaluate('!!document.querySelector("#sobre") && !!document.querySelector("#contato")'),'Footer retains company and contact destinations');
  assert(await evaluate('document.querySelectorAll(".category-lane").length===5'),'Five category lanes');
  await evaluate('document.querySelector(".category-scene").scrollIntoView({behavior:"instant"})');await sleep(1500);
  assert(await evaluate('Math.abs(document.querySelector(".category-scene").getBoundingClientRect().height-innerHeight)<2 && document.querySelector(".category-scene").offsetWidth===document.documentElement.clientWidth'),'Video section fills viewport');
  assert(await evaluate('document.querySelector(".category-scene-video").readyState>=2 && !document.querySelector(".category-scene-video").paused'),'Category video decodes and plays in view');
  assert(await evaluate('document.documentElement.scrollWidth<=innerWidth'),'Desktop has no horizontal overflow');
  const lane=await evaluate('(()=>{const r=document.querySelector(".category-lane").getBoundingClientRect();return {x:r.left+r.width/2,y:r.bottom-150}})()');
  await call('Input.dispatchMouseEvent',{type:'mouseMoved',x:lane.x,y:lane.y});await sleep(700);
  let shot=await call('Page.captureScreenshot',{format:'png'});fs.writeFileSync('preview-categories.png',Buffer.from(shot.data,'base64'));
  assert(await evaluate('document.querySelector(".category-scene-video").autoplay && document.querySelector(".category-scene-video").loop && document.querySelector(".category-scene-video").currentSrc!==document.querySelector(".hero-video").currentSrc'),'Distinct category video with autoplay and loop');
  for(const category of ['centro','fresadora','convencional','paralelo','inclinado']){
    await evaluate(`document.querySelector('[data-showroom-category=${category}]').dispatchEvent(new PointerEvent('pointerenter'))`);await sleep(650);
    assert(await evaluate(`document.querySelector('.category-scene-photo.is-active').dataset.preview==='${category}' && document.querySelector('.category-scene-photo.is-active').naturalWidth>0`),`Hover shows ${category} image`);
    await evaluate(`document.querySelector('[data-showroom-category=${category}]').click()`);await sleep(200);
    assert(await evaluate(`document.querySelector('.machine-dialog').open && document.querySelector('.machine-dialog').dataset.category==='${category}' && document.querySelector('.machine-dialog [data-mega-category=${category}]').getAttribute('aria-pressed')==='true'`),`Modal opens with ${category} selected`);
    await evaluate('document.querySelector(".machine-dialog .mega-close").click()');await sleep(350);
    assert(await evaluate('!document.querySelector(".machine-dialog").open && document.body.style.overflow!=="hidden"'),'Closing modal restores page scrolling');
  }
  await evaluate('document.querySelector("[data-showroom-category=fresadora]").click()');await sleep(150);
  await evaluate('document.querySelector(".machine-dialog [data-mega-category=centro]").click()');
  assert(await evaluate('document.querySelectorAll(".machine-dialog .mega-product").length===3'),'Modal switches categories using shared product catalog');
  await sleep(500);shot=await call('Page.captureScreenshot',{format:'png'});fs.writeFileSync('preview-category-modal.png',Buffer.from(shot.data,'base64'));
  await call('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});await call('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});await sleep(350);
  assert(await evaluate('!document.querySelector(".machine-dialog").open && document.activeElement.dataset.showroomCategory==="fresadora"'),'Escape closes modal and restores opener focus');
  await evaluate('document.querySelector("[data-showroom-category=centro]").click()');await sleep(150);
  await call('Input.dispatchMouseEvent',{type:'mousePressed',x:5,y:200,button:'left',clickCount:1});await call('Input.dispatchMouseEvent',{type:'mouseReleased',x:5,y:200,button:'left',clickCount:1});await sleep(350);
  assert(await evaluate('!document.querySelector(".machine-dialog").open'),'Backdrop click dismisses modal');
  await evaluate('document.querySelector(".category-scene").dispatchEvent(new PointerEvent("pointerleave"))');await sleep(600);
  assert(await evaluate('!document.querySelector(".category-scene").classList.contains("has-category-preview")'),'Leaving category scene restores video background');
  await call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  await call('Page.navigate',{url:'http://127.0.0.1:8080'});await waitReady();await sleep(1200);
  await evaluate('document.querySelector(".category-scene").scrollIntoView({behavior:"instant"})');await sleep(1000);
  assert(await evaluate('document.documentElement.scrollWidth<=innerWidth && document.querySelector(".category-scene-rail").scrollWidth>document.querySelector(".category-scene-rail").clientWidth'),'Mobile lanes scroll internally without page overflow');
  assert(await evaluate('Math.abs(document.querySelector(".category-scene").getBoundingClientRect().height-innerHeight)<2'),'Mobile video section fills viewport');
  shot=await call('Page.captureScreenshot',{format:'png'});fs.writeFileSync('preview-categories-mobile.png',Buffer.from(shot.data,'base64'));
  await evaluate('document.querySelector("[data-showroom-category=paralelo]").click()');await sleep(350);
  assert(await evaluate('document.querySelector(".machine-dialog").open && document.querySelector(".machine-dialog").dataset.category==="paralelo" && document.querySelector(".machine-dialog .mega-product h3").textContent==="ITB-420" && document.documentElement.scrollWidth<=innerWidth'),'Mobile category opens corresponding product modal');shot=await call('Page.captureScreenshot',{format:'png'});fs.writeFileSync('preview-category-modal-mobile.png',Buffer.from(shot.data,'base64'));await evaluate('document.querySelector(".machine-dialog .mega-close").click()');
  await call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await sleep(300);
  await evaluate('document.querySelector(".category-scene").scrollIntoView({behavior:"instant"})');await sleep(500);
  assert(await evaluate('document.querySelector(".category-scene-video").paused'),'Reduced motion keeps the poster instead of playing video');
  console.log('Category scene QA complete');
})().then(()=>call('Browser.close',{},null)).catch(async error=>{console.error(error);process.exitCode=1;await call('Browser.close',{},null);});
setTimeout(()=>{browser.kill();process.exit(1)},60000).unref();
