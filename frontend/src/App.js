import React, { useState, useEffect } from 'react';
import { useSocket } from './useSocket';

function App() {
    const [view, setView] = useState('lobby'); 
    const [roomData, setRoomData] = useState({ name: '', password: '', playersLimit: 2 });
    const [joinData, setJoinData] = useState({ name: '' });
    const [playersList, setPlayersList] = useState([]); // Add aina valla list kosam

    const { socket, lastNumber, calledNumbers, ticket, playerCount, maxPlayers } = useSocket(roomData.name || "");

    // 1. URL DETECTOR: Link click chesi vaste automatic ga identify chestundi
    useEffect(() => {
        const pathParts = window.location.pathname.split('/').filter(p => p !== "");
        if (pathParts.length >= 2) {
            setRoomData(prev => ({ ...prev, name: pathParts[0], password: pathParts[1] }));
            setView('join_screen'); 
        }
    }, []);

    // 2. CREATE LINK & CHANGE URL: Browser URL ni automatic ga marustundi
    const handleCreate = () => {
        if(!roomData.name || !roomData.password) return alert("Anni fill cheyyi!");
        
        // URL ni change chestundi: domain.com/name/password
        const newUrl = `${window.location.origin}/${roomData.name}/${roomData.password}`;
        window.history.pushState({}, '', newUrl);

        socket.current.send(JSON.stringify({ 
            action: 'setup_room', 
            password: roomData.password, 
            max_players: roomData.playersLimit 
        }));
        setView('invite');
    };

    const handleJoin = () => {
        if(!joinData.name) return alert("Enter Name!");
        socket.current.send(JSON.stringify({ 
            action: 'join_game', 
            player_name: joinData.name, 
            password: roomData.password 
        }));
        setView('game');
    };

    // --- 1. LOBBY SCREEN ---
    if (view === 'lobby') return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#0f172a] p-6 text-white font-sans">
            <div className="bg-[#1e293b] p-10 rounded-[40px] w-full max-w-md border-t-8 border-yellow-500 shadow-2xl">
                <h1 className="text-4xl font-black text-yellow-400 mb-8 text-center italic">TAMBOLA 2K26</h1>
                <input placeholder="Room Name" className="w-full p-4 mb-4 bg-[#0f172a] rounded-2xl border border-slate-700 outline-none" 
                    onChange={e => setRoomData({...roomData, name: e.target.value.trim()})} />
                <input placeholder="Password" title="Set a password" visually-hidden="false" className="w-full p-4 mb-4 bg-[#0f172a] rounded-2xl border border-slate-700 outline-none" 
                    onChange={e => setRoomData({...roomData, password: e.target.value.trim()})} />
                <select className="w-full p-4 mb-8 bg-[#0f172a] rounded-2xl border border-slate-700 font-bold" 
                    onChange={e => setRoomData({...roomData, playersLimit: e.target.value})}>
                    {[...Array(14)].map((_, i) => <option key={i+2} value={i+2}>{i+2} Players Mode</option>)}
                </select>
                <button onClick={handleCreate} className="w-full bg-yellow-500 py-4 rounded-2xl text-black font-black uppercase text-lg shadow-lg">Create Invite Link</button>
            </div>
        </div>
    );

    // --- 2. INVITE SCREEN (With Joined Players List) ---
    if (view === 'invite') return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#0f172a] p-6">
            <div className="bg-[#1e293b] p-10 rounded-[40px] w-full max-w-md text-center border-b-8 border-green-500 shadow-2xl">
                <div className="text-5xl mb-4">🎮</div>
                <h2 className="text-2xl font-black text-white mb-2">Game Room Ready!</h2>
                <p className="text-slate-400 text-sm mb-6">Ee link ni share cheyyi, friends direct ga join avtharu.</p>
                <div className="bg-[#0f172a] p-4 rounded-xl mb-6 border border-slate-800 text-yellow-400 font-mono text-xs break-all">
                    {window.location.origin}/{roomData.name}/{roomData.password}
                </div>
                
                <button onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/${roomData.name}/${roomData.password}`);
                    alert("Link Copied!");
                }} className="bg-slate-800 text-white px-6 py-2 rounded-lg mb-8 text-[10px] font-black uppercase tracking-widest border border-slate-700">COPY INVITE LINK</button>

                {/* JOINED PLAYERS LIST */}
                <div className="mb-8 text-left">
                    <h3 className="text-yellow-500 text-[10px] font-black uppercase mb-3 tracking-widest text-center">Joined Players ({playerCount}/{roomData.playersLimit})</h3>
                    <div className="flex flex-wrap justify-center gap-2">
                        {/* Example: Players list loop ikkada untundi */}
                        <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold border border-green-500/30">You (Host)</div>
                        {playerCount > 1 && <div className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs font-bold border border-blue-500/30">Friend Joined!</div>}
                    </div>
                </div>

                <button onClick={() => setView('join_screen')} className="w-full bg-green-600 py-4 rounded-2xl text-white font-black text-lg uppercase shadow-lg">Open Dashboard</button>
            </div>
        </div>
    );

    // --- 3. JOIN SCREEN ---
    if (view === 'join_screen') return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#0f172a] p-6 text-white text-center">
            <div className="bg-[#1e293b] p-10 rounded-[40px] w-full max-w-md border-t-8 border-yellow-500 shadow-2xl">
                <h2 className="text-3xl font-black text-yellow-400 mb-6 uppercase italic">Join {roomData.name}</h2>
                <input placeholder="Enter Your Name" className="w-full p-4 mb-8 bg-[#0f172a] rounded-2xl border border-slate-700 outline-none focus:border-yellow-500" 
                    onChange={e => setJoinData({ name: e.target.value })} />
                <button onClick={handleJoin} className="w-full bg-yellow-500 py-4 rounded-2xl text-black font-black text-lg uppercase shadow-xl">Join Now</button>
            </div>
        </div>
    );

    // --- 4. GAME DASHBOARD ---
    return (
        <div className="bg-[#0f172a] min-h-screen p-4 flex flex-col items-center text-white">
            <div className="w-full max-w-2xl bg-[#1e293b] p-6 rounded-3xl border-b-4 border-yellow-500 flex justify-between items-center mb-10 shadow-2xl">
                <div>
                    <h4 className="text-yellow-400 font-bold uppercase text-[10px] tracking-widest mb-1">Live Game</h4>
                    <p className="text-xl font-black">{playerCount} / {maxPlayers} Joined</p>
                </div>
                <button disabled={playerCount < maxPlayers} onClick={() => socket.current.send(JSON.stringify({action:'start_game'}))}
                    className={`px-10 py-3 rounded-2xl font-black text-sm tracking-widest transition-all ${playerCount < maxPlayers ? 'bg-slate-800 text-slate-600' : 'bg-green-600 shadow-lg'}`}>
                    {playerCount < maxPlayers ? 'WAITING...' : 'START'}
                </button>
            </div>
            {/* Ticket rendering logic ikkada untundi */}
        </div>
    );
}

export default App;