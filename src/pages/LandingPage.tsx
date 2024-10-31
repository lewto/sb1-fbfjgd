import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Calendar, Wifi, ArrowRight, Lock, ArrowUpRight, Flag } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Logo from '../components/Logo';
import GlowCursor from '../components/GlowCursor';

const FeatureCard = ({ icon: Icon, title, description }: { 
  icon: React.ElementType;
  title: string;
  description: string;
}) => (
  <div className="text-center group fade-in">
    <div className="flex justify-center mb-4 transform transition-transform group-hover:scale-110">
      {React.createElement(Icon, { className: "w-8 h-8 text-race-blue-500" })}
    </div>
    <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
    <p className="text-gray-400">{description}</p>
  </div>
);

const IntegrationCard = ({ name, logo, comingSoon = false }: { 
  name: string;
  logo: string;
  comingSoon?: boolean;
}) => (
  <div className="relative group">
    <div className="absolute inset-0 bg-gradient-to-b from-race-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl blur-xl" />
    <div className="relative bg-[#151A2D] p-6 rounded-xl border border-[#1E2642] transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <img 
          src={logo} 
          alt={name}
          className="h-8 object-contain filter brightness-75"
        />
        {comingSoon && (
          <span className="text-xs bg-race-blue-500/10 text-race-blue-500 px-3 py-1 rounded-full">
            Coming 2025
          </span>
        )}
      </div>
      <div className="mt-4">
        <h3 className="text-white font-medium">{name}</h3>
        <p className="text-sm text-gray-400 mt-1">
          {comingSoon ? 'Integration coming in F1 2025 season' : 'Available now'}
        </p>
      </div>
    </div>
  </div>
);

const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-[#0B0F1A] relative overflow-hidden">
      <GlowCursor />
      
      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-radial from-blue-500/10 to-transparent" />
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-blue-500/20 rounded-full filter blur-3xl animate-pulse-slow" />
          <div className="absolute top-40 right-1/4 w-96 h-96 bg-green-500/20 rounded-full filter blur-3xl animate-pulse-slow delay-75" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20 relative">
          <div className="text-center max-w-3xl mx-auto fade-in">
            <div className="flex justify-center mb-12">
              <Logo />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white leading-[1.2] mb-8">
              <span className="block pb-4">Sync Your Space with</span>
              <span className="block bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-green-500 to-blue-500 animate-gradient leading-[1.3]">
                F1 Race Flags
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
              Transform your room into a dynamic F1 experience. Race RGB connects your smart lights
              to live F1 race broadcasts, bringing the track atmosphere home.
            </p>
            <div className="flex items-center justify-center space-x-4">
              <Link
                to="/login"
                className="group inline-flex items-center px-8 py-3 border border-transparent text-base 
                         font-medium rounded-lg text-black bg-white hover:bg-neutral-100 
                         transition-all duration-300 hover:shadow-lg hover:shadow-white/20"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5 transform transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center px-8 py-3 border border-white/10 text-base 
                         font-medium rounded-lg text-white hover:bg-white/5 
                         transition-all duration-300"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-24 bg-[#0D1119]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Powerful Features</h2>
            <p className="text-gray-400">Everything you need for the ultimate F1 viewing experience</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            <FeatureCard
              icon={Flag}
              title="Real-Time Flag Sync"
              description="Instant synchronization with live F1 race flags through the OpenF1 API"
            />
            <FeatureCard
              icon={Wifi}
              title="LIFX Integration"
              description="Seamless connection with your LIFX smart lights for immersive racing"
            />
            <FeatureCard
              icon={Calendar}
              title="Race Schedule"
              description="Never miss a session with our integrated F1 calendar and notifications"
            />
          </div>

          <div className="border-t border-[#1E2642] pt-20">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-white mb-4">Smart Light Integrations</h2>
              <p className="text-gray-400">Supporting more ecosystems in the 2025 F1 season</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <IntegrationCard
                name="LIFX"
                logo="https://images.prismic.io/lifx-web/66c96a3c-4e7b-4e2e-9952-8fdd40240a41_LIFX+Logo+White.png"
              />
              <IntegrationCard
                name="Philips Hue"
                logo="https://images.philips-hue.com/is/image/PhilipsLighting/9290024406_A_png/$jpglarge$&hei=500"
                comingSoon
              />
              <IntegrationCard
                name="Nanoleaf"
                logo="https://nanoleaf.me/assets/img/nanoleaf-logo-white.png"
                comingSoon
              />
              <IntegrationCard
                name="Govee"
                logo="https://cdn.govee.com/assets/logo/govee-logo-white.png"
                comingSoon
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer with OpenF1 Attribution */}
      <div className="bg-[#0D1119] py-8 border-t border-[#1E2642]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <p className="text-gray-400 text-sm">
              Powered by{' '}
              <a 
                href="https://openf1.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-race-blue-500 hover:text-race-blue-400 transition-colors font-medium"
              >
                OpenF1 API
              </a>
            </p>
            <p className="text-gray-500 text-xs">
              © {new Date().getFullYear()} Race RGB. Not affiliated with Formula 1 or any F1 teams. All F1 trademarks belong to their respective owners.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;