import React, { useState, useEffect } from 'react';
import { useSocket } from './useSocket';

function App() {
    const [page, setPage] = useState('home'); 
    const [roomData, setRoomData] = useState({ name: '', password: '', playersLimit: 2 });
    const [joinData, setJoinData] = useState({ name: '', isJoined: false });
    
    // Custom hook to manage WebSocket connection
    const { socket, lastNumber, ticket, playerCount, maxPlayers, playersList } = useSocket(roomData.name || "");

    // EFFECT: Detect Room from URL (e.g., domain.com/jj/1)
    useEffect(() => {
        const path = window.location.pathname.split('/').filter(p => p !== "");
        if (path.length >= 2) {
            setRoomData({ name: path[0], password: path[1], playersLimit: 2 });
            setPage('game_room'); 
        }
    }, []);

    const handleCreate = () => {
        if(!roomData.name || !roomData.password) return alert("Enter Room Details");
        
        // Update URL without reloading: domain.com/roomname/password
        const newUrl = `${window.location.origin}/${roomData.name}/${roomData.password}`;
        window.history.pushState({}, '', newUrl);

        socket.current.send(JSON.stringify({ 
            action: 'setup_room', password: roomData.password, max_players: roomData.playersLimit 
        }));
        setPage('game_room');
    };

    const handleJoin = () => {
        if(!joinData.name) return alert("Enter Name");
        socket.current.send(JSON.stringify({ 
            action: 'join_game', player_name: joinData.name, password: roomData.password 
        }));
        setJoinData({ ...joinData, isJoined: true });
    };

    if (page === 'home') return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white font-sans">
            <div className="bg-slate-900 p-10 rounded-3xl w-full max-w-md border-t-4 border-yellow-500 shadow-2xl">
                <h1 className="text-3xl font-bold text-yellow-500 mb-8 text-center italic">TAMBOLA LIVE</h1>
                <input placeholder="Room Name" className="w-full p-4 mb-4 bg-black rounded-xl border border-slate-800" 
                    onChange={e => setRoomData({...roomData, name: e.target.value.trim()})} />
                <input placeholder="Password" className="w-full p-4 mb-6 bg-black rounded-xl border border-slate-800" 
                    onChange={e => setRoomData({...roomData, password: e.target.value.trim()})} />
                <button onClick={handleCreate} className="w-full bg-yellow-500 py-4 rounded-xl text-black font-bold uppercase hover:bg-yellow-400">Create Room</button>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 p-6 text-white">
            {!joinData.isJoined ? (
                <div className="bg-slate-900 p-10 rounded-3xl w-full max-w-md border-t-4 border-yellow-500 shadow-2xl text-center">
                    <h2 className="text-2xl font-bold text-yellow-500 mb-6 uppercase italic">{roomData.name} Lobby</h2>
                    <input placeholder="Your Player Name" className="w-full p-4 mb-8 bg-black rounded-xl border border-slate-800" 
                        onChange={e => setJoinData({ ...joinData, name: e.target.value })} />
                    <button onClick={handleJoin} className="w-full bg-yellow-500 py-4 rounded-xl text-black font-bold uppercase shadow-xl">Join Now</button>
                </div>
            ) : (
                <div className="w-full max-w-2xl bg-slate-900 p-8 rounded-3xl border-b-4 border-yellow-500 shadow-2xl">
                    <div className="flex justify-between items-center mb-8">
                        <h4 className="text-yellow-500 font-bold uppercase tracking-widest text-sm">Players ({playerCount}/{maxPlayers})</h4>
                        <button disabled={playerCount < maxPlayers} onClick={() => socket.current.send(JSON.stringify({action:'start_game'}))}
                            className={`px-6 py-2 rounded-xl font-bold ${playerCount < maxPlayers ? 'bg-slate-800 text-slate-500' : 'bg-green-600'}`}>
                            {playerCount < maxPlayers ? 'WAITING' : 'START GAME'}
                        </button>
                    </div>

                    {/* LIVE PLAYERS GRID */}
                    <div className="grid grid-cols-2 gap-3 mb-8">
                        {playersList && playersList.map((player, idx) => (
                            <div key={idx} className="bg-black p-3 rounded-xl border border-slate-800 flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                <span className="text-sm font-semibold">{player}</span>
                            </div>
                        ))}
                    </div>

                    <div className="bg-black p-4 rounded-xl border border-slate-800 text-center text-xs">
                        <p className="text-slate-500 mb-2 uppercase">Invite Friends</p>
                        <p className="text-yellow-