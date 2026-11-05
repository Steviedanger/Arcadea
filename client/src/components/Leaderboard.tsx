import React, { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { Trophy, Medal, Award } from 'lucide-react';

interface LeaderboardProps {
  socket: Socket;
}

interface ScoreEntry {
  username: string;
  room: string;
  score: number;
  gameType: string;
}

export default function Leaderboard({ socket }: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<ScoreEntry[]>([]);

  useEffect(() => {
    // Listen for live score updates from backend
    socket.on('leaderboard_update', (data: ScoreEntry) => {
      setLeaderboard((prev) => {
        // Check if player already exists in the list
        const existingIndex = prev.findIndex((item) => item.username === data.username);
        if (existingIndex > -1) {
          // Update score if higher
          const updated = [...prev];
          if (data.score > updated[existingIndex].score) {
            updated[existingIndex].score = data.score;
          }
          return updated.sort((a, b) => b.score - a.score);
        } else {
          // Add new player and sort by score descending
          return [...prev, data].sort((a, b) => b.score - a.score);
        }
      });
    });

    return () => {
      socket.off('leaderboard_update');
    };
  }, [socket]);

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl text-white">
      <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
        <Trophy className="w-5 h-5 text-yellow-400" />
        <h2 className="text-lg font-bold">Hostel Leaderboard</h2>
      </div>

      {leaderboard.length === 0 ? (
        <p className="text-slate-500 text-sm py-4 text-center">No scores recorded yet. Be the first to play!</p>
      ) : (
        <div className="space-y-3">
          {leaderboard.map((entry, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-slate-950 border border-slate-800/80 p-3 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <span className="font-bold text-sm w-6 text-center text-slate-400">
                  {index === 0 ? <Medal className="w-5 h-5 text-yellow-400 inline" /> : index === 1 ? <Medal className="w-5 h-5 text-slate-300 inline" /> : index === 2 ? <Medal className="w-5 h-5 text-amber-600 inline`" /> : `#${index + 1}`}
                </span>
                <div>
                  <p className="font-semibold text-sm text-slate-200">{entry.username}</p>
                  <p className="text-xs text-slate-400">{entry.room} • <span className="text-cyan-400">{entry.gameType}</span></p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-black text-cyan-400 text-lg">{entry.score}</span>
                <span className="text-xs text-slate-500 block">pts</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}