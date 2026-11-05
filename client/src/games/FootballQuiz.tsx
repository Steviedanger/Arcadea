import React, { useState } from 'react';
import { Socket } from 'socket.io-client';

interface FootballQuizProps {
  socket: Socket;
  room: string;
  username: string;
  onBack: () => void;
}

const FOOTBALL_QUESTIONS = [
  {
    question: "Which club won the UEFA Champions League in the 2022/23 season?",
    options: ["Real Madrid", "Manchester City", "Inter Milan", "Bayern Munich"],
    answer: "Manchester City"
  },
  {
    question: "Who holds the record for the most goals scored in a single UEFA Champions League season?",
    options: ["Lionel Messi", "Robert Lewandowski", "Cristiano Ronaldo", "Karim Benzema"],
    answer: "Cristiano Ronaldo"
  },
  {
    question: "Which African country reached the semi-finals of the 2022 FIFA World Cup?",
    options: ["Senegal", "Cameroon", "Ghana", "Morocco"],
    answer: "Morocco"
  },
  {
    question: "What is the record transfer fee paid for a football player (as of recent history)?",
    options: ["Neymar Jr", "Kylian Mbappé", "Philippe Coutinho", "Erling Haaland"],
    answer: "Neymar Jr"
  }
];

export default function FootballQuiz({ socket, room, username, onBack }: FootballQuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [gameOver, setGameOver] = useState(false);

  const currentQ = FOOTBALL_QUESTIONS[currentQuestionIndex];

  const handleOptionClick = (option: string) => {
    if (selectedOption !== null) return; // Prevent multiple clicks per question

    setSelectedOption(option);
    const correct = option === currentQ.answer;
    setIsCorrect(correct);

    let updatedScore = score;
    if (correct) {
      updatedScore = score + 15;
      setScore(updatedScore);
    }

    // Submit live score to backend server via Socket.io
    socket.emit('submit_score', { room, score: updatedScore, gameType: 'Football Arena' });

    setTimeout(() => {
      setSelectedOption(null);
      setIsCorrect(null);
      if (currentQuestionIndex + 1 < FOOTBALL_QUESTIONS.length) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        setGameOver(true);
      }
    }, 1500);
  };

  return (
    <div className="max-w-xl mx-auto bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl text-white">
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-black text-blue-400">⚽ Football Arena Quiz</h2>
          <p className="text-slate-400 text-sm">Test your elite football IQ.</p>
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
          <div className="flex justify-between text-xs text-slate-400 mb-4 font-semibold uppercase tracking-wider">
            <span>Question {currentQuestionIndex + 1} of {FOOTBALL_QUESTIONS.length}</span>
            <span>Score: <span className="text-blue-400 font-bold">{score}</span></span>
          </div>

          <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 mb-6 text-center">
            <p className="text-lg font-bold text-slate-100">{currentQ.question}</p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {currentQ.options.map((option, index) => {
              let btnStyle = "bg-slate-950 border-slate-800 hover:border-blue-500 text-slate-200";
              if (selectedOption !== null) {
                if (option === currentQ.answer) {
                  btnStyle = "bg-green-950 border-green-500 text-green-300 font-bold";
                } else if (option === selectedOption) {
                  btnStyle = "bg-red-950 border-red-500 text-red-300";
                }
              }

              return (
                <button
                  key={index}
                  onClick={() => handleOptionClick(option)}
                  disabled={selectedOption !== null}
                  className={`w-full border p-4 rounded-xl text-left transition-all font-medium ${btnStyle}`}
                >
                  {option}
                </button>
              );
            })}
          </div>

          {selectedOption !== null && (
            <p className={`mt-4 text-center font-semibold text-sm ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
              {isCorrect ? '🎉 Correct Answer!' : `❌ Incorrect! The correct answer was: ${currentQ.answer}`}
            </p>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <h3 className="text-3xl font-extrabold text-blue-400 mb-2">Quiz Finished! 🏆</h3>
          <p className="text-slate-400 mb-6">You dominated the pitch with a total score of <span className="text-white font-bold">{score}</span> points.</p>
          <button
            onClick={() => {
              setCurrentQuestionIndex(0);
              setScore(0);
              setGameOver(false);
            }}
            className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-lg font-bold transition-all"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}