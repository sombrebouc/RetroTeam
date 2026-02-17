import React, { useState, useEffect } from 'react';
import { Button } from './Button';

interface RandomPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidates: string[]; // Liste des auteurs détectés sur le board
  currentUser: string;  // L'orchestrateur
  accentColor: string;
}

interface Participant {
  name: string;
  isEligible: boolean;
}

export const RandomPickerModal: React.FC<RandomPickerModalProps> = ({
  isOpen,
  onClose,
  candidates,
  currentUser,
  accentColor
}) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [newParticipant, setNewParticipant] = useState('');
  const [winner, setWinner] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [displayCandidate, setDisplayCandidate] = useState<string>('?');

  // Initialisation de la liste à l'ouverture
  useEffect(() => {
    if (isOpen) {
      const uniqueNames = Array.from(new Set([...candidates, currentUser])).filter(n => n && n.trim() !== '');
      
      const initialParticipants = uniqueNames.map(name => ({
        name,
        // Par défaut, tout le monde est éligible SAUF l'orchestrateur (currentUser)
        isEligible: name !== currentUser
      }));

      setParticipants(initialParticipants);
      setWinner(null);
      setDisplayCandidate('?');
    }
  }, [isOpen, candidates, currentUser]);

  const toggleEligibility = (name: string) => {
    setParticipants(prev => prev.map(p => 
      p.name === name ? { ...p, isEligible: !p.isEligible } : p
    ));
  };

  const handleAddParticipant = (e: React.FormEvent) => {
    e.preventDefault();
    if (newParticipant.trim() && !participants.find(p => p.name === newParticipant.trim())) {
      setParticipants(prev => [...prev, { name: newParticipant.trim(), isEligible: true }]);
      setNewParticipant('');
    }
  };

  const handleSpin = () => {
    const eligiblePool = participants.filter(p => p.isEligible);
    
    if (eligiblePool.length === 0) {
      alert("Aucun participant éligible sélectionné !");
      return;
    }

    if (eligiblePool.length === 1) {
        setWinner(eligiblePool[0].name);
        return;
    }

    setIsSpinning(true);
    setWinner(null);

    let counter = 0;
    const maxSpins = 30; // Nombre de changements de noms avant arrêt
    const speed = 100; // ms

    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * eligiblePool.length);
      setDisplayCandidate(eligiblePool[randomIndex].name);
      counter++;

      // Ralentissement vers la fin (simulation simple)
      if (counter > maxSpins) {
        clearInterval(interval);
        const finalWinner = eligiblePool[Math.floor(Math.random() * eligiblePool.length)];
        setDisplayCandidate(finalWinner.name);
        setWinner(finalWinner.name);
        setIsSpinning(false);
      }
    }, speed);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <i className="fas fa-dice text-purple-500"></i> Le Plouf Plouf
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          
          {/* Winner Display */}
          <div className="mb-8 text-center relative">
            <div className={`
              h-32 flex items-center justify-center rounded-2xl border-4 transition-all duration-300
              ${winner ? 'bg-yellow-50 border-yellow-400 scale-105 shadow-lg' : 'bg-gray-50 border-gray-200'}
            `}>
                {winner ? (
                    <div className="animate-bounce">
                        <i className="fas fa-trophy text-yellow-500 text-3xl mb-2 block"></i>
                        <span className="text-3xl font-black text-gray-800">{winner}</span>
                    </div>
                ) : (
                    <span className={`text-3xl font-bold ${isSpinning ? 'text-gray-800' : 'text-gray-300'}`}>
                        {displayCandidate}
                    </span>
                )}
            </div>
            {isSpinning && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                     <i className="fas fa-circle-notch fa-spin text-4xl text-blue-500/20"></i>
                </div>
            )}
          </div>

          {/* Config List */}
          {!isSpinning && !winner && (
            <>
                <div className="mb-4">
                    <h3 className="text-sm font-bold text-gray-700 mb-2">Participants éligibles</h3>
                    <p className="text-xs text-gray-500 mb-3 italic">
                        L'orchestrateur est exclu par défaut. Décochez celui qui a présenté la dernière fois.
                    </p>
                    
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                        {participants.map(p => (
                            <div 
                                key={p.name} 
                                onClick={() => toggleEligibility(p.name)}
                                className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors ${
                                    p.isEligible 
                                        ? 'bg-white border-gray-200 hover:border-blue-300' 
                                        : 'bg-gray-100 border-transparent opacity-60'
                                }`}
                            >
                                <span className={`text-sm font-medium ${p.isEligible ? 'text-gray-800' : 'text-gray-400 line-through'}`}>
                                    {p.name} {p.name === currentUser && '(Vous)'}
                                </span>
                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                    p.isEligible ? 'bg-blue-500 border-blue-600' : 'bg-white border-gray-300'
                                }`}>
                                    {p.isEligible && <i className="fas fa-check text-white text-xs"></i>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Add Manual */}
                <form onSubmit={handleAddParticipant} className="flex gap-2">
                    <input 
                        type="text" 
                        value={newParticipant}
                        onChange={(e) => setNewParticipant(e.target.value)}
                        placeholder="Ajouter un participant..."
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <Button type="submit" variant="ghost" className="px-3">
                        <i className="fas fa-plus"></i>
                    </Button>
                </form>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
             {winner ? (
                 <Button onClick={() => setWinner(null)} variant="ghost">
                    Recommencer
                 </Button>
             ) : (
                <Button onClick={onClose} variant="ghost">
                    Annuler
                </Button>
             )}
             
             {!winner && (
                <Button 
                    onClick={handleSpin} 
                    disabled={isSpinning || participants.filter(p => p.isEligible).length === 0}
                    className="w-40 justify-center"
                    style={{ backgroundColor: accentColor }}
                >
                    {isSpinning ? '...' : 'Tirer au sort'}
                </Button>
             )}
             
             {winner && (
                <Button onClick={onClose} variant="primary" style={{ backgroundColor: accentColor }}>
                    C'est parti !
                </Button>
             )}
        </div>
      </div>
    </div>
  );
};