// Canvas 960x640
// x e y: pontos iniciais da parede
// w: largura / h: altura

window.LEVELS = [
  {
    start: {x: 55, y: 50}, //Jogador
    goal: {x: 900, y: 600, r: 25}, //Goal
    walls: [
      {x:0,y:0,w:960,h:5}, {x:0,y:640,w:960,h:5}, {x:0,y:0,w:5,h:640}, {x:955,y:0,w:5,h:640}, //Paredes do canvas
      // Paredes extras
      {x:100,y:0,w:150,h:240},{x:100,y:350,w:5,h:200},{x:350,y:0,w:400,h:240},{x:100,y:350,w:850,h:5},{x:840,y:100,w:115,h:255},{x:200,y:430,w:645,h:120},{x:840,y:550,w:5,h:90},
    ]
  },
  {
    start: {x: 50, y: 50},
    goal: {x: 890, y: 590, r: 25},
    walls: [
      {x:0,y:0,w:960,h:5}, {x:0,y:640,w:960,h:5}, {x:0,y:0,w:5,h:640}, {x:955,y:0,w:5,h:640},
      {x:0,y:100,w:860,h:5}, {x:0,y:200,w:200,h:5}, {x:300,y:200,w:560,h:5}, {x:100,y:300,w:600,h:240},{x:700,y:300,w:255,h:5},{x:820,y:400,w:5,h:245},
    ]
  }
];