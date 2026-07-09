import { createContext, useState, useEffect, useContext } from 'react';

const BuildContext = createContext();
const LOCAL_STORAGE_KEY = 'pc_builder_current_build';

export const BuildProvider = ({ children }) => {
  // Load initial state from local storage or set defaults
  const [build, setBuild] = useState(() => {
    const savedBuild = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedBuild) {
      try {
        const parsed = JSON.parse(savedBuild);
        parsed.ram = Array.isArray(parsed.ram) ? parsed.ram : (parsed.ram ? [parsed.ram] : []);
        parsed.disk = Array.isArray(parsed.disk) ? parsed.disk : (parsed.disk ? [parsed.disk] : []);
        if (parsed.cooler === undefined) parsed.cooler = null;
        if (parsed.case === undefined) parsed.case = null;
        return parsed;
      } catch {
        // Fallback below
      }
    }
    return {
      cpu: null,
      cooler: null,
      motherboard: null,
      gpu: null,
      ram: [],
      disk: [],
      case: null,
      psu: null,
    };
  });

  // Sync state to local storage automatically
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(build));
  }, [build]);

  const addPartToBuild = (slot, part) => {
    setBuild((prevBuild) => {
      if (slot === 'ram' || slot === 'disk') {
        const existing = prevBuild[slot];
        const arr = Array.isArray(existing) ? existing : (existing ? [existing] : []);
        return { ...prevBuild, [slot]: [...arr, part] };
      }
      return { ...prevBuild, [slot]: part };
    });
  };

  const removePartFromBuild = (slot, index) => {
    setBuild((prevBuild) => {
      if (slot === 'ram' || slot === 'disk') {
        const existing = prevBuild[slot];
        const arr = Array.isArray(existing) ? existing : (existing ? [existing] : []);
        if (index !== undefined && index >= 0 && index < arr.length) {
          const newArr = [...arr];
          newArr.splice(index, 1);
          return { ...prevBuild, [slot]: newArr };
        }
        return prevBuild;
      }
      return { ...prevBuild, [slot]: null };
    });
  };

  return (
    <BuildContext.Provider value={{ build, addPartToBuild, removePartFromBuild }}>
      {children}
    </BuildContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useBuild = () => useContext(BuildContext);