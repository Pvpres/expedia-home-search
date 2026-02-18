import { Sparkles, Award, Shield, CreditCard } from 'lucide-react';

const DESTINATIONS = [
  { city: 'Cancún', country: 'Mexico', price: 'from $247', tag: 'Popular', image: 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=400&h=280&fit=crop' },
  { city: 'Paris', country: 'France', price: 'from $489', tag: 'Trending', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=280&fit=crop' },
  { city: 'Tokyo', country: 'Japan', price: 'from $672', tag: 'Featured', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=280&fit=crop' },
  { city: 'London', country: 'United Kingdom', price: 'from $398', tag: 'Deal', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=280&fit=crop' },
];

const PERKS = [
  { icon: Sparkles, title: 'Bundle & Save', desc: 'Save up to 25% when you book flight + hotel together' },
  { icon: Award, title: 'Expedia Rewards', desc: 'Earn points on every trip. Redeem for discounts on future travel' },
  { icon: Shield, title: 'Free Cancellation', desc: 'Plans change. Book flexible options with free cancellation' },
  { icon: CreditCard, title: 'Price Match', desc: "Find it cheaper? We'll match the price and give you extra credit" },
];

export default function PromoSection() {
  return (
    <div className="max-w-7xl mx-auto px-4 -mt-16 relative z-20 space-y-16 pb-16">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Explore popular destinations</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {DESTINATIONS.map(dest => (
            <div
              key={dest.city}
              className="group rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow cursor-pointer bg-white"
            >
              <div className="relative h-44 overflow-hidden">
                <img
                  src={dest.image}
                  alt={dest.city}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={e => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/400x280/2563EB/FFFFFF/png?text=' + dest.city;
                  }}
                />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-xs font-semibold text-blue-700 px-2.5 py-1 rounded-full">
                  {dest.tag}
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">{dest.city}</h3>
                    <p className="text-sm text-gray-500">{dest.country}</p>
                  </div>
                  <span className="text-sm font-bold text-blue-700">{dest.price}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Why book with Expedia?</h2>
        <p className="text-gray-500 text-center mb-8">Your one-stop shop for flights, hotels, and more</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PERKS.map(perk => (
            <div key={perk.title} className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-3">
                <perk.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 mb-1">{perk.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{perk.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 rounded-2xl p-8 flex flex-col lg:flex-row items-center justify-between gap-6">
        <div>
          <div className="text-xs font-bold text-yellow-800 uppercase tracking-wide mb-1">Limited time offer</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">Save 30% or more on select hotels</h3>
          <p className="text-gray-700">Members get even more with exclusive deals and double points</p>
        </div>
        <button className="bg-blue-700 hover:bg-blue-800 text-white px-8 py-3 rounded-xl font-bold text-sm transition-colors shadow-lg whitespace-nowrap">
          Sign up for free
        </button>
      </div>
    </div>
  );
}
