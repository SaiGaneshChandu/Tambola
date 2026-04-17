import React from 'react';

const Board = ({ calledNumbers }) => {
  // 1 nundi 90 varaku array generate cheyyadam
  const numbers = Array.from({ length: 90 }, (_, i) => i + 1);

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-4 text-center text-blue-600">Game Board</h3>
      
      <div className="grid grid-cols-10 gap-2">
        {numbers.map((num) => {
          // Check if this number has been called by the server
          const isCalled = calledNumbers.includes(num);
          
          return (
            <div
              key={num}
              className={`
                h-10 w-10 flex items-center justify-center rounded-md border text-sm font-semibold
                transition-all duration-300
                ${isCalled 
                  ? 'bg-red-500 text-white border-red-700 scale-110 shadow-md' 
                  : 'bg-gray-50 text-gray-400 border-gray-200'}
              `}
            >
              {num}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex justify-center gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span>Called</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gray-200 rounded"></div>
          <span>Pending</span>
        </div>
      </div>
    </div>
  );
};

export default Board;