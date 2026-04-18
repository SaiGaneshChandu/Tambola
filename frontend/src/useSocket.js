import { useEffect, useRef, useState } from 'react';

export const useSocket = (roomName) => {
    const socket = useRef(null);
    const [lastNumber, setLastNumber] = useState('--');
    const [calledNumbers, setCalledNumbers] = useState([]);
    const [ticket, setTicket] = useState(null);
    const [playerCount, setPlayerCount] = useState(0);
    const [maxPlayers, setMaxPlayers] = useState(0);

    useEffect(() => {
        if (!roomName) return;
        
        // Render Backend URL
        socket.current = new WebSocket(`wss://tambola-s8hq.onrender.com/ws/game/${roomName}/`);

        socket.current.onmessage = (e) => {
            const data = JSON.parse(e.data);
            if (data.type === 'new_number') {
                setLastNumber(data.number);
                setCalledNumbers(prev => [...prev, data.number]);
            } else if (data.type === 'ticket_data') {
                setTicket(data.ticket);
                setMaxPlayers(data.max_players);
            } else if (data.type === 'player_update') {
                setPlayerCount(data.count);
                if (data.max_players) setMaxPlayers(data.max_players);
            }
        };

        return () => { if(socket.current) socket.current.close(); };
    }, [roomName]);

    return { socket, lastNumber, calledNumbers, ticket, playerCount, maxPlayers };
};