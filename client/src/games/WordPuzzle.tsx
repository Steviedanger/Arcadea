import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';

interface WordPuzzleProps {
  socket: Socket;
  room: string;
  username: string;
  onBack: () => void;
}

// A simple list of tech/campus-themed or general 5-letter words
const PUZZLE_WORDS = [
  { word: "REACT", hint: "A popular frontend JavaScript library" },
  { word: "HOSTEL", hint: "Where KNUST students live and chill" },
  { word: "CODING", hint: "Writing instructions for computers" },
  { word: "SERVER", hint: "Handles backend requests and Socket.io" },
  { word: "PYTHON", hint: "A popular backend programming language" }
];

export default function WordPuzzle({ socket, room, username, onBack }: WordPuzzleProps) {
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [guess, setGuess] = useState('');
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState('');
  const [gameOver, setGameOver] = useState(false);

  const currentPuzzle = PUZZLE_WORDS[currentPuzzleIndex];

  const handleGuessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (guess.trim().toUpperCase() === currentPuzzle.word) {
      const newScore = score + 10;
      setScore(newScore);
      setMessage('🎉 Correct! Great job.');
      
      // Submit score to backend server via Socket.io
      socket.emit('submit_score', { room, score: newScore, gameType: 'Word Puzzle' });

      setTimeout(() => {
        setMessage('');
        setGuess('');
        if (currentPuzzleIndex + 1 < PUZZLE_WORDS.length) {
          setCurrentPuzzleIndex(currentPuzzleIndex + 1);
        } else {
          setGameOver(true);
        }
      }, 1500);
    } else {
      setMessage('❌ Incorrect word, try again!');
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl text-white">
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-black text-cyan-400">🧠 Word Puzzle Arena</h2>
          <p className="text-slate-400 text-sm">Crack the code and solve the word.</p>
        </div>
        <button
          onClick={onBack}
          className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg text-xs font-semibold transition-all"
        >
          ← Back to Lobby
        </button>
      </div>

      {!gameOver ? (
        <div>
          <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 mb-6 text-center">
            <span className="text-xs uppercase tracking-widest text-cyan-500 font-bold">Hint</span>
            <p className="text-lg font-medium mt-1 text-slate-200">{currentPuzzle.hint}</p>
            <div className="mt-4 text-xs text-slate-500">
              Word Length: {currentPuzzle.word.length} letters | Score: <span className="text-cyan-400 font-bold">{score}</span>
            </div>
          </div>

          <form onSubmit={handleGuessSubmit} className="space-y-4">
            <input
              type="text"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder="Type your guess..."
              maxLength={currentPuzzle.word.length}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-center text-xl tracking-widest uppercase text-white focus:outline-none focus:border-cyan-500 font-bold"
              required
            />
            <button
              type="submit"
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-cyan-600/20"
            >
              Submit Answer
            </button>
          </form>

          {message && (
            <p className={`mt-4 text-center font-semibold text-sm ${message.includes('🎉') ? 'text-green-400' : 'text-red-400'}`}>
              {message}
            </p>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <h3 className="text-3xl font-extrabold text-cyan-400 mb-2">Puzzle Completed! 🏆</h3>
          <p className="text-slate-400 mb-6">You finished all the word challenges with a total score of <span className="text-white font-bold">{score}</span> points.</p>
          <button
            onClick={() => {
              setCurrentPuzzleIndex(0);
              setScore(0);
              setGameOver(false);
            }}
            className="bg-cyan-600 hover:bg-cyan-500 px-6 py-3 rounded-lg font-bold transition-all"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}