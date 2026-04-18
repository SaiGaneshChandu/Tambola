import React, { useState, useEffect } from 'react';
import { useSocket } from './useSocket';

function App() {
    const [view, setView] = useState('lobby'); 
    const [roomData, setRoomData] = useState({ players: 2, password: '', roomName: '' });
    const [joinData, setJoinData] = useState({ name: '', password: '' });
    
    const { socket, lastNumber, calledNumbers, ticket, playerCount, maxPlayers } = useSocket(roomData.roomName || "");

    // Anni fields fill ayyayo ledho check cheyyadaniki
    const isSetupValid = joinData.name.trim() !== '' && roomData.password.length === 4;
    const isJoinValid = joinData.name.trim() !== '' && joinData.password !== '';

    useEffect(() => {
        const path = window.location.pathname.split('/join/')[1];
        if (path) {
            setRoomData(prev => ({ ...prev, roomName: path }));
            setView('join_screen');
        }
    }, []);

    const createRoom = () => {
        if (!isSetupValid) return;
        const generatedRoom = "TAMBOLA-" + Math.random().toString(36).substring(7).toUpperCase();
        setRoomData(prev => ({ ...prev, roomName: generatedRoom }));
        socket.current.send(JSON.stringify({
            action: 'setup_room',
            password: roomData.password,
            max_players: roomData.players
        }));
        setView('invite');
    };

    const joinRoom = () => {
        if (!isJoinValid) return;
        socket.current.send(JSON.stringify({
            action: 'join_game',
            player_name: joinData.name,
            password: joinData.password || roomData.password
        }));
        setView('game');
    };

    const copyLink = () => {
        const link = `${window.location.origin}/join/${roomData.roomName}`;
        navigator.clipboard.writeText(link);
        alert("Invitation Link Copied!");
    };

    // --- LOBBY SCREEN ---
    if (view === 'lobby') {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-950 p-6">
                <div className="bg-slate-900 p-8 rounded-3xl shadow-2xl w-full max-w-md border border-slate-800">
                    <h1 className="text-4xl font-black text-yellow-400 mb-8 text-center italic">TAMBOLA SETUP</h1>
                    
                    <label className="text-slate-500 text-xs font-bold uppercase mb-2 block">Host Name *</label>
                    <input className="w-full p-4 mb-5 bg-slate-800 rounded-xl text-white border border-slate-700 outline-none focus:border-yellow-400" 
                           onChange={e => setJoinData({...joinData, name: e.target.value})} placeholder="Enter your name" />
                    
                    <label className="text-slate-500 text-xs font-bold uppercase mb-2 block">Max Players (2-15) *</label>
                    <select className="w-full p-4 mb-5 bg-slate-800 rounded-xl text-white border border-slate-700 outline-none cursor-pointer"
                            onChange={e => setRoomData({...roomData, players: e.target.value})}>
                        {[...Array(14)].map((_, i) => <option key={i+2} value={i+2}>{i+2} Players</option>)}
                    </select>
                    
                    <label className="text-slate-500 text-xs font-bold uppercase mb-2 block">Room Password (4-Digits) *</label>
                    <input type="password" maxLength="4" className="w-full p-4 mb-8 bg-slate-800 rounded-xl text-white border border-slate-700 outline-none focus:border-yellow-400" 
                           onChange={e => setRoomData({...roomData, password: e.target.value})} placeholder="****" />
                    
                    <button 
                        disabled={!isSetupValid}
                        onClick={createRoom} 
                        className={`w-full py-5 rounded-2xl font-black transition-all shadow-lg uppercase tracking-wider ${isSetupValid ? 'bg-yellow-500 text-black hover:bg-yellow-400' : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`}>
                        Create Room
                    </button>
                    {!isSetupValid && <p className="text-[10px] text-red-500 mt-3 text-center">* Please fill all fields to continue</p>}
                </div>
            </div>
        );
    }

    // --- INVITE SCREEN ---
    if (view === 'invite') {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-950 p-6 text-white text-center">
                <div className="bg-slate-900 p-10 rounded-3xl w-full max-w-md border border-slate-800 shadow-2xl">
                    <h2 className="text-2xl font-bold mb-2">Room Ready!</h2>
                    <p className="text-slate-400 mb-8 text-sm">Copy the link and send to your friends.</p>
                    <div className="bg-slate-950 p-4 rounded-xl mb-8 flex items-center justify-between border border-slate-800">
                        <span className="text-xs text-yellow-400 truncate mr-4">{window.location.origin}/join/{roomData.roomName}</span>
                        <button onClick={copyLink} className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg text-xs font-bold">COPY</button>
                    </div>
                    <button onClick={joinRoom} className="w-full bg-green-600 py-4 rounded-2xl font-bold hover:bg-green-500 shadow-lg">Enter Game Board</button>
                </div>
            </div>
        );
    }

    // --- JOIN SCREEN ---
    if (view === 'join_screen') {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-950 p-6">
                <div className="bg-slate-900 p-8 rounded-3xl w-full max-w-md border border-slate-800 shadow-2xl text-white">
                    <h2 className="text-2xl font-bold mb-8 text-center italic">JOINING GAME</h2>
                    <input placeholder="Enter Your Name *" className="w-full p-4 mb-4 bg-slate-800 rounded-xl text-white border border-slate-700 outline-none focus:border-yellow-400" onChange={e => setJoinData({...joinData, name: e.target.value})} />
                    <input type="password" placeholder="Room Password *" className="w-full p-4 mb-8 bg-slate-800 rounded-xl text-white border border-slate-700 outline-none focus:border-yellow-400" onChange={e => setJoinData({...joinData, password: e.target.value})} />
                    <button 
                        disabled={!isJoinValid}
                        onClick={joinRoom} 
                        className={`w-full py-4 rounded-2xl font-black uppercase shadow-lg ${isJoinValid ? 'bg-yellow-500 text-black hover:bg-yellow-400' : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`}>
                        Join Now
                    </button>
                </div>
            </div>
        );
    }

    // --- GAME BOARD ---
    return (
        <div className="bg-slate-950 min-h-screen p-6 flex flex-col items-center text-white">
            <div className="w-full max-w-2xl flex justify-between items-center mb-8 bg-slate-900 p-4 rounded-2xl border-b-4 border-yellow-500">
                <div>
                    <h3 className="text-yellow-400 font-bold">Room: {roomData.roomName}</h3>
                    <p className="text-xs text-slate-500">Players: {playerCount} / {maxPlayers || roomData.players}</p>
                </div>
                <button 
                    disabled={playerCount < (maxPlayers || roomData.players)}
                    onClick={() => socket.current.send(JSON.stringify({action: 'start_game'}))}
                    className={`px-8 py-2 rounded-full font-black text-sm transition-all ${playerCount < (maxPlayers || roomData.players) ? 'bg-slate-800 text-slate-600' : 'bg-green-600 text-white animate-pulse'}`}
                >
                    {playerCount < (maxPlayers || roomData.players) ? 'WAITING...' : 'START GAME'}
                </button>
            </div>
            
            <div className="bg-slate-900 rounded-full w-32 h-32 flex items-center justify-center text-6xl font-black mb-10 border-8 border-slate-800 shadow-2xl text-yellow-400 italic">
                {lastNumber}
            </div>

            <div className="bg-slate-900 p-3 rounded-2xl shadow-2xl border border-slate-800">
                {ticket && ticket.map((row, i) => (
                    <div key={i} className="flex">
                        {row.map((num, j) => (
                            <div key={j} onClick={(e) => calledNumbers.includes(num) && (e.target.classList.add('bg-yellow-500', 'text-black', 'scale-105'))}
                                className={`w-14 h-14 border border-slate-800 flex items-center justify-center font-bold text-xl cursor-pointer transition-all m-0.5 rounded ${num === 0 ? 'bg-slate-950/50' : 'bg-slate-800 text-slate-300'}`}>
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