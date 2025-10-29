const overlay = document.getElementById('overlay');
const video = document.getElementById('bg');
const card = document.getElementById('card');
const volumeBox = document.getElementById('volumeBox');
const volumeSlider = document.getElementById('volumeSlider');
const toast = document.getElementById('toast');
const presenceAvatar = document.getElementById('presence-avatar');
const p1 = document.getElementById('p-line1');
const p2 = document.getElementById('p-line2');
const DISCORD_ID = document.querySelector('.wrap').dataset.discordId;
const projectsBtn = document.getElementById('projectsBtn');

// === Video control ===
overlay.addEventListener('click', () => {
  overlay.style.opacity = '0';
  setTimeout(() => overlay.style.display = 'none', 400);

  // Show volume and projects button after click
  volumeBox.style.display = 'flex';
  projectsBtn.style.display = 'block';

  try {
    video.pause();
    video.currentTime = 0;
    video.muted = false;
    const vol = parseFloat(volumeSlider.value || '1');
    video.volume = isNaN(vol) ? 1 : vol;
    video.play().catch(()=>{});
  } catch(e){}
});
volumeBox.style.display = 'none';
projectsBtn.style.display = 'none';

volumeSlider.addEventListener('input', e => {
  const v = parseFloat(e.target.value);
  if (!isNaN(v)) {
    if (video.muted) video.muted = false;
    video.volume = v;
  }
});

// === Mouse tilt animation ===
(() => {
  const maxRot = 10, damp = 0.08;
  let tx = 0, ty = 0, rx = 0, ry = 0, active = true;
  function animate() {
    if (!active) return;
    rx += (tx - rx) * damp;
    ry += (ty - ry) * damp;
    card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
    requestAnimationFrame(animate);
  }
  document.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const dx = (e.clientX - (rect.left + rect.width / 2)) / rect.width;
    const dy = (e.clientY - (rect.top + rect.height / 2)) / rect.height;
    ty = Math.max(-maxRot, Math.min(maxRot, dx * maxRot));
    tx = Math.max(-maxRot, Math.min(maxRot, -dy * maxRot));
  });
  card.addEventListener('mouseenter', () => { active = false; card.style.transform = 'rotateX(0deg) rotateY(0deg)'; });
  card.addEventListener('mouseleave', () => { active = true; requestAnimationFrame(animate); });
  requestAnimationFrame(animate);
})();

// === Discord RPC ===
async function loadPresence() {
  try {
    const res = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_ID}?t=${Date.now()}`, { cache: "no-store" });
    const j = await res.json();
    if (!j.success) throw 0;
    const d = j.data;
    const colorMap = { online:"#3ba55d", idle:"#faa81a", dnd:"#ed4245", offline:"#777" };
    document.getElementById('status-dot').style.background = colorMap[d.discord_status] || "#777";
    if (d.listening_to_spotify && d.spotify) {
      const s = d.spotify;
      const songName = (s.song || "").split(" — ")[0];
      p1.innerHTML = `
        <div style="display:flex;align-items:center;gap:6px;">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512" width="18" height="18" fill="#1fd761">
            <path d="M248 8C111 8 0 119 0 256s111 248 248 248
            248-111 248-248S385 8 248 8zm121.9 359.3
            c-4.2 6.9-13.3 9-20.2 4.8
            -55.2-33.8-124.8-41.5-206.6-22.9
            -7.9 1.8-15.9-3.1-17.7-11
            s3.1-15.9 11-17.7
            c88.4-20.2 164.4-11.2 226.4 26.9
            6.9 4.2 9 13.3 4.8 20.2z"/>
          </svg>
          <span style="font-weight:600;font-size:15px;color:#1fd761;">Spotify</span>
        </div>`;
      p2.textContent = songName;
      presenceAvatar.src = s.album_art_url;
    } else {
      const names = { online:"Online", idle:"Idle", dnd:"Do Not Disturb", offline:"Offline" };
      p1.textContent = names[d.discord_status] || "";
      p2.textContent = "";
      presenceAvatar.src = "assets/profile.png";
    }
  } catch {
    p1.textContent = "Failed to load RPC";
    p2.textContent = "";
    presenceAvatar.src = "assets/profile.png";
  }
}
loadPresence();
setInterval(loadPresence, 10000);

// === Copy Discord username ===
document.querySelector(".btn-copy").onclick = async () => {
  await navigator.clipboard.writeText("eron4u");
  toast.textContent = "Copied";
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove('show'), 1300);
};

// === WhatsApp card ===
const waIcon = document.getElementById('wa-icon');
const waCard = document.getElementById('wa-card');
const waBackdrop = document.getElementById('wa-backdrop');
if (waIcon && waCard && waBackdrop) {
  waIcon.style.cursor = 'pointer';
  document.querySelectorAll('#wa-card .flag').forEach(f => f.style.cursor = 'pointer');
  waIcon.addEventListener('click', () => {
    const v = waCard.style.display === 'block';
    waCard.style.display = v ? 'none' : 'block';
    waBackdrop.style.display = v ? 'none' : 'block';
  });
  waBackdrop.addEventListener('click', () => {
    waCard.style.display = 'none';
    waBackdrop.style.display = 'none';
  });
  const copy = num => {
    navigator.clipboard.writeText(num);
    toast.textContent = num + ' copied';
    toast.classList.add('show');
    setTimeout(()=>toast.classList.remove('show'),1400);
    waCard.style.display='none';waBackdrop.style.display='none';
  };
  document.getElementById('flag-tr').onclick = () => copy('+90 537 516 59 18');
  document.getElementById('flag-gb').onclick = () => copy('+44 7346 244942');
}
