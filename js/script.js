const API = {
  allIssues: "https://phi-lab-server.vercel.app/api/v1/lab/issues",
  singleIssue: "https://phi-lab-server.vercel.app/api/v1/lab/issue/",
  searchIssue: "https://phi-lab-server.vercel.app/api/v1/lab/issues/search?q="
};

const DEMO_USER = {
  username: "admin",
  password: "admin123"
};

const state = {
  allIssues: [],
  filteredIssues: [],
  activeTab: "all",
  searchText: ""
};

// Elements
const loginPage = document.getElementById("loginPage");
const appPage = document.getElementById("appPage");
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");
const logoutBtn = document.getElementById("logoutBtn");

const issuesContainer = document.getElementById("issuesContainer");
const issueCount = document.getElementById("issueCount");
const loadingSpinner = document.getElementById("loadingSpinner");
const emptyState = document.getElementById("emptyState");

const tabButtons = document.querySelectorAll(".tab-btn");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");

// Modal elements
const issueModal = document.getElementById("issueModal");
const modalTitle = document.getElementById("modalTitle");
const modalStatus = document.getElementById("modalStatus");
const modalAuthor = document.getElementById("modalAuthor");
const modalDate = document.getElementById("modalDate");
const modalDescription = document.getElementById("modalDescription");
const modalAssignee = document.getElementById("modalAssignee");
const modalPriority = document.getElementById("modalPriority");
const modalCategory = document.getElementById("modalCategory");
const modalLabels = document.getElementById("modalLabels");
const closeModalBtn = document.getElementById("closeModalBtn");
const closeModalBtnTop = document.getElementById("closeModalBtnTop");

// ---------- Helpers ----------
function showSpinner() {
  loadingSpinner.classList.remove("hidden");
  issuesContainer.classList.add("hidden");
  emptyState.classList.add("hidden");
}

function hideSpinner() {
  loadingSpinner.classList.add("hidden");
  issuesContainer.classList.remove("hidden");
}

function formatDate(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString();
}

function capitalize(text = "") {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function getStatus(issue) {
  const rawStatus = issue?.status || issue?.state || issue?.category || "";
  const normalized = String(rawStatus).toLowerCase();

  if (normalized.includes("close")) return "closed";
  if (normalized.includes("open")) return "open";

  // fallback guess
  return "open";
}

function getPriority(issue) {
  return issue?.priority || "N/A";
}

function getCategory(issue) {
  return issue?.category || issue?.status || "N/A";
}

function getAuthor(issue) {
  return issue?.author || issue?.createdBy || issue?.user || "Unknown";
}

function getAssignee(issue) {
  return issue?.assignee || issue?.assignedTo || "N/A";
}

function getLabels(issue) {
  if (Array.isArray(issue?.label)) return issue.label;
  if (Array.isArray(issue?.labels)) return issue.labels;
  if (typeof issue?.label === "string") return [issue.label];
  if (typeof issue?.labels === "string") return issue.labels.split(",").map(item => item.trim());
  return [];
}

function setActiveTabUI(activeTab) {
  tabButtons.forEach(btn => {
    const isActive = btn.dataset.tab === activeTab;
    if (isActive) {
      btn.className = "tab-btn bg-violet-600 text-white px-5 py-2 rounded-lg font-medium";
    } else {
      btn.className = "tab-btn bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2 rounded-lg font-medium";
    }
  });
}

function updateIssueCount() {
  issueCount.textContent = `${state.filteredIssues.length} Issues`;
}

function getBorderColor(status) {
  return status === "closed" ? "border-violet-500" : "border-emerald-500";
}

function getStatusBadge(status) {
  return status === "closed"
    ? "bg-violet-100 text-violet-700"
    : "bg-emerald-100 text-emerald-700";
}

function getPriorityBadge(priority) {
  const p = String(priority).toLowerCase();

  if (p.includes("high")) return "bg-red-100 text-red-600";
  if (p.includes("medium")) return "bg-amber-100 text-amber-700";
  if (p.includes("low")) return "bg-slate-200 text-slate-600";
  return "bg-slate-100 text-slate-600";
}

function getLabelBadgeClass(label) {
  const l = String(label).toLowerCase();

  if (l.includes("bug")) return "bg-red-50 text-red-500 border border-red-200";
  if (l.includes("help")) return "bg-amber-50 text-amber-600 border border-amber-200";
  if (l.includes("enhancement")) return "bg-emerald-50 text-emerald-600 border border-emerald-200";
  return "bg-slate-100 text-slate-600 border border-slate-200";
}

// ---------- Auth ----------
function checkAuth() {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  if (isLoggedIn) {
    loginPage.classList.add("hidden");
    appPage.classList.remove("hidden");
    fetchAllIssues();
  } else {
    loginPage.classList.remove("hidden");
    appPage.classList.add("hidden");
  }
}

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (username === DEMO_USER.username && password === DEMO_USER.password) {
    localStorage.setItem("isLoggedIn", "true");
    loginError.classList.add("hidden");
    loginForm.reset();
    checkAuth();
  } else {
    loginError.textContent = "Invalid username or password. Use admin / admin123";
    loginError.classList.remove("hidden");
  }
});

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("isLoggedIn");
  state.allIssues = [];
  state.filteredIssues = [];
  issuesContainer.innerHTML = "";
  loginPage.classList.remove("hidden");
  appPage.classList.add("hidden");
});

// ---------- API ----------
async function fetchAllIssues() {
  try {
    showSpinner();

    const res = await fetch(API.allIssues);
    const data = await res.json();

    const issues = extractIssuesArray(data);
    state.allIssues = issues;

    applyFilters();
  } catch (error) {
    console.error("Failed to fetch issues:", error);
    issuesContainer.innerHTML = `
      <div class="col-span-full bg-red-50 border border-red-200 text-red-600 rounded-xl p-4">
        Failed to load issues. Please try again.
      </div>
    `;
  } finally {
    hideSpinner();
  }
}

async function searchIssues(searchText) {
  try {
    showSpinner();

    const res = await fetch(`${API.searchIssue}${encodeURIComponent(searchText)}`);
    const data = await res.json();

    const issues = extractIssuesArray(data);
    state.allIssues = issues;
    applyFilters();
  } catch (error) {
    console.error("Search failed:", error);
    issuesContainer.innerHTML = `
      <div class="col-span-full bg-red-50 border border-red-200 text-red-600 rounded-xl p-4">
        Search failed. Please try again.
      </div>
    `;
  } finally {
    hideSpinner();
  }
}

async function fetchSingleIssue(id) {
  try {
    const res = await fetch(`${API.singleIssue}${id}`);
    const data = await res.json();
    return extractSingleIssue(data);
  } catch (error) {
    console.error("Failed to fetch single issue:", error);
    return null;
  }
}

function extractIssuesArray(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.issues)) return data.issues;
  if (Array.isArray(data?.result)) return data.result;
  return [];
}

function extractSingleIssue(data) {
  if (data?.data) return data.data;
  if (data?.issue) return data.issue;
  return data;
}

// ---------- Filters ----------
function applyFilters() {
  let result = [...state.allIssues];

  if (state.activeTab !== "all") {
    result = result.filter(issue => getStatus(issue) === state.activeTab);
  }

  state.filteredIssues = result;
  updateIssueCount();
  renderIssues(result);
}

tabButtons.forEach(button => {
  button.addEventListener("click", () => {
    state.activeTab = button.dataset.tab;
    setActiveTabUI(state.activeTab);
    applyFilters();
  });
});

// ---------- Search ----------
searchBtn.addEventListener("click", handleSearch);
searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleSearch();
});

function handleSearch() {
  const text = searchInput.value.trim();
  state.searchText = text;

  if (text) {
    searchIssues(text);
  } else {
    fetchAllIssues();
  }
}

// ---------- Render ----------
function renderIssues(issues) {
  issuesContainer.innerHTML = "";

  if (!issues.length) {
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");

  issues.forEach(issue => {
    const status = getStatus(issue);
    const labels = getLabels(issue);
    const priority = getPriority(issue);

    const card = document.createElement("div");
    card.className = `
      bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition
      border-t-4 ${getBorderColor(status)} p-4 flex flex-col justify-between min-h-[280px]
    `;

    card.innerHTML = `
      <div>
        <div class="flex items-start justify-between gap-2 mb-3">
          <span class="text-xs px-2 py-1 rounded-full font-medium ${getStatusBadge(status)}">
            ${capitalize(status)}
          </span>
          <span class="text-xs px-2 py-1 rounded-full font-medium ${getPriorityBadge(priority)}">
            ${priority}
          </span>
        </div>

        <h3
          class="issue-title text-base font-bold leading-6 mb-2 cursor-pointer hover:text-violet-600 transition"
          data-id="${issue.id || issue._id || ""}"
        >
          ${issue.title || "Untitled Issue"}
        </h3>

        <p class="text-sm text-slate-500 leading-6 mb-4">
          ${(issue.description || "No description available.").slice(0, 90)}${(issue.description || "").length > 90 ? "..." : ""}
        </p>

        <div class="flex flex-wrap gap-2 mb-4">
          ${
            labels.length
              ? labels.map(label => `
                <span class="text-[11px] px-2 py-1 rounded-full ${getLabelBadgeClass(label)}">
                  ${label}
                </span>
              `).join("")
              : `<span class="text-[11px] px-2 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200">No Label</span>`
          }
        </div>
      </div>

      <div class="text-xs text-slate-500 space-y-1 mt-2">
        <p><span class="font-semibold text-slate-700">Author:</span> ${getAuthor(issue)}</p>
        <p><span class="font-semibold text-slate-700">Category:</span> ${getCategory(issue)}</p>
        <p><span class="font-semibold text-slate-700">Created:</span> ${formatDate(issue.createdAt || issue.created_at)}</p>
      </div>
    `;

    const title = card.querySelector(".issue-title");
    title.addEventListener("click", async () => {
      const issueId = issue.id || issue._id;

      if (issueId) {
        const fullIssue = await fetchSingleIssue(issueId);
        openModal(fullIssue || issue);
      } else {
        openModal(issue);
      }
    });

    issuesContainer.appendChild(card);
  });
}

// ---------- Modal ----------
function openModal(issue) {
  const status = getStatus(issue);
  const labels = getLabels(issue);

  modalTitle.textContent = issue?.title || "Untitled Issue";
  modalStatus.innerHTML = `
    <span class="inline-block text-xs px-2 py-1 rounded-full font-medium ${getStatusBadge(status)}">
      ${capitalize(status)}
    </span>
  `;
  modalAuthor.textContent = `By ${getAuthor(issue)}`;
  modalDate.textContent = formatDate(issue?.createdAt || issue?.created_at);
  modalDescription.textContent = issue?.description || "No description available.";
  modalAssignee.textContent = getAssignee(issue);
  modalPriority.innerHTML = `
    <span class="inline-block text-xs px-2 py-1 rounded-full font-medium ${getPriorityBadge(getPriority(issue))}">
      ${getPriority(issue)}
    </span>
  `;
  modalCategory.textContent = getCategory(issue);

  modalLabels.innerHTML = labels.length
    ? labels
        .map(label => `
          <span class="text-xs px-2 py-1 rounded-full ${getLabelBadgeClass(label)}">
            ${label}
          </span>
        `)
        .join("")
    : `<span class="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200">No Label</span>`;

  issueModal.classList.remove("hidden");
  issueModal.classList.add("flex");
}

function closeModal() {
  issueModal.classList.add("hidden");
  issueModal.classList.remove("flex");
}

closeModalBtn.addEventListener("click", closeModal);
closeModalBtnTop.addEventListener("click", closeModal);

issueModal.addEventListener("click", (e) => {
  if (e.target === issueModal) {
    closeModal();
  }
});

// ---------- Init ----------
checkAuth();
setActiveTabUI("all");