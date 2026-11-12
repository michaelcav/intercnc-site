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
 await call('Page.navigate',{url:'http://127.0.0.1:8080'});await waitReady();await sleep(1500);
 await evaluate('homeScrollToSection(document.querySelector(".machine-story"))');await sleep(1300);
 assert(await evaluate('Math.abs(document.querySelector(".machine-story").offsetHeight-innerHeight)<2'),'Second chapter is one viewport tall');
 await call('Input.dispatchMouseEvent',{type:'mouseWheel',x:800,y:450,deltaX:0,deltaY:40});await sleep(1300);
 assert(await evaluate('Math.abs(scrollY-homeSectionTop(document.querySelector(".category-scene")))<3'),'One wheel gesture leaves second chapter immediately');
 await evaluate('homeScrollToSection(document.querySelector(".machine-story"))');await sleep(1300);
 assert(await evaluate('!document.querySelector(".showroom-prev").disabled && !document.querySelector(".showroom-next").disabled'),'Both carousel arrows available at first model');
 await evaluate('document.querySelector(".showroom-prev").click()');await sleep(1000);
 assert(await evaluate('document.querySelector(".showroom-slide.is-active").dataset.model==="itmc-1100"'),'Previous arrow loops from first to last');
 assert(await evaluate('getComputedStyle(document.querySelector(".showroom-prev .lucide")).color==="rgb(255, 190, 0)"'),'Selected previous arrow is yellow');
 await evaluate('document.querySelector(".showroom-next").click()');await sleep(1000);
 assert(await evaluate('document.querySelector(".showroom-slide.is-active").dataset.model==="itmc-650"'),'Next arrow loops from last to first');
 for(let i=0;i<3;i++){await evaluate('document.querySelector(".showroom-next").click()');await sleep(1150);}
 assert(await evaluate('document.querySelector(".showroom-slide.is-active").dataset.model==="itmc-650"'),'Complete infinite carousel cycle');
 assert(await evaluate('getComputedStyle(document.querySelector(".showroom-next .lucide")).color==="rgb(255, 190, 0)"'),'Selected next arrow is yellow');
 await evaluate('homeScrollToSection(document.querySelector(".category-scene"))');await sleep(1250);
 await evaluate('document.querySelector("[data-showroom-category=centro]").click()');await sleep(450);
 assert(await evaluate('parseFloat(getComputedStyle(document.querySelector(".machine-dialog")).borderTopLeftRadius)>=20'),'Category modal has rounded corners');
 let shot=await call('Page.captureScreenshot',{format:'png'});fs.writeFileSync('preview-category-modal.png',Buffer.from(shot.data,'base64'));
 await evaluate('document.querySelector(".machine-dialog .mega-close").click()');await sleep(70);
 assert(await evaluate('document.querySelector(".machine-dialog").open && document.querySelector(".machine-dialog").classList.contains("is-closing")'),'Close button starts visible exit animation');
 await sleep(300);assert(await evaluate('!document.querySelector(".machine-dialog").open && document.body.style.overflow!=="hidden"'),'Animated close restores page scrolling');
 await call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await call('Page.navigate',{url:'http://127.0.0.1:8080'});await waitReady();await sleep(1100);
 await evaluate('homeScrollToSection(document.querySelector(".machine-story"))');await sleep(1200);
 await call('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:200,y:500}]});await call('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:200,y:410}]});await call('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await sleep(1300);
 assert(await evaluate('Math.abs(scrollY-homeSectionTop(document.querySelector(".category-scene")))<3'),'Touch swipe leaves second chapter without trapping user');
 await evaluate('document.querySelector("[data-showroom-category=paralelo]").click()');await sleep(400);
 assert(await evaluate('document.documentElement.scrollWidth<=innerWidth && document.querySelector(".machine-dialog").open'),'Rounded modal works on mobile');
 shot=await call('Page.captureScreenshot',{format:'png'});fs.writeFileSync('preview-category-modal-mobile.png',Buffer.from(shot.data,'base64'));
 console.log('Carousel and modal QA complete');
})().then(()=>call('Browser.close',{},null)).catch(async error=>{console.error(error);process.exitCode=1;await call('Browser.close',{},null);});
setTimeout(()=>{browser.kill();process.exit(1)},60000).unref();
