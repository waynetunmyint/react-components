import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import { IonContent, IonHeader, IonPage } from '@ionic/react';
import HeaderSwitcher from "../_SwitcherComps/HeaderSwitcher";
import FooterSwitchComp from '../_SwitcherComps/FooterSwitcher';
// import ContactHeroComp from '../Contact_HeroComp';
// import { ContactFooterCompOne } from '../Contact_Footer_Comp_One';

const PricingPage = () => {
  const [activeTab, setActiveTab] = useState('web');

  const webPackages = [
    {
      name: 'Starter',
      price: 199,
      popular: false,
      features: [
        { text: 'Website responsive design', included: true },
        { text: 'Up to 5 pages', included: true },
        { text: 'Contact Form', included: true },
        { text: 'SEO Basic', included: true },
        { text: 'Loading up to 3 days', included: true },
        { text: 'Admin Control Panel', included: false },
        { text: 'Up to 10 Pages and more', included: false },
        { text: 'E-Commerce System', included: false }
      ]
    },
    {
      name: 'Basic',
      price: 299,
      popular: true,
      features: [
        { text: 'Website responsive design', included: true },
        { text: 'Admin Control Panel - Design Page', included: true },
        { text: 'Up to 10 pages', included: true },
        { text: 'Up to 50 Product / Project Page', included: true },
        { text: 'SEO Basic', included: true },
        { text: 'Photo Galleries', included: true },
        { text: 'Up to 4-5 June for Email', included: true },
        { text: 'Interactive Inquiry System', included: true },
        { text: 'Domain & 3 Pages', included: true },
        { text: 'E-Commerce System (Optional)', included: false },
        { text: 'Up to 100 Ecommerce', included: false }
      ]
    },
    {
      name: 'Business',
      price: 499,
      popular: false,
      features: [
        { text: 'Website responsive design', included: true },
        { text: 'Advanced Admin Control Panel', included: true },
        { text: 'Up to 20 pages', included: true },
        { text: 'Up to 200 Product / Project Pages', included: true },
        { text: 'SEO Advanced', included: true },
        { text: 'Photo Galleries + Video Support', included: true },
        { text: 'Fast Loading — 1 to 3 days', included: true },
        { text: 'Interactive Inquiry System', included: true },
        { text: 'Domain + Hosting (1 Year)', included: true },
        { text: 'E-Commerce System', included: true },
        { text: 'Up to 500 Ecommerce Items', included: true },
        { text: 'Custom Dynamic Modules', included: true },
        { text: 'Multilanguage Support', included: false }, // optional upgrade
        { text: 'Mobile App Integration', included: false }  // optional upgrade
      ]
    }
    ,
    {
      name: 'E-COM',
      price: 499,
      popular: false,
      features: [
        { text: 'Website responsive design', included: true },
        { text: 'Website hosting', included: true },
        { text: 'Inventory link + Warehouse', included: true },
        { text: 'Payment provider', included: true },
        { text: 'Unlimited products', included: true },
        { text: 'Admin control panel features', included: true },
        { text: 'SEO Basic', included: true },
        { text: 'Google Commerce', included: true },
        { text: 'Up to 500 (10-15 days)', included: true },
        { text: 'Product Recommendation', included: true },
        { text: 'Up to 100 (7-9 days)', included: false },
        { text: 'Multi language Support', included: false }
      ]
    },
    {
      name: 'Corporate',
      price: 999,
      popular: false,
      features: [
        { text: 'Web responsive', included: true },
        { text: 'Unlimited Pages', included: true },
        { text: 'Custom Email', included: true },
        { text: 'Admin control panel', included: true },
        { text: 'SEO', included: true },
        { text: 'Multi-source store management', included: true },
        { text: 'Google Commerce', included: true },
        { text: 'Advanced SILA & 65 MLVT', included: true },
        { text: 'Report Management', included: true },
        { text: 'Advanced SILA & Ecommerce', included: true },
        { text: 'Multi-language support', included: true }
      ]
    }
  ];

  const maintenancePackages = [
    {
      name: 'BASIC',
      price: 99,
      period: '/year',
      features: [
        { text: 'Website Backup', included: true },
        { text: 'Malware Scans', included: true },
        { text: 'SSL', included: true },
        { text: 'Website edits', included: false }
      ]
    },
    {
      name: 'Standard',
      price: 149,
      period: '/year',
      popular: true,
      features: [
        { text: 'Website Backup', included: true },
        { text: 'Malware Scans', included: true },
        { text: 'SSL', included: true },
        { text: 'Quarterly SEO Monitoring', included: true },
        { text: 'Website edits', included: true }
      ]
    },
    {
      name: 'MEDIA/CORPORATE',
      price: 99,
      period: '/month',
      features: [
        { text: 'Website Backup', included: true },
        { text: 'Malware Scans', included: true },
        { text: 'SSL', included: true },
        { text: 'Support', included: true },
        { text: 'Social Media Pkg', included: true },
        { text: 'Website', included: true }
      ]
    }
  ];

  const marketingPackages = [
    {
      name: 'Starter',
      price: 99,
      period: '/month',
      features: [
        { text: '2 ad campaigns', included: true },
        { text: 'Facebook Marketing', included: true },
        { text: 'SEO Campaigns', included: true },
        { text: 'Online Marketing', included: false },
        { text: 'SEO Marketing', included: false }
      ]
    },
    {
      name: 'Basic',
      price: 199,
      period: '/month',
      popular: true,
      features: [
        { text: '3 ad campaigns', included: true },
        { text: 'Google Ads', included: true },
        { text: 'Website Audits', included: true },
        { text: '4 ad campaigns', included: true },
        { text: 'Online Marketing', included: false }
      ]
    },
    {
      name: 'STANDARD',
      price: 299,
      period: '/month',
      features: [
        { text: '4 ad campaigns', included: true },
        { text: 'Facebook Marketing', included: true },
        { text: 'Local Audits', included: true },
        { text: '6 ad campaigns', included: true },
        { text: 'SEO Marketing', included: false }
      ]
    },
    {
      name: 'Premium',
      price: 499,
      period: '/month',
      features: [
        { text: '5 ad campaigns', included: true },
        { text: 'Google Ads', included: true },
        { text: 'Local Audits', included: true },
        { text: '10 ad campaigns', included: true },
        { text: '15 ad campaigns', included: true }
      ]
    }
  ];

  const seoPackages = [
    {
      name: 'SEO Starter',
      price: 99,
      period: '/month',
      features: [
        { text: 'Keyword Research', included: true },
        { text: 'On-page Optimization', included: true },
        { text: 'Basic Reporting', included: true },
        { text: 'Link Building', included: false }
      ]
    },
    {
      name: 'SEO Pro',
      price: 199,
      period: '/month',
      popular: true,
      features: [
        { text: 'Keyword Research', included: true },
        { text: 'On-page Optimization', included: true },
        { text: 'Content Marketing', included: true },
        { text: 'Link Building', included: true },
        { text: 'Advanced Reporting', included: true }
      ]
    }
  ];

  const softwarePackages = [
    {
      name: 'Basic Software',
      price: 499,
      period: '/month',
      features: [
        { text: 'Single Platform', included: true },
        { text: 'Basic UI/UX', included: true },
        { text: 'Basic Reporting', included: true },
        { text: 'Multi-user Support', included: false }
      ]
    },

    {
      name: 'Standard Software',
      price: 999,
      period: '/month',
      popular: true,
      features: [
        { text: 'Cross-Platform', included: true },
        { text: 'Admin Panel', included: true },
        { text: 'Multi-user Support', included: true },
        { text: 'API Integration', included: true }
      ]
    },
    {
      name: 'Enterprise Software',
      price: 1499,
      period: '/month',
      popular: true,
      features: [
        { text: 'Cross-Platform', included: true },
        { text: 'Advanced UI/UX', included: true },
        { text: 'Admin Panel', included: true },
        { text: 'Multi-user Support', included: true },
        { text: 'API Integration', included: true }
      ]
    }
  ];



  const PackageCard = ({ pkg, index }) => (
    <div className={`relative bg-white rounded-lg shadow-lg overflow-hidden ${pkg.popular ? 'ring-2 ring-[var(--theme-accent)]' : ''}`}>
      {pkg.popular && (
        <div className="absolute top-0 right-0 bg-[var(--theme-accent)] text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
          POPULAR
        </div>
      )}
      <div className="bg-gradient-to-r from-[var(--theme-secondary-bg)] to-[var(--theme-primary-bg)] text-[var(--theme-primary-text)] p-6 text-center">
        <h3 className="text-xl font-bold mb-2 text-[var(--theme-primary-text)]">{pkg.name}</h3>
        <div className="text-4xl font-bold">
          <span className="text-2xl">$</span>{pkg.price}
          {pkg.period && <span className="text-lg font-normal">{pkg.period}</span>}
        </div>
      </div>
      <div className="p-6">
        <ul className="space-y-3 mb-6">
          {pkg.features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm">
              {feature.included ? (
                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              ) : (
                <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              )}
              <span className={feature.included ? 'text-[var(--theme-text-primary)]' : 'text-[var(--theme-text-muted)]'}>
                {feature.text}
              </span>
            </li>
          ))}
        </ul>
        <button
          onClick={() => window.location.href = "/contact"}
          className="w-full bg-[var(--theme-primary-bg)] hover:bg-[var(--theme-secondary-bg)] text-[var(--theme-primary-text)] font-semibold py-3 px-6 rounded-lg transition-colors shadow-sm"
        >
          ORDER NOW
        </button>
      </div>
    </div>
  );

  return (
    <IonPage>



      <IonContent fullscreen>
        <HeaderSwitcher headingField='Pricing' />
        <div className="h-32" /> {/* Blank space at top */}
        <div className="min-h-screen">


          {/* Main Content */}
          <div className="bg-[var(--theme-secondary-text)]/30 py-12">
            <div className="container mx-auto px-4">
              {/* Tabs */}
              <div className="flex justify-center gap-4 mb-12 flex-wrap">
                <button
                  onClick={() => setActiveTab('web')}
                  className={`px-6 py-2 rounded-full font-semibold transition-colors ${activeTab === 'web'
                    ? 'bg-[var(--theme-primary-bg)] text-[var(--theme-primary-text)]'
                    : 'bg-white text-[var(--theme-primary-bg)] border border-[var(--theme-border-primary)] hover:bg-[var(--theme-primary-bg)]/5'
                    }`}
                >
                  Web Development
                </button>
                <button
                  onClick={() => setActiveTab('maintenance')}
                  className={`px-6 py-2 rounded-full font-semibold transition-colors ${activeTab === 'maintenance'
                    ? 'bg-[var(--theme-primary-bg)] text-[var(--theme-primary-text)]'
                    : 'bg-white text-[var(--theme-primary-bg)] border border-[var(--theme-border-primary)] hover:bg-[var(--theme-primary-bg)]/5'
                    }`}
                >
                  Maintenance
                </button>
                <button
                  onClick={() => setActiveTab('marketing')}
                  className={`px-6 py-2 rounded-full font-semibold transition-colors ${activeTab === 'marketing'
                    ? 'bg-[var(--theme-primary-bg)] text-[var(--theme-primary-text)]'
                    : 'bg-white text-[var(--theme-primary-bg)] border border-[var(--theme-border-primary)] hover:bg-[var(--theme-primary-bg)]/5'
                    }`}
                >
                  Digital Marketing
                </button>

                <button
                  onClick={() => setActiveTab('seo')}
                  className={`px-6 py-2 rounded-full font-semibold transition-colors ${activeTab === 'seo'
                    ? 'bg-[var(--theme-primary-bg)] text-[var(--theme-primary-text)]'
                    : 'bg-white text-[var(--theme-primary-bg)] border border-[var(--theme-border-primary)] hover:bg-[var(--theme-primary-bg)]/5'
                    }`}
                >
                  SEO Packages
                </button>

                <button
                  onClick={() => setActiveTab('software')}
                  className={`px-6 py-2 rounded-full font-semibold transition-colors ${activeTab === 'software'
                    ? 'bg-[var(--theme-primary-bg)] text-[var(--theme-primary-text)]'
                    : 'bg-white text-[var(--theme-primary-bg)] border border-[var(--theme-border-primary)] hover:bg-[var(--theme-primary-bg)]/5'
                    }`}
                >
                  Software Development
                </button>
              </div>

              {/* Web Development Packages */}
              {activeTab === 'web' && (
                <div>
                  <h2 className="text-3xl font-bold text-center mb-8 text-[var(--theme-text-primary)]">
                    Web Development Packages
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {webPackages.map((pkg, idx) => (
                      <PackageCard key={idx} pkg={pkg} index={idx} />
                    ))}
                  </div>
                </div>
              )}

              {/* Maintenance Packages */}
              {activeTab === 'maintenance' && (
                <div>
                  <h2 className="text-3xl font-bold text-center mb-4 text-[var(--theme-text-primary)]">
                    Website Maintenance Packages
                  </h2>
                  <p className="text-center text-red-600 mb-8">
                    ***Easy Items To Choose One***
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
                    {maintenancePackages.map((pkg, idx) => (
                      <PackageCard key={idx} pkg={pkg} index={idx} />
                    ))}
                  </div>
                </div>
              )}

              {/* Digital Marketing Packages */}
              {activeTab === 'marketing' && (
                <div>
                  <h2 className="text-3xl font-bold text-center mb-8 text-[var(--theme-text-primary)]">
                    Digital Marketing Packages
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {marketingPackages.map((pkg, idx) => (
                      <PackageCard key={idx} pkg={pkg} index={idx} />
                    ))}
                  </div>
                </div>
              )}

              {/* SEO Packages */}
              {activeTab === 'seo' && (
                <div>
                  <h2 className="text-3xl font-bold text-center mb-8 text-[var(--theme-text-primary)]">
                    SEO Packages
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {seoPackages.map((pkg, idx) => (
                      <PackageCard key={idx} pkg={pkg} index={idx} />
                    ))}
                  </div>
                </div>
              )}

              {/* Software Development Packages */}
              {activeTab === 'software' && (
                <div>
                  <h2 className="text-3xl font-bold text-center mb-8 text-[var(--theme-text-primary)]">
                    Software Development Packages
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {softwarePackages.map((pkg, idx) => (
                      <PackageCard key={idx} pkg={pkg} index={idx} />
                    ))}
                  </div>
                </div>
              )}


            </div>
          </div>
          <FooterSwitchComp styleNo={1} />
        </div>
      </IonContent>
    </IonPage>

  );
};

export default PricingPage;