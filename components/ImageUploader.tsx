import React, { useCallback, useRef } from 'react';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  setIsLoading: (isLoading: boolean) => void;
}

const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);


export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, setIsLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
        setIsLoading(true);
        onImageUpload(file);
    }
  };

  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setIsLoading(true);
      onImageUpload(file);
    }
  };

  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className="flex items-center justify-center h-full w-full p-4">
      <div
        className="w-full max-w-2xl h-96 border-4 border-dashed border-gray-600 rounded-3xl flex flex-col items-center justify-center text-center cursor-pointer hover:border-blue-500 transition-colors duration-300 bg-gray-800/50"
        onClick={openFileDialog}
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/png, image/jpeg, image/webp"
          className="hidden"
        />
        <UploadIcon />
        <h2 className="mt-4 text-2xl font-bold text-gray-300">Trascina un'immagine qui</h2>
        <p className="mt-2 text-gray-400">o clicca per selezionare un file</p>
        <p className="mt-1 text-xs text-gray-500">PNG, JPG, WEBP sono supportati</p>
      </div>
    </div>
  );
};
