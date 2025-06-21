// utils.js

import { teams } from "./teams.js";

export function getTeamAbbr(teamStr) {
  const normalizedInput = teamStr.toLowerCase().trim();
  // Takım listesini dönerken, girilen değerin tam ismi veya kısaltması ile eşleşiyor mu kontrol ediyoruz.
  const found = teams.find((team) => {
    return (
      team.name.toLowerCase() === normalizedInput ||
      team.abbr.toLowerCase() === normalizedInput
    );
  });
  // Eğer eşleşme bulunursa, her zaman kısaltmayı döndür
  return found ? found.abbr.toLowerCase() : normalizedInput;
}

export function normalize(text) {
  return text.replace(/\s+/g, " ").trim();
}

// utils.js içindeki renderTeamMini fonksiyonu
export function renderTeamMini(teamData, extraClass = "", useAbbr = false) {
  let displayText = teamData.name;
  if (useAbbr) {
    if (teamData.abbr) {
      displayText = teamData.abbr;
    } else {
      // Varsayılan olarak ismin ilk 4 harfi (örnek: böyle de tercih edilebilir)
      displayText = teamData.name.substring(0, 4).toUpperCase();
    }
  }
  return `<div class="team-mini ${extraClass}" data-fullname="${teamData.name}">
    ${teamData.src ? `<img src="${teamData.src}" alt="${teamData.alt}" />` : ""}
    ${displayText}
  </div>`;
}
