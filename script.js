const setupForm = document.getElementById("setupForm");
const salaryInput = document.getElementById("salaryInput");
const startingBalanceInput = document.getElementById("startingBalanceInput");

const balanceForm = document.getElementById("balanceForm");
const balanceInput = document.getElementById("balanceInput");

const currentBalanceEl = document.getElementById("currentBalance");
const rankNameEl = document.getElementById("rankName");
const lifePercentEl = document.getElementById("lifePercent");
const lifeBarEl = document.getElementById("lifeBar");
const lifeTextEl = document.getElementById("lifeText");
const excessXpEl = document.getElementById("excessXp");
const levelBarEl = document.getElementById("levelBar");
const levelTextEl = document.getElementById("levelText");
const levelEl = document.getElementById("level");
const levelMessageEl = document.getElementById("levelMessage");
const logListEl = document.getElementById("logList");
const gameMessageEl = document.getElementById("gameMessage");
const resetBtn = document.getElementById("resetBtn");

const menuBtn = document.getElementById("menuBtn");
const setupMenu = document.getElementById("setupMenu");

const profileUpload = document.getElementById("profileUpload");
const profileImg = document.getElementById("profileImg");
const profilePlaceholder = document.getElementById("profilePlaceholder");
const removePhotoBtn = document.getElementById("removePhotoBtn");

let game = JSON.parse(localStorage.getItem("savingsXpGame")) || {
  salary: 0,
  startingBalance: 0,
  currentBalance: 0,
  lifeXp: 100,
  storedExcessXp: 0,
  level: 1,
  log: [],
  hasSetup: false
};

function formatMoney(amount) {
  return "$" + Number(amount).toLocaleString();
}

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function calculateRank(level) {
  if (level >= 20) return "Savings Dominator";
  if (level >= 15) return "Wealth Champion";
  if (level >= 10) return "Money Knight";
  if (level >= 5) return "Gold Farmer";
  if (level >= 3) return "Disciplined Saver";
  return "Rookie Saver";
}

function saveGame() {
  localStorage.setItem("savingsXpGame", JSON.stringify(game));
}

function updateCharacterLevel() {
  game.level = 1 + game.storedExcessXp / 100;
  game.level = Math.round(game.level * 100) / 100;
}

function updateProfileBadge() {
  const profileFrame = document.getElementById("profileFrame");
  const profileTitle = document.getElementById("profileTitle");
  const profileLevel = document.getElementById("profileLevel");
  const profileStars = document.getElementById("profileStars");

  profileLevel.textContent = "Level " + game.level.toFixed(2);

  if (game.level >= 20) {
    profileTitle.textContent = "Savings Dominator";
    profileFrame.style.borderColor = "#facc15";
    profileFrame.style.boxShadow = "0 0 35px #facc15";
    profileStars.textContent = "⭐⭐⭐⭐⭐⭐";
  } else if (game.level >= 15) {
    profileTitle.textContent = "Wealth Champion";
    profileFrame.style.borderColor = "#a855f7";
    profileFrame.style.boxShadow = "0 0 30px #a855f7";
    profileStars.textContent = "⭐⭐⭐⭐⭐";
  } else if (game.level >= 10) {
    profileTitle.textContent = "Money Knight";
    profileFrame.style.borderColor = "#3b82f6";
    profileFrame.style.boxShadow = "0 0 25px #3b82f6";
    profileStars.textContent = "⭐⭐⭐⭐";
  } else if (game.level >= 5) {
    profileTitle.textContent = "Gold Farmer";
    profileFrame.style.borderColor = "#22c55e";
    profileFrame.style.boxShadow = "0 0 22px #22c55e";
    profileStars.textContent = "⭐⭐⭐";
  } else if (game.level >= 3) {
    profileTitle.textContent = "Disciplined Saver";
    profileFrame.style.borderColor = "#06b6d4";
    profileFrame.style.boxShadow = "0 0 18px #06b6d4";
    profileStars.textContent = "⭐⭐";
  } else {
    profileTitle.textContent = "Rookie Saver";
    profileFrame.style.borderColor = "#9ca3af";
    profileFrame.style.boxShadow = "0 0 15px rgba(255,255,255,0.3)";
    profileStars.textContent = "⭐";
  }
}

function updatePhotoControls() {
  const savedPhoto = localStorage.getItem("profileImage");

  if (savedPhoto) {
    removePhotoBtn.style.display = "block";
  } else {
    removePhotoBtn.style.display = "none";
  }
}

function loadSavedProfileImage() {
  const savedProfileImage = localStorage.getItem("profileImage");

  if (savedProfileImage) {
    profileImg.src = savedProfileImage;
    profileImg.style.display = "block";
    profilePlaceholder.style.display = "none";
  } else {
    profileImg.removeAttribute("src");
    profileImg.style.display = "none";
    profilePlaceholder.style.display = "block";
    profileUpload.value = "";
  }

  updatePhotoControls();
}

function updateDashboard() {
  salaryInput.value = game.salary || "";
  startingBalanceInput.value = game.startingBalance || "";

  if (game.hasSetup) {
    startingBalanceInput.disabled = true;
    startingBalanceInput.placeholder = "Locked after setup";
  } else {
    startingBalanceInput.disabled = false;
    startingBalanceInput.placeholder = "Example: 1000";
  }

  updateCharacterLevel();

  currentBalanceEl.textContent = formatMoney(game.currentBalance || 0);
  rankNameEl.textContent = calculateRank(game.level);
  levelEl.textContent = "Level " + game.level.toFixed(2);

  const safeLifeXp = Math.max(game.lifeXp, 0);
  const lifeBarWidth = Math.min(safeLifeXp, 100);

  lifePercentEl.textContent = Math.round(game.lifeXp) + "%";
  lifeBarEl.style.width = lifeBarWidth + "%";

  if (game.lifeXp < 50) {
    lifeBarEl.className = "progress-bar danger-bar";
  } else {
    lifeBarEl.className = "progress-bar life-bar";
  }

  lifeTextEl.textContent = "Your monthly salary equals 100% XP: " + formatMoney(game.salary || 0);

  excessXpEl.textContent = Math.round(game.storedExcessXp) + "%";
  levelBarEl.style.width = Math.max(0, Math.min(game.storedExcessXp, 100)) + "%";
  levelTextEl.textContent =
    Math.round(game.storedExcessXp) + "% excess XP = +" + (game.storedExcessXp / 100).toFixed(2) + " levels";
  levelMessageEl.textContent =
    "Every 10% excess XP increases level by 0.10. If you overspend, excess XP decreases.";

  renderLog();
  updateProfileBadge();
  saveGame();
}

function renderLog() {
  logListEl.innerHTML = "";

  if (!game.log || game.log.length === 0) {
    logListEl.innerHTML = "<li>No XP changes yet. Enter your first balance update.</li>";
    return;
  }

  const sortedLog = game.log.slice().reverse();

  sortedLog.forEach(function(entry) {
    const li = document.createElement("li");
    li.className = "log-item";

    const xpClass = entry.xpChange >= 0 ? "positive" : "negative";
    const sign = entry.xpChange >= 0 ? "+" : "";

    li.innerHTML = `
      <div class="log-top">
        <span>${entry.date}</span>
        <span class="${xpClass}">${sign}${entry.xpChange.toFixed(1)}% XP</span>
      </div>
      <div class="subtext">
        Balance: ${formatMoney(entry.oldBalance)} → ${formatMoney(entry.newBalance)}<br>
        Change: ${formatMoney(entry.moneyChange)}
      </div>
    `;

    logListEl.appendChild(li);
  });
}

profileUpload.addEventListener("change", function() {
  const file = profileUpload.files[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = function(event) {
    localStorage.setItem("profileImage", event.target.result);
    loadSavedProfileImage();
  };

  reader.readAsDataURL(file);
});

removePhotoBtn.addEventListener("click", function() {
  const confirmDelete = confirm(
    "Remove your profile picture?\n\nThis cannot be undone."
  );

  if (!confirmDelete) return;

  localStorage.removeItem("profileImage");

  profileImg.removeAttribute("src");
  profileImg.style.display = "none";
  profilePlaceholder.style.display = "block";
  profileUpload.value = "";

  updatePhotoControls();
});

menuBtn.addEventListener("click", function() {
  setupMenu.classList.toggle("hidden");
});

setupForm.addEventListener("submit", function(event) {
  event.preventDefault();

  const salary = Number(salaryInput.value);
  const startingBalance = Number(startingBalanceInput.value);

  if (salary <= 0) {
    gameMessageEl.textContent = "Salary must be greater than 0.";
    return;
  }

  if (!game.hasSetup) {
    game.salary = salary;
    game.startingBalance = startingBalance;
    game.currentBalance = startingBalance;
    game.lifeXp = 100;
    game.storedExcessXp = 0;
    game.level = 1;
    game.log = [];
    game.hasSetup = true;

    gameMessageEl.textContent = "Game started. Your salary now equals 100% XP.";
  } else {
    game.salary = salary;
    game.lifeXp = 100;

    gameMessageEl.textContent = "Salary updated. Your XP has been recharged to 100%.";
  }

  updateDashboard();
});

balanceForm.addEventListener("submit", function(event) {
  event.preventDefault();

  if (!game.salary || game.salary <= 0) {
    gameMessageEl.textContent = "Set up your salary first.";
    return;
  }

  const date = todayString();
  const newBalance = Number(balanceInput.value);
  const oldBalance = Number(game.currentBalance);
  const moneyChange = newBalance - oldBalance;
  const xpChange = (moneyChange / game.salary) * 100;

  game.currentBalance = newBalance;

  let excessGained = 0;

  if (xpChange > 0) {
    game.lifeXp += xpChange;

    if (game.lifeXp > 100) {
      excessGained = game.lifeXp - 100;
      game.storedExcessXp += excessGained;
      game.lifeXp = 100;
    }
  }

  if (xpChange < 0) {
    let damage = Math.abs(xpChange);

    if (game.lifeXp > 0) {
      const damageToLife = Math.min(game.lifeXp, damage);
      game.lifeXp -= damageToLife;
      damage -= damageToLife;
    }

    if (damage > 0) {
      game.storedExcessXp -= damage;
    }
  }

  game.log.push({
    date: date,
    oldBalance: oldBalance,
    newBalance: newBalance,
    moneyChange: moneyChange,
    xpChange: xpChange,
    excessGained: excessGained
  });

  if (moneyChange > 0) {
    gameMessageEl.textContent =
      "You gained " + xpChange.toFixed(1) + "% XP. Excess XP earned: " + excessGained.toFixed(1) + "%.";
  } else if (moneyChange < 0) {
    gameMessageEl.textContent =
      "You lost " + Math.abs(xpChange).toFixed(1) + "% XP. Your life bar took damage.";
  } else {
    gameMessageEl.textContent = "No balance change. XP stayed the same.";
  }

  balanceInput.value = "";
  updateDashboard();
});

resetBtn.addEventListener("click", function() {
  const confirmReset = confirm(
    "Are you sure you want to reset the game?\n\n" +
    "This cannot be undone.\n" +
    "All previous stats, XP, levels, logs, and achievements will be permanently lost."
  );

  if (!confirmReset) return;

  game = {
    salary: 0,
    startingBalance: 0,
    currentBalance: 0,
    lifeXp: 100,
    storedExcessXp: 0,
    level: 1,
    log: [],
    hasSetup: false
  };

  localStorage.removeItem("savingsXpGame");
  gameMessageEl.textContent = "Game reset.";
  updateDashboard();
});

loadSavedProfileImage();
updateDashboard();
