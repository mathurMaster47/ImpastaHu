// Global State
let categoriesData = [];
let gameState = {
  playMode: 'SINGLE', // 'SINGLE' or 'MULTI'
  players: ['Rohan', 'Priya', 'Aarav', 'Ananya'],
  selectedCategory: '',
  impostorCount: 1,
  timerDuration: 180,
  secretWord: '',
  assignedRoles: [],
  currentPlayerIndex: 0,
  isRoleRevealed: false,
  timer: 180,
  timerInterval: null,
  votes: {},
  voterIndex: 0
};

// Default Fallback Categories if words.json isn't loaded
const DEFAULT_CATEGORIES = [
  {
    id: "tv_cartoons",
    name: "📺 TV & Cartoons",
    items: ["Taarak Mehta Ka Ooltah Chashmah", "CID", "Chhota Bheem", "Shinchan", "Doraemon", "Shaktimaan"]
  },
  {
    id: "food_drinks",
    name: "🍲 Indian Food",
    items: ["Pani Puri", "Samosa", "Vada Pav", "Pav Bhaji", "Biryani", "Gulab Jamun", "Masala Chai"]
  }
];

// Initialize App
document.addEventListener('DOMContentLoaded', async () => {
  await loadCategories();
  renderSetupScreen();
});

// Load words.json or fallback
async function loadCategories() {
  try {
    const response = await fetch('words.json');
    if (response.ok) {
      categoriesData = await response.json();
    } else {
      categoriesData = DEFAULT_CATEGORIES;
    }
  } catch (e) {
    categoriesData = DEFAULT_CATEGORIES;
  }
  gameState.selectedCategory = categoriesData[0]?.id || '';
}

// Global render function router
function renderApp(contentHtml) {
  const root = document.getElementById('app') || document.body;
  root.innerHTML = `
    <div style="max-width: 500px; margin: 0 auto; padding: 20px; font-family: system-ui, -apple-system, sans-serif; background-color: #f4f7f6; min-height: 100vh; box-sizing: border-box;">
      <header style="text-align: center; margin-bottom: 20px;">
        <h1 style="margin: 0; color: #2c3e50;">🕵️ Indian Impostor</h1>
      </header>
      ${contentHtml}
    </div>
  `;
}

/* ==========================================================================
   1. SETUP SCREEN
   ========================================================================== */
function renderSetupScreen() {
  const categoryOptions = categoriesData.map(cat => 
    `<option value="${cat.id}" ${cat.id === gameState.selectedCategory ? 'selected' : ''}>${cat.name}</option>`
  ).join('');

  const playerTags = gameState.players.map((p, idx) => `
    <span style="background: #e0e0e0; padding: 6px 12px; border-radius: 20px; font-size: 14px; display: inline-flex; align-items: center; gap: 6px; margin: 4px;">
      ${p}
      ${gameState.players.length > 3 ? `<button onclick="removePlayer(${idx})" style="background:none; border:none; cursor:pointer; font-weight:bold; color:#888;">×</button>` : ''}
    </span>
  `).join('');

  const html = `
    <div style="background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
      <h2 style="margin-top: 0;">Game Setup</h2>

      <div style="margin-bottom: 20px;">
        <label style="display: block; font-weight: bold; margin-bottom: 8px;">Play Mode:</label>
        <div style="display: flex; gap: 10px;">
          <button onclick="setPlayMode('SINGLE')" style="flex: 1; padding: 10px; border: 1px solid #ccc; border-radius: 6px; font-weight: bold; cursor: pointer; ${gameState.playMode === 'SINGLE' ? 'background: #2c3e50; color: #fff;' : 'background: #f8f9fa;'}">
            📱 Pass Phone
          </button>
          <button onclick="setPlayMode('MULTI')" style="flex: 1; padding: 10px; border: 1px solid #ccc; border-radius: 6px; font-weight: bold; cursor: pointer; ${gameState.playMode === 'MULTI' ? 'background: #2c3e50; color: #fff;' : 'background: #f8f9fa;'}">
            📲 Multi Phone
          </button>
        </div>
      </div>

      <div style="margin-bottom: 20px;">
        <label style="display: block; font-weight: bold; margin-bottom: 8px;">Players (${gameState.players.length}):</label>
        <div style="display: flex; gap: 8px;">
          <input type="text" id="playerInput" placeholder="Enter player name" style="flex: 1; padding: 10px; border-radius: 6px; border: 1px solid #ccc; font-size: 16px;">
          <button onclick="addPlayer()" style="padding: 10px 16px; background: #27ae60; color: #fff; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">Add</button>
        </div>
        <div style="margin-top: 10px;">${playerTags}</div>
      </div>

      <div style="margin-bottom: 20px;">
        <label style="display: block; font-weight: bold; margin-bottom: 8px;">Category:</label>
        <select onchange="gameState.selectedCategory = this.value" style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid #ccc; font-size: 16px;">
          ${categoryOptions}
        </select>
      </div>

      <div style="margin-bottom: 20px;">
        <label style="display: block; font-weight: bold; margin-bottom: 8px;">Impostors:</label>
        <select onchange="gameState.impostorCount = Number(this.value)" style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid #ccc; font-size: 16px;">
          <option value="1" ${gameState.impostorCount === 1 ? 'selected' : ''}>1 Impostor</option>
          ${gameState.players.length >= 6 ? `<option value="2" ${gameState.impostorCount === 2 ? 'selected' : ''}>2 Impostors</option>` : ''}
        </select>
      </div>

      <div style="margin-bottom: 20px;">
        <label style="display: block; font-weight: bold; margin-bottom: 8px;">Timer:</label>
        <select onchange="gameState.timerDuration = Number(this.value)" style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid #ccc; font-size: 16px;">
          <option value="120" ${gameState.timerDuration === 120 ? 'selected' : ''}>2 Minutes</option>
          <option value="180" ${gameState.timerDuration === 180 ? 'selected' : ''}>3 Minutes</option>
          <option value="300" ${gameState.timerDuration === 300 ? 'selected' : ''}>5 Minutes</option>
        </select>
      </div>

      <button onclick="startGame()" style="width: 100%; padding: 12px; background: #2980b9; color: #fff; border: none; border-radius: 6px; font-size: 18px; font-weight: bold; cursor: pointer;">
        Start Game 🚀
      </button>
    </div>
  `;

  renderApp(html);
}

/* ==========================================================================
   2. GAME LOGIC & TRANSITIONS
   ========================================================================== */
function setPlayMode(mode) {
  gameState.playMode = mode;
  renderSetupScreen();
}

function addPlayer() {
  const input = document.getElementById('playerInput');
  const name = input.value.trim();
  if (name && !gameState.players.includes(name)) {
    gameState.players.push(name);
    renderSetupScreen();
  }
}

function removePlayer(index) {
  if (gameState.players.length > 3) {
    gameState.players.splice(index, 1);
    renderSetupScreen();
  }
}

function startGame() {
  const cat = categoriesData.find(c => c.id === gameState.selectedCategory) || categoriesData[0];
  const items = cat.items || DEFAULT_CATEGORIES[0].items;
  gameState.secretWord = items[Math.floor(Math.random() * items.length)];

  let impostorIndices = new Set();
  while (impostorIndices.size < gameState.impostorCount) {
    impostorIndices.add(Math.floor(Math.random() * gameState.players.length));
  }

  gameState.assignedRoles = gameState.players.map((name, idx) => ({
    name,
    isImpostor: impostorIndices.has(idx),
    word: impostorIndices.has(idx) ? '???' : gameState.secretWord
  }));

  gameState.currentPlayerIndex = 0;
  gameState.isRoleRevealed = false;

  if (gameState.playMode === 'SINGLE') {
    renderPassPhoneScreen();
  } else {
    renderViewRoleScreen();
  }
}

/* ==========================================================================
   3. PASS PHONE SCREEN
   ========================================================================== */
function renderPassPhoneScreen() {
  const player = gameState.players[gameState.currentPlayerIndex];
  const html = `
    <div style="background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); text-align: center;">
      <h2>Pass the Phone 📱</h2>
      <p style="font-size: 18px; color: #7f8c8d;">Hand the phone over to:</p>
      <h1 style="font-size: 36px; color: #2c3e50; margin: 10px 0 20px 0;">${player}</h1>
      <p style="color: #95a5a6; font-size: 14px; margin-bottom: 20px;">Make sure no one else is looking at the screen!</p>
      <button onclick="renderViewRoleScreen()" style="width: 100%; padding: 12px; background: #2980b9; color: #fff; border: none; border-radius: 6px; font-size: 18px; font-weight: bold; cursor: pointer;">
        I am ${player} - Reveal Secret
      </button>
    </div>
  `;
  renderApp(html);
}

/* ==========================================================================
   4. VIEW ROLE SCREEN
   ========================================================================== */
function renderViewRoleScreen() {
  const current = gameState.assignedRoles[gameState.currentPlayerIndex];
  
  let roleContent = '';
  if (!gameState.isRoleRevealed) {
    roleContent = `
      <div style="padding: 40px 20px; background: #ecf0f1; border-radius: 8px; margin: 20px 0;">
        <p style="margin-bottom: 15px;">Tap below to see your secret word or role</p>
        <button onclick="revealRole()" style="padding: 10px 20px; background: #7f8c8d; color: #fff; border: none; border-radius: 6px; font-size: 16px; cursor: pointer;">
          👁️ Reveal Role
        </button>
      </div>
    `;
  } else {
    if (current.isImpostor) {
      roleContent = `
        <div style="padding: 30px 20px; background: #fdf2f2; border: 1px solid #f8d7da; border-radius: 8px; margin: 20px 0;">
          <h1 style="color: #d9534f; margin-top:0;">🚨 YOU ARE THE IMPOSTOR!</h1>
          <p>Blend in, pretend you know the secret word, and don't get caught!</p>
        </div>
      `;
    } else {
      roleContent = `
        <div style="padding: 30px 20px; background: #fcf8e3; border: 1px solid #faebcc; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #5cb85c; margin-top: 0;">You are a Citizen</h3>
          <p style="margin: 0;">Secret Word:</p>
          <h1 style="font-size: 32px; color: #2980b9; margin: 10px 0;">${current.word}</h1>
        </div>
      `;
    }
    
    const isLastPlayer = gameState.currentPlayerIndex + 1 >= gameState.players.length;
    roleContent += `
      <button onclick="nextRoleTurn()" style="width: 100%; padding: 12px; background: #2980b9; color: #fff; border: none; border-radius: 6px; font-size: 18px; font-weight: bold; cursor: pointer; margin-top: 10px;">
        ${isLastPlayer ? 'Start Discussion 🗣️' : 'Done & Pass Phone 📱'}
      </button>
    `;
  }

  const html = `
    <div style="background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); text-align: center;">
      <h2>Player: ${current.name}</h2>
      ${roleContent}
    </div>
  `;
  renderApp(html);
}

function revealRole() {
  gameState.isRoleRevealed = true;
  renderViewRoleScreen();
}

function nextRoleTurn() {
  gameState.isRoleRevealed = false;
  if (gameState.currentPlayerIndex + 1 < gameState.players.length) {
    gameState.currentPlayerIndex++;
    if (gameState.playMode === 'SINGLE') {
      renderPassPhoneScreen();
    } else {
      renderViewRoleScreen();
    }
  } else {
    startDiscussion();
  }
}

/* ==========================================================================
   5. DISCUSSION & TIMER SCREEN
   ========================================================================== */
function startDiscussion() {
  gameState.timer = gameState.timerDuration;
  renderDiscussionScreen();
  startTimer();
}

function startTimer() {
  clearInterval(gameState.timerInterval);
  gameState.timerInterval = setInterval(() => {
    gameState.timer--;
    const timerEl = document.getElementById('timerDisplay');
    if (timerEl) {
      const mins = Math.floor(gameState.timer / 60);
      const secs = gameState.timer % 60;
      timerEl.innerText = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    if (gameState.timer <= 0) {
      clearInterval(gameState.timerInterval);
    }
  }, 1000);
}

function renderDiscussionScreen() {
  const mins = Math.floor(gameState.timer / 60);
  const secs = gameState.timer % 60;
  const formattedTime = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

  const html = `
    <div style="background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); text-align: center;">
      <h2>🗣️ Discussion Phase</h2>
      <p style="color: #7f8c8d;">Ask questions, give subtle clues, and find the Impostor!</p>
      
      <div id="timerDisplay" style="font-size: 64px; font-weight: bold; color: #e74c3c; margin: 20px 0;">
        ${formattedTime}
      </div>

      <button onclick="goToVoting()" style="width: 100%; padding: 12px; background: #2980b9; color: #fff; border: none; border-radius: 6px; font-size: 18px; font-weight: bold; cursor: pointer;">
        Proceed to Vote 🗳️
      </button>
    </div>
  `;
  renderApp(html);
}

function goToVoting() {
  clearInterval(gameState.timerInterval);
  gameState.voterIndex = 0;
  gameState.votes = {};

  if (gameState.playMode === 'SINGLE') {
    renderPassPhoneVoteScreen();
  } else {
    renderVotingScreen();
  }
}

/* ==========================================================================
   6. VOTING SCREEN
   ========================================================================== */
function renderPassPhoneVoteScreen() {
  const voter = gameState.players[gameState.voterIndex];
  const html = `
    <div style="background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); text-align: center;">
      <h2>Voting Time 🗳️</h2>
      <p style="font-size: 18px; color: #7f8c8d;">Hand the phone over to:</p>
      <h1 style="font-size: 36px; color: #2c3e50; margin: 10px 0 20px 0;">${voter}</h1>
      <button onclick="renderVotingScreen()" style="width: 100%; padding: 12px; background: #2980b9; color: #fff; border: none; border-radius: 6px; font-size: 18px; font-weight: bold; cursor: pointer;">
        I am ${voter} - Cast Vote
      </button>
    </div>
  `;
  renderApp(html);
}

function renderVotingScreen() {
  const voter = gameState.players[gameState.voterIndex];
  
  const voteButtons = gameState.players.map(p => {
    const isSelf = p === voter;
    return `
      <button 
        onclick="castVote('${p}')" 
        ${isSelf ? 'disabled' : ''}
        style="width: 100%; padding: 14px; background: #34495e; color: #fff; border: none; border-radius: 6px; font-size: 16px; font-weight: bold; cursor: pointer; opacity: ${isSelf ? '0.5' : '1'}; margin-bottom: 10px;"
      >
        Vote ${p}
      </button>
    `;
  }).join('');

  const html = `
    <div style="background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
      <h2>${voter}, cast your vote:</h2>
      <p style="color: #7f8c8d; margin-bottom: 20px;">Who do you suspect is the Impostor?</p>
      <div>${voteButtons}</div>
    </div>
  `;
  renderApp(html);
}

function castVote(target) {
  gameState.votes[target] = (gameState.votes[target] || 0) + 1;

  if (gameState.voterIndex + 1 < gameState.players.length) {
    gameState.voterIndex++;
    if (gameState.playMode === 'SINGLE') {
      renderPassPhoneVoteScreen();
    } else {
      renderVotingScreen();
    }
  } else {
    calculateResults();
  }
}

/* ==========================================================================
   7. RESULTS SCREEN
   ========================================================================== */
function calculateResults() {
  let maxVotes = -1;
  let eliminatedPlayer = '';

  Object.entries(gameState.votes).forEach(([player, count]) => {
    if (count > maxVotes) {
      maxVotes = count;
      eliminatedPlayer = player;
    }
  });

  const eliminatedObj = gameState.assignedRoles.find(r => r.name === eliminatedPlayer);
  const citizensWon = eliminatedObj && eliminatedObj.isImpostor;
  const impostorsList = gameState.assignedRoles.filter(r => r.isImpostor).map(r => r.name).join(', ');

  const html = `
    <div style="background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); text-align: center;">
      <h2>🎉 Game Over!</h2>

      ${citizensWon ? `
        <div style="color: #27ae60;">
          <h1>Victory for Citizens!</h1>
          <p>You caught <strong>${eliminatedPlayer}</strong> who was indeed an Impostor!</p>
        </div>
      ` : `
        <div style="color: #c0392b;">
          <h1>Victory for Impostors!</h1>
          <p><strong>${eliminatedPlayer}</strong> was voted out, but they were innocent!</p>
        </div>
      `}

      <div style="background: #ecf0f1; padding: 16px; border-radius: 8px; margin: 20px 0; text-align: left;">
        <p style="margin: 5px 0;"><strong>Secret Word:</strong> ${gameState.secretWord}</p>
        <p style="margin: 5px 0;"><strong>Impostors were:</strong> ${impostorsList}</p>
      </div>

      <button onclick="renderSetupScreen()" style="width: 100%; padding: 12px; background: #2980b9; color: #fff; border: none; border-radius: 6px; font-size: 18px; font-weight: bold; cursor: pointer;">
        Play Again 🔄
      </button>
    </div>
  `;
  renderApp(html);
}
