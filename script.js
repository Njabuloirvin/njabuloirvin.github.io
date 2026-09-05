// improved starfield + natural shooting stars
const canvas = document.getElementById('sky');
const ctx = canvas.getContext('2d', { alpha: true });
let w, h, stars = [], shooting = [], nextShootingTimeout = null;

function resize(){
  w = canvas.width = innerWidth;
  h = canvas.height = innerHeight;
}
window.addEventListener('resize', resize);
resize();

// create star objects
function initStars(){
  stars = [];
  const STAR_COUNT = Math.round((w*h) / 7000);
  for(let i=0;i<STAR_COUNT;i++){
    stars.push({
      x: Math.random()*w,
      y: Math.random()*h,
      r: Math.random()*1.2 + 0.3,
      alpha: Math.random()*0.8 + 0.2,
      pulse: Math.random()*0.01 + 0.002,
      dir: Math.random() > 0.5 ? 1 : -1
    });
  }
}
initStars();
window.addEventListener('resize', () => {
  initStars();
  scheduleNextShooting();
});

// schedule sporadic shooting stars (mimic natural intervals)
function scheduleNextShooting(){
  if(nextShootingTimeout) clearTimeout(nextShootingTimeout);
  const delay = 2500 + Math.random()*7000; // 2.5s - 9.5s
  nextShootingTimeout = setTimeout(()=>{
    spawnShootingStar();
    scheduleNextShooting();
  }, delay);
}
scheduleNextShooting();

function spawnShootingStar(){
  // pick a start near top-right so they travel diagonally down-left
  const startX = Math.random()*w;
  const startY = Math.random()*h*0.45; // mostly upper half
  const speed = 6 + Math.random()*6; // faster so streak is quick
  const angle = (Math.PI/4) + (Math.random()*0.3 - 0.15); // ~45 degrees
  const vx = -Math.cos(angle) * speed;
  const vy = Math.sin(angle) * speed;
  const len = 30 + Math.random()*60; // short streaks
  shooting.push({ x: startX, y: startY, vx, vy, len, life:0, maxLife: 12 + Math.floor(Math.random()*10), alpha: 1 });
}

// draw loop
function draw(){
  ctx.clearRect(0,0,w,h);

  // subtle gradient glow in center to simulate faint moonlight
  const g = ctx.createRadialGradient(w*0.5,h*0.28,0, w*0.5,h*0.28, Math.max(w,h));
  g.addColorStop(0, 'rgba(255,255,255,0.02)');
  g.addColorStop(1, 'rgba(0,0,0,0.0)');
  ctx.fillStyle = g;
  ctx.fillRect(0,0,w,h);

  // draw stars with gentle twinkle
  for(let s of stars){
    s.alpha += s.pulse * s.dir;
    if(s.alpha <= 0.12 || s.alpha >= 1) s.dir *= -1;
    ctx.beginPath();
    ctx.fillStyle = `rgba(255,255,255,${s.alpha})`;
    ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
    ctx.fill();
  }

  // draw shooting stars (short quick streaks)
  for(let i = shooting.length-1; i>=0; i--){
    const sh = shooting[i];
    // move
    sh.x += sh.vx;
    sh.y += sh.vy;
    sh.life++;
    // fade alpha
    sh.alpha = Math.max(0, 1 - sh.life / sh.maxLife);

    // draw a short gradient trail behind the head
    const tx = sh.x - sh.vx * sh.len;
    const ty = sh.y - sh.vy * sh.len;
    const grad = ctx.createLinearGradient(sh.x, sh.y, tx, ty);
    grad.addColorStop(0, `rgba(255,255,255,${0.95 * sh.alpha})`);
    grad.addColorStop(0.6, `rgba(255,255,255,${0.25 * sh.alpha})`);
    grad.addColorStop(1, `rgba(255,255,255,0)`);

    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(sh.x, sh.y);
    ctx.lineTo(tx, ty);
    ctx.stroke();

    // small bright head
    ctx.beginPath();
    ctx.fillStyle = `rgba(255,255,255,${1 * sh.alpha})`;
    ctx.arc(sh.x, sh.y, 1.8, 0, Math.PI*2);
    ctx.fill();

    // remove when finished or out of bounds
    if(sh.life > sh.maxLife || sh.x < -50 || sh.y > h + 50) shooting.splice(i,1);
  }

  requestAnimationFrame(draw);
}
requestAnimationFrame(draw);
