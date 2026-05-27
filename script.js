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
  const today = new Date();
  return today.toISOString().slice(0, 10);
}

function calculateRank(level) {
  if (level >= 20) return "Financial Boss";
  if (level >= 15) return "Elite Gold Farmer";
  if (level >= 10) return "Money Knight";
  if (level >= 5) return "Disciplined Saver";
  return "Novice Saver";
}

function saveGame() {
  localStorage.setItem("savingsXpGame", JSON.stringify(game));
}

function updateCharacterLevel() {
  const excessLevelBonus = game.storedExcessXp / 100;

  game.level = 1 + excessLevelBonus;
  game.level = Math.round(game.level * 100) / 100;
}

function updateDashboard() {
  salaryInput.value = game.salary || "";
  startingBalanceInput.value = game.startingBalance || "";
    if (game.hasSetup) {
  startingBalanceInput.disabled = true;
  startingBalanceInput.placeholder = "Locked after setup";
} else {
  startingBalanceInput.disabled = false;
}

  currentBalanceEl.textContent = formatMoney(game.currentBalance || 0);
  updateCharacterLevel();
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
  levelBarEl.style.width = Math.min(game.storedExcessXp, 100) + "%";
  levelTextEl.textContent = Math.round(game.storedExcessXp) + "% / 100% excess XP needed for next level";
  levelMessageEl.textContent = "Excess XP is created only when your balance gain pushes XP above 100%.";

  renderLog();
  saveGame();
    updateCharacterDesign();
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

updateCharacterLevel();

  game.log.push({
    date: date,
    oldBalance: oldBalance,
    newBalance: newBalance,
    moneyChange: moneyChange,
    xpChange: xpChange,
    excessGained: excessGained
  });

  if (moneyChange > 0) {
    gameMessageEl.textContent = "You gained " + xpChange.toFixed(1) + "% XP. Excess XP earned: " + excessGained.toFixed(1) + "%.";
  } else if (moneyChange < 0) {
    gameMessageEl.textContent = "You lost " + Math.abs(xpChange).toFixed(1) + "% XP. Your life bar took damage.";
  } else {
    gameMessageEl.textContent = "No balance change. XP stayed the same.";
  }


  balanceInput.value = "";
  updateDashboard();
});

resetBtn.addEventListener("click", function() {
  const confirmReset = confirm(
    "Are you sure you want to reset the game?\n" +
    "This cannot be undone.\n" +
    "All previous stats, XP, levels, logs, and achievements will be permanently lost."
  );


  if (confirmReset) {
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
  }
});

updateDashboard();

function updateCharacterDesign() {
  const characterImg = document.getElementById("characterImg");

  if (game.level >= 20) {
    characterImg.src = "assets/pic6.svg";
  } else if (game.level >= 15) {
    characterImg.src = "assets/pic5.svg";
  } else if (game.level >= 10) {
    characterImg.src = "assets/pic4.svg";
  } else if (game.level >= 5) {
    characterImg.src = "assets/pic3.svg";
  } else if (game.level >= 3) {
    characterImg.src = "assets/pic2.svg";
  } else {
    characterImg.src = "assets/pic1.svg";
  }
}

menuBtn.addEventListener("click", function() {
  setupMenu.classList.toggle("hidden");
});