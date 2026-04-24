import { useState, useLayoutEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Header } from './components/Header.js';
import { Home } from './pages/Home.js';
import { Search } from './pages/Search.js';

export default function App() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('pokefind-theme');
    return saved ? saved === 'dark' : true;
  });

  useLayoutEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('pokefind-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Header isDark={isDark} onToggleDark={() => setIsDark(d => !d)} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
      </Routes>
    </div>
  );
}
