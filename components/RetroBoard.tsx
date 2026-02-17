import React from 'react';
import { RetroCard, RetroZone } from '../types';
import { DraggableCard } from './DraggableCard';
import { ZoneComponent } from './ZoneComponent';

interface RetroCanvasProps {
  cards: RetroCard[];
  zones?: RetroZone[]; // Optional purely to avoid breaking instant renders if not passed yet
  onVote: (id: string) => void;
  onDelete: (id: string) => void;
  isReflectionMode: boolean;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  // Panning & Zoom props
  panOffset?: { x: number; y: number };
  zoomLevel?: number;
  onPanStart?: (e: React.MouseEvent) => void;
  isPanning?: boolean;
  onWheel?: (e: React.WheelEvent) => void;
  accentColor?: string;
  canvasColor?: string;
  // Zone Editing
  isZoneEditMode?: boolean;
  onUpdateZone?: (zone: RetroZone) => void;
  onDeleteZone?: (id: string) => void;
}

export const RetroBoard: React.FC<RetroCanvasProps> = ({ 
  cards, 
  zones = [],
  onVote, 
  onDelete, 
  isReflectionMode,
  onDrop,
  onDragOver,
  onDragStart,
  panOffset = { x: 0, y: 0 },
  zoomLevel = 1,
  onPanStart,
  isPanning,
  onWheel,
  accentColor = '#3B82F6',
  canvasColor = '#ffffff',
  isZoneEditMode = false,
  onUpdateZone,
  onDeleteZone
}) => {
  
  return (
    <div 
        className={`relative w-full h-full overflow-hidden shadow-2xl transition-all duration-500 border-l border-white/20 texture-noise ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onMouseDown={onPanStart}
        onWheel={onWheel}
        style={{
            // The canvas now uses the user-defined background color
            backgroundColor: canvasColor, 
            // We apply a subtle tint of the accent color using a gradient overlay and dots, mingled with the texture-noise class
            backgroundImage: `
                radial-gradient(${accentColor}40 1px, transparent 1px),
                linear-gradient(to bottom right, ${accentColor}10, ${accentColor}05)
            `,
            backgroundSize: `${20 * zoomLevel}px ${20 * zoomLevel}px, cover`,
            backgroundPosition: `${panOffset.x}px ${panOffset.y}px, 0 0`,
        }}
    >
      {/* Content Container moved by Pan Offset and Scaled */}
      <div 
        style={{ 
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
            transformOrigin: '0 0', // Important for consistent panning/zooming math
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            pointerEvents: 'none' // Let clicks pass through to container for panning if not hitting children
        }}
      >
        {/* Enable pointer events for cards and zones */}
        <div className="w-full h-full relative" style={{ pointerEvents: 'auto' }}>
            
            {/* ZONES LAYER */}
            {zones.map(zone => (
                <ZoneComponent
                    key={zone.id}
                    zone={zone}
                    isEditMode={isZoneEditMode}
                    onUpdate={onUpdateZone || (() => {})}
                    onDelete={onDeleteZone || (() => {})}
                />
            ))}

            {cards.length === 0 && zones.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ transform: `translate(${-panOffset.x}px, ${-panOffset.y}px) scale(${1/zoomLevel})` }}>
                    <div className="text-center p-8 rounded-3xl border-4 border-dashed border-gray-200 opacity-60">
                        <i className="fas fa-hand-pointer text-6xl mb-4 text-gray-300"></i>
                        <h2 className="text-2xl font-bold text-gray-400">Glissez vos cartes ici</h2>
                    </div>
                </div>
            )}

            {/* CARDS LAYER */}
            {cards.map(card => (
                <DraggableCard
                key={card.id}
                card={card}
                onVote={onVote}
                onDelete={onDelete}
                isReflectionMode={isReflectionMode}
                onDragStart={onDragStart}
                inCanvas={true}
                />
            ))}
        </div>
      </div>
    </div>
  );
};