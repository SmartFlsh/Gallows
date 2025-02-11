"use client";

import { io } from "socket.io-client";

const socked = io("http://localhost:3000", { autoConnect: false });

export const connectSocket = () => {
    if (!socked.connected) {
        socked.connect(); // Подключаемся
        console.log("socket подключен:", socked.id);
    }
};

export const getSocket = () => socked;