// tabs.js

export function showTab(tabId) {
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
