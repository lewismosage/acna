import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, Search, Home } from 'lucide-react';
import ACNALogo from '../../assets/ACNA.jpg';

const topNav = [
  { name: 'About Us', href: '/About' },
  { name: 'Contact us', href: '/contact' },
  { name: 'Forum', href: '/forums' },
  { name: 'Help', href: '/help' },
  { name: 'Get Involved', href: '/get-involved' },
  { name: 'Login', href: '/login' },
  { name: 'Donate', href: '/donate' },
];

const mainNav = [
  { name: 'Home', href: '/' },
  {
    name: 'Education',
    items: [
      { name: 'Research Papers', href: '/research-papers' },
      { name: 'Ongoing research projects', href: '/ongoing-research-projects' },
      { name: 'Case Studies', href: '/case-studies' },
      { name: 'Policy Briefs and Recommendations', href: '/policy-briefs' },
      { name: 'Workshops and Conferences', href: '/workshops-and-conferences' },
      { name: 'Position statements on child neurology issues in Africa', href: '/position-statements' },
      { name: 'Fact Sheets', href: '/fact-sheets' },
      { name: 'Conference Presentations and Reports', href: '/conference-presentations' },
      { name: 'E-Booklets', href: '/e-booklets' },
      { name: 'Patient and caregiver resources', href: '/patient-caregiver-resources' },
      { name: 'Fellowships and training resources', href: '/fellowships-training-resources' },
      { name: 'Opportunities for collaboration', href: '/collaboration-opportunities' },
      { name: 'Journal Watch', href: '/journal-watch' },
      { name: 'Webinars', href: '/webinars' },
    ],
  },
  {
    name: 'Events and News',
    items: [
      { name: 'News & Publications', href: '/news' },
      { name: 'Upcoming Events', href: '/upcoming-events' },
      { name: 'Past Events', href: '/past-events' },
      { name: 'Annual Conference', href: '/annual-conference' },
      { name: 'Workshops', href: '/workshops' },
      { name: 'Webinars', href: '/webinars' },
      { name: 'Symposiums', href: '/symposiums' },
      { name: 'Conferences', href: '/conferences' },
      { name: 'Meetings', href: '/meetings' },
      { name: 'Call for Abstracts', href: '/call-for-abstracts'},
      { name: 'Awards & Recognition', href: '/awards' },
      { name: 'Gallery', href: '/gallery' },
    ],
  },
  {
    name: 'Membership',
    items: [
      { name: 'Membership Benefits', href: '/membership-benefits' },
      { name: 'Membership Categories', href: '/membership-categories' },
      { name: 'Membership Fees', href: '/membership-fees' },
      { name: 'Membership Application', href: '/membership-application' },
      { name: 'Membership Renewal', href: '/membership-renewal' },
      { name: 'Membership Upgrade', href: '/membership-upgrade' },
      { name: 'Membership Directory', href: '/membership-directory' },
      { name: 'Membership FAQs', href: '/membership-faqs' },
    ],
  },
];

const Header = () => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isTopMenuOpen, setIsTopMenuOpen] = useState(false);
  const [isMainMenuOpen, setIsMainMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="w-full z-50 relative">
      {/* Top Bar */}
      <div className="bg-gradient-to-b from-blue-600 to-blue-400 text-white text-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-1">
          <div className="flex items-center space-x-2">
            <Home className="w-4 h-4 text-white" />
            <span className="font-semibold">Welcome to Africa Child Neurology</span>
          </div>
          <nav className="hidden md:flex space-x-6">
            {topNav.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="hover:underline hover:text-yellow-200 transition"
              >
                {item.name}
              </Link>
            ))}
          </nav>
          <button
            className="md:hidden text-white"
            onClick={() => setIsTopMenuOpen((v) => !v)}
          >
            {isTopMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="bg-[#142544]">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            {/* Logo and Site Name */}
            <div className="flex items-center justify-between md:justify-start space-x-3 mb-4 md:mb-0">
              <div className="flex items-center space-x-3">
                <Link to="/">
                  <img src={ACNALogo} alt="ACNA Logo" className="w-12 h-12 rounded object-cover cursor-pointer" />
                </Link>
                <div>
                  <div className="text-3xl font-bold text-white underline">ACNA</div>
                  <div className="text-base text-gray-200">Official Website of The ACNA</div>
                </div>
              </div>
              <button
                className="md:hidden text-white"
                onClick={() => setIsMainMenuOpen((v) => !v)}
              >
                {isMainMenuOpen ? <X /> : <Menu />}
              </button>
            </div>

            {/* Main Nav */}
            <nav className={`${isMainMenuOpen ? 'block' : 'hidden'} md:block flex-1 md:flex md:justify-center`}>
              <div className="flex flex-col md:flex-row md:space-x-0">
                {mainNav.map((item) =>
                  item.items ? (
                    <div
                      key={item.name}
                      className="relative group"
                      onMouseEnter={() => setOpenDropdown(item.name)}
                      onMouseLeave={() => setOpenDropdown(null)}
                    >
                      <button
                        className={`w-full md:w-auto text-left px-4 py-2 font-bold text-white bg-red-700 hover:bg-red-800 transition rounded-none border-0 flex items-center justify-between md:justify-center ${
                          openDropdown === item.name ? 'bg-red-800' : ''
                        }`}
                        onClick={() => setOpenDropdown(openDropdown === item.name ? null : item.name)}
                      >
                        {item.name}
                        <ChevronDown className="w-4 h-4 ml-1" />
                      </button>
                      {openDropdown === item.name && (
                        <div
                          className={`
                            md:absolute left-0 mt-0 md:mt-1 w-full md:w-[600px] bg-black shadow-lg rounded z-50
                            grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6 p-2 md:p-6
                          `}
                        >
                          {item.items.map((sub) => (
                            <Link
                              key={sub.name}
                              to={sub.href}
                              className="block px-2 py-1 text-gray-200 hover:text-yellow-300 hover:underline transition text-base"
                              onClick={() => {
                                setOpenDropdown(null);
                                setIsMainMenuOpen(false);
                              }}
                            >
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`w-full md:w-auto text-left px-4 py-2 font-bold ${
                        isActive(item.href)
                          ? 'bg-black text-white'
                          : 'bg-red-700 text-white hover:bg-red-800'
                      } transition rounded-none border-0`}
                      onClick={() => setIsMainMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  )
                )}
              </div>
              
              {/* Mobile Search - Now inside the dropdown */}
              <div className="md:hidden mt-4">
                <form className="flex items-center bg-white rounded-lg overflow-hidden shadow w-full">
                  <input
                    type="text"
                    placeholder="Search ..."
                    className="px-4 py-2 w-full text-gray-700 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 flex items-center font-semibold"
                  >
                    <Search className="w-5 h-5 mr-1" />
                    Search
                  </button>
                </form>
              </div>
            </nav>

            {/* Search Bar - Desktop (unchanged) */}
            <form className="hidden md:flex items-center bg-white rounded-lg overflow-hidden shadow max-w-xs w-full ml-4">
              <input
                type="text"
                placeholder="Search ..."
                className="px-4 py-2 w-full text-gray-700 focus:outline-none"
              />
              <button
                type="submit"
                className="bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 flex items-center font-semibold"
              >
                <Search className="w-5 h-5 mr-1" />
                Search
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown for top nav */}
      {isTopMenuOpen && (
        <div className="md:hidden bg-blue-700 text-white px-4 py-2 space-y-2">
          {topNav.map((item) => (
            <Link 
              key={item.name} 
              to={item.href} 
              className="block py-1"
              onClick={() => setIsTopMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
};

export default Header;