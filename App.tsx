import React, { useState } from 'react';
import { FolderArchive, ArrowRight, Loader2 } from 'lucide-react';
import FileUpload from './components/FileUpload';
import Preview from './components/Preview';
import { UploadedFile, CompilationResult } from './types';
import { compileDocuments } from './services/geminiService';

function App() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<CompilationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCompile = async () => {
    if (files.length === 0) return;
    
    setIsProcessing(true);
    setError(null);

    try {
      const compilationResult = await compileDocuments(files);
      setResult(compilationResult);
    } catch (err) {
      setError("Erreur lors de l'analyse des documents.");
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetApp = () => {
    setResult(null);
    setFiles([]);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200">
              <FolderArchive className="text-white" size={32} />
            </div>
          </div>
          {/* Montserrat Extra Bold appliqué via index.css sur h1 */}
          <h1 className="text-4xl tracking-tight mb-2 text-slate-900">
            Extracteur de Données Documentaires
          </h1>
          {/* Times New Roman appliqué par défaut via body */}
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Importez vos CVs, Factures ou Lettres (PDF/Word). 
            Le système génère automatiquement un <span className="font-bold text-indigo-600">tableau individuel</span> pour chaque fichier avec les informations clés.
          </p>
        </div>

        {/* Main Content */}
        {!result ? (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-8">
              <div className="mb-6">
                <h2 className="text-xl text-slate-800 mb-1">Vos Documents</h2>
                <p className="text-sm text-slate-500">Ajoutez les fichiers à analyser.</p>
              </div>
              
              <FileUpload files={files} setFiles={setFiles} />

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm">
                  {error}
                </div>
              )}
            </div>

            <div className="bg-slate-50 px-8 py-6 border-t border-slate-200 flex justify-end items-center space-x-4">
              <span className="text-sm text-slate-500">
                {files.length} fichier{files.length > 1 ? 's' : ''} sélectionné{files.length > 1 ? 's' : ''}
              </span>
              <button
                onClick={handleCompile}
                disabled={files.length === 0 || isProcessing}
                className={`flex items-center px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-all font-times
                  ${files.length === 0 || isProcessing 
                    ? 'bg-slate-300 cursor-not-allowed shadow-none' 
                    : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-200 active:scale-95'
                  }`}
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={20} className="mr-2 animate-spin" />
                    Analyse en cours...
                  </>
                ) : (
                  <>
                    <FolderArchive size={20} className="mr-2" />
                    Extraire les Données
                    <ArrowRight size={18} className="ml-2 opacity-70" />
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <Preview result={result} onBack={resetApp} />
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-slate-400 text-sm font-times italic">
          <p>Compatible PDF & Word • Structuration Automatique</p>
        </div>
      </div>
    </div>
  );
}

export default App;