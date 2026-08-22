"use client";

export function SkeletonLoader({ count = 12 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={`skeleton-${i}`} className="card skeleton-card">
          <div className="card-image skeleton-image"></div>
          <div className="card-body">
            <div className="skeleton-text skeleton-title"></div>
            <div className="skeleton-text skeleton-desc"></div>
            <div className="card-footer">
              <div className="skeleton-text skeleton-price"></div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
