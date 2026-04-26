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
  containerClassName?: string;
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
  containerClassName,
}: PageHeaderProps) {
  const containerClasses = containerClassName ?? "px-2 py-2 sm:px-3 sm:py-4 md:px-8 lg:px-12";
  return (
    <div className="sticky top-0 z-[30] w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800 transition-all duration-300">
      <div className={`${containerClasses} max-w-[1600px] mx-auto`}>
        <div className="flex flex-col gap-2 md:gap-6">
          
          <div className="flex flex-col gap-1 md:gap-4">
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
            <div className="flex items-start justify-between gap-2 md:gap-4">
              <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
                {Icon && (
                  <div className="w-7 h-7 md:w-12 md:h-12 bg-brand-600 dark:bg-brand-500 rounded-lg md:rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand-500/20 shrink-0">
                    <Icon size={15} />
                  </div>
                )}
                <div className="min-w-0">
                  <h1 className="text-[clamp(0.74rem,3.4vw,0.88rem)] sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-tight break-words">
                    {title}
                  </h1>
                  {description && (
                    <p className="text-[clamp(8px,2.6vw,9.5px)] md:text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5 md:mt-1 leading-tight">
                      {description}
                    </p>
                  )}
                </div>
              </div>

              {actions && (
                <div className="shrink-0 flex items-center justify-end gap-1.5 sm:gap-3">
                  {actions}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
