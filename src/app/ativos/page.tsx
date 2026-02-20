"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  DollarSign,
  PieChart,
  Calendar,
  Plus,
  Edit,
  Trash2,
  Upload,
} from "lucide-react";
import AddAssetModal from "@/components/AddAssetModal";
import ImportB3Modal from "@/components/ImportB3Modal";

interface Asset {
  id: number;
  ticker: string;
  name: string;
  type: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number | null;
  sector: string | null;
}

export default function AtivosPage() {
  const [assets, setAssets] = useState<Asset>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/assets"); // TODO: Replace with actual user ID

      const data = await response.json();

      if (response.ok && data.assets) {
        setAssets(data.assets);
      } else {
        setAssets([]);
      }
    } catch (error) {
      console.error("Error fetching assets:", error);
      setAssets([]); // ← Important!
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleAssetAdded = () => {
    fetchAssets(); // Refresh the list
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 4,
    }).format(value);
  };

  const getTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      ACAO: "Ação",
      FII: "FII",
      STOCK: "Stock",
      REIT: "REIT",
      ETF: "ETF",
    };
    return types[type] || type;
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e]">
      {/* Header */}
      <header className="bg-[#0f1729] border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-green-500 p-2 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">Carteira B3</h1>
            </div>

            <nav className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-gray-400 px-4 py-2 rounded-lg hover:text-white hover:bg-gray-800 transition"
              >
                <PieChart className="w-4 h-4" />
                Dashboard
              </Link>
              <Link
                href="/ativos"
                className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
              >
                <DollarSign className="w-4 h-4" />
                Ativos
              </Link>
              <Link
                href="/transacoes"
                className="flex items-center gap-2 text-gray-400 px-4 py-2 rounded-lg hover:text-white hover:bg-gray-800 transition"
              >
                <Calendar className="w-4 h-4" />
                Transações
              </Link>
              <Link
                href="/dividendos"
                className="flex items-center gap-2 text-gray-400 px-4 py-2 rounded-lg hover:text-white hover:bg-gray-800 transition"
              >
                <DollarSign className="w-4 h-4" />
                Dividendos
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Ativos</h2>
            <p className="text-gray-400">Gerencie seus ativos da carteira</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition font-medium"
          >
            <Plus className="w-5 h-5" />
            Adicionar Ativo
          </button>
        </div>

        <div>
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition font-medium"
          >
            <Upload className="w-5 h-5" />
            Importar B3
          </button>
        </div>
        {/* Assets Table */}
        <div className="bg-[#141b2d] border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#0f1729]">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                  Ticker
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                  Nome
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                  Tipo
                </th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">
                  Quantidade
                </th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">
                  Preço Médio
                </th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">
                  Total Investido
                </th>
                <th className="px-6 py-4 text-center text-sm font-medium text-gray-400">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    Carregando...
                  </td>
                </tr>
              ) : assets.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    Nenhum ativo cadastrado. Clique em "Adicionar Ativo" para
                    começar.
                  </td>
                </tr>
              ) : (
                assets.map((asset) => (
                  <tr
                    key={asset.id}
                    className="border-t border-gray-800 hover:bg-[#0f1729] transition"
                  >
                    <td className="px-6 py-4 text-white font-medium">
                      {asset.ticker}
                    </td>
                    <td className="px-6 py-4 text-gray-300">{asset.name}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-green-500 bg-opacity-10 text-green-500 rounded-full text-sm">
                        {getTypeLabel(asset.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-white">
                      {formatNumber(asset.quantity)}
                    </td>
                    <td className="px-6 py-4 text-right text-white">
                      {formatCurrency(asset.averagePrice)}
                    </td>
                    <td className="px-6 py-4 text-right text-white font-medium">
                      {formatCurrency(asset.quantity * asset.averagePrice)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-2 text-gray-400 hover:text-blue-500 hover:bg-gray-800 rounded-lg transition">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-800 rounded-lg transition">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Summary Card */}
        {assets.length > 0 && (
          <div className="mt-6 bg-[#141b2d] border border-gray-800 rounded-xl p-6">
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-400 mb-1">Total de Ativos</p>
                <p className="text-2xl font-bold text-white">{assets.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">
                  Valor Total Investido
                </p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(
                    assets.reduce(
                      (sum, asset) => sum + asset.quantity * asset.averagePrice,
                      0,
                    ),
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Maior Posição</p>
                <p className="text-2xl font-bold text-white">
                  {assets.length > 0
                    ? assets.reduce((max, asset) => {
                        const value = asset.quantity * asset.averagePrice;
                        return value > max.quantity * max.averagePrice
                          ? asset
                          : max;
                      }).ticker
                    : "-"}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <ImportB3Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={fetchAssets}
      />

      {/* Add Asset Modal */}
      <AddAssetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleAssetAdded}
      />
    </div>
  );
}
