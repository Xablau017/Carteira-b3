'use client';

import { useState, useEffect } from 'react';
import Modal from './Modal';

interface Asset {
  id: number;
  ticker: string;
  name: string;
}

interface AddDividendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddDividendModal({ isOpen, onClose, onSuccess }: AddDividendModalProps) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    assetId: '',
    type: 'DIVIDENDO',
    value: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  useEffect(() => {
    if (isOpen) {
      fetch('/api/assets?userId=1')
        .then(r => r.json())
        .then(data => setAssets(data.assets || []));
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/dividends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 1,
          assetId: formData.assetId,
          type: formData.type,
          value: formData.value,
          date: formData.date,
          notes: formData.notes,
        }),
      });

      if (!response.ok) throw new Error('Erro ao adicionar dividendo');

      setFormData({
        assetId: '',
        type: 'DIVIDENDO',
        value: '',
        date: new Date().toISOString().split('T')[0],
        notes: '',
      });

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Adicionar Dividendo">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Asset */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Ativo *</label>
          <select
            name="assetId"
            value={formData.assetId}
            onChange={handleChange}
            required
            className="w-full bg-[#0f1729] border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500 transition"
          >
            <option value="">Selecione um ativo...</option>
            {assets.map(asset => (
              <option key={asset.id} value={asset.id}>
                {asset.ticker} - {asset.name}
              </option>
            ))}
          </select>
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Tipo *</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full bg-[#0f1729] border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500 transition"
          >
            <option value="DIVIDENDO">Dividendo</option>
            <option value="JCP">JCP (Juros sobre Capital Próprio)</option>
            <option value="RENDIMENTO">Rendimento (FII)</option>
          </select>
        </div>

        {/* Value and Date side by side */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Valor Total (R$) *</label>
            <input
              type="number"
              name="value"
              value={formData.value}
              onChange={handleChange}
              required
              step="0.01"
              min="0"
              placeholder="125.50"
              className="w-full bg-[#0f1729] border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Data de Pagamento *</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full bg-[#0f1729] border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500 transition"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Observações - Opcional</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Ex: Dividendo referente ao 3º trimestre 2025"
            rows={2}
            className="w-full bg-[#0f1729] border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition resize-none"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-4 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-gray-800 text-gray-400 rounded-lg hover:bg-gray-800 hover:text-white transition font-medium"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-medium disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
