import React, { useState, useEffect } from 'react';
import { useSocket } from './useSocket';

function App() {
    const [view, setView] = useState('lobby'); 
    const [roomData, setRoomData] = useState({ name: '', players: 2, password: '' });
    const [joinData, setJoinData] = useState({ name: '', password: '' });
    
    // Room name kachithanga unteనే socket connect avvali
    const { socket, lastNumber, calledNumbers, ticket, playerCount, maxPlayers } = useSocket(roomData.name || "");

    // 100% Work ayye Link Detector Logic
    useEffect(() => {
        const currentPath = window.location.pathname;
        if (currentPath.includes('/join/')) {
            const extractedRoomName = currentPath.split('/join/')[1];
            if (extractedRoomName) {
                setRoomData(prev => ({ ...prev, name: extractedRoomName }));
                setView('join_screen');
            }
        }
    }, []);

    const handleCreate = () => {
        if(!roomData.name || !roomData.password) return alert("Anni fields fill cheyyali!");
        
        // Backend ki setup message pampali
        socket.current.send(JSON.stringify({ 
            action: 'setup_room', 
            password: roomData.password, 
            max_players: roomData.players 
        }));
        setView('invite');
    };

    const handleJoin = () => {
        if(!joinData.name || !joinData.password) return alert("Name & Password mandatory!");
        
        socket.current.send(JSON.stringify({ 
            action: 'join_game', 
            player_name: joinData.name, 
            password: joinData.password 
        }));
        setView('game');
    };

    const copyToClipboard = () => {
        const officialLink = `${window.location.origin}/join/${roomData.name}`;
        navigator.clipboard.writeText(officialLink);
        alert("Link Copied! Ippudu evariki pampina direct ga join avtharu.");
    };

    // --- 1. LOBBY (SETUP) ---
    if (view === 'lobby') return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 p-6 text-white font-sans">
            <div className="bg-slate-900 p-8 rounded-3xl w-full max-w-md border border-slate-800 shadow-2xl">
                <h1 className="text-3xl font-black text-yellow-400 mb-6 text-center italic tracking-widest">TAMBOLA 2K26</h1>
                
                <div className="space-y-4">
                    <div>
                        <label className="text-xs text-slate-500 font-bold ml-1 uppercase">Room Name (Official ID)</label>
                        <input placeholder="e.g. MySuperRoom" className="w-full p-4 mt-1 bg-slate-800 rounded-xl border border-slate-700 focus:border-yellow-500 outline-none transition-all" 
                            onChange={e => setRoomData({...roomData, name: e.target.value.replace(/\s+/g, '')})} />
                    </div>

                    <div>
                        <label className="text-xs text-slate-500 font-bold ml-1 uppercase">How Many Players?</label>
                        <select className="w-full p-4 mt-1 bg-slate-800 rounded-xl border border-slate-700 cursor-pointer" 
                            onChange={e => setRoomData({...roomData, players: e.target.value})}>
                            {[...Array(14)].map((_, i) => <option key={i+2} value={i+2}>{i+2} Players</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="text-xs text-slate-500 font-bold ml-1 uppercase">Set Password</label>
                        <input type="password" placeholder="Room Password" className="w-full p-4 mt-1 bg-slate-800 rounded-xl border border-slate-700 focus:border-yellow-500 outline-none" 
                            onChange={e => setRoomData({...roomData, password: e.target.value})} />
                    </div>

                    <button onClick={handleCreate} className="w-full bg-yellow-500 mt-4 py-4 rounded-2xl text-black font-black uppercase shadow-lg shadow-yellow-500/20 active:scale-95 transition-all">
                        Create Official Room
                    </button>
                </div>
            </div>
        </div>
    );

    // --- 2. INVITE (COPY LINK) ---
    if (view === 'invite') return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-6">
            <div className="bg-slate-900 p-8 rounded-3xl w-full max-w-md text-center border border-slate-800">
                <div className="text-5xl mb-4">🔗</div>
                <h2 className="text-2xl font-bold mb-2">Share Link</h2>
                <p className="text-slate-400 text-sm mb-6">Ee link click chesina evaraina direct ga Dashboard ki vastharu.</p>
                
                <div className="bg-slate-950 p-4 rounded-xl mb-4 border border-slate-800 text-yellow-400 break-all font-mono text-xs">
                    {window.location.origin}/join/{roomData.name}
                </div>
                
                <button onClick={copyToClipboard} className="bg-slate-800 text-white px-8 py-2 rounded-lg mb-6 text-xs font-bold hover:bg-slate-700 transition-all uppercase tracking-widest border border-slate-700">
                    COPY OFFICIAL LINK
                </button>
                
                <button onClick={() => setView('join_screen')} className="w-full bg-green-600 py-4 rounded-xl font-black uppercase text-sm">
                    Continue to Board
                </button>
            </div>
        </div>
    );

    // --- 3. JOIN SCREEN (NAME ASKING) ---
    if (view === 'join_screen') return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 p-6 text-white">
            <div className="bg-slate-900 p-8 rounded-3xl w-full max-w-md border border-slate-800 shadow-2xl">
                <h2 className="text-2xl font-bold mb-2 text-center text-yellow-400">JOINING ROOM</h2>
                <p className="text-center text-slate-500 text-xs mb-8 uppercase tracking-widest">ID: {roomData.name}</p>
                
                <input placeholder="Enter Your Name" className="w-full p-4 mb-4 bg-slate-800 rounded-xl border border-slate-700 outline-none focus:border-yellow-400" 
                    onChange={e => setJoinData({...joinData, name: e.target.value})} />
                
                <input type="password" placeholder="Room Password" className="w-full p-4 mb-8 bg-slate-800 rounded-xl border border-slate-700 outline-none focus:border-yellow-400" 
                    onChange={e => setJoinData({...joinData, password: e.target.value})} />
                
                <button onClick={handleJoin} className="w-full bg-yellow-500 py-4 rounded-xl text-black font-black uppercase shadow-lg shadow-yellow-500/20">
                    Enter Dashboard
                </button>
            </div>
        </div>
    );

    // --- 4. GAME DASHBOARD ---
    return (
        <div className="bg-slate-950 min-h-screen p-6 flex flex-col items-center text-white">
            <div className="w-full max-w-2xl bg-slate-900 p-5 rounded-2xl flex justify-between items-center mb-10 border-b-4 border-yellow-500">
                <div>
                    <h4 className="text-yellow-400 font-bold uppercase text-[10px] tracking-[0.2em]">Live Dashboard</h4>
                    <p className="text-lg font-black">{playerCount} / {maxPlayers} Players Joined</p>
                </div>
                <button 
                    disabled={playerCount < maxPlayers} 
                    onClick={() => socket.current.send(JSON.stringify({action:'start_game'}))}
                    className={`px-8 py-2 rounded-full font-black text-xs tracking-widest transition-all ${playerCount < maxPlayers ? 'bg-slate-800 text-slate-600' : 'bg-green-600 text-white shadow-lg shadow-green-500/20'}`}
                >
                    {playerCount < maxPlayers ? 'WAITING...' : 'START GAME'}
                </button>
            </div>

            <div className="bg-slate-900 rounded-full w-28 h-28 flex items-center justify-center text-5xl font-black mb-10 border-4 border-yellow-500 text-yellow-400 shadow-[0_0_50px_rgba(250,204,21,0.1)] italic">
                {lastNumber}
            </div>

            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-2xl">
                {ticket && ticket.map((row, i) => (
                    <div key={i} className="flex">
                        {row.map((num, j) => (
                            <div key={j} 
                                onClick={(e) => calledNumbers.includes(num) && (e.target.className += " bg-yellow-500 text-black scale-105")}
                                className={`w-14 h-14 border border-slate-800 flex items-center justify-center font-bold m-0.5 rounded-lg transition-all ${num === 0 ? 'bg-slate-950/20' : 'bg-slate-800 text-slate-400 hover:text-white cursor-pointer'}`}>
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