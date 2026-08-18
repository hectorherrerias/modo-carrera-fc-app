import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MEDIA_OUTLETS } from '../../utils/pressAIEngine';
import { Newspaper, Sparkles, Star, Bookmark, Trash2, Bot } from 'lucide-react';

export const PressNewsTab = () => {
  const { activeClub, activeSeason, currentNews, toggleNewsFavorite, clearUnfavoritedNews } = useApp();

  const [selectedOutletFilter, setSelectedOutletFilter] = useState('ALL');
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  if (!activeClub || !activeSeason) return null;

  const filteredNews = currentNews.filter(n => {
    const matchesOutlet = selectedOutletFilter === 'ALL' || n.outletId === selectedOutletFilter;
    const matchesFav = !onlyFavorites || n.isFavorite;
    return matchesOutlet && matchesFav;
  });

  const favoritesCount = currentNews.filter(n => n.isFavorite).length;

  return (
    <div className="space-y-8">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
            <Newspaper className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-extrabold uppercase text-red-400 bg-red-950 border border-red-500/30 px-2 py-0.5 rounded flex items-center space-x-1">
                <Bot className="w-3 h-3" />
                <span>Generación 100% Automática por la IA</span>
              </span>

              {favoritesCount > 0 && (
                <span className="text-[10px] font-extrabold uppercase text-amber-400 bg-amber-950 border border-amber-500/30 px-2 py-0.5 rounded flex items-center space-x-1">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span>{favoritesCount} Guardados</span>
                </span>
              )}
            </div>
            <h3 className="text-2xl font-black text-white font-outfit mt-1">Prensa y Portadas de Periódicos</h3>
            <p className="text-xs text-slate-400 mt-1">
              Las portadas de MARCA, Diario AS y El Chiringuito se redactan y diseñan **automáticamente** según lo que respondes en las ruedas de prensa.
            </p>
          </div>
        </div>

        <button
          onClick={clearUnfavoritedNews}
          title="Limpiar noticias no favoritas del partido anterior"
          className="flex items-center space-x-1.5 px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-rose-400 font-bold text-xs rounded-xl border border-slate-800 transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Limpiar No Favoritas del Partido Anterior</span>
        </button>
      </div>

      {/* Outlet & Favorites Filter Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-3">
        
        {/* Outlets scroll */}
        <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto scrollbar-none">
          <button
            onClick={() => setSelectedOutletFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
              selectedOutletFilter === 'ALL'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            Todos los Medios ({currentNews.length})
          </button>

          {MEDIA_OUTLETS.map((outlet) => (
            <button
              key={outlet.id}
              onClick={() => setSelectedOutletFilter(outlet.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                selectedOutletFilter === outlet.id
                  ? 'bg-slate-900 border-white text-white font-black shadow-md'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span>{outlet.logo}</span>
            </button>
          ))}
        </div>

        {/* Favorites Filter Toggle */}
        <button
          onClick={() => setOnlyFavorites(!onlyFavorites)}
          className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
            onlyFavorites
              ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-lg shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-amber-400'
          }`}
        >
          <Star className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-slate-950 text-slate-950' : 'text-amber-400'}`} />
          <span>Ver Solo Favoritos ({favoritesCount})</span>
        </button>

      </div>

      {/* News Article Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredNews.length === 0 ? (
          <div className="col-span-full bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center text-slate-500 text-xs space-y-2">
            <Sparkles className="w-6 h-6 text-amber-400 mx-auto" />
            <p className="font-bold text-slate-300">No hay noticias en esta sección todavía.</p>
            <p>Ve a la pestaña 🎙️ **Ruedas de Prensa**, responde a las preguntas de los periodistas y la IA generará automáticamente las portadas de los periódicos aquí.</p>
          </div>
        ) : (
          filteredNews.map((news) => {
            const outletObj = MEDIA_OUTLETS.find(m => m.id === news.outletId) || MEDIA_OUTLETS[0];

            return (
              <div
                key={news.id}
                className={`group relative bg-slate-900 border rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 flex flex-col justify-between ${
                  news.isFavorite ? 'border-amber-500/60 shadow-amber-950/30' : 'border-slate-800 hover:border-red-500/40'
                }`}
              >
                {/* Media Outlet Header Strip */}
                <div className={`px-6 py-3 ${outletObj.bg} flex items-center justify-between shadow-md`}>
                  <div className="flex items-center space-x-2">
                    <span className="font-black text-sm text-white tracking-widest uppercase font-outfit">
                      {news.outletLogo || outletObj.logo}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold text-white/80 uppercase">
                      {news.date}
                    </span>

                    {/* Bookmark / Favorite Toggle Button */}
                    <button
                      onClick={() => toggleNewsFavorite(news.id)}
                      title={news.isFavorite ? "Quitar de favoritos" : "Guardar en favoritos"}
                      className={`p-1.5 rounded-full transition-all ${
                        news.isFavorite 
                          ? 'bg-amber-400 text-slate-950 shadow-md scale-110' 
                          : 'bg-black/30 text-white/80 hover:text-amber-300'
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${news.isFavorite ? 'fill-slate-950' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Newspaper Content Body */}
                <div className="p-6 space-y-4">
                  
                  {/* Dramatic Front-Page Headline */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-extrabold uppercase text-red-400 bg-red-950 border border-red-500/30 px-2 py-0.5 rounded">
                        PORTADA AUTOMÁTICA DE PRENSA
                      </span>

                      {news.isFavorite && (
                        <span className="text-[9px] font-extrabold uppercase text-amber-400 bg-amber-950 border border-amber-500/30 px-2 py-0.5 rounded flex items-center space-x-1">
                          <Bookmark className="w-2.5 h-2.5 fill-amber-400" />
                          <span>Guardada en Favoritos</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-2xl font-black text-white font-outfit uppercase tracking-tight leading-tight group-hover:text-red-400 transition-colors">
                      {news.headline}
                    </h3>
                    <p className="text-xs font-extrabold text-slate-300 italic border-l-2 border-red-500 pl-3">
                      {news.subheadline}
                    </p>
                  </div>

                  {/* Article Text */}
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {news.body}
                  </p>
                </div>

                {/* Newspaper Footer Strip */}
                <div className="px-6 py-3 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                  <span>Periodista Redactor: <strong className="text-slate-300">{news.author || 'José Félix Díaz'}</strong></span>
                  <button
                    onClick={() => toggleNewsFavorite(news.id)}
                    className="text-xs font-bold text-amber-400 flex items-center space-x-1 hover:underline"
                  >
                    <span>{news.isFavorite ? '⭐ Guardado en Favoritos' : '☆ Guardar en Favoritos'}</span>
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
