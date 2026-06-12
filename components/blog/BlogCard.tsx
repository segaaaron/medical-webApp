"use client"

import Link from "next/link"
import { Calendar, Clock, ArrowRight } from "lucide-react"
import { ImageWithFallback } from "@/components/ui/ImageWithFallback"
import { trackBlogClick } from "@/lib/analytics"

interface BlogCardProps {
  id: string
  title: string
  slug: string
  excerpt: string
  imageUrl: string | null
  publishedAt: string
  readTime: string
  tags?: string[]
  variant?: "featured" | "grid"
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("es-BO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

export function BlogCard({
  title,
  slug,
  excerpt,
  imageUrl,
  publishedAt,
  readTime,
  tags = [],
  variant = "grid",
}: BlogCardProps) {
  if (variant === "featured") {
    return (
      <Link
        href={`/blog/${slug}`}
        onClick={() => trackBlogClick({ slug, title })}
        className="group block rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
        style={{ backgroundColor: "#FFFDF8", border: "1px solid rgba(184,151,59,0.12)" }}
      >
        <div className="grid md:grid-cols-2">
          <div className="relative h-64 md:h-full overflow-hidden" style={{ minHeight: "256px" }}>
            <ImageWithFallback
              src={imageUrl ?? ""}
              alt={`${title} - Blog de medicina estetica`}
              variant="light"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              loading="eager"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div className="p-8 md:p-10 flex flex-col justify-center">
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-3 py-1 rounded-full font-medium"
                    style={{ backgroundColor: "rgba(184,151,59,0.1)", color: "#8A6E27" }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <h2
              className="text-2xl md:text-3xl font-bold mb-4 leading-tight group-hover:opacity-80 transition-opacity"
              style={{ color: "var(--primary-darkest)" }}
            >
              {title}
            </h2>
            <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--gray-mid)" }}>
              {excerpt}
            </p>
            <div className="flex items-center gap-4 text-xs" style={{ color: "var(--vintage-gold)" }}>
              <span className="flex items-center gap-1.5">
                <Calendar size={13} />
                {formatDate(publishedAt)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={13} />
                {readTime}
              </span>
            </div>
            <span
              className="inline-flex items-center gap-2 mt-6 text-sm font-semibold group-hover:gap-3 transition-all"
              style={{ color: "var(--vintage-gold)" }}
            >
              Leer articulo completo <ArrowRight size={16} />
            </span>
          </div>
        </div>
      </Link>
    )
  }

  // grid variant
  return (
    <Link
      href={`/blog/${slug}`}
      className="group rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
      style={{ backgroundColor: "#FFFDF8", border: "1px solid rgba(184,151,59,0.12)" }}
    >
      <div className="relative w-full h-48 overflow-hidden flex-shrink-0">
        <ImageWithFallback
          src={imageUrl ?? ""}
          alt={`${title} - Blog de medicina estetica`}
          variant="light"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>
      <div className="p-6 flex flex-col flex-1">
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ backgroundColor: "rgba(184,151,59,0.1)", color: "#8A6E27" }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        <h3
          className="font-bold text-lg mb-3 leading-tight group-hover:opacity-80 transition-opacity"
          style={{ color: "var(--primary-darkest)" }}
        >
          {title}
        </h3>
        <p
          className="text-sm leading-relaxed mb-4 line-clamp-3 flex-1"
          style={{ color: "var(--gray-mid)" }}
        >
          {excerpt}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs" style={{ color: "var(--vintage-gold)" }}>
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {formatDate(publishedAt)}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {readTime}
            </span>
          </div>
          <ArrowRight
            size={16}
            aria-hidden="true"
            className="group-hover:translate-x-1 transition-transform"
            style={{ color: "var(--vintage-gold)" }}
          />
        </div>
      </div>
    </Link>
  )
}
