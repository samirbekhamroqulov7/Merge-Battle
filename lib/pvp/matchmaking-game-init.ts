export function initializeGameState(gameType: string): any {
  switch (gameType) {
    case "tic-tac-toe":
      return { board: Array(9).fill(null), currentPlayer: "X" }
    case "chess":
      return { fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1" }
    case "checkers":
      return initializeCheckersBoard()
    case "sudoku":
      return { puzzle: generateSudokuPuzzle(), solution: null }
    case "puzzle-15":
      return { tiles: generatePuzzle15() }
    case "dots":
      return { horizontalLines: [], verticalLines: [], boxes: [], scores: { p1: 0, p2: 0 } }
    case "math-duel":
      return { problems: generateMathProblems(10), currentProblem: 0, scores: { p1: 0, p2: 0 } }
    case "flags-quiz":
      return { questions: generateFlagsQuestions(10), currentQuestion: 0, scores: { p1: 0, p2: 0 } }
    case "anagrams":
      return { words: generateAnagramWords(10), currentWord: 0, scores: { p1: 0, p2: 0 } }
    case "crossword":
      return { grid: generateCrosswordGrid(), clues: [], scores: { p1: 0, p2: 0 } }
    default:
      return {}
  }
}

function initializeCheckersBoard() {
  const board = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null))
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 === 1) board[row][col] = "black"
    }
  }
  for (let row = 5; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 === 1) board[row][col] = "white"
    }
  }
  return { board, currentPlayer: "white" }
}

function generateSudokuPuzzle() {
  return Array(9)
    .fill(null)
    .map(() => Array(9).fill(0))
}

function generatePuzzle15() {
  const tiles = Array.from({ length: 15 }, (_, i) => i + 1)
  tiles.push(0)
  for (let i = tiles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[tiles[i], tiles[j]] = [tiles[j], tiles[i]]
  }
  return tiles
}

export function generateMathProblems(count: number) {
  const problems = []
  for (let i = 0; i < count; i++) {
    const a = Math.floor(Math.random() * 20) + 1
    const b = Math.floor(Math.random() * 20) + 1
    const ops = ["+", "-", "*"]
    const op = ops[Math.floor(Math.random() * ops.length)]
    let answer: number
    switch (op) {
      case "+":
        answer = a + b
        break
      case "-":
        answer = a - b
        break
      case "*":
        answer = a * b
        break
      default:
        answer = a + b
    }
    problems.push({ a, b, op, answer, question: `${a} ${op} ${b} = ?` })
  }
  return problems
}

export function generateFlagsQuestions(count: number) {
  const countries = [
    { code: "RU", name: "Россия" },
    { code: "US", name: "США" },
    { code: "GB", name: "Великобритания" },
    { code: "FR", name: "Франция" },
    { code: "DE", name: "Германия" },
    { code: "JP", name: "Япония" },
    { code: "CN", name: "Китай" },
    { code: "BR", name: "Бразилия" },
    { code: "IN", name: "Индия" },
    { code: "IT", name: "Италия" },
    { code: "ES", name: "Испания" },
    { code: "KR", name: "Южная Корея" },
    { code: "CA", name: "Канада" },
    { code: "AU", name: "Австралия" },
    { code: "MX", name: "Мексика" },
    { code: "NL", name: "Нидерланды" },
  ]
  const shuffled = [...countries].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count).map((c) => ({
    countryCode: c.code,
    correctAnswer: c.name,
    options: getRandomOptions(
      c.name,
      countries.map((x) => x.name),
    ),
  }))
}

function getRandomOptions(correct: string, all: string[]) {
  const others = all
    .filter((x) => x !== correct)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
  const options = [correct, ...others].sort(() => Math.random() - 0.5)
  return options
}

export function generateAnagramWords(count: number) {
  const words = [
    "ПРОГРАММА",
    "КОМПЬЮТЕР",
    "ИНТЕРНЕТ",
    "ТЕЛЕФОН",
    "МОНИТОР",
    "КЛАВИША",
    "МЫШКА",
    "ПРИНТЕР",
    "СКАНЕР",
    "КОЛОНКИ",
  ]
  return words.slice(0, count).map((word) => ({
    original: word,
    scrambled: word
      .split("")
      .sort(() => Math.random() - 0.5)
      .join(""),
  }))
}

function generateCrosswordGrid() {
  return Array(10)
    .fill(null)
    .map(() => Array(10).fill(""))
}
