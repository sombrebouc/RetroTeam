import React, { useState, useRef, useEffect } from 'react';
import { RetroZone } from '../types';

interface ZoneComponentProps {
  zone: RetroZone;
  isEditMode: boolean;
  onUpdate: (updatedZone: RetroZone) => void;
  onDelete: (id: string) => void;
}

export const ZoneComponent: React.FC<ZoneComponentProps> = ({ zone, isEditMode, onUpdate, onDelete }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const startPos = useRef({ x: 0, y: 0 });

  // Handle Dragging (Move)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isEditMode) return;
    // Don't drag if clicking input or resize handle
    if ((e.target as HTMLElement).closest('.resize-handle') || (e.target as HTMLElement).tagName === 'INPUT') return;
    
    e.stopPropagation(); // Prevent canvas panning
    setIsDragging(true);
    startPos.current = { x: e.clientX, y: e.clientY };
  };

  // Handle Resizing
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    if (!isEditMode) return;
    e.stopPropagation();
    setIsResizing(true);
    startPos.current = { x: e.clientX, y: e.clientY };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const dx = (e.clientX - startPos.current.x);
        const dy = (e.clientY - startPos.current.y);
        
        onUpdate({
            ...zone,
            x: zone.x + dx,
            y: zone.y + dy
        });
        startPos.current = { x: e.clientX, y: e.clientY };
      } else if (isResizing) {
        const dx = (e.clientX - startPos.current.x);
        const dy = (e.clientY - startPos.current.y);
        
        onUpdate({
            ...zone,
            width: Math.max(100, zone.width + dx),
            height: Math.max(60, zone.height + dy)
        });
        startPos.current = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, zone, onUpdate]);

  return (
    <div
      onMouseDown={handleMouseDown}
      className={`absolute transition-colors duration-200 flex flex-col overflow-hidden shadow-sm
        ${isEditMode ? 'cursor-move border-2 border-dashed border-blue-400 bg-white z-10' : 'z-0'}
      `}
      style={{
        left: zone.x,
        top: zone.y,
        width: zone.width,
        height: zone.height,
        backgroundColor: '#FFFFFF', // Opaque white background as requested
        border: isEditMode ? undefined : `2px solid ${zone.color}`,
        borderRadius: '16px',
      }}
    >
        {/* Header / Title - OPAQUE Background, no texture */}
        <div 
          className="p-3 border-b border-black/5 flex items-center justify-between z-10 relative bg-white" 
          style={{ borderColor: `${zone.color}40` }}
        >
            {isEditMode ? (
                <input 
                    type="text" 
                    value={zone.title}
                    onChange={(e) => onUpdate({...zone, title: e.target.value})}
                    className="bg-white/80 border border-gray-300 rounded px-2 py-1 text-base font-bold w-full mr-2"
                    placeholder="Nom de la zone"
                />
            ) : (
                <span 
                    className="font-black text-lg md:text-xl uppercase tracking-widest block w-full text-center truncate" 
                    style={{ 
                        color: zone.color, 
                        opacity: 1,
                        // Clean flat text, no shadow
                    }}
                >
                    {zone.title}
                </span>
            )}

            {isEditMode && (
                <button 
                    onClick={() => onDelete(zone.id)}
                    className="text-red-500 hover:text-red-700 w-6 h-6 flex items-center justify-center bg-white rounded-full shadow-sm"
                >
                    <i className="fas fa-times text-sm"></i>
                </button>
            )}
        </div>

        {/* Content Body - TEXTURE applied here */}
        <div className="flex-1 w-full h-full relative overflow-hidden texture-stripes">
             {/* Optional: Add a very light tint of the zone color to the body for branding, keeping it clean */}
             <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundColor: zone.color }}></div>
        </div>

        {/* Color Picker (Edit Mode Only) */}
        {isEditMode && (
            <div className="absolute top-12 right-2 flex flex-col gap-1 bg-white p-1 rounded shadow-md z-20">
                {['#3B82F6', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6'].map(c => (
                    <button
                        key={c}
                        className={`w-5 h-5 rounded-full border border-gray-200 ${zone.color === c ? 'ring-2 ring-offset-1 ring-gray-400' : ''}`}
                        style={{ backgroundColor: c }}
                        onClick={() => onUpdate({ ...zone, color: c })}
                    />
                ))}
            </div>
        )}

        {/* Resize Handle */}
        {isEditMode && (
            <div 
                className="resize-handle absolute bottom-0 right-0 w-8 h-8 cursor-nwse-resize flex items-center justify-center text-blue-400 z-20"
                onMouseDown={handleResizeMouseDown}
            >
                <i className="fas fa-caret-right transform rotate-45 text-2xl"></i>
            </div>
        )}
    </div>
  );
};