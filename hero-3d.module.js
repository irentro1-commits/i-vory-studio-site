/* hero-3d.module.js — extracted from index.html inline module in U34 (19 Apr 2026).
 * Loaded ONLY on desktop via dynamic <script type="module" src="..."> tag.
 * Mobile + in-app WebView skip this file entirely (0 fetch, 0 parse).
 * Internal mobile short-circuit kept as defensive fallback in case of accidental load.
 * Requires importmap (still inline in index.html head) to resolve 'three' + 'three/addons/'.
 */
if(window.__IS_INAPP||window.__IS_MOBILE){/* U16: mobile + in-app skip Three.js. LCP fix (preloader blocking pana la Three.js resolve = 4-5s unpkg CDN chain). Desktop ramane full scene. U15 planificat SVG/Canvas2D overlay pentru efecte mobile. */var __pe=document.getElementById('pre');if(__pe){setTimeout(function(){__pe.classList.add('done')},350)}var __h3=document.querySelector('.hero3d');if(__h3)__h3.style.display='none';}else{
let heroReady=false;
const preMsgEl=document.getElementById('preMsg');
const preBarEl=document.getElementById('preBar');
const preEl=document.getElementById('pre');
const msgs=['Încărcăm experiența','Pregătim animații','Adăugăm efecte','Construim particulele','Finalizăm'];
let msgIdx=0,progress=0;
function stepPre(p,idx){progress=Math.max(progress,p);preBarEl.style.transform='scaleX('+progress+')';if(idx!==undefined&&idx!==msgIdx){msgIdx=idx;preMsgEl.style.opacity='0';setTimeout(()=>{preMsgEl.textContent=msgs[idx];preMsgEl.style.opacity='.85'},200)}}
stepPre(.15,0);
setTimeout(()=>stepPre(.3,1),400);

try{
const THREE=await import('three');
stepPre(.55,2);

const container=document.getElementById('hero3d');
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(window.__IS_MOBILE?90:60,container.clientWidth/container.clientHeight,.1,100);
camera.position.z=8;
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(window.devicePixelRatio,window.__HERO_FULL?2:1.25));
renderer.setSize(container.clientWidth,container.clientHeight);
renderer.setClearColor(0x000000,0);
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.15;
container.appendChild(renderer.domElement);

// Post-processing bloom
const {EffectComposer}=await import('three/addons/postprocessing/EffectComposer.js');
const {RenderPass}=await import('three/addons/postprocessing/RenderPass.js');
const {UnrealBloomPass}=await import('three/addons/postprocessing/UnrealBloomPass.js');
const composer=new EffectComposer(renderer);
composer.setPixelRatio(Math.min(window.devicePixelRatio,window.__HERO_FULL?2:1.25));
composer.setSize(container.clientWidth,container.clientHeight);

stepPre(.7,3);

// ========== DISTANT GALAXY SPIRAL ==========
const galaxyGeo=new THREE.PlaneGeometry(80,80);
const galaxyMat=new THREE.ShaderMaterial({
  uniforms:{time:{value:0}},
  vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:`varying vec2 vUv;uniform float time;
    float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);vec2 u=f*f*(3.-2.*f);
      return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y);}
    void main(){
      vec2 uv=vUv-vec2(.5);
      float r=length(uv);
      float a=atan(uv.y,uv.x);
      // Spiral arms
      float spiral=sin(a*2.+r*12.-time*.08)*.5+.5;
      spiral*=smoothstep(.5,.05,r);
      float core=smoothstep(.15,0.,r);
      float dust=noise(uv*8.+time*.02)*spiral;
      vec3 armCol=mix(vec3(.15,.25,.6),vec3(.8,.4,.9),spiral);
      vec3 coreCol=vec3(1.,.85,.6);
      vec3 col=mix(armCol*dust,coreCol,core);
      float alpha=(spiral*.35+core*.9)*smoothstep(.5,.1,r);
      gl_FragColor=vec4(col,alpha*.55);
    }`,
  transparent:true,depthWrite:false,blending:THREE.AdditiveBlending
});
const galaxy=new THREE.Mesh(galaxyGeo,galaxyMat);
galaxy.position.set(28,14,-40);
galaxy.rotation.z=.3;
if(window.__HERO_FULL)scene.add(galaxy);

// ========== RED NEBULA (Eagle/Carina style) ==========
const redNebGeo=new THREE.PlaneGeometry(60,60);
const redNebMat=new THREE.ShaderMaterial({
  uniforms:{time:{value:0}},
  vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:`varying vec2 vUv;uniform float time;
    float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);vec2 u=f*f*(3.-2.*f);
      return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y);}
    float fbm(vec2 p){float v=0.;float a=.5;for(int i=0;i<6;i++){v+=a*noise(p);p=p*2.+vec2(1.);a*=.5;}return v;}
    void main(){
      vec2 uv=vUv*2.;
      float t=time*.015;
      float n=fbm(uv+vec2(t,-t*.3));
      float n2=fbm(uv*2.+vec2(-t,t*.5));
      vec3 deepRed=vec3(.45,.05,.08);
      vec3 hotRed=vec3(.95,.25,.15);
      vec3 pink=vec3(.85,.35,.55);
      vec3 col=mix(deepRed,hotRed,smoothstep(.35,.75,n));
      col=mix(col,pink,smoothstep(.5,.85,n2)*.6);
      vec2 c=vUv-vec2(.5);
      float vignette=smoothstep(.55,.05,length(c));
      float alpha=smoothstep(.3,.75,n)*vignette*.55;
      gl_FragColor=vec4(col*1.2,alpha);
    }`,
  transparent:true,depthWrite:false,blending:THREE.AdditiveBlending
});
const redNeb=new THREE.Mesh(redNebGeo,redNebMat);
redNeb.position.set(-22,-12,-35);
redNeb.rotation.z=-.4;
if(window.__HERO_FULL)scene.add(redNeb);

// ========== ANDROMEDA-STYLE DISTANT GALAXY ==========
const androGeo=new THREE.PlaneGeometry(50,25);
const androMat=new THREE.ShaderMaterial({
  uniforms:{time:{value:0}},
  vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:`varying vec2 vUv;uniform float time;
    float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);vec2 u=f*f*(3.-2.*f);
      return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y);}
    void main(){
      vec2 uv=vUv-vec2(.5);
      uv.y*=2.;
      float r=length(uv);
      float a=atan(uv.y,uv.x);
      float arms=sin(a*2.+r*8.-time*.05)*.5+.5;
      arms*=smoothstep(.5,.05,r);
      float core=smoothstep(.15,0.,r);
      float dust=noise(uv*12.)*arms;
      vec3 armCol=mix(vec3(.4,.5,.85),vec3(.75,.55,.95),arms);
      vec3 coreCol=vec3(1.,.92,.75);
      vec3 col=mix(armCol*dust,coreCol,core);
      float alpha=(arms*.3+core*.85)*smoothstep(.5,.1,r)*.65;
      gl_FragColor=vec4(col,alpha);
    }`,
  transparent:true,depthWrite:false,blending:THREE.AdditiveBlending
});
const andromeda=new THREE.Mesh(androGeo,androMat);
andromeda.position.set(-35,18,-50);
andromeda.rotation.z=.6;
if(window.__HERO_FULL)scene.add(andromeda);

// ========== MARS (bottom-right, small) ==========
const marsGeo=new THREE.SphereGeometry(.6,32,32);
const marsMat=new THREE.MeshStandardMaterial({
  color:0xc2603a,
  roughness:.95,
  metalness:.05,
  emissive:0x2a0d05,
  emissiveIntensity:.2
});
const mars=new THREE.Mesh(marsGeo,marsMat);
mars.position.set(window.__IS_MOBILE?-2.5:10,window.__IS_MOBILE?1.5:-6,window.__IS_MOBILE?-5:-14);
scene.add(mars);

// ========== SHOOTING STARS ==========
const shootCount=0; // was window.__LOW_PERF?2:3 — disabled shooting stars
const shootStars=[];
for(let i=0;i<shootCount;i++){
  const trailLen=40;
  const positions=new Float32Array(trailLen*3);
  const opacities=new Float32Array(trailLen);
  for(let j=0;j<trailLen;j++){opacities[j]=1-j/trailLen}
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.BufferAttribute(positions,3));
  geo.setAttribute('alpha',new THREE.BufferAttribute(opacities,1));
  const mat=new THREE.ShaderMaterial({
    uniforms:{},
    vertexShader:`attribute float alpha;varying float vA;
void main(){vA=alpha;vec4 mv=modelViewMatrix*vec4(position,1.);gl_PointSize=(6./-mv.z)*alpha*8.;gl_Position=projectionMatrix*mv;}`,
    fragmentShader:`varying float vA;
void main(){vec2 c=gl_PointCoord-vec2(.5);float d=length(c);if(d>.5)discard;gl_FragColor=vec4(1.,.95,.8,vA*(1.-d*2.));}`,
    transparent:true,depthWrite:false,blending:THREE.AdditiveBlending
  });
  const points=new THREE.Points(geo,mat);
  scene.add(points);
  shootStars.push({points,trail:Array(trailLen).fill(null),active:false,delay:Math.random()*15,vel:new THREE.Vector3(),life:0});
}

function updateShooting(dt,t){
  for(const s of shootStars){
    if(!s.active){
      s.delay-=dt;
      if(s.delay<=0){
        const startX=-30+Math.random()*10;
        const startY=15+Math.random()*10;
        const startZ=-15-Math.random()*10;
        s.trail=s.trail.map(()=>new THREE.Vector3(startX,startY,startZ));
        s.vel.set(8+Math.random()*4,-3-Math.random()*2,2+Math.random()*2);
        s.active=true;s.life=0;
      }
    }else{
      s.life+=dt;
      // Shift trail
      for(let i=s.trail.length-1;i>0;i--)s.trail[i].copy(s.trail[i-1]);
      s.trail[0].addScaledVector(s.vel,dt);
      const pos=s.points.geometry.attributes.position.array;
      for(let i=0;i<s.trail.length;i++){
        pos[i*3]=s.trail[i].x;pos[i*3+1]=s.trail[i].y;pos[i*3+2]=s.trail[i].z;
      }
      s.points.geometry.attributes.position.needsUpdate=true;
      if(s.life>3){s.active=false;s.delay=4+Math.random()*8;}
    }
  }
}

// ========== PLANET EARTH — U41 realistic NASA Blue Marble + MeshStandardMaterial reactiv la lighting + clouds layer + atmosphere glow rim ==========
const _texLoader=new THREE.TextureLoader();
_texLoader.crossOrigin='anonymous';
const _NASA='https://threejs.org/examples/textures/planets/';
const earthDayTex=_texLoader.load(_NASA+'earth_atmos_2048.jpg', undefined, undefined, ()=>{
  if(window.__EARTH_TEX){const fb=_texLoader.load(window.__EARTH_TEX);fb.colorSpace=THREE.SRGBColorSpace;planetMat.map=fb;planetMat.needsUpdate=true;}
});
earthDayTex.colorSpace=THREE.SRGBColorSpace;
earthDayTex.anisotropy=8;
const earthSpecTex=_texLoader.load(_NASA+'earth_specular_2048.jpg');
const earthBumpTex=_texLoader.load(_NASA+'earth_normal_2048.jpg');

const planetGeo=new THREE.SphereGeometry(window.__IS_MOBILE?1.4:1.1,96,96);
const planetMat=new THREE.MeshStandardMaterial({
  map:earthDayTex,
  normalMap:earthBumpTex,
  normalScale:new THREE.Vector2(.55,.55),
  roughnessMap:earthSpecTex,
  roughness:.62,
  metalness:.05,
  color:0xffffff,
  emissive:0xffffff,
  emissiveMap:earthDayTex,
  emissiveIntensity:.35
});
planetMat.uniforms={time:{value:0}};
const planet=new THREE.Mesh(planetGeo,planetMat);
planet.position.set(window.__IS_MOBILE?0:-12,window.__IS_MOBILE?2.8:7,window.__IS_MOBILE?-3:-15);
scene.add(planet);

let _clouds=null;
if(!window.__IS_MOBILE){
  const cloudsTex=_texLoader.load(_NASA+'earth_clouds_2048.png');
  cloudsTex.colorSpace=THREE.SRGBColorSpace;
  const cloudsMat=new THREE.MeshStandardMaterial({
    map:cloudsTex,
    transparent:true,
    opacity:.55,
    roughness:1,
    metalness:0,
    depthWrite:false,
    blending:THREE.NormalBlending
  });
  _clouds=new THREE.Mesh(new THREE.SphereGeometry(1.118,64,64), cloudsMat);
  _clouds.position.copy(planet.position);
  scene.add(_clouds);
  window.__heroClouds=_clouds;
}

// ========== SOCIAL MEDIA SATELLITES ==========
function makeLogoTexture(bg,draw){
  const cvs=document.createElement('canvas');
  cvs.width=128;cvs.height=128;
  const ctx=cvs.getContext('2d');
  // Rounded square background
  ctx.fillStyle=bg;
  const r=28;
  ctx.beginPath();
  ctx.moveTo(r,0);ctx.lineTo(128-r,0);ctx.quadraticCurveTo(128,0,128,r);
  ctx.lineTo(128,128-r);ctx.quadraticCurveTo(128,128,128-r,128);
  ctx.lineTo(r,128);ctx.quadraticCurveTo(0,128,0,128-r);
  ctx.lineTo(0,r);ctx.quadraticCurveTo(0,0,r,0);
  ctx.closePath();ctx.fill();
  ctx.fillStyle='#fff';ctx.strokeStyle='#fff';
  draw(ctx);
  const tex=new THREE.CanvasTexture(cvs);
  tex.colorSpace=THREE.SRGBColorSpace;
  return tex;
}

const logos=[
  // Facebook - blue with f
  {tex:makeLogoTexture('#1877F2',c=>{c.font='bold 92px -apple-system,Arial';c.textAlign='center';c.textBaseline='middle';c.fillText('f',64,68);})},
  // Instagram - gradient-ish with camera square
  {tex:(()=>{const cvs=document.createElement('canvas');cvs.width=128;cvs.height=128;const ctx=cvs.getContext('2d');const grad=ctx.createLinearGradient(0,0,128,128);grad.addColorStop(0,'#F58529');grad.addColorStop(.5,'#DD2A7B');grad.addColorStop(1,'#8134AF');ctx.fillStyle=grad;const r=28;ctx.beginPath();ctx.moveTo(r,0);ctx.lineTo(128-r,0);ctx.quadraticCurveTo(128,0,128,r);ctx.lineTo(128,128-r);ctx.quadraticCurveTo(128,128,128-r,128);ctx.lineTo(r,128);ctx.quadraticCurveTo(0,128,0,128-r);ctx.lineTo(0,r);ctx.quadraticCurveTo(0,0,r,0);ctx.closePath();ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=7;ctx.beginPath();ctx.roundRect(28,28,72,72,16);ctx.stroke();ctx.beginPath();ctx.arc(64,64,18,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(86,42,5,0,Math.PI*2);ctx.fill();const t=new THREE.CanvasTexture(cvs);t.colorSpace=THREE.SRGBColorSpace;return t})()},
  // TikTok - black with musical note
  {tex:makeLogoTexture('#000000',c=>{c.fillStyle='#25F4EE';c.font='bold 78px -apple-system,Arial';c.textAlign='center';c.textBaseline='middle';c.fillText('♪',58,66);c.fillStyle='#FE2C55';c.fillText('♪',70,72);c.fillStyle='#fff';c.fillText('♪',64,68);})},
  // YouTube - red with play triangle
  {tex:makeLogoTexture('#FF0000',c=>{c.beginPath();c.moveTo(48,38);c.lineTo(48,90);c.lineTo(92,64);c.closePath();c.fill();})},
  // Pinterest - red P
  {tex:makeLogoTexture('#E60023',c=>{c.font='bold 92px -apple-system,Arial';c.textAlign='center';c.textBaseline='middle';c.fillText('P',64,68);})},
  // LinkedIn - blue with "in"
  {tex:makeLogoTexture('#0A66C2',c=>{c.font='bold 64px -apple-system,Arial';c.textAlign='center';c.textBaseline='middle';c.fillText('in',64,70);})},
  // Threads - black with @
  {tex:makeLogoTexture('#000000',c=>{c.font='bold 86px -apple-system,Arial';c.textAlign='center';c.textBaseline='middle';c.fillText('@',64,68);})},
  // X (Twitter) - black with X
  {tex:makeLogoTexture('#000000',c=>{c.font='bold 84px -apple-system,Arial';c.textAlign='center';c.textBaseline='middle';c.fillText('X',64,68);})},
  // Reddit - orange with alien
  {tex:makeLogoTexture('#FF4500',c=>{c.font='bold 84px -apple-system,Arial';c.textAlign='center';c.textBaseline='middle';c.fillText('r',64,70);})}
];

const satellites=[];
logos.forEach((l,i)=>{
  const mat=new THREE.SpriteMaterial({map:l.tex,transparent:true,depthWrite:false});
  const sprite=new THREE.Sprite(mat);
  sprite.scale.set(window.__IS_MOBILE?.55:.7,window.__IS_MOBILE?.55:.7,window.__IS_MOBILE?.55:.7);
  satellites.push({sprite,angle:(i/logos.length)*Math.PI*2,radius:window.__IS_MOBILE?2.1:2.4,speed:.35+i*.04,tilt:i*.12});
  scene.add(sprite);
});

// U41: ATMOSPHERE GLOW HALO ACTIVATED — fresnel rim albastru, signature realistic Earth
const haloGeo=new THREE.SphereGeometry(window.__IS_MOBILE?1.55:1.32,64,64);
const haloMat=new THREE.ShaderMaterial({
  uniforms:{},
  vertexShader:'varying vec3 vNormal;varying vec3 vViewDir;void main(){vec4 mvPos=modelViewMatrix*vec4(position,1.);vNormal=normalize(normalMatrix*normal);vViewDir=normalize(-mvPos.xyz);gl_Position=projectionMatrix*mvPos;}',
  fragmentShader:'varying vec3 vNormal;varying vec3 vViewDir;void main(){float f=pow(1.-max(dot(vNormal,vViewDir),0.),2.8);vec3 atmCol=mix(vec3(.18,.5,1.),vec3(.55,.78,1.),f);gl_FragColor=vec4(atmCol*f*1.7,f*.95);}',
  transparent:true,side:THREE.BackSide,depthWrite:false,blending:THREE.AdditiveBlending
});
const halo=new THREE.Mesh(haloGeo,haloMat);
halo.visible=false;
halo.position.copy(planet.position);
scene.add(halo);

// ========== NEBULA BACKDROP ==========
const nebulaGeo=new THREE.PlaneGeometry(120,120);
const nebulaMat=new THREE.ShaderMaterial({
  uniforms:{time:{value:0}},
  vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:`varying vec2 vUv;uniform float time;
    // Simple value noise
    float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);vec2 u=f*f*(3.-2.*f);
      return mix(mix(hash(i+vec2(0,0)),hash(i+vec2(1,0)),u.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y);}
    float fbm(vec2 p){float v=0.;float a=.5;for(int i=0;i<6;i++){v+=a*noise(p);p*=2.;a*=.5;}return v;}
    void main(){
      vec2 uv=vUv*3.;
      float t=time*.03;
      float n1=fbm(uv+vec2(t,-t*.5));
      float n2=fbm(uv*1.6+vec2(-t*.7,t));
      float n3=fbm(uv*.8+vec2(t*.3,t*.6));
      vec3 teal=vec3(.0,.55,.48);
      vec3 purple=vec3(.32,.05,.48);
      vec3 pink=vec3(.48,.08,.32);
      vec3 deep=vec3(.02,.02,.08);
      vec3 col=mix(deep,purple*.35,smoothstep(.55,.85,n1));
      col=mix(col,teal*.25,smoothstep(.65,.92,n2)*.5);
      col=mix(col,pink*.2,smoothstep(.7,.95,n3)*.3);
      vec2 c=vUv-vec2(.5);
      float vignette=smoothstep(.8,.05,length(c));
      col*=mix(.1,1.,vignette);
      gl_FragColor=vec4(col,.35);
    }`,
  transparent:true,depthWrite:false
});
const nebula=new THREE.Mesh(nebulaGeo,nebulaMat);
nebula.position.z=-30;
if(window.__HERO_FULL)scene.add(nebula);

// Particle field — 4000 particles forming a cloud (U12b: 1200 on mobile)
const particleCount=window.__HERO_FULL?4000:1200;
const positions=new Float32Array(particleCount*3);
const colors=new Float32Array(particleCount*3);
const sizes=new Float32Array(particleCount);
const basePositions=new Float32Array(particleCount*3);
const col1=new THREE.Color(0x00e0c0);
const col2=new THREE.Color(0x7b2cff);
const col3=new THREE.Color(0xff4da6);
for(let i=0;i<particleCount;i++){
  const r=3+Math.random()*8;
  const theta=Math.random()*Math.PI*2;
  const phi=Math.acos(2*Math.random()-1);
  const x=r*Math.sin(phi)*Math.cos(theta);
  const y=r*Math.sin(phi)*Math.sin(theta);
  const z=r*Math.cos(phi);
  positions[i*3]=x;positions[i*3+1]=y;positions[i*3+2]=z;
  basePositions[i*3]=x;basePositions[i*3+1]=y;basePositions[i*3+2]=z;
  const mix=Math.random();
  const c=mix<.5?col1.clone().lerp(col2,mix*2):col2.clone().lerp(col3,(mix-.5)*2);
  colors[i*3]=c.r;colors[i*3+1]=c.g;colors[i*3+2]=c.b;
  sizes[i]=Math.random()*.08+.02;
}
const geometry=new THREE.BufferGeometry();
geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
geometry.setAttribute('color',new THREE.BufferAttribute(colors,3));
geometry.setAttribute('size',new THREE.BufferAttribute(sizes,1));

const particleMaterial=new THREE.ShaderMaterial({
  uniforms:{time:{value:0},pixelRatio:{value:renderer.getPixelRatio()}},
  vertexShader:`
    attribute float size;
    varying vec3 vColor;
    uniform float time;
    uniform float pixelRatio;
    void main(){
      vColor=color;
      vec3 pos=position;
      pos.y+=sin(time*.5+position.x*.3)*.15;
      pos.x+=cos(time*.4+position.y*.3)*.12;
      vec4 mvPosition=modelViewMatrix*vec4(pos,1.);
      gl_PointSize=size*pixelRatio*(300./-mvPosition.z);
      gl_Position=projectionMatrix*mvPosition;
    }`,
  fragmentShader:`
    varying vec3 vColor;
    void main(){
      vec2 c=gl_PointCoord-vec2(.5);
      float d=length(c);
      if(d>.5)discard;
      float a=smoothstep(.5,0.,d);
      gl_FragColor=vec4(vColor,a*.85);
    }`,
  vertexColors:true,
  transparent:true,
  depthWrite:false,
  blending:THREE.AdditiveBlending
});
const particles=new THREE.Points(geometry,particleMaterial);
scene.add(particles);

// ========== DEEP SPACE STARFIELD ==========
const starCount=window.__HERO_FULL?(window.__LOW_PERF?4500:5500):1500;
const starPos=new Float32Array(starCount*3);
const starCol=new Float32Array(starCount*3);
const starSize=new Float32Array(starCount);
for(let i=0;i<starCount;i++){
  // 3 parallax shells: near (12-22), mid (22-38), far (38-60)
  const shell=Math.random();
  let r;
  if(shell<.35)r=12+Math.random()*10;
  else if(shell<.75)r=22+Math.random()*16;
  else r=38+Math.random()*22;
  const theta=Math.random()*Math.PI*2;
  const phi=Math.acos(2*Math.random()-1);
  starPos[i*3]=r*Math.sin(phi)*Math.cos(theta);
  starPos[i*3+1]=r*Math.sin(phi)*Math.sin(theta);
  starPos[i*3+2]=r*Math.cos(phi);
  // Rich color palette: white, blue-white, teal, pink-purple, orange (rare)
  const t=Math.random();
  if(t<.55){starCol[i*3]=.92;starCol[i*3+1]=.96;starCol[i*3+2]=1;}
  else if(t<.72){starCol[i*3]=.65;starCol[i*3+1]=.8;starCol[i*3+2]=1;}
  else if(t<.85){starCol[i*3]=.35;starCol[i*3+1]=.95;starCol[i*3+2]=.88;}
  else if(t<.95){starCol[i*3]=.85;starCol[i*3+1]=.4;starCol[i*3+2]=.95;}
  else{starCol[i*3]=1;starCol[i*3+1]=.55;starCol[i*3+2]=.35;}
  starSize[i]=Math.random()*.08+.012;
}
const starGeo=new THREE.BufferGeometry();
starGeo.setAttribute('position',new THREE.BufferAttribute(starPos,3));
starGeo.setAttribute('color',new THREE.BufferAttribute(starCol,3));
starGeo.setAttribute('size',new THREE.BufferAttribute(starSize,1));
const starMat=new THREE.ShaderMaterial({
  uniforms:{time:{value:0},pixelRatio:{value:renderer.getPixelRatio()},warp:{value:0}},
  vertexShader:`attribute float size;varying vec3 vCol;varying float vWarp;uniform float time;uniform float pixelRatio;uniform float warp;
void main(){vCol=color;vWarp=warp;vec4 mv=modelViewMatrix*vec4(position,1.);float twinkle=.7+.3*sin(time*2.+position.x*5.+position.y*5.);gl_PointSize=size*pixelRatio*(400./-mv.z)*twinkle*(1.+warp*8.);gl_Position=projectionMatrix*mv;}`,
  fragmentShader:`varying vec3 vCol;
void main(){vec2 c=gl_PointCoord-vec2(.5);float d=length(c);if(d>.5)discard;float a=smoothstep(.5,0.,d);gl_FragColor=vec4(vCol,a);}`,
  vertexColors:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending
});
const stars=new THREE.Points(starGeo,starMat);window.__starMat=starMat;
scene.add(stars);

stepPre(.85,4);

// U12d tier adaptive: elephant + glow rulat pe HERO_FULL (desktop + high-end mobile)
let elephantGroup=null,scaleF=1,glowMat=null,glowMesh=null;
if(window.__HERO_FULL){
// ========== ELEPHANT 3D EXTRUDED FROM SVG ==========
const {SVGLoader}=await import('three/addons/loaders/SVGLoader.js');
const svgText=window.__LOGO_SVG_B64?atob(window.__LOGO_SVG_B64):'';
const svgLoader=new SVGLoader();
const svgData=svgLoader.parse(svgText);

elephantGroup=new THREE.Group();
const extrudeSettings={depth:40,bevelEnabled:true,bevelThickness:2,bevelSize:1,bevelSegments:2,steps:1};

// Metallic teal material with emissive glow for bloom to catch
const elephantMat=new THREE.MeshStandardMaterial({
  color:0x00e0c0,
  metalness:.85,
  roughness:.15,
  emissive:0x00a890,
  emissiveIntensity:.55,
  transparent:true,
  opacity:.82
});

for(const path of svgData.paths){
  const shapes=SVGLoader.createShapes(path);
  for(const shape of shapes){
    const geo=new THREE.ExtrudeGeometry(shape,extrudeSettings);
    const mesh=new THREE.Mesh(geo,elephantMat);
    elephantGroup.add(mesh);
    // Sharp bright edges that bloom will catch
    const edges=new THREE.EdgesGeometry(geo,15);
    const edgeMat=new THREE.LineBasicMaterial({color:0x7dffe6,transparent:true,opacity:.85,linewidth:2});
    const edgeLines=new THREE.LineSegments(edges,edgeMat);
    elephantGroup.add(edgeLines);
  }
}

// Lights for the standard material
const keyLight=new THREE.DirectionalLight(0x00ffdd,1.2);
keyLight.position.set(5,8,10);
scene.add(keyLight);
const fillLight=new THREE.DirectionalLight(0x4dccff,.6);
fillLight.position.set(-8,-3,6);
scene.add(fillLight);
const rimLight=new THREE.DirectionalLight(0xe8734a,.8);
rimLight.position.set(0,-5,-8);
scene.add(rimLight);
const ambient=new THREE.AmbientLight(0x445566,.95);
scene.add(ambient);
const sunEarth=new THREE.DirectionalLight(0xfff5e0,2.6);
sunEarth.position.set(-6,9,8);
scene.add(sunEarth);

// Center and scale the group
const box=new THREE.Box3().setFromObject(elephantGroup);
const center=box.getCenter(new THREE.Vector3());
const size=box.getSize(new THREE.Vector3());
const maxDim=Math.max(size.x,size.y);
const targetSize=window.__IS_MOBILE?2.8:2.3;
scaleF=targetSize/maxDim;
elephantGroup.children.forEach(m=>{
  m.geometry.translate(-center.x,-center.y,-20);
  m.position.z=-1;
});
elephantGroup.scale.set(scaleF,-scaleF,scaleF);
// SVG Y flip handled via scale.y=-1
scene.add(elephantGroup);

// Glow backdrop
const glowGeo=new THREE.CircleGeometry(4.5,64);
glowMat=new THREE.ShaderMaterial({
  uniforms:{time:{value:0}},
  vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:'varying vec2 vUv;uniform float time;void main(){vec2 c=vUv-vec2(.5);float d=length(c);float pulse=.5+.5*sin(time*1.2);float a=smoothstep(.5,0.,d)*(.12+pulse*.08);gl_FragColor=vec4(0.,.88,.75,a);}',
  transparent:true,depthWrite:false,blending:THREE.AdditiveBlending
});
glowMesh=new THREE.Mesh(glowGeo,glowMat);
glowMesh.position.z=-3;
scene.add(glowMesh);
} // end U12b !MOB elephant+glow block

// Mouse + scroll state
let mouseX=0,mouseY=0,targetMouseX=0,targetMouseY=0,scrollProg=0;
window.addEventListener('mousemove',e=>{targetMouseX=(e.clientX/window.innerWidth-.5)*2;targetMouseY=(e.clientY/window.innerHeight-.5)*2},{passive:true});
window.addEventListener('scroll',()=>{const pr=document.getElementById('prob');if(!pr)return;const r=pr.getBoundingClientRect();const tot=pr.offsetHeight-window.innerHeight;scrollProg=Math.max(0,Math.min(1,-r.top/tot))},{passive:true});

// U12d: bloom composer doar pe HERO_FULL (desktop + high-end mobile)
let bloomPass=null;
if(window.__HERO_FULL){
composer.addPass(new RenderPass(scene,camera));
bloomPass=new UnrealBloomPass(new THREE.Vector2(container.clientWidth,container.clientHeight),0.7,0.9,0.2);
bloomPass.threshold=0;
bloomPass.strength=0.55;
bloomPass.radius=0.85;
composer.addPass(bloomPass);
}

const clock=new THREE.Clock();
let _lastT=0;
function animate(){
  const t=clock.getElapsedTime();
  const dt=Math.min(t-_lastT,.1);_lastT=t;
  mouseX+=(targetMouseX-mouseX)*.05;
  mouseY+=(targetMouseY-mouseY)*.05;
  particleMaterial.uniforms.time.value=t;
  nebulaMat.uniforms.time.value=t;
  starMat.uniforms.time.value=t;
  galaxyMat.uniforms.time.value=t;
  redNebMat.uniforms.time.value=t;
  androMat.uniforms.time.value=t;
  planetMat.uniforms.time.value=t;
  planet.rotation.y=t*.05;
  if(_clouds){_clouds.rotation.y=t*.07;_clouds.position.copy(planet.position);}
  if(halo.visible){halo.position.copy(planet.position);}
  mars.rotation.y=t*.08;
  // Orbit satellites around Earth
  satellites.forEach(s=>{
    s.angle+=s.speed*.01;
    const x=Math.cos(s.angle)*s.radius;
    const z=Math.sin(s.angle)*s.radius;
    const y=Math.sin(s.angle*.7+s.tilt)*.4;
    s.sprite.position.set(planet.position.x+x,planet.position.y+y,planet.position.z+z);
  });
  // updateShooting(dt,t); // disabled — created linear trails confused as cursor lines
  // Cursor gravity — subtle pull toward mouse for planet & mars
  const pullX=mouseX*.8;
  const pullY=mouseY*.5;
  const _pbx=window.__IS_MOBILE?0:-12,_pby=window.__IS_MOBILE?2.8:7,_mbx=window.__IS_MOBILE?-2.5:10,_mby=window.__IS_MOBILE?1.5:-6;
  planet.position.x=_pbx+pullX*.6;
  planet.position.y=_pby+pullY*.4;
  mars.position.x=_mbx+pullX*.5;
  mars.position.y=_mby+pullY*.3;
  // Scroll camera — zoom out & pitch as you scroll
  // Cinematic multi-stage camera path
  const _sP=scrollProg;
  const _stage=_sP*4; // 4 stages
  const _baseZ=window.__IS_MOBILE?7:8;
  camera.position.z=_baseZ+Math.sin(_stage*Math.PI*.5)*(window.__IS_MOBILE?2.5:5)+_sP*(window.__IS_MOBILE?2:3);
  camera.position.x=Math.sin(_stage*.8)*(window.__IS_MOBILE?.8:2.2);
  camera.position.y=Math.sin(_stage*.6)*(window.__IS_MOBILE?.6:1.3)+_sP*.3;
  camera.rotation.x=-_sP*.12+Math.sin(_stage*.4)*.05;
  camera.rotation.y=Math.sin(_stage*.5)*(window.__IS_MOBILE?.04:.08);
  particles.rotation.y=t*.05+mouseX*.3+scrollProg*.8;
  particles.rotation.x=mouseY*.2+scrollProg*.3;
  // Gravitational drift — orbits slowly in XY plane with bobbing
  if(elephantGroup){
  elephantGroup.rotation.y=t*.15+mouseX*.9;
  elephantGroup.rotation.x=Math.sin(t*.4)*.08-mouseY*.3;
  elephantGroup.rotation.z=Math.cos(t*.25)*.12;
  elephantGroup.position.x=Math.sin(t*.18)*4.5+mouseX*1.8;
  elephantGroup.position.y=Math.cos(t*.23)*2.8+Math.sin(t*.5)*.4-mouseY*1.2;
  elephantGroup.position.z=Math.sin(t*.14)*2.5;
  const eScale=scaleF*(1+Math.sin(t*.8)*.05);
  elephantGroup.scale.set(eScale,-eScale,eScale);
  glowMat.uniforms.time.value=t;
  glowMesh.position.x=elephantGroup.position.x;
  glowMesh.position.y=elephantGroup.position.y;
  glowMesh.position.z=elephantGroup.position.z-1;
  }
  
  if(window.__HERO_FULL)composer.render();else renderer.render(scene,camera);
  if(window.__HERO_VISIBLE!==false)__rafId=requestAnimationFrame(animate);
}
// U12c: pause rAF Three.js cand hero iese din viewport (Chrome mobile scroll fix)
var __rafId=null;window.__HERO_VISIBLE=true;
try{var __heroObs=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){if(!window.__HERO_VISIBLE){window.__HERO_VISIBLE=true;animate()}}else{window.__HERO_VISIBLE=false;if(__rafId)cancelAnimationFrame(__rafId)}})},{threshold:0.01});__heroObs.observe(container);}catch(_){}
animate();

window.addEventListener('resize',()=>{
  camera.aspect=container.clientWidth/container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth,container.clientHeight);
  if(window.__HERO_FULL){composer.setSize(container.clientWidth,container.clientHeight);if(bloomPass)bloomPass.setSize(container.clientWidth,container.clientHeight);}
},{passive:true});

heroReady=true;
stepPre(1);
setTimeout(()=>preEl.classList.add('done'),600);
}catch(err){
  console.warn('Three.js fail, using fallback',err);
  stepPre(1);
  setTimeout(()=>preEl.classList.add('done'),400);
}
}
