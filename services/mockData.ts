import { 
  Worklift, Pickup, HSEItem, ExpirationStatus, MasterItem, 
  IntegralItem, CatalogItem, Trailer, Tank, Luminaire, Handy, TPRItem, BaseEquipment
} from '../types';

// Helper to calculate status
export const calculateStatus = (dateString: string): ExpirationStatus => {
  if (!dateString) return 'N/A';
  const today = new Date();
  const target = new Date(dateString);
  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'VENCIDO';
  if (diffDays <= 7) return 'CRITICO';
  if (diffDays <= 30) return 'POR_VENCER';
  return 'VIGENTE';
};

// --- DATA STORES ---

export const mockBase: BaseEquipment[] = [
  { id: 'be-1', elemento: 'Silla Ergonomica', cantidad: 5, createdAt: '', updatedAt: '' }
];

export const mockCatalog: CatalogItem[] = [
  { id: 'cat-1', itemNro: 101, elemento: 'Generador Honda', nroSerie: 'GH-99', caracteristicas: '5kva', ubicacion: 'Mase-01', estado: 'ACTIVO', observaciones: '', createdAt: '', updatedAt: '' },
  { id: 'cat-2', itemNro: 102, elemento: 'Bomba centrifuga eléctrica', nroSerie: 'BCE-22', caracteristicas: '2HP', ubicacion: 'Taller', estado: 'REPARACION', observaciones: '', createdAt: '', updatedAt: '' }
];

export const mockIntegrals: IntegralItem[] = [
  { id: 'int-1', ubicacion: 'Mase-01', item: 'Líneas integrales 2"1502', variante: '3 metros', unidad: 'unidades', cantidad: 10, observaciones: '', createdAt: '', updatedAt: '' },
  { id: 'int-2', ubicacion: 'PIN', item: 'Codos 2"', variante: 'sentido flujo', unidad: 'unidades', cantidad: 4, observaciones: '', createdAt: '', updatedAt: '' }
];

export const mockWorklifts: Worklift[] = [
  {
    id: 'wl-001', nro: 1, tipo: 'Plataforma telescópica', marca: 'Genie', modelo: 'GS-1930', nroSerie: 'GEN-2022-X', nroInterno: 'INT-99', ubicado: 'Mase-01',
    fechaInspeccion: '2023-10-01', vtoInspeccion: '2023-12-01', habilitado: true, ypf: true, estadoActual: 'Operativo', observaciones: '',
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 'wl-002', nro: 2, tipo: 'Manipuladores telescópicos', marca: 'JLG', modelo: '450AJ', nroSerie: 'JLG-998-B', nroInterno: 'INT-102', ubicado: 'PIN',
    fechaInspeccion: '2024-01-15', vtoInspeccion: '2024-06-15', habilitado: true, ypf: true, estadoActual: 'En servicio', observaciones: '',
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  }
];

export const mockPickups: Pickup[] = [
  {
    id: 'pk-001', nro: 10, dominio: 'AA123BB', modeloAnio: '2022', estado: 'Bueno', nroInterno: 'INT-200', traccion: '4x4', seguimientoSatelital: true,
    marca: 'Toyota', modelo: 'Hilux', ubicacionActual: 'Base Operativa', destinado: 'Supervisión', habilitado: true, ypf: true,
    vtvVto: '2024-05-20', provisoriaVto: '', observacion: 'Parabrisas con detalle', serviceFecha: '2024-01-01', serviceKm: 10000, kmActual: 15400, estadoActual: 'Activa',
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 'pk-002', nro: 14, dominio: 'AD456CC', modeloAnio: '2023', estado: 'Excelente', nroInterno: 'INT-205', traccion: '4x4', seguimientoSatelital: true,
    marca: 'Ford', modelo: 'Ranger', ubicacionActual: 'Yacimiento', destinado: 'Operaciones', habilitado: true, ypf: false,
    vtvVto: '2023-11-01', provisoriaVto: '', observacion: '', serviceFecha: '2023-12-01', serviceKm: 5000, kmActual: 8900, estadoActual: 'Activa',
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  }
];

export const mockTrailers: Trailer[] = [
  { id: 'tr-1', equipo: 'Trailer 01', tipoTrailer: 'Oficina', id2026: 'TR-OFF-01', caracteristicas: 'Con AA', observacion: '', createdAt: '', updatedAt: '' }
];

export const mockTanks: Tank[] = [
  { id: 'tk-1', nro: 1, equipo: 'Tanque Agua 1', tipoTanque: 'Tanques de agua', idTanque: 'TKA-01', createdAt: '', updatedAt: '' }
];

export const mockLuminaires: Luminaire[] = [
  { id: 'lm-1', luminariaNro: 'LUM-001', ubicacion: 'Mase-01', createdAt: '', updatedAt: '' }
];

export const mockHandies: Handy[] = [
  { id: 'hd-1', idTag: 'HANDIE N° 1', marca: 'Motorola', modelo: 'DGP8550', nroSerie: '12345', bateria: 'Yes', bateriaModelo: 'PMNN4409', bateriaNroSerie: 'B123', baseCargador: 'Yes', cargadorModelo: 'WPLN4232', cargadorNroSerie: 'C123', fuenteAlimentacion: 'Yes', fuenteModelo: 'PS001', fechaIngreso: '2023-01-01', ubicacion: 'Base', fecha: '2024-01-01', observaciones: '', createdAt: '', updatedAt: '' }
];

export const mockTPR: TPRItem[] = [
  { id: 'tpr-1', item: 1, ubicacion: 'Mase-02', idTrp: 'TPR-001', largoMetros: 10, maxCwpPsi: 15000, fechaInspeccion: '2023-11-20', marca: 'FMC', tieneEtiqueta: true, quemadurasAcidasCarbonizadas: false, agujerosCortesRoturas: false, desgasteAbrasivoExcesivo: false, costurasRotas: false, otroDanoVisible: false, apta: true, observaciones: '', createdAt: '', updatedAt: '' }
];

export const mockHSE: HSEItem[] = [
  {
    id: 'hse-001', type: 'DETECTOR', ubicacion: 'Pañol', nroInstrumento: 'DET-004', marca: 'MSA', tipo: 'Altair 4X',
    fechaUltimaCalibracion: '2023-10-01', frecuenciaDias: 180, nroCertificado: 'CERT-999', criterioAceptacion: 'Fabricante',
    aptoPost: true, responsable: 'Juan Perez', observaciones: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 'hse-002', type: 'ERA', ubicacion: 'Base', nroInstrumento: 'ERA-01', marca: 'Drager', nroSerieCilindro: 'CIL-99', vtoPhCilindro: '2025-01-01',
    fechaUltimaCalibracion: '2023-09-01', frecuenciaDias: 365, nroCertificado: 'CERT-ERA-01', criterioAceptacion: 'Norma',
    aptoPost: true, responsable: 'Seguridad', observaciones: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  }
];

// --- MASTER LIST SEED ---

const masterListSeedNames = [
  "Pick up", "Manipuladores telescópicos", "Autoelevador", "Plataforma telescópica", "Tráiler", "Luminarias", 
  "Generadores", "Tanques de agua", "Tanques de gas oíl", "HCR", "Plug cátcher", "Desander", 
  "Manifold 3 1/16” 10 KPSI", "Manifold 3 1/16” 15 KPSI", "Manifold 2\" 15 KPSI", "Cabina de control", 
  "Sensores de presión", "Sensores de nivel", "Piletas con zaranda y golpeador", "Piletas con golpeador", 
  "Bombas de PH 15 Kpsi", "Bomba de PH 10 Kpsi", "Manómetros digitales", "Torqueadoras", "Graseras chicas", 
  "Graseras Lincol", "Unidad de filtrado", "Taller", "Hidrolavadora", "Bomba centrifuga eléctrica", 
  "Bomba centrifuga a explosión", "Pileta con tornillo", "Pileta con removedores + generador", "Piletas de 70 m3", 
  "Líneas integrales 3\"1502", "Líneas integrales 2\"1502", "Codos 3\"", "Codos 2\"", "TEE 3\"", "TEE 2\"", 
  "Red 3M a 2H", "Red 3H a 2M", "VTB 2x2", "VTB 3x3", "VTB 2x1", "Equipos autónomos", "Detectores fijos de H2S", 
  "Detectores fijos de mezcla explosiva", "Portatiles multigas", "Portatiles monogas", "Handy"
];

// Seed
export const initialMasterList: MasterItem[] = masterListSeedNames.map((name, idx) => ({
  id: `master-${idx}`,
  name: name,
  qty: 0,
  calcSource: 'Manual',
  lastCalculatedAt: '-',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}));

// RECALCULATE LOGIC
// Returns a NEW array
export const recalculateMasterCounts = (currentList: MasterItem[] = initialMasterList): MasterItem[] => {
  const now = new Date().toLocaleString();
  
  return currentList.map(item => {
    let count = 0;
    let source = 'Manual / Sin Regla';

    // Rules
    if (item.name === 'Pick up') {
      count = mockPickups.length;
      source = 'Módulo Pickups';
    } else if (item.name === 'Tráiler' || item.name === 'Cabina de control' || item.name === 'Taller') {
      if (item.name === 'Tráiler') {
        count = mockTrailers.length;
        source = 'Módulo Trailers';
      }
    } else if (item.name === 'Luminarias') {
      count = mockLuminaires.length;
      source = 'Módulo Luminarias';
    } else if (item.name === 'Handy') {
      count = mockHandies.length;
      source = 'Módulo Handies';
    } else if (item.name.includes('Tanques de')) {
      count = mockTanks.filter(t => t.tipoTanque.includes(item.name)).length;
      source = 'Módulo Tanques';
    } else if (['Manipuladores telescópicos', 'Autoelevador', 'Plataforma telescópica'].includes(item.name)) {
      count = mockWorklifts.filter(w => w.tipo.includes(item.name)).length;
      source = 'Módulo Worklift';
    } else if (item.name.includes('Líneas integrales') || item.name.includes('Codos') || item.name.includes('TEE') || item.name.includes('Red') || item.name.includes('VTB')) {
       const keyword = item.name.split(' ')[0]; // E.g., Codos, TEE
       const matches = mockIntegrals.filter(i => i.item.includes(keyword) || (item.name.includes('Líneas') && i.item.includes('Líneas')));
       count = matches.reduce((acc, curr) => acc + curr.cantidad, 0);
       source = 'Inventario Integrales (Suma)';
    } else {
      // Fallback: Count in Catalog
      const inCatalog = mockCatalog.filter(c => c.elemento.includes(item.name)).length;
      if (inCatalog > 0) {
        count = inCatalog;
        source = 'Catálogo ID';
      }
    }

    return {
      ...item,
      qty: count,
      calcSource: source,
      lastCalculatedAt: now
    };
  });
};

// Initial calculations for other modules (safe idempotent functions)
export const initMockData = () => {
    mockWorklifts.forEach(w => w.computedStatus = calculateStatus(w.vtoInspeccion));
    mockPickups.forEach(p => p.computedStatus = calculateStatus(p.vtvVto));
    mockTPR.forEach(t => t.computedStatus = calculateStatus(t.fechaInspeccion));
    mockHSE.forEach(h => {
        const lastCal = new Date(h.fechaUltimaCalibracion);
        const nextCal = new Date(lastCal);
        nextCal.setDate(lastCal.getDate() + h.frecuenciaDias);
        h.fechaVencimientoCalibracion = nextCal.toISOString().split('T')[0];
        h.estado = calculateStatus(h.fechaVencimientoCalibracion);
        
        if (h.type === 'ERA' && h.vtoPhCilindro) {
            h.estadoPhCilindro = calculateStatus(h.vtoPhCilindro);
        }
    });
}

// Run initialization immediately for mock data consistency
initMockData();

// Export a pre-calculated master list for initial state
export const mockMasterList = recalculateMasterCounts(initialMasterList);
