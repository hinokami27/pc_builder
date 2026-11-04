import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

function FeatureCard({ index, tag, title, description, to, ctaText }) {
  return (
    <Link
      to={to}
      className="group bg-bg-panel p-6 rounded-none border border-border-muted text-left w-full max-w-sm flex flex-col justify-between hover:border-text-primary/70 hover:bg-bg-panel-hover transition-all duration-150 hover:-translate-y-1 shadow-sm hover:shadow-[0_4px_20px_rgba(143,37,245,0.15)]"
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-mono text-text-accent tracking-widest">{index}</span>
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-bg-main border border-border-muted text-text-secondary group-hover:border-text-primary/50 group-hover:text-text-primary transition-colors">
            {tag}
          </span>
        </div>
        <h3 className="text-xl font-bold mb-2 text-text-primary tracking-wide group-hover:text-text-accent transition-colors">
          {title}
        </h3>
        <p className="text-sm text-text-secondary leading-relaxed">
          {description}
        </p>
      </div>

      <div className="mt-6 pt-4 border-t border-border-muted flex items-center justify-between text-xs font-mono text-text-secondary group-hover:text-text-primary transition-colors">
        <span>{ctaText || '// ACCESS PAGE'}</span>
        <span className="transition-transform duration-150 group-hover:translate-x-1 text-text-primary">→</span>
      </div>
    </Link>
  );
}

export default function LandingPage() {
  // Hook to handle programming-based navigation shifts
  const navigate = useNavigate();

  // Delay navigation slightly so the button's active transition is visible
  const handleStartBuild = () => {
    setTimeout(() => {
      navigate('/configurator');
    }, 80);
  };

  return (
    <div className="font-chakra py-24 text-center">
      
      <h1 className="text-4xl tracking-tight mb-4 text-text-accent uppercase">
        System Architecture Configurator. <br />
        <span className="text-text-primary text-3xl tracking-wide">Compatibility Verified.</span>
      </h1>
      
      <p className="text-sm text-text-secondary max-w-lg mx-auto mb-10 leading-relaxed font-chakra">
        // Execute component matrix layout. Check energy demands, system board constraints, and live retail price metrics.
      </p>

      {/* Tactile 3D Action Button now uses navigate() to jump pages */}
      <button 
        onClick={handleStartBuild}
        className="bg-text-primary font-bold text-bg-main px-6 py-3 text-base
          shadow-[0_6px_0_0_rgb(73,12,133)] hover:shadow-[0_6px_0_0_rgb(73,12,133),inset_0_0_20px_rgba(255,255,255,0.3)] cursor-pointer transition-all duration-75 
          active:translate-y-1 active:shadow-none tracking-wide uppercase"
      >
        Initialize Custom Build
      </button>

      {/* Showcase Grid for Core Pages */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 justify-items-center">
        <FeatureCard 
          to="/configurator"
          index="// 01" 
          tag="Manual Builder"
          title="Configurator" 
          description="Hand-pick every component with live socket validation, physical clearance detection, real-time wattage calculation, and price tracking." 
          ctaText="// OPEN CONFIGURATOR"
        />
        <FeatureCard 
          to="/rig-generator"
          index="// 02" 
          tag="Automated AI"
          title="Rig Generator" 
          description="Synthesize balanced, game-ready builds tailored automatically to your targeted titles, preferred resolution, and budget limits." 
          ctaText="// LAUNCH GENERATOR"
        />
        <FeatureCard 
          to="/inventory"
          index="// 03" 
          tag="Saved Builds"
          title="Inventory" 
          description="Store, compare, and manage your custom systems and generated builds. Reload any saved manifest directly back into the configurator." 
          ctaText="// ACCESS INVENTORY"
        />
      </div>

    </div>
  );
}