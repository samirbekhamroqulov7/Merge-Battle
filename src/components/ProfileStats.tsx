import React from "react";
import { motion } from "framer-motion";
import { Trophy, Target, Star, TrendingUp } from "lucide-react";
import { ProfileData } from "../hooks/useProfile";

interface ProfileStatsProps {
  profile: ProfileData | null;
}

export function ProfileStats({ profile }: ProfileStatsProps) {
  const stats = [
    { label: "Games Played", value: profile?.games?.toString() || "0", icon: <Trophy size={20} /> },
    { label: "Win Rate", value: `${profile?.winRate || 0}%`, icon: <Target size={20} /> },
    { label: "Best Score", value: profile?.bestScore?.toString() || "0", icon: <Star size={20} /> },
    { label: "Wins", value: profile?.wins?.toString() || "0", icon: <TrendingUp size={20} /> },
  ];

  return (
    <div className="grid grid-cols-4 gap-3">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 * index }}
          className="text-center"
        >
          <div className="flex justify-center text-[#00FFFF] mb-1">
            {stat.icon}
          </div>
          <div className="text-lg font-bold text-white">{stat.value}</div>
          <div className="text-xs text-[#B8B8B8]">{stat.label}</div>
        </motion.div>
      ))}
    </div>
  );
}