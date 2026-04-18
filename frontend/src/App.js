import React, { useState, useEffect } from 'react';
import { useSocket } from './useSocket';

function App() {
    const [page, setPage] = useState('home'); // 'home' or 'game_room'
    const [roomData, setRoomData] = useState({ name: '', password: '', playersLimit: 2 });
    const [joinData, setJoinData] = useState({ name: '', isJoined: false });
    
    const { socket, lastNumber, calledNumbers, ticket, playerCount, maxPlayers, playersList } = useSocket(roomData.name || "");

    // 1. URL DETECTOR (Gemini Format)
    useEffect(() => {
        const pathParts = window.location.pathname.split('/').filter(p => p !== "");
        if (pathParts.length >= 2) {
            // URL lo data unte direct ga game_room page ki vellipothundi
            setRoomData(prev => ({ ...prev, name: pathParts[0], password: pathParts[1] }));
            setPage('game_room'); 
        } else {
            setPage('home');
        }
    }, []);

    // 2. CREATE ROOM (Link Generate ayyi URL marustundi)
    const handleCreate = () => {
        if(!roomData.name || !roomData.password) return alert("Fill Name and Password!");
        
        // URL change: domain.com/Sai/1111
        const newUrl = `${window.location.origin}/${roomData.name}/${roomData.password}`;
        window.history.pushState({}, '', newUrl);

        socket.current.send(JSON.stringify({ 
            action: 'setup_room', password: roomData.password, max_players: roomData.playersLimit 
        }));
        setPage('game_room');
    };

    const handleJoin = () => {
        if(!joinData.name) return alert("Enter your name!");
        socket.current.send(JSON.stringify({ 
            action: 'join_game', player_name: joinData.name, password: roomData.password 
        }));
        setJoinData({ ...joinData, isJoined: true });
    };

    // --- PAGE 1: HOME (Only Create Room) ---
    if (page === 'home') return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#020617] p-6 text-white font-sans">
            <div className="bg-[#0f172a] p-10 rounded-[40px] w-full max-w-md border-t-8 border-yellow-500 shadow-2xl">
                <h1 className="text-4xl font-black text-yellow-400 mb-8 text-center italic tracking-tighter">TAMBOLA 2K26</h1>
                <div className="space-y-6">
                    <input placeholder="Room Name (e.g. Sai)" className="w-full p-5 bg-[#020617] rounded-2xl border border-slate-700 outline-none focus:border-yellow-500 font-bold" 
                        onChange={e => setRoomData({...roomData, name: e.target.value.trim()})} />
                    <input placeholder="Password (e.g. 1111)" className="w-full p-5 bg-[#020617] rounded-2xl border border-slate-700 outline-none focus:border-yellow-500 font-bold" 
                        onChange={e => setRoomData({...roomData, password: e.target.value.trim()})} />
                    <select className="w-full p-5 bg-[#020617] rounded-2xl border border-slate-700 font-bold" 
                        onChange={e => setRoomData({...roomData, playersLimit: e.target.value})}>
                        {[...Array(14)].map((_, i) => <option key={i+2} value={i+2}>{i+2} Players Mode</option>)}
                    </select>
                    <button onClick={handleCreate} className="w-full bg-yellow-500 py-5 rounded-2xl text-black font-black uppercase text-xl shadow-xl hover:bg-yellow-400 transition-all">
                        Create Game Room
                    </button>
                </div>
            </div>
        </div>
    );

    // --- PAGE 2: GAME ROOM (Invite & Dashboard) ---
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#020617] p-6 text-white">
            
            {/* User inka join avvaka pothe Join Screen chupinchali */}
            {!joinData.isJoined ? (
                <div className="bg-[#0f172a] p-10 rounded-[40px] w-full max-w-md border-t-8 border-yellow-500 shadow-2xl text-center">
                    <h2 className="text-3xl font-black text-yellow-400 mb-2 uppercase italic tracking-tighter">{roomData.name}</h2>
                    <p className="text-[10px] text-slate-500 mb-10 uppercase tracking-widest font-bold">Official Game Lobby</p>
                    
                    <input placeholder="Your Player Name" className="w-full p-5 mb-10 bg-[#020617] rounded-2xl border border-slate-700 outline-none focus:border-yellow-500 font-bold" 
                        onChange={e => setJoinData({ ...joinData, name: e.target.value })} />
                    
                    <button onClick={handleJoin} className="w-full bg-yellow-500 py-5 rounded-2xl text-black font-black text-xl uppercase shadow-xl hover:bg-yellow-400 transition-all">
                        Join Room
                    </button>
                </div>
            ) : (
                /* --- DASHBOARD: Only Players List and Game --- */
                <div className="w-full max-w-3xl">
                    <div className="bg-[#0f172a] p-8 rounded-[40px] border-b-8 border-yellow-500 shadow-2xl mb-10">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h4 className="text-yellow-400 font-bold text-[10px] uppercase tracking-widest mb-1">Players in Room</h4>
                                <p className="text-2xl font-black">{playerCount} / {maxPlayers}</p>
                            </div>
                            <button 
                                disabled={playerCount < maxPlayers}
                                onClick={() => socket.current.send(JSON.stringify({action:'start_game'}))}
                                className={`px-10 py-4 rounded-2xl font-black text-sm tracking-widest transition-all ${playerCount < maxPlayers ? 'bg-slate-800 text-slate-600' : 'bg-green-600 shadow-lg shadow-green-500/30 active:scale-95'}`}>
                                {playerCount < maxPlayers ? 'WAITING FOR OTHERS' : 'START GAME'}
                            </button>
                        </div>

                        {/* LIVE PLAYERS LIST - Nuvvu adigina main feature */}
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            {playersList && playersList.map((player, idx) => (
                                <div key={idx} className="bg-[#020617] p-3 rounded-xl border border-slate-800 flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                    <span className="text-sm font-bold text-slate-300">{player}</span>
                                </div>
                            ))}
                        </div>

                        {/* INVITE LINK BOX - Share cheyyadaniki */}
                        <div className="bg-[#020617] p-4 rounded-2xl border border-slate-800 text-center">
                            <p className="text-[10px] text-slate-500 uppercase mb-2 font-bold tracking-widest">Share Invite Link</p>
                            <p className="text-yellow-400 font-mono text-[10px] mb-3 break-all">{window.location.href}</p>
                            <button onClick={() => {
                                navigator.clipboard.writeText(window.location.href);
                                alert("Link Copied!");
                            }} className="text-[10px] font-black text-white bg-slate-800 px-4 py-1 rounded-md uppercase border border-slate-700">Copy Link</button>
                        </div>
                    </div>

                    {/* GAME SECTION */}
                    <div className="flex flex-col items-center">
                        <div className="bg-[#0f172a] rounded-full w-28 h-28 flex items-center justify-center text-5xl font-black mb-12 border-4 border-yellow-500 text-yellow-400 shadow-[0_0_60px_rgba(250,204,21,0.15)] italic">
                            {lastNumber || "?"}
                        </div>

                        <div className="bg-[#0f172a] p-5 rounded-[40px] border border-slate-800 shadow-2xl">
                            {ticket && ticket.map((row, i) => (
                                <div key={i} className="flex">
                                    {row.map((num, j) => (
                                        <div key={j} className={`w-12 h-12 md:w-16 md:h-16 border border-slate-900/50 flex items-center justify-center font-black m-1 rounded-xl transition-all ${num === 0 ? 'bg-slate-900/30' : 'bg-[#1e293b] text-slate-500'}`}>
                                            {num !== 0 ? num : ""}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;