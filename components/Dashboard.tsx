import React from 'react';
import { mockWorklifts, mockPickups, mockHSE, calculateStatus } from '../services/mockData';
import { StatusBadge } from './StatusBadge';
import { BarChart3, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

export const Dashboard: React.FC = () => {
  // Aggregate all expiring items
  const allItems = [
    ...mockWorklifts.map(w => ({ 
      id: w.id, 
      module: 'Worklift', 
      name: `${w.modelo} (${w.nroInterno})`, 
      date: w.vtoInspeccion, 
      status: calculateStatus(w.vtoInspeccion) 
    })),
    ...mockPickups.map(p => ({ 
      id: p.id, 
      module: 'Pickup', 
      name: `${p.dominio} - ${p.modelo}`, 
      date: p.vtvVto, 
      status: calculateStatus(p.vtvVto) 
    })),
    ...mockHSE.map(h => ({ 
      id: h.id, 
      module: 'HSE', 
      name: `${h.type} ${h.nroInstrumento}`, 
      date: h.fechaVencimientoCalibracion || '', 
      status: calculateStatus(h.fechaVencimientoCalibracion || '') 
    }))
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const criticalCount = allItems.filter(i => i.status === 'VENCIDO' || i.status === 'CRITICO').length;
  const warningCount = allItems.filter(i => i.status === 'POR_VENCER').length;
  const goodCount = allItems.filter(i => i.status === 'VIGENTE').length;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Resumen Operativo</h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Vencidos / Críticos</p>
            <h3 className="text-3xl font-bold text-red-600 mt-2">{criticalCount}</h3>
            <p className="text-xs text-slate-400 mt-1">Requieren acción inmediata</p>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-lg">
            <AlertTriangle size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Por Vencer (30d)</p>
            <h3 className="text-3xl font-bold text-amber-500 mt-2">{warningCount}</h3>
            <p className="text-xs text-slate-400 mt-1">Planificar renovación</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <Clock size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Equipos Vigentes</p>
            <h3 className="text-3xl font-bold text-emerald-600 mt-2">{goodCount}</h3>
            <p className="text-xs text-slate-400 mt-1">Operativos</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <CheckCircle2 size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Total Items</p>
            <h3 className="text-3xl font-bold text-blue-600 mt-2">{allItems.length}</h3>
            <p className="text-xs text-slate-400 mt-1">En monitoreo</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <BarChart3 size={24} />
          </div>
        </div>
      </div>

      {/* Timeline Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-800">Próximos Vencimientos (Consolidado)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50">
              <tr>
                <th className="px-6 py-3">Estado</th>
                <th className="px-6 py-3">Fecha</th>
                <th className="px-6 py-3">Módulo</th>
                <th className="px-6 py-3">Item / Equipo</th>
                <th className="px-6 py-3">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allItems.slice(0, 10).map((item) => (
                <tr key={`${item.module}-${item.id}`} className="hover:bg-slate-50">
                  <td className="px-6 py-3">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="px-6 py-3 font-medium text-slate-700">
                    {item.date}
                  </td>
                  <td className="px-6 py-3 text-slate-500">{item.module}</td>
                  <td className="px-6 py-3 text-slate-700">{item.name}</td>
                  <td className="px-6 py-3">
                    <button className="text-blue-600 hover:underline">Ver detalle</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};