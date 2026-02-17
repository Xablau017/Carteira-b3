"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  DollarSign,
  PieChart,
  Calendar,
  TrendingDown,
  RefreshCw,
} from "lucide-react";

interface DashboardData {
  valorInvestido: number;
  valorAtual: number;
  rentabilidade: number;
  rentabilidadePercentual: number;
  dividendosRecebidos: number;
  totalAtivos: number;
  assets: Asset[];
}

interface Asset {
  id: number;
  ticker: string;
  name: string;
  type: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number | null;
  totalInvestido: number;
  totalAtual: number;
}

export default function Home() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("/api/dashboard?userId=1");
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError("Erro ao carregar dados");
      }
    } catch (err) {
      setError("Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
  };

  const isPositive = data ? data.rentabilidade >= 0 : true;

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
                className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
              >
                <PieChart className="w-4 h-4" />
                Dashboard
              </Link>
              <Link
                href="/ativos"
                className="flex items-center gap-2 text-gray-400 px-4 py-2 rounded-lg hover:text-white hover:bg-gray-800 transition"
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
        {/* Title + Refresh */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Dashboard</h2>
            <p className="text-gray-400">
              Visão geral da sua carteira de investimentos
            </p>
          </div>
          <button
            onClick={fetchDashboard}
            disabled={loading}
            className="flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition font-medium disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Valor Investido */}
          <div className="bg-[#141b2d] border border-gray-800 rounded-xl p-6">
            <div className="flex justify-between items-start mb-4">
              <p className="text-gray-400 text-sm">Valor Investido</p>
              <div className="bg-[#1a2332] p-2 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-500" />
              </div>
            </div>
            {loading ? (
              <div className="h-8 bg-gray-800 rounded animate-pulse" />
            ) : (
              <p className="text-3xl font-bold text-white">
                {formatCurrency(data?.valorInvestido || 0)}
              </p>
            )}
          </div>

          {/* Valor Atual */}
          <div className="bg-[#141b2d] border border-gray-800 rounded-xl p-6">
            <div className="flex justify-between items-start mb-4">
              <p className="text-gray-400 text-sm">Valor Atual</p>
              <div className="bg-[#1a2332] p-2 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
            </div>
            {loading ? (
              <div className="h-8 bg-gray-800 rounded animate-pulse" />
            ) : (
              <p className="text-3xl font-bold text-white">
                {formatCurrency(data?.valorAtual || 0)}
              </p>
            )}
          </div>

          {/* Rentabilidade */}
          <div className="bg-[#141b2d] border border-gray-800 rounded-xl p-6">
            <div className="flex justify-between items-start mb-4">
              <p className="text-gray-400 text-sm">Rentabilidade Total</p>
              <div className="bg-[#1a2332] p-2 rounded-lg">
                {isPositive ? (
                  <TrendingUp className="w-5 h-5 text-green-500" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-500" />
                )}
              </div>
            </div>
            {loading ? (
              <div className="h-8 bg-gray-800 rounded animate-pulse mb-2" />
            ) : (
              <>
                <p className="text-3xl font-bold text-white mb-1">
                  {formatCurrency(data?.rentabilidade || 0)}
                </p>
                <p
                  className={`text-sm font-medium ${isPositive ? "text-green-500" : "text-red-500"}`}
                >
                  {formatPercent(data?.rentabilidadePercentual || 0)}
                </p>
              </>
            )}
          </div>

          {/* Dividendos */}
          <div className="bg-[#141b2d] border border-gray-800 rounded-xl p-6">
            <div className="flex justify-between items-start mb-4">
              <p className="text-gray-400 text-sm">Dividendos Recebidos</p>
              <div className="bg-[#1a2332] p-2 rounded-lg">
                <PieChart className="w-5 h-5 text-green-500" />
              </div>
            </div>
            {loading ? (
              <div className="h-8 bg-gray-800 rounded animate-pulse" />
            ) : (
              <p className="text-3xl font-bold text-white">
                {formatCurrency(data?.dividendosRecebidos || 0)}
              </p>
            )}
          </div>
        </div>

        {/* Portfolio Table + Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Portfolio Assets */}
          <div className="bg-[#141b2d] border border-gray-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">
                Minha Carteira
              </h3>
              <span className="text-sm text-gray-400">
                {data?.totalAtivos || 0} ativos
              </span>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-12 bg-gray-800 rounded animate-pulse"
                  />
                ))}
              </div>
            ) : !data?.assets || data.assets.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p>Nenhum ativo cadastrado.</p>
                <Link
                  href="/ativos"
                  className="text-green-500 hover:underline text-sm mt-2 inline-block"
                >
                  Adicionar primeiro ativo →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {data.assets.map((asset) => {
                  const gain = asset.totalAtual - asset.totalInvestido;
                  const gainPercent =
                    asset.totalInvestido > 0
                      ? (gain / asset.totalInvestido) * 100
                      : 0;
                  const positive = gain >= 0;

                  return (
                    <div
                      key={asset.id}
                      className="flex items-center justify-between p-3 bg-[#0f1729] rounded-lg hover:bg-[#1a2332] transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-green-500 bg-opacity-20 px-2 py-1 rounded text-green-500 font-bold text-sm min-w-16 text-center">
                          {asset.ticker}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">
                            {asset.name}
                          </p>
                          <p className="text-gray-500 text-xs">
                            {asset.quantity} cotas
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white text-sm font-medium">
                          {formatCurrency(asset.totalAtual)}
                        </p>
                        <p
                          className={`text-xs font-medium ${positive ? "text-green-500" : "text-red-500"}`}
                        >
                          {formatPercent(gainPercent)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Charts placeholder */}
          <div className="bg-[#141b2d] border border-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-6">
              Distribuição por Tipo
            </h3>

            {loading ? (
              <div className="h-64 bg-gray-800 rounded animate-pulse" />
            ) : !data?.assets || data.assets.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-gray-500">
                <p>Adicione ativos para ver a distribuição</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(
                  data.assets.reduce(
                    (acc, asset) => {
                      acc[asset.type] =
                        (acc[asset.type] || 0) + asset.totalAtual;
                      return acc;
                    },
                    {} as Record<string, number>,
                  ),
                ).map(([type, value]) => {
                  const percent =
                    data.valorAtual > 0 ? (value / data.valorAtual) * 100 : 0;
                  const typeLabels: Record<string, string> = {
                    ACAO: "Ações",
                    FII: "FIIs",
                    STOCK: "Stocks",
                    REIT: "REITs",
                    ETF: "ETFs",
                  };

                  return (
                    <div key={type}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">
                          {typeLabels[type] || type}
                        </span>
                        <span className="text-white">
                          {percent.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <p className="text-gray-500 text-xs mt-1">
                        {formatCurrency(value)}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
