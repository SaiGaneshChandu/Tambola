import React, { useState, useEffect } from 'react';
import { useSocket } from './useSocket';

function App() {
    const [view, setView] = useState('lobby'); // lobby, invite, game
    const [roomData, setRoomData] = useState({ name: '', players: 2, password: '', roomName: '' });
    const [joinData, setJoinData] = useState({ name: '', password: '' });
    const { socket, lastNumber, calledNumbers, ticket, playerCount, maxPlayers } = useSocket(roomData.roomName || "TEMP");

    // URL nundi room name auto ga collect chestundhi
    useEffect(() => {
        const path = window.location.pathname.split('/')[2];
        if (path) {
            setRoomData(prev => ({ ...prev, roomName: path }));
            setView('join_screen');
        }
    }, []);

    const createRoom = () => {
        const generatedRoom = "ROOM-" + Math.random().toString(36).substring(7).toUpperCase();
        setRoomData(prev => ({ ...prev, roomName: generatedRoom }));
        socket.current.send(JSON.stringify({
            action: 'setup_room',
            password: roomData.password,
            max_players: roomData.players
        }));
        setView('invite');
    };

    const joinRoom = () => {
        socket.current.send(JSON.stringify({
            action: 'join_game',
            player_name: joinData.name,
            password: joinData.password
        }));
        setView('game');
    };

    const copyLink = () => {
        const link = `${window.location.origin}/join/${roomData.roomName}`;
        navigator.clipboard.writeText(link);
        alert("Link Copied!");
    };

    // --- 1. LOBBY (HOST SIDE) ---
    if (view === 'lobby') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-6">
                <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-700">
                    <h1 className="text-3xl font-black text-yellow-400 mb-6 text-center">TAMBOLA SETUP</h1>
                    <label className="block text-sm font-bold mb-2">HOST NAME</label>
                    <input className="w-full p-3 mb-4 bg-slate-900 rounded border border-slate-600" onChange={e => setJoinData({...joinData, name: e.target.value})} />
                    
                    <label className="block text-sm font-bold mb-2">MAX PLAYERS (2-15)</label>
                    <input type="number" min="2" max="15" className="w-full p-3 mb-4 bg-slate-900 rounded border border-slate-600" onChange={e => setRoomData({...roomData, players: e.target.value})} />
                    
                    <label className="block text-sm font-bold mb-2">ROOM PASSWORD</label>
                    <input type="password" px-4 className="w-full p-3 mb-6 bg-slate-900 rounded border border-slate-600" onChange={e => setRoomData({...roomData, password: e.target.value})} />
                    
                    <button onClick={createRoom} className="w-full bg-yellow-500 py-4 rounded-xl text-black font-black hover:bg-yellow-400 transition-all">CREATE ROOM</button>
                </div>
            </div>
        );
    }

    // --- 2. INVITE SCREEN ---
    if (view === 'invite') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-6">
                <div className="bg-slate-800 p-8 rounded-2xl text-center w-full max-w-md">
                    <h2 className="text-2xl font-bold mb-4">ROOM CREATED!</h2>
                    <p className="text-slate-400 mb-6 text-sm">Share this link with your friends to join.</p>
                    <div className="bg-slate-900 p-3 rounded mb-6 flex items-center justify-between border border-slate-600">
                        <span className="text-xs truncate mr-2">{window.location.origin}/join/{roomData.roomName}</span>
                        <button onClick={copyLink} className="bg-yellow-500 text-black px-3 py-1 rounded text-xs font-bold">COPY</button>
                    </div>
                    <button onClick={joinRoom} className="w-full bg-green-600 py-3 rounded-lg font-bold">GO TO GAME BOARD</button>
                </div>
            </div>
        );
    }

    // --- 3. JOIN SCREEN (PLAYER SIDE) ---
    if (view === 'join_screen') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-6">
                <div className="bg-slate-800 p-8 rounded-2xl w-full max-w-md">
                    <h2 className="text-2xl font-bold mb-6 text-center">JOIN GAME</h2>
                    <input placeholder="Your Name" className="w-full p-3 mb-4 bg-slate-900 rounded border border-slate-600" onChange={e => setJoinData({...joinData, name: e.target.value})} />
                    <input type="password" placeholder="Room Password" className="w-full p-3 mb-6 bg-slate-900 rounded border border-slate-600" onChange={e => setJoinData({...joinData, password: e.target.value})} />
                    <button onClick={joinRoom} className="w-full bg-yellow-500 py-4 rounded-xl text-black font-bold">JOIN NOW</button>
                </div>
            </div>
        );
    }

    // --- 4. GAME BOARD ---
    return (
        <div className="bg-orange-500 min-h-screen p-5 flex flex-col items-center">
            <div className="bg-white px-6 py-2 rounded-full font-bold mb-6 shadow-md">
                Players Joined: {playerCount} / {maxPlayers || roomData.players}
            </div>
            
            <div className="bg-white rounded-full w-24 h-24 flex items-center justify-center text-4xl font-black mb-10 border-8 border-black shadow-2xl">
                {lastNumber}
            </div>

            <div className="bg-white p-2 border-4 border-black shadow-2xl">
                {ticket && ticket.map((row, i) => (
                    <div key={i} className="flex">
                        {row.map((num, j) => (
                            <div key={j} onClick={(e) => calledNumbers.includes(num) && (e.target.style.backgroundColor = '#facc15')}
                                className="w-12 h-12 border border-black flex items-center justify-center font-bold text-xl cursor-pointer hover:bg-slate-100">
                                {num !== 0 ? num : ""}
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            <button 
                disabled={playerCount < (maxPlayers || roomData.players)}
                onClick={() => socket.current.send(JSON.stringify({action: 'start_game'}))}
                className={`mt-10 px-10 py-4 rounded-full font-black shadow-lg transition-all ${playerCount < (maxPlayers || roomData.players) ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 text-white hover:scale-105'}`}
            >
                {playerCount < (maxPlayers || roomData.players) ? 'WAITING FOR PLAYERS...' : 'START GAME'}
            </button>
        </div>
    );
}

export default App;