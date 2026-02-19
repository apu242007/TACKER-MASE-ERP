# Informe de Auditoría Técnica: Tacker SRL – Gestión MASE

**Fecha:** 24 de Mayo, 2024
**Versión del Reporte:** 1.0
**Estado del Proyecto:** Prototipo Funcional / Demo (Client-Side Only)

---

## 1. Resumen Ejecutivo

### Propósito
Aplicación web tipo ERP/CRUD diseñada para el sector **MASE de Tacker SRL**. Su objetivo principal es la gestión de inventarios, flotas (Pickups, Worklifts) y equipos de seguridad (HSE), con un fuerte enfoque en el monitoreo de **fechas de vencimiento** (VTV, Inspecciones, Calibraciones) y la generación de reportes consolidados.

### Flujo General
1.  **Dashboard:** Vista de alto nivel con KPIs de equipos vencidos, críticos y vigentes.
2.  **Navegación Modular:** Barra lateral que segrega los activos por categoría (Base, Integrales, Flotas, HSE).
3.  **Gestión de Datos:** Tablas interactivas para visualizar, filtrar y exportar datos.
4.  **Listado Maestro:** Módulo especial que calcula automáticamente totales basándose en los registros de los otros módulos.

### Usuarios Objetivo
- Administradores de pañol.
- Responsables de seguridad e higiene (HSE).
- Gerentes de operaciones (para visualización de estado de flota).

---

## 2. Arquitectura y Stack

### Patrón Arquitectónico
**Single Page Application (SPA)** renderizada en el lado del cliente (CSR).
Actualmente opera en una arquitectura **Serverless/Offline-First** simulada, donde la "base de datos" reside en memoria del navegador (`mockData.ts`), preparada para migrar a una solución Backend-as-a-Service (Firebase).

### Stack Tecnológico
*   **Frontend Library:** React 18.2.0.
*   **Lenguaje:** TypeScript (Tipado estricto mediante interfaces).
*   **Estilos:** Tailwind CSS (vía CDN) para utilidades y diseño responsivo.
*   **Build System:** No-Build setup (uso de ES Modules nativos en navegador vía `importmap`).

---

## 3. Dependencias y Herramientas

El proyecto utiliza un `importmap` en `index.html` para la gestión de paquetes, evitando un paso de compilación complejo (Webpack/Vite) en este entorno de desarrollo.

### Dependencias Críticas (Runtime)
| Librería | Versión | Uso |
| :--- | :--- | :--- |
| **react** | 18.2.0 | Core UI Framework. |
| **react-dom** | 18.2.0 | Renderizado del DOM. |
| **lucide-react** | 0.344.0 | Iconografía (SVG components). |
| **xlsx** | 0.18.5 | Exportación de datos a Excel. |
| **jspdf** | 2.5.1 | Generación de reportes PDF. |
| **jspdf-autotable**| 3.5.31 | Tablas dentro de PDFs. |

### Hallazgos de Auditoría (Corregidos)
*   **Conflicto de Versiones:** Se detectó previamente la coexistencia de React 18 y referencias a React 19 (`^19.2.3`) en el `importmap`, causando el error *"Objects are not valid as a React child"*. **Estado:** Corregido (Unificado a 18.2.0).

---

## 4. Estructura de Archivos

```
/
├── index.html            # Entry point. Contiene importmap y CDN de Tailwind.
├── index.tsx             # Montaje de React en el DOM (#root).
├── App.tsx               # Router manual y Layout wrapper.
├── types.ts              # Definiciones de tipos (Interfaces TS) centralizadas.
├── metadata.json         # Metadatos del proyecto y permisos.
├── components/
│   ├── Layout.tsx        # Estructura principal (Sidebar + Header + Main).
│   ├── Dashboard.tsx     # Vista de resumen con KPIs y timeline.
│   ├── DataTable.tsx     # Componente reutilizable (Tabla + Buscador + Export).
│   └── StatusBadge.tsx   # Componente visual para estados (Vencido/Vigente).
└── services/
    └── mockData.ts       # "Simulación de Backend". Datos iniciales y lógica de negocio.
```

---

## 5. Rutas, Navegación y Endpoints

### Navegación (Frontend)
El enrutamiento es **manual** (basado en estado `activeModule` en `App.tsx`), no utiliza `react-router-dom`. Esto implica que no hay historial de navegación (botón atrás del navegador no funciona como se espera en una SPA tradicional).

**Módulos:**
*   `dashboard`, `cronograma`
*   `master_list` (Vista consolidada)
*   Inventario: `base`, `catalog`, `integrales`
*   Flotas: `worklift`, `pickups`, `trailers`
*   Auxiliares: `tanks`, `luminarias`, `handies`
*   HSE: `tpr`, `hse_detectores`, `hse_era`
*   `config`

### Endpoints (API)
Actualmente **no existen endpoints HTTP**. Toda la comunicación es síncrona contra `services/mockData.ts`.
*   *Futuro:* Se espera integración con Firebase (Firestore) según `ConfigScreen` en `App.tsx`.

---

## 6. Estado, Datos y Modelos

### Gestión de Estado
*   **Local State:** `useState` en `App.tsx` controla la navegación y la lista maestra actual.
*   **Prop Drilling:** Los datos y funciones de modificación se pasan como props a `DataTable`.

### Modelos de Datos (Types.ts)
El sistema es fuertemente tipado. Interfaces clave:
*   `BaseEntity`: `{ id, createdAt, updatedAt }`
*   `ExpirationStatus`: Union Type `'VIGENTE' | 'POR_VENCER' | 'VENCIDO' ...`
*   Entidades específicas: `Worklift`, `Pickup`, `HSEItem`, etc., extienden de `BaseEntity`.

### Flujo de Datos (Listado Maestro)
El `MasterList` es una vista derivada. La función `recalculateMasterCounts` en `mockData.ts` itera sobre los arrays de datos (Pickups, Tanks, etc.) para sumar cantidades y actualizar el inventario maestro automáticamente.

---

## 7. Base de Datos (Simulada)

No hay base de datos persistente. Los datos residen en constantes exportadas en `services/mockData.ts`.

**Estructura de "Tablas" (Arrays en memoria):**
1.  `mockBase` (Equipos básicos)
2.  `mockCatalog` (Identificación única)
3.  `mockIntegrals` (Material a granel/metros)
4.  `mockWorklifts` (Maquinaria pesada)
5.  `mockPickups` (Vehículos)
6.  `mockTrailers`
7.  `mockTanks`
8.  `mockLuminaires`
9.  `mockHandies`
10. `mockTPR` (Checklists)
11. `mockHSE` (Detectores y ERA)

---

## 8. Servicios Externos e Integraciones

1.  **Tailwind CSS (CDN):** Estilizado visual.
2.  **ESM.sh:** Proveedor de módulos para React y librerías de terceros.
3.  **Exportación:**
    *   `XLSX`: Generación de hojas de cálculo en cliente.
    *   `jsPDF`: Generación de documentos imprimibles.

---

## 9. Build, Scripts y Despliegue

*   **Entorno:** Browser-native (sin Node.js build process visible en los archivos provistos).
*   **Transpilación:** TypeScript es interpretado/transpilado al vuelo por el entorno de ejecución provisto (WebContainer o similar).
*   **Despliegue:** Al ser estático, puede alojarse en cualquier servidor web, pero requiere conexión a internet para cargar los módulos de `esm.sh`.

---

## 10. Calidad, Testing y Seguridad

### Calidad
*   **Tipado:** Alto. El uso de TypeScript previene errores de acceso a propiedades nulas.
*   **Modularidad:** Buena separación entre UI (`components/`) y Datos (`services/`).

### Seguridad (Riesgos)
*   **Auth:** Inexistente. El usuario está hardcodeado como "Usuario Demo".
*   **Persistencia:** Al recargar la página, los cambios se pierden (reseteo a `mockData`).
*   **Inyección de Config:** La pantalla de configuración permite pegar un JSON crudo de Firebase, lo cual es propenso a errores de usuario (aunque no es un riesgo de seguridad *per se* si es solo local).

---

## 11. Internacionalización y Accesibilidad

*   **Idioma:** Español (Hardcodeado en UI y formatos de fecha).
*   **Accesibilidad:**
    *   Contraste de colores adecuado (Tailwind slate-900/50).
    *   Faltan atributos `aria-label` en botones de íconos.
    *   Navegación por teclado funcional en inputs básicos.

---

## 12. Tareas Pendientes y Recomendaciones

1.  **Persistencia Real:** Implementar el adaptador de Firebase (Firestore) para reemplazar `mockData.ts`.
2.  **Enrutamiento Real:** Reemplazar el switch-case de `App.tsx` por `react-router-dom` para permitir deep-linking y manejo del historial del navegador.
3.  **Virtualización:** Si las listas de inventario crecen (>100 items), el componente `DataTable` necesitará virtualización (ej. `react-window`) para no degradar el rendimiento.
4.  **Autenticación:** Implementar Login real antes de permitir acceso al Dashboard.
5.  **Validación de Formularios:** Actualmente las acciones "Nuevo/Editar" son `alerts`. Se requieren formularios modales con validación (ej. `react-hook-form` + `zod`).

