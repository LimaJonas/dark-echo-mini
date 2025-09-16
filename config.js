// === Configs ===
// iniciando canvas
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;
let gridOn = false;
// Offscreen map
const mapCanvas = document.createElement('canvas');
mapCanvas.width = W; mapCanvas.height = H;
const mapCtx = mapCanvas.getContext('2d');

const DEV_MODE = false; //true para ver as paredes

// Zoom
let zoom = 1;
const ZOOM_STEP = 0.1;
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 3;

// Player
const player = {x:0,y:0,r:6,alpha:1,moving:false};
// Goal
const goal = {x:0,y:0,r:10};
// Level inicial
let currentLevel = 0;
// Pulses
let pulses = [];
const PULSE_SPEED = 2.0;
const PULSE_MAX = Math.hypot(W,H);
// Movimento
let stepTimer = 0;
const STEP_INTERVAL = 500; //Tempo entre passos
let keys = {};
let walls = [];

// Click/touch target
let touchTarget = null;
// Variáveis para pinch zoom
let lastPinchDist = null;