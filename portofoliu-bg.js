/* portofoliu-bg.js — background decorativ galaxie + planete + logo
   DS-glass-galactic, canvas 2D (fara Three.js).
   Self-executing. Consuma window.__EARTH_TEX + window.__LOGO_SVG_B64.
   Target: perf impecabila mobile, zero blocking, z-index -1.
*/
(function(){
  'use strict';
  if(window.__PF_BG_LOADED)return;window.__PF_BG_LOADED=true;

  var W=window.innerWidth,H=window.innerHeight;
  var TINY=W<500;                 // telefon mic — doar gradient static
  var MOBILE=W<900;
  var REDUCED=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ===== CONTAINER ROOT =====
  var root=document.createElement('div');
  root.id='pf-bg-root';
  root.setAttribute('aria-hidden','true');
  root.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:-1;overflow:hidden;contain:strict;';
  document.body.appendChild(root);

  // ===== GALAXY AURA (CSS radial gradient) =====
  var aura=document.createElement('div');
  aura.style.cssText=[
    'position:absolute',
    'left:30%','top:20%',
    'width:'+(MOBILE?520:780)+'px',
    'height:'+(MOBILE?520:780)+'px',
    'transform:translate(-50%,-50%)',
    'background:radial-gradient(circle, rgba(186,85,211,.55) 0%, rgba(123,44,255,.32) 35%, rgba(255,77,166,.12) 60%, rgba(4,6,16,0) 75%)',
    'filter:blur(80px)',
    'opacity:.35',
    'pointer-events:none',
    'will-change:transform'
  ].join(';');
  root.appendChild(aura);

  // Daca e TINY (<500px) — doar gradient, skip restul
  if(TINY){
    // cleanup noop — gradient e static, nu e nevoie
    return;
  }

  // ===== STARFIELD CANVAS =====
  var cvs=document.createElement('canvas');
  cvs.style.cssText='position:absolute;inset:0;width:100%;height:100%;pointer-events:none;opacity:.85;';
  root.appendChild(cvs);
  var ctx=cvs.getContext('2d',{alpha:true});
  var DPR=Math.min(window.devicePixelRatio||1, MOBILE?1.25:2);

  function sizeCanvas(){
    W=window.innerWidth;H=window.innerHeight;
    cvs.width=Math.floor(W*DPR);cvs.height=Math.floor(H*DPR);
    ctx.setTransform(DPR,0,0,DPR,0,0);
  }
  sizeCanvas();

  // Particule
  var COUNT=MOBILE?60:150;
  var stars=[];
  for(var i=0;i<COUNT;i++){
    stars.push({
      x:Math.random()*W,
      y:Math.random()*H,
      r:Math.random()*1.3+.3,
      a:Math.random()*.6+.25,
      // culoare: 80% alb, 20% cyan subtle
      c:Math.random()<.8?'255,255,255':'120,220,255',
      // viteza drift lenta (doar daca nu e reduced-motion)
      vx:(Math.random()-.5)*.05,
      vy:(Math.random()-.5)*.05,
      // twinkle phase
      p:Math.random()*Math.PI*2
    });
  }

  function drawStars(t){
    ctx.clearRect(0,0,W,H);
    for(var i=0;i<stars.length;i++){
      var s=stars[i];
      if(!REDUCED){
        s.x+=s.vx;s.y+=s.vy;
        if(s.x<0)s.x+=W;else if(s.x>W)s.x-=W;
        if(s.y<0)s.y+=H;else if(s.y>H)s.y-=H;
      }
      var tw=REDUCED?1:(.7+.3*Math.sin(t*.001+s.p));
      ctx.globalAlpha=s.a*tw;
      ctx.fillStyle='rgba('+s.c+',1)';
      ctx.beginPath();
      ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
      ctx.fill();
    }
    ctx.globalAlpha=1;
  }
  drawStars(0);

  // Parallax la scroll (transform only — GPU cheap, nu redraw)
  var scrollY=0;
  function onScroll(){
    scrollY=window.pageYOffset||0;
    if(REDUCED)return;
    // shift stars container 15% din scroll (parallax lent)
    cvs.style.transform='translate3d(0,'+(-scrollY*.15)+'px,0)';
    aura.style.transform='translate(-50%,-50%) translate3d(0,'+(-scrollY*.08)+'px,0)';
  }
  window.addEventListener('scroll',onScroll,{passive:true});

  // RAF loop (twinkle + drift)
  var rafId=null;
  function loop(t){
    drawStars(t);
    rafId=requestAnimationFrame(loop);
  }
  if(!REDUCED){rafId=requestAnimationFrame(loop);}

  // ===== PAMANT (img DOM, CSS rotate) =====
  if(window.__EARTH_TEX){
    var earth=document.createElement('img');
    earth.src=window.__EARTH_TEX;
    earth.alt='';
    earth.setAttribute('aria-hidden','true');
    earth.decoding='async';earth.loading='eager';
    var eSize=MOBILE?100:180;
    earth.style.cssText=[
      'position:fixed',
      'right:5%','bottom:10%',
      'width:'+eSize+'px','height:'+eSize+'px',
      'border-radius:50%',
      'opacity:.45',
      'box-shadow:0 0 60px rgba(106,181,255,.35), 0 0 120px rgba(106,181,255,.18), inset -10px -10px 30px rgba(0,0,0,.5)',
      'pointer-events:none',
      'will-change:transform',
      REDUCED?'':'animation: pfbgEarthSpin 120s linear infinite'
    ].join(';');
    root.appendChild(earth);
  }

  // ===== DRAGON LOGO (svg base64, drop-shadow) =====
  if(window.__LOGO_SVG_B64){
    var logo=document.createElement('img');
    logo.src='data:image/svg+xml;base64,'+window.__LOGO_SVG_B64;
    logo.alt='';
    logo.setAttribute('aria-hidden','true');
    logo.decoding='async';logo.loading='eager';
    var lSize=MOBILE?80:140;
    logo.style.cssText=[
      'position:fixed',
      'right:8%','top:10%',
      'width:'+lSize+'px','height:auto',
      'opacity:.12',
      'filter:drop-shadow(0 0 12px rgba(0,224,192,.4)) drop-shadow(0 0 24px rgba(0,224,192,.2))',
      'pointer-events:none',
      'will-change:transform'
    ].join(';');
    root.appendChild(logo);
  }

  // ===== KEYFRAMES (injectate o singura data) =====
  var style=document.createElement('style');
  style.textContent='@keyframes pfbgEarthSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}';
  document.head.appendChild(style);

  // ===== RESIZE =====
  var resizeTO=null;
  function onResize(){
    if(resizeTO)clearTimeout(resizeTO);
    resizeTO=setTimeout(function(){
      sizeCanvas();
      // repozitioneaza stars pe noul viewport
      for(var i=0;i<stars.length;i++){
        stars[i].x=Math.random()*W;
        stars[i].y=Math.random()*H;
      }
      drawStars(0);
    },150);
  }
  window.addEventListener('resize',onResize,{passive:true});

  // ===== CLEANUP =====
  window.addEventListener('beforeunload',function(){
    if(rafId)cancelAnimationFrame(rafId);
    if(resizeTO)clearTimeout(resizeTO);
    window.removeEventListener('scroll',onScroll);
    window.removeEventListener('resize',onResize);
  });
})();
