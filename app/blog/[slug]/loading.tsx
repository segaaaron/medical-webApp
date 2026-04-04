export default function BlogPostLoading() {
  return (
    <main aria-busy="true" aria-label="Cargando artículo">
      {/* Hero skeleton */}
      <div className="relative w-full h-64 md:h-96 animate-pulse" style={{ backgroundColor: "#1a0510" }}>
        <div className="absolute inset-0 flex items-end">
          <div className="w-full max-w-3xl mx-auto px-6 pb-8 space-y-4">
            <div className="h-4 w-28 rounded bg-gray-200/20" />
            <div className="h-8 w-3/4 rounded bg-gray-200/20" />
            <div className="h-8 w-1/2 rounded bg-gray-200/20" />
          </div>
        </div>
      </div>

      {/* Article skeleton */}
      <article className="py-12 px-6 bg-white">
        <div className="max-w-3xl mx-auto animate-pulse space-y-4">
          <div className="flex gap-4 pb-8 mb-8 border-b border-gray-100">
            <div className="h-4 w-40 rounded bg-gray-200" />
            <div className="h-4 w-32 rounded bg-gray-200" />
            <div className="h-4 w-24 rounded bg-gray-200" />
          </div>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-4 rounded bg-gray-200" style={{ width: `${70 + Math.random() * 30}%` }} />
          ))}
          <div className="h-6 w-1/3 rounded bg-gray-200 mt-8" />
          {[...Array(5)].map((_, i) => (
            <div key={`b${i}`} className="h-4 rounded bg-gray-200" style={{ width: `${60 + Math.random() * 40}%` }} />
          ))}
        </div>
      </article>
    </main>
  )
}
