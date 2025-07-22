import React from 'react';

const VolunteerInfoSection = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row mb-12">
          {/* Left Header */}
          <div className="lg:w-1/2 bg-slate-600 text-white p-12">
            <div className="h-0.5 w-16 bg-white mb-6"></div>
            <h2 className="text-4xl font-light mb-4">VOLUNTEER</h2>
            <p className="text-lg">Get involved in your community</p>
          </div>
          
          {/* Right Image */}
          <div className="lg:w-1/2">
            <img
              src="https://images.pexels.com/photos/6646715/pexels-photo-6646715.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Community volunteers working together"
              className="w-full h-64 lg:h-full object-cover"
            />
          </div>
        </div>

        {/* Content Section */}
        <div className="px-4 lg:px-12">
          <div className="max-w-4xl">
            <p className="text-gray-700 mb-4">
              At Heifer, we believe everyone deserves an opportunity to achieve dignity and self-reliance. We work to provide{' '}
              <span className="text-orange-600">sustainable gifts of livestock, agricultural training and other resources</span> to those in need around the world. But we can't do it alone. We work with others who share our{' '}
              <span className="text-orange-600">vision of a world free of hunger and poverty.</span>
            </p>
            
            <p className="text-gray-700 mb-8">
              <strong>That's where you come in.</strong> We work with volunteers each year who make our work possible.
            </p>

            {/* In Your Community Section */}
            <div className="mb-8">
              <h3 className="text-2xl text-orange-600 font-light mb-4">In Your Community</h3>
              <p className="text-gray-700 mb-6">
                There are plenty of ways you can support Heifer's mission right where you are!
              </p>

              <ul className="space-y-4 text-gray-700">
                <li className="flex items-start">
                  <span className="text-orange-600 mr-2">○</span>
                  <div>
                    <strong>Educate your community –</strong> Speak on Heifer's behalf in person or virtually by{' '}
                    <span className="text-blue-600 underline">living gift markets</span>, state fairs, schools or other events to motivate others to make a difference.
                  </div>
                </li>
                
                <li className="flex items-start">
                  <span className="text-orange-600 mr-2">○</span>
                  <div>
                    <strong>Write thank you cards or help with mailings –</strong> Express appreciation for our donors who make our projects possible.
                  </div>
                </li>
                
                <li className="flex items-start">
                  <span className="text-orange-600 mr-2">○</span>
                  <div>
                    <strong>Involve your children –</strong> Children and youth are changing the lives of families all over the world using Heifer programs to{' '}
                    <span className="text-blue-600 underline">inspire their peers and neighbors</span>. We have programs for{' '}
                    <span className="text-blue-600 underline">schools</span> and <span className="text-blue-600 underline">faith groups</span>.
                  </div>
                </li>
                
                <li className="flex items-start">
                  <span className="text-orange-600 mr-2">○</span>
                  <div>
                    <strong>Fundraise for Heifer –</strong> Create a <span className="text-blue-600 underline">fundraiser</span> for your birthday, wedding, a race or any event.
                  </div>
                </li>
                
                <li className="flex items-start">
                  <span className="text-orange-600 mr-2">○</span>
                  <div>
                    <strong>Spread the word –</strong> If you're on social media, you can lend your digital voice to the cause. Share your passion and our posts with your friends and family on{' '}
                    <span className="text-blue-600 underline">Instagram</span>, <span className="text-blue-600 underline">Facebook</span>,{' '}
                    <span className="text-blue-600 underline">LinkedIn</span>, <span className="text-blue-600 underline">Twitter</span>, and{' '}
                    <span className="text-blue-600 underline">YouTube</span>.
                  </div>
                </li>
                
                <li className="flex items-start">
                  <span className="text-orange-600 mr-2">○</span>
                  <div>
                    <strong>Other special projects</strong>
                  </div>
                </li>
              </ul>
            </div>

            <div className="mb-8">
              <p className="text-gray-700 mb-2">
                Volunteers must be 16 and older. Volunteers under age 18 must be chaperoned by an adult at in-person events.
              </p>
              <p className="text-gray-700 mb-8">
                We do not offer international volunteer opportunities.
              </p>
            </div>

            {/* CTA Button */}
            <button className="border-2 border-gray-800 text-gray-800 px-8 py-3 text-sm font-bold tracking-wider hover:bg-gray-800 hover:text-white transition-all duration-300">
              VOLUNTEER WITH HEIFER
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VolunteerInfoSection;