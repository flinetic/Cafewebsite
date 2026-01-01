import React from 'react';
import { motion } from 'framer-motion';
import { Coffee, BookOpen, Users, Award, Heart, Wifi, Gamepad2, Clock } from 'lucide-react';
import Logo from '../../assets/logo.svg';

const About: React.FC = () => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const values = [
    { icon: Heart, title: 'Passion', desc: 'Every cup crafted with love and dedication' },
    { icon: Users, title: 'Community', desc: 'Building connections over coffee and books' },
    { icon: Award, title: 'Quality', desc: 'Only the finest ingredients and experiences' },
  ];

  const spaces = [
    { icon: Coffee, title: 'Cafe Area', desc: 'Cozy seating for your coffee moments' },
    { icon: BookOpen, title: 'Reading Nook', desc: 'Quiet corners with 500+ books' },
    { icon: Wifi, title: 'Work Zone', desc: 'High-speed WiFi & power everywhere' },
    { icon: Gamepad2, title: 'Gaming Corner', desc: 'Board games and video games' },
  ];

  return (
    <div className="w-full overflow-hidden">
      {/* Hero Section with Background */}
      <section className="relative min-h-[60vh] flex items-center justify-center">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=1920&auto=format&fit=crop&q=80')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2C1810] via-[#2C1810]/70 to-[#2C1810]/40" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center justify-center w-24 h-24 mb-6"
            >
              <img src={Logo} alt="Book A Vibe" className="w-full h-full rounded-full shadow-xl border-2 border-white/50" />
            </motion.div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Our <span className="text-[#D4A574]">Story</span>
            </h1>
            <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              Born from a love of coffee, books, and meaningful connections,
              Book A Vibe is more than just a cafe — it's your creative sanctuary.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <span className="inline-block px-4 py-2 bg-[#8B5E3C]/10 rounded-full text-[#8B5E3C] font-medium mb-4">
                Our Mission
              </span>
              <h2 className="text-4xl font-bold text-[#2C1810] mb-6">
                Creating Spaces for <br />
                <span className="text-[#8B5E3C]">Inspiration</span>
              </h2>
              <p className="text-lg text-[#5D4E37] mb-6 leading-relaxed">
                We believe the best ideas come when you're comfortable. That's why
                we've designed every corner of Book A Vibe to spark creativity,
                encourage connection, and fuel your passions.
              </p>
              <p className="text-lg text-[#5D4E37] leading-relaxed">
                Whether you're diving into a new novel, brainstorming your next big
                project, or challenging friends to a board game — this is your space.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800&auto=format&fit=crop&q=80"
                  alt="Cafe Interior"
                  className="w-full h-[400px] object-cover"
                />
              </div>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="absolute -bottom-6 -right-6 bg-gradient-to-br from-[#8B5E3C] to-[#6B4423] p-6 rounded-2xl text-white shadow-xl"
              >
                <p className="text-3xl font-bold">Est. 2020</p>
                <p className="text-[#D4A574]">Serving happiness daily</p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-gradient-to-br from-[#F5EBE0] to-[#EDE0D4]">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-2 bg-[#8B5E3C]/10 rounded-full text-[#8B5E3C] font-medium mb-4">
              What Drives Us
            </span>
            <h2 className="text-4xl font-bold text-[#2C1810]">Our Values</h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8"
          >
            {values.map((value, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUp}
                whileHover={{ y: -10 }}
                className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-[#8B5E3C] to-[#D4A574] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <value.icon className="text-white" size={28} />
                </div>
                <h3 className="text-2xl font-bold text-[#2C1810] mb-3">{value.title}</h3>
                <p className="text-[#5D4E37]">{value.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Spaces Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-2 bg-[#8B5E3C]/10 rounded-full text-[#8B5E3C] font-medium mb-4">
              Explore
            </span>
            <h2 className="text-4xl font-bold text-[#2C1810]">Our Spaces</h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {spaces.map((space, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUp}
                whileHover={{ scale: 1.05 }}
                className="group bg-gradient-to-br from-[#FDF8F3] to-[#F5EBE0] p-6 rounded-2xl border border-[#E8DFD3] hover:border-[#8B5E3C]/30 transition-all"
              >
                <div className="w-12 h-12 bg-[#8B5E3C]/10 group-hover:bg-[#8B5E3C] rounded-xl flex items-center justify-center mb-4 transition-colors">
                  <space.icon className="text-[#8B5E3C] group-hover:text-white transition-colors" size={24} />
                </div>
                <h3 className="text-lg font-bold text-[#2C1810] mb-2">{space.title}</h3>
                <p className="text-sm text-[#5D4E37]">{space.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Hours Section */}
      <section className="py-24 bg-gradient-to-br from-[#3D2817] to-[#2C1810]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="w-16 h-16 bg-[#D4A574] rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="text-white" size={28} />
            </div>
            <h2 className="text-4xl font-bold text-white mb-8">Visit Us</h2>
            <div className="grid md:grid-cols-2 gap-8 text-left">
              <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl">
                <h3 className="text-xl font-bold text-[#D4A574] mb-4">Hours</h3>
                <ul className="space-y-3 text-[#C4A484]">
                  <li className="flex justify-between">
                    <span>Monday - Friday</span>
                    <span className="text-white">10 AM – 10:30 PM</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Saturday - Sunday</span>
                    <span className="text-white">10 AM – 10:30 PM</span>
                  </li>
                </ul>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl">
                <h3 className="text-xl font-bold text-[#D4A574] mb-4">Location</h3>
                <p className="text-[#C4A484]">
                  FC Road, Pune<br />
                  Maharashtra 411004
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;
