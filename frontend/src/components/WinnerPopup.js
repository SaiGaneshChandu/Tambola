import React from 'react';

const WinnerPopup = ({ winnerName, prizeType, onClose }) => {
  if (!winnerName) return null; // Evaru win avvakapothe em chupinchadu

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden transform transition-all animate-bounce-short">
        
        {/* Header with Celebration Image/Icon */}
        <div className="bg-yellow-400 p-6 text-center">
          <div className="text-6xl mb-2">🏆</div>
          <h2 className="text-2xl font-black text-yellow-900 uppercase tracking-tighter">
            We Have a Winner!
          </h2>
        </div>

        {/* Content */}
        <div className="p-8 text-center">
          <p className="text-gray-600 font-medium mb-1">Congratulations to</p>
          <h3 className="text-3xl font-bold text-blue-600 mb-4">{winnerName}</h3>
          
          <div className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-bold text-sm mb-6">
            🎉 Claimed: {prizeType}
          </div>

          <button
            onClick={onClose}
            className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition-colors"
          >
            Back to Game
          </button>
        </div>
        
        {/* Footer Decoration */}
        <div className="h-2 bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500"></div>
      </div>
    </div>
  );
};

export default WinnerPopup;