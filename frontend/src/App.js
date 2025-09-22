import React, { useState, useEffect, createContext, useContext } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Theme Context
const ThemeContext = createContext();

const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme) {
      setDarkMode(JSON.parse(savedTheme));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Components
const Header = () => {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <header className="bg-white dark:bg-gray-900 shadow-lg transition-colors duration-300">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">ST</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">Summit IT</span>
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link to="/" className="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Home
              </Link>
              <Link to="/about" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                About
              </Link>
              <Link to="/projects" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Projects
              </Link>
              <Link to="/appointments" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Book Appointment
              </Link>
              <Link to="/admin" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Admin
              </Link>
            </div>
          </div>

          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </nav>
    </header>
  );
};

const Footer = () => {
  return (
    <footer className="bg-gray-900 dark:bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">ST</span>
              </div>
              <span className="text-xl font-bold">Summit IT</span>
            </div>
            <p className="text-gray-300 text-sm">
              Mobile IT Services - On-site computer repair, networking, and business IT support. We come to you.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <p>📞 Phone: Coming Soon</p>
              <p>📧 Email: johnhamson17@gmail.com</p>
              <p>📍 Service Area: Local Area</p>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <p>• PC/Laptop Repair</p>
              <p>• Wi-Fi & Networking</p>
              <p>• Custom PC Builds</p>
              <p>• Business IT Support</p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 flex justify-between items-center">
          <p className="text-sm text-gray-400">
            &copy; 2024 Summit IT Services. All rights reserved.
          </p>
          <Link
            to="/admin"
            className="text-gray-500 hover:text-gray-300 transition-colors"
            title="Admin Access"
          >
            <span className="text-lg">⚙️</span>
          </Link>
        </div>
      </div>
    </footer>
  );
};

const Home = () => {
  const [services, setServices] = useState([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get(`${API}/services`);
        setServices(response.data);
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    };
    fetchServices();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-800 dark:to-blue-900 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Summit IT
                <span className="block text-blue-200">Mobile IT Services</span>
              </h1>
              <p className="text-xl mb-8 text-blue-100">
                On-site computer repair, networking, and business IT support. We come to you.
              </p>
              <div className="space-x-4">
                <Link
                  to="/appointments"
                  className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-lg"
                >
                  Book Appointment
                </Link>
                <Link
                  to="/about"
                  className="inline-block border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
                >
                  Learn More
                </Link>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1649768870222-17848797d6b4"
                alt="Professional IT Technician"
                className="rounded-lg shadow-2xl w-full h-96 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Our Services
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Professional IT solutions delivered directly to your location
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <div key={service.id} className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                  {service.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Summit IT?
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">🚗</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Mobile & On-Site</h3>
              <p className="text-gray-600 dark:text-gray-300">
                We come to your location - home or office. No need to disconnect and transport your equipment.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">💎</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Transparent Pricing</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Clear, upfront pricing with no hidden fees. You'll know the cost before we start any work.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">👨‍💻</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Personal Support</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Direct access to experienced technicians who understand your unique needs and requirements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              What Our Clients Say
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold">JD</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">John Doe</h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Small Business Owner</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 italic">
                "Summit IT saved our business when our network went down. They were on-site within hours and had everything running smoothly. Professional and reliable!"
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold">SM</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Sarah Miller</h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Home User</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 italic">
                "Amazing service! They built me a custom PC for my graphic design work. Great communication and fair pricing. Highly recommended!"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-blue-600 dark:bg-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Book your appointment today and let us solve your IT challenges.
          </p>
          <Link
            to="/appointments"
            className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-lg text-lg"
          >
            Schedule Your Service
          </Link>
        </div>
      </section>
    </div>
  );
};

const About = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            About Summit IT
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Helping individuals and small businesses with reliable, on-site IT support.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <img
              src="https://images.unsplash.com/photo-1580982330720-bd5e0fed108b"
              alt="Professional IT workspace"
              className="rounded-lg shadow-lg w-full h-64 object-cover"
            />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Our Story
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Summit IT was founded with a simple mission: to provide reliable, professional IT services 
              directly to your location. We understand that technology problems don't wait for convenient 
              times, and neither do we.
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              With years of experience in PC building, networking, and troubleshooting, we bring enterprise-level 
              expertise to individuals and small businesses at affordable prices.
            </p>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Our Mission
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 text-center max-w-3xl mx-auto">
            To provide exceptional, on-site IT services that keep individuals and businesses running smoothly. 
            We believe technology should work for you, not against you, and we're here to make that happen 
            with personalized, professional support.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">⚡</span>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Fast Response</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Quick response times to minimize your downtime and get you back up and running.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">🔧</span>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Expert Solutions</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Experienced technicians with deep knowledge across all areas of IT support and services.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">🤝</span>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Trusted Partnership</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Building long-term relationships with our clients through reliable service and honest communication.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Projects = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8">
          Our Projects & Builds
        </h1>
        
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-12 mb-8">
          <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-white text-4xl">🚀</span>
          </div>
          
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Coming Soon!
          </h2>
          
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
            We're currently building out this section. Soon you'll find examples of custom PC builds, 
            network setups, and client success stories. Check back soon for updates on our latest projects!
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Custom PC Builds
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                High-performance gaming rigs, workstations, and business computers tailored to your needs.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Network Installations
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Complete network setups for homes and small businesses with optimal performance.
              </p>
            </div>
          </div>
        </div>
        
        <Link
          to="/appointments"
          className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Get Started with Your Project
        </Link>
      </div>
    </div>
  );
};

const Appointments = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service_type: '',
    location: '',
    preferred_date: '',
    preferred_time: '',
    description: ''
  });
  const [services, setServices] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get(`${API}/services`);
        setServices(response.data);
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    };
    fetchServices();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const response = await axios.post(`${API}/appointments`, formData);
      if (response.status === 200) {
        setSubmitMessage('Appointment request submitted successfully! We\'ll contact you soon to confirm.');
        setFormData({
          name: '',
          email: '',
          phone: '',
          service_type: '',
          location: '',
          preferred_date: '',
          preferred_time: '',
          description: ''
        });
      }
    } catch (error) {
      console.error('Error submitting appointment:', error);
      setSubmitMessage('Error submitting appointment. Please try again or contact us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Book an Appointment
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Choose a time that works for you. We'll confirm your appointment and come to your location.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Service Type *
                </label>
                <select
                  name="service_type"
                  value={formData.service_type}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select a service</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                placeholder="Your address or service location"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Preferred Date *
                </label>
                <input
                  type="date"
                  name="preferred_date"
                  value={formData.preferred_date}
                  onChange={handleChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Preferred Time *
                </label>
                <select
                  name="preferred_time"
                  value={formData.preferred_time}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select a time</option>
                  <option value="09:00">9:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="12:00">12:00 PM</option>
                  <option value="13:00">1:00 PM</option>
                  <option value="14:00">2:00 PM</option>
                  <option value="15:00">3:00 PM</option>
                  <option value="16:00">4:00 PM</option>
                  <option value="17:00">5:00 PM</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description (Optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                placeholder="Please describe your issue or requirements in detail..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {submitMessage && (
              <div className={`p-4 rounded-md ${submitMessage.includes('Error') ? 'bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300' : 'bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300'}`}>
                {submitMessage}
              </div>
            )}

            <div className="text-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full md:w-auto bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Appointment Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isLogging, setIsLogging] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLogging(true);
    setError('');

    try {
      const response = await axios.post(`${API}/admin/login`, credentials);
      if (response.data.token) {
        localStorage.setItem('adminToken', response.data.token);
        navigate('/admin/dashboard');
      }
    } catch (error) {
      setError('Invalid credentials. Please try again.');
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Admin Login
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Username
              </label>
              <input
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLogging}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
            >
              {isLogging ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin');
      return;
    }

    const fetchAppointments = async () => {
      try {
        const response = await axios.get(`${API}/appointments`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAppointments(response.data);
      } catch (error) {
        if (error.response?.status === 401) {
          localStorage.removeItem('adminToken');
          navigate('/admin');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [navigate]);

  const handleStatusUpdate = async (appointmentId, status, notes = '', confirmedDate = '', confirmedTime = '') => {
    const token = localStorage.getItem('adminToken');
    try {
      const updateData = { status };
      if (notes) updateData.admin_notes = notes;
      if (confirmedDate) updateData.confirmed_date = confirmedDate;
      if (confirmedTime) updateData.confirmed_time = confirmedTime;

      await axios.put(`${API}/appointments/${appointmentId}`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setAppointments(appointments.map(apt => 
        apt.id === appointmentId 
          ? { ...apt, status, admin_notes: notes, confirmed_date: confirmedDate, confirmed_time: confirmedTime }
          : apt
      ));
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin');
  };

  const filteredAppointments = appointments.filter(apt => {
    const matchesFilter = filter === 'all' || apt.status === filter;
    const matchesSearch = apt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         apt.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredAppointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {appointment.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-300">
                        {appointment.email}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-300">
                        {appointment.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {appointment.service_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      <div>{appointment.preferred_date}</div>
                      <div>{appointment.preferred_time}</div>
                      {appointment.confirmed_date && (
                        <div className="text-green-600 dark:text-green-400 font-medium">
                          Confirmed: {appointment.confirmed_date} {appointment.confirmed_time}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                        appointment.status === 'confirmed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                        appointment.status === 'completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                      }`}>
                        {appointment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {appointment.status === 'pending' && (
                        <button
                          onClick={() => handleStatusUpdate(appointment.id, 'confirmed')}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                        >
                          Confirm
                        </button>
                      )}
                      {appointment.status === 'confirmed' && (
                        <button
                          onClick={() => handleStatusUpdate(appointment.id, 'completed')}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Complete
                        </button>
                      )}
                      <button
                        onClick={() => handleStatusUpdate(appointment.id, 'cancelled')}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredAppointments.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No appointments found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <div className="App">
        <BrowserRouter>
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/appointments" element={<Appointments />} />
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
            </Routes>
          </main>
          <Footer />
        </BrowserRouter>
      </div>
    </ThemeProvider>
  );
}

export default App;