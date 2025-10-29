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

    const status = d.discord_status;
    const colorMap = { online:"#3ba55d", idle:"#faa81a", dnd:"#ed4245", offline:"#777" };
    const iconMap = {
      online: "🟢",
      idle: "🌙",
      dnd: "⛔",
      offline: "⚫"
    };

    document.getElementById('status-dot').style.background = colorMap[status] || "#777";
    presenceAvatar.style.display = "none"; // varsayılan olarak gizle

    const acts = d.activities || [];
    const listening = acts.find(a => a.type === 2);
    const custom = acts.find(a => a.type === 4);

    // --- Spotify aktifse ---
    if (listening && d.listening_to_spotify && d.spotify) {
      const sp = d.spotify;
      const song = sp.song;
      const artist = sp.artist.replace(/;/g, ",");
      const albumCover = `https://i.scdn.co/image/${sp.album_art_url.split('/').pop()}`;
      
      // yazılar
      p1.innerHTML = `
        <img src="https://upload.wikimedia.org/wikipedia/commons/8/84/Spotify_icon.svg" 
             style="width:18px;height:18px;vertical-align:middle;filter:drop-shadow(0 0 6px #1db954)">
        <span style="color:#1db954;font-weight:600;margin-left:6px;">Spotify</span>`;
      p2.innerHTML = `${song} — ${artist}`;

      // kapak görseli
      presenceAvatar.src = albumCover;
      presenceAvatar.style.display = "block";
      presenceAvatar.style.borderRadius = "10px";
      presenceAvatar.style.boxShadow = "0 0 12px #1db954a0";

      return;
    }

    // --- Custom status varsa ---
    if (custom && custom.state) {
      p1.textContent = custom.state;
      p2.textContent = "";
      presenceAvatar.style.display = "none";
      return;
    }

    // --- Hiçbiri yoksa, sadece durum yaz ---
    const labelMap = {
      online: "Çevrimiçi",
      idle: "Boşta",
      dnd: "Rahatsız Etmeyin",
      offline: "Çevrimdışı"
    };

    p1.innerHTML = `${iconMap[status] || "⚫"} ${labelMap[status] || "Bilinmiyor"}`;
    p2.textContent = "";
    presenceAvatar.style.display = "none";

  } catch {
    p1.textContent = "Discord RPC alınamadı";
    p2.textContent = "";
    presenceAvatar.style.display = "none";
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

