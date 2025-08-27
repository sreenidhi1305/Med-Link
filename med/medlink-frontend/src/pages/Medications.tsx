import { useState, useEffect } from 'react';
import { Plus, Bell, Pill, Clock3, X } from 'lucide-react';

type Medication = {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  time: string;
  startDate: string;
  endDate?: string;
  notes?: string;
  reminders: boolean;
};

export default function Medications() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMed, setNewMed] = useState<Omit<Medication, 'id'>>({ 
    name: '',
    dosage: '',
    frequency: 'daily',
    time: '08:00',
    startDate: new Date().toISOString().split('T')[0],
    reminders: true
  });

  // Load medications from localStorage
  useEffect(() => {
    const savedMeds = localStorage.getItem('medications');
    if (savedMeds) {
      setMedications(JSON.parse(savedMeds));
    }
  }, []);

  // Save medications to localStorage when they change
  useEffect(() => {
    if (medications.length > 0) {
      localStorage.setItem('medications', JSON.stringify(medications));
    }
  }, [medications]);

  const addMedication = () => {
    const med: Medication = {
      ...newMed,
      id: Date.now().toString(),
    };
    setMedications([...medications, med]);
    setNewMed({ 
      name: '',
      dosage: '',
      frequency: 'daily',
      time: '08:00',
      startDate: new Date().toISOString().split('T')[0],
      reminders: true
    });
    setShowAddForm(false);
  };

  const removeMedication = (id: string) => {
    setMedications(medications.filter(med => med.id !== id));
  };

  const toggleReminder = (id: string) => {
    setMedications(medications.map(med => 
      med.id === id ? { ...med, reminders: !med.reminders } : med
    ));
  };

  // Check for upcoming medications
  const getUpcomingMeds = () => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    return medications.filter(med => {
      if (!med.reminders) return false;
      
      const [hours, minutes] = med.time.split(':').map(Number);
      const medTime = hours * 60 + minutes;
      
      // Show medications due in the next hour
      return medTime >= currentTime && medTime <= currentTime + 60;
    });
  };

  const upcomingMeds = getUpcomingMeds();

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-emerald-700">My Medications</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Plus size={18} /> Add Medication
        </button>
      </div>

      {upcomingMeds.length > 0 && (
        <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r">
          <h2 className="font-medium text-blue-800 flex items-center gap-2">
            <Bell className="h-5 w-5" /> Upcoming Medications
          </h2>
          <div className="mt-2 space-y-2">
            {upcomingMeds.map(med => (
              <div key={med.id} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                <div>
                  <h3 className="font-medium">{med.name}</h3>
                  <p className="text-sm text-gray-600">{med.dosage} • {med.time}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                    Due soon
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {medications.length === 0 ? (
          <div className="text-center py-12">
            <Pill className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No medications added</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by adding your first medication.</p>
            <div className="mt-6">
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none"
              >
                <Plus className="-ml-1 mr-2 h-5 w-5" />
                Add Medication
              </button>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {medications.map((med) => (
              <li key={med.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                        <Pill className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {med.name}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {med.dosage}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            <Clock3 className="mr-1 h-3 w-3" />
                            {med.time}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {med.frequency}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4 flex items-center space-x-2">
                    <div className="flex items-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={med.reminders}
                          onChange={() => toggleReminder(med.id)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>
                    <button
                      onClick={() => removeMedication(med.id)}
                      className="text-gray-400 hover:text-red-500"
                      aria-label="Remove medication"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Add Medication Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Add New Medication</h2>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Medication Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={newMed.name}
                    onChange={(e) => setNewMed({...newMed, name: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                    placeholder="e.g., Ibuprofen"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="dosage" className="block text-sm font-medium text-gray-700">
                      Dosage
                    </label>
                    <input
                      type="text"
                      id="dosage"
                      value={newMed.dosage}
                      onChange={(e) => setNewMed({...newMed, dosage: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                      placeholder="e.g., 200mg"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="frequency" className="block text-sm font-medium text-gray-700">
                      Frequency
                    </label>
                    <select
                      id="frequency"
                      value={newMed.frequency}
                      onChange={(e) => setNewMed({...newMed, frequency: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm"
                    >
                      <option value="daily">Daily</option>
                      <option value="twice">Twice a day</option>
                      <option value="thrice">Three times a day</option>
                      <option value="weekly">Weekly</option>
                      <option value="as_needed">As needed</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="time" className="block text-sm font-medium text-gray-700">
                      Time
                    </label>
                    <input
                      type="time"
                      id="time"
                      value={newMed.time}
                      onChange={(e) => setNewMed({...newMed, time: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                      Start Date
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      value={newMed.startDate}
                      onChange={(e) => setNewMed({...newMed, startDate: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                    Notes (Optional)
                  </label>
                  <textarea
                    id="notes"
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                    placeholder="Any special instructions?"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    id="reminders"
                    name="reminders"
                    type="checkbox"
                    checked={newMed.reminders}
                    onChange={(e) => setNewMed({...newMed, reminders: e.target.checked})}
                    className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor="reminders" className="ml-2 block text-sm text-gray-700">
                    Enable reminders for this medication
                  </label>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={addMedication}
                  disabled={!newMed.name || !newMed.dosage}
                  className={`inline-flex justify-center rounded-md border border-transparent py-2 px-4 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                    !newMed.name || !newMed.dosage
                      ? 'bg-emerald-300 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  Add Medication
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
