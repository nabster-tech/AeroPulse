import { useState } from 'react';
import { storageKeys } from '../categories/airport';

function readCollapsed() {
  try {
    return localStorage.getItem(storageKeys.sidebar) === 'collapsed';
  } catch {
    return false;
  }
}

export function useSidebarPreference() {
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    try {
      localStorage.setItem(storageKeys.sidebar, next ? 'collapsed' : 'expanded');
    } catch {
      // Keep navigation usable for this visit when browser storage is unavailable.
    }
  };
  return { collapsed, toggle };
}
