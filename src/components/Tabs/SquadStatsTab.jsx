import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Users, UserPlus, Search, ArrowUpDown, ArrowUp, ArrowDown, 
  Edit3, Trash2, ShieldAlert, Award, Activity, Plus, Minus, TrendingUp 
} from 'lucide-react';
import { AddPlayerModal } from '../Modals/AddPlayerModal';
import { UpdateStatsModal } from '../Modals/UpdateStatsModal';

// Football pitch position hierarchy: Portero -> DFC -> Laterales -> MCD -> MC -> Extremos -> DC
const POSITION_RANK = {
  // 1. Portero
  'POR': 1, 'GK': 1, 'PT': 1,
  
  // 2. DFC (Defensas Centrales)
  'DFC': 2, 'CB': 2, 'CEN': 2, 'CENTRAL': 2,
  
  // 3. Laterales (Derecho, Izquierdo, Carrileros)
  'LD': 3, 'CAD': 3, 'RB': 3, 'RWB': 3,
  'LI': 4, 'CAI': 4, 'LB': 4, 'LWB': 4,
  
  // 4. MCD (Pivote defensivo)
  'MCD': 5, 'CDM': 5, 'DM': 5, 'PIV': 5, 'PIVOTE': 5,
  
  // 5. MC (Mediocentros y Mediapuntas)
  'MC': 6, 'CM': 6, 'MED': 6,
  'MCO': 7, 'CAM': 7,
  
  // 6. Extremos (Bandas y Extremos)
  'MD': 8, 'RM': 8,
  'MI': 9, 'LM': 9,
  'ED': 10, 'RW': 10,
  'EI': 11, 'LW': 11,
  'EXT': 10,
  
  // 7. DC (Delantero Centro y Segundo Delantero)
  'SD': 12, 'CF': 12,
  'DC': 13, 'ST': 13, 'DEL': 13
};

const getPositionRank = (pos) => {
  if (!pos) return 99;
  const upper = String(pos).trim().toUpperCase();
  return POSITION_RANK[upper] !== undefined ? POSITION_RANK[upper] : 99;
};

export const SquadStatsTab = () => {
  const { currentPlayers, addPlayer, updatePlayerStats, deletePlayer } = useApp();

  const [search, setSearch] = useState('');
  const [positionFilter, setPositionFilter] = useState('ALL');
  const [sortField, setSortField] = useState('position');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' | 'desc'
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);

  const handleQuickOvrChange = (playerId, delta) => {
    const player = currentPlayers.find(p => p.id === playerId);
    if (!player) return;
    const currentOvr = Number(player.overall) || 75;
    const nextOvr = Math.max(40, Math.min(99, currentOvr + delta));
    updatePlayerStats(playerId, { overall: nextOvr });
  };

  const handleDirectOvrChange = (playerId, val) => {
    const num = Number(val);
    if (!isNaN(num) && num >= 40 && num <= 99) {
      updatePlayerStats(playerId, { overall: num });
    }
  };

  // Column sort toggle
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      // For position, name, or status start with asc. For numeric stats, start desc.
      setSortOrder(field === 'position' || field === 'name' || field === 'status' ? 'asc' : 'desc');
    }
  };

  // Filter & sort player list
  const filteredPlayers = useMemo(() => {
    return currentPlayers
      .filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
        const matchesPos = positionFilter === 'ALL' || p.position === positionFilter;
        return matchesSearch && matchesPos;
      })
      .sort((a, b) => {
        // Special sorting by tactical position hierarchy
        if (sortField === 'position') {
          const rankA = getPositionRank(a.position);
          const rankB = getPositionRank(b.position);
          if (rankA !== rankB) {
            return sortOrder === 'asc' ? (rankA - rankB) : (rankB - rankA);
          }
          return (b.overall || 0) - (a.overall || 0);
        }

        let aVal = a[sortField];
        let bVal = b[sortField];

        if (sortField === 'contractYears') {
          aVal = a.contractYears !== undefined ? a.contractYears : 3;
          bVal = b.contractYears !== undefined ? b.contractYears : 3;
        } else if (sortField === 'officialMVPs') {
          aVal = a.officialMVPs || 0;
          bVal = b.officialMVPs || 0;
        } else if (sortField === 'myMVPs') {
          aVal = a.myMVPs || 0;
          bVal = b.myMVPs || 0;
        } else if (sortField === 'status') {
          aVal = a.status || 'Disponible';
          bVal = b.status || 'Disponible';
        }

        // If nested in stats object
        if (['minutes', 'matches', 'goals', 'assists', 'cleanSheets', 'yellowCards', 'redCards'].includes(sortField)) {
          aVal = a.stats ? a.stats[sortField] || 0 : 0;
          bVal = b.stats ? b.stats[sortField] || 0 : 0;
        }

        if (typeof aVal === 'string') {
          return sortOrder === 'asc' 
            ? aVal.localeCompare(bVal) 
            : bVal.localeCompare(aVal);
        }

        return sortOrder === 'asc' ? (aVal - bVal) : (bVal - aVal);
      });
  }, [currentPlayers, search, positionFilter, sortField, sortOrder]);

  const uniquePositions = useMemo(() => {
    const set = new Set(currentPlayers.map(p => p.position).filter(Boolean));
    return Array.from(set).sort((a, b) => getPositionRank(a) - getPositionRank(b));
  }, [currentPlayers]);

  const handleDelete = (id, name) => {
    if (window.confirm(`¿Seguro que deseas eliminar a ${name} de la plantilla?`)) {
      deletePlayer(id);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Controls Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        
        {/* Search & Position Filter */}
        <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3 w-full md:w-auto">
          
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Buscar jugador..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="w-full sm:w-auto">
            <select
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-xs font-bold text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">Todas las posiciones ({currentPlayers.length})</option>
              {uniquePositions.map(pos => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>
          </div>

        </div>

        {/* Action Button */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="w-full md:w-auto flex items-center justify-center space-x-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>Añadir Jugador</span>
        </button>

      </div>

      {/* Stats Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            
            {/* Table Header */}
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-extrabold uppercase text-slate-400 select-none">
                
                <th onClick={() => handleSort('name')} className="py-3.5 px-4 cursor-pointer hover:text-white transition-colors">
                  <div className="flex items-center space-x-1">
                    <span>Nombre</span>
                    {sortField === 'name' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-emerald-400" /> : <ArrowDown className="w-3 h-3 text-emerald-400" />)}
                  </div>
                </th>

                <th onClick={() => handleSort('position')} className="py-3.5 px-3 cursor-pointer hover:text-white transition-colors">
                  <div className="flex items-center space-x-1">
                    <span>Posición</span>
                    {sortField === 'position' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-emerald-400" /> : <ArrowDown className="w-3 h-3 text-emerald-400" />)}
                  </div>
                </th>

                <th onClick={() => handleSort('overall')} className="py-3.5 px-3 cursor-pointer hover:text-white transition-colors text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <span>GRL</span>
                    {sortField === 'overall' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-amber-400" /> : <ArrowDown className="w-3 h-3 text-amber-400" />)}
                  </div>
                </th>

                <th onClick={() => handleSort('status')} className="py-3.5 px-3 cursor-pointer hover:text-white transition-colors">
                  <div className="flex items-center space-x-1">
                    <span>Estado</span>
                    {sortField === 'status' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-emerald-400" /> : <ArrowDown className="w-3 h-3 text-emerald-400" />)}
                  </div>
                </th>

                <th onClick={() => handleSort('contractYears')} className="py-3.5 px-3 cursor-pointer hover:text-white transition-colors text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <span>Contrato</span>
                    {sortField === 'contractYears' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-cyan-400" /> : <ArrowDown className="w-3 h-3 text-cyan-400" />)}
                  </div>
                </th>

                <th onClick={() => handleSort('officialMVPs')} className="py-3.5 px-3 cursor-pointer hover:text-white transition-colors text-center" title="MVPs Oficiales del Partido">
                  <div className="flex items-center justify-center space-x-1">
                    <span>👑 Oficial</span>
                    {sortField === 'officialMVPs' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-amber-400" /> : <ArrowDown className="w-3 h-3 text-amber-400" />)}
                  </div>
                </th>

                <th onClick={() => handleSort('myMVPs')} className="py-3.5 px-3 cursor-pointer hover:text-white transition-colors text-center" title="MVPs del Mánager (Destacados)">
                  <div className="flex items-center justify-center space-x-1">
                    <span>⭐ Mánager</span>
                    {sortField === 'myMVPs' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-cyan-400" /> : <ArrowDown className="w-3 h-3 text-cyan-400" />)}
                  </div>
                </th>

                <th onClick={() => handleSort('matches')} className="py-3.5 px-3 cursor-pointer hover:text-white transition-colors text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <span>Partidos</span>
                    {sortField === 'matches' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-slate-300" /> : <ArrowDown className="w-3 h-3 text-slate-300" />)}
                  </div>
                </th>

                <th onClick={() => handleSort('minutes')} className="py-3.5 px-3 cursor-pointer hover:text-white transition-colors text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <span>Minutos</span>
                    {sortField === 'minutes' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-slate-300" /> : <ArrowDown className="w-3 h-3 text-slate-300" />)}
                  </div>
                </th>

                <th onClick={() => handleSort('goals')} className="py-3.5 px-3 cursor-pointer hover:text-white transition-colors text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <span>Goles ⚽</span>
                    {sortField === 'goals' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-emerald-400" /> : <ArrowDown className="w-3 h-3 text-emerald-400" />)}
                  </div>
                </th>

                <th onClick={() => handleSort('assists')} className="py-3.5 px-3 cursor-pointer hover:text-white transition-colors text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <span>Asist. 👟</span>
                    {sortField === 'assists' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-cyan-400" /> : <ArrowDown className="w-3 h-3 text-cyan-400" />)}
                  </div>
                </th>

                <th onClick={() => handleSort('cleanSheets')} className="py-3.5 px-3 cursor-pointer hover:text-white transition-colors text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <span>P. Cero 🧤</span>
                    {sortField === 'cleanSheets' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-blue-400" /> : <ArrowDown className="w-3 h-3 text-blue-400" />)}
                  </div>
                </th>

                <th onClick={() => handleSort('yellowCards')} className="py-3.5 px-3 cursor-pointer hover:text-white transition-colors text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <span>Amarillas 🟨</span>
                    {sortField === 'yellowCards' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-amber-400" /> : <ArrowDown className="w-3 h-3 text-amber-400" />)}
                  </div>
                </th>

                <th onClick={() => handleSort('redCards')} className="py-3.5 px-3 cursor-pointer hover:text-white transition-colors text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <span>Rojas 🟥</span>
                    {sortField === 'redCards' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-rose-400" /> : <ArrowDown className="w-3 h-3 text-rose-400" />)}
                  </div>
                </th>

                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-800/60 text-xs font-semibold text-slate-200">
              {filteredPlayers.length === 0 ? (
                <tr>
                  <td colSpan="15" className="py-8 text-center text-slate-500 text-sm">
                    No se encontraron jugadores registrados en esta temporada.
                  </td>
                </tr>
              ) : (
                filteredPlayers.map((player) => (
                  <tr key={player.id} className="hover:bg-slate-800/40 transition-colors">
                    
                    <td className="py-3.5 px-4 font-extrabold text-white">
                      {player.name}
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="bg-slate-950 border border-slate-800 px-2 py-0.5 rounded text-[11px] font-black text-emerald-400">
                        {player.position}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      {(() => {
                        const initOvr = player.initialOvr !== undefined ? Number(player.initialOvr) : (Number(player.overall) || 75);
                        const currOvr = Number(player.overall) || 75;
                        const diff = currOvr - initOvr;

                        return (
                          <div className="inline-flex items-center justify-center space-x-1.5">
                            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-1 py-0.5 shadow-inner">
                              <button
                                type="button"
                                onClick={() => handleQuickOvrChange(player.id, -1)}
                                title="Reducir media (-1)"
                                className="text-slate-500 hover:text-rose-400 p-0.5 transition-colors cursor-pointer"
                              >
                                <Minus className="w-2.5 h-2.5" />
                              </button>

                              <input
                                type="number"
                                min="40"
                                max="99"
                                value={currOvr}
                                onChange={(e) => handleDirectOvrChange(player.id, e.target.value)}
                                className="w-7 text-center bg-transparent font-black text-amber-400 text-xs focus:outline-none focus:text-white"
                              />

                              <button
                                type="button"
                                onClick={() => handleQuickOvrChange(player.id, 1)}
                                title="Aumentar media (+1)"
                                className="text-slate-500 hover:text-emerald-400 p-0.5 transition-colors cursor-pointer"
                              >
                                <Plus className="w-2.5 h-2.5" />
                              </button>
                            </div>

                            {/* OVR Growth Indicator Badge (+2 in green, -1 in red) */}
                            {diff !== 0 && (
                              <span
                                title={`Media Inicial: ${initOvr} | Evolución: ${diff > 0 ? `+${diff}` : diff}`}
                                className={`px-1.5 py-0.5 rounded-lg text-[10px] font-black border shadow-sm ${
                                  diff > 0 
                                    ? 'bg-emerald-950/90 text-emerald-400 border-emerald-500/40 shadow-emerald-500/10' 
                                    : 'bg-rose-950/90 text-rose-400 border-rose-500/40 shadow-rose-500/10'
                                }`}
                              >
                                {diff > 0 ? `+${diff}` : diff}
                              </span>
                            )}
                          </div>
                        );
                      })()}
                    </td>

                    <td className="py-3.5 px-3">
                      {(() => {
                        const s = player.status || 'Disponible';
                        const isInjured = s.toLowerCase().includes('lesionad');
                        const isSuspended = s.toLowerCase().includes('sancionad');
                        const isAvailable = s.toLowerCase().includes('disponible');

                        let badgeClass = 'bg-slate-950 text-slate-300 border-slate-800';
                        if (isInjured) badgeClass = 'bg-rose-950/80 text-rose-400 border-rose-500/40';
                        else if (isSuspended) badgeClass = 'bg-amber-950/80 text-amber-400 border-amber-500/40';
                        else if (isAvailable) badgeClass = 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40';

                        return (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold border ${badgeClass}`}>
                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isInjured ? 'bg-rose-400 animate-pulse' : isSuspended ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                            {s}
                          </span>
                        );
                      })()}
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <span className={`text-[11px] font-bold ${
                        (player.contractYears ?? 3) <= 1 ? 'text-rose-400 font-extrabold' : 'text-cyan-400'
                      }`}>
                        {player.contractYears !== undefined ? `${player.contractYears} ${player.contractYears === 1 ? 'año' : 'años'}` : '3 años'}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <span className={`font-extrabold text-xs ${(player.officialMVPs || 0) > 0 ? 'text-amber-400' : 'text-slate-600'}`}>
                        {(player.officialMVPs || 0) > 0 ? `👑 ${player.officialMVPs}` : '-'}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <span className={`font-extrabold text-xs ${(player.myMVPs || 0) > 0 ? 'text-cyan-400' : 'text-slate-600'}`}>
                        {(player.myMVPs || 0) > 0 ? `⭐ ${player.myMVPs}` : '-'}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-center text-slate-300">
                      {player.stats?.matches || 0}
                    </td>

                    <td className="py-3.5 px-3 text-center text-slate-400 font-mono">
                      {player.stats?.minutes || 0}'
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <span className={`font-extrabold ${player.stats?.goals > 0 ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                        {player.stats?.goals || 0}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <span className={`font-extrabold ${player.stats?.assists > 0 ? 'text-cyan-400 font-bold' : 'text-slate-500'}`}>
                        {player.stats?.assists || 0}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-center text-slate-400">
                      {player.stats?.cleanSheets || 0}
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <span className={player.stats?.yellowCards > 0 ? 'text-amber-400 font-bold' : 'text-slate-600'}>
                        {player.stats?.yellowCards || 0}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <span className={player.stats?.redCards > 0 ? 'text-rose-500 font-bold' : 'text-slate-600'}>
                        {player.stats?.redCards || 0}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button
                        onClick={() => setEditingPlayer(player)}
                        title="Actualizar Estadísticas"
                        className="p-1.5 rounded-lg border border-slate-800 hover:border-amber-500/50 text-slate-400 hover:text-amber-400 bg-slate-950 transition-all"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDelete(player.id, player.name)}
                        title="Eliminar Jugador"
                        className="p-1.5 rounded-lg border border-slate-800 hover:border-rose-500/50 text-slate-400 hover:text-rose-400 bg-slate-950 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>

          </table>
        </div>
      </div>

      {/* Modals */}
      <AddPlayerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={addPlayer}
      />

      <UpdateStatsModal
        isOpen={!!editingPlayer}
        onClose={() => setEditingPlayer(null)}
        player={editingPlayer}
        onUpdate={updatePlayerStats}
      />

    </div>
  );
};
