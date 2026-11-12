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
 await call('Page.navigate',{url:'http://127.0.0.1:8080'});await waitReady();await sleep(1800);
 assert(await evaluate('document.querySelectorAll(".home-layers>[data-home-layer]").length===3'),'Three stacked home chapters');
 await call('Input.dispatchMouseEvent',{type:'mouseWheel',x:900,y:500,deltaX:0,deltaY:40});await sleep(450);
 assert(await evaluate('window.homeScrolling && Math.abs(document.querySelector(".hero").getBoundingClientRect().top)<2 && document.querySelector(".showroom").getBoundingClientRect().top>0 && document.querySelector(".showroom").getBoundingClientRect().top<innerHeight'),'Next chapter overlaps stationary hero during wheel transition');
 let shot=await call('Page.captureScreenshot',{format:'png'});fs.writeFileSync('preview-home-overlap.png',Buffer.from(shot.data,'base64'));
 await sleep(1100);assert(await evaluate('Math.abs(scrollY-homeSectionTop(document.querySelector(".machine-story")))<3'),'One wheel gesture settles at showroom');
 for(const model of ['itmc-800','itmc-1100']){
   await evaluate('document.querySelector(".showroom-next").click()');await sleep(1100);
   assert(await evaluate(`document.querySelector('.showroom-slide.is-active').dataset.model==='${model}'`),`Internal machine step ${model}`);
 }
 await call('Input.dispatchMouseEvent',{type:'mouseWheel',x:900,y:500,deltaX:0,deltaY:40});await sleep(450);
 assert(await evaluate('Math.abs(document.querySelector(".showroom").getBoundingClientRect().top)<2 && document.querySelector(".category-scene").getBoundingClientRect().top>0 && document.querySelector(".category-scene").getBoundingClientRect().top<innerHeight'),'Category video overlaps pinned final machine');
 shot=await call('Page.captureScreenshot',{format:'png'});fs.writeFileSync('preview-home-video-overlap.png',Buffer.from(shot.data,'base64'));
 await sleep(1100);assert(await evaluate('Math.abs(scrollY-homeSectionTop(document.querySelector(".category-scene")))<3'),'Wheel settles at category scene');
 await evaluate('document.querySelector("[data-showroom-category=fresadora]").click()');await sleep(200);
 assert(await evaluate('document.querySelector(".machine-dialog").open'),'Category modal remains functional');
 const modalY=await evaluate('scrollY');await call('Input.dispatchMouseEvent',{type:'mouseWheel',x:600,y:400,deltaX:0,deltaY:100});await sleep(150);
 assert(await evaluate(`Math.abs(scrollY-${modalY})<2`),'Wheel cannot change chapters behind modal');
 await evaluate('document.querySelector(".machine-dialog .mega-close").click()');await sleep(400);
 await call('Input.dispatchMouseEvent',{type:'mouseWheel',x:900,y:500,deltaX:0,deltaY:-40});await sleep(1400);
 assert(await evaluate('document.querySelector(".showroom-slide.is-active").dataset.model==="itmc-1100" && Math.abs(document.querySelector(".showroom").getBoundingClientRect().top)<2'),'Reverse chapter transition returns to final machine');
 await evaluate('homeScrollToSection(document.querySelector(".category-scene"))');await sleep(1300);
 await call('Input.dispatchMouseEvent',{type:'mouseWheel',x:900,y:500,deltaX:0,deltaY:120});await sleep(500);
 assert(await evaluate('document.querySelector("footer").getBoundingClientRect().top<innerHeight'),'Home continues directly to white footer');
 await call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
 await call('Page.navigate',{url:'http://127.0.0.1:8080'});await waitReady();await sleep(1200);
 await evaluate('scrollTo({top:homeSectionTop(document.querySelector(".machine-story"))*.5,behavior:"instant"})');await sleep(200);
 assert(await evaluate('Math.abs(document.querySelector(".hero").getBoundingClientRect().top)<2 && document.documentElement.scrollWidth<=innerWidth'),'Mobile stacking has no horizontal overflow');
 await evaluate('scrollTo({top:0,behavior:"instant"})');await sleep(150);
 await call('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:200,y:550}]});
 await call('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:200,y:460}]});
 await call('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await sleep(1300);
 assert(await evaluate('Math.abs(scrollY-homeSectionTop(document.querySelector(".machine-story")))<3'),'Touch swipe advances one home chapter');
 await evaluate('document.querySelector(".hero .scroll-cue").click()');await sleep(1200);
 assert(await evaluate('Math.abs(scrollY-homeSectionTop(document.querySelector(".machine-story")))<3'),'Internal links use stable chapter anchors');
 await call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await sleep(350);
 assert(await evaluate('!document.querySelector("main").classList.contains("home-layers") && !window.homeScrolling'),'Reduced motion restores normal section flow');
 console.log('Home chapters QA complete');
})().then(()=>call('Browser.close',{},null)).catch(async error=>{console.error(error);process.exitCode=1;await call('Browser.close',{},null);});
setTimeout(()=>{browser.kill();process.exit(1)},60000).unref();
