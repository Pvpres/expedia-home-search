import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Menu, X, MessageSquare } from 'lucide-react';

export default function GlobalNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showTripDropdown, setShowTripDropdown] = useState(false);

  return (
    <header className="w-full">
      <nav className="bg-white text-gray-800 shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center">
                <div className="flex items-center">
                  <svg viewBox="0 0 180 40" className="h-8 w-auto">
                    <text x="0" y="30" fontFamily="Arial, sans-serif" fontSize="28" fontWeight="bold">
                      <tspan fill="#1a1a6c">expedia</tspan>
                    </text>
                    <circle cx="168" cy="12" r="4" fill="#FBBF24" />
                  </svg>
                </div>
              </Link>

              <div className="hidden lg:flex items-center gap-1">
                <div className="relative">
                  <button
                    className="flex items-center gap-1 px-3 py-2 rounded-full hover:bg-gray-100 text-sm font-medium transition-colors text-gray-800"
                    onMouseEnter={() => setShowTripDropdown(true)}
                    onMouseLeave={() => setShowTripDropdown(false)}
                  >
                    <span>Shop travel</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  {showTripDropdown && (
                    <div
                      className="absolute top-full left-0 mt-1 bg-white text-gray-800 rounded-lg shadow-xl py-2 w-48 z-50"
                      onMouseEnter={() => setShowTripDropdown(true)}
                      onMouseLeave={() => setShowTripDropdown(false)}
                    >
                      <DropdownItem label="Stays" />
                      <DropdownItem label="Flights" />
                      <DropdownItem label="Cars" />
                      <DropdownItem label="Packages" />
                      <DropdownItem label="Things to do" />
                      <DropdownItem label="Cruises" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-4">
              <button className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                <span>USD</span>
              </button>
              <button className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                List your property
              </button>
              <button className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                Support
              </button>
              <button className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                Trips
              </button>
              <button className="p-2 text-gray-700 hover:text-gray-900 transition-colors">
                <MessageSquare className="w-5 h-5" />
              </button>
              <div className="w-8 h-8 rounded-full bg-blue-900 text-white flex items-center justify-center text-sm font-semibold">
                P
              </div>
            </div>

            <button
              className="lg:hidden text-gray-800 p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-200 py-4 px-4">
            <div className="flex flex-col gap-2">
              <MobileNavLink label="Shop travel" />
              <MobileNavLink label="List your property" />
              <MobileNavLink label="Support" />
              <MobileNavLink label="Trips" />
            </div>
          </div>
        )}
      </nav>
    </header>
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
    <button className="text-left px-3 py-2 rounded-lg hover:bg-gray-100 text-sm font-medium text-gray-800 transition-colors">
      {label}
    </button>
  );
}
