import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { QrCode, Utensils, Coffee, BookOpen, Smartphone, CreditCard, ArrowLeft } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const Menu: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const tableNumber = searchParams.get('table');
    if (tableNumber) {
      navigate(`/table/${tableNumber}/menu`, { replace: true });
    }
  }, [searchParams, navigate]);

  const steps = [
    { icon: QrCode, title: 'Scan QR Code', desc: 'Find the QR code on your table' },
    { icon: Smartphone, title: 'Enter Details', desc: 'Your name & phone number' },
    { icon: BookOpen, title: 'Browse Menu', desc: 'Explore our delicious offerings' },
    { icon: Coffee, title: 'Place Order', desc: 'Add items to your order' },
    { icon: CreditCard, title: 'Pay Later', desc: 'Pay at counter after your meal' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDF8F3] via-[#F5EBE0] to-[#EDE0D4] py-20 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-[#8B5E3C] to-[#6B4423] rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
            <QrCode className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-[#2C1810] mb-4">
            Scan to Order
          </h1>
          <p className="text-lg text-[#5D4E37] max-w-md mx-auto">
            Use the QR code at your table to access our menu and place your order seamlessly
          </p>
        </motion.div>

        {/* Steps Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-[#E8DFD3]"
        >
          <div className="flex items-center gap-3 mb-8">
            <Utensils className="w-6 h-6 text-[#8B5E3C]" />
            <span className="text-xl font-bold text-[#2C1810]">How It Works</span>
          </div>

          <div className="space-y-6">
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
                className="flex items-start gap-4 group"
              >
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#8B5E3C]/10 to-[#D4A574]/10 group-hover:from-[#8B5E3C] group-hover:to-[#D4A574] rounded-xl flex items-center justify-center transition-all">
                    <step.icon className="w-5 h-5 text-[#8B5E3C] group-hover:text-white transition-colors" />
                  </div>
                  {idx < steps.length - 1 && (
                    <div className="absolute left-1/2 top-12 w-0.5 h-6 bg-gradient-to-b from-[#8B5E3C]/30 to-transparent -translate-x-1/2" />
                  )}
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="font-bold text-[#2C1810] mb-1">{step.title}</h3>
                  <p className="text-[#5D4E37] text-sm">{step.desc}</p>
                </div>
                <span className="w-8 h-8 bg-[#F5EBE0] text-[#8B5E3C] rounded-full flex items-center justify-center font-bold text-sm">
                  {idx + 1}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center"
        >
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#8B5E3C] to-[#6B4423] text-white rounded-full font-semibold shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
          >
            <ArrowLeft size={20} />
            Back to Home
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Menu;
