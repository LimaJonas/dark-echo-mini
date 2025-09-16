// --- Map ---
function drawMap(){
     mapCtx.clearRect(0,0,W,H);
     mapCtx.fillStyle='#fff';
     walls.forEach(w=>mapCtx.fillRect(w.x,w.y,w.w,w.h));
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
               const nx = player.x + (dx/dist) * stepSize;
               const ny = player.y + (dy/dist) * stepSize;
               if(canMoveTo(nx, ny)){
                    player.moving = true;
                    player.alpha = 0;
                    player.targetX = Math.max(16, Math.min(W-16, nx));
                    player.targetY = Math.max(16, Math.min(H-16, ny));
                    emitPulse("step");
                    setTimeout(()=>{player.alpha=1; player.moving=false;},100);
               } else {
                    touchTarget = null;
               }
          }
     }

     // Movimento com teclado
     if(dx!==0||dy!==0){
          if(stepTimer>STEP_INTERVAL){
               stepTimer=0;
               const nx=player.x+dx*stepSize;
               const ny=player.y+dy*stepSize;
               if(canMoveTo(nx,ny)){
                    player.moving=true;
                    player.alpha=0;
                    player.targetX=Math.max(16,Math.min(W-16,nx));
                    player.targetY=Math.max(16,Math.min(H-16,ny));
                    emitPulse("step");
                    setTimeout(()=>{player.alpha=1; player.moving=false;},100);
               }
          }
     }

     // Movimento suave do player
     const lerp = (a, b, t) => a + (b - a) * t;
     player.x = lerp(player.x, player.targetX, player.speed * delta / 1000);
     player.y = lerp(player.y, player.targetY, player.speed * delta / 1000);


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

     if(DEV_MODE){
          ctx.fillStyle = '#fff'; // branco
          walls.forEach(w => ctx.fillRect(w.x, w.y, w.w, w.h));          
     }

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