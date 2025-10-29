let validTokens = [];

async function checkToken(token) {
  try {
    const response = await fetch("https://discord.com/api/v9/users/@me", {
      method: "GET",
      headers: {
        "Authorization": token.trim(),
      },
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
      } catch (e) { /* ignore */ }
      await new Promise(res => setTimeout(res, retryAfter));
      return await checkToken(token);
    } else {
      return { valid: false, reason: "Unknown error (" + response.status + ")" };
    }
  } catch (err) {
    return { valid: false, reason: "Network error" };
  }
}

async function checkAllTokens(tokens) {
  $("#results").removeClass("hidden");
  $("#resultList").empty();
  $("#downloadBtn").remove();
  validTokens = [];

  const cleaned = tokens.map(t => t.trim()).filter(Boolean);
  const uniqueTokens = Array.from(new Set(cleaned));

  const duplicateCount = cleaned.length - uniqueTokens.length;
  if (duplicateCount > 0) {
    new Toast({
      message: `${duplicateCount} Already existing token(s) were removed. Duplicate tokens will only be checked once.`,
      type: "default"
    });
  }

  let validCount = 0;
  let invalidCount = 0;

  for (let i = 0; i < uniqueTokens.length; i++) {
    const token = uniqueTokens[i];

    $("#resultList").append(
      `<p class='text-gray-400'>[${i + 1}/${uniqueTokens.length}] Checking...</p>`
    );

    const result = await checkToken(token);
    $("#resultList p").last().remove();

    if (result.valid) {
      validCount++;
      validTokens.push(token);
      const shortTok = token.length > 30 ? token.slice(0, 20) + "..." + token.slice(-5) : token;
      $("#resultList").append(
        `<p class='text-green-400'>✅ ${shortTok} → ${result.username} (${result.email})</p>`
      );
    } else {
      invalidCount++;
      const shortTok = token.length > 30 ? token.slice(0, 20) + "..." + token.slice(-5) : token;
      $("#resultList").append(
        `<p class='text-red-400'>❌ ${shortTok} → ${result.reason}</p>`
      );
    }

    await new Promise(res => setTimeout(res, 500 + Math.random() * 500));
  }

  new Toast({
    message: `Checked ${uniqueTokens.length} unique tokens. ✅ ${validCount} valid, ❌ ${invalidCount} invalid.`,
    type: validCount > 0 ? "success" : "warning",
  });

  if (validTokens.length > 0) {
    $("#results").append(`
      <button id="downloadBtn"
        class="mt-4 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded font-semibold text-sm transition">
        💾 Download Valid Tokens (${validTokens.length})
      </button>
    `);

    $("#downloadBtn").click(downloadValidTokens);
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

$("#checkAll").click(() => {
  const raw = $("#tokens").val().trim();
  if (!raw) {
    new Toast({ message: "Please paste or load tokens first.", type: "danger" });
    return;
  }
  const tokens = raw.split("\n");
  checkAllTokens(tokens);
});

$("#loadFile").click(() => {
  const file = $("#fileInput")[0].files[0];
  if (!file) {
    new Toast({ message: "Select a .txt file first.", type: "danger" });
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    $("#tokens").val(e.target.result);
    new Toast({ message: "Tokens loaded from file!", type: "success" });
  };
  reader.readAsText(file);
});
