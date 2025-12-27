import { createClient } from "@/lib/supabase/client"

export const startClassicGame = async (gameType: string) => {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  const gameState = initializeClassicGame(gameType)
  
  if (typeof window !== 'undefined') {
    localStorage.setItem('current_classic_game', JSON.stringify({
      gameType,
      gameState,
      userId: user?.id || `guest_${Date.now()}`,
      startedAt: new Date().toISOString(),
    }))
  }
  
  return gameState
}

export const makeClassicMove = async (gameType: string, move: any) => {
  const gameData = JSON.parse(localStorage.getItem('current_classic_game') || '{}')
  
  if (gameData.gameType !== gameType) {
    throw new Error('Game type mismatch')
  }
  
  const newState = applyClassicMove(gameData.gameState, move, gameType)
  const result = checkClassicGameResult(newState, gameType)
  
  gameData.gameState = newState
  localStorage.setItem('current_classic_game', JSON.stringify(gameData))
  
  if (result.finished) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      await supabase.rpc('update_mastery_on_win', { p_user_id: user.id })
    } else if (typeof window !== 'undefined') {
      const guestProgress = JSON.parse(localStorage.getItem('brain_battle_guest_progress') || '{}')
      if (!guestProgress[gameType]) {
        guestProgress[gameType] = { wins: 0, losses: 0, draws: 0, rating: 1000 }
      }
      guestProgress[gameType].wins += 1
      localStorage.setItem('brain_battle_guest_progress', JSON.stringify(guestProgress))
    }
  }
  
  return { gameState: newState, result }
}

function initializeClassicGame(gameType: string): any {
  const games = {
    'tic-tac-toe': { board: Array(9).fill(null), currentPlayer: 'X' },
    'sudoku': { puzzle: generateSudokuPuzzle(), solution: null },
    'puzzle-15': { tiles: generatePuzzle15() },
    'math-duel': { problems: generateMathProblems(10), currentProblem: 0, score: 0 },
    'flags-quiz': { questions: generateFlagsQuestions(10), currentQuestion: 0, score: 0 },
    'anagrams': { words: generateAnagramWords(10), currentWord: 0, score: 0 },
    'memory': { cards: generateMemoryCards(12), flipped: [], matched: [] },
  }
  
  return games[gameType as keyof typeof games] || { board: Array(9).fill(null), currentPlayer: 'X' }
}

function applyClassicMove(gameState: any, move: any, gameType: string): any {
  switch (gameType) {
    case 'tic-tac-toe':
      const newBoard = [...gameState.board]
      newBoard[move.index] = gameState.currentPlayer
      return {
        board: newBoard,
        currentPlayer: gameState.currentPlayer === 'X' ? 'O' : 'X'
      }
    case 'memory':
      return {
        ...gameState,
        flipped: [...gameState.flipped, move.index],
        matched: move.matched ? [...gameState.matched, move.card] : gameState.matched
      }
    default:
      return { ...gameState, ...move }
  }
}

function checkClassicGameResult(gameState: any, gameType: string): { finished: boolean; winner: boolean } {
  switch (gameType) {
    case 'tic-tac-toe':
      const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
      ]
      for (const [a, b, c] of lines) {
        if (gameState.board[a] && 
            gameState.board[a] === gameState.board[b] && 
            gameState.board[a] === gameState.board[c]) {
          return { finished: true, winner: true }
        }
      }
      if (gameState.board.every(cell => cell !== null)) {
        return { finished: true, winner: false }
      }
      return { finished: false, winner: false }
    case 'memory':
      if (gameState.matched.length === gameState.cards.length / 2) {
        return { finished: true, winner: true }
      }
      return { finished: false, winner: false }
    default:
      return { finished: false, winner: false }
  }
}

function generateSudokuPuzzle() {
  return Array(9).fill(null).map(() => Array(9).fill(0))
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

function generateMathProblems(count: number) {
  const problems = []
  for (let i = 0; i < count; i++) {
    const a = Math.floor(Math.random() * 20) + 1
    const b = Math.floor(Math.random() * 20) + 1
    const ops = ['+', '-', '*']
    const op = ops[Math.floor(Math.random() * ops.length)]
    let answer
    switch (op) {
      case '+': answer = a + b; break
      case '-': answer = a - b; break
      case '*': answer = a * b; break
      default: answer = a + b
    }
    problems.push({ a, b, op, answer, question: `${a} ${op} ${b} = ?` })
  }
  return problems
}

function generateFlagsQuestions(count: number) {
  const countries = [
    { code: 'RU', name: 'Россия' },
    { code: 'US', name: 'США' },
    { code: 'GB', name: 'Великобритания' },
    { code: 'FR', name: 'Франция' },
    { code: 'DE', name: 'Германия' },
    { code: 'JP', name: 'Япония' },
  ]
  const shuffled = [...countries].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count).map(c => ({
    countryCode: c.code,
    correctAnswer: c.name,
    options: getRandomOptions(c.name, countries.map(x => x.name)),
  }))
}

function getRandomOptions(correct: string, all: string[]) {
  const others = all.filter(x => x !== correct).sort(() => Math.random() - 0.5).slice(0, 3)
  return [correct, ...others].sort(() => Math.random() - 0.5)
}

function generateAnagramWords(count: number) {
  const words = ['ПРОГРАММА', 'КОМПЬЮТЕР', 'ИНТЕРНЕТ', 'ТЕЛЕФОН', 'МОНИТОР']
  return words.slice(0, count).map(word => ({
    original: word,
    scrambled: word.split('').sort(() => Math.random() - 0.5).join('')
  }))
}

function generateMemoryCards(count: number) {
  const symbols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
  const cards = []
  for (let i = 0; i < count / 2; i++) {
    const symbol = symbols[i % symbols.length]
    cards.push({ id: i * 2, symbol, flipped: false })
    cards.push({ id: i * 2 + 1, symbol, flipped: false })
  }
  return cards.sort(() => Math.random() - 0.5)
}
