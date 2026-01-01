import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Coffee, Instagram, Facebook, MapPin, Phone, Mail } from 'lucide-react';
import Logo from '../assets/logo.svg';

const PublicLayout: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Check if on a page with hero background image
  const hasHeroBackground = location.pathname === '/' || location.pathname === '/about';

  // Navbar should be transparent only on pages with hero background when not scrolled
  const isTransparent = hasHeroBackground && !scrolled;

  // Scroll to top on route change
  useEffect(() => {
    if (!location.hash) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.pathname]);

  // Handle hash scrolling
  useEffect(() => {
    if (location.hash) {
      setTimeout(() => {
        const elem = document.getElementById(location.hash.substring(1));
        if (elem) {
          elem.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100); // Small delay to ensure content is rendered
    }
  }, [location.hash, location.pathname]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/#about', label: 'About' },
    { path: '/menu', label: 'Menu' },
    { path: '/#gallery', label: 'Gallery' },
    { path: '/#contact', label: 'Contact' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FDF8F3]">
      {/* Premium Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${isTransparent
          ? 'bg-transparent'
          : 'bg-[#FDF8F3]/95 backdrop-blur-lg shadow-lg shadow-[#8B5E3C]/10'
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <motion.img
                src={Logo}
                alt="Book A Vibe"
                className={`h-12 w-12 rounded-full shadow-md border-2 ${isTransparent ? 'border-white/50' : 'border-[#8B5E3C]'}`}
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 300 }}
              />
              <span className={`text-2xl font-bold ${isTransparent ? 'text-white' : 'bg-gradient-to-r from-[#8B5E3C] to-[#C4A484] bg-clip-text text-transparent'}`}>
                Book A Vibe
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="relative group"
                >
                  <span className={`text-lg font-medium transition-colors ${isTransparent
                    ? (isActive(link.path) ? 'text-[#D4A574]' : 'text-white/90 hover:text-[#D4A574]')
                    : (isActive(link.path) ? 'text-[#8B5E3C]' : 'text-[#5D4E37] hover:text-[#8B5E3C]')
                    }`}>
                    {link.label}
                  </span>
                  <motion.span
                    className={`absolute -bottom-1 left-0 h-0.5 ${isTransparent ? 'bg-[#D4A574]' : 'bg-gradient-to-r from-[#8B5E3C] to-[#D4A574]'}`}
                    initial={{ width: isActive(link.path) ? '100%' : '0%' }}
                    animate={{ width: isActive(link.path) ? '100%' : '0%' }}
                    whileHover={{ width: '100%' }}
                    transition={{ duration: 0.3 }}
                  />
                </Link>
              ))}
              <Link
                to="/menu"
                className="ml-4 px-6 py-2.5 bg-gradient-to-r from-[#8B5E3C] to-[#6B4423] text-white rounded-full font-medium shadow-lg shadow-[#8B5E3C]/30 hover:shadow-xl hover:shadow-[#8B5E3C]/40 hover:scale-105 transition-all duration-300"
              >
                Order Now
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`md:hidden p-2 rounded-xl transition-colors ${isTransparent
                ? 'text-white hover:bg-white/10'
                : 'text-[#8B5E3C] hover:bg-[#F5EBE0]'
                }`}
            >
              {menuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-[#FDF8F3]/98 backdrop-blur-lg border-t border-[#E8DFD3]"
            >
              <div className="px-6 py-4 space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMenuOpen(false)}
                    className={`block px-4 py-3 rounded-xl font-medium transition-all ${isActive(link.path)
                      ? 'bg-gradient-to-r from-[#8B5E3C]/10 to-[#D4A574]/10 text-[#8B5E3C]'
                      : 'text-[#5D4E37] hover:bg-[#F5EBE0]'
                      }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  to="/menu"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-3 bg-gradient-to-r from-[#8B5E3C] to-[#6B4423] text-white text-center rounded-xl font-medium mt-4"
                >
                  Order Now
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Premium Footer */}
      <footer className="relative bg-gradient-to-br from-[#3D2817] via-[#2C1810] to-[#1A0F0A] text-white overflow-hidden">
        {/* Wood grain texture overlay */}
        <div className="absolute inset-0 opacity-5 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48ZGVmcz48cGF0dGVybiBpZD0id29vZCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiPjxwYXRoIGQ9Ik0wIDUwIFExMCAyMCAzMCA1MCBUNjAgNTAgVDkwIDUwIFQxMjAgNTAiIHN0cm9rZT0iI2ZmZiIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIwLjUiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjd29vZCkiLz48L3N2Zz4=')]" />

        <div className="relative max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <img src={Logo} alt="Book A Vibe" className="h-14 w-14 rounded-full" />
                <span className="text-2xl font-bold text-[#D4A574]">Book A Vibe</span>
              </div>
              <p className="text-[#A89378] leading-relaxed mb-6">
                Where coffee meets stories, and work finds inspiration.
              </p>
              <div className="flex gap-4">
                {[Instagram, Facebook, Coffee].map((Icon, idx) => (
                  <motion.a
                    key={idx}
                    href="#"
                    whileHover={{ scale: 1.1, y: -2 }}
                    className="w-10 h-10 bg-[#5D4E37]/50 hover:bg-[#D4A574] rounded-full flex items-center justify-center transition-colors"
                  >
                    <Icon size={18} />
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-bold text-[#D4A574] mb-6">Explore</h3>
              <ul className="space-y-3">
                {['Home', 'About Us', 'Menu', 'Gallery', 'Contact'].map((item) => (
                  <li key={item}>
                    <a href={item === 'Contact' ? '#contact' : item === 'Gallery' ? '#gallery' : item === 'Menu' ? '/menu' : item === 'About Us' ? '#about' : '/'} className="text-[#A89378] hover:text-[#D4A574] transition-colors flex items-center gap-2 group">
                      <span className="w-0 group-hover:w-2 h-0.5 bg-[#D4A574] transition-all" />
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-lg font-bold text-[#D4A574] mb-6">Experience</h3>
              <ul className="space-y-3">
                {['Coworking Space', 'Book Library', 'Gaming Zone', 'Events'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-[#A89378] hover:text-[#D4A574] transition-colors flex items-center gap-2 group">
                      <span className="w-0 group-hover:w-2 h-0.5 bg-[#D4A574] transition-all" />
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-lg font-bold text-[#D4A574] mb-6">Visit Us</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-[#A89378]">
                  <MapPin size={20} className="text-[#D4A574] flex-shrink-0 mt-1" />
                  <span>FC Road, Pune 411004</span>
                </li>
                <li className="flex items-center gap-3 text-[#A89378]">
                  <Phone size={20} className="text-[#D4A574]" />
                  <span>+91 12345 67890</span>
                </li>
                <li className="flex items-center gap-3 text-[#A89378]">
                  <Mail size={20} className="text-[#D4A574]" />
                  <span>hello@bookavibe.com</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-[#5D4E37]/30 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-[#8B7A64]">
              © {new Date().getFullYear()} Book A Vibe. Crafted with ☕ and 📚
            </p>
            <div className="flex gap-6 text-sm text-[#8B7A64]">
              <a href="#" className="hover:text-[#D4A574] transition-colors">Privacy</a>
              <a href="#" className="hover:text-[#D4A574] transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
