import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { DataTable } from './components/DataTable';
import { Cronograma } from './components/Cronograma'; // New Import
import { StatusBadge } from './components/StatusBadge';
import { RefreshCw, Save } from 'lucide-react';
import { 
  mockWorklifts, mockPickups, mockHSE, mockBase, mockCatalog, 
  mockIntegrals, mockTrailers, mockTanks, mockLuminaires, 
  mockHandies, mockTPR, mockMasterList, recalculateMasterCounts, calculateStatus 
} from './services/mockData';
import { 
  ModuleType, MasterItem, BaseEquipment, CatalogItem, IntegralItem, 
  Worklift, Pickup, Trailer, Tank, Luminaire, Handy, TPRItem, HSEItem, FieldDefinition 
} from './types';

// Configuration Component
const ConfigScreen: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Configuración de Firebase</h3>
        <p className="text-sm text-slate-600 mb-4">
          Para persistir los datos, ingrese la configuración de su proyecto Firebase aquí.
          Si se deja vacío, la aplicación funcionará en <strong>Modo Demo</strong> (solo memoria).
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Firebase Config JSON</label>
            <textarea 
              className="w-full h-32 px-3 py-2 text-sm border border-slate-300 rounded-md font-mono"
              placeholder='{ "apiKey": "...", "authDomain": "..." }'
            ></textarea>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm">
            <Save size={18} />
            Guardar Configuración
          </button>
        </div>
      </div>
    </div>
  );
};

// --- FIELD DEFINITIONS FOR FORMS ---

const workliftFields: FieldDefinition[] = [
  { key: 'nroInterno', label: 'N° Interno', type: 'text' },
  { key: 'tipo', label: 'Tipo', type: 'select', options: ['Plataforma telescópica', 'Manipuladores telescópicos', 'Autoelevador'] },
  { key: 'marca', label: 'Marca', type: 'text' },
  { key: 'modelo', label: 'Modelo', type: 'text' },
  { key: 'ubicado', label: 'Ubicación', type: 'select', options: ['Mase-01', 'Mase-02', 'PIN', 'Yacimiento'] },
  { key: 'vtoInspeccion', label: 'Vencimiento Inspección', type: 'date' },
  { key: 'estadoActual', label: 'Estado Operativo', type: 'select', options: ['Operativo', 'En servicio', 'Fuera de servicio', 'En mantenimiento'] },
  { key: 'habilitado', label: 'Habilitado', type: 'boolean' },
  { key: 'ypf', label: 'Habilitado YPF', type: 'boolean' },
  { key: 'observaciones', label: 'Observaciones', type: 'textarea' },
];

const pickupFields: FieldDefinition[] = [
  { key: 'dominio', label: 'Dominio', type: 'text' },
  { key: 'nroInterno', label: 'N° Interno', type: 'text' },
  { key: 'marca', label: 'Marca', type: 'text' },
  { key: 'modelo', label: 'Modelo', type: 'text' },
  { key: 'kmActual', label: 'Kilometraje', type: 'number' },
  { key: 'vtvVto', label: 'Vencimiento VTV', type: 'date' },
  { key: 'ubicacionActual', label: 'Ubicación Actual', type: 'text' },
  { key: 'estadoActual', label: 'Estado', type: 'select', options: ['Activa', 'Taller', 'Baja'] },
  { key: 'habilitado', label: 'Habilitado', type: 'boolean' },
  { key: 'observacion', label: 'Observaciones', type: 'textarea' },
];

const hseFields: FieldDefinition[] = [
  { key: 'nroInstrumento', label: 'N° Instrumento', type: 'text' },
  { key: 'marca', label: 'Marca', type: 'text' },
  { key: 'ubicacion', label: 'Ubicación', type: 'text' },
  { key: 'fechaUltimaCalibracion', label: 'Últ. Calibración', type: 'date' },
  { key: 'frecuenciaDias', label: 'Frecuencia (días)', type: 'number' },
  { key: 'responsable', label: 'Responsable', type: 'text' },
  { key: 'observaciones', label: 'Observaciones', type: 'textarea' },
];

const tankFields: FieldDefinition[] = [
  { key: 'nro', label: 'Número', type: 'number' },
  { key: 'equipo', label: 'Nombre Equipo', type: 'text' },
  { key: 'tipoTanque', label: 'Tipo', type: 'select', options: ['Tanques de agua', 'Tanques de gas oíl', 'Tanques varios'] },
  { key: 'idTanque', label: 'ID Tanque', type: 'text' },
];

// Main App Component
const App: React.FC = () => {
  const [activeModule, setActiveModule] = useState<ModuleType>('dashboard');
  const [masterList, setMasterList] = useState(mockMasterList);
  const isDemoMode = true; 
  
  // Forces re-render when mock data changes
  const [refresh, setRefresh] = useState(0); 

  const handleRecalculateMaster = () => {
    const updated = recalculateMasterCounts(); 
    setMasterList(updated);
    alert('Listado Maestro recalculado con éxito basado en los módulos.');
  };

  // --- GENERIC UPDATE HANDLERS ---
  // In a real app, these would allow typed generics or be separate hook functions
  
  const handleUpdate = async (sourceArray: any[], id: string, updates: any, dateField?: string) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const index = sourceArray.findIndex(i => i.id === id);
        if (index !== -1) {
          sourceArray[index] = { ...sourceArray[index], ...updates, updatedAt: new Date().toISOString() };
          
          // Re-calculate status if a date field was updated
          if (dateField && updates[dateField]) {
            sourceArray[index].computedStatus = calculateStatus(updates[dateField]);
          }
        }
        setRefresh(prev => prev + 1);
        resolve();
      }, 500); // Simulate network delay
    });
  };

  const handleBulkUpdate = async (sourceArray: any[], ids: string[], updates: any, dateField?: string) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        ids.forEach(id => {
          const index = sourceArray.findIndex(i => i.id === id);
          if (index !== -1) {
            sourceArray[index] = { ...sourceArray[index], ...updates, updatedAt: new Date().toISOString() };
            if (dateField && updates[dateField]) {
              sourceArray[index].computedStatus = calculateStatus(updates[dateField]);
            }
          }
        });
        setRefresh(prev => prev + 1);
        resolve();
      }, 800);
    });
  };

  const renderContent = () => {
    switch (activeModule) {
      case 'dashboard':
        return <Dashboard />;
      
      case 'cronograma':
        return <Cronograma />; // Using new component
      
      case 'config' as any: 
        return <ConfigScreen />;

      case 'master_list':
        return (
          <div className="space-y-4">
             <div className="flex justify-end">
                <button 
                  onClick={handleRecalculateMaster}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  <RefreshCw size={18} />
                  Recalcular Totales
                </button>
             </div>
             <DataTable<MasterItem>
              title="Listado Maestro (Consolidado)"
              data={masterList}
              searchKeys={['name', 'calcSource']}
              onAdd={() => alert('Solo lectura (calculado)')}
              onDelete={(item) => alert('No se puede borrar items maestros')}
              columns={[
                { key: 'name', header: 'Elemento' },
                { key: 'qty', header: 'Cantidad Total', render: (val) => <span className="font-bold">{val}</span> },
                { key: 'calcSource', header: 'Fuente de Datos' },
                { key: 'lastCalculatedAt', header: 'Última Act.' },
              ]}
            />
          </div>
        );
      
      case 'base':
        return (
          <DataTable<BaseEquipment>
            title="Base y Equipos"
            data={mockBase}
            searchKeys={['elemento']}
            onAdd={() => alert('Nuevo Equipo')}
            onUpdate={(id, up) => handleUpdate(mockBase, id, up)}
            onDelete={() => {}}
            fields={[
                { key: 'elemento', label: 'Elemento', type: 'text' },
                { key: 'cantidad', label: 'Cantidad', type: 'number' }
            ]}
            columns={[
              { key: 'elemento', header: 'Elemento' },
              { key: 'cantidad', header: 'Cantidad' },
            ]}
          />
        );

      case 'catalog':
        return (
          <DataTable<CatalogItem>
            title="Catálogo ID"
            data={mockCatalog}
            searchKeys={['elemento', 'nroSerie', 'ubicacion']}
            onAdd={() => alert('Nuevo Item Catálogo')}
            onUpdate={(id, up) => handleUpdate(mockCatalog, id, up)}
            onDelete={() => {}}
            fields={[
                { key: 'itemNro', label: 'Item N°', type: 'number' },
                { key: 'elemento', label: 'Elemento', type: 'text' },
                { key: 'nroSerie', label: 'N° Serie', type: 'text' },
                { key: 'ubicacion', label: 'Ubicación', type: 'text' },
                { key: 'estado', label: 'Estado', type: 'select', options: ['ACTIVO', 'BAJA', 'REPARACION'] }
            ]}
            columns={[
              { key: 'itemNro', header: 'Item N°' },
              { key: 'elemento', header: 'Elemento' },
              { key: 'nroSerie', header: 'N° Serie' },
              { key: 'caracteristicas', header: 'Características' },
              { key: 'ubicacion', header: 'Ubicación' },
              { key: 'estado', header: 'Estado', render: (val) => <span className={`font-bold ${val === 'ACTIVO' ? 'text-green-600' : 'text-red-600'}`}>{val}</span> },
            ]}
          />
        );

      case 'integrales':
        return (
          <DataTable<IntegralItem>
            title="Elementos Integrales (Inventario)"
            data={mockIntegrals}
            searchKeys={['item', 'ubicacion', 'variante']}
            onAdd={() => alert('Nuevo Integral')}
            onUpdate={(id, up) => handleUpdate(mockIntegrals, id, up)}
            onBulkUpdate={(ids, up) => handleBulkUpdate(mockIntegrals, ids, up)}
            onDelete={() => {}}
            fields={[
                { key: 'item', label: 'Item', type: 'text' },
                { key: 'variante', label: 'Variante', type: 'text' },
                { key: 'ubicacion', label: 'Ubicación', type: 'text' },
                { key: 'cantidad', label: 'Cantidad', type: 'number' },
                { key: 'unidad', label: 'Unidad', type: 'select', options: ['metros', 'unidades'] }
            ]}
            columns={[
              { key: 'ubicacion', header: 'Ubicación' },
              { key: 'item', header: 'Item' },
              { key: 'variante', header: 'Variante' },
              { key: 'cantidad', header: 'Cantidad', render: (val, item) => `${val} ${item.unidad}` },
            ]}
          />
        );

      case 'worklift':
        return (
          <DataTable<Worklift>
            title="Worklift / Plataformas"
            data={mockWorklifts}
            searchKeys={['nroInterno', 'modelo', 'nroSerie']}
            onAdd={() => alert('Abrir Modal Alta Worklift')}
            onUpdate={(id, up) => handleUpdate(mockWorklifts, id, up, 'vtoInspeccion')}
            onBulkUpdate={(ids, up) => handleBulkUpdate(mockWorklifts, ids, up, 'vtoInspeccion')}
            onDelete={(item) => alert(`Eliminar Worklift: ${item.id}`)}
            fields={workliftFields}
            columns={[
              { key: 'nroInterno', header: 'Interno' },
              { key: 'tipo', header: 'Tipo' },
              { key: 'modelo', header: 'Modelo' },
              { key: 'ubicado', header: 'Ubicación' },
              { key: 'vtoInspeccion', header: 'Vto. Inspección' },
              { 
                key: 'computedStatus', 
                header: 'Estado Vto.', 
                render: (_, item) => <StatusBadge status={item.computedStatus} /> 
              },
              { key: 'estadoActual', header: 'Estado Op.' },
            ]}
          />
        );

      case 'pickups':
        return (
          <DataTable<Pickup>
            title="Flota Pickups"
            data={mockPickups}
            searchKeys={['dominio', 'nroInterno', 'marca']}
            onAdd={() => alert('Abrir Modal Alta Pickup')}
            onUpdate={(id, up) => handleUpdate(mockPickups, id, up, 'vtvVto')}
            onBulkUpdate={(ids, up) => handleBulkUpdate(mockPickups, ids, up, 'vtvVto')}
            onDelete={(item) => alert(`Eliminar Pickup: ${item.id}`)}
            fields={pickupFields}
            columns={[
              { key: 'dominio', header: 'Dominio', render: (val) => <span className="font-mono font-bold">{val}</span> },
              { key: 'nroInterno', header: 'Interno' },
              { key: 'marca', header: 'Marca' },
              { key: 'ubicacionActual', header: 'Ubicación' },
              { key: 'vtvVto', header: 'VTV Vto.' },
              { 
                key: 'computedStatus', 
                header: 'Estado VTV', 
                render: (_, item) => <StatusBadge status={item.computedStatus} /> 
              },
              { key: 'kmActual', header: 'KM Actual', render: (val) => val.toLocaleString() },
            ]}
          />
        );

      case 'trailers':
        return (
          <DataTable<Trailer>
            title="Trailers"
            data={mockTrailers}
            searchKeys={['equipo', 'id2026']}
            onAdd={() => alert('Nuevo Trailer')}
            onUpdate={(id, up) => handleUpdate(mockTrailers, id, up)}
            onDelete={() => {}}
            fields={[
                { key: 'equipo', label: 'Equipo', type: 'text' },
                { key: 'tipoTrailer', label: 'Tipo', type: 'text' },
                { key: 'id2026', label: 'ID 2026', type: 'text' }
            ]}
            columns={[
              { key: 'equipo', header: 'Equipo' },
              { key: 'tipoTrailer', header: 'Tipo' },
              { key: 'id2026', header: 'ID 2026' },
              { key: 'caracteristicas', header: 'Características' },
            ]}
          />
        );

      case 'tanks':
        return (
          <DataTable<Tank>
            title="Tanques (Agua / GasOil)"
            data={mockTanks}
            searchKeys={['equipo', 'idTanque']}
            onAdd={() => alert('Nuevo Tanque')}
            onUpdate={(id, up) => handleUpdate(mockTanks, id, up)}
            onBulkUpdate={(ids, up) => handleBulkUpdate(mockTanks, ids, up)}
            onDelete={() => {}}
            fields={tankFields}
            columns={[
              { key: 'nro', header: 'N°' },
              { key: 'equipo', header: 'Equipo' },
              { key: 'tipoTanque', header: 'Tipo' },
              { key: 'idTanque', header: 'ID Tanque' },
            ]}
          />
        );

      case 'luminarias':
        return (
          <DataTable<Luminaire>
            title="Luminarias"
            data={mockLuminaires}
            searchKeys={['luminariaNro', 'ubicacion']}
            onAdd={() => alert('Nueva Luminaria')}
            onUpdate={(id, up) => handleUpdate(mockLuminaires, id, up)}
            onDelete={() => {}}
            fields={[
                { key: 'luminariaNro', label: 'N° Luminaria', type: 'text' },
                { key: 'ubicacion', label: 'Ubicación', type: 'text' }
            ]}
            columns={[
              { key: 'luminariaNro', header: 'Luminaria N°' },
              { key: 'ubicacion', header: 'Ubicación' },
            ]}
          />
        );

      case 'handies':
        return (
          <DataTable<Handy>
            title="Handies"
            data={mockHandies}
            searchKeys={['idTag', 'nroSerie', 'marca']}
            onAdd={() => alert('Nuevo Handy')}
            onUpdate={(id, up) => handleUpdate(mockHandies, id, up)}
            onDelete={() => {}}
            fields={[
                { key: 'idTag', label: 'ID Tag', type: 'text' },
                { key: 'marca', label: 'Marca', type: 'text' },
                { key: 'modelo', label: 'Modelo', type: 'text' },
                { key: 'ubicacion', label: 'Ubicación', type: 'text' }
            ]}
            columns={[
              { key: 'idTag', header: 'ID Tag' },
              { key: 'marca', header: 'Marca' },
              { key: 'modelo', header: 'Modelo' },
              { key: 'nroSerie', header: 'SN Equipo' },
              { key: 'ubicacion', header: 'Ubicación' },
              { key: 'bateria', header: 'Bat?' },
            ]}
          />
        );

      case 'tpr':
        return (
          <DataTable<TPRItem>
            title="TPR Checklist"
            data={mockTPR}
            searchKeys={['idTrp', 'ubicacion']}
            onAdd={() => alert('Nuevo TPR')}
            onUpdate={(id, up) => handleUpdate(mockTPR, id, up)}
            onDelete={() => {}}
            fields={[
                { key: 'idTrp', label: 'ID TPR', type: 'text' },
                { key: 'ubicacion', label: 'Ubicación', type: 'text' },
                { key: 'apta', label: 'Apta?', type: 'boolean' }
            ]}
            columns={[
              { key: 'idTrp', header: 'ID TPR' },
              { key: 'ubicacion', header: 'Ubicación' },
              { key: 'fechaInspeccion', header: 'Fecha Insp.' },
              { key: 'apta', header: 'Apta?', render: (val) => val ? 'SI' : 'NO' },
              { key: 'maxCwpPsi', header: 'Max PSI' },
            ]}
          />
        );

      case 'hse_detectores':
        return (
          <DataTable<HSEItem>
            title="HSE - Detectores"
            data={mockHSE.filter(i => i.type === 'DETECTOR')}
            searchKeys={['nroInstrumento', 'marca']}
            onAdd={() => alert('Abrir Modal Alta Detector')}
            onUpdate={(id, up) => handleUpdate(mockHSE, id, up, 'fechaVencimientoCalibracion')}
            onBulkUpdate={(ids, up) => handleBulkUpdate(mockHSE, ids, up, 'fechaVencimientoCalibracion')}
            onDelete={(item) => alert(`Eliminar: ${item.id}`)}
            fields={hseFields}
            columns={[
              { key: 'nroInstrumento', header: 'N° Instrumento' },
              { key: 'marca', header: 'Marca' },
              { key: 'fechaUltimaCalibracion', header: 'Última Cal.' },
              { key: 'fechaVencimientoCalibracion', header: 'Vencimiento' },
              { 
                key: 'estado', 
                header: 'Estado', 
                render: (_, item) => <StatusBadge status={item.estado} /> 
              },
              { key: 'responsable', header: 'Responsable' },
            ]}
          />
        );

      case 'hse_era':
        return (
          <DataTable<HSEItem>
            title="HSE - ERA"
            data={mockHSE.filter(i => i.type === 'ERA')}
            searchKeys={['nroInstrumento', 'marca']}
            onAdd={() => alert('Abrir Modal Alta ERA')}
            onUpdate={(id, up) => handleUpdate(mockHSE, id, up, 'fechaVencimientoCalibracion')}
            onBulkUpdate={(ids, up) => handleBulkUpdate(mockHSE, ids, up, 'fechaVencimientoCalibracion')}
            onDelete={(item) => alert(`Eliminar: ${item.id}`)}
            fields={hseFields}
            columns={[
              { key: 'nroInstrumento', header: 'N° Instrumento' },
              { key: 'marca', header: 'Marca' },
              { key: 'nroSerieCilindro', header: 'SN Cilindro' },
              { key: 'fechaVencimientoCalibracion', header: 'Vto. Calib.' },
              { 
                key: 'estado', 
                header: 'Est. Calib', 
                render: (_, item) => <StatusBadge status={item.estado} /> 
              },
              { key: 'vtoPhCilindro', header: 'Vto. PH' },
              { 
                key: 'estadoPhCilindro', 
                header: 'Est. PH', 
                render: (_, item) => <StatusBadge status={item.estadoPhCilindro} /> 
              },
            ]}
          />
        );

      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout activeModule={activeModule} onNavigate={setActiveModule} isDemoMode={isDemoMode}>
      {renderContent()}
    </Layout>
  );
};

export default App;