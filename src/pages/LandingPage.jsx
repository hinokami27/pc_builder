import React from 'react';
import { useNavigate } from 'react-router-dom';

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-bg-panel p-6 rounded-none border border-border-muted text-left max-w-sm hover:border-border-focus transition-colors">
      <div className="text-lg mb-3 text-text-accent">{icon}</div>
      <h3 className="text-base mb-1 text-text-primary tracking-wider">{title}</h3>
      <p className="text-sm text-text-secondary leading-relaxed">{description}</p>
    </div>
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
      
      <p className="text-sm text-text-secondary max-w-lg mx-auto mb-10 leading-relaxed">
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

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 justify-items-center">
        <FeatureCard 
          icon="⚡" 
          title="Wattage Matrix" 
          description="Aggregates active continuous electrical overhead dynamically across your custom hardware manifest." 
        />
        <FeatureCard 
          icon="📊" 
          title="PSU Tier Reference" 
          description="Cross-references hardware classifications using community-curated safety database indices." 
        />
        <FeatureCard 
          icon="🛠️" 
          title="Parametric Check" 
          description="Flags structural dimensions, physical layouts, and slot socket misalignments instantly." 
        />
      </div>

    </div>
  );
}