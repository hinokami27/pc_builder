import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getSavedBuilds } from '../utils/inventoryStorage';

export default function Navbar() {
  const location = useLocation();
  const [savedCount, setSavedCount] = useState(0);

  useEffect(() => {
    const updateCount = () => {
      setSavedCount(getSavedBuilds().length);
    };
    updateCount();

    window.addEventListener('pc_inventory_updated', updateCount);
    window.addEventListener('storage', updateCount);
    return () => {
      window.removeEventListener('pc_inventory_updated', updateCount);
      window.removeEventListener('storage', updateCount);
    };
  }, []);

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="flex justify-between items-center py-4 px-8 bg-bg-panel border-b border-border-muted">
      
      {/* Clicking the main logo links back to Home root "/" */}
      <Link to="/" className=" font-chakra text-text-primary text-xl font-black tracking-widest uppercase cursor-pointer">
        // Matrix_Config
      </Link>

      {/* Nav Links */}
      <nav className="flex items-center space-x-8 text-base font-chakra">
        <Link 
          to="/products"
          className={`cursor-pointer transition-colors ${isActive('/products') ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}
        >
          // &nbsp;Components
        </Link>

        <Link 
          to="/configurator"
          className={`cursor-pointer transition-colors ${isActive('/configurator') ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}
        >
          // &nbsp;Configurator
        </Link>

        <Link 
          to="/rig-generator"
          className={`cursor-pointer transition-colors ${isActive('/rig-generator') ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}
        >
          // &nbsp;Rig Generator
        </Link>

        <Link 
          to="/inventory"
          className={`cursor-pointer transition-colors flex items-center gap-1.5 ${isActive('/inventory') ? 'text-text-primary font-bold' : 'text-text-secondary hover:text-text-primary'}`}
        >
          <span>// &nbsp;Inventory</span>
          {savedCount > 0 && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-sm bg-text-primary/20 text-text-primary border border-text-primary/40 leading-none">
              {savedCount}
            </span>
          )}
        </Link>
        
        <Link 
          to="/build-guides"
          className={`cursor-pointer transition-colors ${isActive('/build-guides') ? 'text-text-primary font-bold' : 'text-text-secondary hover:text-text-primary'}`}
        >
          // &nbsp;Build Guides
        </Link>
      </nav>
      
    </header>
  );
}