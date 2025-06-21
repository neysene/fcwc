// Sekme geçişi
function showTab(tabId) {
  document
    .querySelectorAll(".tab-content")
    .forEach((el) => el.classList.remove("active"));
  document
    .querySelectorAll(".tab-button")
    .forEach((btn) => btn.classList.remove("active"));
  document.getElementById(tabId).classList.add("active");
  const btn = document.querySelector(
    `.tab-button[onclick="showTab('${tabId}')"]`
  );
  if (btn) btn.classList.add("active");
}

// Gereksiz boşlukları temizler
function normalize(text) {
  return text.replace(/\s+/g, " ").trim();
}

// DRY için: team-mini içeriğini oluşturur
function renderTeamMini(teamData, extraClass = "") {
  return `<div class="team-mini ${extraClass}">${
    teamData.src ? `<img src="${teamData.src}" alt="${teamData.alt}" />` : ""
  }${teamData.name}</div>`;
}

// Sortable'ı yalnızca bir kez kurar, grup başına benzersiz isim vererek
function initializeSortables() {
  document.querySelectorAll(".group").forEach((group, index) => {
    // Eğer grup zaten başlatılmışsa atla:
    if (group.classList.contains("sortable-initialized")) return;

    Sortable.create(group, {
      animation: 150,
      group: {
        // Her grup için benzersiz bir isim oluşturuyorum
        name: "group-" + index,
        put: false, // Başka gruplardan öğe alınmasına izin verme.
      },
      draggable: ".team",
      onSort: () => {
        updateKnockoutMatches();
        updateLeaderboard();
      },
    });

    group.classList.add("sortable-initialized");
  });
}

// Seçilen maçtan sonraki tüm zincir yolunu temizler
function clearPathFrom(matchId) {
  let currentId = matchId;
  const visited = new Set();

  while (currentId) {
    if (visited.has(currentId)) break;
    visited.add(currentId);

    const match = document.getElementById(currentId);
    if (!match) break;

    const nextId = match.dataset.next;
    const slot = match.dataset.slot;

    if (nextId && slot) {
      const nextMatch = document.getElementById(nextId);
      if (nextMatch) {
        // Belirtilen slotdaki takım varsa kaldır
        const teamEl = nextMatch.querySelector(`.team-${slot}`);
        if (teamEl) teamEl.remove();
        // O maçtaki tüm takım seçimi "winner" sınıflarını kaldır
        nextMatch
          .querySelectorAll(".team-mini")
          .forEach((el) => el.classList.remove("winner"));
      }
      currentId = nextId;
    } else {
      break;
    }
  }
  // Şampiyon kutusunu da temizle
  const championSlot = document.getElementById("champion");
  if (championSlot) championSlot.innerHTML = "";
}

// Zincirleme propagasyon: Eğer mevcut maç final değilse, galibiyi bir üst maça taşır.
// Eğer mevcut maç final ise, şampiyon kutusunu günceller.
function propagateWinner(matchId) {
  const match = document.getElementById(matchId);
  const winner = match?.querySelector(".team-mini.winner");
  if (!winner) return;

  // Eğer bu maç final ise, şampiyon kutusunu güncelle ve dur.
  if (matchId === "final") {
    const championSlot = document.getElementById("champion");
    if (championSlot) {
      const teamData = {
        name: normalize(winner.textContent),
        src: winner.querySelector("img")?.src || "",
        alt: winner.querySelector("img")?.alt || "",
      };
      championSlot.innerHTML = `
        <div class="match-label">🏆 Şampiyon</div>
        ${renderTeamMini(teamData)}
      `;
    }
    return;
  }

  const nextId = match.dataset.next;
  const slot = match.dataset.slot;
  if (!nextId || !slot) return;

  const nextMatch = document.getElementById(nextId);
  if (!nextMatch) return;

  const teamData = {
    name: normalize(winner.textContent),
    src: winner.querySelector("img")?.src || "",
    alt: winner.querySelector("img")?.alt || "",
  };

  const newBlockHTML = renderTeamMini(teamData, `team-${slot}`);
  // Yeni elementi oluşturmak için geçici container kullanıyoruz.
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = newBlockHTML;
  const newBlock = tempDiv.firstElementChild;

  const existing = nextMatch.querySelector(`.team-${slot}`);
  if (existing) {
    existing.replaceWith(newBlock);
  } else {
    if (slot === "left") {
      nextMatch.insertBefore(newBlock, nextMatch.firstChild);
    } else {
      const leftEl = nextMatch.querySelector(".team-left");
      if (leftEl && leftEl.nextSibling) {
        leftEl.parentNode.insertBefore(newBlock, leftEl.nextSibling);
      } else if (leftEl) {
        leftEl.parentNode.appendChild(newBlock);
      } else {
        nextMatch.appendChild(newBlock);
      }
    }
  }

  propagateWinner(nextId);
}

// DOM yüklendiğinde başlat
document.addEventListener("DOMContentLoaded", () => {
  initializeSortables();
  updateKnockoutMatches();
  updateLeaderboard();

  document.addEventListener("click", (e) => {
    const team = e.target.closest(".team-mini");
    const match = e.target.closest(".match");
    if (!team || !match) return;

    // Mevcut maçtaki tüm takım elemanlarından "winner" sınıfını kaldır
    match
      .querySelectorAll(".team-mini")
      .forEach((el) => el.classList.remove("winner"));
    team.classList.add("winner");

    clearPathFrom(match.id);
    propagateWinner(match.id);
    updateLeaderboard();
  });
});

// Grup verilerinden eşleşmeleri oluşturur
function updateKnockoutMatches() {
  const groupData = {};
  document.querySelectorAll(".group").forEach((group) => {
    const name = group
      .querySelector(".group-title")
      ?.textContent.trim()
      .replace("Grup ", "");
    const teams = [...group.querySelectorAll(".team")].map((t) => {
      const img = t.querySelector("img");
      return {
        name: normalize(t.textContent),
        src: img?.src || "",
        alt: img?.alt || "",
      };
    });
    if (name) groupData[name] = teams;
  });

  const matchups = [
    ["A", 0, "B", 1],
    ["C", 0, "D", 1],
    ["E", 0, "F", 1],
    ["G", 0, "H", 1],
    ["B", 0, "A", 1],
    ["D", 0, "C", 1],
    ["F", 0, "E", 1],
    ["H", 0, "G", 1],
  ];
  const matchIds = [
    "r16-1",
    "r16-2",
    "r16-3",
    "r16-4",
    "r16-5",
    "r16-6",
    "r16-7",
    "r16-8",
  ];

  matchIds.forEach((id, i) => {
    const match = document.getElementById(id);
    const [g1, i1, g2, i2] = matchups[i];
    const t1 = groupData[g1]?.[i1] || {
      name: `${g1}${i1 + 1}`,
      src: "",
      alt: "",
    };
    const t2 = groupData[g2]?.[i2] || {
      name: `${g2}${i2 + 1}`,
      src: "",
      alt: "",
    };
    match.innerHTML = `
      ${renderTeamMini(t1)}
      ${renderTeamMini(t2)}
    `;
  });

  initializeSortables();
  updateLeaderboard();
}

// Tahminlere göre puan hesaplamayı gerçekleştirir
function puanla(tahminler) {
  const puanlar = {};
  const gercekGruplar = {};
  document.querySelectorAll(".group").forEach((group) => {
    const ad = group
      .querySelector(".group-title")
      ?.textContent.trim()
      .replace("Grup ", "");
    const takimlar = [...group.querySelectorAll(".team")].map((t) =>
      normalize(t.textContent)
    );
    if (ad) gercekGruplar[ad] = takimlar;
  });

  const kazananlar = { qf: [], sf: [], final: [], champion: "" };
  const roundMap = {
    qf: [
      "r16-1",
      "r16-2",
      "r16-3",
      "r16-4",
      "r16-5",
      "r16-6",
      "r16-7",
      "r16-8",
    ],
    sf: ["qf-1", "qf-2", "qf-3", "qf-4"],
    final: ["sf-1", "sf-2"],
  };
  for (const tur in roundMap) {
    roundMap[tur].forEach((id) => {
      const match = document.getElementById(id);
      const w = match?.querySelector(".team-mini.winner");
      if (w) kazananlar[tur].push(normalize(w.textContent));
    });
  }
  const champ = document.querySelector("#champion .team-mini");
  if (champ) kazananlar.champion = normalize(champ.textContent);

  for (const kisi in tahminler) {
    let puan = 0;
    const t = tahminler[kisi];

    for (const grup in t.groups) {
      const tahmin = t.groups[grup];
      const gercek = gercekGruplar[grup];
      if (!gercek) continue;
      for (let i = 0; i < 4; i++) {
        if (normalize(tahmin[i]) === normalize(gercek[i])) {
          puan += [11, 7, 3, 1][i];
        }
      }
    }

    const elemePuan = { qf: 23, sf: 43, final: 77 };
    for (const tur in elemePuan) {
      const tahminEdilen = t.knockout[tur] || [];
      tahminEdilen.forEach((takim) => {
        if (kazananlar[tur].includes(normalize(takim))) {
          puan += elemePuan[tur];
        }
      });
    }

    if (
      normalize(t.knockout.champion) === kazananlar.champion &&
      kazananlar.champion
    ) {
      puan += 200;
    }

    puanlar[kisi] = puan;
  }

  return puanlar;
}

// Sıralama tablosunu günceller
function updateLeaderboard() {
  if (typeof tahminler !== "object") return;
  const puanlar = puanla(tahminler);
  const sirali = Object.entries(puanlar).sort((a, b) => b[1] - a[1]);
  const tablo = document.getElementById("puan-tablosu");
  if (!tablo) return;
  tablo.innerHTML = "<h3>🏅 Tahmin Sıralaması</h3>";
  sirali.forEach(([isim, puan], index) => {
    const satir = document.createElement("div");
    satir.classList.add("puan-satiri");
    satir.innerHTML = `
      <span class="sira">${index + 1}.</span>
      <span class="isim">${isim}</span>
      <span class="puan">${puan} puan</span>
    `;
    tablo.appendChild(satir);
  });
}
