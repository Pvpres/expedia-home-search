import SearchWidget from '../search/SearchWidget';

export default function HeroSection() {
  return (
    <section className="relative">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-800 via-blue-700 to-blue-600" />
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />
      <div className="relative z-10 pt-12 pb-32 px-4">
        <div className="max-w-4xl mx-auto text-center mb-10">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-3 tracking-tight">
            Where to next?
          </h1>
          <p className="text-lg text-blue-100">
            Search flights, hotels, and rental cars. Save when you bundle.
          </p>
        </div>
        <SearchWidget />
      </div>
    </section>
  );
}
