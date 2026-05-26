export default function Loading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 animate-pulse">
      <div className="h-10 bg-gray-100 rounded-lg w-48 mb-6" />
      <div className="flex gap-3 mb-8">
        {[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded-full w-24" />)}
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <div className="h-4 bg-gray-100 rounded w-32" />
            <div className="h-6 bg-gray-100 rounded w-20" />
            <div className="h-4 bg-gray-100 rounded w-32" />
          </div>
        ))}
      </div>
    </div>
  );
}
