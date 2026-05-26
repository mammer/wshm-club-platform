export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 animate-pulse">
      <div className="h-10 bg-gray-100 rounded-lg w-40 mb-8" />
      <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        {[...Array(12)].map((_, i) => (
          <div key={i} className={`bg-gray-100 rounded-xl w-full ${i % 3 === 0 ? "h-64" : i % 3 === 1 ? "h-48" : "h-56"}`} />
        ))}
      </div>
    </div>
  );
}
