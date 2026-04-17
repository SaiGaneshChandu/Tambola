import React, { useState } from 'react';

const Ticket = ({ ticketData }) => {
  // Marked numbers ni track cheyyadaniki state (User tap chesthe color marali)
  const [markedNumbers, setMarkedNumbers] = useState([]);

  const toggleMark = (num) => {
    if (!num) return; // Khali box ayithe em cheyyoddu
    
    if (markedNumbers.includes(num)) {
      setMarkedNumbers(markedNumbers.filter(n => n !== num));
    } else {
      setMarkedNumbers([...markedNumbers, num]);
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-2xl border-4 border-yellow-500 max-w-lg mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-black text-yellow-700 italic">MY TICKET</h3>
        <span className="text-xs font-bold bg-yellow-100 px-2 py-1 rounded">ID: #4052</span>
      </div>

      <div className="grid grid-cols-9 gap-1 bg-gray-300 p-1 rounded shadow-inner">
        {ticketData.map((row, rowIndex) => (
          row.map((num, colIndex) => {
            const isMarked = markedNumbers.includes(num);
            
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                onClick={() => toggleMark(num)}
                className={`
                  h-12 w-12 sm:h-14 sm:w-14 flex items-center justify-center 
                  text-lg font-bold rounded-sm transition-all duration-200
                  ${num 
                    ? (isMarked 
                        ? 'bg-yellow-400 text-white border-b-4 border-yellow-600 cursor-pointer scale-95' 
                        : 'bg-white text-blue-900 cursor-pointer hover:bg-yellow-50 shadow-sm')
                    : 'bg-gray-100'} 
                `}
              >
                {num || ""}
              </div>
            );
          })
        ))}
      </div>

      <div className="mt-4 text-center">
        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
          Click on a number to mark it
        </p>
      </div>
    </div>
  );
};

export default Ticket;