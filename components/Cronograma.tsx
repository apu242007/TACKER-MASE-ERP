import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, List, 
  Search, Filter, X, AlertTriangle, CheckCircle2, Clock, Info, ExternalLink
} from 'lucide-react';
import { 
  mockWorklifts, mockPickups, mockHSE, mockTPR, calculateStatus 
} from '../services/mockData';
import { ExpirationStatus } from '../types';
import { StatusBadge } from './StatusBadge';

// --- Types for Internal Logic ---
interface CalendarEvent {
  id: string;
  moduleId: string;
  title: string;
  date: string; // ISO Date YYYY-MM-DD
  status: ExpirationStatus;
  moduleName: string;
  details: string;
  owner?: string;
}

// --- Helper: Aggregate Data ---
const getAllEvents = (): CalendarEvent[] => {
  const events: CalendarEvent[] = [];

  // Worklifts
  mockWorklifts.forEach(w => {
    if (w.vtoInspeccion) {
      events.push({
        id: w.id, moduleId: 'worklift', title: `Worklift ${w.nroInterno} - ${w.modelo}`,
        date: w.vtoInspeccion, status: calculateStatus(w.vtoInspeccion),
        moduleName: 'Worklift / Plataformas', details: `Ubicación: ${w.ubicado}`, owner: 'Mantenimiento'
      });
    }
  });

  // Pickups
  mockPickups.forEach(p => {
    if (p.vtvVto) {
      events.push({
        id: p.id, moduleId: 'pickups', title: `Pickup ${p.dominio}`,
        date: p.vtvVto, status: calculateStatus(p.vtvVto),
        moduleName: 'Flota Pickups', details: `Interno: ${p.nroInterno} - KM: ${p.kmActual}`, owner: 'Flota'
      });
    }
  });

  // HSE
  mockHSE.forEach(h => {
    if (h.fechaVencimientoCalibracion) {
      events.push({
        id: h.id, moduleId: 'hse', title: `${h.type} ${h.nroInstrumento}`,
        date: h.fechaVencimientoCalibracion, status: calculateStatus(h.fechaVencimientoCalibracion),
        moduleName: h.type === 'DETECTOR' ? 'Detectores' : 'Equipos ERA', 
        details: `Marca: ${h.marca}`, owner: h.responsable
      });
    }
  });

  // TPR Checklists (simulated expiration logic)
  mockTPR.forEach(t => {
      // Assuming a valid date for demo
      const date = t.fechaInspeccion ? new Date(t.fechaInspeccion) : new Date();
      date.setMonth(date.getMonth() + 6); // Example: expires in 6 months
      const dateStr = date.toISOString().split('T')[0];
      
      events.push({
        id: t.id, moduleId: 'tpr', title: `TPR Checklist ${t.idTrp}`,
        date: dateStr, status: calculateStatus(dateStr),
        moduleName: 'TPR Checklist', details: `Ubicación: ${t.ubicacion}`, owner: 'Calidad'
      });
  });

  return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

export const Cronograma: React.FC = () => {
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ExpirationStatus | 'ALL'>('ALL');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const allEvents = useMemo(() => getAllEvents(), []);

  // Filter Logic
  const filteredEvents = useMemo(() => {
    return allEvents.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            event.moduleName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || event.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [allEvents, searchTerm, statusFilter]);

  // Calendar Logic
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(); // 0 = Sunday
  
  // Adjust so Monday is first day (optional, usually preferred in business)
  // Let's stick to Sunday = 0 for simplicity or adjust visual index
  
  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const handleToday = () => setCurrentDate(new Date());

  const getEventsForDay = (day: number) => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateStr = `${year}-${month}-${dayStr}`;
    return filteredEvents.filter(e => e.date === dateStr);
  };

  // --- Styles Helper ---
  const getStatusColor = (status: ExpirationStatus) => {
    switch (status) {
      case 'VENCIDO': return 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200';
      case 'CRITICO': return 'bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200';
      case 'POR_VENCER': return 'bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200';
      case 'VIGENTE': return 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusDot = (status: ExpirationStatus) => {
    switch (status) {
      case 'VENCIDO': return 'bg-red-500';
      case 'CRITICO': return 'bg-orange-500';
      case 'POR_VENCER': return 'bg-yellow-500';
      case 'VIGENTE': return 'bg-emerald-500';
      default: return 'bg-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-lg shadow-sm border border-slate-200">
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button 
              onClick={() => setView('calendar')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-2 text-sm font-medium transition-all ${view === 'calendar' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <CalendarIcon size={16} /> Calendario
            </button>
            <button 
              onClick={() => setView('list')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-2 text-sm font-medium transition-all ${view === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <List size={16} /> Lista Detallada
            </button>
          </div>
          
          {view === 'calendar' && (
            <div className="flex items-center gap-2">
              <button onClick={handlePrevMonth} className="p-1 hover:bg-slate-100 rounded-full"><ChevronLeft size={20} /></button>
              <span className="font-bold text-slate-800 w-32 text-center">
                {currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' }).toUpperCase()}
              </span>
              <button onClick={handleNextMonth} className="p-1 hover:bg-slate-100 rounded-full"><ChevronRight size={20} /></button>
              <button onClick={handleToday} className="text-xs font-medium text-blue-600 hover:underline ml-2">Hoy</button>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Buscar evento..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
            />
          </div>
          
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="pl-3 pr-8 py-1.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="ALL">Todos los Estados</option>
            <option value="VENCIDO">Vencidos</option>
            <option value="CRITICO">Críticos (≤7 días)</option>
            <option value="POR_VENCER">Por Vencer (≤30 días)</option>
            <option value="VIGENTE">Vigentes</option>
          </select>
        </div>
      </div>

      {/* --- CALENDAR VIEW --- */}
      {view === 'calendar' && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
          {/* Weekday Header */}
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-xs font-semibold text-slate-500 py-2">
            <div>DOM</div><div>LUN</div><div>MAR</div><div>MIE</div><div>JUE</div><div>VIE</div><div>SAB</div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-7 auto-rows-[minmax(120px,auto)] divide-x divide-y divide-slate-200">
            {/* Empty cells for padding */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-slate-50/50"></div>
            ))}

            {/* Day Cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayEvents = getEventsForDay(day);
              const isToday = 
                day === new Date().getDate() && 
                currentDate.getMonth() === new Date().getMonth() && 
                currentDate.getFullYear() === new Date().getFullYear();

              return (
                <div key={day} className={`p-2 relative group transition-colors ${isToday ? 'bg-blue-50/30' : 'hover:bg-slate-50'}`}>
                  <span className={`text-sm font-semibold block mb-1 ${isToday ? 'text-blue-600' : 'text-slate-700'}`}>
                    {day}
                  </span>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map(ev => (
                      <button
                        key={ev.id}
                        onClick={() => setSelectedEvent(ev)}
                        className={`w-full text-left px-2 py-1 rounded text-[10px] font-medium truncate border ${getStatusColor(ev.status)}`}
                        title={ev.title}
                      >
                        {ev.title}
                      </button>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-[10px] text-slate-400 font-medium text-center">
                        + {dayEvents.length - 3} más
                      </div>
                    )}
                  </div>
                  {/* Quick Add Placeholder (for visual cue) */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="text-slate-400 hover:text-blue-600"><PlusCircleIcon /></button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- LIST VIEW --- */}
      {view === 'list' && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Estado</th>
                  <th className="px-6 py-3">Fecha Vto.</th>
                  <th className="px-6 py-3">Ítem / Equipo</th>
                  <th className="px-6 py-3">Módulo</th>
                  <th className="px-6 py-3">Responsable</th>
                  <th className="px-6 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEvents.length > 0 ? (
                  filteredEvents.map(ev => (
                    <tr key={ev.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <StatusBadge status={ev.status} />
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700 font-mono">
                        {ev.date}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-800">{ev.title}</div>
                        <div className="text-xs text-slate-500">{ev.details}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                           {ev.moduleName}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {ev.owner || '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => setSelectedEvent(ev)}
                          className="text-blue-600 hover:text-blue-800 font-medium text-xs border border-blue-200 bg-blue-50 px-3 py-1.5 rounded-md hover:bg-blue-100 transition-colors"
                        >
                          Ver Detalle
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      No se encontraron eventos para los filtros seleccionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- DETAIL MODAL --- */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-scale-up">
            <div className={`px-6 py-4 border-b flex justify-between items-center ${
              selectedEvent.status === 'VENCIDO' ? 'bg-red-50 border-red-100' : 
              selectedEvent.status === 'CRITICO' ? 'bg-orange-50 border-orange-100' : 'bg-slate-50 border-slate-100'
            }`}>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getStatusDot(selectedEvent.status)} shadow-sm`}></div>
                <h3 className="font-bold text-slate-800">Detalle de Vencimiento</h3>
              </div>
              <button onClick={() => setSelectedEvent(null)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Equipo / Ítem</label>
                <p className="text-lg font-semibold text-slate-800">{selectedEvent.title}</p>
                <p className="text-sm text-slate-500">{selectedEvent.details}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Clock size={12} /> Fecha Vencimiento
                  </label>
                  <p className="text-base font-mono font-medium text-slate-800 mt-1">{selectedEvent.date}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                     <Info size={12} /> Estado Actual
                  </label>
                  <div className="mt-1">
                    <StatusBadge status={selectedEvent.status} />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Módulo de Origen</label>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm font-medium text-slate-700">{selectedEvent.moduleName}</span>
                  {selectedEvent.owner && <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-500">Resp: {selectedEvent.owner}</span>}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex gap-3">
                 <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm text-sm">
                    Renovar / Gestionar
                 </button>
                 <button className="flex items-center justify-center gap-2 flex-1 bg-white border border-slate-300 text-slate-700 py-2 rounded-lg font-medium hover:bg-slate-50 transition-colors text-sm">
                    <ExternalLink size={16} /> Ver en Módulo
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Simple helper icon for the grid
const PlusCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="16"></line>
    <line x1="8" y1="12" x2="16" y2="12"></line>
  </svg>
);
