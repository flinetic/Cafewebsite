import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';

const PublicLayout: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navLinkClass = (path: string) =>
    `transition ${isActive(path) ? 'text-[#6b4423] font-semibold' : 'text-[#8b6f47] hover:text-[#6b4423]'}`;

  const mobileNavLinkClass = (path: string) =>
    `block px-6 py-3 hover:bg-[#f5ede3] ${isActive(path) ? 'text-[#6b4423] font-semibold bg-[#f5ede3]' : 'text-[#8b6f47]'}`;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-amber-50 to-orange-100">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-[#faf8f5]/95 backdrop-blur-md shadow-sm z-50 border-b border-[#e8dfd3]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="text-3xl font-bold text-[#6b4423]">
            BookAVibe
          </Link>
          <div className="hidden md:flex gap-8">
            <Link to="/" className={navLinkClass('/')}>Home</Link>
            <Link to="/about" className={navLinkClass('/about')}>About</Link>
            <Link to="/menu" className={navLinkClass('/menu')}>Menu</Link>
          </div>
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-2xl text-[#6b4423]"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-[#faf8f5] border-t border-[#e8dfd3]">
            <Link to="/" className={mobileNavLinkClass('/')} onClick={() => setMenuOpen(false)}>Home</Link>
            <Link to="/about" className={mobileNavLinkClass('/about')} onClick={() => setMenuOpen(false)}>About</Link>
            <Link to="/menu" className={mobileNavLinkClass('/menu')} onClick={() => setMenuOpen(false)}>Menu</Link>
          </div>
        )}
      </nav>

      {/* Main Content - Add padding for fixed navbar */}
      <main className="flex-1 pt-16">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-[#3d2817] text-white py-12 px-6 mt-auto">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-bold mb-4 text-[#d4b89f]">BookAVibe</h3>
              <p className="text-[#a89378]">
                Where every cup tells a story
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4 text-[#d4b89f]">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-[#a89378] hover:text-[#d4b89f] transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/menu" className="text-[#a89378] hover:text-[#d4b89f] transition-colors">
                    Menu
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-[#a89378] hover:text-[#d4b89f] transition-colors">
                    About
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4 text-[#d4b89f]">Contact</h3>
              <p className="text-[#a89378]">
                Email: hello@bookavibe.com
                <br />
                Phone: +91 98765 43210
              </p>
            </div>
          </div>
          <div className="pt-8 border-t border-[#5d3a1a] text-center text-sm text-[#8b7a64]">
            © {new Date().getFullYear()} BookAVibe. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
