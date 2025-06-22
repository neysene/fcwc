//leaderboard.js

import { normalize, getTeamAbbr } from "./utils.js";
import { tahminler } from "./tahminler.js";

export function detailedPuanla(tahminler) {
  const kazananlar = { qf: [], sf: [], final: [], champion: "" };
  const grupSonuclari = {};
  const turPuanlari = { qf: 23, sf: 43, final: 77 };

  // Gerçek grup sıralamaları
  document.querySelectorAll(".group").forEach((group) => {
    const grupAdi = group
      .querySelector(".group-title")
      ?.textContent.trim()
      .replace("Grup ", "");
    const takimlar = [...group.querySelectorAll(".team")].map((t) =>
      normalize(t.textContent)
    );
    if (grupAdi) grupSonuclari[grupAdi] = takimlar;
  });

  // Eleme sonuçları
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
    kazananlar[tur] = roundMap[tur]
      .map((id) => {
        const winner = document
          .getElementById(id)
          ?.querySelector(".team-mini.winner");
        return winner ? normalize(winner.textContent) : "";
      })
      .filter(Boolean);
  }
  const champ = document.querySelector("#champion .team-mini");
  kazananlar.champion = champ ? normalize(champ.textContent) : "";

  const total = {};
  const detay = {};

  for (const kisi in tahminler) {
    const t = tahminler[kisi];
    let group = 0,
      qf = 0,
      sf = 0,
      final = 0,
      champion = 0;

    // Grup puanı
    for (const grup in t.groups) {
      const tahmin = t.groups[grup];
      const gercek = grupSonuclari[grup];
      if (!gercek) continue;
      for (let i = 0; i < 4; i++) {
        if (normalize(tahmin[i]) === normalize(gercek[i])) {
          group += [11, 7, 3, 1][i];
        }
      }
    }

    // Eleme turları (her doğru tahmin için ayrı ayrı puan eklenir)
    for (const tur of ["qf", "sf", "final"]) {
      let tahminlerTur;
      if (Array.isArray(t.knockout[tur])) {
        tahminlerTur = t.knockout[tur];
      } else if (
        typeof t.knockout[tur] === "string" &&
        t.knockout[tur].includes(",")
      ) {
        tahminlerTur = t.knockout[tur].split(",").map((item) => item.trim());
      } else {
        tahminlerTur = [t.knockout[tur]];
      }

      // Gerçek sonuçlarda da, DOM’dan alınan takım bilgilerini kısaltmaya çeviriyoruz
      const gercek = (kazananlar[tur] || []).map((item) => getTeamAbbr(item));
      const puanDegeri = turPuanlari[tur];

      tahminlerTur.forEach((takim) => {
        // Her iki tarafı da kısaltmaya çevirip karşılaştıralım
        if (gercek.includes(getTeamAbbr(takim))) {
          if (tur === "qf") qf += puanDegeri;
          if (tur === "sf") sf += puanDegeri;
          if (tur === "final") final += puanDegeri;
        }
      });
    }

    // Şampiyon bonusu: Şampiyon tahmin ile gerçek şampiyonu kısaltma üzerinden karşılaştırıyoruz.
    if (
      normalize(getTeamAbbr(t.knockout.champion)) &&
      normalize(getTeamAbbr(t.knockout.champion)) ===
        normalize(getTeamAbbr(kazananlar.champion))
    ) {
      champion = 200;
    }

    total[kisi] = group + qf + sf + final + champion;
    detay[kisi] = { group, qf, sf, final, champion };
  }

  return { total, detay };
}

export function updateLeaderboard() {
  const tablo = document.getElementById("puan-tablosu");
  if (!tablo || typeof tahminler !== "object") return;

  const { total, detay } = detailedPuanla(tahminler);

  // Tahmin sırasına göre kullanıcı adlarını alalım. tie-breaker için kullanılacak
  const orijinalSira = Object.keys(tahminler);

  // Sıralama: önce puana göre azalan, sonra orijinal sıraya göre
  const sirali = Object.entries(total).sort((a, b) => {
    const puanFark = b[1] - a[1];
    if (puanFark !== 0) return puanFark;

    // Eşit puan varsa, tahmin sırasındaki önce gelen üste çıkar
    return orijinalSira.indexOf(a[0]) - orijinalSira.indexOf(b[0]);
  });

  tablo.innerHTML = `
    <div class="table-row header">
      <div class="sira">#</div>
      <div class="isim">İsim</div>
      <div class="puan">Puan</div>
      <div class="champion">Şamp</div>
      <div class="final">Final</div>
      <div class="sf">Yarı</div>
      <div class="qf">Çeyrek</div>
      <div class="grp">Grup</div>
    </div>
  `;

  sirali.forEach(([isim, puan], index) => {
    const d = detay[isim];
    const satir = document.createElement("div");
    satir.classList.add("puan-satiri", "table-row");
    satir.innerHTML = `
      <div class="sira">${index + 1}</div>
      <div class="isim">${isim}</div>
      <div class="puan">${puan}</div>
      <div class="champion">${d.champion}</div>
      <div class="final">${d.final}</div>
      <div class="sf">${d.sf}</div>
      <div class="qf">${d.qf}</div>
      <div class="grp">${d.group}</div>
    `;
    tablo.appendChild(satir);
  });
}
