// === Temel elemanlar ===
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

// === Video kontrolü ===
overlay.addEventListener('click', () => {
  overlay.style.opacity = '0';
  setTimeout(() => overlay.style.display = 'none', 400);
  volumeBox.style.display = 'flex';

  // Video sıfırdan başlasın
  try {
    video.pause();
    video.currentTime = 0; // her tıklamada en baştan
    video.muted = false;
    video.play().catch(()=>{});
  } catch (e) {
    console.error("Video başlatılamadı:", e);
  }
});


// === Mouse takip animasyonu (optimize) ===
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
      // ✅ Gerçek Spotify logosu (tam SVG)
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
            6.9 4.2 9 13.3 4.8 20.2zm28.6-65.1
            c-5.2 8.4-16.2 11.1-24.6 5.9
            -62.9-38.5-158.8-49.6-232.9-27.4
            -9.3 2.8-19.2-2.3-22-11.6
            s2.3-19.2 11.6-22
            c84.6-25.4 189.6-13.1 261.4 31.3
            8.4 5.2 11.1 16.2 5.9 24.6zm2.4-67.9
            C333.3 191.3 215.6 179 137 203.8
            c-10.3 3.2-21.2-2.6-24.4-12.9
            s2.6-21.2 12.9-24.4
            c88.4-27.8 221.2-14.1 304.5 37.3
            9.2 5.6 12.1 17.6 6.5 26.8
            s-17.6 12.1-26.8 6.5z"/>
          </svg>
          <span style="font-weight:600;font-size:15px;color:#1fd761;">Spotify</span>
        </div>`;
      p2.textContent = songName;
      presenceAvatar.src = s.album_art_url;
    } else {
      const icons = { online:"🟢", idle:"🌙", dnd:"⛔", offline:"⚫" };
      const names = { online:"Çevrimiçi", idle:"Boşta", dnd:"Rahatsız Etmeyin", offline:"Çevrimdışı" };
      p1.innerHTML = `${icons[d.discord_status] || "⚫"} ${names[d.discord_status] || ""}`;
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

// === Discord kopyalama ===
document.querySelector(".btn-copy").onclick = async () => {
  await navigator.clipboard.writeText("eron4u");
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1300);
};

// === WhatsApp kart ===
const waIcon = document.getElementById('wa-icon');
const waCard = document.getElementById('wa-card');
const waBackdrop = document.getElementById('wa-backdrop');

if (waIcon && waCard && waBackdrop) {
  waIcon.style.cursor = 'pointer';
  document.querySelectorAll('#wa-card .flag').forEach(f => f.style.cursor = 'pointer');

  waIcon.addEventListener('click', () => {
    const visible = waCard.style.display === 'block';
    waCard.style.display = visible ? 'none' : 'block';
    waBackdrop.style.display = visible ? 'none' : 'block';
  });

  waBackdrop.addEventListener('click', () => {
    waCard.style.display = 'none';
    waBackdrop.style.display = 'none';
  });

  function copyNumber(num) {
    navigator.clipboard.writeText(num);
    toast.textContent = num + ' kopyalandı';
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 1400);
    waCard.style.display = 'none';
    waBackdrop.style.display = 'none';
  }

  const tr = document.getElementById('flag-tr');
  const gb = document.getElementById('flag-gb');
  if (tr) tr.onclick = () => copyNumber('+90 537 516 59 18');
  if (gb) gb.onclick = () => copyNumber('+44 7346 244942');
}
