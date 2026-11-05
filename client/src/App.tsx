import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import WordPuzzle from './games/WordPuzzle';
import FootballQuiz from './games/FootballQuiz';
import Leaderboard from './components/Leaderboard';

const backendUrl = (import.meta as any).env.VITE_BACKEND_URL || 'http://localhost:4000';
const socket: Socket = io('backendUrl');

export default function App() {
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('');
  const [joined, setJoined] = useState(false);
  const [activeGame, setActiveGame] = useState<'menu' | 'word' | 'football'>('menu');

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !room) return;
    socket.emit('join_game', { username, room });
    setJoined(true);
  };

  // 1. Show login screen if player hasn't joined yet
  if (!joined) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white px-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl">
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">
            ARCADEA
          </h1>
          <p className="text-slate-400 text-sm mb-6">Enter your details to join the hostel arcade lobby.</p>
          
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Your Name / Nickname</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. Steviedanger"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Room / Floor</label>
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="e.g. Block C, Room 14"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 rounded-lg hover:opacity-95 transition-all shadow-lg shadow-cyan-500/20"
            >
              Enter Arcade 🚀
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <header className="max-w-5xl mx-auto flex justify-between items-center border-b border-slate-800 pb-4 mb-8">
        <h1 className="text-2xl font-black text-cyan-400 tracking-wider">ARCADEA</h1>
        <div className="text-sm bg-slate-900 border border-slate-800 px-4 py-2 rounded-full">
          Player: <span className="text-cyan-400 font-bold">{username}</span> | Room: <span className="text-blue-400 font-bold">{room}</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto">
        {/* 2. Render Word Puzzle Game Component */}
        {activeGame === 'word' && (
          <WordPuzzle socket={socket} room={room} username={username} onBack={() => setActiveGame('menu')} />
        )}

        {/* 3. Render Football Quiz Game Component */}
        {activeGame === 'football' && (
          <FootballQuiz socket={socket} room={room} username={username} onBack={() => setActiveGame('menu')} />
        )}

        {/* 4. Main Menu Lobby with Live Leaderboard */}
        {activeGame === 'menu' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Game Arenas */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <h2 className="text-lg font-bold mb-2">⚽ Football Arena</h2>
                <p className="text-slate-400 text-sm mb-4">Test your football trivia and player guessing skills.</p>
                <button
                  onClick={() => setActiveGame('football')}
                  className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                >
                  Play Football Quiz
                </button>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <h2 className="text-lg font-bold mb-2">🧠 Word & Puzzle Zone</h2>
                <p className="text-slate-400 text-sm mb-4">Solve daily word puzzles and brain teasers.</p>
                <button
                  onClick={() => setActiveGame('word')}
                  className="bg-cyan-600 hover:bg-cyan-500 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                >
                  Play Word Puzzle
                </button>
              </div>
            </div>

            {/* Right Column: Real-Time Leaderboard */}
            <div>
              <Leaderboard socket={socket} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}