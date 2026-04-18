import { useEffect, useRef, useState } from 'react';

export const useSocket = (roomName) => {
    const socket = useRef(null);
    const [lastNumber, setLastNumber] = useState('--');
    const [calledNumbers, setCalledNumbers] = useState([]);
    const [ticket, setTicket] = useState(null);
    const [playerCount, setPlayerCount] = useState(0);

    useEffect(() => {
        socket.current = new WebSocket(`wss://tambola-s8hq.onrender.com/ws/game/${roomName}/`);

        socket.current.onmessage = (e) => {
            const data = JSON.parse(e.data);
            if (data.type === 'new_number') {
                setLastNumber(data.number);
                setCalledNumbers(prev => [...prev, data.number]);
            } else if (data.type === 'ticket_data') {
                setTicket(data.ticket);
            } else if (data.type === 'player_update') {
                setPlayerCount(data.count);
            }
        };

        return () => socket.current.close();
    }, [roomName]);

    return { socket, lastNumber, calledNumbers, ticket, playerCount };
};