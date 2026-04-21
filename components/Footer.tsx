export function Footer() {
  return (
    <footer className="w-full bg-gray-50 dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 py-4 flex items-center justify-center transition-colors">
      <p className="text-gray-500 dark:text-slate-400 text-sm font-medium text-center transition-colors">
        © {new Date().getFullYear()} <span className="font-semibold text-gray-900 dark:text-slate-200 transition-colors">BISU Clarin Campus</span> — All rights reserved
      </p>
    </footer>
  );
}   