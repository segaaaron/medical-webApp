import Image from "next/image"
import { INVITE_REASON_COPY } from "@/lib/invite-copy"

/** Pantalla completa mostrada cuando un link de invitación es inválido/muerto. */
export function InviteErrorState({ reason }: { reason?: string }) {
  const copy = INVITE_REASON_COPY[reason ?? "not_found"] ?? INVITE_REASON_COPY.not_found
  return (
    <main
      className="min-h-dvh flex flex-col items-center justify-center px-6 py-16 text-center"
      style={{ backgroundColor: "var(--prem-dark)" }}
    >
      <div className="w-full max-w-md flex flex-col items-center gap-6">
        <Image
          src="/images/logo_dra_yasmin_cursiva.png"
          alt="Dra. Yasmin Medrano"
          width={220}
          height={88}
          className="h-auto w-44 opacity-90"
          priority
        />
        <div className="w-10 h-px" style={{ backgroundColor: "var(--vintage-gold)" }} />
        <h1
          className="text-2xl md:text-3xl font-bold"
          style={{ color: "var(--prem-dark-fg)", fontFamily: "var(--font-heading)" }}
        >
          {copy.title}
        </h1>
        <p className="text-sm leading-relaxed max-w-sm" style={{ color: "var(--prem-dark-muted)" }}>
          {copy.message}
        </p>
      </div>
    </main>
  )
}
