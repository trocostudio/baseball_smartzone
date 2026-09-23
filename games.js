// ==========================================
// HELPER Y PROTECCIÓN DE DATOS
// ==========================================

function escapeHTML(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .trim()
    .slice(0, 10) // Corta a un máximo estricto de 10 caracteres
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

let temporizadorBorroso = null;

function activarDesenfoqueTemporal() {
  requestAnimationFrame(() => {
    document.body.classList.add('screen-blur-active');
  });

  limpiarPortapapeles();

  if (temporizadorBorroso) {
    clearTimeout(temporizadorBorroso);
  }

  temporizadorBorroso = setTimeout(() => {
    document.body.classList.remove('screen-blur-active');
  }, 3000);
}

document.addEventListener('contextmenu', function (e) {
  e.preventDefault();
});

document.addEventListener('keydown', function (e) {
  const isPrintScreen = (e.key === 'PrintScreen' || e.keyCode === 44);
  const isCmdOrCtrl = e.ctrlKey || e.metaKey;
  const isShift = e.shiftKey;
  
  const isSnippetShortcut = isCmdOrCtrl && isShift && (e.key === 'S' || e.key === 's' || e.key === '3' || e.key === '4' || e.key === '5');
  const isPrintShortcut = isCmdOrCtrl && (e.key === 'p' || e.key === 'P');

  if (isPrintScreen || isSnippetShortcut || isPrintShortcut) {
    e.preventDefault();
    activarDesenfoqueTemporal();
  }

  if (e.key === 'F12' || (isCmdOrCtrl && isShift && (e.key === 'I' || e.key === 'i'))) {
    e.preventDefault();
  }
}, true);

function limpiarPortapapeles() {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText('').catch(() => {});
  }
}

const SUPABASE_URL = "https://jlcwoukhukrtjbbizwxs.supabase.co"; 
const SUPABASE_ANON_KEY = "sb_publishable_oI5J-Q2_dT8NmmAmMxkobQ_fmTNKzLh"; 
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let gamesData = [];
let nivelActual = "A1";
let juegoActivoActual = null;

window.onload = async function() {
  await cambiarNivel("A1");
};

async function cambiarNivel(nuevoNivel) {
  nivelActual = nuevoNivel;
  document.getElementById('levelSelect').value = nuevoNivel;
  document.getElementById('lblNivelActivo').textContent = `LEVEL ${escapeHTML(nuevoNivel)}`;
  await fetchGamesData();
}

async function fetchGamesData() {
  const statusEl = document.getElementById('dbStatus');
  statusEl.textContent = `Loading ${escapeHTML(nivelActual)}...`;
  statusEl.className = "px-3 py-1.5 bg-slate-200/80 backdrop-blur-md text-slate-700 text-xs rounded-full font-bold font-heading";

  try {
    const { data, error } = await supabaseClient
      .from('games')
      .select('NIVEL, WORDS, CLUE, PICTURE')
      .eq('NIVEL', nivelActual);

    if (error) throw error;

    if (data && data.length > 0) {
      gamesData = data.map(item => ({
        WORDS: item.WORDS ? item.WORDS.trim() : "",
        CLUE: item.CLUE ? item.CLUE.trim() : "No clue provided",
        PICTURE: item.PICTURE ? item.PICTURE.trim() : ""
      })).filter(i => i.WORDS !== '');

      if (gamesData.length > 0) {
        statusEl.textContent = `🟢 ${gamesData.length} words ready for ${escapeHTML(nivelActual)}`;
        statusEl.className = "px-3 py-1.5 bg-emerald-100/90 backdrop-blur-md text-emerald-800 text-xs rounded-full font-bold font-heading";
      } else {
        statusEl.textContent = `⚠️ No valid words for ${escapeHTML(nivelActual)}`;
        statusEl.className = "px-3 py-1.5 bg-amber-100/90 backdrop-blur-md text-amber-800 text-xs rounded-full font-bold font-heading";
      }
    } else {
      gamesData = [];
      statusEl.textContent = `⚠️ No records found for level ${escapeHTML(nivelActual)}`;
      statusEl.className = "px-3 py-1.5 bg-amber-100/90 backdrop-blur-md text-amber-800 text-xs rounded-full font-bold font-heading";
    }
  } catch (err) {
    console.error("Error loading Supabase:", err);
    statusEl.textContent = "❌ Connection / RLS Error";
    statusEl.className = "px-3 py-1.5 bg-rose-100/90 backdrop-blur-md text-rose-800 text-xs rounded-full font-bold font-heading";
  }
}

function openGame(gameId) {
  if (gameId !== 'impostor' && gameId !== 'kahootquiz' && gamesData.length === 0) {
    alert(`No records available for Level ${nivelActual} in the database.`);
    return;
  }
  juegoActivoActual = gameId;
  document.getElementById('gamesMenu').classList.add('hidden');
  document.getElementById('gameContainer').classList.remove('hidden');

  const views = ['hangmanView', 'memoryView', 'wordsearchView', 'tictactoeView', 'tugofwarView', 'guesswordView', 'penaltyshootView', 'spacedefenderView', 'impostorView', 'kahootquizView'];
  views.forEach(v => {
    const el = document.getElementById(v);
    if (el) el.classList.add('hidden');
  });

  if (gameId === 'hangman') {
    document.getElementById('gameTitle').textContent = 'Word Hangman 🔤';
    document.getElementById('hangmanView').classList.remove('hidden');
    initHangman();
  } else if (gameId === 'memory') {
    document.getElementById('gameTitle').textContent = 'Memory Match 🧠';
    document.getElementById('memoryView').classList.remove('hidden');
    initMemory();
  } else if (gameId === 'wordsearch') {
    document.getElementById('gameTitle').textContent = 'Word Search 🔍';
    document.getElementById('wordsearchView').classList.remove('hidden');
    initWordSearch();
  } else if (gameId === 'tictactoe') {
    document.getElementById('gameTitle').textContent = 'Quiz Tic-Tac-Toe ❌⭕';
    document.getElementById('tictactoeView').classList.remove('hidden');
    initTicTacToe();
  } else if (gameId === 'tugofwar') {
    document.getElementById('gameTitle').textContent = 'Tug of War 🪢';
    document.getElementById('tugofwarView').classList.remove('hidden');
    initTugOfWar();
  } else if (gameId === 'guessword') {
    document.getElementById('gameTitle').textContent = 'Guess the Word ⏱️';
    document.getElementById('guesswordView').classList.remove('hidden');
    resetGuessUI();
  } else if (gameId === 'penaltyshoot') {
    document.getElementById('gameTitle').textContent = 'Penalty Shootout ⚽';
    document.getElementById('penaltyshootView').classList.remove('hidden');
    initPenaltyShootout();
  } else if (gameId === 'spacedefender') {
    document.getElementById('gameTitle').textContent = 'Space Defender 🚀';
    document.getElementById('spacedefenderView').classList.remove('hidden');
    initSpaceDefender();
  } else if (gameId === 'impostor') {
    document.getElementById('gameTitle').textContent = 'Classroom Impostor ඞ';
    document.getElementById('impostorView').classList.remove('hidden');
    initImpostorGame();
  } else if (gameId === 'kahootquiz') {
    document.getElementById('gameTitle').textContent = 'Live Quiz Clash ⚡';
    document.getElementById('kahootquizView').classList.remove('hidden');
    resetKahootUI();
  }
}

function backToMenu() {
  if (document.fullscreenElement) {
    toggleFullscreen();
  }
  document.getElementById('gameContainer').classList.add('hidden');
  document.getElementById('gamesMenu').classList.remove('hidden');
  if (guessInterval) clearInterval(guessInterval);
  if (tugInterval) clearInterval(tugInterval);
  if (penaltyInterval) clearInterval(penaltyInterval);
  if (sdAsteroidTimer) clearInterval(sdAsteroidTimer);
  if (sdClockTimer) clearInterval(sdClockTimer);
  if (kqTimerInterval) clearInterval(kqTimerInterval);
}

/* FULLSCREEN API LOGIC */
function toggleFullscreen() {
  const targetElement = document.getElementById('gameContainer');

  if (!document.fullscreenElement && !document.webkitFullscreenElement) {
    if (targetElement.requestFullscreen) {
      targetElement.requestFullscreen();
    } else if (targetElement.webkitRequestFullscreen) {
      targetElement.webkitRequestFullscreen();
    } else if (targetElement.msRequestFullscreen) {
      targetElement.msRequestFullscreen();
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  }
}

document.addEventListener('fullscreenchange', updateFullscreenBtn);
document.addEventListener('webkitfullscreenchange', updateFullscreenBtn);

function updateFullscreenBtn() {
  const fsText = document.getElementById('fsText');
  const fsIcon = document.getElementById('fsIcon');
  if (!fsText || !fsIcon) return;

  if (document.fullscreenElement || document.webkitFullscreenElement) {
    fsText.textContent = "EXIT FULL";
    fsIcon.textContent = "🗗";
  } else {
    fsText.textContent = "FULLSCREEN";
    fsIcon.textContent = "⛶";
  }
}

/* RESULTS MODAL FUNCTION */
function mostrarModalResultadosJuego(titulo, scoreText, detailText) {
  document.getElementById('gameModalTitle').textContent = titulo;
  document.getElementById('gameScoreModalText').textContent = scoreText;
  document.getElementById('gameModalDetail').textContent = detailText;
  document.getElementById('gameResultsModal').classList.remove('hidden');
}

function cerrarModalResultadosJuego() {
  document.getElementById('gameResultsModal').classList.add('hidden');
  if (juegoActivoActual === 'hangman') initHangman();
  else if (juegoActivoActual === 'memory') initMemory();
  else if (juegoActivoActual === 'wordsearch') initWordSearch();
  else if (juegoActivoActual === 'tictactoe') initTicTacToe();
  else if (juegoActivoActual === 'tugofwar') initTugOfWar();
  else if (juegoActivoActual === 'guessword') resetGuessUI();
  else if (juegoActivoActual === 'penaltyshoot') initPenaltyShootout();
  else if (juegoActivoActual === 'spacedefender') initSpaceDefender();
  else if (juegoActivoActual === 'kahootquiz') resetKahootUI();
}

/* 1. HANGMAN LOGIC */
let currentHangman, guessedLetters, hangmanLives;

function initHangman() {
  const item = gamesData[Math.floor(Math.random() * gamesData.length)];
  currentHangman = {
    word: item.WORDS.toUpperCase(),
    hint: item.CLUE
  };
  guessedLetters = [];
  hangmanLives = 6;
  document.getElementById('hangmanHint').textContent = currentHangman.hint;
  document.getElementById('hangmanLives').textContent = hangmanLives;
  renderHangmanWord();
  renderHangmanKeyboard();
}

function renderHangmanWord() {
  const container = document.getElementById('hangmanWord');
  container.innerHTML = '';
  currentHangman.word.split('').forEach(letter => {
    const box = document.createElement('div');
    if (letter === ' ') {
      box.className = "w-6 h-12 flex items-center justify-center";
    } else {
      box.className = "w-10 h-12 border-b-4 border-slate-900 text-2xl font-bold flex items-center justify-center text-slate-900 uppercase font-heading";
      box.textContent = guessedLetters.includes(letter) ? letter : '';
    }
    container.appendChild(box);
  });
}

function renderHangmanKeyboard() {
  const kb = document.getElementById('hangmanKeyboard');
  kb.innerHTML = '';
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('').forEach(letter => {
    const btn = document.createElement('button');
    btn.textContent = letter;
    btn.className = "w-9 h-10 bg-slate-100 hover:bg-sky-500 hover:text-white rounded-lg font-bold text-xs transition cursor-pointer disabled:opacity-30 disabled:pointer-events-none font-heading";
    btn.disabled = guessedLetters.includes(letter);
    btn.onclick = () => pressHangmanLetter(letter, btn);
    kb.appendChild(btn);
  });
}

function pressHangmanLetter(letter, btn) {
  guessedLetters.push(letter);
  btn.disabled = true;
  if (currentHangman.word.includes(letter)) {
    renderHangmanWord();
    const isWon = currentHangman.word.split('').every(l => l === ' ' || guessedLetters.includes(l));
    if (isWon) {
      setTimeout(() => mostrarModalResultadosJuego('Word Guessed! 🎉', currentHangman.word, `Awesome job! You guessed the word in Level ${nivelActual}.`), 200);
    }
  } else {
    hangmanLives--;
    document.getElementById('hangmanLives').textContent = hangmanLives;
    if (hangmanLives === 0) {
      setTimeout(() => mostrarModalResultadosJuego('Game Over! ❌', currentHangman.word, 'You ran out of lives. Keep practicing!'), 200);
    }
  }
}

/* 2. MEMORY MATCH LOGIC */
let memoryFlipped = [], memoryMoves = 0, memoryMatches = 0, totalPairs = 0;

function initMemory() {
  memoryMoves = 0; memoryMatches = 0; memoryFlipped = [];
  document.getElementById('memoryMoves').textContent = memoryMoves;

  const countToSelect = Math.min(4, gamesData.length);
  const selected = [...gamesData].sort(() => 0.5 - Math.random()).slice(0, countToSelect);

  totalPairs = selected.length;
  document.getElementById('memoryMatches').textContent = `0 / ${totalPairs}`;

  let cards = [];
  selected.forEach((item, idx) => {
    cards.push({ type: 'word', content: item.WORDS, matchId: idx });
    cards.push({ type: 'img', content: item.PICTURE, fallbackText: item.CLUE, matchId: idx });
  });

  cards.sort(() => 0.5 - Math.random());
  const board = document.getElementById('memoryBoard');
  board.innerHTML = '';

  cards.forEach(cardData => {
    const card = document.createElement('div');
    card.className = "h-28 perspective-1000 cursor-pointer";

    let innerContent = '';
    if (cardData.type === 'word') {
      innerContent = `<span class="font-bold text-slate-900 text-sm font-heading">${escapeHTML(cardData.content)}</span>`;
    } else {
      if (cardData.content && cardData.content.startsWith('http')) {
        innerContent = `<img src="${escapeHTML(cardData.content)}" class="w-full h-full object-cover rounded-xl" alt="Card Picture" onerror="this.outerHTML='<span class=\\'font-medium text-slate-600 text-xs p-1\\'>${escapeHTML(cardData.fallbackText)}</span>'">`;
      } else {
        innerContent = `<span class="font-medium text-slate-600 text-xs p-1">${escapeHTML(cardData.fallbackText)}</span>`;
      }
    }

    card.innerHTML = `
      <div class="card-inner w-full h-full relative transform-style-3d transition-transform duration-500 rounded-2xl shadow-md bg-slate-900 border border-slate-700 flex items-center justify-center">
        <div class="absolute inset-0 backface-hidden flex items-center justify-center font-bold text-white text-xl">❓</div>
        <div class="absolute inset-0 backface-hidden rotate-y-180 bg-white border-2 border-emerald-400 rounded-2xl flex items-center justify-center p-2 text-center overflow-hidden">
          ${innerContent}
        </div>
      </div>
    `;
    card.onclick = () => flipMemoryCard(card, cardData);
    board.appendChild(card);
  });
}

function flipMemoryCard(cardEl, cardData) {
  const inner = cardEl.querySelector('.card-inner');
  if (inner.classList.contains('rotate-y-180') || memoryFlipped.length >= 2) return;

  inner.classList.add('rotate-y-180');
  memoryFlipped.push({ cardEl, cardData });

  if (memoryFlipped.length === 2) {
    memoryMoves++;
    document.getElementById('memoryMoves').textContent = memoryMoves;
    const [c1, c2] = memoryFlipped;
    if (c1.cardData.matchId === c2.cardData.matchId) {
      memoryMatches++;
      document.getElementById('memoryMatches').textContent = `${memoryMatches} / ${totalPairs}`;
      memoryFlipped = [];
      if (memoryMatches === totalPairs) {
        setTimeout(() => mostrarModalResultadosJuego('Memory Completed! 🏆', `${memoryMoves} Moves`, `You matched all cards in Level ${nivelActual}.`), 300);
      }
    } else {
      setTimeout(() => {
        c1.cardEl.querySelector('.card-inner').classList.remove('rotate-y-180');
        c2.cardEl.querySelector('.card-inner').classList.remove('rotate-y-180');
        memoryFlipped = [];
      }, 1000);
    }
  }
}

/* 3. WORD SEARCH LOGIC */
let wsWords = [], wsFoundCount = 0, wsGridSize = 10, wsSelectedCells = [];

function initWordSearch() {
  wsFoundCount = 0;
  wsSelectedCells = [];
  const valid = gamesData.filter(i => i.WORDS.length >= 3 && i.WORDS.length <= 8 && !i.WORDS.includes(" "));
  const selected = [...valid].sort(() => 0.5 - Math.random()).slice(0, 5);
  wsWords = selected.map(i => i.WORDS.toUpperCase());

  const listEl = document.getElementById('wsTargetList');
  listEl.innerHTML = '';
  wsWords.forEach(w => {
    const li = document.createElement('li');
    li.id = `ws-word-${escapeHTML(w)}`;
    li.className = "flex items-center gap-2 text-slate-700 font-bold text-sm transition font-heading";
    li.innerHTML = `<span>⏳</span> <span>${escapeHTML(w)}</span>`;
    listEl.appendChild(li);
  });

  let grid = Array(wsGridSize).fill(null).map(() => Array(wsGridSize).fill(''));

  wsWords.forEach(word => {
    let placed = false;
    let attempts = 0;
    while (!placed && attempts < 100) {
      attempts++;
      let dir = Math.random() < 0.5 ? 'H' : 'V';
      let r = Math.floor(Math.random() * (dir === 'H' ? wsGridSize : wsGridSize - word.length));
      let c = Math.floor(Math.random() * (dir === 'V' ? wsGridSize : wsGridSize - word.length));

      let canPlace = true;
      for (let i = 0; i < word.length; i++) {
        let nr = dir === 'V' ? r + i : r;
        let nc = dir === 'H' ? c + i : c;
        if (grid[nr][nc] !== '' && grid[nr][nc] !== word[i]) {
          canPlace = false;
          break;
        }
      }

      if (canPlace) {
        for (let i = 0; i < word.length; i++) {
          let nr = dir === 'V' ? r + i : r;
          let nc = dir === 'H' ? c + i : c;
          grid[nr][nc] = word[i];
        }
        placed = true;
      }
    }
  });

  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const gridContainer = document.getElementById('wsGrid');
  gridContainer.innerHTML = '';

  for (let r = 0; r < wsGridSize; r++) {
    for (let c = 0; c < wsGridSize; c++) {
      if (grid[r][c] === '') grid[r][c] = letters[Math.floor(Math.random() * letters.length)];
      const cell = document.createElement('button');
      cell.textContent = grid[r][c];
      cell.dataset.row = r;
      cell.dataset.col = c;
      cell.className = "w-7 h-7 sm:w-9 sm:h-9 bg-white border border-slate-200 rounded-lg font-bold text-xs sm:text-sm text-slate-800 flex items-center justify-center cursor-pointer transition-all select-none hover:bg-sky-100 font-heading";
      cell.onclick = () => selectWSLetter(cell, grid[r][c]);
      gridContainer.appendChild(cell);
    }
  }
}

function selectWSLetter(cell, char) {
  if (cell.classList.contains('bg-emerald-500')) return;

  const isSelected = wsSelectedCells.some(c => c.cell === cell);

  if (isSelected) {
    cell.className = "w-7 h-7 sm:w-9 sm:h-9 bg-white border border-slate-200 rounded-lg font-bold text-xs sm:text-sm text-slate-800 flex items-center justify-center cursor-pointer transition-all select-none hover:bg-sky-100 font-heading";
    wsSelectedCells = wsSelectedCells.filter(c => c.cell !== cell);
  } else {
    cell.className = "w-7 h-7 sm:w-9 sm:h-9 bg-sky-500 border border-sky-600 rounded-lg font-bold text-xs sm:text-sm text-white flex items-center justify-center cursor-pointer transition-all select-none shadow-md transform scale-105 font-heading";
    wsSelectedCells.push({ cell, char });
  }

  const currentStr = wsSelectedCells.map(c => c.char).join('');
  const reverseStr = currentStr.split('').reverse().join('');

  wsWords.forEach(w => {
    if (currentStr === w || reverseStr === w) {
      wsSelectedCells.forEach(item => {
        item.cell.className = "w-7 h-7 sm:w-9 sm:h-9 bg-emerald-500 border border-emerald-600 rounded-lg font-bold text-xs sm:text-sm text-white flex items-center justify-center pointer-events-none transition-all shadow-sm font-heading";
      });

      const targetLi = document.getElementById(`ws-word-${w}`);
      if (targetLi) {
        targetLi.className = "flex items-center gap-2 text-emerald-600 font-bold text-sm line-through font-heading";
        targetLi.querySelector('span').textContent = '✓';
      }

      wsSelectedCells = [];
      wsFoundCount++;

      if (wsFoundCount === wsWords.length) {
        setTimeout(() => mostrarModalResultadosJuego('Puzzle Completed! 🔍', `${wsWords.length} Words`, `Sharp eyes! You found all words in Level ${nivelActual}.`), 300);
      }
    }
  });
}

/* 4. TIC-TAC-TOE LOGIC */
let tttBoardState = Array(9).fill(null), tttCurrentTurn = 'X', tttSelectedCellIndex = null;

function initTicTacToe() {
  tttBoardState = Array(9).fill(null);
  tttCurrentTurn = 'X';
  tttSelectedCellIndex = null;
  document.getElementById('tttStatus').textContent = "Turn: ❌ Player 1";
  document.getElementById('tttQuestionBox').classList.add('hidden');

  const board = document.getElementById('tttBoard');
  board.innerHTML = '';
  for (let i = 0; i < 9; i++) {
    const btn = document.createElement('button');
    btn.className = "h-20 sm:h-24 bg-slate-100 border-2 border-slate-300 rounded-2xl font-bold text-3xl sm:text-4xl text-slate-700 hover:bg-slate-200 transition cursor-pointer flex items-center justify-center font-heading";
    btn.onclick = () => clickTTTCell(i);
    board.appendChild(btn);
  }
}

function clickTTTCell(index) {
  if (tttBoardState[index] !== null) return;
  tttSelectedCellIndex = index;

  const qItem = gamesData[Math.floor(Math.random() * gamesData.length)];
  document.getElementById('tttQuestionText').textContent = `"${qItem.CLUE}"`;

  let options = [qItem.WORDS];
  while (options.length < 4 && options.length < gamesData.length) {
    let randWord = gamesData[Math.floor(Math.random() * gamesData.length)].WORDS;
    if (!options.includes(randWord)) options.push(randWord);
  }
  options.sort(() => 0.5 - Math.random());

  const optContainer = document.getElementById('tttOptions');
  optContainer.innerHTML = '';
  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.textContent = opt;
    btn.className = "py-2.5 bg-white border border-indigo-200 hover:bg-indigo-100 rounded-xl font-bold text-xs text-indigo-900 transition cursor-pointer font-heading";
    btn.onclick = () => answerTTTQuestion(opt === qItem.WORDS);
    optContainer.appendChild(btn);
  });

  document.getElementById('tttQuestionBox').classList.remove('hidden');
}

function answerTTTQuestion(isCorrect) {
  document.getElementById('tttQuestionBox').classList.add('hidden');
  const boardButtons = document.getElementById('tttBoard').children;

  if (isCorrect) {
    tttBoardState[tttSelectedCellIndex] = tttCurrentTurn;
    boardButtons[tttSelectedCellIndex].textContent = tttCurrentTurn === 'X' ? '❌' : '⭕';
    boardButtons[tttSelectedCellIndex].classList.add(tttCurrentTurn === 'X' ? 'text-indigo-600' : 'text-rose-500');

    if (checkTTTWinner(tttCurrentTurn)) {
      setTimeout(() => mostrarModalResultadosJuego(`Winner: ${tttCurrentTurn === 'X' ? '❌ Player 1' : '⭕ Player 2'}! 🏆`, 'Tic-Tac-Toe Master', 'Awesome strategy and vocabulary skills!'), 200);
      return;
    }

    if (tttBoardState.every(c => c !== null)) {
      setTimeout(() => mostrarModalResultadosJuego('Draw Game! 🤝', 'Board Full', 'Great battle between both players!'), 200);
      return;
    }

    tttCurrentTurn = tttCurrentTurn === 'X' ? 'O' : 'X';
    document.getElementById('tttStatus').textContent = `Turn: ${tttCurrentTurn === 'X' ? '❌ Player 1' : '⭕ Player 2'}`;
  } else {
    alert("❌ Wrong answer! You lose your turn.");
    tttCurrentTurn = tttCurrentTurn === 'X' ? 'O' : 'X';
    document.getElementById('tttStatus').textContent = `Turn: ${tttCurrentTurn === 'X' ? '❌ Player 1' : '⭕ Player 2'}`;
  }
}

function checkTTTWinner(p) {
  const wins = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6]
  ];
  return wins.some(w => w.every(i => tttBoardState[i] === p));
}

/* 5. TUG OF WAR LOGIC */
let blueScore = 0, redScore = 0, tugTimer = 300, tugInterval = null;

function initTugOfWar() {
  blueScore = 0; 
  redScore = 0;
  tugTimer = 300; 
  
  if (tugInterval) clearInterval(tugInterval);

  updateTugUI();
  loadTugQuestion('blue');
  loadTugQuestion('red');

  tugInterval = setInterval(() => {
    tugTimer--;
    const mins = Math.floor(tugTimer / 60);
    const secs = tugTimer % 60;
    document.getElementById('tugTimer').textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    if (tugTimer <= 0) {
      clearInterval(tugInterval);
      finalizarTugPorTiempo();
    }
  }, 1000);
}

function updateTugUI() {
  document.getElementById('blueScore').textContent = blueScore;
  document.getElementById('redScore').textContent = redScore;
  const diff = blueScore - redScore;
  document.getElementById('tugDiff').textContent = Math.abs(diff);

  const rope = document.getElementById('tugRopeIndicator');
  const shiftPercent = Math.max(-25, Math.min(25, diff * -5));
  rope.style.transform = `translateX(${shiftPercent}%)`;

  if (diff >= 5) {
    if (tugInterval) clearInterval(tugInterval);
    setTimeout(() => mostrarModalResultadosJuego('Blue Team Wins! 🔵', `${blueScore} - ${redScore}`, 'Exceptional speed and English accuracy! Max gap reached.'), 200);
  } else if (diff <= -5) {
    if (tugInterval) clearInterval(tugInterval);
    setTimeout(() => mostrarModalResultadosJuego('Red Team Wins! 🔴', `${redScore} - ${blueScore}`, 'Exceptional speed and English accuracy! Max gap reached.'), 200);
  }
}

function finalizarTugPorTiempo() {
  if (blueScore > redScore) {
    mostrarModalResultadosJuego('Time Up: Blue Team Wins! 🔵', `${blueScore} - ${redScore}`, 'Time is up! Blue Team had the highest score.');
  } else if (redScore > blueScore) {
    mostrarModalResultadosJuego('Time Up: Red Team Wins! 🔴', `${redScore} - ${blueScore}`, 'Time is up! Red Team had the highest score.');
  } else {
    mostrarModalResultadosJuego('Time Up: It\'s a Draw! 🤝', `${blueScore} - ${redScore}`, 'Time is up! Both teams finished with equal points.');
  }
}

function loadTugQuestion(team) {
  const correctItem = gamesData[Math.floor(Math.random() * gamesData.length)];
  const qEl = document.getElementById(team + 'Question');
  const optEl = document.getElementById(team + 'Options');

  qEl.innerHTML = `<p class="text-xs sm:text-sm font-bold text-slate-800">"${escapeHTML(correctItem.CLUE)}"</p>`;

  let options = [correctItem.WORDS];
  while (options.length < 4 && options.length < gamesData.length) {
    let randWord = gamesData[Math.floor(Math.random() * gamesData.length)].WORDS;
    if (!options.includes(randWord)) options.push(randWord);
  }
  options.sort(() => 0.5 - Math.random());

  optEl.innerHTML = '';
  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.textContent = opt;
    btn.className = "py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl font-bold text-xs text-slate-700 transition cursor-pointer truncate px-1 font-heading";
    btn.onclick = () => {
      if (opt === correctItem.WORDS) {
        if (team === 'blue') blueScore++; else redScore++;
      }
      updateTugUI();
      if (tugTimer > 0 && Math.abs(blueScore - redScore) < 5) {
        loadTugQuestion(team);
      }
    };
    optEl.appendChild(btn);
  });
}

/* 6. GUESS THE WORD LOGIC */
let guessIndex = 0, guessScore = 0, guessTimer = 60, guessInterval = null;

function resetGuessUI() {
  if (guessInterval) clearInterval(guessInterval);
  document.getElementById('guessTargetWord').textContent = "READY?";
  document.getElementById('guessCategory').textContent = "Click Start when ready";
  document.getElementById('guessTimer').textContent = "60";
  document.getElementById('guessScore').textContent = "0";
  document.getElementById('btnStartGuess').classList.remove('hidden');
  document.getElementById('btnPassGuess').classList.add('hidden');
  document.getElementById('btnCorrectGuess').classList.add('hidden');
}

function startGuessGame() {
  if (!gamesData || gamesData.length === 0) {
    alert("No vocabulary available for this level.");
    return;
  }

  guessScore = 0; 
  guessTimer = 60; 
  guessIndex = 0;

  gamesData.sort(() => 0.5 - Math.random());

  document.getElementById('guessScore').textContent = guessScore;
  document.getElementById('btnStartGuess').classList.add('hidden');
  document.getElementById('btnPassGuess').classList.remove('hidden');
  document.getElementById('btnCorrectGuess').classList.remove('hidden');

  displayGuessWord();

  if (guessInterval) clearInterval(guessInterval);
  guessInterval = setInterval(() => {
    guessTimer--;
    document.getElementById('guessTimer').textContent = guessTimer;
    if (guessTimer <= 0) {
      clearInterval(guessInterval);
      mostrarModalResultadosJuego('Time is Up! ⏱️', `${guessScore} Words`, 'Great teamwork describing English vocabulary!');
    }
  }, 1000);
}

function displayGuessWord() {
  if (!gamesData || gamesData.length === 0) return;

  const current = gamesData[guessIndex % gamesData.length];
  const targetWord = (current.WORDS || current.words || "").toString().trim().toUpperCase();
  const targetClue = (current.CLUE || current.clue || "No hint available").toString().trim();

  document.getElementById('guessTargetWord').textContent = targetWord || "WORD";
  document.getElementById('guessCategory').textContent = `Hint: ${targetClue}`;
}

function nextGuessWord(isCorrect) {
  if (isCorrect) {
    guessScore++;
    document.getElementById('guessScore').textContent = guessScore;
  }
  guessIndex++;
  displayGuessWord();
}

/* 7. PENALTY SHOOTOUT LOGIC */
let penaltyBlueScore = 0, penaltyRedScore = 0;
let penaltyCurrentRound = 1, penaltyMaxRounds = 5;
let penaltyPhase = 'ATTACK'; 
let penaltyAttackingTeam = 'blue'; 
let penaltyTimer = 20, penaltyInterval = null;
let currentPenaltyItem = null;

function initPenaltyShootout() {
  penaltyBlueScore = 0;
  penaltyRedScore = 0;
  penaltyCurrentRound = 1;
  penaltyAttackingTeam = 'blue';
  penaltyPhase = 'ATTACK';
  updatePenaltyUI();
  startPenaltyTurn();
}

function updatePenaltyUI() {
  document.getElementById('penaltyBlueScore').textContent = penaltyBlueScore;
  document.getElementById('penaltyRedScore').textContent = penaltyRedScore;
  document.getElementById('penaltyRound').textContent = `${penaltyCurrentRound} / ${penaltyMaxRounds}`;
  
  const ball = document.getElementById('penaltyBallImg');
  const keeper = document.getElementById('penaltyKeeperImg');
  const feedback = document.getElementById('penaltyFeedback');
  
  ball.style.transform = 'translate(0, 0) scale(1)';
  keeper.style.transform = 'translate(0, 0)';
  
  if (feedback) {
    feedback.classList.add('opacity-0', 'scale-50');
    feedback.classList.remove('opacity-100', 'scale-100');
  }
}

function showPenaltyFeedback(type, customText = '') {
  const fbContainer = document.getElementById('penaltyFeedback');
  const fbText = document.getElementById('penaltyFeedbackText');
  if (!fbContainer || !fbText) return;

  if (type === 'GOAL') {
    fbText.textContent = '⚽ GOAL!';
    fbText.className = 'text-5xl sm:text-7xl font-bold text-emerald-400 drop-shadow-[0_10px_25px_rgba(52,211,153,0.8)] tracking-tight font-heading';
  } else if (type === 'MISSED') {
    fbText.textContent = '❌ MISSED!';
    fbText.className = 'text-5xl sm:text-7xl font-bold text-rose-500 drop-shadow-[0_10px_25px_rgba(244,63,94,0.8)] tracking-tight font-heading';
  } else if (type === 'BLOCKED') {
    fbText.textContent = '🧤 BLOCKED!';
    fbText.className = 'text-5xl sm:text-7xl font-bold text-amber-400 drop-shadow-[0_10px_25px_rgba(251,191,36,0.8)] tracking-tight font-heading';
  } else if (type === 'INFO') {
    fbText.textContent = customText;
    fbText.className = 'text-2xl sm:text-4xl font-bold text-sky-300 drop-shadow-[0_10px_20px_rgba(0,0,0,0.9)] tracking-wider text-center px-4 font-heading';
  }

  fbContainer.classList.remove('opacity-0', 'scale-50');
  fbContainer.classList.add('opacity-100', 'scale-100');
}

function startPenaltyTurn() {
  if (penaltyInterval) clearInterval(penaltyInterval);
  penaltyTimer = 20;
  
  const timerEl = document.getElementById('penaltyTimer');
  if (timerEl) timerEl.textContent = penaltyTimer;

  currentPenaltyItem = gamesData[Math.floor(Math.random() * gamesData.length)];
  document.getElementById('penaltyClue').textContent = `"${currentPenaltyItem.CLUE}"`;

  const badge = document.getElementById('penaltyTurnBadge');
  if (penaltyPhase === 'ATTACK') {
    const teamName = penaltyAttackingTeam === 'blue' ? '🔵 Blue Team' : '🔴 Red Team';
    badge.textContent = `${teamName} — ⚽ SHOOTING (20s)`;
    badge.className = penaltyAttackingTeam === 'blue' 
      ? "inline-block px-4 py-1 bg-sky-500 text-slate-950 font-bold text-xs uppercase rounded-full tracking-wider font-heading"
      : "inline-block px-4 py-1 bg-rose-500 text-white font-bold text-xs uppercase rounded-full tracking-wider font-heading";
  } else {
    const defTeamName = penaltyAttackingTeam === 'blue' ? '🔴 Red Team' : '🔵 Blue Team';
    badge.textContent = `${defTeamName} — 🧤 BLOCK SHOT! (20s)`;
    badge.className = penaltyAttackingTeam === 'blue' 
      ? "inline-block px-4 py-1 bg-rose-500 text-white font-bold text-xs uppercase rounded-full tracking-wider font-heading"
      : "inline-block px-4 py-1 bg-sky-500 text-slate-950 font-bold text-xs uppercase rounded-full tracking-wider font-heading";
  }

  let options = [currentPenaltyItem.WORDS];
  while (options.length < 4 && options.length < gamesData.length) {
    let randWord = gamesData[Math.floor(Math.random() * gamesData.length)].WORDS;
    if (!options.includes(randWord)) options.push(randWord);
  }
  options.sort(() => 0.5 - Math.random());

  const optContainer = document.getElementById('penaltyOptions');
  optContainer.innerHTML = '';
  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.textContent = opt;
    btn.className = "py-2.5 px-3 bg-white hover:bg-slate-100 text-slate-900 rounded-xl font-bold text-xs shadow-md transition cursor-pointer truncate font-heading";
    btn.onclick = () => handlePenaltyAnswer(opt === currentPenaltyItem.WORDS);
    optContainer.appendChild(btn);
  });

  penaltyInterval = setInterval(() => {
    penaltyTimer--;
    if (timerEl) timerEl.textContent = penaltyTimer;
    if (penaltyTimer <= 0) {
      clearInterval(penaltyInterval);
      handlePenaltyAnswer(false);
    }
  }, 1000);
}

function handlePenaltyAnswer(isCorrect) {
  if (penaltyInterval) clearInterval(penaltyInterval);

  const ball = document.getElementById('penaltyBallImg');
  const keeper = document.getElementById('penaltyKeeperImg');

  if (penaltyPhase === 'ATTACK') {
    if (isCorrect) {
      ball.style.transform = 'translate(-12%, -25%) scale(0.6)';
      penaltyPhase = 'DEFENSE';
      showPenaltyFeedback('INFO', '🧤 SAVE THE SHOT!');
      setTimeout(() => startPenaltyTurn(), 1200);
    } else {
      ball.style.transform = 'translate(-55%, -35%) scale(0.3)';
      showPenaltyFeedback('MISSED');
      setTimeout(() => nextPenaltyTurn(false), 1400);
    }
  } else if (penaltyPhase === 'DEFENSE') {
    if (isCorrect) {
      keeper.style.transform = 'translate(-12%, 0)';
      ball.style.transform = 'translate(-12%, -25%) scale(0.6)';
      showPenaltyFeedback('BLOCKED');
      setTimeout(() => nextPenaltyTurn(false), 1400);
    } else {
      ball.style.transform = 'translate(-18%, -28%) scale(0.55)';
      keeper.style.transform = 'translate(14%, 0)';
      showPenaltyFeedback('GOAL');
      setTimeout(() => nextPenaltyTurn(true), 1400);
    }
  }
}

function nextPenaltyTurn(isGoal) {
  if (isGoal) {
    if (penaltyAttackingTeam === 'blue') penaltyBlueScore++;
    else penaltyRedScore++;
  }

  updatePenaltyUI();

  if (penaltyAttackingTeam === 'blue') {
    penaltyAttackingTeam = 'red';
    penaltyPhase = 'ATTACK';
    showPenaltyFeedback('INFO', '🔴 RED TEAM\'S TURN!');
    setTimeout(() => startPenaltyTurn(), 1200);
  } else {
    penaltyAttackingTeam = 'blue';
    penaltyPhase = 'ATTACK';
    penaltyCurrentRound++;

    if (penaltyCurrentRound > penaltyMaxRounds) {
      finalizarPenaltyShootout();
    } else {
      showPenaltyFeedback('INFO', '🔵 BLUE TEAM\'S TURN!');
      setTimeout(() => startPenaltyTurn(), 1200);
    }
  }
}

function finalizarPenaltyShootout() {
  if (penaltyInterval) clearInterval(penaltyInterval);

  if (penaltyBlueScore > penaltyRedScore) {
    mostrarModalResultadosJuego('Blue Team Wins! 🏆⚽', `${penaltyBlueScore} - ${penaltyRedScore}`, 'Great shooting & saving performance!');
  } else if (penaltyRedScore > penaltyBlueScore) {
    mostrarModalResultadosJuego('Red Team Wins! 🏆⚽', `${penaltyRedScore} - ${penaltyBlueScore}`, 'Great shooting & saving performance!');
  } else {
    mostrarModalResultadosJuego('Draw Match! 🤝⚽', `${penaltyBlueScore} - ${penaltyRedScore}`, 'Tense duel ended in a tie!');
  }
}

/* 8. SPACE DEFENDER LOGIC */
let sdScore = 0, sdLives = 3, sdWave = 1;
let sdCurrentItem = null;
let sdAsteroidTimer = null;
let sdClockTimer = null;
let sdAsteroidPos = 0;
let sdTimeLeft = 20;

function initSpaceDefender() {
  sdScore = 0;
  sdLives = 3;
  sdWave = 1;
  updateSDUI();
  nextSDAsteroid();
}

function updateSDUI() {
  document.getElementById('sdScore').textContent = sdScore;
  document.getElementById('sdLives').textContent = '❤️'.repeat(sdLives) || '💥';
  document.getElementById('sdWave').textContent = sdWave;
  document.getElementById('sdTimer').textContent = sdTimeLeft;
}

function nextSDAsteroid() {
  if (sdAsteroidTimer) clearInterval(sdAsteroidTimer);
  if (sdClockTimer) clearInterval(sdClockTimer);
  if (sdLives <= 0) return;

  sdTimeLeft = 20;
  updateSDUI();

  sdCurrentItem = gamesData[Math.floor(Math.random() * gamesData.length)];
  document.getElementById('sdClueText').textContent = `"${sdCurrentItem.CLUE}"`;

  const asteroid = document.getElementById('sdAsteroid');
  const asteroidBox = document.getElementById('sdAsteroidBox');
  const laser = document.getElementById('sdLaser');
  const ship = document.getElementById('sdShip');
  const explosion = document.getElementById('sdExplosion');
  const shipExplosion = document.getElementById('sdShipExplosion');
  
  sdAsteroidPos = 0;
  asteroid.style.transform = `translateY(${sdAsteroidPos}px)`;
  asteroidBox.style.opacity = '1';
  asteroidBox.style.transform = 'scale(1)';
  
  ship.style.opacity = '1';
  ship.style.transform = 'scale(1)';

  explosion.classList.remove('animate-explosion');
  explosion.style.opacity = '0';

  shipExplosion.classList.remove('animate-explosion');
  shipExplosion.style.opacity = '0';

  laser.style.transition = 'none';
  laser.style.opacity = '0';
  laser.style.transform = 'translateY(0px)';

  let options = [sdCurrentItem.WORDS];
  while (options.length < 4 && options.length < gamesData.length) {
    let randWord = gamesData[Math.floor(Math.random() * gamesData.length)].WORDS;
    if (!options.includes(randWord)) options.push(randWord);
  }
  options.sort(() => 0.5 - Math.random());

  const optContainer = document.getElementById('sdOptions');
  optContainer.innerHTML = '';
  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.textContent = opt;
    btn.className = "py-2.5 px-3 bg-slate-700 hover:bg-violet-600 text-white rounded-xl font-bold text-xs shadow-md transition cursor-pointer truncate border border-slate-600 font-heading";
    btn.onclick = () => shootSDLaser(opt === sdCurrentItem.WORDS);
    optContainer.appendChild(btn);
  });

  const totalSteps = 200;
  const stepInterval = 100; 
  const stepDistance = 220 / totalSteps;

  sdAsteroidTimer = setInterval(() => {
    sdAsteroidPos += stepDistance;
    asteroid.style.transform = `translateY(${sdAsteroidPos}px)`;
  }, stepInterval);

  sdClockTimer = setInterval(() => {
    sdTimeLeft--;
    document.getElementById('sdTimer').textContent = sdTimeLeft;

    if (sdTimeLeft <= 0) {
      clearInterval(sdAsteroidTimer);
      clearInterval(sdClockTimer);
      
      sdAsteroidPos = 220;
      asteroid.style.transform = `translateY(${sdAsteroidPos}px)`;
      handleSDImpact();
    }
  }, 1000);
}

function shootSDLaser(isCorrect) {
  if (sdAsteroidTimer) clearInterval(sdAsteroidTimer);
  if (sdClockTimer) clearInterval(sdClockTimer);

  const laser = document.getElementById('sdLaser');
  const ship = document.getElementById('sdShip');
  const asteroid = document.getElementById('sdAsteroid');
  const asteroidBox = document.getElementById('sdAsteroidBox');
  const explosion = document.getElementById('sdExplosion');

  const targetDistance = -(210 - sdAsteroidPos);
  
  laser.style.transition = 'none';
  laser.style.opacity = '1';
  laser.style.transform = 'translateY(0px)';
  
  void laser.offsetWidth;

  laser.style.transition = 'transform 0.25s linear, opacity 0.1s ease';
  laser.style.transform = `translateY(${targetDistance}px)`;
  ship.style.transform = 'scale(1.1)';

  setTimeout(() => {
    ship.style.transform = 'scale(1)';
    laser.style.opacity = '0';

    if (isCorrect) {
      asteroidBox.style.opacity = '0';
      asteroidBox.style.transform = 'scale(0.2)';
      
      explosion.style.opacity = '1';
      explosion.classList.add('animate-explosion');

      sdScore += 100;
      if (sdScore % 300 === 0) sdWave++;
      updateSDUI();

      setTimeout(() => {
        nextSDAsteroid();
      }, 400);

    } else {
      sdAsteroidPos = 220;
      asteroid.style.transform = `translateY(${sdAsteroidPos}px)`;
      setTimeout(() => handleSDImpact(), 200);
    }
  }, 250);
}

function handleSDImpact() {
  const ship = document.getElementById('sdShip');
  const shipExplosion = document.getElementById('sdShipExplosion');
  const canvas = document.getElementById('sdCanvasContainer');

  ship.style.opacity = '0.2';
  shipExplosion.style.opacity = '1';
  shipExplosion.classList.add('animate-explosion');

  if (canvas) {
    canvas.classList.add('animate-shake');
    setTimeout(() => canvas.classList.remove('animate-shake'), 400);
  }

  sdLives--;
  updateSDUI();

  setTimeout(() => {
    if (sdLives <= 0) {
      mostrarModalResultadosJuego('Base Destroyed! 💥', `${sdScore} PTS`, `You reached Wave ${sdWave} in Space Defender.`);
    } else {
      nextSDAsteroid();
    }
  }, 600);
}

/* 9. CLASSROOM IMPOSTOR LOGIC */
const MAP_WIDTH = 1600;
const MAP_HEIGHT = 1200;
const VISION_RADIUS = 220;

const MAP_IMAGE_URL = "img/mapaAMONGUS.jpg";
const mapSprite = new Image();
mapSprite.src = MAP_IMAGE_URL;

let taskLocations = [
  { id: 0, x: 940, y: 130, label: "Top Hallway", active: true },
  { id: 1, x: 1510, y: 140, label: "Top Right Corner", active: true },
  { id: 2, x: 550, y: 310, label: "Upper Room 2", active: true },
  { id: 3, x: 800, y: 310, label: "Upper Room 3", active: true },
  { id: 4, x: 1050, y: 310, label: "Upper Room 4", active: true },
  { id: 5, x: 250, y: 590, label: "Left Middle Room", active: true },
  { id: 6, x: 1380, y: 600, label: "Right Middle Room", active: true },
  { id: 7, x: 800, y: 870, label: "Lower Room 3", active: true },
  { id: 8, x: 1050, y: 870, label: "Lower Room 4", active: true },
  { id: 9, x: 1510, y: 870, label: "Far Right Lower Corridor", active: true },
  { id: 10, x: 200, y: 1030, label: "Bottom Left Entrance", active: true },
  { id: 11, x: 540, y: 1130, label: "Bottom Wall Left", active: true },
  { id: 12, x: 1330, y: 1130, label: "Bottom Wall Right", active: true }
];

let globalTasksDone = 0;
const TOTAL_TASKS_REQUIRED = 10;
let activeTaskIndex = null;

const PERSONAJES_ASSETS = [
  "img/AMONGUS1.webp",
  "img/AMONGUS2.webp",
  "img/AMONGUS3.webp",
  "img/AMONGUS4.webp",
  "img/AMONGUS5.webp",
  "img/AMONGUS6.webp"
];

const playerSprites = {};
PERSONAJES_ASSETS.forEach((url, idx) => {
  const img = new Image();
  img.src = url;
  playerSprites[idx] = img;
});

let peer = null;
let connections = [];
let hostConn = null;
let isHost = false;
let gameStarted = false;
let myId = "";

let players = {}; 
let bodies = [];
let votes = {}; 
let hasVoted = false;

const colors = ["#ff4d4d", "#4d79ff", "#4dff88", "#ffff4d", "#ff994d", "#cc66ff"];

let myData = {
  id: "", name: "",
  x: 200 + Math.random() * (MAP_WIDTH - 400),
  y: 200 + Math.random() * (MAP_HEIGHT - 400),
  color: colors[0], 
  characterIndex: 0,
  isImpostor: false, 
  isDead: false
};

const joystickVector = { x: 0, y: 0 };
const inputState = { up: false, down: false, left: false, right: false };

function initImpostorGame() {
  setupJoystick();

  window.addEventListener("keydown", e => {
    if(e.key === "ArrowUp" || e.key === "w") inputState.up = true;
    if(e.key === "ArrowDown" || e.key === "s") inputState.down = true;
    if(e.key === "ArrowLeft" || e.key === "a") inputState.left = true;
    if(e.key === "ArrowRight" || e.key === "d") inputState.right = true;
  });
  window.addEventListener("keyup", e => {
    if(e.key === "ArrowUp" || e.key === "w") inputState.up = false;
    if(e.key === "ArrowDown" || e.key === "s") inputState.down = false;
    if(e.key === "ArrowLeft" || e.key === "a") inputState.left = false;
    if(e.key === "ArrowRight" || e.key === "d") inputState.right = false;
  });
}

function setupJoystick() {
  const zone = document.getElementById("joystickZone");
  const knob = document.getElementById("joystickKnob");
  if (!zone || !knob) return;

  let activeTouchId = null;
  let isMouseDown = false;

  const handleStart = (clientX, clientY, identifier) => {
    activeTouchId = identifier;
    handleMove(clientX, clientY);
  };

  const handleMove = (clientX, clientY) => {
    const rect = zone.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let deltaX = clientX - centerX;
    let deltaY = clientY - centerY;
    const distance = Math.hypot(deltaX, deltaY);
    const maxRadius = rect.width / 2;

    if (distance > maxRadius) {
      const angle = Math.atan2(deltaY, deltaX);
      deltaX = Math.cos(angle) * maxRadius;
      deltaY = Math.sin(angle) * maxRadius;
    }

    knob.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    
    joystickVector.x = deltaX / maxRadius;
    joystickVector.y = deltaY / maxRadius;
  };

  const handleEnd = () => {
    activeTouchId = null;
    isMouseDown = false;
    knob.style.transform = `translate(0px, 0px)`;
    joystickVector.x = 0;
    joystickVector.y = 0;
  };

  zone.addEventListener("touchstart", e => {
    e.preventDefault();
    if (activeTouchId !== null) return;
    const touch = e.changedTouches[0];
    handleStart(touch.clientX, touch.clientY, touch.identifier);
  }, { passive: false });

  window.addEventListener("touchmove", e => {
    if (activeTouchId === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === activeTouchId) {
        handleMove(e.changedTouches[i].clientX, e.changedTouches[i].clientY);
        break;
      }
    }
  }, { passive: false });

  window.addEventListener("touchend", e => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === activeTouchId) {
        handleEnd();
        break;
      }
    }
  });

  zone.addEventListener("mousedown", e => {
    isMouseDown = true;
    handleStart(e.clientX, e.clientY, "mouse");
  });

  window.addEventListener("mousemove", e => {
    if (isMouseDown && activeTouchId === "mouse") {
      handleMove(e.clientX, e.clientY);
    }
  });

  window.addEventListener("mouseup", () => {
    if (activeTouchId === "mouse") handleEnd();
  });
}

function generateShortId() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let res = ""; for (let i = 0; i < 4; i++) res += chars.charAt(Math.floor(Math.random() * chars.length));
  return res;
}

function createRoom() {
  isHost = true;
  myData.name = escapeHTML(document.getElementById("playerName").value) || "Host";
  myData.characterIndex = 0;
  myData.color = colors[0];

  const shortCode = generateShortId();
  peer = new Peer(shortCode);

  peer.on("open", id => {
    myId = id; 
    myData.id = id; 
    players[id] = myData;
    document.getElementById("roomStatus").innerText = "SALA: " + id;
    
    const btnStart = document.getElementById("btnStartGame");
    if (btnStart) {
      btnStart.classList.remove("hidden");
      btnStart.style.display = "inline-block";
    }

    setupHostLogic(); 
    gameLoop();
  });

  peer.on("error", err => {
    console.error("Error en PeerJS Host:", err);
    document.getElementById("roomStatus").innerText = "Error de conexión";
  });
}

function setupHostLogic() {
  peer.on("connection", conn => {
    connections.push(conn);
    conn.on("data", data => handleIncomingData(data, conn));
    conn.on("close", () => { delete players[conn.peer]; broadcastGameState(); });
  });
}

function joinRoom() {
  const roomCode = document.getElementById("joinId").value.trim().toUpperCase();
  if (!roomCode) return alert("Ingresa un código de sala válido.");

  myData.name = escapeHTML(document.getElementById("playerName").value) || "Player";
  peer = new Peer();

  peer.on("open", id => {
    myId = id; 
    myData.id = id; 
    
    hostConn = peer.connect(roomCode, { reliable: true });

    hostConn.on("open", () => {
      document.getElementById("roomStatus").innerText = "¡CONECTADO A " + roomCode + "!";
      hostConn.send({ type: "JOIN", player: myData });
      gameLoop();
    });

    hostConn.on("data", handleClientIncomingData);
  });

  peer.on("error", err => {
    console.error("Error en PeerJS Cliente:", err);
    alert("No se pudo conectar a la sala " + roomCode + ". Revisa el código o la conexión.");
  });
}

function handleIncomingData(data, conn) {
  if (data.type === "JOIN") {
    const playerIndex = Object.keys(players).length;
    data.player.name = escapeHTML(data.player.name);
    data.player.characterIndex = playerIndex % PERSONAJES_ASSETS.length;
    data.player.color = colors[playerIndex % colors.length];

    players[data.player.id] = data.player;
    broadcastGameState();
  } else if (data.type === "UPDATE_POS") {
    if (players[data.id]) { players[data.id].x = data.x; players[data.id].y = data.y; }
    broadcastGameState();
  } else if (data.type === "KILL") {
    if (players[data.targetId]) {
      players[data.targetId].isDead = true;
      bodies.push({ x: players[data.targetId].x, y: players[data.targetId].y, color: players[data.targetId].color });
      checkWinCondition();
    }
    broadcastGameState();
  } else if (data.type === "MEETING") {
    votes = {};
    broadcast({ type: "START_MEETING" });
  } else if (data.type === "CAST_VOTE") {
    votes[data.voterId] = data.targetId;
  } else if (data.type === "COMPLETE_TASK") {
    if (taskLocations[data.taskIndex] && taskLocations[data.taskIndex].active) {
      taskLocations[data.taskIndex].active = false;
      globalTasksDone = Math.min(TOTAL_TASKS_REQUIRED, globalTasksDone + 1);
      broadcastGameState();
      if (isHost && globalTasksDone >= TOTAL_TASKS_REQUIRED) {
        broadcast({ type: "SHOW_RESULT", title: "CREWMATES WIN! 🎉", desc: "All English vocabulary tasks have been completed!", color: "#4dff88" });
        resetGame();
      }
    }
  } else if (data.type === "SABOTAGE_TASK") {
    if (taskLocations[data.taskIndex] && !taskLocations[data.taskIndex].active) {
      taskLocations[data.taskIndex].active = true;
      globalTasksDone = Math.max(0, globalTasksDone - 1);
      broadcastGameState();
    }
  }
}

function handleClientIncomingData(data) {
  if (data.type === "STATE") {
    players = data.players; bodies = data.bodies;
    if (data.tasksDone !== undefined) {
      globalTasksDone = data.tasksDone;
      updateTaskProgressBar();
    }
    if (data.taskLocations) {
      taskLocations = data.taskLocations;
    }
    if (players[myId]) {
      myData.isImpostor = players[myId].isImpostor;
      myData.isDead = players[myId].isDead;
      myData.characterIndex = players[myId].characterIndex;
    }
  } else if (data.type === "START_MEETING") {
    hasVoted = false;
    renderVoteList();
    document.getElementById("meetingModal").classList.remove("hidden");
    if(isHost) document.getElementById("btnEndMeeting").style.display = "block";
  } else if (data.type === "SHOW_RESULT") {
    document.getElementById("meetingModal").classList.add("hidden");
    document.getElementById("resultTitle").innerText = data.title;
    document.getElementById("resultTitle").style.color = data.color;
    document.getElementById("resultDesc").innerText = data.desc;
    document.getElementById("resultModal").classList.remove("hidden");
  }
}

function updateTaskProgressBar() {
  const counter = document.getElementById("taskCounter");
  const bar = document.getElementById("taskProgressBar");
  if (counter) counter.textContent = `${globalTasksDone} / ${TOTAL_TASKS_REQUIRED}`;
  if (bar) {
    const pct = Math.min(100, Math.floor((globalTasksDone / TOTAL_TASKS_REQUIRED) * 100));
    bar.style.width = `${pct}%`;
  }
}

function renderVoteList() {
  const list = document.getElementById("voteList");
  list.innerHTML = "";
  document.getElementById("voteStatus").innerText = myData.isDead ? "👻 You are a ghost (Cannot vote)" : "";

  for (let id in players) {
    if (!players[id].isDead) {
      const btn = document.createElement("div");
      btn.className = "vote-btn" + (myData.isDead ? " vote-btn-disabled" : "");
      btn.innerHTML = `<span>${escapeHTML(players[id].name)}</span>`;
      if (!myData.isDead) btn.onclick = () => castVote(id);
      list.appendChild(btn);
    }
  }

  const skipBtn = document.createElement("div");
  skipBtn.className = "vote-btn" + (myData.isDead ? " vote-btn-disabled" : "");
  skipBtn.style.borderColor = "#777";
  skipBtn.innerHTML = `<span>SKIP VOTE</span>`;
  if (!myData.isDead) skipBtn.onclick = () => castVote("SKIP");
  list.appendChild(skipBtn);
}

function castVote(targetId) {
  if (hasVoted || myData.isDead) return;
  hasVoted = true;
  document.getElementById("voteStatus").innerText = "Vote submitted! Waiting for host...";
  if (isHost) votes[myId] = targetId;
  else hostConn.send({ type: "CAST_VOTE", voterId: myId, targetId: targetId });
}

function endMeetingHost() {
  if (!isHost) return;
  
  let voteCounts = {};
  for (let v in votes) {
    let t = votes[v];
    voteCounts[t] = (voteCounts[t] || 0) + 1;
  }

  let maxVotes = 0;
  let ejectedId = null;
  let tie = false;

  for (let target in voteCounts) {
    if (voteCounts[target] > maxVotes) {
      maxVotes = voteCounts[target];
      ejectedId = target;
      tie = false;
    } else if (voteCounts[target] === maxVotes) {
      tie = true;
    }
  }

  let resultTitle = "";
  let resultDesc = "";
  let color = "#fff";

  if (tie || !ejectedId || ejectedId === "SKIP") {
    resultTitle = "No one was ejected";
    resultDesc = "Skipped / Tied vote.";
  } else {
    let p = players[ejectedId];
    p.isDead = true; 

    if (p.isImpostor) {
      resultTitle = "VICTORY!";
      resultDesc = `${p.name} was ejected. They were The Impostor!`;
      color = "#4dff88";
    } else {
      resultTitle = `${p.name} was ejected`;
      resultDesc = `${p.name} was NOT The Impostor.`;
      color = "#ff4d4d";
    }
  }

  broadcastGameState();

  let impostorDefeated = (ejectedId && players[ejectedId] && players[ejectedId].isImpostor);
  
  if (impostorDefeated) {
    broadcast({ type: "SHOW_RESULT", title: "CREWMATES WIN!", desc: `${players[ejectedId].name} was the Impostor!`, color: "#4dff88" });
    resetGame();
  } else {
    if (!checkWinCondition()) {
      broadcast({ type: "SHOW_RESULT", title: resultTitle, desc: resultDesc, color: color });
    }
  }
}

function checkWinCondition() {
  if (!isHost) return false;
  let aliveCrew = 0;
  let aliveImp = 0;

  for (let id in players) {
    if (!players[id].isDead) {
      if (players[id].isImpostor) aliveImp++;
      else aliveCrew++;
    }
  }

  if (aliveImp >= aliveCrew) {
    broadcast({ type: "SHOW_RESULT", title: "IMPOSTOR WINS!", desc: "The Impostor has taken over!", color: "#ff4d4d" });
    resetGame();
    return true;
  }
  return false;
}

function resetGame() {
  gameStarted = false;
  globalTasksDone = 0;
  taskLocations.forEach(t => t.active = true);
  updateTaskProgressBar();
  bodies = [];
  for (let id in players) {
    players[id].isDead = false;
    players[id].isImpostor = false;
  }
  document.getElementById("btnStartGame").style.display = "inline-block";
}

function closeResultModal() {
  document.getElementById("resultModal").classList.add("hidden");
  document.getElementById("meetingModal").classList.add("hidden");
  hasVoted = false;
}

function openTaskModal() {
  if (activeTaskIndex === null || gamesData.length === 0) return;

  const qItem = gamesData[Math.floor(Math.random() * gamesData.length)];
  document.getElementById("taskClueText").textContent = `"${qItem.CLUE}"`;

  let options = [qItem.WORDS];
  while (options.length < 4 && options.length < gamesData.length) {
    let randWord = gamesData[Math.floor(Math.random() * gamesData.length)].WORDS;
    if (!options.includes(randWord)) options.push(randWord);
  }
  options.sort(() => 0.5 - Math.random());

  const optContainer = document.getElementById("taskOptions");
  optContainer.innerHTML = "";
  options.forEach(opt => {
    const btn = document.createElement("button");
    btn.textContent = opt;
    btn.className = "py-2.5 bg-slate-800 hover:bg-sky-500 text-white font-bold text-xs rounded-xl border border-slate-700 transition cursor-pointer font-heading";
    btn.onclick = () => answerTask(opt === qItem.WORDS);
    optContainer.appendChild(btn);
  });

  document.getElementById("taskModal").classList.remove("hidden");
}

function answerTask(isCorrect) {
  document.getElementById("taskModal").classList.add("hidden");
  if (isCorrect && activeTaskIndex !== null) {
    if (isHost) {
      handleIncomingData({ type: "COMPLETE_TASK", taskIndex: activeTaskIndex });
    } else if (hostConn) {
      hostConn.send({ type: "COMPLETE_TASK", taskIndex: activeTaskIndex });
    }
  } else {
    alert("❌ Incorrect! Try another task spot.");
  }
}

function sabotageTask() {
  if (activeTaskIndex === null) return;
  if (isHost) {
    handleIncomingData({ type: "SABOTAGE_TASK", taskIndex: activeTaskIndex });
  } else if (hostConn) {
    hostConn.send({ type: "SABOTAGE_TASK", taskIndex: activeTaskIndex });
  }
}

function closeTaskModal() {
  document.getElementById("taskModal").classList.add("hidden");
}

function startGame() {
  if (!isHost) return;
  
  gameStarted = true;
  globalTasksDone = 0;
  taskLocations.forEach(t => t.active = true);
  updateTaskProgressBar();
  
  document.getElementById("btnStartGame").style.display = "none";
  assignImpostor();
  broadcastGameState();
}

function assignImpostor() {
  const keysArr = Object.keys(players);
  const randomImpostorId = keysArr[Math.floor(Math.random() * keysArr.length)];
  for (let id in players) players[id].isImpostor = (id === randomImpostorId);
}

function broadcastGameState() {
  if (!isHost) return;
  const state = { 
    type: "STATE", 
    players: players, 
    bodies: bodies, 
    tasksDone: globalTasksDone,
    taskLocations: taskLocations 
  };
  updateTaskProgressBar();
  connections.forEach(conn => conn.send(state));
}

function broadcast(msg) {
  if (isHost) {
    connections.forEach(conn => conn.send(msg));
    handleClientIncomingData(msg);
  } else if (hostConn) hostConn.send(msg);
}

function update() {
  if (juegoActivoActual !== 'impostor') return;
  let moved = false; 
  const speed = 4;

  let moveX = 0;
  let moveY = 0;

  if (joystickVector.x !== 0 || joystickVector.y !== 0) {
    moveX = joystickVector.x * speed;
    moveY = joystickVector.y * speed;
  } else {
    if (inputState.up) moveY -= speed;
    if (inputState.down) moveY += speed;
    if (inputState.left) moveX -= speed;
    if (inputState.right) moveX += speed;
  }

  let nextX = myData.x + moveX;
  let nextY = myData.y + moveY;

  nextX = Math.max(20, Math.min(MAP_WIDTH - 20, nextX));
  nextY = Math.max(20, Math.min(MAP_HEIGHT - 20, nextY));

  if (nextX !== myData.x || nextY !== myData.y) {
    myData.x = nextX;
    myData.y = nextY;
    moved = true;
  }

  if (moved) {
    if (isHost) { players[myId].x = myData.x; players[myId].y = myData.y; broadcastGameState(); }
    else if (hostConn) hostConn.send({ type: "UPDATE_POS", id: myId, x: myData.x, y: myData.y });
  }

  let canDoTask = false;
  let canSabotage = false;
  activeTaskIndex = null;

  taskLocations.forEach((t, idx) => {
    if (Math.hypot(t.x - myData.x, t.y - myData.y) < 55) {
      activeTaskIndex = idx;
      if (!myData.isDead && !myData.isImpostor && t.active) {
        canDoTask = true;
      }
      if (!myData.isDead && myData.isImpostor && !t.active) {
        canSabotage = true;
      }
    }
  });

  const btnTask = document.getElementById("btnDoTask");
  if (btnTask) btnTask.style.display = canDoTask ? "block" : "none";

  const btnSabotage = document.getElementById("btnSabotage");
  if (btnSabotage) btnSabotage.style.display = canSabotage ? "block" : "none";

  document.getElementById("btnKill").style.display = (myData.isImpostor && !myData.isDead) ? "block" : "none";
  let nearBody = bodies.some(b => Math.hypot(b.x - myData.x, b.y - myData.y) < 50);
  document.getElementById("btnReport").style.display = (!myData.isDead && nearBody) ? "block" : "none";
}

function draw() {
  if (juegoActivoActual !== 'impostor') return;
  const canvas = document.getElementById("canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const cameraX = myData.x - canvas.width / 2;
  const cameraY = myData.y - canvas.height / 2;

  ctx.save();
  ctx.translate(-cameraX, -cameraY);

  if (mapSprite.complete && mapSprite.naturalWidth !== 0) {
    ctx.drawImage(mapSprite, 0, 0, MAP_WIDTH, MAP_HEIGHT);
  } else {
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);
  }

  taskLocations.forEach(t => {
    let dist = Math.hypot(t.x - myData.x, t.y - myData.y);
    if (myData.isDead || dist <= VISION_RADIUS) {
      ctx.fillStyle = t.active ? "#38bdf8" : "#64748b";
      ctx.beginPath();
      ctx.arc(t.x, t.y, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = t.active ? "#ffffff" : "#334155";
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = t.active ? "#0f172a" : "#cbd5e1";
      ctx.font = "bold 14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(t.active ? "!" : "✓", t.x, t.y + 5);
    }
  });

  bodies.forEach(b => {
    let dist = Math.hypot(b.x - myData.x, b.y - myData.y);
    if (myData.isDead || dist <= VISION_RADIUS) {
      ctx.fillStyle = b.color; ctx.beginPath(); ctx.arc(b.x, b.y + 5, 12, 0, Math.PI, false); ctx.fill();
      ctx.fillStyle = "white"; ctx.fillText("X_X", b.x - 8, b.y);
    }
  });

  for (let id in players) {
    let p = players[id];
    let dist = Math.hypot(p.x - myData.x, p.y - myData.y);

    if (!myData.isDead && dist > VISION_RADIUS && id !== myId) continue;

    ctx.globalAlpha = p.isDead ? 0.35 : 1.0; 
    
    let sprite = playerSprites[p.characterIndex !== undefined ? p.characterIndex : 0];
    if (sprite && sprite.complete && sprite.naturalWidth !== 0) {
      ctx.drawImage(sprite, p.x - 20, p.y - 25, 40, 50);
    } else {
      ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, 15, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#38bdf8"; ctx.fillRect(p.x - 4, p.y - 6, 10, 7);
    }
    
    ctx.globalAlpha = 1.0;

    ctx.fillStyle = p.isDead ? "#94a3b8" : "white"; 
    ctx.font = "bold 12px sans-serif"; 
    ctx.textAlign = "center";
    let label = (p.isDead ? "👻 " : "") + p.name + (p.id === myId ? " (You)" : "");
    if (p.id === myId && p.isImpostor) label += " [IMP]";
    ctx.fillText(label, p.x, p.y - 30);
  }
  ctx.restore();

  if (!myData.isDead) {
    ctx.save();
    ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.arc(canvas.width / 2, canvas.height / 2, VISION_RADIUS, 0, Math.PI * 2, true);
    ctx.fill();
    ctx.restore();
  }
}

function gameLoop() { 
  if (juegoActivoActual === 'impostor') {
    update(); 
    draw(); 
  }
  requestAnimationFrame(gameLoop); 
}

function killPlayer() {
  for (let id in players) {
    if (id !== myId && !players[id].isDead) {
      if (Math.hypot(players[id].x - myData.x, players[id].y - myData.y) < 45) {
        broadcast({ type: "KILL", targetId: id });
        break;
      }
    }
  }
}

function reportBody() { broadcast({ type: "MEETING" }); }

/* ==========================================
   10. KAHOOT / LIVE QUIZ CLASH LOGIC
   ========================================== */

let kqPeer = null;
let kqConnections = [];
let kqHostConn = null;
let kqIsHost = false;
let kqRoomPin = "";
let kqPlayers = {}; // { connId: { name, score, answered, answerIdx, responseTime } }
let kqQuestions = [];
let kqCurrentQIndex = 0;
let kqTimer = 20;
let kqTimerInterval = null;
let kqAnswersReceived = 0;

function resetKahootUI() {
  if (kqTimerInterval) clearInterval(kqTimerInterval);
  document.getElementById('kqLobby').classList.remove('hidden');
  document.getElementById('kqHostArea').classList.add('hidden');
  document.getElementById('kqClientArea').classList.add('hidden');
}

// HOST: Crear Sala
function createKQRoom() {
  if (gamesData.length < 4) {
    alert("Se requieren al menos 4 palabras en este nivel para generar las opciones.");
    return;
  }

  kqIsHost = true;
  kqPlayers = {};
  kqConnections = [];
  kqRoomPin = generateShortId();

  kqPeer = new Peer(`NEXO-KQ-${kqRoomPin}`);

  kqPeer.on('open', id => {
    document.getElementById('kqLobby').classList.add('hidden');
    document.getElementById('kqHostArea').classList.remove('hidden');
    document.getElementById('kqHostWaiting').classList.remove('hidden');
    document.getElementById('kqHostQuestionBox').classList.add('hidden');
    document.getElementById('kqHostLeaderboard').classList.add('hidden');
    document.getElementById('kqPinDisplay').textContent = kqRoomPin;
    updateKQPlayerListUI();
  });

  kqPeer.on('connection', conn => {
    kqConnections.push(conn);

    conn.on('data', data => {
      if (data.type === 'JOIN') {
        kqPlayers[conn.peer] = {
          name: escapeHTML(data.name),
          score: 0,
          answered: false,
          answerIdx: -1,
          responseTime: 0
        };
        updateKQPlayerListUI();
        broadcastKQState();
      } else if (data.type === 'ANSWER') {
        if (kqPlayers[conn.peer] && !kqPlayers[conn.peer].answered) {
          kqPlayers[conn.peer].answered = true;
          kqPlayers[conn.peer].answerIdx = data.answerIdx;
          kqPlayers[conn.peer].responseTime = kqTimer;
          kqAnswersReceived++;
          document.getElementById('kqAnswersCount').textContent = kqAnswersReceived;

          if (kqAnswersReceived >= Object.keys(kqPlayers).length) {
            endKQQuestion();
          }
        }
      }
    });

    conn.on('close', () => {
      delete kqPlayers[conn.peer];
      updateKQPlayerListUI();
    });
  });

  kqPeer.on('error', err => {
    console.error("PeerJS Host Error:", err);
    alert("Error creando la sala. Inténtalo de nuevo.");
  });
}

function updateKQPlayerListUI() {
  const container = document.getElementById('kqPlayerList');
  const countEl = document.getElementById('kqPlayerCount');
  const playerKeys = Object.keys(kqPlayers);

  countEl.textContent = `${playerKeys.length} Estudiantes Conectados`;
  container.innerHTML = '';

  playerKeys.forEach(k => {
    const badge = document.createElement('span');
    badge.className = "px-3 py-1 bg-amber-400 text-slate-950 font-bold text-xs rounded-full shadow-md font-heading";
    badge.textContent = kqPlayers[k].name;
    container.appendChild(badge);
  });
}

function broadcastKQState(msg) {
  const state = msg || { type: 'WAITING', count: Object.keys(kqPlayers).length };
  kqConnections.forEach(c => c.send(state));
}

// INICIAR JUEGO (HOST)
function startKQGame() {
  if (Object.keys(kqPlayers).length === 0) {
    alert("Esperando a que se conecte al menos 1 estudiante.");
    return;
  }

  // Mezclar preguntas disponibles
  kqQuestions = [...gamesData].sort(() => 0.5 - Math.random()).slice(0, 10);
  kqCurrentQIndex = 0;

  document.getElementById('kqHostWaiting').classList.add('hidden');
  document.getElementById('kqHostQuestionBox').classList.remove('hidden');

  loadKQQuestion();
}

function loadKQQuestion() {
  if (kqTimerInterval) clearInterval(kqTimerInterval);

  const q = kqQuestions[kqCurrentQIndex];
  kqAnswersReceived = 0;
  kqTimer = 20;

  document.getElementById('kqCurrentQNum').textContent = kqCurrentQIndex + 1;
  document.getElementById('kqHostTimer').textContent = kqTimer;
  document.getElementById('kqAnswersCount').textContent = 0;
  document.getElementById('kqQuestionClue').textContent = `"${q.CLUE}"`;

  // Generar 4 opciones únicas
  let options = [q.WORDS];
  while (options.length < 4 && options.length < gamesData.length) {
    let randWord = gamesData[Math.floor(Math.random() * gamesData.length)].WORDS;
    if (!options.includes(randWord)) options.push(randWord);
  }
  options.sort(() => 0.5 - Math.random());
  q.options = options;
  q.correctIdx = options.indexOf(q.WORDS);

  // Mostrar opciones en la pantalla del Host
  document.getElementById('kqOpt1').textContent = options[0];
  document.getElementById('kqOpt2').textContent = options[1];
  document.getElementById('kqOpt3').textContent = options[2];
  document.getElementById('kqOpt4').textContent = options[3];

  // Resetear estado de respuestas de los jugadores
  Object.keys(kqPlayers).forEach(k => {
    kqPlayers[k].answered = false;
    kqPlayers[k].answerIdx = -1;
  });

  // Notificar a los estudiantes
  broadcastKQState({ type: 'QUESTION_START', time: kqTimer });

  kqTimerInterval = setInterval(() => {
    kqTimer--;
    document.getElementById('kqHostTimer').textContent = kqTimer;
    if (kqTimer <= 0) {
      endKQQuestion();
    }
  }, 1000);
}

function endKQQuestion() {
  if (kqTimerInterval) clearInterval(kqTimerInterval);

  const q = kqQuestions[kqCurrentQIndex];

  // Calcular puntaje acumulado según la velocidad
  Object.keys(kqPlayers).forEach(k => {
    const p = kqPlayers[k];
    let isCorrect = (p.answerIdx === q.correctIdx);

    if (isCorrect) {
      let speedBonus = Math.max(100, p.responseTime * 45);
      p.score += (500 + speedBonus);
    }

    // Enviar feedback individual al estudiante
    kqConnections.forEach(c => {
      if (c.peer === k) {
        c.send({
          type: 'QUESTION_RESULT',
          isCorrect: isCorrect,
          correctWord: q.WORDS,
          score: p.score
        });
      }
    });
  });

  showKQLeaderboard();
}

function showKQLeaderboard() {
  document.getElementById('kqHostQuestionBox').classList.add('hidden');
  document.getElementById('kqHostLeaderboard').classList.remove('hidden');

  const listEl = document.getElementById('kqLeaderboardList');
  listEl.innerHTML = '';

  const sortedPlayers = Object.values(kqPlayers).sort((a, b) => b.score - a.score);

  sortedPlayers.forEach((p, idx) => {
    const item = document.createElement('div');
    item.className = "flex justify-between items-center bg-slate-950 p-3 px-5 rounded-xl border border-slate-800 font-heading";
    item.innerHTML = `
      <span class="font-bold text-sm text-white">${idx + 1}. ${p.name}</span>
      <span class="font-bold text-amber-400 text-sm">${p.score} PTS</span>
    `;
    listEl.appendChild(item);
  });
}

function nextKQQuestion() {
  kqCurrentQIndex++;
  if (kqCurrentQIndex < kqQuestions.length) {
    document.getElementById('kqHostLeaderboard').classList.add('hidden');
    document.getElementById('kqHostQuestionBox').classList.remove('hidden');
    loadKQQuestion();
  } else {
    const winner = Object.values(kqPlayers).sort((a, b) => b.score - a.score)[0];
    mostrarModalResultadosJuego('Quiz Finished! 🏆', `${winner ? winner.name : 'No one'} Wins!`, 'Great live vocabulary competition!');
  }
}

// CLIENTE / ESTUDIANTE: Unirse desde el Teléfono
function joinKQRoom() {
  const nameInput = escapeHTML(document.getElementById('kqStudentName').value);
  const pinInput = document.getElementById('kqRoomPin').value.trim().toUpperCase();

  if (!nameInput || !pinInput) {
    alert("Por favor ingresa tu nombre y el PIN de la sala.");
    return;
  }

  kqIsHost = false;
  kqPeer = new Peer();

  kqPeer.on('open', id => {
    kqHostConn = kqPeer.connect(`NEXO-KQ-${pinInput}`, { reliable: true });

    kqHostConn.on('open', () => {
      document.getElementById('kqLobby').classList.add('hidden');
      document.getElementById('kqClientArea').classList.remove('hidden');
      document.getElementById('kqClientPlayerName').textContent = nameInput;

      kqHostConn.send({ type: 'JOIN', name: nameInput });
    });

    kqHostConn.on('data', data => {
      if (data.type === 'QUESTION_START') {
        document.getElementById('kqClientWaitingMsg').classList.add('hidden');
        document.getElementById('kqClientFeedback').classList.add('hidden');
        document.getElementById('kqClientButtons').classList.remove('hidden');
      } else if (data.type === 'QUESTION_RESULT') {
        document.getElementById('kqClientButtons').classList.add('hidden');
        document.getElementById('kqClientFeedback').classList.remove('hidden');

        document.getElementById('kqClientScore').textContent = `${data.score} Puntos`;

        const fbText = document.getElementById('kqFeedbackText');
        if (data.isCorrect) {
          fbText.textContent = "¡CORRECTO! 🎉";
          fbText.className = "text-3xl font-bold text-emerald-400 font-heading";
        } else {
          fbText.textContent = `INCORRECTO ❌ (${data.correctWord})`;
          fbText.className = "text-2xl font-bold text-rose-500 font-heading";
        }
      }
    });
  });

  kqPeer.on('error', err => {
    console.error("PeerJS Client Error:", err);
    alert("No se pudo conectar. Verifica que el PIN sea correcto.");
  });
}

function sendKQAnswer(optionIndex) {
  document.getElementById('kqClientButtons').classList.add('hidden');
  document.getElementById('kqClientFeedback').classList.remove('hidden');
  document.getElementById('kqFeedbackText').textContent = "¡Respuesta Enviada! ⏳";
  document.getElementById('kqFeedbackText').className = "text-2xl font-bold text-amber-400 font-heading";

  if (kqHostConn) {
    kqHostConn.send({ type: 'ANSWER', answerIdx: optionIndex });
  }
}
