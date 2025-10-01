import React from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { 
  Shield, 
  Users, 
  Calendar, 
  BarChart3, 
  FileText, 
  Settings,
  ArrowRight,
  CheckCircle,
  Target,
  Building2,
  DollarSign,
  TrendingUp,
  Lock
} from 'lucide-react';

interface LandingPageProps {
  onShowLogin: () => void;
  onShowAdminLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onShowLogin, onShowAdminLogin }) => {
  const services = [
    {
      icon: Target,
      title: 'Targeted Financial Planning',
      description: 'Personalized financial strategies designed specifically for your unique goals and circumstances.'
    },
    {
      icon: Building2,
      title: 'Pension Employee Services',
      description: 'Specialized planning for pension employees to maximize retirement benefits and security.'
    },
    {
      icon: DollarSign,
      title: 'Fee-Only Fiduciary Advice',
      description: 'Transparent, unbiased financial advice with no hidden fees or conflicts of interest.'
    },
    {
      icon: TrendingUp,
      title: 'Business Owner Planning',
      description: 'Comprehensive financial strategies for business owners to grow and protect their wealth.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              {/* Business Logo */}
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-full flex items-center justify-center">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                    <div className="w-6 h-6 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-full"></div>
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    <span className="text-indigo-600">Targeted</span>
                    <span className="text-gray-900 ml-2">Financial Planning</span>
                  </h1>
                  <p className="text-sm text-gray-600">Fee-Only, Fiduciary Advice for Pension Employees and Business Owners</p>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm" onClick={onShowLogin} className="text-gray-600 hover:text-gray-900">
                <Lock className="mr-2 h-4 w-4" />
                Login
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Your Financial Future,
              <span className="text-indigo-600"> Strategically Planned</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Fee-only, fiduciary financial planning services designed specifically for pension employees and business owners. 
              Get personalized advice that puts your interests first.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 py-3 bg-indigo-600 hover:bg-indigo-700">
                Schedule Consultation
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-3">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Financial Planning Services
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive financial planning tailored to your unique needs as a pension employee or business owner.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow border-l-4 border-indigo-500">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-indigo-100 rounded-lg">
                        <Icon className="h-6 w-6 text-indigo-600" />
                      </div>
                      <CardTitle className="text-xl text-gray-900">{service.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base text-gray-600">
                      {service.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Why Choose Targeted Financial Planning?
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-6 w-6 text-indigo-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Fee-Only Fiduciary</h3>
                    <p className="text-gray-600">No commissions, no hidden fees. We're legally bound to act in your best interest.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-6 w-6 text-indigo-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Pension Expertise</h3>
                    <p className="text-gray-600">Specialized knowledge in pension systems and retirement planning for public employees.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-6 w-6 text-indigo-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Business Owner Focus</h3>
                    <p className="text-gray-600">Comprehensive planning for business owners including succession and tax strategies.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-6 w-6 text-indigo-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Personalized Approach</h3>
                    <p className="text-gray-600">Every plan is tailored to your unique financial situation and long-term goals.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Ready to Get Started?</h3>
              <p className="text-gray-600 mb-6">
                Schedule a complimentary consultation to discuss your financial goals and how we can help you achieve them.
              </p>
              <div className="space-y-4">
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700" size="lg">
                  Schedule Free Consultation
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button variant="outline" className="w-full" size="lg">
                  Download Our Guide
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-full"></div>
                </div>
              </div>
              <span className="text-xl font-bold">
                <span className="text-indigo-400">Targeted</span> Financial Planning
              </span>
            </div>
            <p className="text-gray-400 mb-4">
              Fee-Only, Fiduciary Advice for Pension Employees and Business Owners
            </p>
            <div className="flex justify-center space-x-6 mb-4">
              <a href="#" className="text-gray-400 hover:text-white">Contact</a>
              <a href="#" className="text-gray-400 hover:text-white">About</a>
              <a href="#" className="text-gray-400 hover:text-white">Services</a>
              <a href="#" className="text-gray-400 hover:text-white">Privacy</a>
            </div>
            <p className="text-sm text-gray-500">
              © 2024 Targeted Financial Planning. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
