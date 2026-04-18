import React, { useState } from 'react';
import { useSocket } from './useSocket';

// --- Create Room Component ---
const CreateRoomForm = ({ onJoin }) => {
  const [formData, setFormData] = useState({ name: '', players: 2, password: '' });

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 p-4">
      <div className="bg-slate-800 p-8 rounded-3xl shadow-2xl w-full max-w-md border border-slate-700">
        <h1 className="text-3xl font-black text-yellow-400 mb-6 text-center italic">TAMBOLA 2K26</h1>
        
        <label className="text-slate-400 text-xs font-bold uppercase">Your Name</label>
        <input 
          className="w-full p-3 mb-4 bg-slate-900 rounded-xl text-white border border-slate-600 focus:border-yellow-400 outline-none" 
          onChange={(e) => setFormData({...formData, name: e.target.value})} 
          placeholder="Enter your name"
        />

        <label className="text-slate-400 text-xs font-bold uppercase">Max Players (1-15)</label>
        <select 
          className="w-full p-3 mb-4 bg-slate-900 rounded-xl text-white border border-slate-600"
          onChange={(e) => setFormData({...formData, players: e.target.value})}
        >
          {[...Array(15)].map((_, i) => <option key={i+1} value={i+1}>{i+1} Players</option>)}
        </select>

        <label className="text-slate-400 text-xs font-bold uppercase">4-Digit Password</label>
        <input 
          type="password" 
          maxLength="4" 
          className="w-full p-3 mb-8 bg-slate-900 rounded-xl text-white border border-slate-600"
          onChange={(e) => setFormData({...formData, password: e.target.value})} 
          placeholder="****"
        />

        <button 
          onClick={() => onJoin(formData)} 
          className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black py-4 rounded-2xl transition-all active:scale-95"
        >
          CREATE ROOM & START
        </button>
      </div>
    </div>
  );
};

// --- Main App Component ---
function App() {
  const [user, setUser] = useState(null);
  const [roomId, setRoomId] = useState('');
  
  // Custom hook for WebSocket logic
  const { calledNumbers, currentNumber, winnerData, startGame, isConnected } = useSocket(roomId);

  const handleJoin = (data) => {
    const rId = "TAMBOLA-" + Math.random().toString(36).substring(7).toUpperCase();
    setRoomId(rId);
    setUser(data);
  };

  if (!user) return <CreateRoomForm onJoin={handleJoin} />;

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header with Invitation Link */}
        <div className="flex justify-between items-center mb-6 bg-slate-800 p-4 rounded-2xl border-b-4 border-yellow-500">
          <div>
            <h2 className="text-yellow-400 font-bold">Room: {roomId}</h2>
            <p className="text-[10px] text-slate-400">Status: {isConnected ? '🟢 Online' : '🔴 Connecting...'}</p>
          </div>
          <button 
            onClick={startGame}
            className="bg-green-600 px-6 py-2 rounded-full font-bold hover:bg-green-500 transition-colors"
          >
            START GAME
          </button>
        </div>

        {/* Current Number Display */}
        <div className="text-center mb-8">
          <div className="text-6xl font-black text-yellow-400 bg-slate-800 w-32 h-32 flex items-center justify-center rounded-full mx-auto border-8 border-slate-700 shadow-2xl">
            {currentNumber}
          </div>
          <p className="mt-2 text-slate-400 uppercase tracking-widest text-sm font-bold">Current Number</p>
        </div>

        {/* Winner Announcement */}
        {winnerData && (
          <div className="bg-yellow-500 text-black p-3 rounded-xl mb-4 text-center font-bold animate-bounce">
             🏆 {winnerData.name}: {winnerData.message}
          </div>
        )}

        {/* Board Grid */}
        <div className="grid grid-cols-10 gap-1 bg-slate-800 p-4 rounded-xl">
          {[...Array(90)].map((_, i) => (
            <div 
              key={i+1} 
              className={`h-8 flex items-center justify-center text-[10px] rounded transition-all duration-300 ${
                calledNumbers.includes(i+1) 
                  ? 'bg-yellow-500 text-black font-bold scale-110 shadow-lg' 
                  : 'bg-slate-700 text-slate-500'
              }`}
            >
              {i+1}
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="mt-6 text-center text-slate-500 text-xs">
          Invite Link: {window.location.origin}/join/{roomId}
        </div>
      </div>
    </div>
  );
}

export default App;