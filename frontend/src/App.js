import React, { useState } from 'react';
import { useSocket } from './useSocket';

function App() {
    const [room, setRoom] = useState('ROOM1');
    const [pass, setPass] = useState('');
    const [isJoined, setIsJoined] = useState(false);
    const { socket, lastNumber, calledNumbers, ticket, playerCount } = useSocket(room);

    const join = () => {
        socket.current.send(JSON.stringify({
            action: 'join_game',
            player_name: 'Player1',
            password: pass
        }));
        setIsJoined(true);
    };

    if (!isJoined) {
        return (
            <div className="flex flex-col items-center bg-slate-900 min-h-screen p-10 text-white">
                <h1 className="text-3xl font-bold mb-5">Tambola Lobby</h1>
                <input placeholder="Room Name" onChange={e => setRoom(e.target.value)} className="p-2 mb-2 text-black" />
                <input placeholder="4-Digit Password" onChange={e => setPass(e.target.value)} className="p-2 mb-5 text-black" />
                <button onClick={join} className="bg-yellow-500 p-3 rounded text-black font-bold">JOIN GAME</button>
            </div>
        );
    }

    return (
        <div className="bg-orange-500 min-h-screen p-5 flex flex-col items-center">
            <h2 className="text-2xl font-bold mb-4">Players: {playerCount}</h2>
            
            {/* Number Display */}
            <div className="bg-white rounded-full w-24 h-24 flex items-center justify-center text-4xl font-black mb-10 shadow-xl border-4 border-black">
                {lastNumber}
            </div>

            {/* Ticket UI */}
            <div className="bg-white p-2 border-2 border-black shadow-2xl">
                {ticket && ticket.map((row, i) => (
                    <div key={i} className="flex">
                        {row.map((num, j) => (
                            <div 
                                key={j}
                                onClick={(e) => {
                                    if(calledNumbers.includes(num)) e.target.style.backgroundColor = 'yellow';
                                }}
                                className="w-12 h-12 border border-black flex items-center justify-center font-bold text-xl cursor-pointer"
                            >
                                {num !== 0 ? num : ""}
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            <button 
                onClick={() => socket.current.send(JSON.stringify({action: 'start_game'}))}
                className="mt-10 bg-green-600 text-white px-10 py-3 rounded-full font-bold shadow-lg"
            >
                START AUTO-CALL
            </button>
        </div>
    );
}

export default App;