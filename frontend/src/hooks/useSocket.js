import { useState, useEffect, useCallback } from 'react';

export const useSocket = (roomId) => {
    const [socket, setSocket] = useState(null);
    const [calledNumbers, setCalledNumbers] = useState([]);
    const [winnerData, setWinnerData] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // WebSocket connection string (Backend URL)
        const wsPath = `ws://localhost:8000/ws/game/${roomId}/`;
        const ws = new WebSocket(wsPath);

        ws.onopen = () => {
            console.log("Connected to Tambola Server");
            setIsConnected(true);
        };

        ws.onmessage = (e) => {
            const data = JSON.parse(e.data);
            
            // Backend nundi vacche message type ni batti state update chesthundhi
            switch (data.type) {
                case 'NEW_NUMBER':
                    setCalledNumbers((prev) => [...prev, data.number]);
                    break;
                
                case 'CHAT_MESSAGE':
                    // Winner announcements ikkade vasthayi
                    if (data.message.includes("claimed")) {
                        setWinnerData({
                            name: data.user,
                            message: data.message
                        });
                    }
                    break;

                default:
                    break;
            }
        };

        ws.onclose = () => {
            console.log("Disconnected from Server");
            setIsConnected(false);
        };

        setSocket(ws);

        // Component unmount ayinappudu connection close chesthundhi
        return () => ws.close();
    }, [roomId]);

    // Game start cheyyadaniki helper function
    const startGame = useCallback(() => {
        if (socket) {
            socket.send(json.stringify({ 'action': 'START_GAME' }));
        }
    }, [socket]);

    return { socket, calledNumbers, winnerData, isConnected, startGame, setWinnerData };
};