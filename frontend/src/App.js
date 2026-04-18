import React, { useState, useEffect } from 'react';
import { useSocket } from './useSocket';

function App() {
    const [view, setView] = useState('lobby'); 
    const [roomData, setRoomData] = useState({ name: '', password: '', playersLimit: 2 });
    const [joinData, setJoinData] = useState({ name: '' });
    
    // Dynamic Socket Connection
    const { socket, lastNumber, calledNumbers, ticket, playerCount, maxPlayers } = useSocket(roomData.name || "");

    // 100% OFFICIAL LINK DETECTOR
    useEffect(() => {
        const pathParts = window.location.pathname.split('/').filter(p => p !== "");
        if (pathParts.length >= 2) {
            // URL Format: domain.com/Sai/1111 -> Sai=Name, 1111=Password
            setRoomData(prev => ({ ...prev, name: pathParts[0], password: pathParts[1] }));
            setView('join_screen'); 
        }
    }, []);

    const handleCreate = () => {
        if(!roomData.name || !roomData.password) return alert("All fields are mandatory!");
        socket.current.send(JSON.stringify({ 
            action: 'setup_room', password: roomData.password, max_players: roomData.playersLimit 
        }));
        setView('invite');
    };

    const handleJoin = () => {
        if(!joinData.name) return alert("Enter your name to join!");
        socket.current.send(JSON.stringify({ 
            action: 'join_game', player_name: joinData.name, password: roomData.password 
        }));
        setView('game');
    };

    // --- LOBBY SCREEN ---
    if (view === 'lobby') return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 p-6 text-white">
            <div className="bg-slate-900 p-8 rounded-3xl w-full max-w-md border border-slate-800 shadow-2xl">
                <h1 className="text-3xl font-black text-yellow-400 mb-6 text-center italic">TAMBOLA SETUP</h1>
                <input placeholder="Room Name (e.g. Sai)" className="w-full p-4 mb-4 bg-slate-800 rounded-xl border border-slate-700 outline-none" 
                    onChange={e => setRoomData({...roomData, name: e.target.value.trim()})} />
                <input placeholder="Password (e.g. 1111)" className="w-full p-4 mb-4 bg-slate-800 rounded-xl border border-slate-700 outline-none" 
                    onChange={e => setRoomData({...roomData, password: e.target.value.trim()})} />
                <select className="w-full p-4 mb-8 bg-slate-800 rounded-xl border border-slate-700" 
                    onChange={e => setRoomData({...roomData, playersLimit: e.target.value})}>
                    {[...Array(14)].map((_, i) => <option key={i+2} value={i+2}>{i+2} Players</option>)}
                </select>
                <button onClick={handleCreate} className="w-full bg-yellow-500 py-4 rounded-xl text-black font-black uppercase">Create Official Link</button>
            </div>
        </div>
    );

    // --- INVITE SCREEN ---
    if (view === 'invite') return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-6">
            <div className="bg-slate-900 p-8 rounded-3xl w-full max-w-md text-center border border-slate-800 shadow-2xl">
                <h2 className="text-xl font-bold mb-4 italic">Official Link Created!</h2>
                <div className="bg-slate-950 p-4 rounded-xl mb-6 border border-slate-800 text-yellow-400 font-mono text-sm break-all">
                    {window.location.origin}/{roomData.name}/{roomData.password}
                </div>
                <button onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/${roomData.name}/${roomData.password}`);
                    alert("Official Link Copied!");
                }} className="bg-slate-800 px-8 py-2 rounded-lg mb-8 text-xs font-bold border border-slate-700 uppercase">COPY LINK</button>
                <button onClick={() => setView('join_screen')} className="w-full bg-green-600 py-4 rounded-xl font-black uppercase">Continue to Board</button>
            </div>
        </div>
    );

    // --- JOIN SCREEN ---
    if (view === 'join_screen') return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 p-6 text-white">
            <div className="bg-slate-900 p-8 rounded-3xl w-full max-w-md border border-slate-800 shadow-2xl">
                <h2 className="text-2xl font-bold mb-2 text-center text-yellow-400 uppercase italic">{roomData.name}</h2>
                <p className="text-center text-slate-500 text-[10px] mb-8 uppercase tracking-widest font-bold">Official Room Joined</p>
                <input placeholder="Enter Your Name" className="w-full p-4 mb-8 bg-slate-800 rounded-xl border border-slate-700 outline-none focus:border-yellow-400" 
                    onChange={e => setJoinData({ name: e.target.value })} />
                <button onClick={handleJoin} className="w-full bg-yellow-500 py-4 rounded-xl text-black font-black uppercase shadow-lg shadow-yellow-500/20">Join Dashboard</button>
            </div>
        </div>
    );

    // --- DASHBOARD ---
    return (
        <div className="bg-slate-950 min-h-screen p-4 flex flex-col items-center text-white">
            <div className="w-full max-w-3xl bg-slate-900 p-5 rounded-3xl border-b-4 border-yellow-500 flex justify-between items-center mb-10 shadow-2xl">
                <div>
                    <h4 className="text-yellow-400 font-bold uppercase text-[10px] tracking-widest">Live Room</h4>
                    <p className="text-xl font-black">{playerCount} / {maxPlayers} Players Joined</p>
                </div>
                <button 
                    disabled={playerCount < maxPlayers} 
                    onClick={() => socket.current.send(JSON.stringify({action:'start_game'}))}
                    className={`px-8 py-3 rounded-2xl font-black text-xs transition-all ${playerCount < maxPlayers ? 'bg-slate-800 text-slate-600' : 'bg-green-600 shadow-lg shadow-green-500/20'}`}>
                    {playerCount < maxPlayers ? 'WAITING...' : 'START GAME'}
                </button>
            </div>
            
            <div className="bg-slate-900 rounded-full w-24 h-24 flex items-center justify-center text-4xl font-black mb-10 border-4 border-yellow-500 text-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.1)] italic">
                {lastNumber}
            </div>

            <div className="bg-slate-900 p-4 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
                {ticket && ticket.map((row, i) => (
                    <div key={i} className="flex">
                        {row.map((num, j) => (
                            <div key={j} onClick={(e) => calledNumbers.includes(num) && (e.target.className += " bg-yellow-500 text-black scale-105 shadow-lg shadow-yellow-500/20")}
                                className={`w-12 h-12 md:w-16 md:h-16 border border-slate-800 flex items-center justify-center font-bold m-0.5 rounded-xl transition-all ${num === 0 ? 'bg-slate-950/20' : 'bg-slate-800 text-slate-400 cursor-pointer'}`}>
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