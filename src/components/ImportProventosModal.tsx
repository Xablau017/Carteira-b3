'use client';

import { useState, useRef } from 'react';
import Modal from './Modal';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Info } from 'lucide-react';

interface ImportProventosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ImportResult {
  imported: number;
  skipped: number;
  notFound: string[];
  totalProcessed: number;
}

export default function ImportProventosModal({ isOpen, onClose, onSuccess }: ImportProventosModalProps) {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    if (!f.name.endsWith('.xlsx') && !f.name.endsWith('.xls')) {
      setError('Por favor, selecione um arquivo .xlsx ou .xls');
      return;
    }
    setFile(f);
    setError('');
    setResult(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleImport = async () => {
    if (!file) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/import-proventos?userId=1', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.summary);
        onSuccess();
      } else {
        setError(data.error || 'Erro ao importar arquivo');
      }
    } catch (err) {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setResult(null);
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Importar Proventos B3">
      <div className="space-y-5">
        {/* Instructions */}
        <div className="bg-blue-500 bg-opacity-10 border border-blue-500 border-opacity-30 rounded-lg p-4">
          <div className="flex gap-2 items-start">
            <Info className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
            <div className="text-sm text-blue-300 space-y-1">
              <p className="font-medium text-blue-200">Como obter o arquivo:</p>
              <ol className="list-decimal list-inside space-y-1 text-blue-300">
                <li>Acesse <span className="text-white font-medium">investidor.b3.com.br</span></li>
                <li>Faça login com sua conta</li>
                <li>Vá em <span className="text-white font-medium">Extrato → Proventos</span></li>
                <li>Selecione o período e exporte como <span className="text-white font-medium">Excel (.xlsx)</span></li>
              </ol>
            </div>
          </div>
        </div>

        {/* File Drop Zone */}
        {!result && (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
              dragging
                ? 'border-green-500 bg-green-500 bg-opacity-10'
                : file
                ? 'border-green-500 bg-green-500 bg-opacity-5'
                : 'border-gray-700 hover:border-gray-500'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />

            {file ? (
              <div className="flex flex-col items-center gap-3">
                <FileSpreadsheet className="w-12 h-12 text-green-500" />
                <div>
                  <p className="text-white font-medium">{file.name}</p>
                  <p className="text-gray-400 text-sm mt-1">
                    {(file.size / 1024).toFixed(1)} KB • Clique para trocar
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <Upload className="w-12 h-12 text-gray-500" />
                <div>
                  <p className="text-white font-medium">Arraste o arquivo de proventos aqui</p>
                  <p className="text-gray-400 text-sm mt-1">ou clique para selecionar</p>
                  <p className="text-gray-500 text-xs mt-2">Aceita: .xlsx, .xls</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 bg-red-500 bg-opacity-10 border border-red-500 text-red-400 px-4 py-3 rounded-lg text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {error}
          </div>
        )}

        {/* Success Result */}
        {result && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-green-500 bg-opacity-10 border border-green-500 border-opacity-30 rounded-lg p-4">
              <CheckCircle className="w-8 h-8 text-green-500 shrink-0" />
              <div>
                <p className="text-green-400 font-semibold text-lg">Importação concluída!</p>
                <p className="text-gray-400 text-sm">{result.totalProcessed} proventos processados</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#0f1729] rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-green-500">{result.imported}</p>
                <p className="text-gray-400 text-xs mt-1">Importados</p>
              </div>
              <div className="bg-[#0f1729] rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-yellow-500">{result.skipped}</p>
                <p className="text-gray-400 text-xs mt-1">Já existiam</p>
              </div>
            </div>

            {result.notFound.length > 0 && (
              <div className="bg-yellow-500 bg-opacity-10 border border-yellow-500 border-opacity-30 rounded-lg p-3">
                <p className="text-yellow-400 text-sm font-medium mb-1">Ativos não encontrados na carteira:</p>
                <p className="text-yellow-500 text-xs">{result.notFound.join(', ')}</p>
                <p className="text-gray-400 text-xs mt-2">
                  Importe estes ativos primeiro para que seus dividendos sejam registrados.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleClose}
            className="flex-1 px-6 py-3 border border-gray-800 text-gray-400 rounded-lg hover:bg-gray-800 hover:text-white transition font-medium"
          >
            {result ? 'Fechar' : 'Cancelar'}
          </button>

          {!result && (
            <button
              onClick={handleImport}
              disabled={!file || loading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Importando...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Importar
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
