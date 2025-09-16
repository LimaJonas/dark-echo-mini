// Canvas 960x640
// x e y: pontos iniciais da parede
// w: largura / h: altura
window.LEVELS = [
  {
    start: {x: 55, y: 50}, //Jogador
    goal: {x: 900, y: 600, r: 10}, //Goal
    walls: [
      {x:0,y:0,w:960,h:10}, {x:0,y:628,w:960,h:10}, {x:0,y:0,w:10,h:640}, {x:948,y:0,w:10,h:640}, //Paredes do canvas
      // Paredes extras
      {x:100,y:0,w:150,h:240},{x:100,y:350,w:10,h:200},{x:350,y:0,w:400,h:240},
      {x:100,y:350,w:850,h:10},{x:840,y:100,w:110,h:250},{x:200,y:430,w:650,h:120},{x:840,y:550,w:10,h:90},
    ]
  },
  {
    start: {x: 50, y: 50},
    goal: {x: 890, y: 590, r: 10},
    walls: [
      {x:0,y:0,w:960,h:10}, {x:0,y:628,w:960,h:10}, {x:0,y:0,w:10,h:640}, {x:948,y:0,w:10,h:640},
      {x:0,y:100,w:860,h:10}, {x:0,y:200,w:200,h:10}, {x:300,y:200,w:560,h:10}, {x:100,y:300,w:600,h:240},
      {x:700,y:300,w:250,h:10},{x:820,y:400,w:10,h:230},
    ]
  }
];