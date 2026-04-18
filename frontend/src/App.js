import React, { useState, useEffect } from 'react';
import { useSocket } from './useSocket';

function App() {
    const [view, setView] = useState('lobby'); 
    const [roomData, setRoomData] = useState({ name: '', password: '', playersLimit: 2 });
    const [joinData, setJoinData] = useState({ name: '' });
    
    const { socket, lastNumber, calledNumbers, ticket, playerCount, maxPlayers } = useSocket(roomData.name || "");

    // 100% WORKING INVITE LINK DETECTOR (Like Ludo)
    useEffect(() => {
        const pathParts = window.location.pathname.split('/').filter(p => p !== "");
        if (pathParts.length >= 2) {
            // URL format: /RoomName/Password
            setRoomData(prev => ({ ...prev, name: pathParts[0], password: pathParts[1] }));
            setView('join_screen'); 
        }
    }, []);

    const handleCreate = () => {
        if(!roomData.name || !roomData.password) return alert("Room Name & Password fill cheyyandi!");
        socket.current.send(JSON.stringify({ 
            action: 'setup_room', password: roomData.password, max_players: roomData.playersLimit 
        }));
        setView('invite');
    };

    const handleJoin = () => {
        if(!joinData.name) return alert("Nee Peru enter cheyyi!");
        socket.current.send(JSON.stringify({ 
            action: 'join_game', player_name: joinData.name, password: roomData.password 
        }));
        setView('game');
    };

    // --- LOBBY (Setup) ---
    if (view === 'lobby') return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#0f172a] p-6 text-white">
            <div className="bg-[#1e293b] p-10 rounded-[40px] w-full max-w-md border-t-8 border-yellow-500 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                <h1 className="text-4xl font-black text-yellow-400 mb-8 text-center italic tracking-tighter">TAMBOLA 2K26</h1>
                
                <div className="space-y-6">
                    <input placeholder="Room Name (e.g. Sai)" className="w-full p-5 bg-[#0f172a] rounded-2xl border border-slate-700 focus:border-yellow-500 outline-none text-lg font-bold" 
                        onChange={e => setRoomData({...roomData, name: e.target.value.trim()})} />
                    
                    <input placeholder="Password (e.g. 1111)" className="w-full p-5 bg-[#0f172a] rounded-2xl border border-slate-700 focus:border-yellow-500 outline-none text-lg font-bold" 
                        onChange={e => setRoomData({...roomData, password: e.target.value.trim()})} />

                    <select className="w-full p-5 bg-[#0f172a] rounded-2xl border border-slate-700 font-bold appearance-none cursor-pointer" 
                        onChange={e => setRoomData({...roomData, playersLimit: e.target.value})}>
                        {[...Array(14)].map((_, i) => <option key={i+2} value={i+2}>{i+2} Players Mode</option>)}
                    </select>

                    <button onClick={handleCreate} className="w-full bg-yellow-500 py-5 rounded-2xl text-black font-black text-xl uppercase shadow-xl shadow-yellow-500/20 active:scale-95 transition-all">
                        Create Invite Link
                    </button>
                </div>
            </div>
        </div>
    );

    // --- INVITE (Share Screen) ---
    if (view === 'invite') return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#0f172a] p-6">
            <div className="bg-[#1e293b] p-10 rounded-[40px] w-full max-w-md text-center border-b-8 border-green-500 shadow-2xl">
                <div className="text-6xl mb-6">🎮</div>
                <h2 className="text-2xl font-black text-white mb-2">Game Room Ready!</h2>
                <p className="text-slate-400 text-sm mb-8 font-medium">Ee link ni share cheyyi, friends direct ga join avtharu.</p>
                
                <div className="bg-[#0f172a] p-5 rounded-2xl mb-8 border border-slate-800 text-yellow-400 font-mono text-sm break-all shadow-inner">
                    {window.location.origin}/{roomData.name}/{roomData.password}
                </div>
                
                <button onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/${roomData.name}/${roomData.password}`);
                    alert("Invite Link Copied!");
                }} className="bg-white/10 text-white px-10 py-3 rounded-xl mb-10 text-xs font-black border border-white/20 uppercase tracking-widest hover:bg-white/20">
                    COPY INVITE LINK
                </button>
                
                <button onClick={() => setView('join_screen')} className="w-full bg-green-600 py-5 rounded-2xl text-white font-black text-lg uppercase shadow-lg shadow-green-500/20">
                    Open Dashboard
                </button>
            </div>
        </div>
    );

    // --- JOIN SCREEN (Auto-detect from Link) ---
    if (view === 'join_screen') return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#0f172a] p-6 text-white text-center">
            <div className="bg-[#1e293b] p-10 rounded-[40px] w-full max-w-md border-t-8 border-yellow-500 shadow-2xl">
                <h2 className="text-3xl font-black text-yellow-400 mb-2 uppercase italic">Join {roomData.name}</h2>
                <p className="text-xs text-slate-500 mb-10 tracking-[0.3em] font-bold uppercase">Multiplayer Dashboard</p>
                
                <input placeholder="Enter Your Name" className="w-full p-5 mb-10 bg-[#0f172a] rounded-2xl border border-slate-700 outline-none focus:border-yellow-500 text-lg font-bold" 
                    onChange={e => setJoinData({ name: e.target.value })} />
                
                <button onClick={handleJoin} className="w-full bg-yellow-500 py-5 rounded-2xl text-black font-black text-xl uppercase shadow-xl shadow-yellow-500/20 active:scale-95">
                    Join Now
                </button>
            </div>
        </div>
    );

    // --- DASHBOARD ---
    return (
        <div className="bg-[#0f172a] min-h-screen p-4 flex flex-col items-center text-white">
            <div className="w-full max-w-2xl bg-[#1e293b] p-6 rounded-3xl border-b-4 border-yellow-500 flex justify-between items-center mb-10 shadow-2xl">
                <div>
                    <h4 className="text-yellow-400 font-bold text-[10px] uppercase tracking-[0.2em] mb-1">Live Game</h4>
                    <p className="text-xl font-black">{playerCount} / {maxPlayers} Joined</p>
                </div>
                <button 
                    disabled={playerCount < maxPlayers} 
                    onClick={() => socket.current.send(JSON.stringify({action:'start_game'}))}
                    className={`px-10 py-3 rounded-2xl font-black text-sm tracking-widest transition-all ${playerCount < maxPlayers ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-green-600 shadow-lg shadow-green-500/30 active:scale-95'}`}>
                    {playerCount < maxPlayers ? 'WAITING...' : 'START'}
                </button>
            </div>

            <div className="bg-[#1e293b] rounded-full w-28 h-28 flex items-center justify-center text-5xl font-black mb-12 border-4 border-yellow-500 text-yellow-400 shadow-[0_0_60px_rgba(250,204,21,0.15)] italic">
                {lastNumber}
            </div>

            <div className="bg-[#1e293b] p-5 rounded-[35px] border border-slate-800 shadow-2xl">
                {ticket && ticket.map((row, i) => (
                    <div key={i} className="flex">
                        {row.map((num, j) => (
                            <div key={j} onClick={(e) => calledNumbers.includes(num) && (e.target.className += " bg-yellow-500 text-black scale-105 shadow-lg shadow-yellow-500/40")}
                                className={`w-12 h-12 md:w-16 md:h-16 border border-slate-900/50 flex items-center justify-center font-black m-0.5 rounded-xl transition-all ${num === 0 ? 'bg-slate-900/30' : 'bg-[#0f172a] text-slate-500 hover:text-white cursor-pointer'}`}>
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