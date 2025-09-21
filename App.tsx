import React, { useState, useCallback } from 'react';
import { Editor } from './components/Editor';
import { ImageUploader } from './components/ImageUploader';
import { editImage, generateArtisticPrompt } from './services/geminiService';

// Utility to convert File to Data URL
const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

// Utility to parse Data URL
const parseDataUrl = (dataUrl: string): { base64: string; mimeType: string } => {
  const parts = dataUrl.split(',');
  if (parts.length !== 2) {
    throw new Error('Invalid data URL');
  }
  const mimeMatch = parts[0].match(/:(.*?);/);
  if (!mimeMatch || mimeMatch.length < 2) {
    throw new Error('Invalid MIME type in data URL');
  }
  const mimeType = mimeMatch[1];
  const base64 = parts[1];
  return { mimeType, base64 };
};


function App() {
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const currentImageUrl = history[historyIndex];

  const handleImageUpload = useCallback(async (file: File) => {
    setError(null);
    setIsLoading(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      setHistory([dataUrl]);
      setHistoryIndex(0);
    } catch (e) {
      setError("Impossibile caricare l'immagine. Riprova.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleEdit = useCallback(async (prompt: string) => {
    if (!currentImageUrl || isLoading) return;

    setIsLoading(true);
    setError(null);
    try {
      const { base64, mimeType } = parseDataUrl(currentImageUrl);
      const newBase64 = await editImage(base64, mimeType, prompt);
      const newImageUrl = `data:${mimeType};base64,${newBase64}`;

      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newImageUrl);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Si è verificato un errore sconosciuto.';
      setError(errorMessage);
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [currentImageUrl, isLoading, history, historyIndex]);

  const handleSurpriseMe = useCallback(async () => {
    if (!currentImageUrl || isLoading) return;

    setIsLoading(true);
    setError(null);
    let generatedPrompt = '';
    try {
      const { base64, mimeType } = parseDataUrl(currentImageUrl);
      generatedPrompt = await generateArtisticPrompt(base64, mimeType);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Si è verificato un errore generando lo stile artistico.';
      setError(errorMessage);
      console.error(e);
      setIsLoading(false);
      return; // Stop execution
    }
    
    if (generatedPrompt) {
        await handleEdit(generatedPrompt);
    } else {
        setError("L'IA non è riuscita a generare un prompt.");
        setIsLoading(false);
    }
  }, [currentImageUrl, isLoading, handleEdit]);

  const handleReset = useCallback(() => {
    if (history.length === 0 || historyIndex === 0) return;
    setError(null);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(history[0]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);
  
  const handleNewImage = useCallback(() => {
      setHistory([]);
      setHistoryIndex(-1);
      setError(null);
      setIsLoading(false);
  }, []);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
    }
  }, [historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
    }
  }, [historyIndex, history.length]);

  return (
    <div className="h-screen w-screen bg-gray-900">
      {!currentImageUrl ? (
         <div className="h-full flex flex-col items-center justify-center">
             <h1 className="text-4xl font-bold text-white mb-8">AI Photo Editor Pro</h1>
             <ImageUploader onImageUpload={handleImageUpload} setIsLoading={setIsLoading} />
         </div>
      ) : (
        <Editor
          currentImageUrl={currentImageUrl}
          isLoading={isLoading}
          error={error}
          onEdit={handleEdit}
          onReset={handleReset}
          onNewImage={handleNewImage}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onSurpriseMe={handleSurpriseMe}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
        />
      )}
    </div>
  );
}

export default App;