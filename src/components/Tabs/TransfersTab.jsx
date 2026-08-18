import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AddTransferModal } from '../Modals/AddTransferModal';
import { ArrowLeftRight, Plus, DollarSign, TrendingUp, TrendingDown, RefreshCw, Repeat } from 'lucide-react';

export const TransfersTab = () => {
  const { activeSeason, currentTransfers, addTransfer } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterType, setFilterType] = useState('ALL');

  if (!activeSeason) return null;

  const budgetFormatted = (activeSeason.budget || 0).toLocaleString('es-ES') + ' €';

  const filteredTransfers = currentTransfers.filter(t => {
    if (filterType === 'ALL') return true;
    if (filterType === 'FICHAJES') return t.type === 'Fichaje';
    if (filterType === 'VENTAS') return t.type === 'Venta';
    if (filterType === 'CESIONES') return (t.type || '').includes('Cesión');
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Budget & Stats Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <DollarSign className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase text-amber-400 bg-amber-950 border border-amber-500/30 px-2 py-0.5 rounded">
              Presupuesto de Fichajes Disponible
            </span>
            <h3 className="text-3xl font-black text-white font-outfit mt-1">{budgetFormatted}</h3>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-2xl shadow-lg shadow-emerald-500/20 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Operación (Voz / Manual)</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex space-x-2">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
              filterType === 'ALL'
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-900'
            }`}
          >
            Todas ({currentTransfers.length})
          </button>

          <button
            onClick={() => setFilterType('FICHAJES')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterType === 'FICHAJES'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-slate-950 text-slate-400 hover:text-emerald-400 border border-slate-900'
            }`}
          >
            📥 Fichajes
          </button>

          <button
            onClick={() => setFilterType('VENTAS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterType === 'VENTAS'
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                : 'bg-slate-950 text-slate-400 hover:text-rose-400 border border-slate-900'
            }`}
          >
            📤 Ventas
          </button>

          <button
            onClick={() => setFilterType('CESIONES')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterType === 'CESIONES'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                : 'bg-slate-950 text-slate-400 hover:text-cyan-400 border border-slate-900'
            }`}
          >
            🔄 Cesiones
          </button>
        </div>
      </div>

      {/* Transfers & Loans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTransfers.length === 0 ? (
          <div className="col-span-full bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center text-slate-500 text-xs space-y-2">
            <ArrowLeftRight className="w-7 h-7 text-slate-600 mx-auto" />
            <p className="font-bold text-slate-300">No hay operaciones registradas en este apartado todavía.</p>
            <p>Pulsa en **Registrar Operación** para añadir fichajes, ventas o cesiones por voz o teclado.</p>
          </div>
        ) : (
          filteredTransfers.map((item) => {
            const isFichaje = item.type === 'Fichaje';
            const isVenta = item.type === 'Venta';
            const isLoanIn = item.type === 'Cesión (Entrada)';
            const isLoanOut = item.type === 'Cesión (Salida)';

            let badgeBg = 'bg-slate-800 border-slate-700 text-slate-300';
            if (isFichaje) badgeBg = 'bg-emerald-950 border-emerald-500/40 text-emerald-400';
            if (isVenta) badgeBg = 'bg-rose-950 border-rose-500/40 text-rose-400';
            if (isLoanIn) badgeBg = 'bg-cyan-950 border-cyan-500/40 text-cyan-400';
            if (isLoanOut) badgeBg = 'bg-indigo-950 border-indigo-500/40 text-indigo-400';

            const feeFormatted = (item.fee || 0) > 0 ? (item.fee / 1000000).toFixed(1) + ' M €' : 'Gratis / Cesión';

            return (
              <div
                key={item.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between hover:border-slate-700 transition-all"
              >
                <div className="flex items-center space-x-3.5">
                  <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center ${badgeBg}`}>
                    {isFichaje && <TrendingDown className="w-5 h-5" />}
                    {isVenta && <TrendingUp className="w-5 h-5" />}
                    {(isLoanIn || isLoanOut) && <Repeat className="w-5 h-5" />}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${badgeBg}`}>
                        {item.type}
                      </span>
                    </div>
                    <h4 className="font-extrabold text-base text-white mt-1">{item.playerName}</h4>
                    <p className="text-[11px] text-slate-400">{item.fromTo || 'Club Externo'}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-black text-amber-400 block">{feeFormatted}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <AddTransferModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={addTransfer}
      />

    </div>
  );
};
