const overlay = document.getElementById('overlay');
const video = document.getElementById('bg');
const card = document.getElementById('card');
const volumeSlider = document.getElementById('volumeSlider');
const volumeBox = document.getElementById('volumeBox');

// --- Video başlatma ---
overlay.addEventListener('click', () => {
  overlay.style.opacity = '0';
  setTimeout(() => overlay.style.display = 'none', 400);
  volumeBox.style.display = 'flex';
  video.muted = false;
  video.play().catch(()=>{});
});
volumeBox.style.display = 'none';
volumeSlider.addEventListener('input', e => video.volume = parseFloat(e.target.value));

// --- Mouse takip animasyonu ---
let tiltActive = true;
card.addEventListener('mouseenter', () => tiltActive = false);
card.addEventListener('mouseleave', () => {
  tiltActive = true;
  card.style.transform = 'rotateX(0deg) rotateY(0deg)';
});
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

// --- Discord Presence ---
const DISCORD_ID = document.querySelector('.wrap').dataset.discordId;
const p1 = document.getElementById("p-line1");
const p2 = document.getElementById("p-line2");
const presenceAvatar = document.getElementById("presence-avatar");

async function loadPresence() {
  try {
    const res = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_ID}`, { cache: "no-store" });
    const j = await res.json();
    if (!j.success) throw 0;
    const d = j.data;

    const colorMap = { online:"#3ba55d", idle:"#faa81a", dnd:"#ed4245", offline:"#777" };
    document.getElementById('status-dot').style.background = colorMap[d.discord_status] || "#777";

    const acts = d.activities || [];
    const listening = acts.find(a=>a.type===2); // sadece dinliyor
    const custom = acts.find(a=>a.type===4); // özel durum (fallback)

    if (listening) {
      p1.innerHTML = `<span style="font-weight:600;font-size:15px">🎧 ${listening.name}</span>`;
      p2.textContent = `${listening.details || ''} — ${listening.state || ''}`;
      presenceAvatar.src = "assets/profile.png";
    } else if (custom && custom.state) {
      p1.textContent = custom.state;
      p2.textContent = '';
      presenceAvatar.src = "assets/profile.png";
    } else {
      p1.textContent = "Dinleme etkinliği yok";
      p2.textContent = "";
      presenceAvatar.src = "assets/profile.png";
    }
  } catch {
    p1.textContent = "Discord RPC alınamadı";
    p2.textContent = "";
    presenceAvatar.src = "assets/profile.png";
  }
}
loadPresence();
setInterval(loadPresence, 10000);

// --- Kopyalama bildirimi ---
const toast = document.getElementById("toast");
document.querySelector(".btn-copy").onclick = async () => {
  await navigator.clipboard.writeText("eron4u");
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1300);
};
