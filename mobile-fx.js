/* mobile-fx.js — Brand identity effects pentru mobile index.html
   Restaureaza Pamant + dragon + galaxia pe mobile (L-IVORY-01 sacred rule).
   Canvas 2D pur, zero Three.js, zero dependinte externe.
   Consuma window.__EARTH_TEX (base64 PNG) + window.__LOGO_SVG_B64 (base64 SVG).
   Self-executing IIFE. Gated din index.html mobile branch (U20).
*/
(function(){
  'use strict';
  if(window.__MOBILE_FX_LOADED)return;window.__MOBILE_FX_LOADED=true;

  /* U31: debug marker MFX scos (era badge roz top-right vizibil peste hero). */
  /* U32: in-app browser early-return U31 scos. Andy: "vrem versiunea de tiktok sa fie la fel ca mobilul" - mobile post-U29/U30/U31 e optimizat, rul mobile-fx.js si in WebView. */

  var W=window.innerWidth,H=window.innerHeight;
  var REDUCED=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* P0-M2 device tier detect: low-end = <=4 cores OR <=4GB RAM.
     Android low-end + iPhone SE 1/2 cadrul in acest bucket => skip compositing-heavy efecte. */
  var HC=navigator.hardwareConcurrency||4;
  var DM=(navigator.deviceMemory==null?4:navigator.deviceMemory);
  var TIER_LOW=HC<=4||DM<=4;
  var DPR=Math.min(window.devicePixelRatio||1, TIER_LOW?1.25:1.5);

  // ===== CONTAINER ROOT (z:0 peste bg, sub content z:3+) =====
  var root=document.createElement('div');
  root.id='mfx-root';
  root.setAttribute('aria-hidden','true');
  root.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden;';
  document.body.appendChild(root);

  // ===== GALAXY AURA (U27: single layer, blur mic, ZERO blend = text clar) =====
  var aura=document.createElement('div');
  aura.style.cssText=[
    'position:absolute',
    'left:50%','top:28%',
    'width:'+Math.min(W*1.4,600)+'px',
    'height:'+Math.min(W*1.4,600)+'px',
    'transform:translate(-50%,-50%)',
    'background:radial-gradient(circle, rgba(186,85,211,.55) 0%, rgba(123,44,255,.35) 30%, rgba(255,77,166,.2) 55%, rgba(4,6,16,0) 80%)',
    'opacity:1',
    'pointer-events:none',
    'animation: mfxAura 8s ease-in-out infinite alternate',
    'will-change:opacity,transform'
  ].join(';');
  root.appendChild(aura);

  // ===== STYLE KEYFRAMES =====
  var style=document.createElement('style');
  style.textContent=[
    '@keyframes mfxAura{0%{opacity:.55;transform:translate(-50%,-50%) scale(1)}100%{opacity:.85;transform:translate(-50%,-50%) scale(1.15)}}',
    '@keyframes mfxEarthSpin{to{transform:translate(-50%,-50%) rotate(360deg)}}',
    '@keyframes mfxDragonFloat{0%,100%{transform:translateY(0) rotate(-8deg)}50%{transform:translateY(-12px) rotate(-4deg)}}',
    '@keyframes mfxOrbitCW{from{transform:translate(-50%,-50%) rotate(0deg)}to{transform:translate(-50%,-50%) rotate(360deg)}}',
    '@keyframes mfxOrbitCCW{from{transform:translate(-50%,-50%) rotate(0deg)}to{transform:translate(-50%,-50%) rotate(-360deg)}}',
    '@keyframes mfxSatPulse{0%,100%{opacity:.9;transform:translate(-50%,-50%) scale(1)}50%{opacity:1;transform:translate(-50%,-50%) scale(1.3)}}'
  ].join('');
  document.head.appendChild(style);

  // ===== STARFIELD CANVAS =====
  var starCvs=document.createElement('canvas');
  starCvs.style.cssText='position:absolute;inset:0;width:100%;height:100%;pointer-events:none;opacity:1;';
  root.appendChild(starCvs);
  var sctx=starCvs.getContext('2d',{alpha:true});
  function sizeStars(){
    W=window.innerWidth;H=window.innerHeight;
    starCvs.width=Math.floor(W*DPR);starCvs.height=Math.floor(H*DPR);
    sctx.setTransform(DPR,0,0,DPR,0,0);
  }
  sizeStars();
  // U27: 140→80 stele + drift lent (universul se misca) + single-pass paint = text clar, zero crash
  var COUNT=80;
  var stars=[];
  for(var i=0;i<COUNT;i++){
    var sizeBucket=Math.random();
    var starR=sizeBucket<.15?(Math.random()*1.4+2.6):(sizeBucket<.5?(Math.random()*1.2+1.6):(Math.random()*1+1.2));
    stars.push({
      x:Math.random()*W,
      y:Math.random()*H,
      r:starR,
      tw:Math.random()*Math.PI*2,
      tws:.015+Math.random()*.035,
      drift:.08+Math.random()*.22,
      hue:Math.random()<.22?260:(Math.random()<.5?320:(Math.random()<.75?200:45))
    });
  }

  // ===== EARTH CANVAS (small rotating planet) =====
  var earthSize=Math.min(W*.48,180);
  var earthWrap=document.createElement('div');
  earthWrap.style.cssText=[
    'position:absolute',
    'left:50%','top:36%',
    'width:'+earthSize+'px','height:'+earthSize+'px',
    'transform:translate(-50%,-50%)',
    'pointer-events:none',
    'border-radius:50%',
    'box-shadow:0 0 60px rgba(123,44,255,.4), 0 0 120px rgba(186,85,211,.25), inset -8px -8px 30px rgba(0,0,0,.6)',
    'overflow:hidden',
    'animation: mfxEarthSpin 60s linear infinite'
  ].join(';');
  root.appendChild(earthWrap);

  var earthCvs=document.createElement('canvas');
  earthCvs.width=Math.floor(earthSize*DPR);
  earthCvs.height=Math.floor(earthSize*DPR);
  earthCvs.style.cssText='width:100%;height:100%;display:block;border-radius:50%;';
  earthWrap.appendChild(earthCvs);
  var ectx=earthCvs.getContext('2d',{alpha:true});

  function paintEarth(){
    var tex=window.__EARTH_TEX;
    if(!tex){
      // Fallback: gradient circle
      var grad=ectx.createRadialGradient(earthSize*.4*DPR,earthSize*.35*DPR,earthSize*.1*DPR,earthSize*.5*DPR,earthSize*.5*DPR,earthSize*.55*DPR);
      grad.addColorStop(0,'#4a90d9');
      grad.addColorStop(.5,'#2c5a8a');
      grad.addColorStop(1,'#0a1e3a');
      ectx.fillStyle=grad;
      ectx.beginPath();
      ectx.arc(earthSize*.5*DPR,earthSize*.5*DPR,earthSize*.5*DPR,0,Math.PI*2);
      ectx.fill();
      return;
    }
    var img=new Image();
    img.onload=function(){
      ectx.drawImage(img,0,0,earthCvs.width,earthCvs.height);
    };
    img.src=typeof tex==='string'?tex:tex.src||tex;
  }
  paintEarth();

  // ===== ORBITS + SOCIAL MEDIA SATELLITES (U24) =====
  // 5 iconite sociale pe 3 orbite: IG, TT, YT, FB, LI cu culori brand reale.
  // Inline SVG in badge rotund, counter-rotate inner ca sa ramana drept cand ring-ul se invarte.
  var SOCIAL_ICONS={
    ig:{bg:'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)',svg:'<svg viewBox="0 0 24 24" fill="#fff" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.2c3.2 0 3.58 0 4.85.07 1.17.05 1.8.25 2.22.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.05.41 2.22.07 1.27.07 1.65.07 4.85s0 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.22a3.72 3.72 0 0 1-.9 1.38 3.72 3.72 0 0 1-1.38.9c-.42.16-1.05.36-2.22.41-1.27.07-1.65.07-4.85.07s-3.58 0-4.85-.07c-1.17-.05-1.8-.25-2.22-.41a3.72 3.72 0 0 1-1.38-.9 3.72 3.72 0 0 1-.9-1.38c-.16-.42-.36-1.05-.41-2.22C2.2 15.58 2.2 15.2 2.2 12s0-3.58.07-4.85c.05-1.17.25-1.8.41-2.22.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.05-.36 2.22-.41C8.42 2.2 8.8 2.2 12 2.2M12 0C8.74 0 8.33 0 7.05.07c-1.28.06-2.15.26-2.91.56a5.87 5.87 0 0 0-2.12 1.38A5.87 5.87 0 0 0 .63 4.13c-.3.76-.5 1.63-.56 2.91C0 8.33 0 8.74 0 12s0 3.67.07 4.95c.06 1.28.26 2.15.56 2.91.3.79.71 1.46 1.38 2.12.66.67 1.33 1.08 2.12 1.38.76.3 1.63.5 2.91.56C8.33 24 8.74 24 12 24s3.67 0 4.95-.07c1.28-.06 2.15-.26 2.91-.56a5.87 5.87 0 0 0 2.12-1.38 5.87 5.87 0 0 0 1.38-2.12c.3-.76.5-1.63.56-2.91.07-1.28.07-1.69.07-4.95s0-3.67-.07-4.95c-.06-1.28-.26-2.15-.56-2.91a5.87 5.87 0 0 0-1.38-2.12A5.87 5.87 0 0 0 19.87.63c-.76-.3-1.63-.5-2.91-.56C15.67 0 15.26 0 12 0zm0 5.84A6.16 6.16 0 1 0 18.16 12 6.16 6.16 0 0 0 12 5.84zm0 10.16A4 4 0 1 1 16 12a4 4 0 0 1-4 4zm6.4-11.85a1.44 1.44 0 1 0 1.44 1.44 1.44 1.44 0 0 0-1.44-1.44z"/></svg>'},
    tt:{bg:'#000',svg:'<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="#25F4EE" d="M16.5 2h3.3v2.4c0 2.3-1.9 4.2-4.2 4.2v3.1c-1.7 0-3.2-.7-4.3-1.8v6.8c0 3.3-2.7 6-6 6s-6-2.7-6-6 2.7-6 6-6v3.1c-1.6 0-2.9 1.3-2.9 2.9s1.3 2.9 2.9 2.9 2.9-1.3 2.9-2.9V2h2.5c.2 2.2 2 4 4.3 4V2z"/><path fill="#fff" d="M17.5 3h3.3v2.4c0 2.3-1.9 4.2-4.2 4.2v3.1c-1.7 0-3.2-.7-4.3-1.8v6.8c0 3.3-2.7 6-6 6s-6-2.7-6-6 2.7-6 6-6v3.1c-1.6 0-2.9 1.3-2.9 2.9s1.3 2.9 2.9 2.9 2.9-1.3 2.9-2.9V3h2.5c.2 2.2 2 4 4.3 4V3z"/></svg>'},
    yt:{bg:'#FF0000',svg:'<svg viewBox="0 0 24 24" fill="#fff" xmlns="http://www.w3.org/2000/svg"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1c.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8zM9.6 15.6V8.4l6.2 3.6-6.2 3.6z"/></svg>'},
    fb:{bg:'#1877F2',svg:'<svg viewBox="0 0 24 24" fill="#fff" xmlns="http://www.w3.org/2000/svg"><path d="M24 12c0-6.6-5.4-12-12-12S0 5.4 0 12c0 6 4.4 10.9 10.1 11.8v-8.4H7.1V12h3.1V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9V12h3.3l-.5 3.5h-2.8v8.4C19.6 22.9 24 18 24 12z"/></svg>'},
    li:{bg:'#0A66C2',svg:'<svg viewBox="0 0 24 24" fill="#fff" xmlns="http://www.w3.org/2000/svg"><path d="M20.4 20.5h-3.6v-5.6c0-1.3 0-3-1.9-3s-2.1 1.5-2.1 2.9v5.7H9.2v-11h3.4v1.5h.1c.5-.9 1.7-1.9 3.4-1.9 3.6 0 4.3 2.4 4.3 5.5v5.9zM5.2 8a2.1 2.1 0 1 1 2.1-2.1A2.1 2.1 0 0 1 5.2 8zm1.8 12.5H3.3v-11H7v11zM22.2 0H1.8C.8 0 0 .8 0 1.7v20.5c0 1 .8 1.7 1.8 1.7h20.4c1 0 1.8-.8 1.8-1.7V1.7C24 .8 23.2 0 22.2 0z"/></svg>'}
  };
  function makeOrbit(ringSize, dur, dir, sats){
    var ring=document.createElement('div');
    ring.style.cssText=[
      'position:absolute',
      'left:50%','top:36%',
      'width:'+ringSize+'px','height:'+ringSize+'px',
      'transform:translate(-50%,-50%)',
      'pointer-events:none',
      /* P0-M2: contain + will-change izoleaza compositing layer pe GPU, nu re-evalueaza pagina. */
      'contain:layout style paint',
      'will-change:transform',
      /* U37b: z-index:3 peste dragon (z:1) ca sateliti sa nu fie acoperiti cand orbita trece prin upper-right. */
      'z-index:3',
      'animation: '+(dir==='cw'?'mfxOrbitCW':'mfxOrbitCCW')+' '+dur+'s linear infinite'
    ].join(';');
    var trace=document.createElement('div');
    trace.style.cssText=[
      'position:absolute','inset:0',
      'border-radius:50%',
      'border:1px dashed rgba(186,85,211,.18)',
      'box-sizing:border-box'
    ].join(';');
    ring.appendChild(trace);
    for(var s=0;s<sats.length;s++){
      var sat=sats[s];
      var ic=SOCIAL_ICONS[sat.type];
      var deg=sat.angle*Math.PI/180;
      var cx=ringSize/2+Math.cos(deg)*ringSize/2;
      var cy=ringSize/2+Math.sin(deg)*ringSize/2;
      // Counter-rotate ca iconita sa ramana orientata corect
      var counter=document.createElement('div');
      counter.style.cssText=[
        'position:absolute',
        'left:'+cx+'px','top:'+cy+'px',
        'width:'+sat.size+'px','height:'+sat.size+'px',
        'transform:translate(-50%,-50%)',
        /* P0-M2: contain + will-change pe counter (rotatie contra-sens = animation transform). */
        'contain:layout style paint',
        'will-change:transform',
        'animation: '+(dir==='cw'?'mfxOrbitCCW':'mfxOrbitCW')+' '+dur+'s linear infinite',
        'transform-origin:center'
      ].join(';');
      var badge=document.createElement('div');
      /* P0-M2: box-shadow TRIPLE → SINGLE (1/3 cost blur GPU per frame).
         Pastrez halo mov dominant, scot ring exterior + shadow inferior.
         mfxSatPulse skip pe low-end (HC<=4 || DM<=4) → zero scale animation = zero compositing per satelit. */
      badge.style.cssText=[
        'width:100%','height:100%',
        'border-radius:22%',
        'background:'+ic.bg,
        'box-shadow:0 0 '+(sat.size*.75)+'px rgba(186,85,211,.8)',
        'display:flex','align-items:center','justify-content:center',
        'padding:'+(sat.size*.18)+'px',
        'box-sizing:border-box',
        'contain:layout style paint',
        'will-change:transform',
        (TIER_LOW?'':'animation: mfxSatPulse '+(2.5+s*.6)+'s ease-in-out infinite')
      ].join(';');
      badge.innerHTML=ic.svg;
      var svgEl=badge.querySelector('svg');
      if(svgEl){
        svgEl.setAttribute('width','100%');
        svgEl.setAttribute('height','100%');
        svgEl.style.display='block';
      }
      counter.appendChild(badge);
      ring.appendChild(counter);
    }
    root.appendChild(ring);
  }
  var ringBase=earthSize*1.2;
  // Orbita interioara rapida: IG (brand mare)
  makeOrbit(ringBase*1.0, 11, 'cw', [
    {angle:30, type:'ig', size:32}
  ]);
  // Orbita mijloc contra-sens: TT + YT
  makeOrbit(ringBase*1.3, 18, 'ccw', [
    {angle:60, type:'tt', size:30},
    {angle:230, type:'yt', size:30}
  ]);
  // Orbita exterioara lenta: FB + LI (U37: 1.6→1.4 reduce radius pentru anti-crop mobile real device)
  makeOrbit(ringBase*1.4, 26, 'cw', [
    {angle:150, type:'fb', size:28},
    {angle:330, type:'li', size:28}
  ]);

  // ===== DRAGON/LOGO (U24: 2x mai mare, glow triplu, onerror fallback) =====
  var logoB64=window.__LOGO_SVG_B64;
  var logoSrc=null;
  if(logoB64){
    logoSrc=(logoB64.indexOf('data:')===0)?logoB64:('data:image/svg+xml;base64,'+logoB64);
  }else{
    logoSrc='logo-nav.svg';
  }
  var logoImg=document.createElement('img');
  logoImg.decoding='async';
  logoImg.src=logoSrc;
  logoImg.alt='';
  logoImg.setAttribute('aria-hidden','true');
  /* P0-M1: filter TRIPLE drop-shadow → SINGLE (56kb SVG × 3 blur pass × infinite animation = GPU saturation pe mobile low-end).
     Halo mov dominant intr-un singur pass. contain+will-change izoleaza dragon intr-un compositing layer propriu = zero reflow pe rest pagina. */
  /* U37b: dragon shrunk + pushed corner + halo redus pentru a NU acoperi IG satelit la rotatia prin upper-right. */
  logoImg.style.cssText=[
    'position:absolute',
    'right:2%','top:3%',
    'width:'+Math.min(W*.26,115)+'px',
    'height:auto',
    'opacity:1',
    'filter:drop-shadow(0 0 14px rgba(186,85,211,.8))',
    'animation: mfxDragonFloat 6s ease-in-out infinite',
    'contain:layout style paint',
    'will-change:transform',
    'pointer-events:none',
    'z-index:1'
  ].join(';');
  // Fallback sa nu ramana gol daca src-ul principal eseueaza
  logoImg.onerror=function(){
    if(logoImg.src.indexOf('logo-nav.svg')===-1){
      logoImg.src='logo-nav.svg';
    }
  };
  root.appendChild(logoImg);

  // ===== STARFIELD ANIMATION (U27: single-pass + drift lent stanga) =====
  var running=true;
  function tickStars(){
    if(!running)return;
    sctx.clearRect(0,0,W,H);
    for(var i=0;i<stars.length;i++){
      var s=stars[i];
      s.tw+=s.tws;
      s.x-=s.drift;
      if(s.x<-8){s.x=W+8;s.y=Math.random()*H;}
      var a=.65+Math.sin(s.tw)*.35;
      sctx.shadowBlur=s.r*2;
      sctx.shadowColor='hsla('+s.hue+',95%,78%,'+a+')';
      sctx.beginPath();
      sctx.arc(s.x,s.y,s.r,0,Math.PI*2);
      sctx.fillStyle='hsla('+s.hue+',90%,90%,'+a+')';
      sctx.fill();
    }
    sctx.shadowBlur=0;
    requestAnimationFrame(tickStars);
  }
  if(!REDUCED)requestAnimationFrame(tickStars);
  else{
    // Static frame
    sctx.clearRect(0,0,W,H);
    for(var j=0;j<stars.length;j++){
      var ss=stars[j];
      sctx.beginPath();
      sctx.arc(ss.x,ss.y,ss.r,0,Math.PI*2);
      sctx.fillStyle='hsla('+ss.hue+',80%,75%,.6)';
      sctx.fill();
    }
  }

  // ===== RESIZE =====
  var rt;
  window.addEventListener('resize',function(){
    clearTimeout(rt);
    rt=setTimeout(function(){
      sizeStars();
      for(var k=0;k<stars.length;k++){
        stars[k].x=Math.random()*W;
        stars[k].y=Math.random()*H;
      }
    },180);
  },{passive:true});

  // ===== VISIBILITY API (pauza tab inactiv) =====
  /* P0-M1/M2 extins: pauza animation-play-state pe TOATE elementele heavy (aura, dragon, earth)
     cand tab-ul e ascuns. Economie GPU + baterie pe mobile. */
  document.addEventListener('visibilitychange',function(){
    running=!document.hidden;
    var ps=document.hidden?'paused':'running';
    try{aura.style.animationPlayState=ps;}catch(_){}
    try{logoImg.style.animationPlayState=ps;}catch(_){}
    try{earthWrap.style.animationPlayState=ps;}catch(_){}
    if(running&&!REDUCED)requestAnimationFrame(tickStars);
  });
})();
