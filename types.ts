// Status types for logic
export type ExpirationStatus = 'VIGENTE' | 'POR_VENCER' | 'VENCIDO' | 'CRITICO' | 'N/A';

// Field Definition for dynamic forms
export interface FieldDefinition {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'boolean' | 'textarea';
  options?: string[]; // For select inputs
  readonly?: boolean;
}

// Base Interfaces
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: any; // Allow index access for dynamic updates
}

// 7. Listado Maestro
export interface MasterItem extends BaseEntity {
  name: string; // Elemento
  qty: number; // Cantidad Total
  calcSource: string; // Origen del cálculo
  lastCalculatedAt: string;
}

// 1. Base y Equipos
export interface BaseEquipment extends BaseEntity {
  elemento: string;
  cantidad: number;
}

// 2. ID Elemento (Catálogo)
export interface CatalogItem extends BaseEntity {
  itemNro: number;
  elemento: string;
  nroSerie: string;
  caracteristicas: string;
  ubicacion: string;
  estado: 'ACTIVO' | 'BAJA' | 'REPARACION';
  observaciones: string;
}

// 3. Integrales (Inventario Normalizado)
export interface IntegralItem extends BaseEntity {
  ubicacion: string; // Mase-01, Mase-02, PIN, etc.
  item: string; // Línea integral, Codo, TEE
  variante: string; // 3" 1502, 0.3m, etc.
  unidad: 'metros' | 'unidades';
  cantidad: number;
  observaciones: string;
}

// 4. Worklift / Man. y Plat.
export interface Worklift extends BaseEntity {
  nro: number;
  tipo: string;
  marca: string;
  modelo: string;
  nroSerie: string;
  nroInterno: string;
  ubicado: string;
  fechaInspeccion: string;
  vtoInspeccion: string; // Date ISO string
  habilitado: boolean;
  ypf: boolean;
  estadoActual: string;
  observaciones: string;
  // Computed
  computedStatus?: ExpirationStatus;
}

// 5. Pickups
export interface Pickup extends BaseEntity {
  nro: number;
  dominio: string;
  modeloAnio: string;
  estado: string;
  nroInterno: string;
  traccion: string;
  seguimientoSatelital: boolean;
  marca: string;
  modelo: string;
  ubicacionActual: string;
  destinado: string;
  habilitado: boolean;
  ypf: boolean;
  vtvVto: string; // Date ISO string
  provisoriaVto: string; // Date ISO string
  observacion: string;
  serviceFecha: string;
  serviceKm: number;
  kmActual: number;
  estadoActual: string;
  // Computed
  computedStatus?: ExpirationStatus;
}

// 6. Trailers
export interface Trailer extends BaseEntity {
  equipo: string;
  tipoTrailer: string;
  id2026: string;
  caracteristicas: string;
  observacion: string;
}

// 7. Tanques
export interface Tank extends BaseEntity {
  nro: number;
  equipo: string;
  tipoTanque: string;
  idTanque: string; // Changed from id to avoid conflict with BaseEntity
}

// 8. Luminarias
export interface Luminaire extends BaseEntity {
  luminariaNro: string;
  ubicacion: string;
}

// 9. Handies
export interface Handy extends BaseEntity {
  idTag: string;
  marca: string;
  modelo: string;
  nroSerie: string;
  bateria: string;
  bateriaModelo: string;
  bateriaNroSerie: string;
  baseCargador: string;
  cargadorModelo: string;
  cargadorNroSerie: string;
  fuenteAlimentacion: string;
  fuenteModelo: string;
  fechaIngreso: string;
  ubicacion: string;
  fecha: string;
  observaciones: string;
}

// 10. TPR (Checklist)
export interface TPRItem extends BaseEntity {
  item: number;
  ubicacion: string;
  idTrp: string;
  largoMetros: number;
  maxCwpPsi: number;
  fechaInspeccion: string;
  marca: string;
  tieneEtiqueta: boolean;
  quemadurasAcidasCarbonizadas: boolean;
  agujerosCortesRoturas: boolean;
  desgasteAbrasivoExcesivo: boolean;
  costurasRotas: boolean;
  otroDanoVisible: boolean;
  apta: boolean;
  observaciones: string;
  // Optional/Computed
  frecuenciaDias?: number;
  vtoInspeccion?: string;
  computedStatus?: ExpirationStatus;
}

// 11/12 HSE (Generic for both Detectores & ERA)
export interface HSEItem extends BaseEntity {
  type: 'DETECTOR' | 'ERA';
  ubicacion: string;
  nroInstrumento: string;
  marca: string;
  // Specifics
  modelo?: string; 
  tipo?: string; // Detector only
  nroSerieCilindro?: string; // ERA only
  vtoPhCilindro?: string; // ERA only
  
  fechaUltimaCalibracion: string;
  frecuenciaDias: number;
  nroCertificado: string;
  criterioAceptacion: string;
  aptoPost: boolean;
  responsable: string;
  observaciones: string;
  
  // Computed
  fechaVencimientoCalibracion?: string;
  diasRestantes?: number;
  estado?: ExpirationStatus;
  estadoPhCilindro?: ExpirationStatus; // ERA only
}

// Navigation
export type ModuleType = 
  | 'dashboard' 
  | 'cronograma' 
  | 'master_list'
  | 'base' 
  | 'catalog' 
  | 'integrales' 
  | 'worklift' 
  | 'pickups' 
  | 'trailers' 
  | 'tanks' 
  | 'luminarias' 
  | 'handies' 
  | 'tpr' 
  | 'hse_detectores' 
  | 'hse_era';