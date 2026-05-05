"use client"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { saveRole } from "@/lib/hooks/use-role"
import { useFormik } from "formik"
import * as Yup from "yup"
import { Loader2, Lock, Eye, EyeOff } from "lucide-react"
import { Suspense } from "react"

const loginSchema = Yup.object({
  email: Yup.string().email("Correo no válido").required("El correo es obligatorio"),
  password: Yup.string().required("La contraseña es obligatoria"),
})

type LoginValues = Yup.InferType<typeof loginSchema>

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const from = params.get("from") ?? "/dashboard"

  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const formik = useFormik<LoginValues>({
    initialValues: { email: "", password: "" },
    validationSchema: loginSchema,
    onSubmit: async (values) => {
      setError("")
      try {
        const res = await fetch("/api/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data.error ?? "Usuario o contraseña incorrectos.")
          return
        }
        saveRole(data.user?.role)
        router.push(from)
        router.refresh()
      } catch {
        setError("Error de conexión. Inténtalo de nuevo.")
      }
    },
  })

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "#1F1346" }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: "#2f1c6a" }}
          >
            <Lock size={22} style={{ color: "#8c85ff" }} />
          </div>
          <h1 className="text-white font-bold text-2xl">Dashboard</h1>
          <p className="text-sm mt-1" style={{ color: "#8c85ff" }}>Dra. Yasmin Medrano Avila</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="font-bold text-gray-800 text-lg mb-6">Iniciar sesión</h2>

          <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700" htmlFor="email">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...formik.getFieldProps("email")}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                placeholder="correo@ejemplo.com"
              />
              {formik.touched.email && formik.errors.email && <p className="text-xs text-red-500 mt-1">{formik.errors.email}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700" htmlFor="password">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  {...formik.getFieldProps("password")}
                  className="w-full px-4 py-3 pr-11 rounded-lg border border-gray-200 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {formik.touched.password && formik.errors.password && <p className="text-xs text-red-500 mt-1">{formik.errors.password}</p>}
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">{error}</p>
            )}

            <button
              type="submit"
              disabled={!formik.isValid || formik.isSubmitting}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-lg font-bold text-sm text-white transition-colors disabled:opacity-60 mt-2"
              style={{ backgroundColor: "#673de6" }}
            >
              {formik.isSubmitting && <Loader2 size={16} className="animate-spin" />}
              {formik.isSubmitting ? "Entrando..." : "Entrar al dashboard"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
