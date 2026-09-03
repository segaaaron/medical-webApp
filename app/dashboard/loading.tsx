import { GlobalLoadingOverlay } from "@/components/dashboard/GlobalLoadingOverlay"

/**
 * Estado de carga del panel.
 *
 * Sin este archivo, Next mantiene la página ANTERIOR en pantalla mientras
 * resuelve la siguiente. Al entrar desde el login eso se veía como si el
 * formulario se quedara pegado y «arrastrara» hacia el panel.
 *
 * Pinta el MISMO overlay que ya usa el panel durante sus operaciones —el logo
 * del consultorio sobre la línea de electrocardiograma—, así que la espera se
 * ve igual venga de donde venga. `GlobalLoadingProvider` gobierna cuándo
 * mostrarlo en las operaciones del cliente; aquí se pinta directamente, porque
 * el retraso es la propia carga de la ruta.
 *
 * Nota: no añadir `loading.tsx` en segmentos que llamen a `notFound()` —crea un
 * límite de Suspense que envía las cabeceras antes de tiempo y convierte los
 * 404 en 200—. El panel no usa `notFound()`, así que aquí es seguro.
 */
export default function DashboardLoading() {
  return <GlobalLoadingOverlay message="Cargando panel" />
}
