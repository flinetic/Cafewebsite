import React from 'react';
import { QrCode, Utensils } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Menu: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf8f5] via-[#f5ede3] to-[#ede4d9] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="w-32 h-32 bg-gradient-to-br from-[#8b6347] to-[#6b4423] rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
          <QrCode className="w-16 h-16 text-white" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-[#5d3a1a] mb-4">
          Scan QR Code to View Menu
        </h1>

        {/* Description */}
        <p className="text-[#6b5744] mb-8 leading-relaxed">
          Please scan the QR code placed on your table to access our menu and place orders. 
          This ensures we serve you at the right table!
        </p>

        {/* Info Box */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-[#e8dfd3]">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Utensils className="w-6 h-6 text-[#8b6347]" />
            <span className="font-semibold text-[#5d3a1a]">How it works</span>
          </div>
          <ol className="text-left text-[#6b5744] space-y-3">
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 bg-[#f5ede3] text-[#8b6347] rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm">1</span>
              <span>Find the QR code on your table</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 bg-[#f5ede3] text-[#8b6347] rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm">2</span>
              <span>Scan it with your phone camera</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 bg-[#f5ede3] text-[#8b6347] rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm">3</span>
              <span>Enter your name & phone number</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 bg-[#f5ede3] text-[#8b6347] rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm">4</span>
              <span>Browse menu & place your order</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 bg-[#f5ede3] text-[#8b6347] rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm">5</span>
              <span>Pay at the counter after your meal</span>
            </li>
          </ol>
        </div>

        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-[#6b4423] text-white rounded-full hover:bg-[#5d3a1a] transition-colors font-medium shadow-lg hover:scale-105 transition-all duration-300"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default Menu;
