import { useState, useEffect, useCallback } from 'react';

export const useSocket = (roomId) => {
    const [socket, setSocket] = useState(null);
    const [calledNumbers, setCalledNumbers] = useState([]);
    const [winnerData, setWinnerData] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [currentNumber, setCurrentNumber] = useState('--');

    useEffect(() => {
        if (!roomId) return;

        // Render Backend URL (Secure WebSocket)
        const wsPath = `wss://tambola-s8hq.onrender.com/ws/game/${roomId}/`;
        const ws = new WebSocket(wsPath);

        ws.onopen = () => {
            console.log("Connected to Tambola Server");
            setIsConnected(true);
        };

        ws.onmessage = (e) => {
            const data = JSON.parse(e.data);
            
            switch (data.type) {
                case 'NEW_NUMBER':
                    setCurrentNumber(data.number);
                    setCalledNumbers((prev) => [...prev, data.number]);
                    break;
                
                case 'CHAT_MESSAGE':
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
        return () => ws.close();
    }, [roomId]);

    const startGame = useCallback(() => {
        if (socket && isConnected) {
            socket.send(JSON.stringify({ 'action': 'START_GAME' }));
        }
    }, [socket, isConnected]);

    return { socket, calledNumbers, currentNumber, winnerData, isConnected, startGame };
};