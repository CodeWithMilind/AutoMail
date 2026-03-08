import { useEffect, useState, useCallback } from "react";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws";

export function useWebSocket() {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [lastMessage, setLastMessage] = useState<any>(null);

    useEffect(() => {
        const ws = new WebSocket(WS_URL);
        
        ws.onopen = () => {
            console.log("WebSocket connected");
        };
        
        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                setLastMessage(data);
            } catch (err) {
                console.error("WebSocket message parse error", err);
            }
        };
        
        ws.onclose = () => {
            console.log("WebSocket disconnected. Reconnecting...");
            setTimeout(() => {
                setSocket(new WebSocket(WS_URL));
            }, 5000);
        };
        
        setSocket(ws);
        
        return () => {
            ws.close();
        };
    }, []);

    const sendMessage = useCallback((message: any) => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(message));
        }
    }, [socket]);

    return { lastMessage, sendMessage };
}
