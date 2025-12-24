import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

console.log("Socket URL:", SOCKET_URL);

const socket = io(SOCKET_URL);

export default socket;
