import React, { useState, useEffect } from 'react';
import { Button } from './Button';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: string;
  currentEmail?: string;
  onUpdateUser: (name: string, email: string) => void;
  accentColor: string;
}

export const UserModal: React.FC<UserModalProps> = ({ 
  isOpen, onClose, currentUser, currentEmail = '', onUpdateUser, accentColor 
}) => {
  const [name, setName] = useState(currentUser);
  const [email, setEmail] = useState(currentEmail);

  // Sync state when props change or modal opens
  useEffect(() => {
    if (isOpen) {
      setName(currentUser);
      setEmail(currentEmail || '');
    }
  }, [isOpen, currentUser, currentEmail]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onUpdateUser(name.trim(), email.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-fade-in">
        <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Mon Profil</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Modifier mon nom</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 outline-none"
                        style={{ '--tw-ring-color': accentColor } as any}
                        placeholder="Votre pseudo"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Adresse Email
                        <span className="text-[10px] text-gray-400 ml-2 font-normal">(Pour les invits & CR)</span>
                    </label>
                    <div className="relative">
                        <i className="fas fa-envelope absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 outline-none"
                            style={{ '--tw-ring-color': accentColor } as any}
                            placeholder="exemple@equipe.com"
                        />
                    </div>
                </div>
                
                <div className="flex gap-3 pt-2">
                    <Button type="button" variant="ghost" onClick={onClose} className="flex-1 justify-center">
                        Annuler
                    </Button>
                    <Button type="submit" className="flex-1 justify-center" style={{ backgroundColor: accentColor }}>
                        Enregistrer
                    </Button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};