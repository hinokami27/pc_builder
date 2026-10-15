const INVENTORY_STORAGE_KEY = 'pc_builder_saved_inventory';
const ACTIVE_CONFIG_KEY = 'pcBuilderConfig';

/**
 * Retrieve all saved builds from localStorage
 * @returns {Array} List of saved build objects
 */
export function getSavedBuilds() {
  try {
    const raw = localStorage.getItem(INVENTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to read inventory from localStorage:', err);
    return [];
  }
}

/**
 * Save a new build to inventory
 * @param {Object} buildData
 * @returns {Object} Newly saved build
 */
export function saveBuild({
  name,
  config,
  partsSnapshot,
  totalPrice = 0,
  estimatedWattage = null,
  source = 'Configurator',
  games = [],
  fpsEstimates = [],
  reason = ''
}) {
  const currentBuilds = getSavedBuilds();
  
  const newBuild = {
    id: `build_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: name?.trim() || `Matrix Rig #${currentBuilds.length + 1}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    source, // 'Configurator' | 'AI Rig Generator'
    config: config || {},
    partsSnapshot: partsSnapshot || {},
    totalPrice: Number(totalPrice) || 0,
    estimatedWattage: estimatedWattage || null,
    games: Array.isArray(games) ? games : [],
    fpsEstimates: Array.isArray(fpsEstimates) ? fpsEstimates : [],
    reason: reason || ''
  };

  const updatedBuilds = [newBuild, ...currentBuilds];
  try {
    localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(updatedBuilds));
    // Dispatch custom event so listeners (like Navbar badge) can update reactively
    window.dispatchEvent(new Event('pc_inventory_updated'));
  } catch (err) {
    console.error('Failed to save build to localStorage:', err);
  }

  return newBuild;
}

/**
 * Update an existing build in inventory
 * @param {string} id
 * @param {Object} updates
 * @returns {Array} Updated builds list
 */
export function updateBuild(id, updates) {
  const currentBuilds = getSavedBuilds();
  const updatedBuilds = currentBuilds.map((b) => {
    if (b.id === id) {
      return {
        ...b,
        ...updates,
        updatedAt: new Date().toISOString()
      };
    }
    return b;
  });

  try {
    localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(updatedBuilds));
    window.dispatchEvent(new Event('pc_inventory_updated'));
  } catch (err) {
    console.error('Failed to update build in localStorage:', err);
  }

  return updatedBuilds;
}

/**
 * Delete a build from inventory by ID
 * @param {string} id
 * @returns {Array} Updated builds list
 */
export function deleteBuild(id) {
  const currentBuilds = getSavedBuilds();
  const updatedBuilds = currentBuilds.filter((b) => b.id !== id);

  try {
    localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(updatedBuilds));
    window.dispatchEvent(new Event('pc_inventory_updated'));
  } catch (err) {
    console.error('Failed to delete build from localStorage:', err);
  }

  return updatedBuilds;
}

/**
 * Load a saved build's URL config into the active Configurator localStorage
 * @param {Object} config
 */
export function loadBuildToConfigurator(config) {
  try {
    localStorage.setItem(ACTIVE_CONFIG_KEY, JSON.stringify(config || {}));
    return true;
  } catch (err) {
    console.error('Failed to load build to configurator:', err);
    return false;
  }
}
