import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  // useLocation lets us look at the current path to see which tab is active
  const location = useLocation();

  return (
    <header className="flex justify-between items-center py-4 px-8 bg-bg-panel border-b border-border-muted">
      
      {/* Clicking the main logo links back to Home root "/" */}
      <Link to="/" className=" font-chakra text-text-primary text-xl font-black tracking-widest uppercase cursor-pointer">
        // Matrix_Config
      </Link>

      {/* Nav Links */}
      <nav className="flex space-x-8 text-base font-chakra">
        <Link 
          to="/products" // Changed to link to a specific category, e.g., 'cpu'
          className={`cursor-pointer transition-colors text-text-secondary hover:text-text-primary`}
        >
          // &nbsp;Components
        </Link>

        <Link 
          to="/configurator"
          className={`cursor-pointer transition-colors text-text-secondary hover:text-text-primary`}
        >
          // &nbsp;Configurator
        </Link>
        
        <Link 
          to="/"
          className={`cursor-pointer transition-colors text-text-secondary hover:text-text-primary`}
        >
          // &nbsp;Build Guides
        </Link>
      </nav>
      
    </header>
  );
}