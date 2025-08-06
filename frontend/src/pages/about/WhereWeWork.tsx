import { useState } from 'react';

type Region =
  | 'North Africa'
  | 'West Africa'
  | 'Central Africa'
  | 'East Africa'
  | 'Southern Africa';

const regions: Record<Region, string[]> = {
  'North Africa': ['Algeria', 'Egypt', 'Libya', 'Morocco', 'Sudan', 'Tunisia'],
  'East Africa': ['Kenya', 'Uganda', 'Ethiopia', 'Tanzania', 'Rwanda', 'Somalia'],
  'West Africa': ['Nigeria', 'Ghana', 'Senegal', "Côte d'Ivoire", 'Mali', 'Burkina Faso'],
  'Central Africa': ['Cameroon', 'DR Congo', 'Chad', 'Gabon', 'Central African Republic'],
  'Southern Africa': ['South Africa', 'Zambia', 'Zimbabwe', 'Botswana', 'Namibia', 'Mozambique'],
};

const WhereWeWork = () => {
  const [activeRegion, setActiveRegion] = useState<Region>('East Africa');

  return (
    <section className="py-16 bg-orange-600">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-white">
          <h2 className="text-4xl font-light mb-4">Explore where we work</h2>
          <div className="w-16 h-1 bg-white mb-8"></div>

          <div className="flex flex-wrap gap-4 mb-8">
            {Object.keys(regions).map((region) => (
              <button
                key={region}
                onClick={() => setActiveRegion(region as Region)}
                className={`px-4 py-2 border-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                  activeRegion === region
                    ? 'bg-white text-orange-600 border-white'
                    : 'border-white text-white hover:bg-white hover:text-orange-600'
                }`}
              >
                {region}
              </button>
            ))}
          </div>

          <div className="bg-white text-orange-900 rounded p-6 max-w-xl">
            <h3 className="text-2xl font-semibold mb-4">{activeRegion}</h3>
            <ul className="list-disc pl-6 space-y-1">
              {regions[activeRegion].map((country: string) => (
                <li key={country}>{country}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhereWeWork;
