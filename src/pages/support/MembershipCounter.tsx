import React, { useEffect, useState } from 'react';

const MembershipCounter = () => {
  const [count, setCount] = useState(0);
  const target = 10000;
  const duration = 2000; // 2 seconds

  useEffect(() => {
    let start = 0;
    const stepTime = Math.max(Math.floor(duration / target), 1);

    const timer = setInterval(() => {
      start += 100;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="bg-[#E6E6E6] py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-12">
          
          {/* LEFT: Movement Section */}
          <div className="flex-1 text-center lg:text-left">
            <h3 className="text-2xl lg:text-3xl font-extrabold text-black uppercase mb-6">
              WE ARE A CONTINENT-WIDE MOVEMENT
            </h3>
            <div className="text-[5rem] lg:text-[6rem] font-extrabold text-black leading-none mb-2">
              {count.toLocaleString()}+
            </div>
            <div className="text-xl font-semibold text-black mb-6">
              10,000+ Dedicated professionals and allies
            </div>
            <p className="text-lg text-black max-w-xl mx-auto lg:mx-0">
              Across Africa and beyond, over 10,000 child neurologists, pediatricians, researchers, caregivers, and advocates are united under ACNA’s mission to transform the future of neurological health for African children.
            </p>
          </div>

          {/* RIGHT: Quote Section */}
          <div className="flex-1 text-center lg:text-left">
            <div className="text-4xl font-black text-black leading-snug mb-6">
              <span className="text-5xl mr-2">“</span>
              Every child deserves access to quality neurological care, no matter where they’re born. That’s why I stand with ACNA.”
            </div>
            <div className="text-xl font-semibold text-black mb-2">
              Sam Gwer - ACNA Chairperson
            </div>
            <div className="w-40 h-1 bg-black mt-2 mx-auto lg:mx-0"></div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default MembershipCounter;
