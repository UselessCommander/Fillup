import React, { useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, Droplet, Info, MapPin, Navigation, Package, Search, SearchX, Star } from 'lucide-react';

const CATEGORIES = ['Alle', 'Shampoo', 'Vaskemiddel', 'Fødevarer', 'Hudpleje', 'Rengøring'];
const MOCK_PLACES = [
  { id: 1, name: 'Løs Market', address: 'Vesterbrogade 120, København', distance: 0.8, rating: 4.8, imageColor: 'bg-emerald-600', description: 'Københavns første emballagefri supermarked. Medbring dine egne beholdere og køb præcis den mængde, du har brug for.', categories: ['Fødevarer', 'Rengøring', 'Shampoo'], products: [{ name: 'Økologisk Havregryn', price: '25 kr / kg', category: 'Fødevarer', inStock: true }, { name: 'Flydende Vaskemiddel (Neutral)', price: '45 kr / L', category: 'Rengøring', inStock: true }, { name: 'Shampoo (Birk & Aloe Vera)', price: '60 kr / L', category: 'Shampoo', inStock: true }, { name: 'Sæbebær', price: '120 kr / kg', category: 'Rengøring', inStock: false }] },
  { id: 2, name: 'Råvarebutikken', address: 'Nørrebrogade 55, København', distance: 1.2, rating: 4.6, imageColor: 'bg-teal-600', description: 'Fokus på økologi og rene råvarer. Stort udvalg af kropspleje og husholdningsartikler i løssalg.', categories: ['Shampoo', 'Hudpleje', 'Vaskemiddel'], products: [{ name: 'Balsam-bar', price: '75 kr / stk', category: 'Hudpleje', inStock: true }, { name: 'Universalrengøring', price: '30 kr / L', category: 'Rengøring', inStock: true }, { name: 'Opvaskemiddel med citrus', price: '35 kr / L', category: 'Vaskemiddel', inStock: true }, { name: 'Bodywash u. parfume', price: '50 kr / L', category: 'Hudpleje', inStock: true }] },
  { id: 3, name: 'EcoKbh Genfyld', address: 'Østerbrogade 102, København', distance: 2.5, rating: 4.9, imageColor: 'bg-blue-500', description: 'Din lokale station for genopfyldning af hverdagsprodukter. Vi fører et bredt udvalg af svanemærkede produkter.', categories: ['Vaskemiddel', 'Rengøring', 'Shampoo'], products: [{ name: 'Color Vaskemiddel', price: '40 kr / L', category: 'Vaskemiddel', inStock: true }, { name: 'Skyllemiddel', price: '25 kr / L', category: 'Vaskemiddel', inStock: true }, { name: 'Hjardemynte Shampoo', price: '55 kr / L', category: 'Shampoo', inStock: true }] },
  { id: 4, name: 'Den Grønne Købmand', address: 'Amagerbrogade 18, København', distance: 3.1, rating: 4.4, imageColor: 'bg-green-500', description: 'Lokal købmand med en voksende afdeling for emballagefri varer og genfyld af basisvarer.', categories: ['Fødevarer'], products: [{ name: 'Basmati Ris', price: '35 kr / kg', category: 'Fødevarer', inStock: true }, { name: 'Røde Linser', price: '28 kr / kg', category: 'Fødevarer', inStock: true }, { name: 'Kaffebønner (Espresso)', price: '180 kr / kg', category: 'Fødevarer', inStock: false }] }
];

const Header = () => (
  <header className="bg-[#1b75bc] text-white p-4 shadow-md sticky top-0 z-10 flex items-center justify-center">
    <div className="flex items-center gap-2"><Droplet className="w-6 h-6 text-[#ffde00]" /><h1 className="text-xl font-bold tracking-wide">REFILL<span className="font-light">DANMARK</span></h1></div>
  </header>
);

const PlaceCard = ({ place, onClick }) => (
  <div onClick={() => onClick(place)} className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex gap-4 cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98]">
    <div className={`w-24 h-24 rounded-lg flex-shrink-0 ${place.imageColor} flex items-center justify-center shadow-inner`}><Package className="w-8 h-8 text-white opacity-50" /></div>
    <div className="flex-1 flex flex-col justify-between">
      <div><h3 className="font-bold text-slate-800 text-lg leading-tight">{place.name}</h3><p className="text-slate-500 text-sm mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> {place.address}</p></div>
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-1 bg-[#1b75bc]/10 text-[#1b75bc] px-2 py-1 rounded-md text-xs font-semibold"><Navigation className="w-3 h-3" />{place.distance} km</div>
        <div className="flex items-center gap-1 text-yellow-500 text-sm font-medium"><Star className="w-4 h-4 fill-current" />{place.rating}</div>
      </div>
    </div>
  </div>
);

const PlaceDetail = ({ place, onBack }) => (
  <div className="min-h-screen bg-slate-50 pb-20">
    <div className="sticky top-0 z-20 bg-white shadow-sm px-4 py-3 flex items-center gap-4"><button onClick={onBack} className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors"><ArrowLeft className="w-6 h-6" /></button><h2 className="font-bold text-lg text-slate-800 line-clamp-1">{place.name}</h2></div>
    <div className={`w-full h-48 ${place.imageColor} relative`}><div className="absolute inset-0 bg-black/20" /><div className="absolute bottom-4 left-4 right-4 text-white"><h1 className="text-2xl font-bold mb-1">{place.name}</h1><p className="flex items-center gap-1 text-sm opacity-90"><MapPin className="w-4 h-4" /> {place.address}</p></div></div>
    <div className="p-4 bg-white shadow-sm mb-4">
      <div className="flex gap-4 mb-4">
        <div className="flex-1 bg-slate-50 p-3 rounded-lg border border-slate-100 flex flex-col items-center justify-center"><Navigation className="w-5 h-5 text-[#1b75bc] mb-1" /><span className="text-sm font-semibold">{place.distance} km</span><span className="text-xs text-slate-500">Afstand</span></div>
        <div className="flex-1 bg-slate-50 p-3 rounded-lg border border-slate-100 flex flex-col items-center justify-center"><Star className="w-5 h-5 text-yellow-500 mb-1" /><span className="text-sm font-semibold">{place.rating}</span><span className="text-xs text-slate-500">Anmeldelser</span></div>
        <div className="flex-1 bg-[#1b75bc] text-white p-3 rounded-lg shadow-sm flex flex-col items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors"><MapPin className="w-5 h-5 mb-1" /><span className="text-sm font-semibold">Find vej</span></div>
      </div>
      <p className="text-slate-600 text-sm leading-relaxed flex gap-2"><Info className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />{place.description}</p>
    </div>
    <div className="p-4">
      <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2"><Package className="w-5 h-5 text-[#1b75bc]" />Tilgængelige Produkter</h3>
      <div className="space-y-3">{place.products.map((product, idx) => <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center"><div><h4 className="font-medium text-slate-800">{product.name}</h4><p className="text-sm text-slate-500 mt-1">{product.price}</p></div><div className="flex flex-col items-end gap-2"><span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded-full">{product.category}</span>{product.inStock ? <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> På lager</span> : <span className="text-xs font-semibold text-red-500">Udsolgt p.t.</span>}</div></div>)}</div>
    </div>
  </div>
);

export default function App() {
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Alle');
  const filteredPlaces = useMemo(() => MOCK_PLACES.filter((place) => {
    const matchesCategory = activeCategory === 'Alle' || place.categories.includes(activeCategory);
    const query = searchQuery.toLowerCase();
    const matchesSearch = place.name.toLowerCase().includes(query) || place.description.toLowerCase().includes(query) || place.products.some((p) => p.name.toLowerCase().includes(query));
    return matchesCategory && matchesSearch;
  }).sort((a, b) => a.distance - b.distance), [searchQuery, activeCategory]);

  if (selectedPlace) return <PlaceDetail place={selectedPlace} onBack={() => setSelectedPlace(null)} />;
  return (
    <div className="min-h-screen bg-slate-50 font-sans max-w-md mx-auto shadow-2xl overflow-hidden flex flex-col relative">
      <Header />
      <div className="bg-[#1b75bc] text-white px-6 py-8 text-center relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-3 uppercase tracking-wider leading-tight">Livet med mindre plastik,<br />gjort nemt</h2>
          <p className="text-blue-100 text-sm mb-6 max-w-xs mx-auto">Find din nærmeste refill-station. Filtrer efter hverdagsprodukter som shampoo og vaskemiddel.</p>
          <button className="bg-[#ffde00] text-slate-900 font-bold px-6 py-2.5 rounded-full shadow-lg hover:bg-yellow-300 transition-colors transform active:scale-95">Deltag i revolutionen</button>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10 blur-xl" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-400 opacity-20 rounded-full -ml-10 -mb-10 blur-2xl" />
      </div>
      <div className="flex-1 p-4 flex flex-col gap-4">
        <div className="relative shadow-sm"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" /><input type="text" placeholder="Søg efter butikker, shampoo, vaskemiddel..." className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-[#1b75bc] focus:border-transparent transition-shadow text-slate-700" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
        <div className="flex overflow-x-auto pb-2 -mx-4 px-4 gap-2 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>{CATEGORIES.map((category) => <button key={category} onClick={() => setActiveCategory(category)} className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors border ${activeCategory === category ? 'bg-[#1b75bc] text-white border-[#1b75bc] shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>{category}</button>)}</div>
        <div className="flex justify-between items-center pt-2"><h3 className="font-bold text-slate-800">{filteredPlaces.length} {filteredPlaces.length === 1 ? 'lokation' : 'lokationer'} fundet</h3></div>
        <div className="flex flex-col gap-3 pb-8">{filteredPlaces.length > 0 ? filteredPlaces.map((place) => <PlaceCard key={place.id} place={place} onClick={setSelectedPlace} />) : <div className="text-center py-12 px-4 bg-white rounded-xl border border-dashed border-slate-300"><SearchX className="w-12 h-12 text-slate-300 mx-auto mb-3" /><h4 className="text-slate-800 font-medium mb-1">Ingen resultater</h4><p className="text-slate-500 text-sm">Prøv at ændre dit filter eller din søgning. Prøv f.eks. "Shampoo" eller "Sæbebær".</p><button onClick={() => { setSearchQuery(''); setActiveCategory('Alle'); }} className="mt-4 text-[#1b75bc] font-medium text-sm hover:underline">Nulstil filtre</button></div>}</div>
      </div>
    </div>
  );
}
