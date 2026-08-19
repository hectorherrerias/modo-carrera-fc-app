import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AddTransferModal } from '../Modals/AddTransferModal';
import { AddShortlistModal } from '../Modals/AddShortlistModal';
import { 
  ArrowLeftRight, Plus, DollarSign, TrendingUp, TrendingDown, 
  RefreshCw, Repeat, BookmarkCheck, BookmarkPlus, Trash2, CheckCircle2, 
  Sparkles, Search, UserCheck, Shield 
} from 'lucide-react';

export const TransfersTab = () => {
  const { 
    activeSeason, 
    currentTransfers, 
    addTransfer, 
    currentShortlist, 
    addShortlistPlayer, 
    deleteShortlistPlayer, 
    updateShortlistPlayer 
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState('transfers'); // 'transfers' | 'shortlist'
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isShortlistModalOpen, setIsShortlistModalOpen] = useState(false);
  const [filterType, setFilterType] = useState('ALL');
  const [shortlistSearch, setShortlistSearch] = useState('');

  if (!activeSeason) return null;

  const budgetFormatted = (activeSeason.budget || 0).toLocaleString('es-ES') + ' €';

  const filteredTransfers = currentTransfers.filter(t => {
    if (filterType === 'ALL') return true;
    if (filterType === 'FICHAJES') return t.type === 'Fichaje';
    if (filterType === 'VENTAS') return t.type === 'Venta';
    if (filterType === 'CESIONES') return (t.type || '').includes('Cesión');
    return true;
  });

  const filteredShortlist = (currentShortlist || []).filter(item => {
    const term = shortlistSearch.toLowerCase();
    return (
      (item.name || '').toLowerCase().includes(term) ||
      (item.currentClub || '').toLowerCase().includes(term) ||
      (item.position || '').toLowerCase().includes(term)
    );
  });

  const freeAgentsCount = (currentShortlist || []).filter(s => s.contractExpiring).length;

  return (
    <div className="space-y-6">
      
      {/* Sub-Navigation Switcher (Fichajes y Ventas vs Lista de Seguimiento) */}
      <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl w-fit shadow-xl">
        <button
          onClick={() => setActiveSubTab('transfers')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeSubTab === 'transfers'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <ArrowLeftRight className="w-3.5 h-3.5" />
          <span>Fichajes y Ventas ({currentTransfers.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('shortlist')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeSubTab === 'shortlist'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <BookmarkCheck className="w-3.5 h-3.5" />
          <span>Lista de Seguimiento (Ojeadores) ({currentShortlist?.length || 0})</span>
        </button>
      </div>

      {/* SUBTAB 1: FICHAJES Y VENTAS */}
      {activeSubTab === 'transfers' && (
        <div className="space-y-6 animate-fade-in">
          
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
              onClick={() => setIsTransferModalOpen(true)}
              className="flex items-center space-x-2 px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-2xl shadow-lg shadow-emerald-500/20 transition-all shrink-0 cursor-pointer"
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
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  filterType === 'ALL'
                    ? 'bg-slate-800 text-white border border-slate-700'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-900'
                }`}
              >
                Todas ({currentTransfers.length})
              </button>

              <button
                onClick={() => setFilterType('FICHAJES')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterType === 'FICHAJES'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-slate-950 text-slate-400 hover:text-emerald-400 border border-slate-900'
                }`}
              >
                📥 Fichajes
              </button>

              <button
                onClick={() => setFilterType('VENTAS')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterType === 'VENTAS'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                    : 'bg-slate-950 text-slate-400 hover:text-rose-400 border border-slate-900'
                }`}
              >
                📤 Ventas
              </button>

              <button
                onClick={() => setFilterType('CESIONES')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
        </div>
      )}

      {/* SUBTAB 2: LISTA DE SEGUIMIENTO (OJEADORES / SHORTLIST) */}
      {activeSubTab === 'shortlist' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Shortlist Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <BookmarkCheck className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-extrabold uppercase text-cyan-400 bg-cyan-950 border border-cyan-500/30 px-2 py-0.5 rounded">
                    Red de Ojeadores
                  </span>
                  {freeAgentsCount > 0 && (
                    <span className="text-[10px] font-extrabold uppercase text-emerald-400 bg-emerald-950 border border-emerald-500/30 px-2 py-0.5 rounded">
                      {freeAgentsCount} Terminan Contrato 🆓
                    </span>
                  )}
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white font-outfit mt-1">Lista de Seguimiento</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Anota posibles fichajes futuros, perlas recomendadas por tus ojeadores y jugadores que terminan contrato.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsShortlistModalOpen(true)}
              className="flex items-center space-x-2 px-5 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs rounded-2xl shadow-lg shadow-cyan-500/20 transition-all shrink-0 cursor-pointer"
            >
              <BookmarkPlus className="w-4 h-4" />
              <span>Añadir a la Lista de Seguimiento</span>
            </button>
          </div>

          {/* Search bar for shortlist */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar por jugador, posición o club..."
                value={shortlistSearch}
                onChange={(e) => setShortlistSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <span className="text-[11px] font-bold text-slate-400 self-end sm:self-center">
              {filteredShortlist.length} {filteredShortlist.length === 1 ? 'jugador en seguimiento' : 'jugadores en seguimiento'}
            </span>
          </div>

          {/* Shortlist Data Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                
                <thead>
                  <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-extrabold uppercase text-slate-400 select-none">
                    <th className="py-3.5 px-4">Nombre</th>
                    <th className="py-3.5 px-3">Posición</th>
                    <th className="py-3.5 px-3 text-center">Edad</th>
                    <th className="py-3.5 px-4">Club Actual</th>
                    <th className="py-3.5 px-4 text-right">Valor Estimado</th>
                    <th className="py-3.5 px-4 text-center">Termina Contrato (Fichaje Libre)</th>
                    <th className="py-3.5 px-4 text-right">Acciones</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800/60 text-xs font-semibold text-slate-200">
                  {filteredShortlist.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-10 text-center text-slate-500 text-xs">
                        <BookmarkCheck className="w-7 h-7 text-slate-600 mx-auto mb-2" />
                        <p className="font-bold text-slate-300">No hay jugadores en tu lista de seguimiento todavía.</p>
                        <p className="mt-1">Haz clic en **Añadir a la Lista de Seguimiento** para registrar objetivos de mercado.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredShortlist.map((player) => {
                      const valFormatted = player.estimatedValue 
                        ? (Number(player.estimatedValue) >= 1000000 
                            ? (Number(player.estimatedValue) / 1000000).toFixed(1) + ' M €' 
                            : Number(player.estimatedValue).toLocaleString('es-ES') + ' €')
                        : 'Desconocido';

                      return (
                        <tr key={player.id} className="hover:bg-slate-800/40 transition-colors">
                          
                          {/* Nombre & Notes */}
                          <td className="py-3.5 px-4">
                            <div className="font-extrabold text-white text-sm">{player.name}</div>
                            {player.notes && (
                              <div className="text-[10px] text-slate-400 italic mt-0.5">{player.notes}</div>
                            )}
                          </td>

                          {/* Posición */}
                          <td className="py-3.5 px-3">
                            <span className="bg-slate-950 border border-slate-800 px-2 py-0.5 rounded text-[11px] font-black text-cyan-400">
                              {player.position}
                            </span>
                          </td>

                          {/* Edad */}
                          <td className="py-3.5 px-3 text-center text-slate-300 font-bold">
                            {player.age} años
                          </td>

                          {/* Club Actual */}
                          <td className="py-3.5 px-4 font-semibold text-slate-300">
                            {player.currentClub || 'Agente Libre'}
                          </td>

                          {/* Valor Estimado */}
                          <td className="py-3.5 px-4 text-right font-black text-emerald-400 font-outfit text-sm">
                            {valFormatted}
                          </td>

                          {/* Checkbox Termina Contrato (Fichaje Libre) */}
                          <td className="py-3.5 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => updateShortlistPlayer(player.id, { contractExpiring: !player.contractExpiring })}
                              className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                player.contractExpiring
                                  ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40 shadow-sm shadow-emerald-500/10'
                                  : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={Boolean(player.contractExpiring)}
                                onChange={() => {}} // Handled by button onClick
                                className="w-3.5 h-3.5 rounded border-slate-700 text-emerald-500 bg-slate-900 pointer-events-none"
                              />
                              <span>{player.contractExpiring ? 'Fichaje Libre 🆓' : 'Con Contrato'}</span>
                            </button>
                          </td>

                          {/* Acciones */}
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => deleteShortlistPlayer(player.id)}
                              title="Eliminar de la lista de seguimiento"
                              className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-950 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>

                        </tr>
                      );
                    })
                  )}
                </tbody>

              </table>
            </div>
          </div>

        </div>
      )}

      {/* Modals */}
      <AddTransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        onAdd={addTransfer}
      />

      <AddShortlistModal
        isOpen={isShortlistModalOpen}
        onClose={() => setIsShortlistModalOpen(false)}
        onAdd={addShortlistPlayer}
      />

    </div>
  );
};
