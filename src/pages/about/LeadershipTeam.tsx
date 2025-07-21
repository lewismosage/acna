// components/LeadershipTeam.tsx
import React from "react";

const LeadershipTeam = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Leadership Team
          </h2>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Meet the dedicated professionals leading ACNA's mission across
            Africa
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Leader Card 1 */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Image with overlay */}
            <div className="relative h-64 w-full overflow-hidden">
              <img
                src="https://images.pexels.com/photos/4173239/pexels-photo-4173239.jpeg"
                alt="Sam Gwer"
                className="w-full h-full object-cover"
              />
              {/* Overlay text */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                <div className="relative">
                  <h3 className="text-2xl font-bold text-white">Sam Gwer</h3>
                  <p className="text-blue-300 font-medium">Chairperson</p>
                  <p className="text-blue-100 text-sm">Kenya</p>
                </div>
              </div>
            </div>

            {/* Description with blue background */}
            <div className="bg-blue-50 p-6">
              <p className="text-gray-600">
                Paediatric Neurologist at Ubuntu Neurology and Gertrude's
                Children's Hospital, Nairobi. Senior lecturer at Kenyatta
                University with PhD from University of Amsterdam.
              </p>
            </div>
          </div>

          {/* Leader Card 2 */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="relative h-64 w-full overflow-hidden">
              <img
                src="https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg"
                alt="Jo Wilmshurst"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                <div className="relative">
                  <h3 className="text-2xl font-bold text-white">
                    Sahar Hassanein
                  </h3>
                  <p className="text-blue-300 font-medium">Secretary</p>
                  <p className="text-blue-100 text-sm">Egypt</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-6">
              <p className="text-gray-600">
                Professor of Pediatrics at Ain Shams University, Cairo. Director
                of Children's hospital with 25+ years in paediatric neurology
              </p>
            </div>
          </div>

          {/* Leader Card 3 */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="relative h-64 w-full overflow-hidden">
              <img
                src="https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg"
                alt="Jo Wilmshurst"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                <div className="relative">
                  <h3 className="text-2xl font-bold text-white">
                    Jo Wilmshurst
                  </h3>
                  <p className="text-blue-300 font-medium">Board Member</p>
                  <p className="text-blue-100 text-sm">South Africa</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-6">
              <p className="text-gray-600">
                Head of Paediatric Neurology at Red Cross War Memorial
                Children's Hospital, University of Cape Town. Past-President of
                ICNA (2018-2022).
              </p>
            </div>
          </div>

          {/* Leader Card 4 */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="relative h-64 w-full overflow-hidden">
              <img
                src="https://images.pexels.com/photos/4021775/pexels-photo-4021775.jpeg"
                alt="Ilhem Ben Youssef"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                <div className="relative">
                  <h3 className="text-2xl font-bold text-white">
                    Ilhem Ben Youssef
                  </h3>
                  <p className="text-blue-300 font-medium">Board Member</p>
                  <p className="text-blue-100 text-sm">Tunisia</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-6">
              <p className="text-gray-600">
                Professor of Neurology at Tunis El Manar University. Former head
                of pediatric neurology department at NINT hospital, Tunisia.
              </p>
            </div>
          </div>

          {/* Leader Card 5 */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="relative h-64 w-full overflow-hidden">
              <img
                src="https://images.pexels.com/photos/3825583/pexels-photo-3825583.jpeg"
                alt="Chahnez Triki"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                <div className="relative">
                  <h3 className="text-2xl font-bold text-white">
                    Chahnez Triki
                  </h3>
                  <p className="text-blue-300 font-medium">Board Member</p>
                  <p className="text-blue-100 text-sm">Tunisia</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-6">
              <p className="text-gray-600">
                Distinguished member of the ACNA leadership team contributing to
                advancing child neurology across Africa.
              </p>
            </div>
          </div>

          {/* Leader Card 6 */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="relative h-64 w-full overflow-hidden">
              <img
                src="https://images.pexels.com/photos/4173239/pexels-photo-4173239.jpeg"
                alt="Uduak Offiong"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                <div className="relative">
                  <h3 className="text-2xl font-bold text-white">
                    Uduak Offiong
                  </h3>
                  <p className="text-blue-300 font-medium">Board Member</p>
                  <p className="text-blue-100 text-sm">Nigeria</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-6">
              <p className="text-gray-600">
                Dedicated professional contributing to ACNA's mission of
                improving neurological care for children across the African
                continent.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LeadershipTeam;
