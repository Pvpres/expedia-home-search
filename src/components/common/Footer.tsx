import { Globe } from 'lucide-react';

const FOOTER_LINKS = {
  'Company': ['About', 'Jobs', 'Partnerships', 'Press Room', 'Investor Relations', 'Advertising'],
  'Explore': ['United States travel guide', 'Hotels in United States', 'Vacation rentals', 'Vacation packages', 'Domestic flights', 'Car rentals'],
  'Policies': ['Privacy policy', 'Terms of use', 'Vrbo terms and conditions', 'Accessibility'],
  'Help': ['Support', 'Cancel your hotel or vacation rental booking', 'Cancel your flight', 'Refund timelines, policies & processes', 'Use a coupon', 'International travel documents'],
};

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-white text-sm font-bold mb-3">{category}</h4>
              <ul className="space-y-2">
                {links.map(link => (
                  <li key={link}>
                    <a href="#" className="text-xs hover:text-white transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 120 30" className="h-6 w-auto">
                <text x="0" y="22" fontFamily="Arial, sans-serif" fontSize="20" fontWeight="bold" fill="#FBBF24">
                  expedia
                </text>
              </svg>
              <span className="text-xs text-gray-500 ml-4">Expedia, Inc. is not responsible for content on external web sites.</span>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <button className="flex items-center gap-1 hover:text-white transition-colors">
                <Globe className="w-3.5 h-3.5" />
                United States
              </button>
              <span className="text-gray-700">|</span>
              <span>USD</span>
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-4 text-center">
            &copy; {new Date().getFullYear()} Expedia, Inc., an Expedia Group company. All rights reserved. Expedia and the Airplane logo are trademarks or registered trademarks of Expedia, Inc.
          </p>
        </div>
      </div>
    </footer>
  );
}
