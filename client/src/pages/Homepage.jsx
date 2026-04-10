import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Homepage() {
  const navigate = useNavigate();

  return (
    <div className="w-full overflow-x-hidden">
      {/* Navigation */}
      <nav className="sticky top-0 z-1000 border-b border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center gap-8">
          <div className="flex items-center gap-3 cursor-pointer flex-shrink-0" onClick={() => navigate('/')}>
            <span className="text-3xl animate-float">🏥</span>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-accent to-purple-600 bg-clip-text text-transparent">
              MediLink
            </h1>
          </div>

          <ul className="hidden md:flex list-none gap-8 flex-1 justify-center">
            {['Services', 'Benefits', 'About', 'Contact'].map((item) => (
              <li key={item}>
                <a
                  href={`#${item.toLowerCase()}`}
                  className="text-gray-700 dark:text-gray-300 font-medium hover:text-accent transition-colors relative after:absolute after:w-0 after:h-0.5 after:bottom-[-5px] after:left-0 after:bg-accent after:transition-all after:duration-300 hover:after:w-full"
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex gap-4 flex-shrink-0">
            <button 
              onClick={() => navigate('/signin')}
              className="px-5 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-semibold hover:border-accent hover:text-accent transition-all"
            >
              Login
            </button>
            <button 
              onClick={() => navigate('/signin')}
              className="px-5 py-2 bg-accent text-white rounded-lg font-semibold hover:opacity-90 hover:-translate-y-0.5 hover:shadow-lg transition-all"
            >
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-8 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="text-5xl lg:text-6xl font-black text-gray-900 dark:text-white leading-tight mb-6">
            Your Health, Our Priority
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed max-w-lg">
            Experience intelligent healthcare management with MediLink. Connect with doctors, manage appointments, and track your health journey—all in one secure platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <button 
              onClick={() => navigate('/signin')}
              className="px-8 py-4 bg-gradient-to-r from-accent to-purple-600 text-white rounded-lg font-bold hover:-translate-y-1 hover:shadow-xl transition-all"
            >
              Get Started
            </button>
            <button className="px-8 py-4 bg-accent/10 text-accent border-2 border-accent rounded-lg font-bold hover:bg-accent hover:text-white transition-all">
              Learn More
            </button>
          </div>

          <div className="flex gap-8">
            {[
              { number: '10K+', label: 'Active Users' },
              { number: '500+', label: 'Licensed Doctors' },
              { number: '99.9%', label: 'Uptime' },
            ].map((stat, idx) => (
              <div key={idx}>
                <div className="text-3xl font-bold text-accent">{stat.number}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center items-center">
          <div className="relative w-80 h-80 bg-gradient-to-br from-accent/10 to-accent/5 rounded-3xl border-2 border-accent/50 flex items-center justify-center overflow-hidden group">
            <div className="absolute w-full h-full bg-gradient-radial from-accent/10 to-transparent opacity-50 animate-glow"></div>
            <span className="text-8xl animate-bounce relative z-10">👨‍⚕️</span>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="max-w-7xl mx-auto px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Our Smart Services
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Comprehensive healthcare solutions designed for modern patients
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: '📅',
              title: 'Smart Appointment Booking',
              description: 'Book appointments with verified doctors 24/7. Real-time availability and instant confirmations.',
            },
            {
              icon: '💬',
              title: 'Video Consultations',
              description: 'Secure video consultations from home. Connect with specialists without travel delays.',
            },
            {
              icon: '📋',
              title: 'Medical Records',
              description: 'Centralized access to all your medical history, prescriptions, and reports in one place.',
            },
            {
              icon: '🤖',
              title: 'AI Symptom Checker',
              description: 'Get preliminary health insights powered by AI. Helps you understand your symptoms better.',
            },
            {
              icon: '💊',
              title: 'Prescription Management',
              description: 'Digital prescriptions with easy refill options and pharmacy integration for convenience.',
            },
            {
              icon: '📊',
              title: 'Health Analytics',
              description: 'Track your health metrics over time with personalized insights and recommendations.',
            },
          ].map((service, idx) => (
            <div
              key={idx}
              className="p-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl hover:-translate-y-3 hover:border-accent hover:shadow-xl transition-all duration-300"
            >
              <div className="text-5xl mb-4">{service.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                {service.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="max-w-7xl mx-auto px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
              Why Choose MediLink?
            </h2>

            <div className="space-y-6">
              {[
                {
                  title: 'HIPAA Compliant & Secure',
                  desc: 'Enterprise-grade encryption ensures your medical data is always protected',
                },
                {
                  title: 'Verified Healthcare Professionals',
                  desc: 'All doctors are licensed and verified with extensive background checks',
                },
                {
                  title: '24/7 Customer Support',
                  desc: 'Round-the-clock support team ready to assist you anytime',
                },
                {
                  title: 'Affordable Healthcare',
                  desc: 'Transparent pricing with no hidden fees, making quality healthcare accessible',
                },
              ].map((benefit, idx) => (
                <div key={idx} className="flex gap-4 items-start">
                  <div className="w-6 h-6 bg-accent text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 mt-1">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                      {benefit.title}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      {benefit.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center">
            <div className="relative w-96 h-96 bg-gradient-to-br from-accent/10 to-accent/5 rounded-3xl border-2 border-accent/50 flex items-center justify-center overflow-hidden">
              <div className="absolute w-full h-full bg-gradient-radial from-accent/10 to-transparent opacity-50 animate-glow"></div>
              <span className="text-9xl relative z-10">🔒</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Get started with MediLink in just 4 simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { step: '1', title: 'Sign Up', description: 'Create your account and set up your health profile' },
            { step: '2', title: 'Browse Doctors', description: 'Search for specialists based on your needs' },
            { step: '3', title: 'Book Appointment', description: 'Choose your preferred time and schedule instantly' },
            { step: '4', title: 'Consult & Recover', description: 'Meet with your doctor and get personalized care' },
          ].map((item, idx) => (
            <div
              key={idx}
              className="text-center p-8 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-accent hover:-translate-y-2 transition-all duration-300"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-accent to-purple-600 text-white text-2xl font-bold rounded-full flex items-center justify-center mx-auto mb-4">
                {item.step}
              </div>
              <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {item.title}
              </h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-8 py-16 mb-24">
        <div className="bg-gradient-to-r from-accent to-purple-600 rounded-3xl p-16 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Transform Your Healthcare Experience?
          </h2>
          <p className="text-xl mb-8 opacity-95">
            Join thousands of patients who trust MediLink for their healthcare needs
          </p>
          <button 
            onClick={() => navigate('/signin')}
            className="px-10 py-3 bg-white text-accent font-bold rounded-lg hover:-translate-y-1 hover:shadow-2xl transition-all"
          >
            Start Your Journey Today
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700 py-16 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                MediLink
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                Making intelligent healthcare accessible to everyone
              </p>
            </div>

            <div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Quick Links
              </h4>
              <ul className="space-y-2">
                {['Services', 'About Us', 'Contact'].map((link) => (
                  <li key={link}>
                    <a
                      href={`#${link.toLowerCase()}`}
                      className="text-gray-600 dark:text-gray-400 hover:text-accent transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Legal
              </h4>
              <ul className="space-y-2">
                {['Privacy Policy', 'Terms of Service', 'Compliance'].map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-gray-600 dark:text-gray-400 hover:text-accent transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Follow Us
              </h4>
              <div className="flex gap-4">
                {[
                  { label: 'f', href: '#facebook' },
                  { label: '𝕏', href: '#twitter' },
                  { label: 'in', href: '#linkedin' },
                  { label: '📷', href: '#instagram' },
                ].map((social) => (
                  <a
                    key={social.href}
                    href={social.href}
                    className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center hover:bg-accent/10 hover:text-accent transition-all"
                    aria-label={social.label}
                  >
                    {social.label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-8 text-center text-gray-600 dark:text-gray-400">
            <p>&copy; 2026 MediLink. All rights reserved. | Designed for your health, built with care.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

