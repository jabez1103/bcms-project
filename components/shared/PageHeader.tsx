"use client";

import React from "react";
import { LucideIcon, ChevronRight, Home } from "lucide-react";
import Link from "next/link";

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode;
}

/**
 * PageHeader Component
 * A standardized header for all pages in the BCMS dashboard.
 * Supports sticky blur effect, breadcrumbs, and action buttons.
 */
export function PageHeader({
  title,
  description,
  icon: Icon,
  breadcrumbs,
  actions,
}: PageHeaderProps) {
  return (
    <div className="sticky top-0 z-[30] w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800 transition-all duration-300">
      <div className="px-2 py-2.5 sm:px-3 sm:py-4 md:px-8 lg:px-12 max-w-[1600px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 md:gap-6">
          
          <div className="flex flex-col gap-1.5 md:gap-4">
            {/* Breadcrumbs */}
            {breadcrumbs && breadcrumbs.length > 0 && (
              <nav className="flex items-center gap-1.5 text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                <Link href="/" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  <Home size={12} />
                </Link>
                {breadcrumbs.map((crumb, idx) => (
                  <React.Fragment key={idx}>
                    <ChevronRight size={10} className="text-slate-300 dark:text-slate-700" />
                    {crumb.href ? (
                      <Link href={crumb.href} className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className={idx === breadcrumbs.length - 1 ? "text-brand-600 dark:text-brand-400 font-black" : ""}>
                        {crumb.label}
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </nav>
            )}

            {/* Title Area */}
            <div className="flex items-center gap-2.5 md:gap-4">
              {Icon && (
                <div className="w-8 h-8 md:w-12 md:h-12 bg-brand-600 dark:bg-brand-500 rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
                  <Icon size={18} />
                </div>
              )}
              <div>
                <h1 className="text-[1.2rem] sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-tight">
                  {title}
                </h1>
                {description && (
                  <p className="text-[10.5px] md:text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5 md:mt-1 leading-tight">
                    {description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Actions Area */}
          {actions && (
            <div className="flex items-center gap-3 shrink-0">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
