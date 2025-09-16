// --- Inputs ---
window.addEventListener('keydown', e=>{ //Funções de teclas extras
    keys[e.key]=true;
    if(e.key===' '){ e.preventDefault(); emitPulse(); }
    if(e.key==='r'){ loadLevel(currentLevel); }
    if(e.key==='+'||e.key==='='){ zoom=Math.min(ZOOM_MAX,zoom+ZOOM_STEP); }
    if(e.key==='-'){ zoom=Math.max(ZOOM_MIN,zoom-ZOOM_STEP); }
    if(e.key==='f'){ if (canvas.requestFullscreen) canvas.requestFullscreen(); else if (canvas.webkitRequestFullscreen) canvas.webkitRequestFullscreen();}
});
window.addEventListener('keyup', e=>{ keys[e.key]=false; });

canvas.addEventListener('wheel', e=>{ //Zoom em roda do mouse
     e.preventDefault();
     zoom = e.deltaY<0 ? Math.min(ZOOM_MAX,zoom+ZOOM_STEP) : Math.max(ZOOM_MIN,zoom-ZOOM_STEP);
});

// Funções do click do mouse
canvas.addEventListener("mousedown", e => {
     const rect = canvas.getBoundingClientRect();
     const clickX = (e.clientX - rect.left) * (canvas.width / rect.width);
     const clickY = (e.clientY - rect.top) * (canvas.height / rect.height);

     // Usando sempre o tamanho atual do canvas
     const worldX = (clickX - canvas.width/2) / zoom + player.x;
     const worldY = (clickY - canvas.height/2) / zoom + player.y;

     const PULSE_TOUCH_RADIUS = player.r * 3; //Range da area de clique do player
     if (Math.hypot(worldX - player.x, worldY - player.y) < PULSE_TOUCH_RADIUS) { //Clique no player
          emitPulse();
          touchTarget = null;
     } else { //Clique no canvas
          touchTarget = { x: worldX, y: worldY };
     }
});
canvas.addEventListener("mouseup", () => { touchTarget = null; });
// Touchscreen
canvas.addEventListener("touchstart", e => {
  if (e.touches.length === 2) { //Zoom com pinça
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    lastPinchDist = Math.hypot(dx, dy);
  } else {
    lastPinchDist = null;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const touchX = (touch.clientX - rect.left) * (canvas.width / rect.width);
    const touchY = (touch.clientY - rect.top) * (canvas.height / rect.height);

    // Usando sempre o tamanho atual do canvas!
    const worldX = (touchX - canvas.width/2) / zoom + player.x;
    const worldY = (touchY - canvas.height/2) / zoom + player.y;

    const PULSE_TOUCH_RADIUS = player.r * 3; //Range da area de clique do player
    if (Math.hypot(worldX - player.x, worldY - player.y) < PULSE_TOUCH_RADIUS) { //Toque no player
      emitPulse();
      touchTarget = null;
    } else { //Toque no canvas
      touchTarget = { x: worldX, y: worldY };
    }
  }
}, { passive: false });

canvas.addEventListener("touchmove", e => { //Verificando pinça para zoom
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

canvas.addEventListener("touchend", e => { //Ao soltar toque
     if (e.touches.length < 2) lastPinchDist = null;
     if (e.touches.length === 0) touchTarget = null;
});