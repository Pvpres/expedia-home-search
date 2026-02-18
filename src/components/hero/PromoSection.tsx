import { Heart } from 'lucide-react';

const DEALS = [
  { name: 'Cancún Resort', location: 'Mexico', price: '$247', originalPrice: '$412', vip: false, image: 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=400&h=280&fit=crop' },
  { name: 'Paris Hotel', location: 'France', price: '$489', originalPrice: '$815', vip: true, image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=280&fit=crop' },
  { name: 'Tokyo Stay', location: 'Japan', price: '$672', originalPrice: '$1,120', vip: true, image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=280&fit=crop' },
  { name: 'London Suite', location: 'United Kingdom', price: '$398', originalPrice: '$663', vip: true, image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=280&fit=crop' },
];

export default function PromoSection() {
  return (
    <div className="space-y-0">
      <div className="bg-[#1a1a6c] text-white py-8 px-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <span className="text-3xl">&#9992;&#65039;</span>
          <div>
            <h2 className="text-xl font-bold">Annual Vacation Sale</h2>
            <p className="text-sm text-gray-300">Members save up to 40% on select hotels and homes. <a href="#" className="underline text-white font-medium">Book now</a></p>
          </div>
        </div>
      </div>

      <div className="bg-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-yellow-200 via-yellow-100 to-yellow-200 rounded-2xl p-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Members save up to 40% on select stays</h2>
                <p className="text-sm text-gray-600">Showing deals for: Mar 13 - Mar 15</p>
              </div>
              <button className="mt-3 lg:mt-0 border-2 border-blue-800 text-blue-800 px-6 py-2 rounded-full text-sm font-semibold hover:bg-blue-50 transition-colors">
                See more deals
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {DEALS.map(deal => (
                <div
                  key={deal.name}
                  className="group rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow cursor-pointer bg-white"
                >
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={deal.image}
                      alt={deal.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={e => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/400x280/1a1a6c/FFFFFF/png?text=' + deal.name;
                      }}
                    />
                    {deal.vip && (
                      <div className="absolute top-3 left-3 bg-gray-900/80 text-xs font-semibold text-white px-2.5 py-1 rounded">
                        VIP Access
                      </div>
                    )}
                    <button className="absolute top-3 right-3 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors">
                      <Heart className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="text-base font-bold text-gray-900">{deal.name}</h3>
                    <p className="text-sm text-gray-500">{deal.location}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900">{deal.price}</span>
                      <span className="text-xs text-gray-400 line-through">{deal.originalPrice}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
