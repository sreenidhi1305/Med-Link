import { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Bell,
 
  MapPin,
  Star,

  X,
} from 'lucide-react';
import type { Pharmacy, MedicationStock } from '../../types/pharmacy';

// Mock data - in a real app, this would come from an API
const mockPharmacies: Pharmacy[] = [
  {
    id: '1',
    name: 'Apollo Pharmacy',
    address: '123 Medical St, Bangalore',
    phone: '1800 103 9977',
    distance: 0.5,
    rating: 4.5,
    isOpen: true,
    coordinates: { lat: 12.9716, lng: 77.5946 },
    hours: {
      monday: '8:00 AM - 10:00 PM',
      tuesday: '8:00 AM - 10:00 PM',
      wednesday: '8:00 AM - 10:00 PM',
      thursday: '8:00 AM - 10:00 PM',
      friday: '8:00 AM - 10:00 PM',
      saturday: '9:00 AM - 9:00 PM',
      sunday: '9:00 AM - 9:00 PM',
    },
    trustScore: 95,
  },
  {
    id: '2',
    name: 'HealthPlus Pharmacy',
    address: '456 Wellness Ave, Bangalore',
    phone: '1800 104 1234',
    distance: 3.2,
    rating: 4.0,
    isOpen: false,
    coordinates: { lat: 12.9780, lng: 77.5920 },
    hours: {
      monday: '9:00 AM - 9:00 PM',
      tuesday: '9:00 AM - 9:00 PM',
      wednesday: '9:00 AM - 9:00 PM',
      thursday: '9:00 AM - 9:00 PM',
      friday: '9:00 AM - 9:00 PM',
      saturday: '10:00 AM - 8:00 PM',
      sunday: 'Closed',
    },
    trustScore: 88,
  },
  // Add more pharmacies if needed
];

const mockMedications: MedicationStock[] = [
  {
    id: 'med1',
    name: 'Crocin Advance',
    genericName: 'Paracetamol',
    strength: '650mg',
    form: 'Tablet',
    price: 25.5,
    inStock: true,
    lastUpdated: new Date().toISOString(),
    quantity: 50,
    manufacturer: 'GSK',
    alternatives: [
      { id: 'alt1', name: 'Paracip 650', price: 22.0, inStock: true },
      { id: 'alt2', name: 'Dolo 650', price: 28.5, inStock: true },
    ],
  },
  {
    id: 'med2',
    name: 'Amoxil',
    genericName: 'Amoxicillin',
    strength: '500mg',
    form: 'Capsule',
    price: 40.0,
    inStock: false,
    lastUpdated: new Date().toISOString(),
    quantity: 0,
    manufacturer: 'SmithKline',
    alternatives: [
      { id: 'alt3', name: 'Amoxil-M', price: 38.0, inStock: true },
      { id: 'alt4', name: 'AmoxiCap', price: 35.5, inStock: false },
    ],
  },
  // Add more medications if needed
];

export default function PharmacyInventory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [medications, setMedications] = useState<MedicationStock[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState<'price' | 'distance' | 'rating'>('distance');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedMedication, setSelectedMedication] = useState<MedicationStock | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    inStockOnly: true,
    maxDistance: 5, // km
    minRating: 3,
  });
  const [medSearchQuery, setMedSearchQuery] = useState('');

  // Filter and sort pharmacies + search
  const filteredPharmacies = [...mockPharmacies]
    .filter((pharmacy) => {
      const matchesSearch = pharmacy.name.toLowerCase().includes(searchQuery.toLowerCase());
      return (
        matchesSearch &&
        pharmacy.distance <= filters.maxDistance &&
        pharmacy.rating >= filters.minRating
      );
    })
    .sort((a, b) => {
      if (sortBy === 'distance') {
        return sortOrder === 'asc' ? a.distance - b.distance : b.distance - a.distance;
      } else if (sortBy === 'rating') {
        return sortOrder === 'asc' ? a.rating - b.rating : b.rating - a.rating;
      }
      return 0;
    });

  // Load medications for selected pharmacy (simulate API)
  useEffect(() => {
    if (selectedPharmacy) {
      setIsLoading(true);
      setSelectedMedication(null);
      // Simulate API call
      setTimeout(() => {
        setMedications(mockMedications);
        setIsLoading(false);
      }, 500);
    } else {
      setMedications([]);
      setSelectedMedication(null);
    }
  }, [selectedPharmacy]);

  const handleSort = (field: 'price' | 'distance' | 'rating') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handlePrescriptionTransfer = (pharmacyId: string) => {
    alert(`Initiating prescription transfer to pharmacy ID: ${pharmacyId}`);
  };

  const handleSetPriceAlert = (medication: MedicationStock) => {
    alert(`Setting price alert for ${medication.name} at ₹${medication.price}`);
  };

  // Filter medications based on search and stock filter
  const filteredMedications = medications
    .filter((med) => {
      const matchesSearch = med.name.toLowerCase().includes(medSearchQuery.toLowerCase()) ||
        med.genericName.toLowerCase().includes(medSearchQuery.toLowerCase());
      const stockOk = filters.inStockOnly ? med.inStock : true;
      return matchesSearch && stockOk;
    })
    .sort((a, b) => {
      if (sortBy === 'price') {
        return sortOrder === 'asc' ? a.price - b.price : b.price - a.price;
      }
      return 0; // no sorting on medications by distance/rating
    });

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] bg-gray-50">
      {/* Left sidebar - Pharmacy List */}
      <div className="w-full lg:w-1/3 border-r border-gray-200 bg-white overflow-y-auto">
        <div className="p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Nearby Pharmacies</h2>

          {/* Search and Filter */}
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search pharmacies..."
                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-10 focus:border-emerald-500 focus:ring-emerald-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
                aria-label="Toggle filters"
              >
                <Filter className="h-5 w-5" />
              </button>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">Filters</h3>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="text-gray-500 hover:text-gray-700"
                    aria-label="Close filters"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                        checked={filters.inStockOnly}
                        onChange={() =>
                          setFilters((f) => ({ ...f, inStockOnly: !f.inStockOnly }))
                        }
                      />
                      <span className="ml-2 text-sm text-gray-700">In stock only</span>
                    </label>
                  </div>

                  <div>
                    <label htmlFor="maxDistance" className="block text-sm font-medium text-gray-700 mb-1">
                      Max distance (km): {filters.maxDistance}
                    </label>
                    <input
                      id="maxDistance"
                      type="range"
                      min={1}
                      max={20}
                      step={1}
                      value={filters.maxDistance}
                      onChange={(e) =>
                        setFilters((f) => ({ ...f, maxDistance: Number(e.target.value) }))
                      }
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label htmlFor="minRating" className="block text-sm font-medium text-gray-700 mb-1">
                      Min rating: {filters.minRating}
                    </label>
                    <input
                      id="minRating"
                      type="range"
                      min={1}
                      max={5}
                      step={0.5}
                      value={filters.minRating}
                      onChange={(e) =>
                        setFilters((f) => ({ ...f, minRating: Number(e.target.value) }))
                      }
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pharmacies List */}
        <div>
          {filteredPharmacies.length === 0 ? (
            <p className="p-4 text-gray-600">No pharmacies found matching your criteria.</p>
          ) : (
            filteredPharmacies.map((pharmacy) => (
              <button
                key={pharmacy.id}
                onClick={() => setSelectedPharmacy(pharmacy)}
                className={`w-full text-left border-b border-gray-100 px-4 py-3 flex flex-col hover:bg-emerald-50 ${
                  selectedPharmacy?.id === pharmacy.id ? 'bg-emerald-100' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-md font-semibold">{pharmacy.name}</h3>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded ${
                      pharmacy.isOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {pharmacy.isOpen ? 'Open' : 'Closed'}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{pharmacy.address}</p>
                <div className="mt-1 flex items-center space-x-3 text-xs text-gray-500">
                  <div className="flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span>{pharmacy.distance.toFixed(1)} km</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-3 w-3 mr-1" />
                    <span>{pharmacy.rating.toFixed(1)}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrescriptionTransfer(pharmacy.id);
                    }}
                    className="ml-auto text-emerald-600 hover:text-emerald-800 text-xs font-semibold"
                  >
                    Transfer Prescription
                  </button>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right panel - Pharmacy Details + Medications */}
      <div className="w-full lg:w-2/3 flex flex-col">
        {selectedPharmacy ? (
          <>
            {/* Pharmacy header */}
            <div className="p-6 border-b border-gray-200 bg-white flex flex-col lg:flex-row lg:items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{selectedPharmacy.name}</h2>
                <p className="mt-1 text-gray-600 flex items-center">
                  <MapPin className="h-4 w-4 mr-1.5 text-gray-400" />
                  {selectedPharmacy.address}
                </p>
                <p className="mt-1 text-gray-600">Phone: {selectedPharmacy.phone}</p>
              </div>
              <button
                onClick={() => setSelectedPharmacy(null)}
                className="mt-4 lg:mt-0 text-gray-500 hover:text-gray-700"
                aria-label="Close pharmacy details"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Medication search and sort */}
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search medications..."
                  className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-emerald-500 focus:ring-emerald-500"
                  value={medSearchQuery}
                  onChange={(e) => setMedSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleSort('price')}
                  className="inline-flex items-center gap-1 text-sm text-gray-700 hover:text-emerald-600"
                >
                  Sort by Price
                  <ArrowUpDown className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleSort('distance')}
                  className="inline-flex items-center gap-1 text-sm text-gray-700 hover:text-emerald-600"
                >
                  Sort by Distance
                  <ArrowUpDown className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleSort('rating')}
                  className="inline-flex items-center gap-1 text-sm text-gray-700 hover:text-emerald-600"
                >
                  Sort by Rating
                  <ArrowUpDown className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Medications List */}
            <div className="flex-1 overflow-y-auto p-4 bg-white">
              {isLoading ? (
                <p className="text-gray-600">Loading medications...</p>
              ) : filteredMedications.length === 0 ? (
                <p className="text-gray-600">No medications found.</p>
              ) : (
                <ul className="space-y-4">
                  {filteredMedications.map((med) => (
                    <li
                      key={med.id}
                      onClick={() => setSelectedMedication(med)}
                      className={`cursor-pointer p-3 rounded-lg border ${
                        selectedMedication?.id === med.id
                          ? 'border-emerald-600 bg-emerald-50'
                          : 'border-gray-200 hover:border-emerald-400 hover:bg-emerald-50'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold">{med.name}</h3>
                          <p className="text-sm text-gray-500">
                            {med.strength} {med.form} &middot; ₹{med.price.toFixed(2)}
                          </p>
                        </div>
                        <div
                          className={`text-sm font-semibold px-2 py-0.5 rounded ${
                            med.inStock
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {med.inStock ? 'In Stock' : 'Out of Stock'}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Medication details */}
            {selectedMedication && (
              <div className="border-t border-gray-200 p-6 bg-gray-50">
                <h3 className="text-lg font-semibold mb-2">{selectedMedication.name}</h3>
                <p className="text-gray-700 mb-1">
                  <strong>Generic Name:</strong> {selectedMedication.genericName}
                </p>
                <p className="text-gray-700 mb-1">
                  <strong>Strength:</strong> {selectedMedication.strength}
                </p>
                <p className="text-gray-700 mb-1">
                  <strong>Form:</strong> {selectedMedication.form}
                </p>
                <p className="text-gray-700 mb-1">
                  <strong>Manufacturer:</strong> {selectedMedication.manufacturer}
                </p>
                <p className="text-gray-700 mb-1">
                  <strong>Price:</strong> ₹{selectedMedication.price.toFixed(2)}
                </p>
                <p className="text-gray-700 mb-3">
                  <strong>Quantity Available:</strong> {selectedMedication.quantity}
                </p>
                <p className="text-gray-600 text-sm mb-3">
                  Last updated:{' '}
                  {new Date(selectedMedication.lastUpdated).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
                <button
                  onClick={() => handleSetPriceAlert(selectedMedication)}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                >
                  Set Price Alert
                </button>

                {/* Alternatives */}
                {selectedMedication.alternatives.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold mb-2">Alternatives</h4>
                    <ul className="space-y-2">
                      {selectedMedication.alternatives.map((alt) => (
                        <li
                          key={alt.id}
                          className={`p-3 rounded-lg border ${
                            alt.inStock
                              ? 'border-green-400 bg-green-50'
                              : 'border-red-400 bg-red-50 text-red-600'
                          }`}
                        >
                          <div className="flex justify-between">
                            <span>{alt.name}</span>
                            <span>₹{alt.price.toFixed(2)}</span>
                          </div>
                          <div className="text-xs mt-1">
                            {alt.inStock ? 'In Stock' : 'Out of Stock'}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center p-6">
            <Bell className="h-16 w-16 mb-4" />
            <p className="text-lg">Select a pharmacy to view its medication inventory.</p>
          </div>
        )}
      </div>
    </div>
  );
}
