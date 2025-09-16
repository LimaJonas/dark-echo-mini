// === Menu ===
const menu = document.getElementById('menu');
const startButton = document.getElementById('startGame');
startButton.addEventListener('click', () => {
  menu.style.display = 'none';
  loadLevel(currentLevel);
  lastTime = performance.now();
});

// === Config ===
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;
let gridOn = false;

// Offscreen map
const mapCanvas = document.createElement('canvas');
mapCanvas.width = W; mapCanvas.height = H;
const mapCtx = mapCanvas.getContext('2d');

// Zoom
let zoom = 1;
const ZOOM_STEP = 0.1;
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 3;

// Player
const player = {x:0,y:0,r:6,alpha:1,moving:false};
// Goal
const goal = {x:0,y:0,r:10};
// Level management
let currentLevel = 0;
// Pulses
let pulses = [];
const PULSE_SPEED = 2.0;
const PULSE_MAX = Math.hypot(W,H);
// Movement
let stepTimer = 0;
const STEP_INTERVAL = 500;
let keys = {};
let walls = [];

// Click/touch target
let touchTarget = null;
// Variáveis para pinch zoom
let lastPinchDist = null;

// --- Helpers ---
function rand(min,max){return Math.random()*(max-min)+min}

// --- Load Level ---
function loadLevel(index){
  const lvl = window.LEVELS[index];
  player.x = lvl.start.x;
  player.y = lvl.start.y;
  walls = lvl.walls.map(w=>({...w}));
  goal.x = lvl.goal.x;
  goal.y = lvl.goal.y;
  goal.r = lvl.goal.r;
  drawMap();
}

// --- Transition ---
let transitioning=false;
let fadeAlpha=0;
function nextLevel(){ transitioning=true; fadeAlpha=0; }
function updateTransition(delta){
  if(!transitioning) return false;
  fadeAlpha += delta/500;
  if(fadeAlpha>=1){
    fadeAlpha=1;
    currentLevel++;
    if(currentLevel>=window.LEVELS.length){
      alert("Parabéns! Você completou todos os níveis!");
      currentLevel=0;
    }
    loadLevel(currentLevel);
    transitioning=false;
    fadeAlpha=0;
  }
  return true;
}

// --- Map ---
function drawMap(){
  mapCtx.clearRect(0,0,W,H);
  mapCtx.fillStyle='#fff';
  walls.forEach(w=>mapCtx.fillRect(w.x,w.y,w.w,w.h));
}

// --- Collisions ---
function canMoveTo(nx,ny){
  for(const w of walls){
    if(nx+player.r>w.x && nx-player.r<w.x+w.w &&
       ny+player.r>w.y && ny-player.r<w.y+w.h) return false;
  }
  return true;
}

// --- Raycast ---
function castRay(px,py,angle,maxDist=PULSE_MAX){
  const cosA=Math.cos(angle), sinA=Math.sin(angle);
  const step=4;
  for(let d=0;d<=maxDist;d+=step){
    const sx=px+cosA*d;
    const sy=py+sinA*d;
    if(sx<0||sy<0||sx>W||sy>H) return {dist:d,x:sx,y:sy};
    for(const w of walls){
      if(sx>=w.x && sx<=w.x+w.w && sy>=w.y && sy<=w.y+w.h) return {dist:d,x:sx,y:sy,wall:w};
    }
  }
  return {dist:maxDist,x:px+Math.cos(angle)*maxDist,y:py+Math.sin(angle)*maxDist};
}

// --- Pulses ---
function emitPulse(type="manual"){
  if(type==="manual") pulses.push({x:player.x,y:player.y,r:4,alpha:1});
  else if(type==="step") pulses.push({x:player.x,y:player.y,r:2,alpha:0.8,step:true});
}

// --- Update ---
function update(delta){
  if(updateTransition(delta)) return;
  stepTimer += delta;

  // --- Keyboard ---
  let dx=0, dy=0;
  if(keys['ArrowUp']||keys['w']||keys['up']) dy-=1;
  if(keys['ArrowDown']||keys['s']||keys['down']) dy+=1;
  if(keys['ArrowLeft']||keys['a']||keys['left']) dx-=1;
  if(keys['ArrowRight']||keys['d']||keys['right']) dx+=1;

  // --- Mouse / Touch ---
  if(touchTarget && stepTimer > STEP_INTERVAL){
    stepTimer = 0;
    const dx = touchTarget.x - player.x;
    const dy = touchTarget.y - player.y;
    const dist = Math.hypot(dx, dy);

    if(dist < player.r){
      emitPulse();
      touchTarget = null;
    } else {
      const stepSize = 10;
      const nx = player.x + (dx/dist) * stepSize;
      const ny = player.y + (dy/dist) * stepSize;
      if(canMoveTo(nx, ny)){
        player.moving = true;
        player.alpha = 0;
        player.x = Math.max(16, Math.min(W-16, nx));
        player.y = Math.max(16, Math.min(H-16, ny));
        emitPulse("step");
        setTimeout(()=>{player.alpha=1; player.moving=false;},100);
      } else {
        // Se bater em parede, para o movimento
        touchTarget = null;
      }
    }
  }

  // Apply keyboard move
  if(dx!==0||dy!==0){
    if(stepTimer>STEP_INTERVAL){
      stepTimer=0;
      const stepSize=10;
      const nx=player.x+dx*stepSize;
      const ny=player.y+dy*stepSize;
      if(canMoveTo(nx,ny)){
        player.moving=true;
        player.alpha=0;
        player.x=Math.max(16,Math.min(W-16,nx));
        player.y=Math.max(16,Math.min(H-16,ny));
        emitPulse("step");
        setTimeout(()=>{player.alpha=1; player.moving=false;},100);
      }
    }
  }

  // --- Pulses ---
  for(let p of pulses){ p.r+=PULSE_SPEED; p.alpha*=(p.step?0.94:0.985); }
  pulses=pulses.filter(p=>p.r<PULSE_MAX && p.alpha>0.01);

  // --- Goal ---
  const distX = player.x - goal.x;
  const distY = player.y - goal.y;
  if(Math.hypot(distX,distY) < player.r + goal.r) nextLevel();
}

// --- Draw ---
function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.save();
  ctx.translate(canvas.width/2, canvas.height/2); // <-- use sempre o tamanho atual
  ctx.scale(zoom,zoom);
  ctx.translate(-player.x,-player.y);

  // Goal
  ctx.fillStyle='lime';
  ctx.beginPath();
  ctx.arc(goal.x,goal.y,goal.r,0,Math.PI*2);
  ctx.fill();

  // Pulses
  for(const p of pulses){
    const stepDeg=2;
    ctx.save();
    ctx.globalAlpha=p.alpha;
    ctx.beginPath();
    ctx.moveTo(p.x,p.y);
    for(let a=0;a<=360;a+=stepDeg){
      const ang=(a/180)*Math.PI;
      const hit=castRay(p.x,p.y,ang,p.r);
      ctx.lineTo(hit.x,hit.y);
    }
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(mapCanvas,0,0);
    ctx.restore();

    ctx.strokeStyle=`rgba(180,220,255,${0.8*p.alpha})`;
    ctx.lineWidth=1;
    for(let a=0;a<360;a+=stepDeg){
      const ang=(a/180)*Math.PI;
      const hit=castRay(p.x,p.y,ang,p.r);
      ctx.beginPath();
      ctx.moveTo(p.x,p.y);
      ctx.lineTo(hit.x,hit.y);
      ctx.stroke();
      if(hit.wall){
        ctx.beginPath();
        ctx.arc(hit.x,hit.y,1.5,0,Math.PI*2);
        ctx.fillStyle=`rgba(220,240,255,${0.9*p.alpha})`;
        ctx.fill();
      }
    }

    ctx.beginPath();
    ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
    ctx.strokeStyle=`rgba(140,190,255,${0.12*p.alpha})`;
    ctx.lineWidth=2;
    ctx.stroke();
  }

  // Player
  ctx.fillStyle='#fff';
  ctx.beginPath();
  ctx.arc(player.x,player.y,player.r,0,Math.PI*2);
  ctx.fill();
  ctx.restore();

  // Fade
  if(transitioning){
    ctx.save();
    ctx.fillStyle=`rgba(0,0,0,${fadeAlpha})`;
    ctx.fillRect(0,0,W,H);
    ctx.restore();
  }

  // Grid
  if(gridOn){
    ctx.strokeStyle='rgba(255,255,255,0.03)';
    ctx.lineWidth=1;
    const step=40;
    for(let x=0;x<W;x+=step){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
    for(let y=0;y<H;y+=step){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
  }
}

// --- Loop ---
let lastTime = performance.now();
function loop(){
  const now=performance.now();
  const delta=now-lastTime;
  lastTime=now;
  update(delta);
  draw();
  requestAnimationFrame(loop);
}

// --- Input ---
window.addEventListener('keydown', e=>{
  keys[e.key]=true;
  if(e.key===' '){ e.preventDefault(); emitPulse(); }
  if(e.key==='r'){ loadLevel(currentLevel); }
  if(e.key==='+'||e.key==='='){ zoom=Math.min(ZOOM_MAX,zoom+ZOOM_STEP); }
  if(e.key==='-'){ zoom=Math.max(ZOOM_MIN,zoom-ZOOM_STEP); }
  if(e.key==='f'){ if (canvas.requestFullscreen) canvas.requestFullscreen(); else if (canvas.webkitRequestFullscreen) canvas.webkitRequestFullscreen();}
});
window.addEventListener('keyup', e=>{ keys[e.key]=false; });

canvas.addEventListener('wheel', e=>{
  e.preventDefault();
  zoom = e.deltaY<0 ? Math.min(ZOOM_MAX,zoom+ZOOM_STEP) : Math.max(ZOOM_MIN,zoom-ZOOM_STEP);
});

// Click do mouse
canvas.addEventListener("mousedown", e => {
  const rect = canvas.getBoundingClientRect();
  const clickX = (e.clientX - rect.left) * (canvas.width / rect.width);
  const clickY = (e.clientY - rect.top) * (canvas.height / rect.height);

  // Use sempre o tamanho atual do canvas!
  const worldX = (clickX - canvas.width/2) / zoom + player.x;
  const worldY = (clickY - canvas.height/2) / zoom + player.y;

  const PULSE_TOUCH_RADIUS = player.r * 3;
  if (Math.hypot(worldX - player.x, worldY - player.y) < PULSE_TOUCH_RADIUS) {
    emitPulse();
    touchTarget = null;
  } else {
    touchTarget = { x: worldX, y: worldY };
  }
});
canvas.addEventListener("mouseup", () => {
  touchTarget = null;
});

// Touchscreen
canvas.addEventListener("touchstart", e => {
  if (e.touches.length === 2) {
    // Pinch zoom...
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    lastPinchDist = Math.hypot(dx, dy);
  } else {
    lastPinchDist = null;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const touchX = (touch.clientX - rect.left) * (canvas.width / rect.width);
    const touchY = (touch.clientY - rect.top) * (canvas.height / rect.height);

    // Use sempre o tamanho atual do canvas!
    const worldX = (touchX - canvas.width/2) / zoom + player.x;
    const worldY = (touchY - canvas.height/2) / zoom + player.y;

    const PULSE_TOUCH_RADIUS = player.r * 3; // ou 24, por exemplo
    // Touch
    if (Math.hypot(worldX - player.x, worldY - player.y) < PULSE_TOUCH_RADIUS) {
      emitPulse();
      touchTarget = null;
    } else {
      touchTarget = { x: worldX, y: worldY };
    }
  }
}, { passive: false });

canvas.addEventListener("touchmove", e => {
  if (e.touches.length === 2 && lastPinchDist !== null) {
    // Gesto de pinça detectado
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    const dist = Math.hypot(dx, dy);
    const delta = dist - lastPinchDist;
    if (Math.abs(delta) > 5) { // Evita zoom acidental
      if (delta > 0) {
        zoom = Math.min(ZOOM_MAX, zoom + ZOOM_STEP);
      } else {
        zoom = Math.max(ZOOM_MIN, zoom - ZOOM_STEP);
      }
      lastPinchDist = dist;
    }
    e.preventDefault();
  }
}, { passive: false });

canvas.addEventListener("touchend", e => {
  if (e.touches.length < 2) lastPinchDist = null;
  if (e.touches.length === 0) touchTarget = null;
});

const fullscreenBtn = document.getElementById('fullscreenBtn');
fullscreenBtn.addEventListener('click', () => {
  if (canvas.requestFullscreen) canvas.requestFullscreen();
  else if (canvas.webkitRequestFullscreen) canvas.webkitRequestFullscreen();
});

function resizeCanvas() {
  if (document.fullscreenElement === canvas || document.webkitFullscreenElement === canvas) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  } else {
    canvas.width = 960;
    canvas.height = 640;
  }
  // Atualiza variáveis de tamanho
  window.W = canvas.width;
  window.H = canvas.height;
  drawMap();
}
window.addEventListener('resize', resizeCanvas);
document.addEventListener('fullscreenchange', resizeCanvas);
document.addEventListener('webkitfullscreenchange', resizeCanvas);

// Inicializa tamanho correto
resizeCanvas();

// --- Start ---
loadLevel(currentLevel);
loop();
window.__darkEcho={player,walls,pulses,emitPulse};