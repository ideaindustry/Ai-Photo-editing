import React, { useState, useRef, useEffect } from 'react';
import type { StandardEdit } from '../types';

const STANDARD_EDITS: StandardEdit[] = [
  { label: 'Migliora Illuminazione', prompt: 'Improve the lighting, make it look professional, bright, and clear, enhancing the natural light.' },
  { label: 'Aumenta Contrasto', prompt: 'Increase the contrast for a more dramatic, punchy, and dynamic effect.' },
  { label: 'Stile Cinematografico', prompt: 'Apply a cinematic color grade, with teal and orange tones, giving it a blockbuster movie look.' },
  { label: 'Look Vintage', prompt: 'Give this image a vintage, faded photograph look from the 1970s, with warm tones and slight grain.' },
  { label: 'B&N Intenso', prompt: 'Convert to a high-contrast, dramatic black and white with deep blacks and bright whites.' },
  { label: 'Colori Vivaci', prompt: 'Make the colors more vibrant and saturated, like a beautiful summer day. Enhance the blues, greens, and reds.' },
  { label: 'Fuoco Morbido', prompt: 'Apply a soft focus effect, keeping the main subject perfectly sharp but adding a gentle, dreamy blur to the background.' },
  { label: 'Rendi più Nitido', prompt: 'Slightly sharpen the details in the image to make them crisper and more defined, without adding artifacts.' },
  { label: 'Tocco Surreale', prompt: 'Add a subtle surreal touch to the image, like making the sky an unusual color or adding a dreamy, magical glow.' },
  { label: 'Atmosfera Dorata', prompt: 'Give the image a warm, golden hour atmosphere, as if it were taken just before sunset.' },
];

const ARTISTIC_STYLES: StandardEdit[] = [
    { label: 'Stile Van Gogh', prompt: 'Trasforma questa immagine in un dipinto ad olio nello stile di Van Gogh, con pennellate spesse, vorticose e colori vibranti.' },
    { label: 'Acquerello', prompt: 'Converti questa immagine in un delicato dipinto ad acquerello, con colori tenui, bordi sfumati e una texture cartacea.' },
    { label: 'Cyberpunk', prompt: 'Applica un\'estetica cyberpunk a questa immagine, aggiungendo luci al neon, riflessi su superfici bagnate e un\'atmosfera urbana e futuristica.' },
    { label: 'Arte Fantasy', prompt: 'Rendi questa immagine come un pezzo di arte fantasy epica, con una luce magica, colori sognanti e un\'atmosfera mistica.' },
];


const PROMPT_SUGGESTIONS: string[] = [
  'Rimuovi sfondo',
  'Cambia sfondo in...',
  'Aggiungi un gatto',
  'Effetto dipinto',
  'Stile acquerello',
  'Look futuristico',
  'Atmosfera sognante',
  'Colori pastello',
  'Toni caldi',
  'Luce drammatica',
  'Effetto miniatura',
  'Doppia esposizione',
];

interface EditorProps {
  currentImageUrl: string;
  isLoading: boolean;
  error: string | null;
  onEdit: (prompt: string) => void;
  onReset: () => void;
  onNewImage: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onSurpriseMe: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const LoadingSpinner = () => (
  <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center z-20 backdrop-blur-sm">
    <svg className="animate-spin h-12 w-12 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <p className="mt-4 text-lg text-gray-200">L'IA sta elaborando la tua immagine...</p>
  </div>
);

const ResetIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;
const NewImageIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>;
const UndoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 15l-3-3m0 0l3-3m-3 3h8a5 5 0 000-10H9" /></svg>;
const RedoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 15l3-3m0 0l-3-3m3 3H5a5 5 0 000 10h1" /></svg>;
const RotateLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 16l-4-4m0 0l4-4m-4 4h18" transform="scale(1, -1) rotate(90 12 12)" /></svg>;
const RotateRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" transform="scale(1, -1) rotate(-90 12 12)"/></svg>;


export const Editor: React.FC<EditorProps> = ({ currentImageUrl, isLoading, error, onEdit, onReset, onNewImage, onUndo, onRedo, onSurpriseMe, canUndo, canRedo }) => {
  const [customPrompt, setCustomPrompt] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [rotation, setRotation] = useState(0);

  const handleResetAdjustments = () => {
    setBrightness(100);
    setContrast(100);
    setRotation(0);
  };

  useEffect(() => {
    handleResetAdjustments();
  }, [currentImageUrl]);


  const handleCustomPromptSubmit = () => {
    if (customPrompt.trim()) {
      onEdit(customPrompt.trim());
    }
  };
  
  const handleDownload = () => {
    if (!imageRef.current) return;

    const tempImage = new Image();
    tempImage.src = currentImageUrl;

    tempImage.onload = () => {
        const { naturalWidth, naturalHeight } = tempImage;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) return;
        
        const radians = (rotation * Math.PI) / 180;
        const cos = Math.abs(Math.cos(radians));
        const sin = Math.abs(Math.sin(radians));

        // Set canvas dimensions to fit the rotated image
        canvas.width = naturalWidth * cos + naturalHeight * sin;
        canvas.height = naturalWidth * sin + naturalHeight * cos;

        // Apply filters
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;

        // Move rotation point to the center of the canvas
        ctx.translate(canvas.width / 2, canvas.height / 2);
        // Rotate the canvas
        ctx.rotate(radians);
        // Draw the image centered on the new origin
        ctx.drawImage(tempImage, -naturalWidth / 2, -naturalHeight / 2, naturalWidth, naturalHeight);

        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataUrl;
        
        const fileName = "edited-image-" + new Date().toISOString().slice(0,19).replace(/:/g,'-') + ".png";
        link.download = fileName;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    tempImage.onerror = () => {
      console.error("Image could not be loaded for download.");
      // You could also set an error state here to inform the user.
    };
  };

  const handleSuggestionClick = (suggestion: string) => {
    setCustomPrompt(prev => {
      const newPrompt = prev.trim() ? `${prev.trim()}, ${suggestion.toLowerCase()}` : suggestion;
      return newPrompt;
    });
    textareaRef.current?.focus();
  };
  
  const handleRotate = (degrees: number) => {
    setRotation(prev => (prev + degrees) % 360);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-900 text-gray-200">
      {/* Sidebar */}
      <aside className="w-full md:w-80 lg:w-96 bg-gray-800 p-6 flex-shrink-0 overflow-y-auto">
        <h1 className="text-2xl font-bold text-white mb-6">AI Photo Editor</h1>
        
        <h2 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-3">Modifiche Rapide</h2>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {STANDARD_EDITS.map((edit) => (
            <button
              key={edit.label}
              onClick={() => onEdit(edit.prompt)}
              disabled={isLoading}
              className="px-3 py-2 text-sm bg-gray-700 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {edit.label}
            </button>
          ))}
        </div>

        <h2 className="text-sm font-semibold text-orange-400 uppercase tracking-wider mb-3">Stili Artistici</h2>
        <div className="grid grid-cols-2 gap-3 mb-3">
          {ARTISTIC_STYLES.map((edit) => (
            <button
              key={edit.label}
              onClick={() => onEdit(edit.prompt)}
              disabled={isLoading}
              className="px-3 py-2 text-sm bg-gray-700 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {edit.label}
            </button>
          ))}
        </div>
        <button
            onClick={onSurpriseMe}
            disabled={isLoading}
            className="w-full flex items-center justify-center px-4 py-2 text-sm font-bold bg-orange-600 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-6"
        >
          ✨ Sorprendimi!
        </button>


        <h2 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-3">Modifica Personale</h2>
        <div className="space-y-3 mb-6">
          <textarea
            ref={textareaRef}
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Es: 'Aggiungi un'atmosfera da film noir...'"
            rows={3}
            disabled={isLoading}
            className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
          />
          <button
            onClick={handleCustomPromptSubmit}
            disabled={isLoading || !customPrompt.trim()}
            className="w-full flex items-center justify-center px-4 py-2 text-sm font-bold bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Applica Modifica
          </button>
        </div>

        <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Suggerimenti Prompt</h3>
            <div className="flex flex-wrap gap-2">
                {PROMPT_SUGGESTIONS.map((suggestion) => (
                <button
                    key={suggestion}
                    onClick={() => handleSuggestionClick(suggestion)}
                    disabled={isLoading}
                    className="px-2.5 py-1 text-xs bg-gray-700 rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {suggestion}
                </button>
                ))}
            </div>
        </div>

        {/* Basic Adjustments */}
        <div className="space-y-4 mb-6">
          <h2 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-3">Regolazioni di Base</h2>
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-400">
                <label htmlFor="brightness">Luminosità</label>
                <span>{brightness}%</span>
              </div>
              <input
                id="brightness"
                type="range" min="50" max="200" value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                disabled={isLoading}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-400">
                <label htmlFor="contrast">Contrasto</label>
                <span>{contrast}%</span>
              </div>
              <input
                id="contrast"
                type="range" min="50" max="200" value={contrast}
                onChange={(e) => setContrast(Number(e.target.value))}
                disabled={isLoading}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
               <button onClick={() => handleRotate(-90)} disabled={isLoading} className="w-full flex items-center justify-center px-4 py-2 text-sm bg-gray-700 rounded-md hover:bg-gray-500 disabled:opacity-50 transition-colors">
                  <RotateLeftIcon /> Sinistra
                </button>
                <button onClick={() => handleRotate(90)} disabled={isLoading} className="w-full flex items-center justify-center px-4 py-2 text-sm bg-gray-700 rounded-md hover:bg-gray-500 disabled:opacity-50 transition-colors">
                  <RotateRightIcon /> Destra
                </button>
            </div>
             <button
              onClick={handleResetAdjustments}
              disabled={isLoading || (brightness === 100 && contrast === 100 && rotation === 0)}
              className="w-full text-xs text-center text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed pt-2"
            >
              Resetta Regolazioni
            </button>
          </div>
        </div>


        {error && <p className="text-red-400 text-sm mb-4 bg-red-900/50 p-3 rounded-md">{error}</p>}
        
        <div className="space-y-3 pt-6 border-t border-gray-700">
             <button
                onClick={handleDownload}
                disabled={isLoading}
                className="w-full flex items-center justify-center px-4 py-2 text-sm font-bold bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                <DownloadIcon />
                Scarica Immagine
             </button>
             <div className="flex space-x-3">
                <button
                    onClick={onUndo}
                    disabled={isLoading || !canUndo}
                    className="w-full flex items-center justify-center px-4 py-2 text-sm font-bold bg-gray-600 rounded-md hover:bg-gray-500 disabled:opacity-50 transition-colors"
                >
                    <UndoIcon />
                    Annulla
                </button>
                <button
                    onClick={onRedo}
                    disabled={isLoading || !canRedo}
                    className="w-full flex items-center justify-center px-4 py-2 text-sm font-bold bg-gray-600 rounded-md hover:bg-gray-500 disabled:opacity-50 transition-colors"
                >
                    <RedoIcon />
                    Rifai
                </button>
             </div>
             <button
                onClick={onReset}
                disabled={isLoading || !canUndo}
                className="w-full flex items-center justify-center px-4 py-2 text-sm font-bold bg-gray-600 rounded-md hover:bg-gray-500 disabled:opacity-50 transition-colors"
              >
                <ResetIcon />
                Reset Originale
             </button>
             <button
                onClick={onNewImage}
                disabled={isLoading}
                className="w-full flex items-center justify-center px-4 py-2 text-sm font-bold bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                <NewImageIcon />
                Carica Nuova Foto
             </button>
        </div>

      </aside>

      {/* Image Viewer */}
      <main className="flex-1 flex items-center justify-center p-6 bg-gray-900 relative">
        {isLoading && <LoadingSpinner />}
        <div className="w-full h-full flex items-center justify-center">
            <img 
                ref={imageRef}
                src={currentImageUrl} 
                alt="User content" 
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl transition-transform duration-300"
                style={{
                    filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                    transform: `rotate(${rotation}deg)`,
                }}
            />
        </div>
      </main>
    </div>
  );
};