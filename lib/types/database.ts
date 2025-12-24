export type { Json } from "./database-json"
export type {
  UsersTable,
  UserDevicesTable,
  UserPurchasesTable,
  UserGameProgressTable,
  MasteryTable,
  GloryTable,
} from "./database-tables"
export type {
  GamesTable,
  MatchesTable,
  MatchParticipantsTable,
  MatchmakingQueueTable,
  UserGameStatsTable,
} from "./database-game-types"

export interface Database {
  public: {
    Tables: {
      users: import("./database-tables").UsersTable
      user_devices: import("./database-tables").UserDevicesTable
      user_purchases: import("./database-tables").UserPurchasesTable
      user_game_progress: import("./database-tables").UserGameProgressTable
      mastery: import("./database-tables").MasteryTable
      glory: import("./database-tables").GloryTable
      games: import("./database-game-types").GamesTable
      matches: import("./database-game-types").MatchesTable
      match_participants: import("./database-game-types").MatchParticipantsTable
      matchmaking_queue: import("./database-game-types").MatchmakingQueueTable
      user_game_stats: import("./database-game-types").UserGameStatsTable
    }
    Functions: {
      update_mastery_on_win: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      update_glory_on_win: {
        Args: { p_user_id: string }
        Returns: undefined
      }
    }
  }
}
