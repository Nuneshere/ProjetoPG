var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

var av = 1000; //numero de avaliacao(vai ser escolhido pelo usuario)
var qtdPontosJuncao = 0;
var points = []; //array dos pontos colocados pelo usuario
var pointsBezier = []; //pontos de controle de Bezier
var arrayUs = [150, 151, 153, 156, 160]; //Us
var intervals = []; //deltas
var vetores = []; //vetores
var alfas = []; //alfas para bessel
var move = false; //usado no mover ponto
var index = -1; //o getIndex itera ela, e ela serve pro clique do mouse

function calcIntervals() {
  for(i = 0; i < arrayUs.length - 1; i++) {
    intervals[i] = arrayUs[i+1] - arrayUs[i];
  }
}

function calcAlfas() {
  calcIntervals();
  for(i = 1; i < qtdPontosJuncao - 1; i++) {
    alfas[i] = intervals[i-1] / (intervals[i-1] + intervals[i]);
  }
}

/**
 * Fechada - Bessel e Fmill
 * Aberta - Bessel
 */

function besselTangents() {
  var vetFirst, nextVet;
  var constFirst, constNext;
  var X, Y;
  var L = qtdPontosJuncao - 1;

  calcAlfas();

  for(i = 1; i < L; i++) {
    vetFirst = {x: points[i].x - points[i-1].x, y: points[i].y - points[i-1].y};
    nextVet = {x: points[i+1].x - points[i].x, y: points[i+1].y - points[i].y};
    constFirst = (1 - alfas[i]) / intervals[i-1];
    constNext = alfas[i] / intervals[i];
    X = constFirst * vetFirst.x + constNext * nextVet.x;
    Y = constFirst * vetFirst.y + constNext * nextVet.y;
    vetores[i] = {x: X, y: Y};
  }

  // calculando os vetores dos extremos
  if(qtdPontosJuncao > 2) {
    var vet;

    constFirst = 2 / intervals[0];
    vet = {x: points[1].x - points[0].x, y: points[1].y - points[0].y};
    X = constFirst * vet.x - vetores[1].x;
    Y = constFirst * vet.y - vetores[1].y;
    vetores[0] = {x: X, y: Y};

    constFirst = 2 / intervals[L-1];
    vet = {x: points[L].x - points[L-1].x, y: points[L].y - points[L-1].y};
    X = constFirst * vet.x - vetores[L-1].x;
    Y = constFirst * vet.y - vetores[L-1].y;
    vetores[L] = {x: X, y: Y};
    
    calcExtremePointsBezir();
    fmillTangents();
    calcIntermediatePointsBezir();
  }
}

function fmillTangents() {
  var X, Y;

  for(i = 1; i < qtdPontosJuncao - 1; i++) {
    X = points[i+1].x - points[i-1].x;
    Y = points[i+1].y - points[i-1].y;
    vetores[i] = {x: X, y: Y};
  }
}

function calcExtremePointsBezir() {
  var X, Y;
  var coef;
  var L = qtdPontosJuncao - 1;

  coef = intervals[L-1] / 3;
  X = points[L].x - coef * vetores[L].x;
  Y = points[L].y - coef * vetores[L].y;
  pointsBezier[3*L - 1] = {x: X, y: Y};

  coef = intervals[0] / (3 * (intervals[0]));
  X = points[0].x + coef * vetores[0].x;
  Y = points[0].y + coef * vetores[0].y;
  pointsBezier[1] = {x: X, y: Y};

  pointsBezier[0] = {x: points[0].x, y: points[0].y};
  /*X = //points[0].x + vetores[0].x;
  Y = //points[0].y + vetores[0].y;
  pointsBezier[1] = {x: X, y: Y};*/
  
  pointsBezier[3*L] = {x: points[L].x, y: points[L].y};
  /*X = //points[L].x - vetores[L].x;
  Y = //points[L].y - vetores[L].y;
  pointsBezier[3*L-1] = {x: X, y: Y};*/
}

function calcIntermediatePointsBezir() {
  var X, Y;
  var coef;
  var L = qtdPontosJuncao - 1;
  for (i = 1; i < L; i++) {
    coef = intervals[i-1] / (3 * (intervals[i-1] + intervals[i]));
    X = points[i].x - coef * vetores[i].x;
    Y = points[i].y - coef * vetores[i].y;
    pointsBezier[3*i - 1] = {x: X, y: Y};

    pointsBezier[3*i] = {x: points[i].x, y: points[i].y};

    coef = intervals[i] / (3 * (intervals[i-1] + intervals[i]));
    X = points[i].x + coef * vetores[i].x;
    Y = points[i].y + coef * vetores[i].y;
    pointsBezier[3*i + 1] = {x: X, y: Y};
  }
}

resizeCanvas();

function resizeCanvas() {
  canvas.width = parseFloat(window.getComputedStyle(canvas).width);
  canvas.height = parseFloat(window.getComputedStyle(canvas).height);
}

function drawPoints() {
  //desenha todos os pontos
  var cor;
  for (var i in pointsBezier) {
    ctx.beginPath();
    ctx.arc(pointsBezier[i].x, pointsBezier[i].y, 5, 0, 2 * Math.PI);
    if(i % 3 == 0) {
      cor = 'red';
    } else {
      cor = 'blue';
    }
    ctx.fillStyle = cor;
    ctx.fill();
  }
  
  //ligando os pontos
  /*for(var i in points) {
    if(i > 0) {
      var xAtual = points[i-1].x;
      var yAtual = points[i-1].y;
      ctx.moveTo(xAtual, yAtual);
      ctx.lineTo(points[i].x, points[i].y);
      ctx.stroke();
    }
  }*/
  for(var j = 0; j < qtdPontosJuncao - 1; j++) {
    var limInf = 3 * j;
    var limSup = limInf + 3;
    var array = [];
    for (var k = limInf; k <= limSup; k++) {
      array.push({x: pointsBezier[k].x, y: pointsBezier[k].y});
    }
    makeCurve(array);
  }
}

function makeCurve(array) {
  var pointsCurve = [];
  for(t = 0; t <= 1; t = t + 1/av) {
    var pointsDeCasteljau = [];
    for(var i = 0; i < array.length; i++) {
      pointsDeCasteljau.push({x: array[i].x, y: array[i].y});
    }
    calcAvaliable(pointsDeCasteljau, t);
    pointsCurve.push(pointsDeCasteljau[0]);
  }
  drawCurve(pointsCurve);
}

function calcAvaliable(pointsDeCasteljau, t) {
  for(n = 1; n < pointsDeCasteljau.length; n++) {
    for(p = 0; p < pointsDeCasteljau.length - n; p++) {
      var cordX = (1 - t) * pointsDeCasteljau[p].x + t * pointsDeCasteljau[p+1].x;
      var cordY = (1 - t) * pointsDeCasteljau[p].y + t * pointsDeCasteljau[p+1].y;
      pointsDeCasteljau[p] = {x: cordX, y: cordY};
    }
  }
}

function drawCurve(pointsCurve) {
  for(var i in pointsCurve) {
    ctx.beginPath();
      
    if(i > 0) {
      var xAtual = pointsCurve[i-1].x;
      var yAtual = pointsCurve[i-1].y;
      ctx.moveTo(xAtual, yAtual);
      ctx.lineTo(pointsCurve[i].x, pointsCurve[i].y);
      ctx.stroke();
    }
  }
}

//pega dist entre dois pontos
function dist(p1, p2) {
  var v = {x: p1.x - p2.x, y: p1.y - p2.y};
  return Math.sqrt(v.x * v.x + v.y * v.y);
}

//pegar clique
function getIndex(click) {
  for (var i in points) {
    if (dist(points[i], click) <= 10) {
      return i;
    }
  }
  return -1;
}

canvas.addEventListener('mousedown', e => {
  var click = {x: e.offsetX, y: e.offsetY, v:{x: 0, y:0}};
  index = getIndex(click);
  if (index === -1) {
    //points.push(click);
    points[qtdPontosJuncao] = click;
    qtdPontosJuncao++;
    if(qtdPontosJuncao > 2) {
      besselTangents();
      drawPoints();
    }
  } else {
    move = true;
  }
});

canvas.addEventListener('mouseup', e => {
  move = false;
});

canvas.addEventListener('dblclick', e => {
  if (index !== -1) {
    points.splice(index, 1);
    //falta remover o ponto C1
    qtdPontosJuncao--;
  }
});

//mover
canvas.addEventListener('mousemove', e => {
  if(move){
    var antigo = points[index];
    points[index] = {x: e.offsetX, y: e.offsetY, v:{x:0 , y:0}};
    points[index].v = {x: e.offsetX - antigo.x, y: e.offsetY - antigo.y}
    if(qtdPontosJuncao > 2) {
      besselTangents();
      drawPoints();
    }
  }     
});

//intervalo de redesenho do canvas
//a ultima linha contem a quant de milissegundos entre cada acao
setInterval(() => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);//redesenha o canvas
  if(qtdPontosJuncao > 2) {
    besselTangents();
    drawPoints();
  }
}, 100);