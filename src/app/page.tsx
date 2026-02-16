'use client';

import Link from 'next/link';
import { TrendingUp, DollarSign, PieChart, Calendar } from 'lucide-react';

export default function Home() {
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
              <Link href="/" className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition">
                <PieChart className="w-4 h-4" />
                Dashboard
              </Link>
              <Link href="/ativos" className="flex items-center gap-2 text-gray-400 px-4 py-2 rounded-lg hover:text-white hover:bg-gray-800 transition">
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
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Dashboard</h2>
          <p className="text-gray-400">Visão geral da sua carteira de investimentos</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#141b2d] border border-gray-800 rounded-xl p-6">
            <div className="flex justify-between items-start mb-4">
              <p className="text-gray-400 text-sm">Valor Investido</p>
              <div className="bg-[#1a2332] p-2 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-500" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white">R$ 0,00</p>
          </div>

          <div className="bg-[#141b2d] border border-gray-800 rounded-xl p-6">
            <div className="flex justify-between items-start mb-4">
              <p className="text-gray-400 text-sm">Valor Atual</p>
              <div className="bg-[#1a2332] p-2 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white">R$ 0,00</p>
          </div>

          <div className="bg-[#141b2d] border border-gray-800 rounded-xl p-6">
            <div className="flex justify-between items-start mb-4">
              <p className="text-gray-400 text-sm">Rentabilidade Total</p>
              <div className="bg-[#1a2332] p-2 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">R$ 0,00</p>
            <p className="text-green-500 text-sm font-medium">0.00%</p>
          </div>

          <div className="bg-[#141b2d] border border-gray-800 rounded-xl p-6">
            <div className="flex justify-between items-start mb-4">
              <p className="text-gray-400 text-sm">Dividendos Recebidos</p>
              <div className="bg-[#1a2332] p-2 rounded-lg">
                <PieChart className="w-5 h-5 text-green-500" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white">R$ 0,00</p>
          </div>
        </div>

        {/* Charts Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#141b2d] border border-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-6">Evolução Patrimonial</h3>
            <div className="h-64 flex items-center justify-center text-gray-500">
              <p>Gráfico será adicionado aqui</p>
            </div>
          </div>

          <div className="bg-[#141b2d] border border-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-6">Dividendos Mensais</h3>
            <div className="h-64 flex items-center justify-center text-gray-500">
              <p>Gráfico será adicionado aqui</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
