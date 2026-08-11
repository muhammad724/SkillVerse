export default function Loading() {
  return <div aria-label="Loading dashboard" aria-busy="true"><div className="skeleton skeleton-line short"/><div className="skeleton skeleton-title"/><div className="grid-3" style={{ marginTop: 28 }}>{[1, 2, 3].map(item => <div className="card skeleton-card" key={item}/>)}</div><div className="grid-2" style={{ marginTop: 20 }}>{[1, 2].map(item => <div className="card skeleton-panel" key={item}/>)}</div></div>;
}
