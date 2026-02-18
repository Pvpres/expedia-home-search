import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Globe, ChevronDown, Menu, X, User, Heart, Briefcase, HelpCircle, Phone } from 'lucide-react';

export default function GlobalNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showTripDropdown, setShowTripDropdown] = useState(false);

  return (
    <header className="w-full">
      <div className="bg-blue-900 text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <a href="#" className="hover:underline flex items-center gap-1">
              <Phone className="w-3 h-3" />
              <span>1-800-EXPEDIA</span>
            </a>
            <a href="#" className="hover:underline flex items-center gap-1">
              <HelpCircle className="w-3 h-3" />
              <span>Support</span>
            </a>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:underline flex items-center gap-1">
              <Globe className="w-3 h-3" />
              <span>English</span>
            </a>
            <span className="text-blue-300">|</span>
            <span>List your property</span>
            <span className="text-blue-300">|</span>
            <span>Trips</span>
          </div>
        </div>
      </div>

      <nav className="bg-blue-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center">
                <div className="flex items-center">
                  <svg viewBox="0 0 180 40" className="h-8 w-auto fill-current text-yellow-400">
                    <text x="0" y="30" fontFamily="Arial, sans-serif" fontSize="28" fontWeight="bold">
                      <tspan fill="#FBBF24">expedia</tspan>
                    </text>
                    <circle cx="168" cy="12" r="4" fill="#FBBF24" />
                  </svg>
                </div>
              </Link>

              <div className="hidden lg:flex items-center gap-1">
                <NavLink label="Stays" />
                <NavLink label="Flights" />
                <NavLink label="Cars" />
                <NavLink label="Packages" />
                <NavLink label="Things to do" />
                <NavLink label="Cruises" />
                <div className="relative">
                  <button
                    className="flex items-center gap-1 px-3 py-2 rounded-full hover:bg-blue-700 text-sm font-medium transition-colors"
                    onMouseEnter={() => setShowTripDropdown(true)}
                    onMouseLeave={() => setShowTripDropdown(false)}
                  >
                    <span>More</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  {showTripDropdown && (
                    <div
                      className="absolute top-full left-0 mt-1 bg-white text-gray-800 rounded-lg shadow-xl py-2 w-48 z-50"
                      onMouseEnter={() => setShowTripDropdown(true)}
                      onMouseLeave={() => setShowTripDropdown(false)}
                    >
                      <DropdownItem label="Deals" />
                      <DropdownItem label="Groups & meetings" />
                      <DropdownItem label="Vacations" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-3">
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-full hover:bg-blue-700 text-sm font-medium transition-colors">
                <Heart className="w-4 h-4" />
                <span>Favorites</span>
              </button>
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-full hover:bg-blue-700 text-sm font-medium transition-colors">
                <Briefcase className="w-4 h-4" />
                <span>My Trips</span>
              </button>
              <button className="flex items-center gap-1.5 bg-white text-blue-800 px-4 py-2 rounded-full text-sm font-semibold hover:bg-gray-100 transition-colors">
                <User className="w-4 h-4" />
                <span>Sign in</span>
              </button>
            </div>

            <button
              className="lg:hidden text-white p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden bg-blue-700 border-t border-blue-600 py-4 px-4">
            <div className="flex flex-col gap-2">
              <MobileNavLink label="Stays" />
              <MobileNavLink label="Flights" />
              <MobileNavLink label="Cars" />
              <MobileNavLink label="Packages" />
              <MobileNavLink label="Things to do" />
              <MobileNavLink label="Cruises" />
              <MobileNavLink label="Deals" />
              <hr className="border-blue-600 my-2" />
              <MobileNavLink label="My Trips" />
              <MobileNavLink label="Favorites" />
              <MobileNavLink label="Sign in" />
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

function NavLink({ label }: { label: string }) {
  return (
    <button className="px-3 py-2 rounded-full hover:bg-blue-700 text-sm font-medium transition-colors">
      {label}
    </button>
  );
}

function DropdownItem({ label }: { label: string }) {
  return (
    <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors">
      {label}
    </button>
  );
}

function MobileNavLink({ label }: { label: string }) {
  return (
    <button className="text-left px-3 py-2 rounded-lg hover:bg-blue-600 text-sm font-medium transition-colors">
      {label}
    </button>
  );
}
