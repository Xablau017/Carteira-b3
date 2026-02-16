'use client';

import Link from 'next/link';
import { TrendingUp, DollarSign, PieChart, Calendar, Plus } from 'lucide-react';

export default function AtivosPage() {
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
              <Link href="/" className="flex items-center gap-2 text-gray-400 px-4 py-2 rounded-lg hover:text-white hover:bg-gray-800 transition">
                <PieChart className="w-4 h-4" />
                Dashboard
              </Link>
              <Link href="/ativos" className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition">
                <DollarSign className="w-4 h-4" />
                Ativos
              </Link>
              <Link href="/transacoes" className="flex items-center gap-2 text-gray-400 px-4 py-2 rounded-lg hover:text-white hover:bg-gray-800 transition">
                <Calendar className="w-4 h-4" />
                Transações
              </Link>
              <Link href="/dividendos" className="flex items-center gap-2 text-gray-400 px-4 py-2 rounded-lg hover:text-white hover:bg-gray-800 transition">
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
          <button className="flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition font-medium">
            <Plus className="w-5 h-5" />
            Adicionar Ativo
          </button>
        </div>

        {/* Assets Table */}
        <div className="bg-[#141b2d] border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#0f1729]">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Ticker</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Nome</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Tipo</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">Quantidade</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">Preço Médio</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">Total Investido</th>
                <th className="px-6 py-4 text-center text-sm font-medium text-gray-400">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  Nenhum ativo cadastrado. Clique em "Adicionar Ativo" para começar.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
