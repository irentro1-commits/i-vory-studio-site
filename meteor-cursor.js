/* meteor-cursor.js — universal ethereal blue wisp cursor for all i-vory Studio pages
 * Self-contained: injects CSS + creates meteor/nebula elements + runs physics loop
 * Disabled on mobile (<=768px)
 */
(function(){
  if(window.innerWidth<=768)return;
  if(document.getElementById('meteor-cursor-style'))return; // prevent double init

  // === 1. Inject CSS ===
  var css=document.createElement('style');
  css.id='meteor-cursor-style';
  css.textContent=`
@media(min-width:769px){
  *,a,button,input,textarea,select{cursor:none !important}
  .meteor{position:fixed;pointer-events:none;z-index:99999;width:14px;height:14px;margin:-7px 0 0 -7px;transition:opacity .3s;mix-blend-mode:screen}
  .meteor-core{position:absolute;top:50%;left:50%;width:12px;height:12px;margin:-6px 0 0 -6px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,1) 0%,rgba(200,240,255,.9) 25%,rgba(140,210,255,.55) 55%,rgba(80,160,240,.15) 80%,transparent 100%);box-shadow:0 0 14px 4px rgba(180,230,255,.7),0 0 30px 8px rgba(100,180,240,.35),0 0 60px 12px rgba(60,120,230,.15);animation:wispPulse 2s ease-in-out infinite}
  .meteor-flame,.meteor-flame2,.meteor-flame3{display:none !important}
  #nebulaCanvas{position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:99990;mix-blend-mode:screen}
  @keyframes wispPulse{0%,100%{transform:scale(1);opacity:.9}50%{transform:scale(1.2);opacity:1}}
  .meteor.idle{opacity:0 !important;pointer-events:none}
  #nebulaCanvas.idle{opacity:0;transition:opacity .6s}
}
`;
  document.head.appendChild(css);

  // === 2. Create DOM elements ===
  var m=document.createElement('div');
  m.className='meteor';
  m.innerHTML='<div class="meteor-core"></div><div class="meteor-flame"></div><div class="meteor-flame2"></div><div class="meteor-flame3"></div>';
  document.body.appendChild(m);

  var cv=document.createElement('canvas');
  cv.id='nebulaCanvas';
  document.body.appendChild(cv);
  var ctx=cv.getContext('2d');
  function resize(){cv.width=window.innerWidth;cv.height=window.innerHeight}
  resize();window.addEventListener('resize',resize);

  // === 3. State ===
  var mx=0,my=0,cx=0,cy=0;
  var speed=.55;
  var trail=[];
  var lastMoveTs=Date.now();

  document.addEventListener('mousemove',function(e){
    mx=e.clientX;my=e.clientY;
    m.style.opacity='1';
    lastMoveTs=Date.now();
    m.classList.remove('idle');
    cv.classList.remove('idle');
  });
  document.addEventListener('mouseleave',function(){m.style.opacity='0'});

  // Auto-fade after 5s idle
  setInterval(function(){
    if(Date.now()-lastMoveTs>5000){
      m.classList.add('idle');
      cv.classList.add('idle');
    }
  },1000);

  // Blue-white palette — ethereal arrow wisp
  var nebColors=[
    [180,230,255],[120,200,255],[80,160,240],[60,120,230],
    [160,220,255],[200,240,255],[140,180,240]
  ];
  // === 4. Physics loop — trail particles + core glow ===
  function tick(){
    cx+=(mx-cx)*speed;
    cy+=(my-cy)*speed;
    m.style.left=cx+'px';m.style.top=cy+'px';
    var dx=mx-cx,dy=my-cy;
    var vel=Math.sqrt(dx*dx+dy*dy);

    // Rotate flame elements toward motion direction
    if(vel>0.5){
      var angle=Math.atan2(dy,dx)*180/Math.PI;
      var fa='rotate('+angle+'deg)';
      var fls=m.querySelectorAll('.meteor-flame, .meteor-flame2, .meteor-flame3');
      for(var k=0;k<fls.length;k++)fls[k].style.transform=fa;
    }

    // Add trail particles
    if(vel>1.2){
      var numP=Math.min(Math.floor(vel/4),4);
      for(var i=0;i<numP;i++){
        var col=nebColors[Math.floor(Math.random()*nebColors.length)];
        trail.push({
          x:cx+Math.random()*18-9,
          y:cy+Math.random()*18-9,
          r:Math.random()*22+10,
          vx:(Math.random()-.5)*.8,
          vy:(Math.random()-.5)*.6-.3,
          life:1,
          decay:Math.random()*.012+.006,
          col:col
        });
      }
    }

    // Draw nebula
    ctx.clearRect(0,0,cv.width,cv.height);
    for(var i=trail.length-1;i>=0;i--){
      var p=trail[i];
      p.x+=p.vx;p.y+=p.vy;
      p.vx*=.985;p.vy*=.985;
      p.life-=p.decay;
      p.r+=.22;
      if(p.life<=0){trail.splice(i,1);continue}
      var alpha=p.life*p.life*p.life*.45;
      var grd=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r);
      grd.addColorStop(0,'rgba('+p.col[0]+','+p.col[1]+','+p.col[2]+','+alpha+')');
      grd.addColorStop(.4,'rgba('+p.col[0]+','+p.col[1]+','+p.col[2]+','+(alpha*.5)+')');
      grd.addColorStop(1,'rgba('+p.col[0]+','+p.col[1]+','+p.col[2]+',0)');
      ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle=grd;ctx.fill();
    }

    // Soft blue core glow when moving
    if(vel>1.5){
      var coreGrd=ctx.createRadialGradient(cx,cy,0,cx,cy,40);
      coreGrd.addColorStop(0,'rgba(200,240,255,.28)');
      coreGrd.addColorStop(.4,'rgba(120,200,255,.12)');
      coreGrd.addColorStop(1,'rgba(60,120,230,0)');
      ctx.beginPath();ctx.arc(cx,cy,40,0,Math.PI*2);
      ctx.fillStyle=coreGrd;ctx.fill();
    }

    if(trail.length>200)trail.splice(0,trail.length-200);
    requestAnimationFrame(tick);
  }
  tick();

  // === 5. Click impact burst ===
  document.addEventListener('click',function(e){
    for(var i=0;i<25;i++){
      var angle=Math.random()*Math.PI*2;
      var col=nebColors[Math.floor(Math.random()*nebColors.length)];
      trail.push({
        x:e.clientX,y:e.clientY,
        r:Math.random()*20+5,
        vx:Math.cos(angle)*(Math.random()*4+2),
        vy:Math.sin(angle)*(Math.random()*4+2),
        life:1,decay:.015,col:col
      });
    }
    trail.push({
      x:e.clientX,y:e.clientY,r:5,vx:0,vy:0,
      life:1,decay:.04,col:[255,255,255]
    });
  });

})();
