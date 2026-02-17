"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  DollarSign,
  PieChart,
  Calendar,
  Plus,
  Upload,
  Trash2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import AddDividendModal from "@/components/AddDividendModal";
import ImportProventosModal from "@/components/ImportProventosModal";

interface Dividend {
  id: number;
  ticker: string;
  name: string;
  type: string;
  value: number;
  date: string;
  notes: string | null;
}

interface MonthlyData {
  month: string;
  total: number;
}

interface DividendData {
  dividends: Dividend[];
  monthly: MonthlyData[];
  totalRecebido: number;
}

// Custom tooltip for the bar chart
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0f1729] border border-gray-700 rounded-lg p-3 shadow-xl">
        <p className="text-gray-400 text-sm">{label}</p>
        <p className="text-green-400 font-bold text-lg">
          {new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

export default function DividendosPage() {
  const [data, setData] = useState<DividendData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [activeBar, setActiveBar] = useState<string | null>(null);

  const fetchDividends = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/dividends?userId=1");
      const result = await response.json();
      if (result.success) setData(result.data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDividends();
  }, []);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("pt-BR");

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      DIVIDENDO: "Dividendo",
      JCP: "JCP",
      RENDIMENTO: "Rendimento",
    };
    return types[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      DIVIDENDO: "text-green-400 bg-green-500 bg-opacity-10",
      JCP: "text-blue-400 bg-blue-500 bg-opacity-10",
      RENDIMENTO: "text-purple-400 bg-purple-500 bg-opacity-10",
    };
    return colors[type] || "text-gray-400 bg-gray-800";
  };

  // Calculate average monthly
  const avgMonthly =
    data && data.monthly.length > 0
      ? data.totalRecebido / data.monthly.length
      : 0;

  // Best month
  const bestMonth =
    data && data.monthly.length > 0
      ? data.monthly.reduce((max, m) => (m.total > max.total ? m : max))
      : null;

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
                className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
              >
                <DollarSign className="w-4 h-4" />
                Dividendos
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Title + Actions */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Dividendos</h2>
            <p className="text-gray-400">Acompanhe seus proventos recebidos</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center gap-2 bg-blue-500 text-white px-5 py-3 rounded-lg hover:bg-blue-600 transition font-medium"
            >
              <Upload className="w-5 h-5" />
              Importar B3
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-green-500 text-white px-5 py-3 rounded-lg hover:bg-green-600 transition font-medium"
            >
              <Plus className="w-5 h-5" />
              Adicionar
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#141b2d] border border-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-2">Total Recebido</p>
            {loading ? (
              <div className="h-8 bg-gray-800 rounded animate-pulse" />
            ) : (
              <p className="text-3xl font-bold text-white">
                {formatCurrency(data?.totalRecebido || 0)}
              </p>
            )}
          </div>

          <div className="bg-[#141b2d] border border-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-2">Média Mensal</p>
            {loading ? (
              <div className="h-8 bg-gray-800 rounded animate-pulse" />
            ) : (
              <p className="text-3xl font-bold text-white">
                {formatCurrency(avgMonthly)}
              </p>
            )}
          </div>

          <div className="bg-[#141b2d] border border-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-2">Melhor Mês</p>
            {loading ? (
              <div className="h-8 bg-gray-800 rounded animate-pulse" />
            ) : bestMonth ? (
              <div>
                <p className="text-3xl font-bold text-white">
                  {formatCurrency(bestMonth.total)}
                </p>
                <p className="text-green-500 text-sm mt-1">{bestMonth.month}</p>
              </div>
            ) : (
              <p className="text-3xl font-bold text-white">-</p>
            )}
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-[#141b2d] border border-gray-800 rounded-xl p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-white">
              Proventos Recebidos por Mês
            </h3>
            {data && (
              <p className="text-gray-400 text-sm">
                {data.monthly.length} meses registrados
              </p>
            )}
          </div>

          {loading ? (
            <div className="h-64 bg-gray-800 rounded animate-pulse" />
          ) : !data?.monthly || data.monthly.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-gray-500 gap-3">
              <PieChart className="w-12 h-12 opacity-30" />
              <p>Nenhum dividendo registrado ainda.</p>
              <p className="text-sm">
                Clique em "Importar via Brapi" para importar automaticamente!
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={data.monthly}
                margin={{ top: 20, right: 10, left: 10, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1e293b"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `R$${v}`}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "rgba(255,255,255,0.05)" }}
                />
                <Bar
                  dataKey="total"
                  radius={[6, 6, 0, 0]}
                  onMouseEnter={(data) => setActiveBar(data.month)}
                  onMouseLeave={() => setActiveBar(null)}
                >
                  {data.monthly.map((entry) => (
                    <Cell
                      key={entry.month}
                      fill={activeBar === entry.month ? "#22c55e" : "#16a34a"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Dividends Table */}
        <div className="bg-[#141b2d] border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center">
            <h3 className="text-xl font-semibold text-white">
              Histórico de Proventos
            </h3>
            <span className="text-sm text-gray-400">
              {data?.dividends.length || 0} registros
            </span>
          </div>

          <table className="w-full">
            <thead className="bg-[#0f1729]">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                  Data
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                  Ativo
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                  Tipo
                </th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">
                  Valor
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                  Observações
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
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    Carregando...
                  </td>
                </tr>
              ) : !data?.dividends || data.dividends.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    Nenhum dividendo registrado. Use "Importar via Brapi" ou
                    adicione manualmente!
                  </td>
                </tr>
              ) : (
                data.dividends.map((div) => (
                  <tr
                    key={div.id}
                    className="border-t border-gray-800 hover:bg-[#0f1729] transition"
                  >
                    <td className="px-6 py-4 text-gray-300">
                      {formatDate(div.date)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-green-500 bg-opacity-20 text-green-400 font-bold text-sm px-2 py-1 rounded">
                        {div.ticker}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${getTypeColor(div.type)}`}
                      >
                        {getTypeLabel(div.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-green-400 font-semibold">
                      {formatCurrency(div.value)}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm max-w-xs truncate">
                      {div.notes || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
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
      </main>

      <AddDividendModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchDividends}
      />

      <ImportProventosModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={fetchDividends}
      />
    </div>
  );
}
