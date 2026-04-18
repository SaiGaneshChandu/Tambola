import React, { useState, useEffect } from 'react';
import { useSocket } from './useSocket';

function App() {
    const [view, setView] = useState('lobby'); 
    const [roomData, setRoomData] = useState({ name: '', players: 2, password: '' });
    const [joinData, setJoinData] = useState({ name: '', password: '' });
    
    // Dynamic Socket Connection
    const { socket, lastNumber, calledNumbers, ticket, playerCount, maxPlayers } = useSocket(roomData.name || "");

    // 100% WORKING LINK DETECTOR
    useEffect(() => {
        const currentPath = window.location.pathname;
        if (currentPath.includes('/join/')) {
            const nameFromUrl = currentPath.split('/join/')[1];
            if (nameFromUrl) {
                // Link nundi vachina name ni set chestunnam
                setRoomData(prev => ({ ...prev, name: nameFromUrl }));
                setView('join_screen');
            }
        }
    }, []);

    const handleCreate = () => {
        if(!roomData.name || !roomData.password) return alert("Anni fields mandatory!");
        
        socket.current.send(JSON.stringify({ 
            action: 'setup_room', 
            password: roomData.password, 
            max_players: roomData.players 
        }));
        setView('invite');
    };

    const handleJoin = () => {
        if(!joinData.name || !joinData.password) return alert("Name & Password fill cheyyandi!");
        
        socket.current.send(JSON.stringify({ 
            action: 'join_game', 
            player_name: joinData.name, 
            password: joinData.password 
        }));
        setView('game');
    };

    // --- LOBBY ---
    if (view === 'lobby') return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 p-6 text-white">
            <div className="bg-slate-900 p-8 rounded-3xl w-full max-w-md border border-slate-800 shadow-2xl">
                <h1 className="text-3xl font-black text-yellow-400 mb-8 text-center italic">TAMBOLA SETUP</h1>
                
                <label className="text-xs text-slate-500 font-bold ml-1 uppercase">Official Room Name</label>
                <input placeholder="e.g. MyGame2026" className="w-full p-4 mb-4 bg-slate-800 rounded-xl border border-slate-700 outline-none focus:border-yellow-500" 
                    onChange={e => setRoomData({...roomData, name: e.target.value.trim()})} />

                <label className="text-xs text-slate-500 font-bold ml-1 uppercase">Select Players</label>
                <select className="w-full p-4 mb-4 bg-slate-800 rounded-xl border border-slate-700 cursor-pointer" 
                    onChange={e => setRoomData({...roomData, players: e.target.value})}>
                    {[...Array(14)].map((_, i) => <option key={i+2} value={i+2}>{i+2} Players</option>)}
                </select>

                <label className="text-xs text-slate-500 font-bold ml-1 uppercase">Room Password</label>
                <input type="password" placeholder="****" className="w-full p-4 mb-8 bg-slate-800 rounded-xl border border-slate-700 outline-none focus:border-yellow-500" 
                    onChange={e => setRoomData({...roomData, password: e.target.value})} />

                <button onClick={handleCreate} className="w-full bg-yellow-500 py-4 rounded-2xl text-black font-black uppercase shadow-lg shadow-yellow-500/20 active:scale-95 transition-all">
                    Create Official Link
                </button>
            </div>
        </div>
    );

    // --- INVITE (Official Link Display) ---
    if (view === 'invite') return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-6">
            <div className="bg-slate-900 p-8 rounded-3xl w-full max-w-md text-center border border-slate-800 shadow-2xl">
                <h2 className="text-2xl font-bold mb-4">Official Invite Link</h2>
                <div className="bg-slate-950 p-4 rounded-xl mb-6 border border-slate-800 text-yellow-400 break-all font-mono text-xs">
                    {window.location.origin}/join/{roomData.name}
                </div>
                <button onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/join/${roomData.name}`);
                    alert("Link Copied!");
                }} className="bg-slate-800 px-8 py-2 rounded-lg mb-8 text-xs font-bold border border-slate-700 uppercase">COPY LINK</button>
                
                <button onClick={() => setView('join_screen')} className="w-full bg-green-600 py-4 rounded-xl font-black uppercase">Go to Join Page</button>
            </div>
        </div>
    );

    // --- JOIN SCREEN (Player side) ---
    if (view === 'join_screen') return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 p-6 text-white">
            <div className="bg-slate-900 p-8 rounded-3xl w-full max-w-md border border-slate-800 shadow-2xl">
                <h2 className="text-2xl font-bold mb-6 text-center italic text-yellow-400 tracking-widest">JOINING ROOM</h2>
                <input placeholder="Your Name" className="w-full p-4 mb-4 bg-slate-800 rounded-xl border border-slate-700 outline-none" 
                    onChange={e => setJoinData({...joinData, name: e.target.value})} />
                <input type="password" placeholder="Enter Room Password" className="w-full p-4 mb-8 bg-slate-800 rounded-xl border border-slate-700 outline-none" 
                    onChange={e => setJoinData({...joinData, password: e.target.value})} />
                <button onClick={handleJoin} className="w-full bg-yellow-500 py-4 rounded-xl text-black font-black uppercase">Enter Dashboard</button>
            </div>
        </div>
    );

    // --- DASHBOARD ---
    return (
        <div className="bg-slate-950 min-h-screen p-6 flex flex-col items-center text-white">
            <div className="w-full max-w-2xl bg-slate-900 p-4 rounded-2xl flex justify-between items-center mb-8 border-b-4 border-yellow-500">
                <div>
                    <h4 className="text-yellow-400 font-bold uppercase text-[10px]">Room: {roomData.name}</h4>
                    <p className="text-sm font-black">Players: {playerCount} / {maxPlayers}</p>
                </div>
                <button disabled={playerCount < maxPlayers} onClick={() => socket.current.send(JSON.stringify({action:'start_game'}))}
                    className={`px-8 py-2 rounded-full font-bold text-xs ${playerCount < maxPlayers ? 'bg-slate-800 text-slate-600' : 'bg-green-600 animate-pulse'}`}>
                    {playerCount < maxPlayers ? 'WAITING...' : 'START GAME'}
                </button>
            </div>
            
            <div className="bg-slate-900 rounded-full w-24 h-24 flex items-center justify-center text-4xl font-black mb-10 border-4 border-yellow-500 text-yellow-400">
                {lastNumber}
            </div>

            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-2xl">
                {ticket && ticket.map((row, i) => (
                    <div key={i} className="flex">
                        {row.map((num, j) => (
                            <div key={j} onClick={(e) => calledNumbers.includes(num) && (e.target.className += " bg-yellow-500 text-black")}
                                className={`w-12 h-12 border border-slate-800 flex items-center justify-center font-bold m-0.5 rounded ${num === 0 ? 'bg-slate-950/50' : 'bg-slate-800 text-slate-400'}`}>
                                {num !== 0 ? num : ""}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default App;