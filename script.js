// starfield + occasional shooting stars
const canvas = document.getElementById('sky');
const ctx = canvas.getContext('2d', { alpha: true });
let w, h, stars = [], shooting = [];

function resize(){
  w = canvas.width = innerWidth;
  h = canvas.height = innerHeight;
}
window.addEventListener('resize', resize);
resize();

// create star objects
const STAR_COUNT = Math.round((w*h) / 6000);
function initStars(){
  stars = [];
  for(let i=0;i<STAR_COUNT;i++){
    stars.push({
      x: Math.random()*w,
      y: Math.random()*h,
      r: Math.random()*1.2 + 0.2,
      alpha: Math.random()*0.8 + 0.2,
      pulse: Math.random()*0.02 + 0.005,
      dir: Math.random() > 0.5 ? 1 : -1
    });
  }
}
initStars();
window.addEventListener('resize', () => {
  initStars();
});

// shooting star generator
function spawnShootingStar(){
  if(Math.random() < 0.02){ // spawn chance per frame
    const startY = Math.random()*h*0.5;
    shooting.push({
      x: Math.random()*w,
      y: startY,
      vx: - (3 + Math.random()*6),
      vy: 1 + Math.random()*1.5,
      len: 120 + Math.random()*220,
      life: 0,
      maxLife: 40 + Math.random()*40
    });
  }
}

// draw loop
function draw(){
  ctx.clearRect(0,0,w,h);

  // subtle gradient glow in center to simulate moonlight
  const g = ctx.createRadialGradient(w*0.5,h*0.3,0, w*0.5,h*0.3, Math.max(w,h));
  g.addColorStop(0, 'rgba(10,20,50,0.08)');
  g.addColorStop(1, 'rgba(0,0,0,0.0)');
  ctx.fillStyle = g;
  ctx.fillRect(0,0,w,h);

  // draw stars
  for(let s of stars){
    s.alpha += s.pulse * s.dir;
    if(s.alpha <= 0.15 || s.alpha >= 1) s.dir *= -1;
    ctx.beginPath();
    ctx.fillStyle = `rgba(255,255,255,${s.alpha})`;
    ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
    ctx.fill();
  }

  // spawn shooting stars sometimes
  spawnShootingStar();

  // draw shooting stars
  for(let i = shooting.length-1; i>=0; i--){
    const sh = shooting[i];
    sh.x += sh.vx;
    sh.y += sh.vy;
    sh.life++;
    // trail
    const grad = ctx.createLinearGradient(sh.x, sh.y, sh.x - sh.vx*sh.len, sh.y - sh.vy*sh.len);
    grad.addColorStop(0, 'rgba(255,255,255,0.95)');
    grad.addColorStop(0.6, 'rgba(255,255,255,0.3)');
    grad.addColorStop(1, 'rgba(255,255,255,0.0)');
    ctx.strokeStyle = grad;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(sh.x, sh.y);
    ctx.lineTo(sh.x - sh.vx*sh.len, sh.y - sh.vy*sh.len);
    ctx.stroke();

    // bright head
    ctx.beginPath();
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.arc(sh.x, sh.y, 2.6, 0, Math.PI*2);
    ctx.fill();

    if(sh.life > sh.maxLife || sh.x < -sh.len || sh.y > h + 50) shooting.splice(i,1);
  }

  requestAnimationFrame(draw);
}
requestAnimationFrame(draw);
