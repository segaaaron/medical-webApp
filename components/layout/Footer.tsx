import type { FooterGroup, SocialLink } from "@/types"

interface FooterProps {
  groups: FooterGroup[]
  socials: SocialLink[]
}

export function Footer({ groups, socials }: FooterProps) {
  return (
    <footer id="contact" style={{ backgroundColor: "#0d0a1a" }}>
      <div className="container-xl py-16 px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <h3 className="text-white font-bold text-xl mb-2">James Nader</h3>
            <p className="text-sm italic mb-4" style={{ color: "#8c85ff" }}>
              Photography Academy
            </p>
            <p className="text-sm leading-relaxed mb-6" style={{ color: "#727586" }}>
              Teaching photographers to master monochrome vision and build a thriving creative business.
            </p>
            <div className="flex gap-3">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-9 h-9 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: "#2f1c6a" }}
                >
                  <social.icon size={16} color="#8c85ff" />
                </a>
              ))}
            </div>
          </div>

          {/* Link groups */}
          {groups.map((group) => (
            <div key={group.title}>
              <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-5">
                {group.title}
              </h4>
              <ul className="flex flex-col gap-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target={link.external ? "_blank" : undefined}
                      rel={link.external ? "noopener noreferrer" : undefined}
                      className="text-sm transition-colors hover:text-white"
                      style={{ color: "#727586" }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t px-6 py-6" style={{ borderColor: "#1F1346" }}>
        <div className="container-xl flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs" style={{ color: "#727586" }}>
            © {new Date().getFullYear()} James Nader Photography Academy. All rights reserved.
          </p>
          <p className="text-xs" style={{ color: "#727586" }}>
            Designed with ❤️ for photographers who demand more.
          </p>
        </div>
      </div>
    </footer>
  )
}
