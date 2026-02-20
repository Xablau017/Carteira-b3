"use client";

import { useState } from "react";
import Modal from "./Modal";

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddAssetModal({
  isOpen,
  onClose,
  onSuccess,
}: AddAssetModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    ticker: "",
    name: "",
    type: "ACAO",
    quantity: "",
    averagePrice: "",
    currentPrice: "",
    sector: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/assets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticker: formData.ticker.toUpperCase(),
          name: formData.name,
          type: formData.type,
          quantity: parseFloat(formData.quantity),
          averagePrice: parseFloat(formData.averagePrice),
          currentPrice: formData.currentPrice
            ? parseFloat(formData.currentPrice)
            : null,
          sector: formData.sector || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao adicionar ativo");
      }

      // Reset form
      setFormData({
        ticker: "",
        name: "",
        type: "ACAO",
        quantity: "",
        averagePrice: "",
        currentPrice: "",
        sector: "",
      });

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Adicionar Ativo">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Ticker */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Ticker / Código *
          </label>
          <input
            type="text"
            name="ticker"
            value={formData.ticker}
            onChange={handleChange}
            required
            placeholder="Ex: PETR4, ITSA4, MXRF11"
            className="w-full bg-[#0f1729] border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition uppercase"
          />
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Nome do Ativo *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Ex: Petrobras PN, Itaúsa PN"
            className="w-full bg-[#0f1729] border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition"
          />
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Tipo *
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
            className="w-full bg-[#0f1729] border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500 transition"
          >
            <option value="ACAO">Ação</option>
            <option value="FII">Fundo Imobiliário (FII)</option>
            <option value="STOCK">Stock (Ação Internacional)</option>
            <option value="REIT">REIT (FII Internacional)</option>
            <option value="ETF">ETF</option>
          </select>
        </div>

        {/* Quantity and Average Price - Side by Side */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Quantidade *
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              required
              step="0.0001"
              min="0"
              placeholder="100"
              className="w-full bg-[#0f1729] border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Preço Médio (R$) *
            </label>
            <input
              type="number"
              name="averagePrice"
              value={formData.averagePrice}
              onChange={handleChange}
              required
              step="0.01"
              min="0"
              placeholder="35.50"
              className="w-full bg-[#0f1729] border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition"
            />
          </div>
        </div>

        {/* Current Price (optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Preço Atual (R$) - Opcional
          </label>
          <input
            type="number"
            name="currentPrice"
            value={formData.currentPrice}
            onChange={handleChange}
            step="0.01"
            min="0"
            placeholder="38.20"
            className="w-full bg-[#0f1729] border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition"
          />
        </div>

        {/* Sector (optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Setor - Opcional
          </label>
          <input
            type="text"
            name="sector"
            value={formData.sector}
            onChange={handleChange}
            placeholder="Ex: Energia, Bancos, Tecnologia"
            className="w-full bg-[#0f1729] border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-4 pt-4">
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
            className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Adicionando..." : "Adicionar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
