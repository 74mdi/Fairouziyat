"use client";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

interface Crumb { label: string; href?: string; }

export function PageHeader({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <div className="page-header-bar">
      <nav className="breadcrumb">
        {crumbs.map((c, i) => (
          <span key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {i > 0 && <span className="breadcrumb-sep">/</span>}
            {c.href ? <Link href={c.href}>{c.label}</Link> : <span>{c.label}</span>}
          </span>
        ))}
      </nav>
      <ThemeToggle />
    </div>
  );
}
