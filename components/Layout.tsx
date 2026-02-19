import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Package, 
  ScanBarcode, 
  Grid3X3, 
  Truck, 
  Car, 
  Container, 
  Droplets, 
  Lightbulb, 
  Radio, 
  ClipboardCheck, 
  ShieldAlert, 
  Menu,
  X,
  LogOut,
  ListChecks,
  Settings,
  AlertCircle
} from 'lucide-react';
import { ModuleType } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeModule: ModuleType;
  onNavigate: (module: ModuleType) => void;
  isDemoMode?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeModule, onNavigate, isDemoMode = false }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'cronograma', label: 'Cronograma Vtos.', icon: CalendarDays },
    { id: 'master_list', label: 'Listado Maestro', icon: ListChecks },
    { type: 'separator', label: 'Inventario' },
    { id: 'base', label: 'Base y Equipos', icon: Package },
    { id: 'catalog', label: 'Catálogo ID', icon: ScanBarcode },
    { id: 'integrales', label: 'Integrales', icon: Grid3X3 },
    { type: 'separator', label: 'Flotas' },
    { id: 'worklift', label: 'Worklift / Plat.', icon: Truck },
    { id: 'pickups', label: 'Pickups', icon: Car },
    { id: 'trailers', label: 'Trailers', icon: Container },
    { type: 'separator', label: 'Equipos Aux' },
    { id: 'tanks', label: 'Tanques', icon: Droplets },
    { id: 'luminarias', label: 'Luminarias', icon: Lightbulb },
    { id: 'handies', label: 'Handies', icon: Radio },
    { type: 'separator', label: 'HSE & Calidad' },
    { id: 'tpr', label: 'TPR Checklist', icon: ClipboardCheck },
    { id: 'hse_detectores', label: 'HSE Detectores', icon: ShieldAlert },
    { id: 'hse_era', label: 'HSE ERA', icon: ShieldAlert },
    { type: 'separator', label: 'Sistema' },
    { id: 'config', label: 'Configuración', icon: Settings },
  ];

  const handleNav = (id: string) => {
    onNavigate(id as ModuleType);
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-slate-100 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between px-6 bg-slate-950">
          <span className="text-xl font-bold tracking-tight text-white">TACKER MASE</span>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar">
          <ul className="space-y-1 px-3">
            {navItems.map((item, idx) => {
              if (item.type === 'separator') {
                return (
                  <li key={idx} className="mt-5 mb-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {item.label}
                  </li>
                );
              }
              const Icon = item.icon as any;
              const isActive = activeModule === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleNav(item.id!)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon size={18} />
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-slate-800 p-4">
          <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-slate-400 hover:text-white transition-colors">
            <LogOut size={18} />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Demo Banner */}
        {isDemoMode && (
          <div className="bg-amber-100 border-b border-amber-200 px-6 py-2 flex items-center justify-center text-amber-800 text-xs font-medium gap-2">
            <AlertCircle size={14} />
            Modo Demo: Firebase no configurado. Los datos son locales y temporales.
          </div>
        )}

        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-slate-600 hover:text-slate-900"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-lg font-semibold text-slate-800 capitalize">
              {activeModule.replace('_', ' ')}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-medium text-slate-900">Usuario Demo</span>
              <span className="text-xs text-slate-500">Mase - Admin</span>
            </div>
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200">
              UD
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-50 p-6 custom-scrollbar">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};