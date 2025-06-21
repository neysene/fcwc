// main.js

import { showTab } from "./tabs.js";
import { initializeSortables } from "./sortable.js";
import {
  clearPathFrom,
  propagateWinner,
  updateKnockoutMatches,
} from "./knockout.js";
import { updateLeaderboard } from "./leaderboard.js";
import { renderGroupTeams } from "./teams-ui.js"; // Yeni modül

// Global alana ekleyelim ki HTML inline onclick ifadesi bu fonksiyonu bulabilsin.
window.showTab = showTab;

document.addEventListener("DOMContentLoaded", () => {
  // Grup Aşaması içeriğini dinamik olarak oluştur
  renderGroupTeams();

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
