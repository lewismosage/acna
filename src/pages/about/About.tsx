import React from 'react';
import { Users, Target, Eye, Heart, Globe, Award, Map, BookOpen, BarChart2, Shield, Handshake } from 'lucide-react';
import ContinentalReach from './ContinentalReach';
import Pediatrics from '../../assets/Pediatric-Doc.jpg';

const About = () => {
  return (
    <div className="bg-white">
      {/* Hero Section with Map Background */}
<section className="relative bg-blue-900 overflow-hidden">
  <div className="absolute inset-0 opacity-20">
    <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/8/80/Africa_%28orthographic_projection%29.svg')] bg-center bg-no-repeat bg-contain"></div>
  </div>
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 relative">
    <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-12"> {/* Changed from items-center to items-start */}
      {/* Text Content - Left Side */}
      <div className="lg:w-1/2 text-left">
        <h2 className="text-3xl font-bold text-white mb-6">
          About Us
        </h2>
        <p className="text-xl text-blue-100 mb-8 leading-relaxed">
          A continent-wide community where professionals come together, share knowledge, 
          and shape the future of child neurology in Africa.
        </p>
        
        <p className="text-lg text-blue-100 mb-4 leading-relaxed">
          The <span className="font-semibold">African Child Neurology Association (ACNA)</span> is a continental organization 
          founded in 2008. Bringing together pediatric neurologists, healthcare workers, 
          researchers, and advocates from across Africa, ACNA is dedicated to improving 
          neurological care for children through education, research, and advocacy.
        </p>
        
        <p className="text-lg text-blue-100 leading-relaxed">
          Over the years, ACNA has evolved to meet the growing challenges in child neurology 
          across diverse African contexts. Yet one thing remains constant: it is the one platform 
          on the continent where experts can unite, exchange ideas, and develop shared strategies 
          to ensure that every child in Africa has access to quality neurological care, regardless 
          of where they are born.
        </p>
      </div>

      {/* Image - Right Side */}
      <div className="lg:w-1/2">
        <img 
          src={Pediatrics} 
          alt="Pediatric neurologist with child patient" 
          className="rounded-lg shadow-xl w-full h-auto object-cover"
        />
      </div>
    </div>
  </div>
</section>

      {/* Quick Facts */}
      <section className="py-16 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-blue-600 mb-3">
                <Users className="w-10 h-10 mx-auto" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900">1,200+</h3>
              <p className="text-gray-600">Members</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-blue-600 mb-3">
                <Map className="w-10 h-10 mx-auto" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900">35</h3>
              <p className="text-gray-600">African Countries</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-blue-600 mb-3">
                <BookOpen className="w-10 h-10 mx-auto" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900">12</h3>
              <p className="text-gray-600">Training Programs</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-blue-600 mb-3">
                <BarChart2 className="w-10 h-10 mx-auto" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900">150+</h3>
              <p className="text-gray-600">Research Publications</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center mb-16">
            <h2 className="text-base font-semibold tracking-wide text-blue-600 uppercase">Who We Are</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Our Purpose and Aspiration
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-xl border border-blue-100">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                To promote excellence in child neurology care across Africa through professional 
                development, collaborative research, and advocacy for equitable access to neurological 
                services for all children.
              </p>
              <div className="bg-white p-6 rounded-lg border border-blue-50">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Objectives</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></div>
                    <span className="text-gray-600">Develop and implement Africa-specific clinical guidelines and training programs</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></div>
                    <span className="text-gray-600">Foster collaborative research addressing Africa's unique neurological challenges</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></div>
                    <span className="text-gray-600">Advocate for policies improving access to neurological care</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-white p-8 rounded-xl border border-purple-100">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                  <Eye className="w-6 h-6 text-purple-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Our Vision</h2>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                An Africa where every child with neurological disorders receives timely, 
                culturally appropriate, and evidence-based care regardless of geographic 
                or socioeconomic barriers.
              </p>
              <div className="bg-white p-6 rounded-lg border border-purple-50">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Strategic Priorities (2023-2028)</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 mr-3"></div>
                    <span className="text-gray-600">Establish regional centers of excellence across all African subregions</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 mr-3"></div>
                    <span className="text-gray-600">Double the number of trained child neurologists in Africa by 2028</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 mr-3"></div>
                    <span className="text-gray-600">Develop telemedicine networks to expand access to specialist care</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 mr-3"></div>
                    <span className="text-gray-600">Strengthen partnerships with ministries of health across the continent</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Member Countries */}
      <ContinentalReach />

      {/* Values */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center mb-16">
            <h2 className="text-base font-semibold tracking-wide text-blue-600 uppercase">Our Foundation</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Core Values Guiding Our Work
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              The principles that shape our approach to advancing child neurology in Africa
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Compassionate Care</h3>
              <p className="text-gray-600">
                We approach every child and family with empathy, dignity and respect, 
                understanding the profound impact neurological conditions have on lives.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Professional Excellence</h3>
              <p className="text-gray-600">
                We commit to the highest standards of clinical practice, continuous learning, 
                and evidence-based care for optimal patient outcomes.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Handshake className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Collaborative Spirit</h3>
              <p className="text-gray-600">
                We believe in the power of partnerships - across disciplines, 
                institutions and borders - to achieve more than any could alone.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Globe className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">African Solutions</h3>
              <p className="text-gray-600">
                We develop context-appropriate approaches that address the unique 
                epidemiological, cultural and resource realities of our continent.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Advocacy & Equity</h3>
              <p className="text-gray-600">
                We champion policies and programs that reduce disparities and ensure 
                all children have access to quality neurological care.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Knowledge Sharing</h3>
              <p className="text-gray-600">
                We actively disseminate research findings, clinical insights and 
                educational resources to elevate practice across the continent.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Governance */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center mb-16">
            <h2 className="text-base font-semibold tracking-wide text-blue-600 uppercase">Our Structure</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Governance & Leadership
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              A robust framework guiding our continental operations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">General Assembly</h3>
              <p className="text-gray-600 mb-4">
                The supreme governing body consisting of all members, convening 
                biennially to set strategic direction.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></div>
                  <span className="text-gray-600">Approves constitution changes</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></div>
                  <span className="text-gray-600">Elects executive board</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></div>
                  <span className="text-gray-600">Reviews association reports</span>
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Executive Board</h3>
              <p className="text-gray-600 mb-4">
                12-member board elected for 4-year terms providing strategic 
                oversight between General Assemblies.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></div>
                  <span className="text-gray-600">Chairperson, Secretary, Treasurer</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></div>
                  <span className="text-gray-600">5 regional representatives</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></div>
                  <span className="text-gray-600">4 specialist committee chairs</span>
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Committees</h3>
              <p className="text-gray-600 mb-4">
                Specialist groups driving key areas of our work through volunteer expertise.
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

      {/* Leadership */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Leadership Team</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Meet the dedicated professionals leading ACNA's mission across Africa
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm text-center">
              <img
                src="https://images.pexels.com/photos/4173239/pexels-photo-4173239.jpeg?auto=compress&cs=tinysrgb&w=300"
                alt="Sam Gwer"
                className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
              />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Sam Gwer</h3>
              <p className="text-blue-600 font-medium mb-1">Chairperson</p>
              <p className="text-sm text-gray-500 mb-2">Kenya</p>
              <p className="text-gray-600 text-sm">
                Paediatric Neurologist at Ubuntu Neurology and Gertrude's Children's Hospital, 
                Nairobi. Senior lecturer at Kenyatta University with PhD from University of Amsterdam.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm text-center">
              <img
                src="https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=300"
                alt="Sahar Hassanein"
                className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
              />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Sahar Hassanein</h3>
              <p className="text-blue-600 font-medium mb-1">Secretary</p>
              <p className="text-sm text-gray-500 mb-2">Egypt</p>
              <p className="text-gray-600 text-sm">
                Professor of Pediatrics at Ain Shams University, Cairo. Director of Children's 
                hospital with 25+ years in paediatric neurology.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm text-center">
              <img
                src="https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=300"
                alt="Jo Wilmshurst"
                className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
              />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Jo Wilmshurst</h3>
              <p className="text-blue-600 font-medium mb-1">Board Member</p>
              <p className="text-sm text-gray-500 mb-2">South Africa</p>
              <p className="text-gray-600 text-sm">
                Head of Paediatric Neurology at Red Cross War Memorial Children's Hospital, 
                University of Cape Town. Past-President of ICNA (2018-2022).
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm text-center">
              <img
                src="https://images.pexels.com/photos/4021775/pexels-photo-4021775.jpeg?auto=compress&cs=tinysrgb&w=300"
                alt="Ilhem Ben Youssef"
                className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
              />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Ilhem Ben Youssef</h3>
              <p className="text-blue-600 font-medium mb-1">Board Member</p>
              <p className="text-sm text-gray-500 mb-2">Tunisia</p>
              <p className="text-gray-600 text-sm">
                Professor of Neurology at Tunis El Manar University. Former head of pediatric 
                neurology department at NINT hospital, Tunisia.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm text-center">
              <img
                src="https://images.pexels.com/photos/3825583/pexels-photo-3825583.jpeg?auto=compress&cs=tinysrgb&w=300"
                alt="Chahnez Triki"
                className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
              />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Chahnez Triki</h3>
              <p className="text-blue-600 font-medium mb-1">Board Member</p>
              <p className="text-sm text-gray-500 mb-2">Tunisia</p>
              <p className="text-gray-600 text-sm">
                Distinguished member of the ACNA leadership team contributing to advancing 
                child neurology across Africa.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm text-center">
              <img
                src="https://images.pexels.com/photos/4173239/pexels-photo-4173239.jpeg?auto=compress&cs=tinysrgb&w=300"
                alt="Uduak Offiong"
                className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
              />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Uduak Offiong</h3>
              <p className="text-blue-600 font-medium mb-1">Board Member</p>
              <p className="text-sm text-gray-500 mb-2">Nigeria</p>
              <p className="text-gray-600 text-sm">
                Dedicated professional contributing to ACNA's mission of improving neurological 
                care for children across the African continent.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Partnerships */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Global & Continental Partnerships</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Collaborating with leading organizations to amplify our impact
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
            <div className="bg-white p-6 rounded-lg border border-gray-200 flex items-center justify-center h-32">
              <img src="https://www.icnapedia.org/static/media/icna-logo.1c8a6b5b.png" alt="ICNA" className="h-12 object-contain" />
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200 flex items-center justify-center h-32">
              <img src="https://www.who.int/images/default-source/infographics/who-emblem.png" alt="WHO" className="h-12 object-contain" />
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200 flex items-center justify-center h-32">
              <img src="https://au.int/sites/default/files/au_logo_eng_1.png" alt="African Union" className="h-12 object-contain" />
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200 flex items-center justify-center h-32">
              <img src="https://www.afro.who.int/sites/default/files/afro-emblem.png" alt="WHO AFRO" className="h-12 object-contain" />
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200 flex items-center justify-center h-32">
              <img src="https://www.epilepsyfoundation.org.au/wp-content/uploads/2020/06/ILAE-logo.png" alt="ILAE" className="h-12 object-contain" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;