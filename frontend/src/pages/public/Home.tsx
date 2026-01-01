import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
    BookOpen, Coffee, Gamepad, Wifi, Users,
    ChevronRight, MapPin, Phone, Instagram, ArrowRight,
    Send, Loader2, Mail
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Logo from '../../assets/logo.svg';

const Home: React.FC = () => {
    const [showHero, setShowHero] = useState(false);
    const { scrollYProgress } = useScroll();
    const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
    const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

    useEffect(() => {
        const t = setTimeout(() => setShowHero(true), 100);
        return () => clearTimeout(t);
    }, []);

    const fadeInUp = {
        hidden: { opacity: 0, y: 60 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
    };


    const features = [
        {
            icon: Coffee,
            title: 'Premium Coffee',
            desc: 'Artisan roasted beans from the finest sources',
            image: 'https://b.zmtcdn.com/data/pictures/4/21235914/d9f4152847ede07181217bd9a944c03d.jpg?fit=around|750:500&crop=750:500;*,*'
        },
        {
            icon: BookOpen,
            title: 'Book Library',
            desc: '500+ curated books to explore and enjoy',
            image: 'data:image/jpeg;base64,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'
        },
        {
            icon: Wifi,
            title: 'Coworking Space',
            desc: 'High-speed WiFi & power at every table',
            image: 'data:image/jpeg;base64,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'
        },
        {
            icon: Gamepad,
            title: 'Gaming Zone',
            desc: 'Board games, consoles & tournaments',
            image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRFE4mNIKeH7P-bYrRCzbLRjVSQcPJ6Jq_C5w&s'
        },
    ];

    const menuHighlights = [
        { name: 'Signature Latte', price: '₹180', tag: 'Bestseller' },
        { name: 'Cold Brew', price: '₹160', tag: 'Refreshing' },
        { name: 'Mocha Supreme', price: '₹200', tag: 'Indulgent' },
        { name: 'Matcha Oat', price: '₹190', tag: 'Healthy' },
    ];

    // Contact Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });
    const [submitting, setSubmitting] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!formData.name || !formData.phone || !formData.message) {
            toast.error('Please fill in all required fields');
            return;
        }

        setSubmitting(true);

        try {
            // Check if Google Script URL is configured
            // Note: User needs to replace this URL after deploying their script
            const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwPaiMlvcIoZg704I2kMXBJ00gMCE-hJXvPLXMgTXqLm0d_t17rF3Td8YqTYxCCwxhP/exec';

            if (GOOGLE_SCRIPT_URL.includes('REPLACE_WITH')) {
                // Simulate success for demo purposes if URL isn't set
                await new Promise(resolve => setTimeout(resolve, 1500));
                toast.error('Please configure the Google Script URL first (check setup instructions)');
                setSubmitting(false);
                return;
            }

            await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors', // Important for Google Apps Script
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            // Since mode is no-cors, we can't check response.ok
            // We assume success if no network error occurred
            toast.success('Message sent successfully! We will contact you soon.');
            setFormData({
                name: '',
                email: '',
                phone: '',
                message: ''
            });
        } catch (error) {
            console.error('Submission error:', error);
            toast.error('Failed to send message. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const stats = [
        { value: '500+', label: 'Books' },
        { value: '50+', label: 'Board Games' },
        { value: '100mbps', label: 'WiFi Speed' },
        { value: '4.7★', label: 'Rating' },
    ];

    return (
        <div className="w-full overflow-hidden">
            {/* Hero Section - Full Background Image */}
            <motion.section
                style={{ opacity: heroOpacity, scale: heroScale }}
                className="relative min-h-screen flex items-center justify-center"
            >
                {/* Background Image */}
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage: `url('https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=1920&auto=format&fit=crop&q=80')`
                    }}
                />

                {/* Gradient Overlay - Bottom to Top Fade */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#2C1810] via-[#2C1810]/70 to-[#2C1810]/30" />

                {/* Content */}
                <div className="relative z-10 max-w-5xl mx-auto px-6 py-20 text-center">
                    {/* Logo with Border */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={showHero ? { opacity: 1, scale: 1 } : {}}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="mb-8"
                    >
                        <img
                            src={Logo}
                            alt="Book A Vibe"
                            className="w-28 h-28 mx-auto rounded-full border-4 border-white/80 shadow-2xl"
                        />
                    </motion.div>

                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={showHero ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/15 backdrop-blur-md rounded-full mb-8 border border-white/20"
                    >
                        <Coffee size={18} className="text-[#D4A574]" />
                        <span className="text-sm font-medium text-white/90">Cafe • Books • Coworking • Gaming</span>
                    </motion.div>

                    {/* Main Heading */}
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={showHero ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="text-6xl md:text-7xl lg:text-8xl font-black text-white leading-tight mb-6"
                    >
                        Book A{' '}
                        <span className="bg-gradient-to-r from-[#D4A574] via-[#C4A484] to-[#E8C9A0] bg-clip-text text-transparent">
                            Vibe
                        </span>
                    </motion.h1>

                    {/* Tagline */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={showHero ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6, delay: 0.5 }}
                        className="text-2xl md:text-3xl text-[#D4A574] mb-6 font-light tracking-wide"
                        style={{ fontFamily: '"Playfair Display", serif' }}
                    >
                        Sip. Read. Work. Play.
                    </motion.p>

                    {/* Description */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={showHero ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6, delay: 0.6 }}
                        className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed"
                    >
                        Your cozy corner where premium coffee meets inspiring books,
                        productive workspaces, and endless entertainment.
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={showHero ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6, delay: 0.7 }}
                        className="flex flex-wrap justify-center gap-4"
                    >
                        <Link
                            to="/menu"
                            className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#D4A574] to-[#C4A484] text-[#2C1810] rounded-full font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                        >
                            Explore Menu
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <a
                            href="#features"
                            className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white/50 text-white rounded-full font-semibold hover:bg-white hover:text-[#2C1810] transition-all duration-300 backdrop-blur-sm"
                        >
                            Discover More
                        </a>
                    </motion.div>

                    {/* Stats Bar inside Hero */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={showHero ? { opacity: 1, y: 0 } : {}}
                        transition={{ delay: 0.9 }}
                        className="mt-16 bg-gradient-to-r from-[#8B5E3C] to-[#6B4423] rounded-2xl p-6 md:p-8 shadow-2xl"
                    >
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                            {stats.map((stat, idx) => (
                                <div key={idx} className="text-center">
                                    <p className="text-2xl md:text-3xl font-bold text-white mb-1">{stat.value}</p>
                                    <p className="text-[#D4A574] text-sm md:text-base">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Scroll Indicator */}
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2"
                >
                    <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center pt-2">
                        <motion.div
                            animate={{ y: [0, 12, 0] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="w-1.5 h-3 bg-white/70 rounded-full"
                        />
                    </div>
                </motion.div>
            </motion.section>

            {/* Features Section - What We Offer */}
            <section id="features" className="py-24 bg-gradient-to-b from-[#FDF8F3] to-[#F5EBE0]">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={fadeInUp}
                        className="text-center mb-20"
                    >
                        <span className="inline-block px-5 py-2.5 bg-gradient-to-r from-[#8B5E3C]/20 to-[#D4A574]/20 rounded-full text-[#8B5E3C] font-semibold mb-6 border border-[#8B5E3C]/20">
                            ✨ What We Offer
                        </span>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#2C1810] mb-6">
                            More Than Just <span className="text-[#8B5E3C]">Coffee</span>
                        </h2>
                        <p className="text-xl text-[#5D4E37] max-w-3xl mx-auto leading-relaxed">
                            A complete experience designed for comfort, creativity, and connection.
                            Discover your new favorite corner of the city.
                        </p>
                    </motion.div>

                    <div className="grid lg:grid-cols-2 gap-8">
                        {features.map((feature, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                whileHover={{ y: -5 }}
                                className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 flex flex-col md:flex-row"
                            >
                                <div className="md:w-2/5 h-52 md:h-auto overflow-hidden">
                                    <img
                                        src={feature.image}
                                        alt={feature.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                </div>
                                <div className="md:w-3/5 p-8 flex flex-col justify-center">
                                    <div className="w-14 h-14 bg-gradient-to-br from-[#8B5E3C] to-[#D4A574] rounded-2xl flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform">
                                        <feature.icon className="text-white" size={26} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-[#2C1810] mb-3">{feature.title}</h3>
                                    <p className="text-[#5D4E37] text-lg leading-relaxed">{feature.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Coworking Section - Full Width Background */}
            <section className="relative py-32 overflow-hidden">
                {/* Background Image */}
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url('https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&auto=format&fit=crop&q=80')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#2C1810]/95 via-[#2C1810]/80 to-[#2C1810]/60" />

                <div className="relative max-w-7xl mx-auto px-6">
                    <div className="max-w-2xl">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <span className="inline-block px-5 py-2.5 bg-white/10 backdrop-blur-md rounded-full text-[#D4A574] font-semibold mb-6 border border-white/20">
                                💼 Coworking Space
                            </span>
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                                Work From Your <br />
                                <span className="text-[#D4A574]">Happy Place</span>
                            </h2>
                            <p className="text-xl text-white/80 mb-10 leading-relaxed">
                                Escape the home office blues. Our coworking space offers the perfect
                                blend of productivity and comfort with high-speed WiFi, ergonomic seating,
                                and unlimited coffee refills.
                            </p>

                            <div className="grid grid-cols-2 gap-4 mb-10">
                                {['100Mbps WiFi', 'Power Outlets', 'Quiet Zones', 'Meeting Rooms'].map((item, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="flex items-center gap-3 text-white/90"
                                    >
                                        <div className="w-8 h-8 bg-[#D4A574]/30 rounded-lg flex items-center justify-center">
                                            <ChevronRight size={16} className="text-[#D4A574]" />
                                        </div>
                                        <span className="font-medium">{item}</span>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl">
                                    <div className="w-10 h-10 bg-[#D4A574] rounded-full flex items-center justify-center">
                                        <Users className="text-white" size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-white">50+</p>
                                        <p className="text-sm text-white/70">Daily Workers</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Menu Preview */}
            <section className="py-24 bg-gradient-to-b from-[#F5EBE0] to-[#FDF8F3]">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <span className="inline-block px-5 py-2.5 bg-gradient-to-r from-[#8B5E3C]/20 to-[#D4A574]/20 rounded-full text-[#8B5E3C] font-semibold mb-6 border border-[#8B5E3C]/20">
                            ☕ Our Menu
                        </span>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#2C1810] mb-4">
                            Signature <span className="text-[#8B5E3C]">Drinks</span>
                        </h2>
                        <p className="text-xl text-[#5D4E37] max-w-2xl mx-auto">
                            Crafted with love, served with passion
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                        {menuHighlights.map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                whileHover={{ y: -8, scale: 1.02 }}
                                className="group bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 text-center border border-[#E8DFD3] hover:border-[#D4A574]/50"
                            >
                                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-[#8B5E3C]/10 to-[#D4A574]/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Coffee className="text-[#8B5E3C]" size={28} />
                                </div>
                                <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-[#D4A574]/30 to-[#C4A484]/30 text-[#8B5E3C] text-sm font-medium rounded-full mb-4">
                                    {item.tag}
                                </span>
                                <h3 className="text-xl font-bold text-[#2C1810] mb-3">{item.name}</h3>
                                <p className="text-3xl font-bold bg-gradient-to-r from-[#8B5E3C] to-[#D4A574] bg-clip-text text-transparent">{item.price}</p>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-center"
                    >
                        <Link
                            to="/menu"
                            className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-[#8B5E3C] to-[#6B4423] text-white rounded-full text-lg font-semibold shadow-xl shadow-[#8B5E3C]/30 hover:shadow-2xl hover:shadow-[#8B5E3C]/40 hover:scale-105 transition-all"
                        >
                            View Full Menu
                            <ArrowRight size={22} />
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Contact Form Section */}
            <section className="py-24 bg-gradient-to-br from-[#3D2817] to-[#2C1810] relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 left-20 w-64 h-64 bg-[#D4A574] rounded-full blur-3xl" />
                    <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#8B5E3C] rounded-full blur-3xl" />
                </div>

                <div className="relative max-w-7xl mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <span className="inline-block px-5 py-2.5 bg-white/10 backdrop-blur-md rounded-full text-[#D4A574] font-semibold mb-6 border border-white/20">
                                📞 Get in Touch
                            </span>
                            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                                Have Questions? <br />
                                <span className="text-[#D4A574]">We're Here to Help</span>
                            </h2>
                            <p className="text-xl text-white/80 mb-10 leading-relaxed">
                                Whether you want to book a table, host an event, or just say hello,
                                we'd love to hear from you. Fill out the form and our team will
                                get back to you shortly.
                            </p>

                            <div className="space-y-6 mb-10">
                                <a
                                    href="https://maps.google.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-4 text-white hover:text-[#D4A574] transition-colors group"
                                >
                                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-[#D4A574] group-hover:text-white transition-all">
                                        <MapPin size={24} />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-lg">Visit Us</p>
                                        <p className="text-white/60">123 Cafe Street, Bookville, BK 400001</p>
                                    </div>
                                </a>

                                <a
                                    href="tel:+911234567890"
                                    className="flex items-center gap-4 text-white hover:text-[#D4A574] transition-colors group"
                                >
                                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-[#D4A574] group-hover:text-white transition-all">
                                        <Phone size={24} />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-lg">Call Us</p>
                                        <p className="text-white/60">+91 123 456 7890</p>
                                    </div>
                                </a>

                                <a
                                    href="mailto:hello@bookavibe.com"
                                    className="flex items-center gap-4 text-white hover:text-[#D4A574] transition-colors group"
                                >
                                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-[#D4A574] group-hover:text-white transition-all">
                                        <Mail size={24} />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-lg">Email Us</p>
                                        <p className="text-white/60">hello@bookavibe.com</p>
                                    </div>
                                </a>
                            </div>

                            <div className="flex gap-4">
                                {[Instagram].map((Icon, idx) => (
                                    <a key={idx} href="#" className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center text-white/70 hover:bg-white hover:text-[#2C1810] transition-all">
                                        <Icon size={20} />
                                    </a>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="bg-white rounded-3xl p-8 md:p-10 shadow-2xl"
                        >
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-[#5D4E37]">Your Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-3 bg-[#FDF8F3] border border-[#E8DFD3] rounded-xl focus:ring-2 focus:ring-[#D4A574] focus:border-transparent outline-none transition-all placeholder:text-[#A89378]"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-[#5D4E37]">Phone Number</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-3 bg-[#FDF8F3] border border-[#E8DFD3] rounded-xl focus:ring-2 focus:ring-[#D4A574] focus:border-transparent outline-none transition-all placeholder:text-[#A89378]"
                                            placeholder="+91 98765 43210"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-[#5D4E37]">Email Address (Optional)</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-[#FDF8F3] border border-[#E8DFD3] rounded-xl focus:ring-2 focus:ring-[#D4A574] focus:border-transparent outline-none transition-all placeholder:text-[#A89378]"
                                        placeholder="john@example.com"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-[#5D4E37]">Your Message</label>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleInputChange}
                                        required
                                        rows={4}
                                        className="w-full px-4 py-3 bg-[#FDF8F3] border border-[#E8DFD3] rounded-xl focus:ring-2 focus:ring-[#D4A574] focus:border-transparent outline-none transition-all placeholder:text-[#A89378] resize-none"
                                        placeholder="I'd like to book a table for..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full py-4 bg-gradient-to-r from-[#8B5E3C] to-[#6B4423] text-white rounded-xl font-bold shadow-lg shadow-[#8B5E3C]/30 hover:shadow-xl hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100 transition-all flex items-center justify-center gap-2"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 size={20} className="animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            Send Message
                                            <Send size={20} />
                                        </>
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
        </div>
    );
};

export default Home;