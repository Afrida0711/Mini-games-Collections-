const boardSize = 15;
const board = document.getElementById("board");
const modeSelector = document.getElementById("mode");
const scoreDisplay = document.getElementById("score");
const restartBtn = document.getElementById("restartBtn");

let cells = [];
let currentPlayer = "red";
let gameStarted = false;
let selectedMode = "pvp";
let scores = { red: 0, green: 0 };

function createBoard() {
  board.innerHTML = "";
  cells = [];
  for (let y = 0; y < boardSize; y++) {
    cells[y] = [];
    for (let x = 0; x < boardSize; x++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.x = x;
      cell.dataset.y = y;
      cell.addEventListener("click", () => {
        if (gameStarted) makeMove(x, y);
      });
      board.appendChild(cell);
      cells[y][x] = { element: cell, value: null };
    }
  }
}

function startGame() {
  selectedMode = modeSelector.value;
  createBoard();
  currentPlayer = "red";
  gameStarted = true;
  scores = { red: 0, green: 0 };
  updateScore();
  restartBtn.disabled = false;
}

function restartGame() {
  document.getElementById("endScreen").style.display = "none";
  createBoard();
  currentPlayer = "red";
  gameStarted = true;
}

modeSelector.addEventListener("change", () => {
  scores = { red: 0, green: 0 };
  updateScore();
});

function makeMove(x, y) {
  const cell = cells[y][x];
  if (cell.value !== null) return;
  cell.value = currentPlayer;
  cell.element.classList.add(currentPlayer);

  if (checkWin(x, y, currentPlayer)) {
    highlightWinningLine(x, y, currentPlayer);
    scores[currentPlayer]++;
    updateScore();
    disableBoard();
    gameStarted = false;
    const message = selectedMode === "ai"
      ? (currentPlayer === "green" ? "Computer Win!" : "You Win!")
      : (currentPlayer === "red" ? "Player 1 (Red) Wins!" : "Player 2 (Green) Wins!");
    showEndScreen(message);
    return;
  }

  currentPlayer = currentPlayer === "red" ? "green" : "red";

  if (selectedMode === "ai" && currentPlayer === "green") {
    setTimeout(() => {
      const [aiX, aiY] = getSmartAIMove();
      makeMove(aiX, aiY);
    }, 300);
  }
}

function getSmartAIMove() {
  function scorePosition(x, y, color) {
    let score = 0;
    const directions = [[1,0], [0,1], [1,1], [1,-1]];
    for (const [dx, dy] of directions) {
      let count = 1;
      for (let dir = -1; dir <= 1; dir += 2) {
        let nx = x + dx * dir;
        let ny = y + dy * dir;
        while (
          nx >= 0 && ny >= 0 && nx < boardSize && ny < boardSize &&
          cells[ny][nx].value === color
        ) {
          count++;
          nx += dx * dir;
          ny += dy * dir;
        }
      }
      if (count >= 5) score += 10000;
      else if (count === 4) score += 500;
      else if (count === 3) score += 100;
      else if (count === 2) score += 10;
    }
    return score;
  }

  let bestScore = -Infinity;
  let move = null;

  for (let y = 0; y < boardSize; y++) {
    for (let x = 0; x < boardSize; x++) {
      if (cells[y][x].value === null) {
        const aiScore = scorePosition(x, y, "green");
        const playerScore = scorePosition(x, y, "red") * 1.5;
        const totalScore = aiScore + playerScore;
        if (totalScore > bestScore) {
          bestScore = totalScore;
          move = [x, y];
        }
      }
    }
  }

  return move || [Math.floor(Math.random() * boardSize), Math.floor(Math.random() * boardSize)];
}

function checkWin(x, y, player) {
  const directions = [[1,0],[0,1],[1,1],[1,-1]];
  for (const [dx, dy] of directions) {
    let count = 1;
    for (let dir = -1; dir <= 1; dir += 2) {
      let nx = x + dx * dir;
      let ny = y + dy * dir;
      while (
        nx >= 0 && ny >= 0 && nx < boardSize && ny < boardSize &&
        cells[ny][nx].value === player
      ) {
        count++;
        nx += dx * dir;
        ny += dy * dir;
      }
    }
    if (count >= 5) return true;
  }
  return false;
}

function highlightWinningLine(x, y, player) {
  const directions = [[1,0],[0,1],[1,1],[1,-1]];
  for (const [dx, dy] of directions) {
    let line = [[x, y]];
    for (let dir = -1; dir <= 1; dir += 2) {
      let nx = x + dx * dir;
      let ny = y + dy * dir;
      while (
        nx >= 0 && ny >= 0 && nx < boardSize && ny < boardSize &&
        cells[ny][nx].value === player
      ) {
        line.push([nx, ny]);
        nx += dx * dir;
        ny += dy * dir;
      }
    }
    if (line.length >= 5) {
      line.forEach(([lx, ly]) => {
        cells[ly][lx].element.classList.add("highlight");
      });
      break;
    }
  }
}

function updateScore() {
  scoreDisplay.textContent = `🔴 ${scores.red} - 🟢 ${scores.green}`;
}

function disableBoard() {
  for (let row of cells) {
    for (let cell of row) {
      cell.element.style.pointerEvents = "none";
    }
  }
}

function showEndScreen(winnerText) {
  document.getElementById("endMessage").textContent = winnerText;
  document.getElementById("endScreen").style.display = "block";
}

createBoard();