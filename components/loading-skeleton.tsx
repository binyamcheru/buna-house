// components/loading-skeleton.tsx
// Beautiful loading states (better UX)

export function ProductCardSkeleton() {
  return (
    <div className="skeleton-card" style={{
      background: 'var(--surface)',
      borderRadius: 'var(--radius)',
      padding: '16px',
      animation: 'pulse 2s infinite',
    }}>
      <div style={{
        width: '100%',
        height: '200px',
        background: 'var(--panel)',
        borderRadius: 'var(--radius)',
        marginBottom: '12px',
      }} />
      <div style={{
        width: '70%',
        height: '20px',
        background: 'var(--panel)',
        borderRadius: '4px',
        marginBottom: '8px',
      }} />
      <div style={{
        width: '50%',
        height: '16px',
        background: 'var(--panel)',
        borderRadius: '4px',
      }} />
    </div>
  );
}

export function OrderRowSkeleton() {
  return (
    <tr>
      {[1, 2, 3, 4, 5, 6].map(i => (
        <td key={i}>
          <div style={{
            width: i === 1 ? '100px' : '80px',
            height: '16px',
            background: 'var(--panel)',
            borderRadius: '4px',
          }} />
        </td>
      ))}
    </tr>
  );
}

export function DashboardCardSkeleton() {
  return (
    <div className="kpi-card" style={{ opacity: 0.6 }}>
      <div style={{
        width: '60%',
        height: '20px',
        background: 'var(--panel)',
        borderRadius: '4px',
        marginBottom: '12px',
      }} />
      <div style={{
        width: '40%',
        height: '32px',
        background: 'var(--panel)',
        borderRadius: '4px',
      }} />
    </div>
  );
}

// Add to globals.css:
/*
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.skeleton-card {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
*/
