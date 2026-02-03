"use client";

import { createContext, useContext, useEffect, useState } from "react";

const WebSocketContext = createContext({ online: 0 });

export function WebSocketProvider({ children }) {
  const [online, setOnline] = useState(0);

  useEffect(() => {
    const auth = JSON.parse(localStorage.getItem("auth"));
    const token = auth?.token;
    if (!token) return;

    const ws = new WebSocket(`ws://localhost:3001?token=${token}`);

    ws.onmessage = event => {
      const data = JSON.parse(event.data);
      if (data.type === "ONLINE_USERS") {
        setOnline(data.count);
      }
    };

    return () => ws.close();
  }, []);

  return (
    <WebSocketContext.Provider value={{ online }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useOnlineUsers() {
  return useContext(WebSocketContext);
}