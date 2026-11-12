const {spawnSync}=require('node:child_process');
for(const script of ['qa-carousel.cjs','qa-categories.cjs','qa-home.cjs','qa-landing.cjs','qa-mobile-performance.cjs']){
  const result=spawnSync(process.execPath,[script],{stdio:'inherit',windowsHide:true});
  if(result.status!==0)process.exit(result.status||1);
}
