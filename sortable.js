// sortable.js

import { updateKnockoutMatches } from "./knockout.js";
import { updateLeaderboard } from "./leaderboard.js";

export function initializeSortables() {
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
