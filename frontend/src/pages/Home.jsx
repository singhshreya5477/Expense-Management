import { Link } from 'react-router-dom'
import { 
  ArrowRight, 
  CheckCircle, 
  Receipt, 
  TrendingUp, 
  Shield, 
  Zap, 
  Users, 
  BarChart3,
  Globe,
  Sparkles,
  Eye,
  Download,
  Clock,
  Award
} from 'lucide-react'

const Home = () => {
  const features = [
    {
      icon: Receipt,
      title: 'Smart OCR Scanning',
      description: 'Automatically extract data from receipts using advanced OCR technology',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: TrendingUp,
      title: 'Real-time Analytics',
      description: 'Get instant insights with interactive charts and comprehensive reports',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: Shield,
      title: 'Multi-level Approvals',
      description: 'Customizable approval workflows with role-based access control',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: Globe,
      title: 'Multi-currency Support',
      description: 'Handle expenses in multiple currencies with automatic conversion',
      color: 'from-orange-500 to-orange-600'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Submit and approve expenses in seconds, not hours',
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Seamless multi-user access with role management',
      color: 'from-pink-500 to-pink-600'
    }
  ]

  const stats = [
    { number: '10,000+', label: 'Expenses Processed', icon: Receipt },
    { number: '500+', label: 'Companies Trust Us', icon: Award },
    { number: '99.9%', label: 'Uptime Guarantee', icon: CheckCircle },
    { number: '24/7', label: 'Support Available', icon: Clock }
  ]

  const benefits = [
    'Reduce expense processing time by 80%',
    'Eliminate manual data entry errors',
    'Real-time expense visibility',
    'Automated approval workflows',
    'Comprehensive audit trails',
    'Mobile-friendly interface'
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl">
                <Receipt size={24} className="text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                Expense Manager
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                to="/login" 
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link 
                to="/register" 
                className="btn-primary flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              >
                <span>Get Started</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center space-y-8 animate-fadeIn">
            <div className="inline-block">
              <span className="px-4 py-2 bg-gradient-to-r from-primary-100 to-purple-100 text-primary-700 rounded-full text-sm font-semibold border border-primary-200">
                <Sparkles size={16} className="inline mr-2" />
                Modern Expense Management
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-gray-900 via-primary-600 to-purple-600 bg-clip-text text-transparent">
                Simplify Expense
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                Management Forever
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
              Streamline your expense tracking with smart OCR, automated approvals, 
              and real-time analytics. Built for modern teams.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link 
                to="/register" 
                className="btn-primary text-lg px-8 py-4 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all flex items-center space-x-2"
              >
                <span>Start Free Trial</span>
                <ArrowRight size={20} />
              </Link>
              <button 
                onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                className="btn-secondary text-lg px-8 py-4 flex items-center space-x-2 hover:shadow-lg transition-all"
              >
                <Eye size={20} />
                <span>See Features</span>
              </button>
            </div>

            <div className="pt-8 flex items-center justify-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <CheckCircle size={16} className="text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle size={16} className="text-green-500" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle size={16} className="text-green-500" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-br from-primary-600 to-purple-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="text-center space-y-2 transform hover:scale-110 transition-transform animate-fadeIn"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <stat.icon size={32} className="text-white/80 mx-auto" />
                <p className="text-4xl font-bold text-white">{stat.number}</p>
                <p className="text-primary-100">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16 animate-fadeIn">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage expenses efficiently and effectively
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 border border-gray-100 animate-fadeIn"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`absolute top-0 left-0 w-2 h-full bg-gradient-to-b ${feature.color} rounded-l-2xl`}></div>
                <div className={`inline-block p-3 bg-gradient-to-br ${feature.color} rounded-xl mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon size={28} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Why Choose Us?
              </h2>
              <p className="text-xl text-gray-600">
                Join hundreds of companies that have transformed their expense management process
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div 
                    key={index} 
                    className="flex items-start space-x-3 group"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex-shrink-0 p-1 bg-green-100 rounded-full group-hover:bg-green-200 transition-colors">
                      <CheckCircle size={20} className="text-green-600" />
                    </div>
                    <p className="text-gray-700 text-lg group-hover:text-gray-900 transition-colors">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative animate-fadeIn">
              <div className="relative bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl p-8 shadow-2xl">
                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-2xl"></div>
                <div className="relative space-y-6 text-white">
                  <BarChart3 size={48} className="mb-4" />
                  <h3 className="text-3xl font-bold">Real-time Dashboard</h3>
                  <p className="text-primary-100 text-lg">
                    Track all your expenses in one place with beautiful, interactive charts and comprehensive analytics.
                  </p>
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                      <p className="text-4xl font-bold">$2.5M</p>
                      <p className="text-primary-100 text-sm">Processed</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                      <p className="text-4xl font-bold">98%</p>
                      <p className="text-primary-100 text-sm">Accuracy</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-600 via-purple-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}></div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10 animate-fadeIn">
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            Ready to Transform Your Expense Management?
          </h2>
          <p className="text-xl text-primary-100">
            Join thousands of companies using Expense Manager to streamline their processes
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link 
              to="/register" 
              className="bg-white text-primary-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transform hover:scale-105 transition-all shadow-2xl flex items-center space-x-2"
            >
              <span>Create Free Account</span>
              <ArrowRight size={20} />
            </Link>
            <Link 
              to="/login" 
              className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all flex items-center space-x-2"
            >
              <span>Sign In</span>
            </Link>
          </div>
          <p className="text-primary-100 text-sm">
            <Shield size={16} className="inline mr-2" />
            No credit card required • Free 14-day trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl">
                  <Receipt size={20} className="text-white" />
                </div>
                <span className="text-white font-bold">Expense Manager</span>
              </div>
              <p className="text-sm">
                Modern expense management for modern teams.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm">
            <p>&copy; 2025 Expense Manager. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home
