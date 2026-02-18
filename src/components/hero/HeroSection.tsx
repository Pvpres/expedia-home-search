import SearchWidget from '../search/SearchWidget';

export default function HeroSection() {
  return (
    <section className="relative">
      <div className="absolute inset-0 bg-cover bg-center" style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&h=600&fit=crop')`,
      }} />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/10" />
      <div className="relative z-10 pt-12 pb-32 px-4">
        <div className="max-w-4xl mx-auto text-center mb-10">
          <h1 className="text-4xl lg:text-5xl font-light text-white mb-3 tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
            The one place you go to go places
          </h1>
        </div>
        <SearchWidget />
      </div>
    </section>
  );
}
