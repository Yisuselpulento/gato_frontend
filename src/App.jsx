import { useEffect, useState } from "react";
import socket from "./socket";

export default function App() {
  const [board, setBoard] = useState(() => Array(9).fill(null));
  const [turn, setTurn] = useState("O");
  const [symbol, setSymbol] = useState("");
  const [chat, setChat] = useState([]);
  const [msg, setMsg] = useState("");
  const [result, setResult] = useState(null);
  const [gameEnded, setGameEnded] = useState(false);

  /* =======================
     SOCKET EVENTS
  ======================= */
  useEffect(() => {
    const onPlayerData = ({ symbol }) => {
      setSymbol(symbol);
    };

    const onGameState = ({ board, turn }) => {
      if (Array.isArray(board)) setBoard(board);
      setTurn(turn);
    };

    const onChat = (msg) => {
      setChat(c => [...c, msg]);
    };

    const onGameOver = ({ winner, board }) => {
      if (Array.isArray(board)) setBoard(board);
      setGameEnded(true);

      if (winner === "draw") setResult("draw");
      else if (winner === symbol) setResult("win");
      else setResult("lose");
    };

    const onGameReset = () => {
      setBoard(Array(9).fill(null));
      setTurn("O");
      setResult(null);
      setGameEnded(false);
      setChat([]);
    };

    socket.on("playerData", onPlayerData);
    socket.on("gameState", onGameState);
    socket.on("chat", onChat);
    socket.on("gameOver", onGameOver);
    socket.on("gameReset", onGameReset);
    socket.on("roomFull", () => alert("Sala llena"));

    return () => {
      socket.off("playerData", onPlayerData);
      socket.off("gameState", onGameState);
      socket.off("chat", onChat);
      socket.off("gameOver", onGameOver);
      socket.off("gameReset", onGameReset);
      socket.off("roomFull");
    };
  }, [symbol]);

  /* =======================
     ACTIONS
  ======================= */
  const play = (i) => {
    if (gameEnded) return;
    if (turn !== symbol) return;
    socket.emit("play", i);
  };

  const sendMsg = () => {
    if (!msg.trim()) return;
    socket.emit("chat", `${symbol}: ${msg}`);
    setMsg("");
  };

  const rematch = () => socket.emit("rematch");

  /* =======================
     UI
  ======================= */
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center p-4 gap-6">

      <h1 className="text-3xl font-bold">Tic Tac Toe</h1>

      <p>
        Tú eres{" "}
        <span className={symbol === "O" ? "text-blue-400" : "text-red-400"}>
          {symbol || "?"}
        </span>
      </p>

      {!gameEnded && (
        <p>
          Turno:{" "}
          <span className={turn === "O" ? "text-blue-400" : "text-red-400"}>
            {turn}
          </span>
        </p>
      )}

      {/* TABLERO */}
      <div className="grid grid-cols-3 gap-3">
        {board.map((cell, i) => (
          <button
            key={i}
            onClick={() => play(i)}
            disabled={cell || turn !== symbol || gameEnded}
            className={`
              w-24 h-24 flex items-center justify-center
              text-5xl font-bold rounded-xl
              ${cell === "O" ? "text-blue-400" : cell === "X" ? "text-red-400" : ""}
              ${cell ? "bg-slate-700" : "bg-slate-800 hover:bg-slate-700"}
            `}
          >
            {cell}
          </button>
        ))}
      </div>

      {/* RESULTADO */}
      {result && (
        <div className="text-center space-y-2">
          {result === "win" && <p className="text-green-400 text-2xl">🎉 Ganaste</p>}
          {result === "lose" && <p className="text-red-400 text-2xl">❌ Perdiste</p>}
          {result === "draw" && <p className="text-yellow-400 text-2xl">🤝 Empate</p>}
          <button
            onClick={rematch}
            className="bg-green-500 px-6 py-2 rounded-xl"
          >
            🔁 Revancha
          </button>
        </div>
      )}

      {/* CHAT */}
      <div className="w-full max-w-md bg-slate-800 rounded-xl p-4 flex flex-col gap-3">
        <div className="flex-1 overflow-y-auto bg-slate-900 p-2 rounded-lg text-sm">
          {chat.map((m, i) => (
            <div key={i}>{m}</div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            value={msg}
            onChange={e => setMsg(e.target.value)}
            className="flex-1 bg-slate-700 rounded-lg px-3 py-2"
            placeholder="Mensaje..."
          />
          <button onClick={sendMsg} className="bg-blue-500 px-4 rounded-lg">
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}
