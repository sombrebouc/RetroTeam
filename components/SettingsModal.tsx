import React, { useRef } from 'react';
import { Button } from './Button';
import { ACCESSIBLE_ACCENT_COLORS, AVAILABLE_FONTS } from '../constants';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  setTitle: (t: string) => void;
  accentColor: string;
  setAccentColor: (c: string) => void;
  canvasColor: string;
  setCanvasColor: (c: string) => void;
  fontFamily: string;
  setFontFamily: (f: string) => void;
  backgroundImage: string | null;
  setBackgroundImage: (img: string | null) => void;
  titleColor?: string;
  setTitleColor: (c: string) => void;
  // Actions
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  onExportConfluence: () => void;
  onDownloadInvite: () => void;
  onSendReport: () => void;
  userEmail?: string;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen, onClose,
  title, setTitle,
  accentColor, setAccentColor,
  canvasColor, setCanvasColor,
  fontFamily, setFontFamily,
  backgroundImage, setBackgroundImage,
  titleColor = '#ffffff', setTitleColor,
  onExport, onImport, onClear,
  onExportConfluence,
  onDownloadInvite,
  onSendReport,
  userEmail
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const themeFileInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setBackgroundImage(ev.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExportTheme = () => {
    const themeData = {
        type: 'RETROFLOW_THEME',
        name: `Theme - ${title}`,
        accentColor,
        canvasColor,
        fontFamily,
        backgroundImage,
        titleColor
    };
    const blob = new Blob([JSON.stringify(themeData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `theme-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportTheme = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const data = JSON.parse(event.target?.result as string);
            // Validation basique pour s'assurer que c'est bien un fichier de thème ou un fichier compatible
            if (data.type === 'RETROFLOW_THEME' || (data.accentColor && !data.cards)) {
                if (data.accentColor) setAccentColor(data.accentColor);
                if (data.canvasColor) setCanvasColor(data.canvasColor);
                if (data.fontFamily) setFontFamily(data.fontFamily);
                if (data.titleColor) setTitleColor(data.titleColor);
                if (data.backgroundImage !== undefined) setBackgroundImage(data.backgroundImage);
                alert("Thème chargé avec succès !");
            } else {
                alert("Ce fichier ne semble pas être un thème valide (il contient peut-être des données de rétro ?).");
            }
        } catch (err) {
            alert("Erreur lors de la lecture du fichier de thème.");
        }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Determine input value based on whether it's a data URI or a regular URL
  const isDataUri = backgroundImage?.startsWith('data:');
  const imageUrlValue = isDataUri ? '' : (backgroundImage || '');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <i className="fas fa-cog text-blue-500"></i> Configuration
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Section 1: Identité */}
          <section>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 border-b pb-2">Général</h3>
            <div className="flex gap-4">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la rétrospective</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
                <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Couleur Titre</label>
                     <div className="flex items-center gap-2 border p-2 rounded-lg bg-gray-50 h-[42px]">
                        <input 
                            type="color" 
                            value={titleColor}
                            onChange={(e) => setTitleColor(e.target.value)}
                            className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                        />
                    </div>
                </div>
            </div>
          </section>

          {/* Section 2: Apparence */}
          <section>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 border-b pb-2">Personnalisation Visuelle</h3>
            
            <div className="space-y-4">
                
                {/* Couleur d'ambiance */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Couleur d'ambiance 
                        <span className="ml-1 text-[10px] text-gray-400 font-normal">(Contraste élevé pour l'accessibilité)</span>
                    </label>
                    <div className="flex gap-2 flex-wrap">
                        {ACCESSIBLE_ACCENT_COLORS.map((color) => (
                            <button
                                key={color.value}
                                onClick={() => setAccentColor(color.value)}
                                className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 ${
                                    accentColor === color.value ? 'border-gray-900 scale-110 shadow-md' : 'border-transparent'
                                }`}
                                style={{ backgroundColor: color.value }}
                                title={color.name}
                            >
                                {accentColor === color.value && <i className="fas fa-check text-white text-xs"></i>}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Couleur du canevas */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Couleur du canevas</label>
                    <div className="flex items-center gap-2 border p-2 rounded-lg bg-gray-50">
                        <input 
                            type="color" 
                            value={canvasColor}
                            onChange={(e) => setCanvasColor(e.target.value)}
                            className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                        />
                        <span className="text-xs text-gray-500 font-mono flex-1 uppercase">{canvasColor}</span>
                    </div>
                </div>

                {/* Typographie */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Typographie</label>
                    <select
                        value={fontFamily}
                        onChange={(e) => setFontFamily(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
                        style={{ fontFamily: fontFamily }}
                    >
                        {AVAILABLE_FONTS.map(font => (
                            <option key={font.name} value={font.value} style={{ fontFamily: font.value }}>
                                {font.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Image de fond */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Image de fond du tableau</label>
                    <div className="flex flex-col gap-3">
                        
                        {/* URL Input */}
                        <div className="relative">
                             <i className="fas fa-link absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                             <input 
                                type="text"
                                placeholder="Coller une URL d'image (https://...)"
                                value={imageUrlValue}
                                onChange={(e) => setBackgroundImage(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                             />
                             {isDataUri && (
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded border border-gray-200">
                                    Fichier local actif
                                </span>
                             )}
                        </div>

                        {/* Buttons Row */}
                        <div className="flex gap-2">
                             <Button 
                                onClick={() => bgInputRef.current?.click()} 
                                variant="ghost" 
                                icon="fa-upload"
                                className="flex-1 justify-center border-dashed border-2 text-xs"
                             >
                                Uploader Fichier
                             </Button>
                             {backgroundImage && (
                                 <Button 
                                    onClick={() => setBackgroundImage(null)} 
                                    variant="danger" 
                                    className="px-3"
                                    title="Supprimer l'image"
                                 >
                                    <i className="fas fa-trash"></i>
                                 </Button>
                             )}
                        </div>

                        <input 
                            type="file" 
                            ref={bgInputRef} 
                            onChange={handleBgUpload} 
                            className="hidden" 
                            accept="image/*"
                        />
                        
                        {/* Preview */}
                        {backgroundImage && (
                            <div className="h-28 w-full rounded-lg bg-cover bg-center border border-gray-200 shadow-sm relative group" style={{ backgroundImage: `url(${backgroundImage})` }}>
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors rounded-lg"></div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Gestion des thèmes */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gestion des thèmes</label>
                    <div className="flex gap-2">
                        <Button 
                            onClick={handleExportTheme} 
                            variant="ghost" 
                            icon="fa-palette" 
                            className="flex-1 justify-center text-xs border border-gray-300 bg-gray-50 hover:bg-white"
                        >
                            Exporter le thème
                        </Button>
                        <Button 
                            onClick={() => themeFileInputRef.current?.click()} 
                            variant="ghost" 
                            icon="fa-file-import" 
                            className="flex-1 justify-center text-xs border border-gray-300 bg-gray-50 hover:bg-white"
                        >
                            Importer un thème
                        </Button>
                    </div>
                    <input 
                        type="file" 
                        ref={themeFileInputRef} 
                        onChange={handleImportTheme} 
                        className="hidden" 
                        accept=".json" 
                    />
                </div>
            </div>
          </section>

          {/* Section 3: Data Management */}
          <section>
             <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 border-b pb-2">Rapports & Exports</h3>
             
             {/* Exports Rapides */}
             <div className="grid grid-cols-2 gap-3 mb-4">
                 <div className="col-span-2">
                    <Button onClick={onExportConfluence} variant="primary" className="w-full justify-center text-sm py-1.5" style={{ backgroundColor: '#0052CC' }}>
                        <i className="fab fa-confluence"></i> Copier HTML pour Confluence
                    </Button>
                 </div>

                 <Button onClick={onSendReport} variant="secondary" className="justify-center text-xs bg-gray-700 hover:bg-gray-800 border-none">
                     <i className="fas fa-paper-plane"></i> Préparer Email CR
                 </Button>
                 
                 <Button onClick={onDownloadInvite} variant="secondary" className="justify-center text-xs bg-indigo-600 hover:bg-indigo-700 border-none">
                     <i className="fas fa-calendar-alt"></i> Invitation Teams (.ics)
                 </Button>
             </div>
             
             {userEmail ? (
                 <p className="text-[10px] text-gray-500 text-center mb-4">
                     Email associé : <strong>{userEmail}</strong>
                 </p>
             ) : (
                 <p className="text-[10px] text-amber-600 text-center mb-4 bg-amber-50 p-1 rounded">
                     <i className="fas fa-exclamation-triangle"></i> Configurez votre email dans votre profil pour utiliser ces fonctions.
                 </p>
             )}

             <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 border-b pb-2">Sauvegarde Technique</h3>
             <div className="flex flex-col gap-3">
                 <div className="flex gap-3">
                    <Button onClick={onExport} variant="secondary" icon="fa-download" className="flex-1 justify-center text-sm">
                        Sauvegarder
                    </Button>
                    <Button onClick={() => fileInputRef.current?.click()} variant="ghost" icon="fa-history" className="flex-1 justify-center text-sm">
                        Restaurer
                    </Button>
                 </div>
                 <p className="text-[10px] text-gray-400 italic text-center">
                    Le fichier .json contient toutes les données de la rétro.
                 </p>
                 <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={onImport} 
                    className="hidden" 
                    accept=".json"
                 />
             </div>
             
             <div className="mt-4 pt-4 border-t border-gray-100">
                <Button onClick={onClear} variant="danger" icon="fa-trash" className="w-full justify-center text-sm">
                    Réinitialiser le tableau
                </Button>
             </div>
          </section>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
          <Button onClick={onClose} variant="primary" className="px-8" style={{ backgroundColor: accentColor }}>
            Terminé
          </Button>
        </div>
      </div>
    </div>
  );
};