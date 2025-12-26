import React from "react";
import { Phone, Clock, Headphones } from "lucide-react";

interface ContactInfo {
  phone?: string;
  openHours?: string;
  support?: string;
}

interface ContactHeroCompProps {
  title: string;
  subtitle: string;
  contactInfo?: ContactInfo;
}

const ContactHeroComp: React.FC<ContactHeroCompProps> = ({ 
  title, 
  subtitle, 
  contactInfo 
}) => {
  return (
    <>
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          {title}
        </h1>
        <p className="text-blue-200 text-lg">
          {subtitle}
        </p>
      </div>

      {/* Contact Info */}
      {contactInfo && (
        <div className="container mx-auto px-4 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {contactInfo.phone && (
              <div className="flex items-center gap-4 bg-blue-800/50 p-4 rounded-lg">
                <Phone className="w-8 h-8 text-yellow-400" />
                <div className="text-white">
                  <div className="text-sm opacity-80">CONTACT INFO</div>
                  <div className="font-semibold">{contactInfo.phone}</div>
                </div>
              </div>
            )}
            
            {contactInfo.openHours && (
              <div className="flex items-center gap-4 bg-blue-800/50 p-4 rounded-lg">
                <Clock className="w-8 h-8 text-yellow-400" />
                <div className="text-white">
                  <div className="text-sm opacity-80">OPEN HOURS</div>
                  <div className="font-semibold">{contactInfo.openHours}</div>
                </div>
              </div>
            )}
            
            {contactInfo.support && (
              <div className="flex items-center gap-4 bg-blue-800/50 p-4 rounded-lg">
                <Headphones className="w-8 h-8 text-yellow-400" />
                <div className="text-white">
                  <div className="text-sm opacity-80">CUSTOMER SUPPORT</div>
                  <div className="font-semibold">{contactInfo.support}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ContactHeroComp;