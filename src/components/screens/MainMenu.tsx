import { motion } from "framer-motion";
import { NeonButton } from "../NeonButton";
import { IconButton } from "../IconButton";
import { CoinBadge } from "../CoinBadge";
import { Play, Swords, Trophy, Settings, User, HelpCircle } from "lucide-react";

interface MainMenuProps {
  onNavigate: (screen: string) => void;
  coins: number;
  onTutorialClick?: () => void;
}

export function MainMenu({ onNavigate, coins, onTutorialClick }: MainMenuProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <IconButton
          icon={<User size={24} />}
          onClick={() => onNavigate("profile")}
        />
        <CoinBadge amount={coins} />
        <IconButton
          icon={<Settings size={24} />}
          onClick={() => onNavigate("settings")}
        />
      </div>

      {/* Logo */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center mt-16 mb-12"
      >
        <motion.h1
          className="text-5xl font-bold mb-2"
          animate={{
            textShadow: [
              "0 0 20px rgba(0,255,255,0.5)",
              "0 0 40px rgba(0,255,255,0.8)",
              "0 0 20px rgba(0,255,255,0.5)",
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="bg-gradient-to-r from-[#00FFFF] via-[#A100FF] to-[#FF00FF] bg-clip-text text-transparent">
            MERGE BATTLE
          </span>
        </motion.h1>
        <p className="text-[#B8B8B8]">Neon Glow Edition</p>
      </motion.div>

      {/* Main Buttons */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 gap-4 pb-20">
        
        {/* Play */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full max-w-sm"
        >
          <NeonButton
            onClick={() => onNavigate("game")}
            className="w-full flex items-center justify-center gap-3"
          >
            <Play size={24} />
            <span className="text-xl">PLAY</span>
          </NeonButton>
        </motion.div>

        {/* PvP */}
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="w-full max-w-sm"
        >
          <NeonButton
            variant="secondary"
            onClick={() => onNavigate("pvp")}
            className="w-full flex items-center justify-center gap-3"
          >
            <Swords size={24} />
            <span className="text-xl">PVP BATTLE</span>
          </NeonButton>
        </motion.div>

        {/* Leaderboard */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="w-full max-w-sm"
        >
          <NeonButton
            variant="ghost"
            onClick={() => onNavigate("leaderboard")}
            className="w-full flex items-center justify-center gap-3"
          >
            <Trophy size={24} />
            <span className="text-xl">LEADERBOARD</span>
          </NeonButton>
        </motion.div>

      </div>

      {/* Footer */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="pb-8"
      >
        {onTutorialClick && (
          <button
            onClick={onTutorialClick}
            className="mx-auto mb-4 flex items-center gap-2 text-[#00FFFF] hover:text-[#00FF99] transition-colors"
          >
            <HelpCircle size={18} />
            <span className="text-sm">How to Play</span>
          </button>
        )}

        <p className="text-center text-sm text-[#6B6B6B]">
          Version 1.0.0 • © 2025 Merge Battle
        </p>
      </motion.div>
    </div>
  );
}
