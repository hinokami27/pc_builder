import React from 'react';
import { Link } from 'react-router-dom';

const CATEGORIES = [
  { id: 'cpu', label: 'PROCESSORS', path: '/products/cpu' },
  { id: 'cooler', label: 'COOLERS', path: '/products/cooler' },
  { id: 'motherboard', label: 'MOTHERBOARDS', path: '/products/motherboard' },
  { id: 'gpu', label: 'GRAPHICS CARDS', path: '/products/gpu' },
  { id: 'ram', label: 'MEMORY', path: '/products/ram' },
  { id: 'psu', label: 'POWER SUPPLIES', path: '/products/psu' },
  { id: 'disk', label: 'STORAGE', path: '/products/disk' },
  { id: 'case', label: 'CASES', path: '/products/case' },
];
export default function ProductsPage() {
  return (
    <div className="py-12 space-y-12">
      <div className="border-l-4 border-text-accent pl-6">
        <h1 className="font-chakra text-4xl font-black text-text-primary tracking-tighter uppercase">
          Hardware_Database
        </h1>
        <p className="text-text-secondary text-sm mt-2 font-mono">
          // ACCESSING GLOBAL COMPONENT REPOSITORY... [STATUS: OK]
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {CATEGORIES.map((cat) => (
          <Link 
            key={cat.id} 
            to={cat.path}
            className="group bg-bg-panel border border-border-muted p-8 transition-all hover:border-border-focus hover:-translate-y-1 flex flex-col items-center text-center"
          >
            <div className="mb-6 group-hover:scale-110 transition-transform h-16 w-16">
              <img 
                src={`/src/assets/${cat.id}.png`} 
                alt={cat.label} 
                className="w-full h-full object-contain" 
              />
            </div>
            <div className="text-text-primary font-black text-xl tracking-widest uppercase">{cat.label}</div>
            <div className="mt-auto pt-4 text-xs text-text-secondary font-mono group-hover:text-text-accent transition-colors">ACCESS_DIR_&gt;</div>
          </Link>
        ))}
      </div>
    </div>
  );
}