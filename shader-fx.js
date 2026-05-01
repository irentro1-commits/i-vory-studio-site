/* shader-fx.js — BATCH 3 premium 2026 WebGL ambient gradient shader
   Adds canvas full-bleed in spate la S2 hero cu animated gradient noise (domain warp).
   Gated DESKTOP only + prefers-reduced-motion + WebGL support detect.
   Performance: 60fps GPU, single full-screen quad pass.
*/
(function(){
  'use strict';
  if(window.__SHADER_FX_LOADED)return;
  if(window.__IS_MOBILE||window.__IS_INAPP)return;
  if(!window.matchMedia||!window.matchMedia("(pointer:fine)").matches)return;
  if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  window.__SHADER_FX_LOADED=true;

  function init(){
    const s2=document.querySelector('.s2');
    if(!s2)return;

    const cs=window.getComputedStyle(s2);
    if(cs.position==='static')s2.style.position='relative';
    const canvas=document.createElement('canvas');
    canvas.style.cssText='position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;opacity:.55;mix-blend-mode:screen;';
    s2.insertBefore(canvas, s2.firstChild);

    const gl=canvas.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: false });
    if(!gl){console.warn('[shader-fx] WebGL not available');return;}

    function compileShader(type, source){
      const sh=gl.createShader(type);
      gl.shaderSource(sh, source);
      gl.compileShader(sh);
      if(!gl.getShaderParameter(sh, gl.COMPILE_STATUS)){
        console.warn('[shader-fx] compile err', gl.getShaderInfoLog(sh));
        gl.deleteShader(sh);
        return null;
      }
      return sh;
    }

    const vsSrc = `
      attribute vec2 a_pos;
      varying vec2 v_uv;
      void main(){
        v_uv = a_pos * 0.5 + 0.5;
        gl_Position = vec4(a_pos, 0., 1.);
      }
    `;
    const fsSrc = `
      precision highp float;
      varying vec2 v_uv;
      uniform float u_time;
      uniform vec2 u_res;
      uniform vec2 u_mouse;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
      float noise(vec2 p){
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f*f*(3.0-2.0*f);
        return mix( mix(hash(i), hash(i+vec2(1,0)), u.x),
                    mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), u.x), u.y );
      }
      float fbm(vec2 p){
        float v = 0., a = 0.5;
        for(int i=0;i<5;i++){ v += a*noise(p); p = p*2.0 + vec2(1.); a *= 0.5; }
        return v;
      }
      void main(){
        vec2 uv = v_uv;
        vec2 aspect = vec2(u_res.x/u_res.y, 1.0);
        vec2 p = (uv - 0.5) * aspect;
        float t = u_time * 0.06;
        vec2 m = (u_mouse - 0.5) * aspect * 0.4;
        p += m * 0.2;
        vec2 q = vec2(fbm(p + t), fbm(p + vec2(5.2, 1.3) + t));
        vec2 r = vec2(fbm(p + 4.0*q + vec2(1.7, 9.2) - t),
                      fbm(p + 4.0*q + vec2(8.3, 2.8) + t));
        float n = fbm(p + 4.0*r);
        vec3 c1 = vec3(0.0, 0.88, 0.75);
        vec3 c2 = vec3(0.48, 0.17, 1.0);
        vec3 c3 = vec3(0.73, 0.33, 0.85);
        vec3 c4 = vec3(0.05, 0.08, 0.18);
        vec3 col = mix(c4, c1, smoothstep(0.0, 0.5, n));
        col = mix(col, c2, smoothstep(0.5, 0.85, n) * 0.7);
        col = mix(col, c3, smoothstep(0.65, 0.95, length(r)) * 0.4);
        float vig = smoothstep(1.1, 0.3, length(p));
        col *= vig;
        col += (hash(uv * 1000.0 + t) - 0.5) * 0.02;
        gl_FragColor = vec4(col, n * 0.85);
      }
    `;

    const vs=compileShader(gl.VERTEX_SHADER, vsSrc);
    const fs=compileShader(gl.FRAGMENT_SHADER, fsSrc);
    if(!vs||!fs)return;
    const program=gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if(!gl.getProgramParameter(program, gl.LINK_STATUS)){
      console.warn('[shader-fx] link err', gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    const buf=gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    const aPos=gl.getAttribLocation(program, 'a_pos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uTime=gl.getUniformLocation(program, 'u_time');
    const uRes=gl.getUniformLocation(program, 'u_res');
    const uMouse=gl.getUniformLocation(program, 'u_mouse');

    let mx=0.5, my=0.5, tmx=0.5, tmy=0.5;
    s2.addEventListener('mousemove', e=>{
      const r=s2.getBoundingClientRect();
      tmx=(e.clientX-r.left)/r.width;
      tmy=(e.clientY-r.top)/r.height;
    });

    function resize(){
      const dpr=Math.min(window.devicePixelRatio||1, 1.5);
      const w=canvas.clientWidth, h=canvas.clientHeight;
      canvas.width=Math.floor(w*dpr);
      canvas.height=Math.floor(h*dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
    }
    resize();
    window.addEventListener('resize', resize);

    const start=performance.now();
    let isVisible=true;
    const io=new IntersectionObserver(entries=>{
      entries.forEach(e=>{ isVisible=e.isIntersecting; });
    });
    io.observe(s2);

    function loop(){
      if(isVisible){
        const t=(performance.now()-start)/1000;
        mx += (tmx-mx)*0.05;
        my += (tmy-my)*0.05;
        gl.uniform1f(uTime, t);
        gl.uniform2f(uMouse, mx, my);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
      requestAnimationFrame(loop);
    }
    loop();
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
