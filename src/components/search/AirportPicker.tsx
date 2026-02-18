import { useState, useRef, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { Airport } from '../../types';
import { AIRPORTS } from '../../constants/airports';

interface AirportPickerProps {
  label: string;
  selected: Airport | null;
  onSelect: (airport: Airport) => void;
  placeholder: string;
}

export default function AirportPicker({ label, selected, onSelect, placeholder }: AirportPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filtered = AIRPORTS.filter(a => {
    const q = query.toLowerCase();
    return (
      a.code.toLowerCase().includes(q) ||
      a.city.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q) ||
      a.country.toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (airport: Airport) => {
    onSelect(airport);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div className="relative flex-1" ref={dropdownRef}>
      <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
      <div
        className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2.5 bg-white cursor-pointer hover:border-blue-500 transition-colors"
        onClick={() => {
          setIsOpen(true);
          setTimeout(() => inputRef.current?.focus(), 50);
        }}
      >
        <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
        {isOpen ? (
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={placeholder}
            className="flex-1 outline-none text-sm bg-transparent"
          />
        ) : (
          <span className={`text-sm truncate ${selected ? 'text-gray-900' : 'text-gray-400'}`}>
            {selected ? `${selected.city} (${selected.code})` : placeholder}
          </span>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 max-h-64 overflow-y-auto z-50">
          {filtered.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500">No airports found</div>
          ) : (
            filtered.map(airport => (
              <button
                key={airport.code}
                className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors flex items-start gap-3 border-b border-gray-50 last:border-0"
                onClick={() => handleSelect(airport)}
              >
                <div className="bg-blue-100 text-blue-700 font-mono font-bold text-xs px-2 py-1 rounded mt-0.5">
                  {airport.code}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">{airport.city}</div>
                  <div className="text-xs text-gray-500">{airport.name}</div>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
