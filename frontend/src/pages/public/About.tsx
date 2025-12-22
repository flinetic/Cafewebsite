import React from 'react';
import { Coffee, Heart, Users, Award } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf8f5] via-[#f5ede3] to-[#ede4d9] py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#e8dfd3] to-[#d4b89f] rounded-full mb-6 shadow-inner">
            <Coffee className="w-10 h-10 text-[#8b6347]" />
          </div>
          <h1 className="text-4xl font-bold text-[#5d3a1a] mb-4">About BookAVibe</h1>
          <p className="text-xl text-[#8b6f47] max-w-2xl mx-auto">
            Revolutionizing the dining experience with modern technology and exceptional service
          </p>
        </div>

        {/* Mission Statement */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8 border border-[#e8dfd3]">
          <h2 className="text-2xl font-bold text-[#5d3a1a] mb-4">Our Mission</h2>
          <p className="text-[#6b5744] leading-relaxed">
            At BookAVibe, we believe dining should be seamless, enjoyable, and memorable. 
            Our QR-based ordering system combines the warmth of traditional hospitality with 
            the efficiency of modern technology, allowing you to focus on what matters most - 
            enjoying great food and great company.
          </p>
        </div>

        {/* Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 text-center border border-[#e8dfd3] hover:shadow-xl transition hover:-translate-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-[#e8dfd3] to-[#d4b89f] rounded-full mb-4 shadow-inner">
              <Heart className="w-7 h-7 text-[#8b6347]" />
            </div>
            <h3 className="text-lg font-semibold text-[#5d3a1a] mb-2">Quality First</h3>
            <p className="text-[#6b5744] text-sm">
              We source the finest ingredients and craft every dish with care
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 text-center border border-[#e8dfd3] hover:shadow-xl transition hover:-translate-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-[#e8dfd3] to-[#d4b89f] rounded-full mb-4 shadow-inner">
              <Users className="w-7 h-7 text-[#8b6347]" />
            </div>
            <h3 className="text-lg font-semibold text-[#5d3a1a] mb-2">Customer Focused</h3>
            <p className="text-[#6b5744] text-sm">
              Your satisfaction is our priority, every single time
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 text-center border border-[#e8dfd3] hover:shadow-xl transition hover:-translate-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-[#e8dfd3] to-[#d4b89f] rounded-full mb-4 shadow-inner">
              <Award className="w-7 h-7 text-[#8b6347]" />
            </div>
            <h3 className="text-lg font-semibold text-[#5d3a1a] mb-2">Innovation</h3>
            <p className="text-[#6b5744] text-sm">
              Embracing technology to enhance your dining experience
            </p>
          </div>
        </div>

        {/* Story */}
        <div className="bg-white rounded-2xl p-8 border border-[#e8dfd3]">
          <h2 className="text-2xl font-bold text-[#5d3a1a] mb-4">Our Story</h2>
          <p className="text-[#6b5744] leading-relaxed mb-4">
            BookAVibe started with a simple idea: make dining out easier and more enjoyable for everyone. 
            We noticed that traditional restaurant ordering could sometimes be slow or inconvenient, 
            especially during busy hours.
          </p>
          <p className="text-[#6b5744] leading-relaxed">
            By implementing QR code technology and a user-friendly digital menu, we've created a system 
            that respects your time while maintaining the personal touch that makes dining special. 
            Whether you're in a hurry or settling in for a leisurely meal, BookAVibe adapts to your needs.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
