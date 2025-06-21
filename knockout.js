// knockout.js

import { normalize, renderTeamMini } from "./utils.js";

export function clearPathFrom(matchId) {
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

export function propagateWinner(matchId) {
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

export function updateKnockoutMatches() {
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
        // data-abbr attribute'ini okuyarak abbr bilgisini ekliyoruz.
        abbr: t.dataset.abbr ? t.dataset.abbr.trim() : "",
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
      abbr: "",
    };
    const t2 = groupData[g2]?.[i2] || {
      name: `${g2}${i2 + 1}`,
      src: "",
      alt: "",
      abbr: "",
    };
    // renderTeamMini çağrısını kısaltma modunda yapıyoruz: useAbbr = true
    match.innerHTML = `
      ${renderTeamMini(t1, "", true)}
      ${renderTeamMini(t2, "", true)}
    `;
  });
}
