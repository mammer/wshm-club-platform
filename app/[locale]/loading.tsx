export default function Loading() {
  return (
    <div className="min-h-screen animate-pulse">
      {/* Hero skeleton */}
      <div className="bg-gray-100 h-96 w-full" />
      {/* Content skeleton */}
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-8">
        <div className="h-8 bg-gray-100 rounded-lg w-64 mx-auto" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-100 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
