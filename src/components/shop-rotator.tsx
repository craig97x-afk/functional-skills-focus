"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export type ShopRotatorItem = {
  id: string;
  title: string;
  description?: string | null;
  cover_url?: string | null;
  priceLabel: string;
  type?: string;
};

export default function ShopRotator({
  items,
  intervalMs = 2000,
}: {
  items: ShopRotatorItem[];
  intervalMs?: number;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % items.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [items.length, intervalMs]);

  if (!items.length) return null;

  const item = items[index] ?? items[0];

  return (
    <section className="shop-rotator apple-card p-6">
      <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
        Shop highlights
      </div>
      <div key={item.id} className="shop-rotator-slide mt-4">
        <div className="shop-rotator-grid">
          <div className="shop-rotator-media">
            {item.cover_url ? (
              <img
                src={item.cover_url}
                alt={item.title}
                className="shop-rotator-image"
              />
            ) : (
              <div className="shop-rotator-placeholder">Guide</div>
            )}
          </div>
          <div className="space-y-3">
            {item.type && (
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
                {item.type}
              </div>
            )}
            <h2 className="text-2xl font-semibold tracking-tight">
              {item.title}
            </h2>
            {item.description && (
              <p className="apple-subtle text-base">{item.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-3">
              <span className="apple-pill">{item.priceLabel}</span>
              <Link className="apple-button" href={`/guides/${item.id}`}>
                View guide
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
