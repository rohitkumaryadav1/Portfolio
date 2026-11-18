'use client';
import { Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';
export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const value = localStorage.getItem('theme') === 'dark';
    setDark(value);
    document.documentElement.dataset.theme = value ? 'dark' : 'light';
  }, []);
  return (
    <button
      className="icon-button"
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      onClick={() => {
        const value = !dark;
        setDark(value);
        document.documentElement.dataset.theme = value ? 'dark' : 'light';
        localStorage.setItem('theme', value ? 'dark' : 'light');
      }}
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
