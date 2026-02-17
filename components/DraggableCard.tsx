import React from 'react';
import { RetroCard, ColumnType } from '../types';

interface DraggableCardProps {
  card: RetroCard;
  onVote: (id: string) => void;
  onDelete: (id: string) => void;
  isReflectionMode: boolean;
  onDragStart: (e: React.DragEvent, id: string) => void;
  inCanvas?: boolean;
  onCardDrop?: (sourceId: string, targetId: string) => void; // Pour le tri
}

export const DraggableCard: React.FC<DraggableCardProps> = ({
  card,
  onVote,
  onDelete,
  isReflectionMode,
  onDragStart,
  inCanvas = false,
  onCardDrop
}) => {
  
  // Couleurs style Post-it
  const getColors = (type: ColumnType) => {
    switch (type) {
      case ColumnType.POSITIVE: return 'bg-green-100 border-green-200 text-green-900 rotate-1';
      case ColumnType.NEGATIVE: return 'bg-red-100 border-red-200 text-red-900 -rotate-1';
      case ColumnType.CONTINUE: return 'bg-yellow-100 border-yellow-200 text-yellow-900 rotate-0';
      default: return 'bg-white border-gray-200';
    }
  };

  const style = inCanvas 
    ? { position: 'absolute' as const, left: card.x, top: card.y, zIndex: 10 } 
    : { position: 'relative' as const };

  const handleDragOver = (e: React.DragEvent) => {
    // Si on est dans la liste (pas dans le canvas), on autorise le drop pour le tri
    if (!inCanvas && onCardDrop) {
      e.preventDefault(); 
      e.dataTransfer.dropEffect = 'move';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    if (!inCanvas && onCardDrop) {
      e.preventDefault();
      e.stopPropagation(); // Empêche le drop d'aller jusqu'au container parent s'il y en a un
      const sourceId = e.dataTransfer.getData('cardId');
      if (sourceId && sourceId !== card.id) {
        onCardDrop(sourceId, card.id);
      }
    }
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, card.id)}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={style}
      className={`
        w-64 p-4 shadow-md rounded-sm border cursor-move transition-transform hover:scale-105 active:scale-95 flex flex-col justify-between
        texture-paper
        ${getColors(card.column)}
        ${inCanvas ? 'shadow-lg min-h-[160px]' : 'mb-3 hover:shadow-lg hover:z-10 min-h-[140px]'}
      `}
    >
        {/* Pin effect */}
        {inCanvas && (
             <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-red-400 shadow-sm border border-red-500 z-20"></div>
        )}

      {isReflectionMode && !card.isRevealed ? (
        <div className="flex flex-col items-center justify-center flex-1 text-gray-500/50">
          <i className="fas fa-eye-slash text-2xl mb-2"></i>
          <span className="text-xs font-medium uppercase tracking-widest">Masqué</span>
        </div>
      ) : (
        <>
          <p className="text-sm md:text-base mb-4 leading-relaxed whitespace-pre-wrap font-medium flex-1">
            {card.text}
          </p>
          
          <div className="mt-auto">
            {/* Author Name */}
            {card.author && (
              <div className="text-right mb-2">
                <span className="text-[10px] text-black/40 italic">
                  — {card.author}
                </span>
              </div>
            )}
            
            <div className="flex justify-between items-center border-t border-black/10 pt-2">
               <div className="flex gap-1">
                   <span className={`text-[10px] px-1.5 py-0.5 rounded-full border border-black/10 bg-white/30 uppercase tracking-wider`}>
                      {card.column === 'POSITIVE' ? 'Positif' : card.column === 'NEGATIVE' ? 'Négatif' : 'À Suivre'}
                   </span>
               </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => { e.stopPropagation(); onVote(card.id); }}
                  className="text-xs font-bold hover:scale-125 transition-transform flex items-center gap-1"
                >
                  <i className="fas fa-thumbs-up"></i>
                  {card.votes > 0 && <span>{card.votes}</span>}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(card.id); }}
                  className="text-xs hover:text-red-600 transition-colors"
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};