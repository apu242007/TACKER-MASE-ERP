import React, { useState, useMemo, useEffect } from 'react';
import { Search, Download, Plus, Filter, FileSpreadsheet, FileText, CheckSquare, Square, X, Edit, Trash2, Save, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FieldDefinition } from '../types';

export interface ColumnDef<T> {
  key: keyof T | 'actions';
  header: string;
  render?: (value: any, item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  title: string;
  data: T[];
  columns: ColumnDef<T>[];
  fields?: FieldDefinition[];
  onAdd: () => void;
  onUpdate?: (id: string, updates: Partial<T>) => Promise<void> | void;
  onBulkUpdate?: (ids: string[], updates: Partial<T>) => Promise<void> | void;
  onDelete: (item: T) => void;
  searchKeys: (keyof T)[];
}

export function DataTable<T extends { id: string }>({ 
  title, 
  data, 
  columns, 
  fields = [], // Form configuration
  onAdd, 
  onUpdate,
  onBulkUpdate,
  onDelete,
  searchKeys 
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [formData, setFormData] = useState<Partial<T>>({});
  
  // Feedback States
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Clear toast after 3s
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // --- Filtering ---
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    return data.filter(item => 
      searchKeys.some(key => {
        const val = item[key];
        return String(val).toLowerCase().includes(searchTerm.toLowerCase());
      })
    );
  }, [data, searchTerm, searchKeys]);

  // --- Selection Logic ---
  const handleSelectAll = () => {
    if (selectedIds.size === filteredData.length && filteredData.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredData.map(d => d.id)));
    }
  };

  const handleSelectRow = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  // --- Individual Edit Logic ---
  const handleEditClick = (item: T) => {
    setEditingItem(item);
    // Initialize form with item data
    const initialData: any = {};
    fields.forEach(f => {
      initialData[f.key] = item[f.key as keyof T];
    });
    setFormData(initialData);
    setIsEditModalOpen(true);
  };

  const handleSaveIndividual = async () => {
    if (!editingItem || !onUpdate) return;
    setLoading(true);
    try {
      await onUpdate(editingItem.id, formData);
      setToast({ type: 'success', message: 'Registro actualizado correctamente' });
      setIsEditModalOpen(false);
      setEditingItem(null);
    } catch (e) {
      setToast({ type: 'error', message: 'Error al actualizar registro' });
    } finally {
      setLoading(false);
    }
  };

  // --- Bulk Edit Logic ---
  const handleBulkEditClick = () => {
    setFormData({}); // Start empty for bulk
    setIsBulkModalOpen(true);
  };

  const handleSaveBulk = async () => {
    if (!onBulkUpdate) return;
    
    // Filter out undefined/empty keys from formData so we don't overwrite with empty
    const updates: any = {};
    Object.keys(formData).forEach(key => {
      const val = formData[key as keyof T];
      if (val !== undefined && val !== '' && val !== null) {
        updates[key] = val;
      }
    });

    if (Object.keys(updates).length === 0) {
      setToast({ type: 'error', message: 'No se han detectado cambios para aplicar' });
      return;
    }

    if (!window.confirm(`¿Estás seguro de actualizar ${selectedIds.size} registros? Esta acción no se puede deshacer.`)) {
      return;
    }

    setLoading(true);
    try {
      await onBulkUpdate(Array.from(selectedIds), updates);
      setToast({ type: 'success', message: `${selectedIds.size} registros actualizados` });
      setIsBulkModalOpen(false);
      setSelectedIds(new Set()); // Clear selection
    } catch (e) {
      setToast({ type: 'error', message: 'Error en edición masiva' });
    } finally {
      setLoading(false);
    }
  };

  // --- Form Input Helper ---
  const renderInput = (field: FieldDefinition, value: any, onChange: (val: any) => void) => {
    const commonClasses = "w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";
    
    if (field.readonly) {
       return <input type="text" value={value || ''} disabled className={`${commonClasses} bg-slate-100 text-slate-500 cursor-not-allowed`} />;
    }

    switch (field.type) {
      case 'boolean':
        return (
          <div className="flex items-center gap-2 mt-2">
            <button 
              type="button"
              onClick={() => onChange(!value)}
              className={`w-12 h-6 rounded-full transition-colors relative ${value ? 'bg-blue-600' : 'bg-slate-300'}`}
            >
              <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${value ? 'translate-x-6' : ''}`} />
            </button>
            <span className="text-sm text-slate-600">{value ? 'Sí / Activo' : 'No / Inactivo'}</span>
          </div>
        );
      case 'select':
        return (
          <select 
            value={value || ''} 
            onChange={(e) => onChange(e.target.value)}
            className={commonClasses}
          >
            <option value="">-- Seleccionar --</option>
            {field.options?.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        );
      case 'date':
        return (
          <input 
            type="date" 
            value={value ? String(value).split('T')[0] : ''} 
            onChange={(e) => onChange(e.target.value)}
            className={commonClasses}
          />
        );
      case 'number':
        return (
          <input 
            type="number" 
            value={value || ''} 
            onChange={(e) => onChange(Number(e.target.value))}
            className={commonClasses}
          />
        );
      case 'textarea':
        return (
          <textarea
             value={value || ''}
             onChange={(e) => onChange(e.target.value)}
             className={commonClasses}
             rows={3}
          />
        );
      default:
        return (
          <input 
            type="text" 
            value={value || ''} 
            onChange={(e) => onChange(e.target.value)}
            className={commonClasses}
          />
        );
    }
  };

  // --- Export Logic ---
  const handleExport = (type: 'excel' | 'pdf') => {
    if (type === 'excel') {
      const wb = XLSX.utils.book_new();
      const exportData = filteredData.map(item => {
        const row: any = {};
        columns.forEach(col => {
            if (col.key !== 'actions') {
                const val = item[col.key as keyof T];
                row[col.header] = typeof val === 'object' ? JSON.stringify(val) : val;
            }
        });
        return row;
      });
      const ws = XLSX.utils.json_to_sheet(exportData);
      XLSX.utils.book_append_sheet(wb, ws, title.substring(0, 30));
      XLSX.writeFile(wb, `${title.replace(/ /g, '_')}.xlsx`);
    } else {
      const doc = new jsPDF();
      doc.text(title, 14, 15);
      const tableColumn = columns.filter(c => c.key !== 'actions').map(c => c.header);
      const tableRows = filteredData.map(item => {
        return columns
          .filter(c => c.key !== 'actions')
          .map(c => {
             const val = item[c.key as keyof T];
             return val == null ? '' : String(val);
          });
      });
      autoTable(doc, { head: [tableColumn], body: tableRows, startY: 20 });
      doc.save(`${title.replace(/ /g, '_')}.pdf`);
    }
  };

  return (
    <div className="space-y-4 relative">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-fade-in-down ${
          toast.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          <span className="font-medium text-sm">{toast.message}</span>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-lg shadow-sm border border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-800">{title}</h2>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>{filteredData.length} registros</span>
            {selectedIds.size > 0 && (
              <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                {selectedIds.size} seleccionados
              </span>
            )}
          </div>
        </div>
        
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
            />
          </div>
          
          <div className="flex gap-2">
            <button onClick={() => handleExport('excel')} className="p-2 text-slate-600 hover:text-green-700 hover:bg-green-50 rounded-md border border-slate-200 transition-colors">
              <FileSpreadsheet size={18} />
            </button>
            <button onClick={() => handleExport('pdf')} className="p-2 text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-md border border-slate-200 transition-colors">
              <FileText size={18} />
            </button>
            <button onClick={onAdd} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm">
              <Plus size={18} />
              Nuevo
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Action Bar (Floating) */}
      {selectedIds.size > 0 && onBulkUpdate && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 bg-slate-900 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-6 animate-slide-up">
          <span className="font-semibold text-sm">{selectedIds.size} seleccionados</span>
          <div className="h-4 w-px bg-slate-600"></div>
          <button 
            onClick={handleBulkEditClick}
            className="flex items-center gap-2 hover:text-blue-300 text-sm font-medium transition-colors"
          >
            <Edit size={16} /> Editar Masivo
          </button>
          <button 
            onClick={() => {
              if (window.confirm('¿Borrar elementos seleccionados?')) {
                // Bulk delete not implemented in logic yet, but UI is ready
                alert('Implementar borrado masivo');
              }
            }}
            className="flex items-center gap-2 hover:text-red-300 text-sm font-medium transition-colors"
          >
            <Trash2 size={16} /> Borrar
          </button>
          <div className="h-4 w-px bg-slate-600"></div>
          <button 
            onClick={() => setSelectedIds(new Set())}
            className="text-slate-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-sm text-left text-slate-600">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 w-10">
                  <button onClick={handleSelectAll} className="flex items-center text-slate-500 hover:text-blue-600">
                    {selectedIds.size === filteredData.length && filteredData.length > 0 ? (
                      <CheckSquare size={18} className="text-blue-600" />
                    ) : (
                      <Square size={18} />
                    )}
                  </button>
                </th>
                {columns.map((col, idx) => (
                  <th key={idx} className="px-6 py-3 font-semibold whitespace-nowrap">
                    {col.header}
                  </th>
                ))}
                <th className="px-6 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredData.length > 0 ? (
                filteredData.map((item) => {
                  const isSelected = selectedIds.has(item.id);
                  return (
                    <tr key={item.id} className={`transition-colors ${isSelected ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}>
                      <td className="px-4 py-4">
                        <button onClick={() => handleSelectRow(item.id)} className="flex items-center text-slate-400 hover:text-blue-600">
                          {isSelected ? (
                            <CheckSquare size={18} className="text-blue-600" />
                          ) : (
                            <Square size={18} />
                          )}
                        </button>
                      </td>
                      {columns.map((col, idx) => (
                        <td key={idx} className="px-6 py-4 whitespace-nowrap">
                          {col.render ? col.render(item[col.key as keyof T], item) : String(item[col.key as keyof T] ?? '-')}
                        </td>
                      ))}
                      <td className="px-6 py-4 text-right whitespace-nowrap space-x-2">
                        {onUpdate && (
                          <button 
                            onClick={() => handleEditClick(item)}
                            className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors"
                            title="Editar"
                          >
                            <Edit size={16} />
                          </button>
                        )}
                        <button 
                          onClick={() => onDelete(item)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={columns.length + 2} className="px-6 py-8 text-center text-slate-500">
                    No se encontraron datos coincidentes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- EDIT / BULK MODAL --- */}
      {(isEditModalOpen || isBulkModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-800">
                {isBulkModalOpen ? `Edición Masiva (${selectedIds.size} items)` : 'Editar Registro'}
              </h3>
              <button 
                onClick={() => { setIsEditModalOpen(false); setIsBulkModalOpen(false); }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              {isBulkModalOpen && (
                <div className="mb-6 p-3 bg-amber-50 text-amber-800 text-sm rounded border border-amber-200 flex gap-2">
                  <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                  <p>Estás editando múltiples registros. Solo los campos que modifiques aquí serán actualizados en los elementos seleccionados. Deja en blanco los que no quieras cambiar.</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {fields.map(field => (
                  <div key={field.key} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      {field.label}
                    </label>
                    {renderInput(
                      field, 
                      formData[field.key as keyof T], 
                      (val) => setFormData(prev => ({ ...prev, [field.key]: val }))
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => { setIsEditModalOpen(false); setIsBulkModalOpen(false); }}
                className="px-4 py-2 text-slate-700 font-medium hover:bg-slate-200 rounded-md transition-colors"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                onClick={isBulkModalOpen ? handleSaveBulk : handleSaveIndividual}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {isBulkModalOpen ? 'Aplicar a Todos' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}