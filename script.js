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
    const listening = acts.find(a=>a.type===2); // Spotify
    const custom = acts.find(a=>a.type===4);    // Custom status fallback
    const status = d.discord_status;

    if (listening && d.listening_to_spotify && d.spotify) {
      const track = d.spotify.song || "";
      const cover = d.spotify.album_art_url || "";
      const songName = track.split(" — ")[0]; // yalnızca şarkı ismi

      // Yeşil Spotify görünümü
      p1.innerHTML = `
        <div style="display:flex;align-items:center;gap:6px;">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512" width="18" height="18" fill="#1fd761">
            <path d="M248 8C111 8 0 119 0 256s111 248 248 248 248-111 248-248S385 8 248 8zm121.9 359.3c-4.2 6.9-13.3 9-20.2 4.8-55.2-33.8-124.8-41.5-206.6-22.9-7.9 1.8-15.9-3.1-17.7-11s3.1-15.9 11-17.7c88.4-20.2 164.4-11.2 226.4 26.9 6.9 4.2 9 13.3 4.8 20.2zm28.6-65.1c-5.2 8.4-16.2 11.1-24.6 5.9-62.9-38.5-158.8-49.6-232.9-27.4-9.3 2.8-19.2-2.3-22-11.6s2.3-19.2 11.6-22c84.6-25.4 189.6-13.1 261.4 31.3 8.4 5.2 11.1 16.2 5.9 24.6zm2.4-67.9C333.3 191.3 215.6 179 137 203.8c-10.3 3.2-21.2-2.6-24.4-12.9s2.6-21.2 12.9-24.4c88.4-27.8 221.2-14.1 304.5 37.3 9.2 5.6 12.1 17.6 6.5 26.8s-17.6 12.1-26.8 6.5z"/>
          </svg>
          <span style="font-weight:600;font-size:15px;color:#1fd761;">Spotify</span>
        </div>`;
      p2.textContent = songName;

      if (cover) presenceAvatar.src = cover;
      else presenceAvatar.src = "assets/profile.png";
    } 
    else {
      // Dinleme yoksa durum ikon + metin
      const statusIcons = {
        online: "🟢",
        idle: "🌙",
        dnd: "⛔",
        offline: "⚫"
      };
      const statusNames = {
        online: "Çevrimiçi",
        idle: "Boşta",
        dnd: "Rahatsız Etmeyin",
        offline: "Çevrimdışı"
      };

      const icon = statusIcons[status] || "⚫";
      const name = statusNames[status] || "Bilinmiyor";
      p1.innerHTML = `${icon} ${name}`;
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
