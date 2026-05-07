export default function BlogLoading() {
  return (
    <main aria-busy="true" aria-label="Cargando artículos del blog">
      {/* Hero skeleton */}
      <section className="py-16 px-6 text-center" style={{ backgroundColor: "#1a0510" }}>
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-4 w-40 rounded bg-gray-200/20" />
          <div className="h-10 w-48 rounded bg-gray-200/20" />
          <div className="h-4 w-80 max-w-full rounded bg-gray-200/20" />
        </div>
      </section>

      {/* Card grid skeleton */}
      <section className="py-16 px-6" style={{ backgroundColor: "#F8F0E3" }}>
        <div className="max-w-5xl mx-auto">
          <div className="h-6 w-48 rounded bg-gray-200 animate-pulse mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                <div className="w-full h-48 bg-gray-200" />
                <div className="p-6 space-y-3">
                  <div className="h-5 w-3/4 rounded bg-gray-200" />
                  <div className="h-4 w-full rounded bg-gray-200" />
                  <div className="h-4 w-2/3 rounded bg-gray-200" />
                  <div className="flex justify-between pt-2">
                    <div className="h-3 w-24 rounded bg-gray-200" />
                    <div className="h-3 w-4 rounded bg-gray-200" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
