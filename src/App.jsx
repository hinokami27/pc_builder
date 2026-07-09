import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import ConfiguratorPage from './pages/ConfiguratorPage';
import ProductsPage from './pages/ProductsPage';
import CpuListingPage from './pages/CpuListingPage';
import GpuListingPage from './pages/GpuListingPage';
import RamListingPage from './pages/RamListingPage';
import MotherboardListingPage from './pages/MotherboardListingPage';
import PsuListingPage from './pages/PsuListingPage';
import DiskListingPage from './pages/DiskListingPage';
import CoolerListingPage from './pages/CoolerListingPage';
import CaseListingPage from './pages/CaseListingPage';
import ProductDetailsPage from './pages/ProductDetailsPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="bg-bg-main font-chakra text-text-primary min-h-screen antialiased">
        {/* The Navbar stays sticky at the top on all pages */}
        <Navbar />
        
        <main className="max-w-5xl mx-auto px-6">
          <Routes>
            {/* Define the URL paths to load your components */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/cpu" element={<CpuListingPage />} />
            <Route path="/products/gpu" element={<GpuListingPage />} />
            <Route path="/products/ram" element={<RamListingPage />} />
            <Route path="/products/motherboard" element={<MotherboardListingPage />} />
            <Route path="/products/psu" element={<PsuListingPage />} />
            <Route path="/products/disk" element={<DiskListingPage />} />
            <Route path="/products/cooler" element={<CoolerListingPage />} />
            <Route path="/products/case" element={<CaseListingPage />} /> {/* This line was already present, no change needed */}
            <Route path="/product/details" element={<ProductDetailsPage />} /> {/* This line was already present, no change needed */}
            <Route path="/configurator" element={<ConfiguratorPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}