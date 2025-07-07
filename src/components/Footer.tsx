import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, Mail, Phone, MapPin, Facebook, Twitter, Linkedin } from 'lucide-react';
import ACNALogo from '../assets/ACNA.jpg';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo & About */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-16 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <img
                  src={ACNALogo}
                  alt="ACNA Logo"
                  className="w-18 h-16 rounded object-cover"
                />
              </div>
              <div>
                <div className="text-xl font-bold">ACNA</div>
                <div className="text-sm text-gray-400">Africa Child Neurology Association</div>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed mb-4">
              Advancing child neurology care across Africa through research, education, and professional collaboration.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-gray-300 hover:text-white transition-colors text-sm">About ACNA</Link></li>
              <li><Link to="/membership" className="text-gray-300 hover:text-white transition-colors text-sm">Membership</Link></li>
              <li><Link to="/events" className="text-gray-300 hover:text-white transition-colors text-sm">Events</Link></li>
              <li><Link to="/news" className="text-gray-300 hover:text-white transition-colors text-sm">News & Publications</Link></li>
              <li><Link to="/awards" className="text-gray-300 hover:text-white transition-colors text-sm">Awards</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">Research Guidelines</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">Clinical Protocols</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">Training Materials</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">Conference Archive</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">Member Directory</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300 text-sm">info@acna-africa.org</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300 text-sm">+27 (0) 11 123 4567</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                <span className="text-gray-300 text-sm">
                  Johannesburg, South Africa<br />
                  Regional Offices across Africa
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2024 Africa Child Neurology Association. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;