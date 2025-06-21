// teams-ui.js
import { teams } from "./teams.js";
import { renderTeamMini } from "./utils.js"; // Eğer renderTeamMini kullanmak isterseniz

// Örnek: renderGroupTeams fonksiyonunda
export function renderGroupTeams() {
  const groupContainer = document.querySelector(".group-container");
  if (!groupContainer) return;

  groupContainer.innerHTML = "";

  const groups = teams.reduce((acc, team) => {
    if (!acc[team.group]) {
      acc[team.group] = [];
    }
    acc[team.group].push(team);
    return acc;
  }, {});

  Object.keys(groups)
    .sort()
    .forEach((groupName) => {
      groups[groupName].sort((a, b) => a.order - b.order);

      const groupDiv = document.createElement("div");
      groupDiv.classList.add("group");

      const groupTitle = document.createElement("div");
      groupTitle.className = "group-title";
      groupTitle.textContent = "Grup " + groupName;
      groupDiv.appendChild(groupTitle);

      groups[groupName].forEach((team) => {
        const teamDiv = document.createElement("div");
        teamDiv.classList.add("team");
        // Takım elementine hem logo, hem tam isim, hem de kısaltma bilgisini data attribute olarak ekleyelim.
        teamDiv.innerHTML = `<img src="${team.logo}" alt="${team.name}" />${team.name}`;
        teamDiv.setAttribute("data-abbr", team.abbr);
        groupDiv.appendChild(teamDiv);
      });

      groupContainer.appendChild(groupDiv);
    });
}
