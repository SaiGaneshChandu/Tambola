import React, { useState, useEffect } from 'react';
import { useSocket } from './useSocket';

function App() {
    const [view, setView] = useState('lobby'); 
    const [roomData, setRoomData] = useState({ name: '', password: '', playersLimit: 2 });
    const [joinData, setJoinData] = useState({ name: '' });
    
    const { socket, lastNumber, calledNumbers, ticket, playerCount, maxPlayers } = useSocket(roomData.name || "");

    // 1. LINK DETECTOR: Link click chesi vaste direct ga Join Screen ki veltundi
    useEffect(() => {
        const pathParts = window.location.pathname.split('/').filter(p => p !== "");
        if (pathParts.length >= 2) {
            setRoomData(prev => ({ ...prev, name: pathParts[0], password: pathParts[1] }));
            setView('join_screen'); 
        }
    }, []);

    const handleCreate = () => {
        if(!roomData.name || !roomData.password) return alert("Fill Name and Password!");
        
        // Browser URL ni .../name/password ki marustundi
        const newUrl = `${window.location.origin}/${roomData.name}/${roomData.password}`;
        window.history.pushState({}, '', newUrl);

        socket.current.send(JSON.stringify({ 
            action: 'setup_room', password: roomData.password, max_players: roomData.playersLimit 
        }));
        setView('invite');
    };

    const handleJoin = () => {
        if(!joinData.name) return alert("Please enter your name!");
        socket.current.send(JSON.stringify({ 
            action: 'join_game', player_name: joinData.name, password: roomData.password 
        }));
        setView('game');
    };

    // --- VIEW 1: LOBBY (Create Room) ---
    if (view === 'lobby') return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#020617] p-6 text-white">
            <div className="bg-[#0f172a] p-10 rounded-[40px] w-full max-w-md border-t-4 border-yellow-500 shadow-2xl">
                <h1 className="text-3xl font-black text-yellow-400 mb-8 text-center tracking-tighter italic">TAMBOLA 2K26</h1>
                <div className="space-y-4">
                    <input placeholder="Room Name (e.g. Sai)" className="w-full p-4 bg-[#1e293b] rounded-2xl border border-slate-700 outline-none focus:border-yellow-500 font-bold" 
                        onChange={e => setRoomData({...roomData, name: e.target.value.trim()})} />
                    <input placeholder="Password (e.g. 1111)" className="w-full p-4 bg-[#1e293b] rounded-2xl border border-slate-700 outline-none focus:border-yellow-500 font-bold" 
                        onChange={e => setRoomData({...roomData, password: e.target.value.trim()})} />
                    <select className="w-full p-4 bg-[#1e293b] rounded-2xl border border-slate-700 font-bold" 
                        onChange={e => setRoomData({...roomData, playersLimit: e.target.value})}>
                        {[...Array(14)].map((_, i) => <option key={i+2} value={i+2}>{i+2} Players Mode</option>)}
                    </select>
                    <button onClick={handleCreate} className="w-full bg-yellow-500 py-4 rounded-2xl text-black font-black uppercase text-lg shadow-lg hover:bg-yellow-400 transition-all">Create Invite Link</button>
                </div>
            </div>
        </div>
    );

    // --- VIEW 2: INVITE (Share & Player List) ---
    if (view === 'invite') return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#020617] p-6">
            <div className="bg-[#0f172a] p-10 rounded-[40px] w-full max-w-md text-center border-b-4 border-green-500 shadow-2xl">
                <div className="text-5xl mb-4">🎮</div>
                <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Game Room Ready!</h2>
                <p className="text-slate-400 text-sm mb-6">Link share cheyyi, friends add avtharu.</p>
                <div className="bg-[#020617] p-4 rounded-xl mb-6 border border-slate-800 text-yellow-400 font-mono text-[10px] break-all">
                    {window.location.origin}/{roomData.name}/{roomData.password}
                </div>
                <button onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/${roomData.name}/${roomData.password}`);
                    alert("Link Copied!");
                }} className="bg-slate-800 text-white px-6 py-2 rounded-lg mb-8 text-[10px] font-black uppercase tracking-widest border border-slate-700">COPY INVITE LINK</button>

                {/* JOINED PLAYERS LIST */}
                <div className="mb-8 p-4 bg-[#020617] rounded-2xl border border-slate-800">
                    <h3 className="text-yellow-500 text-[10px] font-black uppercase mb-4 tracking-widest text-center">Joined Players ({playerCount}/{roomData.playersLimit})</h3>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs px-3 py-2 bg-slate-800/50 rounded-lg">
                            <span className="text-green-400 font-bold">You (Host)</span>
                            <span className="text-slate-500 text-[10px]">Connected</span>
                        </div>
                        {playerCount > 1 && (
                            <div className="flex items-center justify-between text-xs px-3 py-2 bg-slate-800/50 rounded-lg animate-pulse">
                                <span className="text-blue-400 font-bold">New Player</span>
                                <span className="text-blue-500 text-[10px]">Joined!</span>
                            </div>
                        )}
                    </div>
                </div>

                <button onClick={() => setView('join_screen')} className="w-full bg-green-600 py-4 rounded-2xl text-white font-black text-lg uppercase shadow-lg">Open Dashboard</button>
            </div>
        </div>
    );

    // --- VIEW 3: JOIN (For Friends) ---
    if (view === 'join_screen') return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#020617] p-6 text-white text-center">
            <div className="bg-[#0f172a] p-10 rounded-[40px] w-full max-w-md border-t-4 border-yellow-500 shadow-2xl">
                <h2 className="text-3xl font-black text-yellow-400 mb-2 uppercase italic tracking-tighter">Join {roomData.name}</h2>
                <p className="text-[10px] text-slate-500 mb-8 uppercase tracking-widest">Multiplayer Lobby</p>
                <input placeholder="Enter Your Name" className="w-full p-4 mb-8 bg-[#1e293b] rounded-2xl border border-slate-700 outline-none focus:border-yellow-500 font-bold" 
                    onChange={e => setJoinData({ name: e.target.value })} />
                <button onClick={handleJoin} className="w-full bg-yellow-500 py-4 rounded-2xl text-black font-black text-lg uppercase shadow-xl hover:bg-yellow-400">Join Now</button>
            </div>
        </div>
    );

    // --- VIEW 4: DASHBOARD (The Game) ---
    return (
        <div className="bg-[#020617] min-h-screen p-4 flex flex-col items-center text-white">
            <div className="w-full max-w-2xl bg-[#0f172a] p-6 rounded-3xl border-b-4 border-yellow-500 flex justify-between items-center mb-10 shadow-2xl">
                <div>
                    <h4 className="text-yellow-400 font-bold uppercase text-[10px] tracking-widest mb-1">Live Game</h4>
                    <p className="text-xl font-black">{playerCount} / {maxPlayers} Joined</p>
                </div>
                <button disabled={playerCount < maxPlayers} onClick={() => socket.current.send(JSON.stringify({action:'start_game'}))}
                    className={`px-8 py-3 rounded-2xl font-black text-sm tracking-widest transition-all ${playerCount < maxPlayers ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-green-600 shadow-lg active:scale-95'}`}>
                    {playerCount < maxPlayers ? 'WAITING...' : 'START'}
                </button>
            </div>

            <div className="bg-[#0f172a] rounded-full w-28 h-28 flex items-center justify-center text-5xl font-black mb-12 border-4 border-yellow-500 text-yellow-400 shadow-[0_0_50px_rgba(250,204,21,0.1)] italic">
                {lastNumber}
            </div>

            <div className="bg-[#0f172a] p-5 rounded-[35px] border border-slate-800 shadow-2xl">
                {ticket && ticket.map((row, i) => (
                    <div key={i} className="flex">
                        {row.map((num, j) => (
                            <div key={j} onClick={(e) => calledNumbers.includes(num) && (e.target.className += " bg-yellow-500 text-black scale-105 shadow-xl")}
                                className={`w-12 h-12 md:w-16 md:h-16 border border-slate-900/50 flex items-center justify-center font-black m-0.5 rounded-xl transition-all ${num === 0 ? 'bg-slate-900/30' : 'bg-[#1e293b] text-slate-500 hover:text-white cursor-pointer'}`}>
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