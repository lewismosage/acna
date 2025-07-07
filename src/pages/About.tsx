import React from 'react';
import { Users, Target, Eye, Heart, Globe, Award } from 'lucide-react';

const About = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-900 to-blue-700 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              About ACNA
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              The Africa Child Neurology Association is a pan-African organization dedicated to 
              advancing the field of child neurology across the continent through research, 
              education, and professional collaboration.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                To improve the lives of children with neurological conditions across Africa by 
                advancing clinical care, promoting research excellence, fostering professional 
                development, and advocating for better healthcare policies.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></div>
                  <span className="text-gray-600">Advance clinical care standards for pediatric neurology</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></div>
                  <span className="text-gray-600">Promote collaborative research across African institutions</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></div>
                  <span className="text-gray-600">Support professional development and education</span>
                </li>
              </ul>
            </div>

            <div>
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                  <Eye className="w-6 h-6 text-purple-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Our Vision</h2>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                To be the leading voice for child neurology in Africa, creating a future where 
                every child on the continent has access to world-class neurological care and 
                where African research contributes significantly to global knowledge.
              </p>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Strategic Goals</h3>
                <ul className="space-y-2">
                  <li className="text-gray-600">• Establish centers of excellence across Africa</li>
                  <li className="text-gray-600">• Develop Africa-specific clinical guidelines</li>
                  <li className="text-gray-600">• Build sustainable research partnerships</li>
                  <li className="text-gray-600">• Advocate for policy improvements</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Our Core Values</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              These fundamental principles guide everything we do and shape our approach to 
              advancing child neurology across Africa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Compassion</h3>
              <p className="text-gray-600">
                We approach our work with empathy and understanding, always keeping the 
                well-being of children and families at the center of our efforts.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Excellence</h3>
              <p className="text-gray-600">
                We strive for the highest standards in clinical care, research, and 
                professional development to ensure optimal outcomes for children.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Collaboration</h3>
              <p className="text-gray-600">
                We believe in the power of working together across borders, disciplines, 
                and institutions to achieve greater impact.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Globe className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">African Focus</h3>
              <p className="text-gray-600">
                We understand the unique challenges and opportunities in Africa and 
                develop solutions tailored to our continent's specific needs.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Innovation</h3>
              <p className="text-gray-600">
                We embrace new technologies, methodologies, and approaches to advance 
                the field and improve patient outcomes.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Eye className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Transparency</h3>
              <p className="text-gray-600">
                We operate with openness and accountability, ensuring our members and 
                stakeholders are informed about our activities and decisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* History */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Our Journey</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From humble beginnings to becoming Africa's leading child neurology organization
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-blue-200"></div>
              
              <div className="space-y-12">
                <div className="relative flex items-start">
                  <div className="absolute left-6 w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow"></div>
                  <div className="ml-16">
                    <div className="text-blue-600 font-semibold mb-1">2010</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Foundation</h3>
                    <p className="text-gray-600">
                      ACNA was founded by a group of pioneering child neurologists from across Africa 
                      with a vision to improve pediatric neurological care on the continent.
                    </p>
                  </div>
                </div>

                <div className="relative flex items-start">
                  <div className="absolute left-6 w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow"></div>
                  <div className="ml-16">
                    <div className="text-blue-600 font-semibold mb-1">2012</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">First Annual Conference</h3>
                    <p className="text-gray-600">
                      Our inaugural conference in Nairobi brought together 150 professionals and 
                      established ACNA as a platform for knowledge sharing and collaboration.
                    </p>
                  </div>
                </div>

                <div className="relative flex items-start">
                  <div className="absolute left-6 w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow"></div>
                  <div className="ml-16">
                    <div className="text-blue-600 font-semibold mb-1">2015</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Research Network Launch</h3>
                    <p className="text-gray-600">
                      Established the African Pediatric Neurology Research Network, facilitating 
                      collaborative studies across 20 institutions in 15 countries.
                    </p>
                  </div>
                </div>

                <div className="relative flex items-start">
                  <div className="absolute left-6 w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow"></div>
                  <div className="ml-16">
                    <div className="text-blue-600 font-semibold mb-1">2018</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Clinical Guidelines Publication</h3>
                    <p className="text-gray-600">
                      Published the first comprehensive clinical guidelines for pediatric epilepsy 
                      management specifically adapted for African healthcare settings.
                    </p>
                  </div>
                </div>

                <div className="relative flex items-start">
                  <div className="absolute left-6 w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow"></div>
                  <div className="ml-16">
                    <div className="text-blue-600 font-semibold mb-1">2020</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Digital Transformation</h3>
                    <p className="text-gray-600">
                      Launched our digital platform and virtual conferences, expanding access to 
                      education and collaboration opportunities across the continent.
                    </p>
                  </div>
                </div>

                <div className="relative flex items-start">
                  <div className="absolute left-6 w-4 h-4 bg-yellow-500 rounded-full border-4 border-white shadow"></div>
                  <div className="ml-16">
                    <div className="text-yellow-600 font-semibold mb-1">2024</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Today</h3>
                    <p className="text-gray-600">
                      With over 2,500 members across 45 African countries, ACNA continues to lead 
                      the advancement of child neurology care and research across Africa.
                    </p>
                  </div>
                </div>
              </div>
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
                src="https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=300"
                alt="Dr. Amara Okafor"
                className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
              />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Dr. Amara Okafor</h3>
              <p className="text-blue-600 font-medium mb-3">President</p>
              <p className="text-gray-600 text-sm">
                Leading pediatric neurologist from Nigeria with 20+ years of experience in 
                child neurology and medical education.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm text-center">
              <img
                src="https://images.pexels.com/photos/4173239/pexels-photo-4173239.jpeg?auto=compress&cs=tinysrgb&w=300"
                alt="Dr. Sarah Mwaniki"
                className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
              />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Dr. Sarah Mwaniki</h3>
              <p className="text-blue-600 font-medium mb-3">Vice President</p>
              <p className="text-gray-600 text-sm">
                Renowned researcher from Kenya specializing in pediatric epilepsy and 
                neurodevelopmental disorders.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm text-center">
              <img
                src="https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=300"
                alt="Dr. Mohamed Hassan"
                className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
              />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Dr. Mohamed Hassan</h3>
              <p className="text-blue-600 font-medium mb-3">Secretary General</p>
              <p className="text-gray-600 text-sm">
                Expert in pediatric neurosurgery from Egypt with extensive experience in 
                international medical collaborations.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;