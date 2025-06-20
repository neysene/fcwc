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

// Sortable kurulumu
function initializeSortables() {
  document.querySelectorAll(".group").forEach((group) => {
    Sortable.create(group, {
      animation: 150,
      group: "groups",
      draggable: ".team",
      onSort: () => {
        updateKnockoutMatches();
        updateLeaderboard();
      },
    });
  });
}

// DOM yüklendiğinde başlat
document.addEventListener("DOMContentLoaded", () => {
  initializeSortables();
  updateKnockoutMatches();
  updateLeaderboard();

  document.addEventListener("click", (e) => {
    const team = e.target.closest(".team-mini");
    const match = e.target.closest(".match");
    if (!team || !match || !match.dataset.next || !match.dataset.slot) return;

    const selected = {
      name: normalize(team.textContent),
      src: team.querySelector("img")?.src || "",
      alt: team.querySelector("img")?.alt || "",
    };

    const allTeams = match.querySelectorAll(".team-mini");
    allTeams.forEach((t) => t.classList.remove("winner"));
    team.classList.add("winner");

    const nextId = match.dataset.next;
    const slot = match.dataset.slot;
    const target = document.getElementById(nextId);
    if (!target) return;

    const block = document.createElement("div");
    block.className = `team-mini team-${slot}`;
    block.innerHTML = `<img src="${selected.src}" alt="${selected.alt}" />${selected.name}`;
    const existing = target.querySelector(`.team-${slot}`);
    if (existing) existing.replaceWith(block);
    else target.appendChild(block);

    if (match.id === "final") {
      const champion = document.getElementById("champion");
      if (champion) {
        champion.innerHTML = `
            <div class="match-label">🏆 Şampiyon</div>
            <div class="team-mini"><img src="${selected.src}" alt="${selected.alt}" />${selected.name}</div>
          `;
      }
    }

    updateLeaderboard();
  });
});

// Grup eşleşmelerini oluştur
function updateKnockoutMatches() {
  const groupData = {};
  document.querySelectorAll(".group").forEach((group) => {
    const groupName = group
      .querySelector(".group-title")
      ?.textContent.trim()
      .replace("Grup ", "");
    const teams = [...group.querySelectorAll(".team")].map((team) => {
      const img = team.querySelector("img");
      return {
        name: normalize(team.textContent),
        src: img?.src || "",
        alt: img?.alt || "",
      };
    });
    if (groupName) groupData[groupName] = teams;
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
        <div class="team-mini"><img src="${t1.src}" alt="${t1.alt}" />${t1.name}</div>
        <div class="team-mini"><img src="${t2.src}" alt="${t2.alt}" />${t2.name}</div>
      `;
  });

  initializeSortables();
  updateLeaderboard();
}

// Puanla ve sırala
function puanla(tahminler) {
  const puanlar = {};

  // Gerçek grup sıralamaları
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

  // Gerçek kazananlar
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

// Sıralama sekmesini güncelle
function updateLeaderboard() {
  if (typeof tahminler !== "object") return;
  const puanlar = puanla(tahminler);
  const sirali = Object.entries(puanlar).sort((a, b) => b[1] - a[1]);

  const tablo = document.getElementById("puan-tablosu");
  if (!tablo) return;

  tablo.innerHTML = "<h3>🏅 Tahmin Sıralaması</h3>";
  sirali.forEach(([isim, puan]) => {
    const satir = document.createElement("div");
    satir.innerHTML = `<span>${isim}</span><span>${puan} puan</span>`;
    tablo.appendChild(satir);
  });
}
