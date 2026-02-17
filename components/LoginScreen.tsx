import React, { useState } from 'react';
import { Button } from './Button';

interface LoginScreenProps {
  onJoin: (name: string) => void;
  accentColor: string;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onJoin, accentColor }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onJoin(name.trim());
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-gray-50 overflow-hidden relative">
      {/* Abstract Background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ 
             backgroundImage: `radial-gradient(${accentColor} 1px, transparent 1px)`,
             backgroundSize: '30px 30px' 
           }} 
      />
      <div 
        className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/3"
        style={{ backgroundColor: accentColor }}
      />
      <div 
        className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl opacity-20 translate-y-1/3 -translate-x-1/3"
        style={{ backgroundColor: accentColor }}
      />

      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md z-10 border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2" style={{ backgroundColor: accentColor }}></div>
        
        <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-white text-2xl shadow-lg" style={{ backgroundColor: accentColor }}>
                <i className="fas fa-rocket"></i>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Bienvenue sur RetroFlow</h1>
            <p className="text-gray-500 text-sm mt-2">Rejoignez votre équipe pour la rétrospective</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Comment vous appelez-vous ?</label>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <i className="fas fa-user"></i>
                    </span>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Votre prénom"
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 outline-none transition-all"
                        style={{ focusRing: accentColor }}
                        autoFocus
                    />
                </div>
            </div>

            <Button 
                type="submit" 
                className="w-full justify-center py-3 text-lg shadow-lg hover:shadow-xl hover:-translate-y-1"
                style={{ backgroundColor: accentColor }}
                disabled={!name.trim()}
            >
                Rejoindre la session
            </Button>
        </form>
      </div>
    </div>
  );
};