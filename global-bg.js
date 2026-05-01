/* global-bg.js — BATCH 4A M1: continuous backdrop WebGL gradient + noise driven by scroll progress
   Replaces static .bgblobs cu canvas full-page WebGL animated gradient.
   Effect: gradient cosmic care isi schimba culoarea + intensitatea pe scroll progress global.
   Premium 2026 pattern (oryzo.ai, locomotive). DESKTOP only.
*/
(function(){
  'use strict';
  if(window.__GLOBAL_BG_LOADED)return;
  if(window.__IS_MOBILE||window.__IS_INAPP)return;
  if(!window.matchMedia||!window.matchMedia("(pointer:fine)").matches)return;
  if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  window.__GLOBAL_BG_LOADED=true;

  function init(){
    // Hide existing static .bgblobs (gradient devine WebGL controlled)
    const oldBg=document.querySelector('.bgblobs');
    if(oldBg) oldBg.style.display='none';

    const canvas=document.createElement('canvas');
    canvas.id='gbg-canvas';
    canvas.style.cssText='position:fixed;inset:0;width:100%;height:100%;z-index:-2;pointer-events:none;will-change:transform;';
    document.body.insertBefore(canvas, document.body.firstChild);

    const gl=canvas.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: false });
    if(!gl){ console.warn('[global-bg] WebGL unavailable, restoring bgblobs'); if(oldBg) oldBg.style.display=''; return; }

    function compile(type, src){
      const sh=gl.createShader(type);
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if(!gl.getShaderParameter(sh, gl.COMPILE_STATUS)){
        console.warn('[global-bg] compile err', gl.getShaderInfoLog(sh));
        return null;
      }
      return sh;
    }

    const vs=compile(gl.VERTEX_SHADER, `
      attribute vec2 a_pos;
      varying vec2 v_uv;
      void main(){ v_uv = a_pos * 0.5 + 0.5; gl_Position = vec4(a_pos, 0., 1.); }
    `);
    const fs=compile(gl.FRAGMENT_SHADER, `
      precision highp float;
      varying vec2 v_uv;
      uniform float u_time;
      uniform vec2 u_res;
      uniform float u_scroll;     // 0..1 page scroll progress
      uniform vec2 u_mouse;       // 0..1 mouse pos

      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
      float noise(vec2 p){
        vec2 i=floor(p), f=fract(p), u=f*f*(3.0-2.0*f);
        return mix(mix(hash(i), hash(i+vec2(1,0)), u.x),
                   mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), u.x), u.y);
      }
      float fbm(vec2 p){
        float v=0., a=0.5;
        for(int i=0;i<5;i++){ v+=a*noise(p); p=p*2.0+vec2(1.); a*=0.5; }
        return v;
      }

      void main(){
        vec2 uv = v_uv;
        vec2 aspect = vec2(u_res.x/u_res.y, 1.0);
        vec2 p = (uv - 0.5) * aspect;
        float t = u_time * 0.025;

        // Mouse parallax subtle
        vec2 m = (u_mouse - 0.5) * aspect * 0.15;
        p += m * 0.4;

        // Domain warp
        vec2 q = vec2(fbm(p + t), fbm(p + vec2(5.2, 1.3) + t));
        vec2 r = vec2(fbm(p + 2.0*q + vec2(1.7, 9.2) - t),
                      fbm(p + 2.0*q + vec2(8.3, 2.8) + t));
        float n = fbm(p + 2.0*r);

        // Color phase by scroll: 0 = cosmic dark teal, 0.5 = mid purple, 1 = deep magenta-cosmic
        float phase = u_scroll;
        vec3 c1 = mix(vec3(0.02,0.04,0.10), vec3(0.06,0.02,0.14), phase);                // base
        vec3 c2 = mix(vec3(0.0,0.55,0.55), vec3(0.30,0.18,0.95), phase);                  // accent 1
        vec3 c3 = mix(vec3(0.30,0.10,0.55), vec3(0.65,0.20,0.85), phase);                 // accent 2
        vec3 c4 = mix(vec3(0.45,0.08,0.50), vec3(0.20,0.05,0.30), phase);                 // deep

        vec3 col = mix(c1, c2, smoothstep(0.20, 0.55, n) * 0.55);
        col = mix(col, c3, smoothstep(0.55, 0.80, length(r)) * 0.50);
        col = mix(col, c4, smoothstep(0.75, 0.95, n) * 0.30);

        // Center-top vignette emphasizing hero glow zone
        vec2 vc = vec2(0.0, 0.18) - p;  // glow centered slightly above middle
        float glow = exp(-length(vc) * 1.4) * 0.25;
        col += vec3(glow * 0.6, glow * 0.4, glow * 0.9);

        // Outer vignette dark
        float vig = smoothstep(1.4, 0.6, length(p));
        col *= mix(0.60, 1.0, vig);

        // Grain
        col += (hash(uv * 1500.0 + t * 100.0) - 0.5) * 0.012;

        gl_FragColor = vec4(col, 1.0);
      }
    `);
    if(!vs||!fs){ if(oldBg) oldBg.style.display=''; return; }
    const prog=gl.createProgram();
    gl.attachShader(prog, vs); gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if(!gl.getProgramParameter(prog, gl.LINK_STATUS)){
      console.warn('[global-bg] link err', gl.getProgramInfoLog(prog));
      if(oldBg) oldBg.style.display='';
      return;
    }
    gl.useProgram(prog);

    const buf=gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    const aPos=gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uTime=gl.getUniformLocation(prog, 'u_time');
    const uRes=gl.getUniformLocation(prog, 'u_res');
    const uScroll=gl.getUniformLocation(prog, 'u_scroll');
    const uMouse=gl.getUniformLocation(prog, 'u_mouse');

    let scrollVal=0, scrollTarget=0, mx=0.5, my=0.5, tmx=0.5, tmy=0.5;

    function resize(){
      const dpr=Math.min(window.devicePixelRatio||1, 1.4);
      canvas.width=Math.floor(window.innerWidth*dpr);
      canvas.height=Math.floor(window.innerHeight*dpr);
      gl.viewport(0,0,canvas.width,canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
    }
    resize();
    window.addEventListener('resize', resize);

    window.addEventListener('mousemove', e=>{
      tmx=e.clientX/window.innerWidth;
      tmy=e.clientY/window.innerHeight;
    });

    function updateScroll(){
      const sh=document.documentElement.scrollHeight - window.innerHeight;
      const st=window.scrollY||document.documentElement.scrollTop;
      scrollTarget = sh > 0 ? Math.min(1, Math.max(0, st/sh)) : 0;
    }
    window.addEventListener('scroll', updateScroll, { passive: true });
    updateScroll();

    const start=performance.now();
    function loop(){
      const t=(performance.now()-start)/1000;
      scrollVal += (scrollTarget - scrollVal) * 0.06;
      mx += (tmx - mx) * 0.04;
      my += (tmy - my) * 0.04;
      gl.uniform1f(uTime, t);
      gl.uniform1f(uScroll, scrollVal);
      gl.uniform2f(uMouse, mx, my);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      requestAnimationFrame(loop);
    }
    loop();
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
