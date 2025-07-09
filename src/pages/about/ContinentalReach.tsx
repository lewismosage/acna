import React from 'react';

interface Country {
  name: string;
  code: string; 
  members: number;
}

const memberCountries: Country[] = [
  { name: "Algeria", code: "DZ", members: 42 },
  { name: "Egypt", code: "EG", members: 87 },
  { name: "Ethiopia", code: "ET", members: 35 },
  { name: "Ghana", code: "GH", members: 28 },
  { name: "Kenya", code: "KE", members: 56 },
  { name: "Morocco", code: "MA", members: 39 },
  { name: "Nigeria", code: "NG", members: 112 },
  { name: "South Africa", code: "ZA", members: 78 },
  { name: "Tanzania", code: "TZ", members: 24 },
  { name: "Tunisia", code: "TN", members: 47 },
  { name: "Uganda", code: "UG", members: 31 },
  { name: "Zimbabwe", code: "ZW", members: 19 },
];

const ContinentalReach: React.FC = () => (
  <section className="py-20 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Our Continental Reach</h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          ACNA members span across Africa, united in improving child neurology care
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {memberCountries.map((country) => (
          <div key={country.code} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm text-center hover:shadow-md transition-transform hover:scale-105">
            <div className="mb-3 flex justify-center">
              <img 
                src={`https://flagcdn.com/w80/${country.code.toLowerCase()}.png`}
                alt={`Flag of ${country.name}`}
                className="w-16 h-12 object-cover rounded shadow-sm border border-gray-200"
                loading="lazy"
              />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">{country.name}</h3>
            <p className="text-sm text-gray-500">{country.members} members</p>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-blue-50 rounded-xl p-8">
        <div className="lg:flex lg:items-center lg:justify-between">
          <div className="lg:w-1/2">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Regional Committees</h3>
            <p className="text-gray-600 mb-6 lg:mb-0">
              ACNA operates through five regional committees ensuring representation across Africa:
            </p>
          </div>
          <div className="lg:w-1/2">
            <ul className="grid grid-cols-2 gap-4">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                <span className="text-gray-700">North Africa</span>
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                <span className="text-gray-700">West Africa</span>
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                <span className="text-gray-700">Central Africa</span>
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                <span className="text-gray-700">East Africa</span>
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                <span className="text-gray-700">Southern Africa</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default ContinentalReach;