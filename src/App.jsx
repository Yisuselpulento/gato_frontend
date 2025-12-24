import { useEffect, useState } from "react";
import socket from "./socket";

export default function App() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [turn, setTurn] = useState("O");
  const [symbol, setSymbol] = useState(null);
  const [gameEnded, setGameEnded] = useState(false);
  const [result, setResult] = useState(null);

  const [chat, setChat] = useState([]);
  const [msg, setMsg] = useState("");

   const isMyTurn = symbol === turn && !gameEnded;

  useEffect(() => {
    socket.on("playerData", ({ symbol }) => {
      setSymbol(symbol);
    });

    socket.on("gameState", ({ board, turn, gameEnded }) => {
      setBoard(board);
      setTurn(turn);
      setGameEnded(gameEnded);
    });

    socket.on("gameOver", ({ winner, board }) => {
      setBoard(board);
      setGameEnded(true);

      if (winner === "draw") setResult("draw");
      else if (winner === symbol) setResult("win");
      else setResult("lose");
    });

    socket.on("gameReset", () => {
      setBoard(Array(9).fill(null));
      setGameEnded(false);
      setResult(null);
    });

    socket.on("chat", (msg) => {
      setChat(prev => [...prev, msg]);
    });

    return () => {
      socket.off();
    };
  }, [symbol]);




  const play = (i) => {
    if (!isMyTurn) return;
    socket.emit("play", i);
  };

  const sendMsg = () => {
    if (!msg.trim()) return;
    socket.emit("chat", `${symbol}: ${msg}`);
    setMsg("");
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center gap-6 p-4">

      <h1 className="text-3xl font-bold">Tic Tac Toe</h1>

      <p>Tu símbolo: <b>{symbol ?? "?"}</b></p>
      {!gameEnded && <p>Turno: {turn}</p>}

      <div className="grid grid-cols-3 gap-3">
        {board.map((cell, i) => (
         <button
          key={i}
          onClick={() => play(i)}
          disabled={cell || !isMyTurn}
          className={`w-24 h-24 bg-slate-800 rounded-xl text-5xl font-bold ${
            cell === "O" ? "text-blue-400" : cell === "X" ? "text-red-500" : "text-white"
          }`}
        >
          {cell}
        </button>
        ))}
      </div>

      {result && (
        <div className="text-center space-y-2">
          {result === "win" && <p className="text-green-400">Ganaste 🎉</p>}
          {result === "lose" && <p className="text-red-400">Perdiste ❌</p>}
          {result === "draw" && <p className="text-yellow-400">Empate 🤝</p>}
          <button onClick={() => socket.emit("rematch")} className="bg-green-500 px-4 py-2 rounded-xl">
            Revancha
          </button>
        </div>
      )}

      <div className="w-full max-w-md bg-slate-800 rounded-xl p-3">
        <div className="h-32 overflow-y-auto bg-slate-900 p-2 rounded">
          {chat.map((m, i) => <div key={i}>{m}</div>)}
        </div>

        <div className="flex gap-2 mt-2">
          <input
            value={msg}
            onChange={e => setMsg(e.target.value)}
            className="flex-1 bg-slate-700 px-3 py-2 rounded"
            placeholder="Mensaje..."
          />
          <button onClick={sendMsg} className="bg-blue-500 px-4 rounded">
            Enviar
          </button>
        </div>
      </div>

    </div>
  );
}
