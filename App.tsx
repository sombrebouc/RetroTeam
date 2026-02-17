import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import html2canvas from 'html2canvas';
import { RetroCard, ActionItem, ColumnType, RetroConfig, RetroZone } from './types';
import { RetroBoard } from './components/RetroBoard';
import { Button } from './components/Button';
import { CardInput } from './components/CardInput';
import { DraggableCard } from './components/DraggableCard';
import { SettingsModal } from './components/SettingsModal';
import { LoginScreen } from './components/LoginScreen';
import { UserModal } from './components/UserModal';
import { RandomPickerModal } from './components/RandomPickerModal';
import { analyzeRetro } from './services/geminiService';
import { storageService } from './services/storageService';
import { AVAILABLE_FONTS } from './constants';

const App: React.FC = () => {
  // --- Loading State ---
  const [isInitializing, setIsInitializing] = useState(true);

  // --- Data State ---
  const [currentUser, setCurrentUser] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [cards, setCards] = useState<RetroCard[]>([]);
  const [zones, setZones] = useState<RetroZone[]>([]);
  const [prevActions, setPrevActions] = useState<ActionItem[]>([]);
  const [newActions, setNewActions] = useState<ActionItem[]>([]);
  
  // Visual Configuration State
  const [config, setConfig] = useState<RetroConfig>({
      title: 'Ma Rétrospective',
      accentColor: '#3B82F6',
      canvasColor: '#ffffff',
      fontFamily: AVAILABLE_FONTS[0].value,
      backgroundImage: null,
      titleColor: '#ffffff'
  });

  // UI State
  const [isReflectionMode, setIsReflectionMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false); // New State for Picker
  const [isZoneEditMode, setIsZoneEditMode] = useState(false); // New Zone Edit Mode
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [newActionInput, setNewActionInput] = useState('');
  const [filterType, setFilterType] = useState<ColumnType | 'ALL'>('ALL');

  // Drag, Pan & Zoom State
  const canvasRef = useRef<HTMLDivElement>(null);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

  // --- INITIALIZATION (Mount) ---
  useEffect(() => {
    const initApp = async () => {
      try {
        const [user, email, loadedCards, loadedZones, loadedPrev, loadedNew, loadedConfig] = await Promise.all([
          storageService.getUser(),
          storageService.getUserEmail(),
          storageService.getCards(),
          storageService.getZones(),
          storageService.getPrevActions(),
          storageService.getNewActions(),
          storageService.getConfig()
        ]);

        if (user) setCurrentUser(user);
        if (email) setUserEmail(email);
        setCards(loadedCards);
        setZones(loadedZones);
        setPrevActions(loadedPrev);
        setNewActions(loadedNew);
        setConfig(loadedConfig);
        
        document.title = `${loadedConfig.title} - RetroFlow`;
      } catch (error) {
        console.error("Failed to load retro data", error);
      } finally {
        setIsInitializing(false);
      }
    };

    initApp();
  }, []);

  // --- PERSISTENCE EFFECTS ---
  // Ces effets sauvegardent automatiquement les changements via le service.
  // Dans une vraie app BDD temps réel (Firebase), on utiliserait plutôt des "listeners" dans le useEffect d'init.
  
  useEffect(() => {
     if (!isInitializing) storageService.saveUser(currentUser);
  }, [currentUser, isInitializing]);

  useEffect(() => {
     if (!isInitializing) storageService.saveUserEmail(userEmail);
  }, [userEmail, isInitializing]);

  useEffect(() => {
     if (!isInitializing) storageService.saveCards(cards);
  }, [cards, isInitializing]);

  useEffect(() => {
    if (!isInitializing) storageService.saveZones(zones);
 }, [zones, isInitializing]);

  useEffect(() => {
     if (!isInitializing) storageService.savePrevActions(prevActions);
  }, [prevActions, isInitializing]);

  useEffect(() => {
     if (!isInitializing) storageService.saveNewActions(newActions);
  }, [newActions, isInitializing]);

  useEffect(() => {
     if (!isInitializing) {
         storageService.saveConfig(config);
         document.title = `${config.title} - RetroFlow`;
     }
  }, [config, isInitializing]);


  // --- Global Pan Listeners ---
  useEffect(() => {
    const handleGlobalMove = (e: MouseEvent) => {
        if (!isPanning) return;
        setPanOffset({
            x: e.clientX - startPan.x,
            y: e.clientY - startPan.y
        });
    };
    const handleGlobalUp = () => { setIsPanning(false); };

    if (isPanning) {
        window.addEventListener('mousemove', handleGlobalMove);
        window.addEventListener('mouseup', handleGlobalUp);
    }
    return () => {
        window.removeEventListener('mousemove', handleGlobalMove);
        window.removeEventListener('mouseup', handleGlobalUp);
    };
  }, [isPanning, startPan]);

  // --- Helpers for Settings Wrappers ---
  // Ces fonctions font le pont entre les composants qui attendent des setters individuels et l'objet config unifié
  const setRetroTitle = (val: string) => setConfig(prev => ({...prev, title: val}));
  const setAccentColor = (val: string) => setConfig(prev => ({...prev, accentColor: val}));
  const setCanvasColor = (val: string) => setConfig(prev => ({...prev, canvasColor: val}));
  const setFontFamily = (val: string) => setConfig(prev => ({...prev, fontFamily: val}));
  const setBackgroundImage = (val: string | null) => setConfig(prev => ({...prev, backgroundImage: val}));
  const setTitleColor = (val: string) => setConfig(prev => ({...prev, titleColor: val}));

  // --- Handlers ---
  const handleLogin = (name: string) => {
      setCurrentUser(name);
  };

  const handleUpdateUser = (name: string, email: string) => {
      setCurrentUser(name);
      setUserEmail(email);
  };

  const handleExport = () => {
      const data = {
          title: config.title,
          date: new Date().toISOString(),
          cards,
          zones,
          prevActions,
          newActions,
          accentColor: config.accentColor,
          canvasColor: config.canvasColor,
          fontFamily: config.fontFamily,
          titleColor: config.titleColor
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `retro-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
          try {
              const data = JSON.parse(event.target?.result as string);
              if (window.confirm("Cela remplacera la rétro actuelle. Continuer ?")) {
                  // Mettre à jour les états déclenchera automatiquement les useEffects de sauvegarde
                  setConfig({
                      title: data.title || "Retro Importée",
                      accentColor: data.accentColor || config.accentColor,
                      canvasColor: data.canvasColor || config.canvasColor,
                      fontFamily: data.fontFamily || config.fontFamily,
                      backgroundImage: config.backgroundImage, // On garde l'image actuelle par défaut lors d'un import de données
                      titleColor: data.titleColor || config.titleColor
                  });
                  setCards(data.cards || []);
                  setZones(data.zones || []);
                  setPrevActions(data.prevActions || []);
                  setNewActions(data.newActions || []);
                  setIsSettingsOpen(false);
              }
          } catch (err) {
              alert("Format de fichier invalide");
          }
      };
      reader.readAsText(file);
      e.target.value = '';
  };

  const handleClearAll = async () => {
      if (window.confirm("Êtes-vous sûr de vouloir TOUT effacer ? Cette action est irréversible.")) {
          await storageService.clearAll();
          // Reset local state
          setCards([]);
          setZones([]);
          setPrevActions([]);
          setNewActions([]);
          setConfig(prev => ({
              ...prev,
              title: "Nouvelle Rétrospective",
              backgroundImage: null,
              canvasColor: '#ffffff',
              titleColor: '#ffffff'
          }));
          setIsSettingsOpen(false);
      }
  };

  // --- ZONE HANDLERS ---
  const handleAddZone = () => {
      const newZone: RetroZone = {
          id: uuidv4(),
          title: 'Nouvelle Zone',
          x: 100 + (zones.length * 20),
          y: 100 + (zones.length * 20),
          width: 300,
          height: 200,
          color: '#3B82F6'
      };
      setZones(prev => [...prev, newZone]);
  };

  const handleUpdateZone = (updatedZone: RetroZone) => {
      setZones(prev => prev.map(z => z.id === updatedZone.id ? updatedZone : z));
  };

  const handleDeleteZone = (id: string) => {
      if(window.confirm("Supprimer cette zone ?")) {
          setZones(prev => prev.filter(z => z.id !== id));
      }
  };

  const handleAddCard = (text: string, column: ColumnType) => {
    const newCard: RetroCard = {
      id: uuidv4(),
      text,
      column,
      votes: 0,
      isRevealed: !isReflectionMode,
      author: currentUser,
      x: undefined, 
      y: undefined
    };
    setCards(prev => [...prev, newCard]);
  };

  const handleDeleteCard = (id: string) => {
    if (window.confirm('Supprimer cette carte ?')) {
      setCards(prev => prev.filter(c => c.id !== id));
    }
  };

  const handleVote = (id: string) => {
    setCards(prev => prev.map(c => c.id === id ? { ...c, votes: c.votes + 1 } : c));
  };

  const handleRevealAll = () => {
    setCards(prev => prev.map(c => ({ ...c, isRevealed: true })));
    setIsReflectionMode(false);
  };

  // --- Actions Handlers ---
  const handleAddAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActionInput.trim()) return;
    const action: ActionItem = {
      id: uuidv4(),
      text: newActionInput,
      completed: false,
      assignee: currentUser
    };
    setNewActions(prev => [...prev, action]);
    setNewActionInput('');
  };

  const handleDeleteAction = (id: string, isPrev: boolean) => {
     if (isPrev) {
        setPrevActions(prev => prev.filter(a => a.id !== id));
     } else {
        setNewActions(prev => prev.filter(a => a.id !== id));
     }
  };

  const handleToggleAction = (id: string, isPrev: boolean) => {
    if (isPrev) {
        setPrevActions(prev => prev.map(a => a.id === id ? {...a, completed: !a.completed} : a));
    } else {
        setNewActions(prev => prev.map(a => a.id === id ? {...a, completed: !a.completed} : a));
    }
  };

  const runAIAnalysis = async () => {
    if (cards.length === 0) {
      alert("Ajoutez des cartes avant d'analyser.");
      return;
    }
    setIsAnalyzing(true);
    try {
      const prevTexts = prevActions.map(a => a.text);
      const result = await analyzeRetro(cards, prevTexts);
      
      if (result.suggestedActions) {
         const generatedActions: ActionItem[] = result.suggestedActions.map((sa: any) => ({
             id: uuidv4(),
             text: sa.text,
             completed: false
         }));
         setNewActions(prev => [...prev, ...generatedActions]);
      }
      if (result.summary) {
          alert(`💡 Analyse IA : ${result.summary}`);
      }
      setIsSidebarOpen(true);
    } catch (e) {
      alert("Erreur lors de l'analyse IA. Vérifiez votre clé API.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // --- Drag & Drop Handlers ---
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('cardId', id);
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    e.dataTransfer.setData('offsetX', (e.clientX - rect.left).toString());
    e.dataTransfer.setData('offsetY', (e.clientY - rect.top).toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData('cardId');
    const offsetX = parseFloat(e.dataTransfer.getData('offsetX')) || 0;
    const offsetY = parseFloat(e.dataTransfer.getData('offsetY')) || 0;
    
    if (canvasRef.current) {
        const canvasRect = canvasRef.current.getBoundingClientRect();
        const x = (e.clientX - canvasRect.left - offsetX - panOffset.x) / zoomLevel;
        const y = (e.clientY - canvasRect.top - offsetY - panOffset.y) / zoomLevel;

        setCards(prev => prev.map(c => {
            if (c.id === cardId) {
                return { ...c, x, y };
            }
            return c;
        }));
    }
  };

  // --- Panning & Zoom ---
  const handlePanStart = (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      // Also check if we are clicking a zone handle or input
      const isZoneInteraction = target.closest('.resize-handle') || target.tagName === 'INPUT';
      
      const isInteractive = target.closest('button') || target.closest('textarea') || target.closest('[draggable="true"]') || isZoneInteraction;
      
      if (!isInteractive && e.button === 0) {
          setIsPanning(true);
          setStartPan({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
      }
  };

  const handleWheel = (e: React.WheelEvent) => {
    const zoomSensitivity = 0.001;
    const delta = -e.deltaY * zoomSensitivity;
    const newZoom = Math.min(Math.max(zoomLevel + delta, 0.1), 5);
    if (newZoom === zoomLevel) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const worldX = (mouseX - panOffset.x) / zoomLevel;
    const worldY = (mouseY - panOffset.y) / zoomLevel;
    const newPanX = mouseX - (worldX * newZoom);
    const newPanY = mouseY - (worldY * newZoom);

    setPanOffset({ x: newPanX, y: newPanY });
    setZoomLevel(newZoom);
  };

  const handleResetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleSidebarReorder = (sourceId: string, targetId: string) => {
    setCards(prevCards => {
        const sourceIndex = prevCards.findIndex(c => c.id === sourceId);
        const targetIndex = prevCards.findIndex(c => c.id === targetId);
        if (sourceIndex === -1 || targetIndex === -1) return prevCards;
        const newCards = [...prevCards];
        const [removed] = newCards.splice(sourceIndex, 1);
        newCards.splice(targetIndex, 0, removed);
        if (removed.x !== undefined) {
             removed.x = undefined;
             removed.y = undefined;
        }
        return newCards;
    });
  };

  const returnToStaging = (id: string) => {
      setCards(prev => prev.map(c => c.id === id ? { ...c, x: undefined, y: undefined } : c));
  };

  // --- Helpers for Picker ---
  const getUniqueAuthors = () => {
      // Collect authors from cards
      const authors = new Set<string>();
      cards.forEach(c => {
          if (c.author && c.author.trim() !== '') {
              authors.add(c.author);
          }
      });
      // Add current user if not already there (though usually handled inside modal)
      if (currentUser) authors.add(currentUser);
      
      return Array.from(authors);
  };

  // --- NEW FEATURES (Mail & Calendar) ---
  
  const handleDownloadInvite = () => {
      if (!userEmail) {
          alert("Veuillez renseigner votre email dans votre profil.");
          setIsUserModalOpen(true);
          return;
      }
      
      // Generate ICS Content
      // Format date for ICS: YYYYMMDDTHHmmssZ
      const now = new Date();
      // Set to next week same time roughly
      const nextRetro = new Date();
      nextRetro.setDate(now.getDate() + 7);
      nextRetro.setMinutes(0, 0, 0); // Round to hour
      
      const endRetro = new Date(nextRetro);
      endRetro.setHours(nextRetro.getHours() + 1);

      const formatDate = (date: Date) => date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

      const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//RetroFlow//Team Retrospective//FR
BEGIN:VEVENT
UID:${uuidv4()}
DTSTAMP:${formatDate(now)}
DTSTART:${formatDate(nextRetro)}
DTEND:${formatDate(endRetro)}
SUMMARY:Rétrospective : ${config.title}
DESCRIPTION:C'est l'heure de notre rétrospective ! Connectez-vous sur RetroFlow.
LOCATION:Microsoft Teams
END:VEVENT
END:VCALENDAR`;

      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'invitation_retro.ics');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      alert(`📅 Invitation générée pour le ${nextRetro.toLocaleString()} !\n\nOuvrez le fichier téléchargé pour l'ajouter à votre calendrier Outlook/Teams.`);
  };

  const handleSendReport = () => {
     if (!userEmail) {
          alert("Veuillez renseigner votre email dans votre profil.");
          setIsUserModalOpen(true);
          return;
      }

      const positives = cards.filter(c => c.column === ColumnType.POSITIVE).map(c => `- ${c.text} (+${c.votes})`).join('\n');
      const negatives = cards.filter(c => c.column === ColumnType.NEGATIVE).map(c => `- ${c.text}`).join('\n');
      const continues = cards.filter(c => c.column === ColumnType.CONTINUE).map(c => `- ${c.text}`).join('\n');
      const actions = newActions.map(a => `[ ] ${a.text}`).join('\n');

      const body = `Bonjour,

Voici le compte-rendu de notre rétrospective "${config.title}" du ${new Date().toLocaleDateString()}.

✅ POSITIF :
${positives || 'Rien à signaler'}

🛑 NÉGATIF :
${negatives || 'Rien à signaler'}

➡️ À CONTINUER :
${continues || 'Rien à signaler'}

🛠 PLAN D'ACTION :
${actions || 'Aucune nouvelle action'}

Cordialement,
L'équipe (via RetroFlow)`;

      const subject = encodeURIComponent(`Compte-rendu : ${config.title}`);
      const encodedBody = encodeURIComponent(body);
      
      // Open default mail client
      window.open(`mailto:${userEmail}?subject=${subject}&body=${encodedBody}`);
  };


  // --- EXPORT CONFLUENCE ---
  const handleExportConfluence = async () => {
    // 1. Gather Data
    const dateStr = new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const participants = getUniqueAuthors().join(', ');

    const positives = cards.filter(c => c.column === ColumnType.POSITIVE);
    const negatives = cards.filter(c => c.column === ColumnType.NEGATIVE);
    const continues = cards.filter(c => c.column === ColumnType.CONTINUE);

    const formatList = (list: RetroCard[]) => {
        if (list.length === 0) return '<em>Aucun point</em>';
        return `<ul>${list.map(c => `<li>${c.text} ${c.votes > 0 ? `<strong>(+${c.votes})</strong>` : ''}</li>`).join('')}</ul>`;
    };

    // 2. Capture Screenshot
    let screenshotHtml = '';
    if (canvasRef.current) {
        try {
            // We use html2canvas to capture the board
            // ignoreElements is used to exclude the zoom controls from the screenshot
            const canvas = await html2canvas(canvasRef.current, {
                useCORS: true,
                scale: 1, 
                logging: false,
                ignoreElements: (element) => element.classList.contains('zoom-controls')
            });
            const imgData = canvas.toDataURL('image/png');
            // We append the screenshot to the HTML report
            screenshotHtml = `
                <h2>2. Aperçu du Tableau</h2>
                <div style="border: 1px solid #ddd; padding: 10px; border-radius: 8px; background-color: #f9fafb;">
                    <img src="${imgData}" alt="Capture du tableau" style="max-width: 100%; height: auto; border-radius: 4px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" />
                </div>
            `;
        } catch (e) {
            console.error("Screenshot capture failed", e);
        }
    }

    // 3. Generate HTML with styles that Confluence preserves well
    const htmlContent = `
      <h1 style="color: ${config.accentColor}">${config.title} - ${dateStr}</h1>
      <p><strong>Participants :</strong> ${participants || 'Équipe'}</p>
      
      <h2>1. Rétrospective</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="border: 1px solid #ddd; padding: 10px; background-color: #dcfce7; color: #166534; width: 33%;">Positif (+${positives.length})</th>
            <th style="border: 1px solid #ddd; padding: 10px; background-color: #fee2e2; color: #991b1b; width: 33%;">Négatif (-${negatives.length})</th>
            <th style="border: 1px solid #ddd; padding: 10px; background-color: #dbeafe; color: #1e40af; width: 33%;">À Suivre (${continues.length})</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid #ddd; padding: 10px; vertical-align: top;">${formatList(positives)}</td>
            <td style="border: 1px solid #ddd; padding: 10px; vertical-align: top;">${formatList(negatives)}</td>
            <td style="border: 1px solid #ddd; padding: 10px; vertical-align: top;">${formatList(continues)}</td>
          </tr>
        </tbody>
      </table>

      ${screenshotHtml}

      <h2>${screenshotHtml ? '3' : '2'}. Plan d'Action</h2>
      ${newActions.length === 0 ? '<p>Aucune action définie.</p>' : 
        `<ul>${newActions.map(a => `<li><input type="checkbox" ${a.completed ? 'checked' : ''} /> ${a.text}</li>`).join('')}</ul>`
      }
      
      <p style="margin-top: 20px; font-size: 0.8em; color: #888;"><em>Généré par RetroFlow</em></p>
    `;

    // 4. Copy to Clipboard
    try {
        const type = "text/html";
        const blob = new Blob([htmlContent], { type });
        const data = [new ClipboardItem({ [type]: blob })];
        await navigator.clipboard.write(data);
        alert("✅ Compte-rendu (avec capture !) copié.\n\nFaites Ctrl+V dans Confluence. Si l'image n'apparaît pas, assurez-vous que votre navigateur permet l'insertion d'images en base64.");
    } catch (err) {
        console.error('Failed to copy html: ', err);
        // Fallback for simple text copy if HTML fails
        try {
             await navigator.clipboard.writeText(htmlContent);
             alert("⚠️ Le navigateur n'a pas autorisé la copie HTML enrichie. Le code HTML brut a été copié.");
        } catch (e) {
            alert("Erreur lors de la copie dans le presse-papier.");
        }
    }
  };

  // --- Render ---

  // Loading Screen
  if (isInitializing) {
      return (
          <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50">
              <i className="fas fa-circle-notch fa-spin text-4xl text-blue-500 mb-4"></i>
              <p className="text-gray-500 font-medium">Chargement de votre espace...</p>
          </div>
      );
  }

  // Login Screen
  if (!currentUser) {
      return <LoginScreen onJoin={handleLogin} accentColor={config.accentColor} />;
  }

  const allStagedCards = cards.filter(c => c.x === undefined || c.y === undefined);
  const displayedStagedCards = allStagedCards.filter(c => {
      if (filterType === 'ALL') return true;
      return c.column === filterType;
  });
  const canvasCards = cards.filter(c => c.x !== undefined && c.y !== undefined);

  // Helper to determine if we should apply extra spacing
  const isFancyFont = !config.fontFamily.includes('Inter') && !config.fontFamily.includes('sans-serif,');

  return (
    <div 
        className="h-screen flex flex-col overflow-hidden relative transition-colors duration-500"
        style={{ 
            backgroundColor: config.backgroundImage ? 'transparent' : '#f3f4f6', 
            backgroundImage: config.backgroundImage ? `url(${config.backgroundImage})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            // IMPORTANT: On n'applique plus la police globalement ici pour garder l'UI lisible
        }}
    >
      
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title={config.title}
        setTitle={setRetroTitle}
        accentColor={config.accentColor}
        setAccentColor={setAccentColor}
        canvasColor={config.canvasColor}
        setCanvasColor={setCanvasColor}
        fontFamily={config.fontFamily}
        setFontFamily={setFontFamily}
        backgroundImage={config.backgroundImage}
        setBackgroundImage={setBackgroundImage}
        titleColor={config.titleColor}
        setTitleColor={setTitleColor}
        onExport={handleExport}
        onImport={handleImport}
        onClear={handleClearAll}
        onExportConfluence={handleExportConfluence}
        onDownloadInvite={handleDownloadInvite}
        onSendReport={handleSendReport}
        userEmail={userEmail}
      />

      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        currentUser={currentUser}
        currentEmail={userEmail}
        onUpdateUser={handleUpdateUser}
        accentColor={config.accentColor}
      />

      <RandomPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        candidates={getUniqueAuthors()}
        currentUser={currentUser}
        accentColor={config.accentColor}
      />

      {/* --- HEADER --- */}
      <header 
        className={`px-6 py-3 shadow-sm z-50 flex flex-col transition-all duration-300 border-b border-white/20
           ${config.backgroundImage ? 'bg-black/30 backdrop-blur-md text-white' : 'text-white'}`}
        style={{ backgroundColor: config.backgroundImage ? undefined : config.accentColor }}
      >
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <button 
                    onClick={() => setIsSettingsOpen(true)}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white bg-white/20 hover:bg-white/30 transition-colors"
                    title="Paramètres de séance"
                >
                    <i className="fas fa-sliders-h text-lg"></i>
                </button>
                <div className="flex flex-col">
                    <span className="text-[10px] text-white/80 font-bold uppercase tracking-wider">RetroFlow</span>
                    {/* Le titre applique la police choisie, avec tracking ajusté */}
                    <h1 
                        className={`font-bold tracking-wider text-2xl md:text-4xl ${isFancyFont ? 'tracking-widest' : ''}`}
                        style={{ 
                            fontFamily: config.fontFamily, 
                            color: config.titleColor || '#ffffff'
                        }}
                    >
                        {config.title}
                    </h1>
                </div>
            </div>

            <div className="flex items-center gap-3">
                
                {/* Zone Editor Toggle */}
                 <Button 
                    variant="ghost" 
                    onClick={() => setIsZoneEditMode(!isZoneEditMode)}
                    className={`text-sm py-1 border-white/20 mr-2 ${isZoneEditMode ? "bg-yellow-400 text-yellow-900 border-yellow-400 hover:bg-yellow-500" : "text-white hover:bg-white/20"}`}
                >
                    {isZoneEditMode ? <><i className="fas fa-edit"></i> Zones (ON)</> : <><i className="fas fa-th-large"></i> Zones</>}
                </Button>

                <div className="h-6 w-px bg-white/20 mx-1"></div>
                
                {/* Plouf Plouf Button */}
                <button 
                    onClick={() => setIsPickerOpen(true)}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white bg-white/20 hover:bg-white/30 transition-colors mr-1 border border-white/20"
                    title="Qui présente ? (Tirage au sort)"
                >
                    <i className="fas fa-dice text-lg"></i>
                </button>

                <div className="h-6 w-px bg-white/20 mx-1"></div>

                <button 
                    onClick={() => setIsUserModalOpen(true)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/20 mr-2"
                >
                     <div className="w-6 h-6 rounded-full bg-white text-blue-600 flex items-center justify-center text-xs font-bold uppercase">
                        {currentUser.charAt(0)}
                     </div>
                     <span className="text-sm font-medium shadow-black/20 drop-shadow-sm">{currentUser}</span>
                </button>

                <div className="h-6 w-px bg-white/20 mx-1"></div>

                <Button 
                    variant="ghost" 
                    onClick={() => setIsReflectionMode(!isReflectionMode)}
                    className={`text-sm py-1 text-white border-white/20 hover:bg-white/20 ${isReflectionMode ? "bg-white/20" : ""}`}
                >
                    {isReflectionMode ? "Mode Réflexion (ON)" : "Mode Réflexion"}
                </Button>
                
                {isReflectionMode && (
                    <Button variant="secondary" onClick={handleRevealAll} icon="fa-eye" className="text-sm py-1 shadow-lg border border-white/20">
                        Révéler
                    </Button>
                )}

                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-white/80 hover:text-white ml-2">
                    <i className={`fas ${isSidebarOpen ? 'fa-indent' : 'fa-outdent'} text-xl`}></i>
                </button>
            </div>
        </div>
      </header>

      {/* --- WORKSPACE --- */}
      <div className="flex-1 flex overflow-hidden">
          
          {/* LEFT SIDEBAR */}
          <div className={`w-80 border-r border-white/20 flex flex-col shadow-xl z-20 transition-colors duration-300
                ${config.backgroundImage ? 'bg-white/70 backdrop-blur-xl' : 'bg-white'}`}>
             <div className="p-4 border-b border-gray-200/50">
                 <h2 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: config.backgroundImage ? '#333' : config.accentColor }}>
                    <i className="fas fa-edit mr-2"></i>Préparation
                 </h2>
                 <CardInput onAdd={handleAddCard} />
             </div>

             <div className="px-4 py-2 border-b border-gray-200/50 flex gap-1 overflow-x-auto no-scrollbar bg-gray-50/30">
                <button onClick={() => setFilterType('ALL')} className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${filterType === 'ALL' ? 'bg-gray-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-200'}`}>Tous</button>
                <button onClick={() => setFilterType(ColumnType.POSITIVE)} className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${filterType === ColumnType.POSITIVE ? 'bg-green-500 text-white' : 'bg-white text-green-600 hover:bg-green-50'}`}>Positif</button>
                <button onClick={() => setFilterType(ColumnType.NEGATIVE)} className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${filterType === ColumnType.NEGATIVE ? 'bg-red-500 text-white' : 'bg-white text-red-600 hover:bg-red-50'}`}>Négatif</button>
                <button onClick={() => setFilterType(ColumnType.CONTINUE)} className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${filterType === ColumnType.CONTINUE ? 'bg-blue-500 text-white' : 'bg-white text-blue-600 hover:bg-blue-50'}`}>À Suivre</button>
             </div>

             <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ fontFamily: config.fontFamily }}>
                <h3 className="text-xs font-semibold text-gray-500 flex items-center justify-between" style={{ fontFamily: 'Inter, sans-serif' }}>
                    <span>
                        {filterType === 'ALL' ? 'Brouillons' : 
                         filterType === ColumnType.POSITIVE ? 'Positifs' :
                         filterType === ColumnType.NEGATIVE ? 'Négatifs' : 'À Suivre'}
                        <span className="ml-1 opacity-60">({displayedStagedCards.length})</span>
                    </span>
                    <i className="fas fa-arrow-right animate-pulse"></i>
                </h3>
                
                {displayedStagedCards.length === 0 && (
                    <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 text-sm bg-white/50" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Aucune carte ici.
                    </div>
                )}

                {displayedStagedCards.map(card => (
                    <DraggableCard
                        key={card.id}
                        card={card}
                        onVote={handleVote}
                        onDelete={handleDeleteCard}
                        isReflectionMode={isReflectionMode}
                        onDragStart={handleDragStart}
                        inCanvas={false}
                        onCardDrop={handleSidebarReorder}
                    />
                ))}
             </div>
          </div>

          {/* CENTER: CANVAS */}
          <div className={`flex-1 relative overflow-hidden ${isFancyFont ? 'tracking-wide' : ''}`} ref={canvasRef} style={{ fontFamily: config.fontFamily }}>
                <RetroBoard 
                    cards={canvasCards}
                    zones={zones}
                    onVote={handleVote}
                    onDelete={(id) => returnToStaging(id)} 
                    isReflectionMode={isReflectionMode}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragStart={handleDragStart}
                    panOffset={panOffset}
                    zoomLevel={zoomLevel}
                    onPanStart={handlePanStart}
                    isPanning={isPanning}
                    onWheel={handleWheel}
                    accentColor={config.accentColor}
                    canvasColor={config.canvasColor}
                    isZoneEditMode={isZoneEditMode}
                    onUpdateZone={handleUpdateZone}
                    onDeleteZone={handleDeleteZone}
                />
                
                {/* Zone Editor Controls (Visible only in Edit Mode) */}
                {isZoneEditMode && (
                    <div className="zoom-controls absolute top-6 left-6 flex flex-col gap-2 z-40 animate-fade-in" style={{ fontFamily: 'Inter, sans-serif' }}>
                        <Button 
                            onClick={handleAddZone} 
                            className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 border border-yellow-500 shadow-lg font-bold"
                            icon="fa-plus"
                        >
                            Nouvelle Zone
                        </Button>
                        <div className="bg-white/90 backdrop-blur rounded p-3 shadow text-xs text-gray-600 max-w-[200px] border border-gray-200">
                            <p><strong>Mode Édition :</strong></p>
                            <ul className="list-disc pl-4 mt-1 space-y-1">
                                <li>Déplacez et redimensionnez les zones.</li>
                                <li>Changez les noms et couleurs.</li>
                                <li>Désactivez le mode pour interagir avec les cartes.</li>
                            </ul>
                        </div>
                    </div>
                )}

                {/* Added 'zoom-controls' class here for html2canvas exclusion */}
                <div className="zoom-controls absolute bottom-6 left-6 flex items-center gap-2 bg-white/90 backdrop-blur shadow-lg rounded-lg p-1.5 border border-gray-200 z-40" style={{ fontFamily: 'Inter, sans-serif' }}>
                    <button onClick={() => setZoomLevel(z => Math.max(z - 0.2, 0.1))} className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-gray-600">
                        <i className="fas fa-minus"></i>
                    </button>
                    <span className="w-12 text-center text-xs font-mono font-bold text-gray-600">{Math.round(zoomLevel * 100)}%</span>
                    <button onClick={() => setZoomLevel(z => Math.min(z + 0.2, 5))} className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-gray-600">
                        <i className="fas fa-plus"></i>
                    </button>
                    <div className="w-px h-6 bg-gray-200 mx-1"></div>
                    <button onClick={handleResetView} className="px-2 py-1 text-xs font-medium text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded" title="Réinitialiser la vue">
                        Reset
                    </button>
                </div>
          </div>

        {/* RIGHT SIDEBAR */}
        <aside className={`
            w-80 border-l border-white/20 flex flex-col shadow-xl z-30 transition-all duration-300 absolute right-0 h-full
            ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
            ${config.backgroundImage ? 'bg-white/70 backdrop-blur-xl' : 'bg-white'}
        `}>
            <div className="p-4 border-b border-gray-100/50 flex justify-between items-center">
                <h2 className="font-bold flex items-center gap-2" style={{ color: config.backgroundImage ? '#333' : config.accentColor }}>
                    <i className="fas fa-clipboard-list"></i> Plan d'Action
                </h2>
                <button onClick={() => setIsSidebarOpen(false)} className="text-gray-400 hover:text-gray-600">
                    <i className="fas fa-times"></i>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                <section>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Précédemment</h3>
                    {prevActions.length === 0 ? (
                        <p className="text-xs text-gray-400 italic">Rien à signaler.</p>
                    ) : (
                        <ul className="space-y-2">
                            {prevActions.map(action => (
                                <li key={action.id} className="flex items-start gap-2 group text-sm">
                                    <input 
                                        type="checkbox" 
                                        checked={action.completed}
                                        onChange={() => handleToggleAction(action.id, true)}
                                        className="mt-1 rounded cursor-pointer"
                                    />
                                    <span className={`flex-1 ${action.completed ? 'line-through text-gray-400' : 'text-gray-600'}`}>{action.text}</span>
                                    <button onClick={() => handleDeleteAction(action.id, true)} className="text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100">
                                        <i className="fas fa-times"></i>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <section>
                    <div className="flex items-center justify-between mb-2">
                         <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: config.backgroundImage ? '#333' : config.accentColor }}>Sprints à venir</h3>
                         <button 
                            onClick={runAIAnalysis} 
                            disabled={isAnalyzing}
                            className="text-[10px] bg-purple-100 hover:bg-purple-200 text-purple-700 px-2 py-0.5 rounded transition-colors flex items-center gap-1"
                         >
                            {isAnalyzing ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-magic"></i>}
                            IA
                         </button>
                    </div>
                    
                    <ul className="space-y-2 mb-3">
                        {newActions.map(action => (
                            <li key={action.id} className="flex items-start gap-2 group bg-blue-50/50 p-2 rounded border border-blue-100 text-sm">
                                <input 
                                    type="checkbox" 
                                    checked={action.completed}
                                    onChange={() => handleToggleAction(action.id, false)}
                                    className="mt-1 rounded cursor-pointer"
                                />
                                <span className={`flex-1 ${action.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>{action.text}</span>
                                <button onClick={() => handleDeleteAction(action.id, false)} className="text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100">
                                    <i className="fas fa-times"></i>
                                </button>
                            </li>
                        ))}
                    </ul>

                    <form onSubmit={handleAddAction} className="relative">
                        <input
                            type="text"
                            value={newActionInput}
                            onChange={(e) => setNewActionInput(e.target.value)}
                            placeholder="Nouvelle action..."
                            className="w-full pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none bg-white/50 focus:bg-white"
                        />
                         <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 hover:scale-110 transition-transform" style={{ color: config.backgroundImage ? '#333' : config.accentColor }}>
                            <i className="fas fa-plus"></i>
                        </button>
                    </form>
                </section>
            </div>
        </aside>
      </div>
    </div>
  );
};

export default App;