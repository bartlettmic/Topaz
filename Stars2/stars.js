var SCREEN_WIDTH = window.innerWidth,
  SCREEN_HEIGHT = window.innerHeight,
  mousePos = {
    x: SCREEN_WIDTH / 2,
    y: SCREEN_HEIGHT / 2
  },

  // create canvas
  canvas = document.createElement('canvas'),
  context = canvas.getContext('2d'),
  dots = [],
  FPS = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 30 : 60,
  stars = 50,
  //minDistance = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 75 : 100,
  minDiv=10,
  minDistance = Math.sqrt(Math.pow(SCREEN_WIDTH,2) + Math.pow(SCREEN_HEIGHT,2))/minDiv,
  speed = 3,
  thick = 5,
  lines = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 5 : 10,
  G = 200;

// init
$(document).ready(function() {
  document.getElementById('canvas').appendChild(canvas);
  canvas.width = SCREEN_WIDTH;
  canvas.height = SCREEN_HEIGHT;
  document.getElementById('stars').value = stars;
  document.getElementById('minDiv').value = minDiv;
  document.getElementById('speed').value = speed;
  document.getElementById('thick').value = thick;
  document.getElementById('lines').value = lines;
  document.getElementById('G').value = G;
  setInterval(loop, 1000 / FPS);
  
  for (var i = 0; i < stars; i++) {
    dots.push(new Dot(i));
  }
  
  console.log("DONE!");
 });

//update mouse position
$(document).mousemove(function(e) {
 e.preventDefault();
 mousePos = {
   x: e.clientX,
   y: e.clientY
 };
});

$(function(){
  $('input[type="range"]').change(function(e){
    // You can get the value of the input that changed here! I probably should have kept the ids on them so that you'd be able to get that to figure out which slider changed.
    console.log(e.target.value);
    console.log(e.target.id)
  });
  $('input[type="checkbox"]').change(function(e){
    console.log(e.target.value);
    console.log(e.target.checked);    
  });
})


function loop() {
  // update screen size
  if (SCREEN_WIDTH != window.innerWidth || SCREEN_HEIGHT != window.innerHeight) {
    canvas.width = SCREEN_WIDTH = window.innerWidth;
    canvas.height = SCREEN_HEIGHT = window.innerHeight;
    minDistance = Math.sqrt(Math.pow(SCREEN_WIDTH,2) + Math.pow(SCREEN_HEIGHT,2))/minDiv;
  }
  
  context.clearRect(0, 0, canvas.width, canvas.height);

  for (var i = 0; i < stars; i++) dots[i].update();
  for (var i = 0; i < stars; i++) dots[i].ids.clear();
  for (var i = 0; i < stars; i++) dots[i].render(context); 
  
}

function Dot(ID) {
  this.pos = {
    x: Math.random() * SCREEN_WIDTH,
    y: Math.random() * SCREEN_HEIGHT
  };
  this.vel = {
    x: Math.random() * speed * (Math.round(Math.random()) ? 1 : -1),
    //y: Math.random() * speed * (Math.round(Math.random()) ? 1 : -1)
    y: 0
  };
  this.vel.y = Math.sqrt(Math.pow(speed, 2) - Math.pow(this.vel.x, 2)) * (Math.round(Math.random()) ? 1 : -1)
  this.r = Math.round(Math.random() * 255);
  this.g = Math.round(Math.random() * 255);
  this.b = Math.round(Math.random() * 255);
  this.id = ID;
  this.ids = new Set();
}

Dot.prototype.update = function() {

  // update position based on speed
  X = this.vel.x, Y = this.vel.y;
   for (let d of this.ids) {
     X += dots[d].vel.x;
     Y += dots[d].vel.y;
   }
  X /= (this.ids.size+1);
  Y /= (this.ids.size+1);
  this.pos.x += (X+this.vel.x)/2;
  this.pos.y += (Y+this.vel.y)/2;
  if (this.pos.x <= 0) this.vel.x *= (this.vel.x > 0 ? 1 : -1);
  if (this.pos.x >= SCREEN_WIDTH) { this.vel.x *= (this.vel.x < 0 ? 1 : -1); this.pos.x=SCREEN_WIDTH; }
  if (this.pos.y <= 0) this.vel.y *= (this.vel.y > 0 ? 1 : -1);
  if (this.pos.y >= SCREEN_HEIGHT) { this.vel.y *= (this.vel.y < 0 ? 1 : -1); this.pos.y=SCREEN_HEIGHT }
};

Dot.prototype.render = function(c) {
  //c.save();

  //c.globalCompositeOperation = 'soft-light';
  //c.globalCompositeOperation = 'lighten';


  var x = this.pos.x,
    y = this.pos.y;


  for (var i = 0; i < stars; i++) {
    if (lines > 0 && this.ids.size > lines) break;
    if (i == this.id || dots[i].ids.has(this.id) || this.ids.has(i)) continue;
    var x2 = dots[i].pos.x,
      y2 = dots[i].pos.y,
      distance = Math.sqrt(Math.pow(x - x2, 2) + Math.pow(y - y2, 2));
    if (distance > minDistance) continue;

    if (this.ids.has(dots[i].ids) || dots[i].ids.has(this.ids)) {
      this.ids.add(i);
      dots[i].ids.add(this.id);
      continue;
    }

    var grd = c.createLinearGradient(x, y, x2, y2),
      s1 = "rgba(" + this.r + "," + this.g + "," + this.b + "," + (1 - (distance / minDistance)) + ")",
      s2 = 'rgba(' + dots[i].r + ',' + dots[i].g + ',' + dots[i].b + ',' + (1 - (distance / minDistance)) + ')';

    grd.addColorStop(0, s1);
    grd.addColorStop(1, s2);

    c.beginPath();
    c.arc(x, y, thick / 2, 0, 2 * Math.PI);
    c.fillStyle = s1;
    c.fill();

    //c.beginPath();
    //c.arc(x2, y2, thick / 2, 0, 2 * Math.PI);
    //c.fillStyle = s2;
    //c.fill();

    c.beginPath();
    c.moveTo(x, y);
    c.lineTo(x2, y2);
    c.lineWidth = thick;
    c.strokeStyle = grd;
    c.stroke();

    //c.restore();
    this.ids.add(i);
    dots[i].ids.add(this.id);
  }
};
