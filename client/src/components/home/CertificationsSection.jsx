import React from 'react';
import { 
  CERT_FSSAI_BASE64, 
  CERT_GMP_BASE64, 
  CERT_HACCP_BASE64, 
  CERT_ISO_BASE64 
} from '../../assets/certificationsBase64';
import { useContent } from '../../context/ContentContext';

const CertificationsSection = () => {
  const { getContent } = useContent();

  const sectionHeading = getContent('home.certifications', 'heading', 'Certifications');

  const certs = [
    {
      id: 'fssai',
      name: getContent('home.certifications', 'cert1_name', 'FSSAI'),
      image: getContent('home.certifications', 'cert1_image', '') || CERT_FSSAI_BASE64
    },
    {
      id: 'gmp',
      name: getContent('home.certifications', 'cert2_name', 'GMP Certified'),
      image: getContent('home.certifications', 'cert2_image', '') || CERT_GMP_BASE64
    },
    {
      id: 'haccp',
      name: getContent('home.certifications', 'cert3_name', 'HACCP Certified'),
      image: getContent('home.certifications', 'cert3_image', '') || CERT_HACCP_BASE64
    },
    {
      id: 'iso',
      name: getContent('home.certifications', 'cert4_name', 'ISO 9001'),
      image: getContent('home.certifications', 'cert4_image', '') || CERT_ISO_BASE64
    }
  ];

  return (
    <section className="bg-white py-14 px-4 sm:px-6 lg:px-8 border-t border-b border-neutral-100 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Section Heading */}
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-[32px] font-bold text-[#2d472c] font-display tracking-tight">
            {sectionHeading}
          </h2>
        </div>

        {/* 4 Logos in clean horizontal row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-12 items-center justify-items-center max-w-5xl mx-auto">
          {certs.map((cert) => (
            <div 
              key={cert.id} 
              className="flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl hover:bg-neutral-50/80 transition-all duration-300 group cursor-default w-full"
            >
              <div className="group-hover:scale-110 transition-transform duration-300 flex items-center justify-center h-24 sm:h-28 w-40 sm:w-48">
                <img 
                  src={cert.image} 
                  alt={cert.name} 
                  className="max-h-20 sm:max-h-24 max-w-full w-auto object-contain drop-shadow-sm"
                />
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default CertificationsSection;
