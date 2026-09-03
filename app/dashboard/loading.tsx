import { LoadingState } from "@/components/dashboard/ui/LoadingState"

/**
 * Pantalla de carga del panel.
 *
 * Sin este archivo, Next mantiene la página ANTERIOR en pantalla mientras
 * resuelve la siguiente. Al entrar desde el login eso se veía como si el
 * formulario se quedara pegado y «arrastrara» hacia el panel: el layout del
 * dashboard es un componente de servidor que verifica el token antes de
 * renderizar, y durante esa espera el usuario seguía viendo el login.
 *
 * Usa el mismo `LoadingState` que las ocho pantallas del panel, para que la
 * espera se vea igual en todas partes.
 *
 * Nota: no añadir `loading.tsx` en segmentos que llamen a `notFound()` —crea un
 * límite de Suspense que envía las cabeceras antes de tiempo y convierte los
 * 404 en 200—. El panel no usa `notFound()`, así que aquí es seguro.
 */
export default function DashboardLoading() {
  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{ backgroundColor: "#1F1346" }}
    >
      <LoadingState label="Cargando panel…" />
    </div>
  )
}
