// components/Governance.tsx
import React from "react";

const Governance = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center mb-16">
          <h2 className="text-base font-semibold tracking-wide text-blue-600 uppercase">
            Our Structure
          </h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Governance & Leadership
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            A robust framework guiding our continental operations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              General Assembly
            </h3>
            <p className="text-gray-600 mb-4">
              The supreme governing body consisting of all members, convening
              biennially to set strategic direction.
            </p>
            <ul className="space-y-2">
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></div>
                <span className="text-gray-600">
                  Approves constitution changes
                </span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></div>
                <span className="text-gray-600">Elects executive board</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></div>
                <span className="text-gray-600">
                  Reviews association reports
                </span>
              </li>
            </ul>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Executive Board
            </h3>
            <p className="text-gray-600 mb-4">
              12-member board elected for 4-year terms providing strategic
              oversight between General Assemblies.
            </p>
            <ul className="space-y-2">
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></div>
                <span className="text-gray-600">
                  Chairperson, Secretary, Treasurer
                </span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></div>
                <span className="text-gray-600">
                  5 regional representatives
                </span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></div>
                <span className="text-gray-600">
                  4 specialist committee chairs
                </span>
              </li>
            </ul>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Committees
            </h3>
            <p className="text-gray-600 mb-4">
              Specialist groups driving key areas of our work through volunteer
              expertise.
            </p>
            <ul className="space-y-2">
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></div>
                <span className="text-gray-600">Education & Training</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></div>
                <span className="text-gray-600">Research & Publications</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></div>
                <span className="text-gray-600">Policy & Advocacy</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></div>
                <span className="text-gray-600">Membership & Ethics</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Governance;
