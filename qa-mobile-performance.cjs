const {spawn}=require('node:child_process');
const fs=require('node:fs');
const path=require('node:path');
const browser=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless','--disable-gpu','--no-first-run','--no-default-browser-check','--remote-debugging-pipe',`--user-data-dir=${path.join(__dirname,'.browser-mobile')}`],{stdio:['ignore','ignore','ignore','pipe','pipe'],windowsHide:true});
let next=0,buffer='';const pending=new Map();let session;
browser.stdio[4].on('data',chunk=>{buffer+=chunk.toString();let end;while((end=buffer.indexOf('\0'))>=0){const raw=buffer.slice(0,end);buffer=buffer.slice(end+1);if(!raw)continue;const message=JSON.parse(raw);if(pending.has(message.id)){const {resolve,reject}=pending.get(message.id);pending.delete(message.id);message.error?reject(new Error(JSON.stringify(message.error))):resolve(message.result);}}});
function call(method,params={},s=session){return new Promise((resolve,reject)=>{const id=++next;pending.set(id,{resolve,reject});browser.stdio[3].write(JSON.stringify({id,method,params,...(s?{sessionId:s}:{})})+'\0');});}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function evaluate(expression){const r=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw new Error(JSON.stringify(r.exceptionDetails));return r.result.value;}
function assert(ok,message){if(!ok)throw new Error(message);console.log('PASS',message);}

async function ready(selector){
 for(let i=0;i<80;i++){if(await evaluate(`document.readyState==='complete' && !!document.querySelector('${selector}')`))return;await sleep(100);}
 throw new Error('Page readiness timeout: '+selector);
}
(async()=>{
 const target=await call('Target.createTarget',{url:'about:blank'},null);
 session=(await call('Target.attachToTarget',{targetId:target.targetId,flatten:true},null)).sessionId;
 await call('Page.enable');await call('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});
 await call('Page.addScriptToEvaluateOnNewDocument',{source:'window.qaErrors=[];addEventListener("error",e=>qaErrors.push(e.message));addEventListener("unhandledrejection",e=>qaErrors.push(String(e.reason)));'});
 const profiles=[
  {name:'Android portrait',width:360,height:800,userAgent:'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36'},
  {name:'iPhone portrait (Chromium emulation)',width:390,height:844,userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'},
  {name:'Phone landscape',width:844,height:390,userAgent:'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/131.0.0.0 Mobile Safari/537.36'}
 ];
 for(const profile of profiles){
  await call('Emulation.setDeviceMetricsOverride',{width:profile.width,height:profile.height,deviceScaleFactor:1,mobile:true});
  await call('Emulation.setUserAgentOverride',{userAgent:profile.userAgent});
  await call('Page.navigate',{url:'http://127.0.0.1:8080/index.html'});await ready('.category-scene-video');await sleep(300);
  assert(await evaluate('document.documentElement.scrollWidth<=innerWidth'),profile.name+': home fits viewport');
  assert(await evaluate('document.querySelector(".category-scene-video source").hasAttribute("data-src")'),profile.name+': below-fold video is deferred');
  assert(await evaluate('[...document.querySelectorAll("video")].every(v=>v.muted && v.playsInline)'),profile.name+': inline muted video');
  await evaluate('document.querySelector(".menu-toggle").click()');await sleep(650);
  assert(await evaluate('document.querySelector(".menu-toggle").getAttribute("aria-expanded")==="true"'),profile.name+': hamburger opens');
  await evaluate('document.querySelector(".menu-toggle").click()');await sleep(650);
  assert(await evaluate('document.querySelector(".menu-toggle").getAttribute("aria-expanded")==="false"'),profile.name+': hamburger closes');
  for(const model of ['650','800']){
   await call('Page.navigate',{url:`http://127.0.0.1:8080/produto-itmc-${model}.html`});await ready('.lp-solutions');await sleep(400);
   assert(await evaluate('document.documentElement.scrollWidth<=innerWidth && parseFloat(getComputedStyle(document.querySelector(".lp-hero-figures span")).fontSize)>=10'),profile.name+': larger figures fit '+model);
   assert(await evaluate('document.querySelector(".lp-film source").hasAttribute("data-src")'),profile.name+': LP video deferred '+model);
   assert(await evaluate('parseFloat(getComputedStyle(document.querySelector("#email")).fontSize)>=16'),profile.name+': form avoids focus zoom '+model);
   await evaluate('document.querySelector(".lp-gallery").scrollIntoView({behavior:"instant"});document.querySelector(".lp-gallery-next").click()');await sleep(900);
   assert(await evaluate('document.querySelector(".lp-gallery-count").textContent==="02 / 03"'),profile.name+': gallery advances '+model);
   await evaluate('document.querySelector(".lp-gallery-expand").click()');
   assert(await evaluate('document.querySelector(".lp-image-dialog").open'),profile.name+': image modal opens '+model);
   await evaluate('document.querySelector(".lp-image-dialog>button").click()');
   await evaluate('document.querySelector(".lp-film").scrollIntoView({behavior:"instant"})');await sleep(600);
   assert(await evaluate('!!document.querySelector(".lp-film source").getAttribute("src")'),profile.name+': visible video loads '+model);
   assert(await evaluate('[...document.images].filter(i=>i.complete && i.currentSrc).every(i=>i.naturalWidth>0)'),profile.name+': requested images decode '+model);
   assert(await evaluate('window.qaErrors.length===0'),profile.name+': no uncaught script errors '+model);
  }
 }
 await call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await sleep(200);
 assert(await evaluate('[...document.querySelectorAll("video")].every(v=>v.paused)'),'Reduced motion pauses videos');
 console.log('Mobile and media QA complete (Chromium; physical iOS/Safari not tested)');
})().then(()=>call('Browser.close',{},null)).catch(async error=>{console.error(error);process.exitCode=1;await call('Browser.close',{},null);});
setTimeout(()=>{browser.kill();process.exit(1)},120000).unref();
