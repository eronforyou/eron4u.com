const overlay = document.getElementById('overlay');
const video = document.getElementById('bg');
const card = document.getElementById('card');
const volumeSlider = document.getElementById('volumeSlider');
const volumeBox = document.getElementById('volumeBox');

overlay.addEventListener('click', () => {
  overlay.style.opacity = '0';
  setTimeout(() => overlay.style.display = 'none', 400);
  volumeBox.style.display = 'flex';
  video.muted = false;
  video.play().catch(()=>{});
});
volumeBox.style.display = 'none';

volumeSlider.addEventListener('input', e => video.volume = parseFloat(e.target.value));

let tiltActive = true;

// mouse kartın üstündeyse durdur
card.addEventListener('mouseenter', () => tiltActive = false);
card.addEventListener('mouseleave', () => {
  tiltActive = true;
  card.style.transform = 'rotateX(0deg) rotateY(0deg)';
});

// mouse takibi (sınırlandırılmış)
document.addEventListener('mousemove', e => {
  if (!tiltActive) return;

  const rect = card.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const maxRot = 15;

  let dx = e.clientX - centerX;
  let dy = e.clientY - centerY;

  const limitX = rect.width;
  const limitY = rect.height;

  if (Math.abs(dx) > limitX) dx = limitX * Math.sign(dx);
  if (Math.abs(dy) > limitY) dy = limitY * Math.sign(dy);

  const nx = dx / limitX;
  const ny = dy / limitY;

  const rotY = nx * maxRot;
  const rotX = -ny * maxRot;

  card.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
});

// Discord Presence
const DISCORD_ID = document.querySelector('.wrap').dataset.discordId;
const p1 = document.getElementById("p-line1");
const p2 = document.getElementById("p-line2");

async function loadPresence() {
  try {
    const res = await fetch(`https://lanyard.cnrad.dev/api/v1/users/${DISCORD_ID}`, { cache: "no-store" });
    const j = await res.json();
    if (!j.success) throw 0;
    const d = j.data;

    const colorMap = { online:"#3ba55d", idle:"#faa81a", dnd:"#ed4245", offline:"#777" };
    document.getElementById('status-dot').style.background = colorMap[d.discord_status] || "#777";

    const acts = d.activities || [];
    const playing = acts.find(a=>a.type===0);
    const listening = acts.find(a=>a.type===2);
    const custom = acts.find(a=>a.type===4);

    if (playing) {
      p1.textContent = `🎮 ${playing.name}`;
      p2.textContent = `${playing.details || ''} ${playing.state ? '— ' + playing.state : ''}`;
    } else if (listening) {
      p1.textContent = `🎧 ${listening.name}`;
      p2.textContent = `${listening.details || ''} — ${listening.state || ''}`;
    } else if (custom && custom.state) {
      p1.textContent = custom.state;
      p2.textContent = '';
    } else {
      p1.textContent = "Çevrimdışı veya etkinlik yok";
      p2.textContent = "";
    }
  } catch {
    p1.textContent = "Discord RPC alınamadı";
    p2.textContent = "";
  }
}
loadPresence();
setInterval(loadPresence, 10000);

// kopyalama bildirimi
const toast = document.getElementById("toast");
document.querySelector(".btn-copy").onclick = async () => {
  await navigator.clipboard.writeText("eron4u");
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1300);
};
