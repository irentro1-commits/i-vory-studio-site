/* loader-fx.js — BATCH 3 premium 2026 brand-native loader
   Replaces builtin preloader cu signature i-vory: orbiting satellites + central pulse + progress bar.
   Gated DESKTOP only. Respects prefers-reduced-motion (instant fade if reduce).
*/
(function(){
  'use strict';
  if(window.__LOADER_FX_LOADED)return;
  if(window.__IS_MOBILE||window.__IS_INAPP)return;
  if(!window.matchMedia||!window.matchMedia("(pointer:fine)").matches)return;
  window.__LOADER_FX_LOADED=true;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const style=document.createElement('style');
  style.textContent=`
    #lfx-loader { position: fixed; inset: 0; background: radial-gradient(ellipse at 50% 50%, #0a0a18 0%, #050505 70%); z-index: 99996; display: flex; align-items: center; justify-content: center; flex-direction: column; transition: opacity 0.6s cubic-bezier(.4,0,.2,1), visibility 0.6s; will-change: opacity; }
    #lfx-loader.done { opacity: 0; visibility: hidden; pointer-events: none; }
    .lfx-orb-system { position: relative; width: 200px; height: 200px; }
    .lfx-core { position: absolute; top: 50%; left: 50%; width: 56px; height: 56px; border-radius: 50%; transform: translate(-50%,-50%); background: radial-gradient(circle at 35% 30%, #4a90d9 0%, #2c5a8a 50%, #0a1e3a 100%); box-shadow: 0 0 40px rgba(74,144,217,.5), 0 0 80px rgba(123,44,255,.3), inset -8px -8px 20px rgba(0,0,0,.5); animation: lfx-pulse 2.4s ease-in-out infinite; }
    @keyframes lfx-pulse { 0%,100% { transform: translate(-50%,-50%) scale(1); box-shadow: 0 0 40px rgba(74,144,217,.5), 0 0 80px rgba(123,44,255,.3), inset -8px -8px 20px rgba(0,0,0,.5); } 50% { transform: translate(-50%,-50%) scale(1.08); box-shadow: 0 0 55px rgba(0,224,192,.6), 0 0 100px rgba(186,85,211,.4), inset -8px -8px 20px rgba(0,0,0,.5); } }
    .lfx-orbit { position: absolute; top: 50%; left: 50%; border: 1px dashed rgba(186,85,211,.18); border-radius: 50%; transform: translate(-50%,-50%); }
    .lfx-orbit-1 { width: 110px; height: 110px; animation: lfx-spin-cw 5s linear infinite; }
    .lfx-orbit-2 { width: 156px; height: 156px; animation: lfx-spin-ccw 8s linear infinite; }
    .lfx-orbit-3 { width: 200px; height: 200px; animation: lfx-spin-cw 12s linear infinite; }
    @keyframes lfx-spin-cw { from { transform: translate(-50%,-50%) rotate(0); } to { transform: translate(-50%,-50%) rotate(360deg); } }
    @keyframes lfx-spin-ccw { from { transform: translate(-50%,-50%) rotate(0); } to { transform: translate(-50%,-50%) rotate(-360deg); } }
    .lfx-sat { position: absolute; top: 50%; left: 100%; width: 14px; height: 14px; border-radius: 4px; transform: translate(-50%,-50%); box-shadow: 0 0 12px rgba(186,85,211,.7); }
    .lfx-sat.s1 { background: linear-gradient(135deg,#f09433,#dc2743); top: 50%; left: 0%; }
    .lfx-sat.s2 { background: #FF0000; top: 50%; left: 100%; }
    .lfx-sat.s3 { background: #1877F2; top: 0%; left: 50%; }
    .lfx-sat.s4 { background: #0A66C2; top: 100%; left: 50%; }
    .lfx-progress-wrap { width: 220px; margin-top: 50px; }
    .lfx-progress { height: 1px; width: 100%; background: rgba(255,255,255,.08); position: relative; overflow: hidden; }
    .lfx-progress-bar { position: absolute; top: 0; left: 0; height: 100%; background: linear-gradient(90deg, var(--ac, #00e0c0), #7b2cff); width: 0; transition: width 0.3s linear; }
    .lfx-pct { font-family: 'Geist Mono', monospace; font-size: .65rem; color: rgba(255,255,255,.55); letter-spacing: .15em; margin-top: 12px; text-align: center; text-transform: uppercase; }
    .lfx-brand { font-family: 'Geist', system-ui, sans-serif; font-size: .7rem; color: rgba(255,255,255,.45); letter-spacing: .35em; margin-top: 30px; text-transform: uppercase; font-weight: 500; }
  `;
  document.head.appendChild(style);

  const loader=document.createElement('div');
  loader.id='lfx-loader';
  loader.innerHTML = `
    <div class="lfx-orb-system">
      <div class="lfx-orbit lfx-orbit-3"><div class="lfx-sat s3"></div><div class="lfx-sat s4"></div></div>
      <div class="lfx-orbit lfx-orbit-2"><div class="lfx-sat s2"></div></div>
      <div class="lfx-orbit lfx-orbit-1"><div class="lfx-sat s1"></div></div>
      <div class="lfx-core"></div>
    </div>
    <div class="lfx-progress-wrap">
      <div class="lfx-progress"><div class="lfx-progress-bar" id="lfx-bar"></div></div>
      <div class="lfx-pct" id="lfx-pct">0%</div>
    </div>
    <div class="lfx-brand">i-vory · loading the experience</div>
  `;
  document.body.insertBefore(loader, document.body.firstChild);

  const existing=document.getElementById('pre');
  if(existing){ existing.style.display='none'; }

  let progress=0, target=0;
  const bar=document.getElementById('lfx-bar');
  const pct=document.getElementById('lfx-pct');

  function updateBar(){
    progress += (target - progress) * 0.12;
    if(bar) bar.style.width = progress + '%';
    if(pct) pct.textContent = Math.round(progress) + '%';
    if(progress < 99.5 || target < 100) requestAnimationFrame(updateBar);
  }
  updateBar();

  let fakeStep = 0;
  const fakeInterval = setInterval(()=>{
    fakeStep += 1;
    target = Math.min(85, fakeStep * 4);
    if(fakeStep > 22) clearInterval(fakeInterval);
  }, 80);

  function complete(){
    clearInterval(fakeInterval);
    target = 100;
    setTimeout(()=>{
      loader.classList.add('done');
      setTimeout(()=>loader.remove(), 700);
    }, reduceMotion ? 0 : 350);
  }

  if(document.readyState === 'complete'){ complete(); }
  else { window.addEventListener('load', ()=>setTimeout(complete, reduceMotion ? 0 : 200), { once: true }); }
  setTimeout(complete, 5000);
})();
