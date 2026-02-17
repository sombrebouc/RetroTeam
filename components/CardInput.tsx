import React, { useState } from 'react';
import { ColumnType } from '../types';
import { COLUMN_CONFIG } from '../constants';

interface CardInputProps {
  onAdd: (text: string, column: ColumnType) => void;
}

export const CardInput: React.FC<CardInputProps> = ({ onAdd }) => {
  const [text, setText] = useState('');
  const [selectedColumn, setSelectedColumn] = useState<ColumnType>(ColumnType.POSITIVE);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onAdd(text, selectedColumn);
      setText('');
    }
  };

  const config = COLUMN_CONFIG[selectedColumn];

  const getButtonStyles = (type: ColumnType, isSelected: boolean) => {
    // Base styles
    const base = "relative overflow-hidden rounded-xl transition-all duration-300 h-20 border-2 flex flex-col justify-start p-2 cursor-pointer group";
    
    // Specific styles per type
    if (type === ColumnType.POSITIVE) {
        return isSelected 
            ? `${base} bg-green-500 border-green-600 text-white shadow-md scale-105 z-10` 
            : `${base} bg-white border-green-100 hover:border-green-300 text-green-600 hover:bg-green-50`;
    } else if (type === ColumnType.NEGATIVE) {
        return isSelected 
            ? `${base} bg-red-500 border-red-600 text-white shadow-md scale-105 z-10` 
            : `${base} bg-white border-red-100 hover:border-red-300 text-red-600 hover:bg-red-50`;
    } else {
        // CONTINUE
        return isSelected 
            ? `${base} bg-blue-500 border-blue-600 text-white shadow-md scale-105 z-10` 
            : `${base} bg-white border-blue-100 hover:border-blue-300 text-blue-600 hover:bg-blue-50`;
    }
  };

  const getIconStyles = (type: ColumnType, isSelected: boolean) => {
      // The "Close up" effect style
      const base = "absolute -right-4 -bottom-6 text-7xl transform rotate-12 transition-all duration-300";
      
      if (isSelected) {
          // Darker watermark when active
          return `${base} opacity-20 scale-110`;
      } else {
          // Very light watermark when inactive
          return `${base} opacity-10 group-hover:opacity-20 group-hover:scale-110 grayscale group-hover:grayscale-0`;
      }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
       
       {/* Selector Grid */}
       <div className="grid grid-cols-3 gap-3 mb-4">
        {Object.values(ColumnType).map((type) => {
             const isSelected = selectedColumn === type;
             const conf = COLUMN_CONFIG[type];
             
             return (
                 <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedColumn(type)}
                    className={getButtonStyles(type, isSelected)}
                    title={conf.title}
                 >
                     {/* Label */}
                     <span className="relative z-10 text-[10px] font-bold uppercase tracking-widest text-left">
                        {type === 'POSITIVE' ? 'Positif' : type === 'NEGATIVE' ? 'Négatif' : 'À Suivre'}
                     </span>
                     
                     {/* Big Background Icon */}
                     <i className={`fas ${conf.icon} ${getIconStyles(type, isSelected)}`}></i>
                 </button>
             );
        })}
       </div>

      <form onSubmit={handleSubmit}>
        <div className="relative">
            <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Écrivez votre idée ici...`}
            className="w-full p-4 text-sm rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-gray-50/50 min-h-[100px] resize-none"
            />
            {/* Context indicator inside textarea */}
            <div className={`absolute bottom-3 right-3 text-xs font-medium px-2 py-1 rounded-md bg-white border shadow-sm opacity-70 pointer-events-none flex items-center gap-1
                ${selectedColumn === ColumnType.POSITIVE ? 'text-green-600 border-green-200' : 
                  selectedColumn === ColumnType.NEGATIVE ? 'text-red-600 border-red-200' : 
                  'text-blue-600 border-blue-200'}`}>
                <i className={`fas ${config.icon}`}></i>
                {config.title}
            </div>
        </div>

        <button
          type="submit"
          disabled={!text.trim()}
          className={`w-full mt-3 py-3 rounded-xl text-sm font-bold text-white transition-all flex items-center justify-center gap-2 shadow-sm
            ${!text.trim() 
                ? 'bg-gray-300 cursor-not-allowed' 
                : `hover:shadow-md hover:-translate-y-0.5 ${
                    selectedColumn === ColumnType.POSITIVE ? 'bg-green-600 hover:bg-green-700' :
                    selectedColumn === ColumnType.NEGATIVE ? 'bg-red-600 hover:bg-red-700' :
                    'bg-blue-600 hover:bg-blue-700'
                }`
            }
          `}
        >
          <i className="fas fa-plus"></i> Ajouter au brouillon
        </button>
      </form>
    </div>
  );
};