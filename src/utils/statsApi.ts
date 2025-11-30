// src/utils/statsApi.ts
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { runTransaction, serverTimestamp } from "firebase/firestore";

/**
 * recordGameResult(uid, isWin, score)
 * Updates wins/games/bestScore/winRate atomically
 */
export async function recordGameResult(uid: string, isWin: boolean, score: number) {
  if (!uid) throw new Error("No uid");
  const ref = doc(db, "users", uid);

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    let wins = 0, games = 0, bestScore = 0;
    if (snap.exists()) {
      const d = snap.data() as any;
      wins = d.wins ?? 0;
      games = d.games ?? 0;
      bestScore = d.bestScore ?? 0;
    }
    const newWins = wins + (isWin ? 1 : 0);
    const newGames = games + 1;
    const newBest = Math.max(bestScore, score);
    const newWinRate = newGames > 0 ? Math.round((newWins / newGames) * 100) : 0;

    tx.set(ref, {
      wins: newWins,
      games: newGames,
      bestScore: newBest,
      winRate: newWinRate,
      updatedAt: serverTimestamp()
    }, { merge: true });
  });
}
