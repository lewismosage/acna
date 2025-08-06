import React from 'react';
import ScrollToTop from '../../components/common/ScrollToTop';
import SAMGWER from "../../assets/sam-gwer.jpg";
import JOWILMSHURST from "../../assets/Jo Wilmshurst.jpg";
import SAHAR from "../../assets/Sahar.png";
import ILHEM from "../../assets/Dr. Ilhem Ben Youssef Turki.jpg";
//import GAIL from "../../assets/";
import CHAHNEZ from "../../assets/Chahnez Triki.png";
import UDUAK from "../../assets/Uduak Offiong.png";
//import AHMED from "../../assets/ahmed-raouf.jpg";



const Leadership = () => {
  const leaders = [
    {
      name: "Sam Gwer",
      position: "Chairperson",
      image: SAMGWER,
      bio: "Sam is a Paediatric Neurologist, serving at Ubuntu Neurology and Gertrude’s Children’s Hospital in Nairobi, Kenya. He is also a senior lecturer at the School of Health Sciences at Kenyatta University. His research focuses on childhood epilepsy, stroke, encephalopathies, and health systems strengthening. He has authored several peer-reviewed publications, contributed to international neurology training guidelines, and co-developed STONE-HMIS®, an award-winning digital health platform. He has been instrumental in initiating neurology training in Kenya, promoting awareness and capacity development in the management of epilepsy and other neurological diseases, and in the founding of a number of professional associations and social health enterprises serving underserved communities. He has a PhD from the University of Amsterdam."
    },
    {
      name: "Sahar Hassanein",
      position: "Secretary",
      image: SAHAR,
      bio: "Professor of Pediatrics at the Faculty of Medicine, Ain Shams University, Cairo, Egypt. Dr. Sahar M. A. Hassanein has practices as a paediatric neurologist for almost 25 years. She has experience in various fields of Pediatrics and child neurology, in education, and in conducting clinical research and publications. She serves as director of the Children’s hospital, Faculty of Medicine, Ain Shams University. Dr Hassanein has been on International Pediatric Stroke Study executive committee board since 2020. She is the editor in chief of the International Pediatric Stroke organization."
    },
    {
      name: "Gail Scher",
      position: "Board Member",
      //image: GAIL,
      bio: "Bio coming soon."
    },
    {
      name: "Chahnez Triki",
      position: "Board Member",
      image: CHAHNEZ,
      bio: "Bio coming soon."
    },
    {
      name: "Uduak Offiong",
      position: "Board Member",
      image: UDUAK,
      bio: "Bio coming soon."
    },
    {
      name: "Ilhem Ben Youssef",
      position: "Board Member",
      image: ILHEM,
      bio: "Dr. Ilhem Ben Youssef Turki is professor of Neurology at the faculty of Medicine, Tunis El Manar University, Tunisia. She has worked for many years (1989-2025) at the Mongi Ben Hmida National Institute of Neurology (NINT) hospital in Tunis. She was the head of the pediatric neurology department (2013-2023) and director of the pediatric neurology research laboratory (LR18SP04) from 2018 to 2025. Her research interests include neuromuscular diseases, epilepsy, cerebral palsy, mitochondrial diseases, and neurodevelopmental disorders."
    },
    {
      name: "Jo Wilmshurst",
      position: "Board Member",
      image: JOWILMSHURST,
      bio: "Professor Jo Wilmshurst is Head of Paediatric Neurology at the Red Cross War Memorial Children’s Hospital, University of Cape Town. She is past-President of the International Child Neurology Association (2018-2022) and has held various leadership roles in the International League Against Epilepsy and other associations. She is director of the African Paediatric Fellowship Program and an editorial board member for several neurology journals. She has over 200 peer-reviewed publications and is interested in rare neurological disorders, epilepsy, and neuroinfections."
    },
    {
      name: "Ahmed Raouf Ibrahim",
      position: "Board Member",
      //image: AHMED,
      bio: "Bio coming soon."
    }
  ];


  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <ScrollToTop />
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-4">
          Leadership Team
        </h2>
        <div className="w-20 h-1 bg-red-600 mx-auto mb-6"></div>
        <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
          Meet the dedicated professionals leading ACNA's mission across Africa
        </p>
      </div>

      <div className="space-y-16">
        {leaders.map((leader, index) => (
          <div key={index} className="bg-white">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="lg:w-64 flex-shrink-0">
                <img
                  src={leader.image}
                  alt={leader.name}
                  className="w-full h-64 lg:h-80 object-cover rounded shadow-lg"
                />
              </div>

              <div className="flex-1">
                <div className="mb-6">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">{leader.name}</h2>
                  <p className="text-lg text-gray-600 font-medium">{leader.position}</p>
                </div>

                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed text-base">
                    {leader.bio}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leadership;
