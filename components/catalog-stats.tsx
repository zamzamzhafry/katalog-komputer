"use client";

type Summary = { total: number; inStock: number; outOfStock: number };

export function CatalogStats({ summary }: { summary: Summary }) {
  return (
    <div className="stats">
      <StatCard title="Total Item" value={String(summary.total)} />
      <StatCard title="Ready Stock" value={String(summary.inStock)} />
      <StatCard title="Out of Stock" value={String(summary.outOfStock)} />
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="stat-card">
      <span>{title}</span>
      <strong>{value}</strong>
    </div>
  );
}
