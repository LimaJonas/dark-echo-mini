// === Menu ===
const menu = document.getElementById('menu');
const startButton = document.getElementById('startGame');
startButton.addEventListener('click', () => {
     menu.style.display = 'none';
     loadLevel(currentLevel);
     lastTime = performance.now();

     // Se for smartphone, entra em fullscreen automaticamente
     if (/Android|iPhone|iPad|iPod|Opera Mini|IEMobile|Mobile/i.test(navigator.userAgent)) {
          if (canvas.requestFullscreen) canvas.requestFullscreen();
          else if (canvas.webkitRequestFullscreen) canvas.webkitRequestFullscreen();
     }
});

const fullscreenBtn = document.getElementById('fullscreenBtn');
fullscreenBtn.addEventListener('click', () => {
     if (canvas.requestFullscreen) canvas.requestFullscreen();
     else if (canvas.webkitRequestFullscreen) canvas.webkitRequestFullscreen();
});

const reset = document.getElementById('reset');
reset.addEventListener('click', () => {
     loadLevel(currentLevel)
});

// --- Load Level ---
function loadLevel(index){
    const lvl = window.LEVELS[index];
    player.targetX = lvl.start.x;
    player.targetY = lvl.start.y;
    walls = lvl.walls.map(w=>({...w}));
    goal.x = lvl.goal.x;
    goal.y = lvl.goal.y;
    goal.r = lvl.goal.r;
    drawMap();
}

// --- Collisions ---
function canMoveTo(nx,ny){
     for(const w of walls){
          if(nx+player.r>w.x && nx-player.r<w.x+w.w &&
               ny+player.r>w.y && ny-player.r<w.y+w.h) return false;
     }
     return true;
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

// --- Helpers ---
function rand(min,max){return Math.random()*(max-min)+min}