import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, ArrowRight, Pill, Bell, RefreshCw } from 'lucide-react';
import PharmacyInventory from '../components/pharmacy/PharmacyInventory';

export default function PharmacyFinder() {
  const [activeTab, setActiveTab] = useState<'map' | 'list'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // In a real app, we would update the search results here
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-emerald-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight">Find Medications Near You</h1>
            <p className="mt-4 text-lg text-emerald-100">
              Compare prices, check real-time inventory, and get the best deals on your prescriptions.
            </p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mt-8">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-4 border border-transparent rounded-lg bg-white/20 placeholder-emerald-100 text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-emerald-600"
                  placeholder="Search for medications, pharmacies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-emerald-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="animate-spin -ml-1 mr-2 h-4 w-4" />
                      Searching...
                    </>
                  ) : (
                    <>
                      Search
                      <ArrowRight className="ml-2 -mr-1 h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
            
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/medications')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-emerald-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
                <Pill className="-ml-1 mr-2 h-5 w-5" />
                My Medications
              </button>
              <button className="inline-flex items-center px-4 py-2 border border-white/30 text-sm font-medium rounded-md text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
                <Bell className="-ml-1 mr-2 h-5 w-5" />
                Set Price Alerts
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('list')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'list'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'map'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Map View
            </button>
          </nav>
        </div>
        
        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {activeTab === 'list' ? (
            <PharmacyInventory />
          ) : (
            <div className="p-8 text-center text-gray-500">
              <MapPin className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">Map View Coming Soon</h3>
              <p className="mt-1">We're working on bringing you an interactive map view.</p>
              <button
                onClick={() => setActiveTab('list')}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
                Back to List View
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
