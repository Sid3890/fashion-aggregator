'use client';

import { ProductCategory } from '../types/catalog';

interface CategoryNavProps {
  selectedCategory: ProductCategory | 'All';
  onSelectCategory: (category: ProductCategory | 'All') => void;
  categoryCounts: Record<string, number>;
}

interface CategoryItem {
  id: ProductCategory | 'All';
  label: string;
  icon: string;
}

const CATEGORIES: CategoryItem[] = [
  { id: 'All', label: 'All Categories', icon: '✨' },
  { id: 'Kurtis', label: 'Kurtis', icon: '👘' },
  { id: 'Sarees', label: 'Sarees', icon: '🥻' },
  { id: 'Ethnic Sets', label: 'Ethnic Sets', icon: '✨' },
  { id: 'Dresses', label: 'Dresses', icon: '👗' },
  { id: 'Tops', label: 'Tops', icon: '👚' },
  { id: 'Jeans', label: 'Jeans', icon: '👖' },
  { id: 'Footwear', label: 'Footwear', icon: '🥿' },
];

export function CategoryNav({
  selectedCategory,
  onSelectCategory,
  categoryCounts,
}: CategoryNavProps) {
  return (
    <section className="w-full border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-3 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const count = categoryCounts[cat.id] ?? 0;

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-150 active:scale-95 cursor-pointer ${
                  isSelected
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/25 ring-2 ring-rose-600/30'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800'
                }`}
                aria-pressed={isSelected}
              >
                <span className="text-base leading-none">{cat.icon}</span>
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
