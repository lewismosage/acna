import React from 'react';
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Donation Section */}
        <div className="text-center mb-12">
          <h3 className="text-lg font-semibold mb-4 text-white-700 uppercase">
            Join the Movement to Make Health Care Accessible for Everyone
          </h3>
          <Link
            to="/donate"
            className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded font-semibold transition-colors uppercase text-sm inline-block"
          >
            Donate Now
          </Link>
        </div>

        {/* Footer Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* News and Media */}
          <div>
            <h3 className="text-sm font-bold mb-4 text-orange-600 uppercase tracking-wide">News and Media</h3>
            <ul className="space-y-2">
              <li><a href="/news" className="text-white-500 transition-colors text-sm uppercase">News & Press Releases</a></li>
              <li><a href="/gallery" className="text-white-500 transition-colors text-sm uppercase">Media Coverage</a></li>
              <li><a href="/events" className="text-white-500 transition-colors text-sm uppercase">EVENTS</a></li>
              <li><a href="/awards" className="text-white-500 transition-colors text-sm uppercase">Awards & Recognitions</a></li>
              <li><a href="/annual-conference" className="text-white-500 transition-colors text-sm uppercase">Annual Conference & Meetings</a></li>
            </ul>
          </div>

          {/* Get in Touch */}
          <div>
            <h3 className="text-sm font-bold mb-4 text-orange-600 uppercase tracking-wide">Get in Touch</h3>
            <ul className="space-y-2">
              <li><a href="/contact" className="text-white-500 transition-colors text-sm uppercase">Contact Us</a></li>
              <li><a href="/careers" className="text-white-500 transition-colors text-sm uppercase">CAREERS</a></li>
              <li><a href="/get-involved" className="text-white-500 transition-colors text-sm uppercase">get involved</a></li>
              <li><a href="/ethics-reporting" className="text-white-500 transition-colors text-sm uppercase">Ethics Reporting</a></li>
            </ul>
          </div>

          {/* About ACNA */}
          <div>
            <h3 className="text-sm font-bold mb-4 text-orange-600 uppercase tracking-wide">About ACNA®</h3>
            <ul className="space-y-2">
              <li><a href="/about/what-we-do" className="text-white-500 transition-colors text-sm uppercase">WHAT WE DO</a></li>
              <li><a href="/about/how-we-work" className="text-white-500 transition-colors text-sm uppercase">HOW WE WORK</a></li>
              <li><a href="/about/our-story" className="text-white-500 transition-colors text-sm uppercase">OUR STORY</a></li>
              <li><a href="/faqs" className="text-white-500 transition-colors text-sm uppercase">FAQs</a></li>
            </ul>
          </div>

          {/* Privacy */}
          <div>
            <h3 className="text-sm font-bold mb-4 text-orange-600 uppercase tracking-wide">Privacy</h3>
            <ul className="space-y-2">
              <li><a href="/donor-privacy-policy" className="text-white-500 transition-colors text-sm uppercase">Donor Privacy Policy</a></li>
              <li><a href="/privacy-policy" className="text-white-500 transition-colors text-sm uppercase">Terms and Conditions</a></li>
              <li><a href="/privacy-policy" className="text-white-500 transition-colors text-sm uppercase">Privacy Policy</a></li>
              <li><a href="/cookie-policy" className="text-white-500 transition-colors text-sm uppercase">Cookie Policy</a></li>
            </ul>
          </div>
        </div>

        {/* Divider Line */}
        <div className="border-t border-white my-8"></div>

        {/* Organization Info and Contact */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Left - Organization Info */}
          <div className="text-center md:text-left">
            <p className="text-white-600 text-sm mb-2">
             Africa Child Neurology Association (ACNA) 
            </p>
            <p className="text-white-600 text-sm">
             is a 501(c)(3) nonprofit corporation, EIN 01-123456
            </p>
          </div>

          {/* Center - Address and Contact */}
          <div className="text-center">
            <p className="text-white-600 text-sm mb-1"> Africa Child Neurology Association, Suite 8,</p>
            <p className="text-white-600 text-sm mb-1">5th Avenue Suites 6th Floor, Nairobi, Kenya</p>
            <p className="text-white-600 text-sm">
             +254 123 456 789 • <a href="mailto:info@acna.org" className="text-blue-500 hover:text-orange-600">info@acna.africa.org</a>
            </p>
          </div>

          {/* Right - Copyright */}
          <div className="text-center md:text-right">
            <p className="text-white-600 text-sm mb-1">
              ACNA® is a registered trademark of the Africa Child Neurology Association.
            </p>
            <p className="text-white-600 text-sm mb-1">© 2009-2025 Africa Child Neurology Association.</p>
            <p className="text-white-600 text-sm">All Rights Reserved.</p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Donation Address */}
          <div className="mb-4 md:mb-0">
            <p className="text-white-600 text-sm">
              Please send donations to: Africa Child Neurology Association, PO Box 00100, KE 00100-12345
            </p>
          </div>

          {/* Social Media Icons */}
          <div className="flex space-x-4">
            <a href="#" className="text-orange-600 hover:text-orange-800 transition-colors">
              <div className="w-8 h-8 bg-orange-600 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">X</span>
              </div>
            </a>
            <a href="#" className="text-orange-600 hover:text-orange-800 transition-colors">
              <Instagram className="w-8 h-8 text-orange-600" />
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-800 transition-colors">
              <Facebook className="w-8 h-8 text-white" />
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-800 transition-colors">
              <Youtube className="w-8 h-8 text-red-600" />
            </a>
            <a href="#" className="text-white hover:text-gray-800 transition-colors">
              <Linkedin className="w-8 h-8 text-blue-600" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;