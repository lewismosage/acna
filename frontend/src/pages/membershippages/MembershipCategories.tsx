import React from 'react';
import { membershipCategories } from './types';
import ScrollToTop from '../../components/common/ScrollToTop';

const MembershipCategories = () => {

  return (
    <div className="bg-white">
      <ScrollToTop />
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-light text-gray-900 mb-6">Membership Categories</h1>
          <p className="text-xl md:text-2xl text-gray-700 font-light max-w-3xl mx-auto">
            Join a community of professionals dedicated to improving child neurological care across Africa.
          </p>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-4"> ACNA Membership Categories</h2>
            <div className="w-20 h-1 bg-red-600 mx-auto mb-6"></div>
            <p className="text-lg text-gray-700 leading-relaxed">
              The African Child Neurology Association (ACNA) offers tailored membership options for professionals, institutions, students, and partners dedicated to improving child neurological care in Africa. Our membership structure is designed to foster collaboration, advance education, and support advocacy across the continent.
            </p>
            <p className="text-lg text-gray-700 mt-4">
             <strong>Membership is open to individuals and institutions from Africa and beyond who share ACNA's mission.</strong>
            </p>
          </div>
        </div>
      </section>

      {/* Membership Categories Grid */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8">
            {membershipCategories.map((category, index) => (
              <div key={index} className={`bg-white rounded-lg shadow-lg border-2 ${category.color} overflow-hidden hover:shadow-xl transition-shadow duration-300`}>
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">{category.title}</h3>
                    <span className={`${category.badgeColor} text-white px-4 py-2 rounded-full text-sm font-bold`}>
                      {category.fee}
                    </span>
                  </div>

                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Who Can Join:</h4>
                    <ul className="space-y-2">
                      {category.whoCanJoin.map((item, idx) => (
                        <li key={idx} className="text-gray-700 text-sm leading-relaxed">
                          • {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Benefits:</h4>
                    <ul className="space-y-2">
                      {category.benefits.map((benefit, idx) => (
                        <li key={idx} className="text-gray-700 text-sm leading-relaxed flex items-start">
                          <span className="text-green-500 mr-2 flex-shrink-0">✓</span>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-gradient-to-r from-orange-600 to-orange-700">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Join?</h2>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Become part of the movement to transform child neurological care across Africa. Your membership makes a difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <span className="text-2xl"></span>
            <a
              href="/register"
              className="bg-white text-orange-600 px-8 py-4 font-bold text-lg hover:bg-gray-100 transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Become a Member Now
            </a>
          </div>
          <p className="text-orange-100 mt-6 text-sm">
            Questions about membership? <span className="underline cursor-pointer hover:text-white">Contact us</span> for more information.
          </p>
        </div>
      </section>
    </div>
  );
};

export default MembershipCategories;