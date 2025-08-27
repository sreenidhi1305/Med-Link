import { useState } from 'react';
import { Activity, HeartPulse, Brain, Video, Clock, AlertTriangle, BarChart3 } from 'lucide-react';

type HealthMetric = {
  date: string;
  value: number;
};

type Symptom = {
  id: string;
  name: string;
  severity: 'low' | 'medium' | 'high';
  startDate: string;
  notes?: string;
};

const HealthDashboard = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'symptoms' | 'telehealth' | 'devices'>('overview');
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [newSymptom, setNewSymptom] = useState('');
  
  // Mock health data
  const [healthData, setHealthData] = useState({
    heartRate: generateMockData(7, 60, 100),
    steps: generateMockData(7, 2000, 15000, true),
    sleep: generateMockData(7, 4, 10),
    bloodPressure: {
      systolic: generateMockData(7, 110, 130),
      diastolic: generateMockData(7, 70, 90)
    },
    medications: [
      { id: '1', name: 'Metformin', time: '08:00 AM', taken: true },
      { id: '2', name: 'Lisinopril', time: '08:00 AM', taken: false },
      { id: '3', name: 'Atorvastatin', time: '08:00 PM', taken: false },
    ]
  });

  // Generate mock data for charts
  function generateMockData(days: number, min: number, max: number, isInt = false): HealthMetric[] {
    return Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: isInt 
          ? Math.floor(Math.random() * (max - min + 1)) + min
          : Math.random() * (max - min) + min
      };
    });
  }
  
  // Simple bar chart component
  const SimpleBarChart = ({ data, color = 'emerald' }: { data: HealthMetric[], color?: string }) => {
    const maxValue = Math.max(...data.map(d => d.value));
    const height = 150;
    
    return (
      <div className="flex items-end h-full w-full gap-1 pt-4">
        {data.map((item, i) => {
          const barHeight = (item.value / maxValue) * height;
          return (
            <div key={i} className="flex-1 flex flex-col items-center h-full">
              <div 
                className={`w-full bg-${color}-200 rounded-t-sm`}
                style={{ height: `${barHeight}px` }}
              />
              <div className="text-xs text-gray-500 mt-1">
                {item.date.split(' ')[0]}
              </div>
            </div>
          );
        })}
      </div>
    );
  };



  const addSymptom = () => {
    if (!newSymptom.trim()) return;
    
    const symptom: Symptom = {
      id: Date.now().toString(),
      name: newSymptom.trim(),
      severity: 'medium',
      startDate: new Date().toISOString(),
    };
    
    setSymptoms([...symptoms, symptom]);
    setNewSymptom('');
  };

  const analyzeSymptoms = () => {
    // In a real app, this would call an AI/ML service
    const conditions = [
      'Common Cold (60% match)',
      'Seasonal Allergies (45% match)',
      'Sinus Infection (30% match)'
    ];
    
    alert(`Based on your symptoms, you might have:\n\n${conditions.join('\n')}\n\nPlease consult a healthcare professional for an accurate diagnosis.`);
  };

  const startTelehealth = () => {
    // In a real app, this would initiate a video call
    alert('Connecting you to the next available healthcare provider...');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Health Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back! Here's your health overview.</p>
          </div>
          <div className="mt-4 md:mt-0
           flex space-x-3">
            <button 
              onClick={() => startTelehealth()}
              className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Video className="w-5 h-5 mr-2" />
              Start Video Consultation
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', icon: <BarChart3 className="w-5 h-5 mr-2" />, label: 'Overview' },
              { id: 'symptoms', icon: <AlertTriangle className="w-5 h-5 mr-2" />, label: 'Symptom Checker' },
              { id: 'telehealth', icon: <Video className="w-5 h-5 mr-2" />, label: 'Telehealth' },
              { id: 'devices', icon: <Activity className="w-5 h-5 mr-2" />, label: 'Wearables' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`${activeTab === tab.id
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Health Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard 
                  title="Heart Rate" 
                  value="72" 
                  unit="bpm" 
                  trend="down" 
                  change="5%" 
                  icon={<HeartPulse className="h-6 w-6 text-red-500" />} 
                />
                <StatCard 
                  title="Daily Steps" 
                  value="8,742" 
                  unit="steps" 
                  trend="up" 
                  change="12%" 
                  icon={<Activity className="h-6 w-6 text-blue-500" />} 
                />
                <StatCard 
                  title="Sleep" 
                  value="7.2" 
                  unit="hrs" 
                  trend="up" 
                  change="0.5%" 
                  icon={<Clock className="h-6 w-6 text-purple-500" />} 
                />
                <StatCard 
                  title="Blood Pressure" 
                  value="122/78" 
                  unit="mmHg" 
                  trend="stable" 
                  change="0%" 
                  icon={<Activity className="h-6 w-6 text-green-500" />} 
                />
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-medium mb-4">Heart Rate (Last 7 Days)</h3>
                  <div className="h-48">
                    <SimpleBarChart data={healthData.heartRate} color="red" />
                    <div className="mt-2 text-sm text-center text-gray-500">
                      Avg: {Math.round(healthData.heartRate.reduce((sum, d) => sum + d.value, 0) / healthData.heartRate.length)} bpm
                    </div>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-medium mb-4">Daily Steps (Last 7 Days)</h3>
                  <div className="h-48">
                    <SimpleBarChart data={healthData.steps} color="blue" />
                    <div className="mt-2 text-sm text-center text-gray-500">
                      Total: {healthData.steps.reduce((sum, d) => sum + d.value, 0).toLocaleString()} steps
                    </div>
                  </div>
                </div>
              </div>

              {/* Medications */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Today's Medications</h3>
                  <button className="text-sm text-emerald-600 hover:text-emerald-800">View All</button>
                </div>
                <div className="space-y-2">
                  {healthData.medications.map((med) => (
                    <div key={med.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{med.name}</p>
                        <p className="text-sm text-gray-500">{med.time}</p>
                      </div>
                      <button 
                        className={`px-3 py-1 rounded-full text-sm font-medium ${med.taken ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                        onClick={() => {
                          setHealthData(prev => ({
                            ...prev,
                            medications: prev.medications.map(m => 
                              m.id === med.id ? { ...m, taken: !m.taken } : m
                            )
                          }));
                        }}
                      >
                        {med.taken ? 'Taken' : 'Mark as Taken'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'symptoms' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-3">Track Your Symptoms</h3>
                <div className="flex">
                  <input
                    type="text"
                    value={newSymptom}
                    onChange={(e) => setNewSymptom(e.target.value)}
                    placeholder="Enter a symptom (e.g., headache, fever)"
                    className="flex-1 rounded-l-lg border border-r-0 border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && addSymptom()}
                  />
                  <button
                    onClick={addSymptom}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-r-lg hover:bg-emerald-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              {symptoms.length > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-medium">Your Symptoms</h3>
                    <button
                      onClick={analyzeSymptoms}
                      className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors flex items-center"
                    >
                      <Brain className="w-4 h-4 mr-1" />
                      Analyze Symptoms
                    </button>
                  </div>
                  <div className="space-y-2">
                    {symptoms.map((symptom) => (
                      <div key={symptom.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{symptom.name}</p>
                          <p className="text-sm text-gray-500">
                            Started {new Date(symptom.startDate).toLocaleDateString()}
                          </p>
                        </div>
                        <select
                          value={symptom.severity}
                          onChange={(e) => {
                            setSymptoms(symptoms.map(s => 
                              s.id === symptom.id 
                                ? { ...s, severity: e.target.value as 'low' | 'medium' | 'high' } 
                                : s
                            ));
                          }}
                          className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'telehealth' && (
            <div className="text-center py-12">
              <Video className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">Start a Telehealth Visit</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Connect with a healthcare provider from the comfort of your home.
                Video consultations are secure, private, and available 24/7.
              </p>
              <button
                onClick={startTelehealth}
                className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors inline-flex items-center mx-auto"
              >
                <Video className="w-5 h-5 mr-2" />
                Start Video Consultation
              </button>
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                <FeatureCard 
                  icon={<Clock className="h-6 w-6 text-emerald-600" />}
                  title="24/7 Availability"
                  description="Connect with a doctor anytime, day or night."
                />
                <FeatureCard 
                  icon={<Activity className="h-6 w-6 text-emerald-600" />}
                  title="Health Records"
                  description="Share your health history with your provider."
                />
                <FeatureCard 
                  icon={<HeartPulse className="h-6 w-6 text-emerald-600" />}
                  title="Continuity of Care"
                  description="Follow up with the same doctor for ongoing care."
                />
              </div>
            </div>
          )}

          {activeTab === 'devices' && (
            <div>
              <h3 className="text-lg font-medium mb-6">Connected Wearable Devices</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DeviceCard 
                  name="Apple Watch"
                  type="Smart Watch"
                  connected={true}
                  lastSynced="2 minutes ago"
                  onConnect={() => {}}
                />
                <DeviceCard 
                  name="Fitbit Charge 5"
                  type="Fitness Tracker"
                  connected={false}
                  lastSynced="2 days ago"
                  onConnect={() => {}}
                />
                <DeviceCard 
                  name="Withings Body+"
                  type="Smart Scale"
                  connected={true}
                  lastSynced="1 hour ago"
                  onConnect={() => {}}
                />
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-gray-400 transition-colors cursor-pointer">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">+</span>
                  </div>
                  <h4 className="font-medium text-gray-900">Add New Device</h4>
                  <p className="text-sm text-gray-500 mt-1">Connect your favorite health devices</p>
                </div>
              </div>
              
              <div className="mt-8">
                <h3 className="text-lg font-medium mb-4">Sync Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Automatic Sync</p>
                      <p className="text-sm text-gray-500">Automatically sync data from your devices</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Background Refresh</p>
                      <p className="text-sm text-gray-500">Allow background data refresh</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper Components
const StatCard = ({ title, value, unit, trend, change, icon }: { 
  title: string; 
  value: string; 
  unit: string; 
  trend: 'up' | 'down' | 'stable'; 
  change: string;
  icon: React.ReactNode;
}) => {
  const trendColors = {
    up: 'text-green-600 bg-green-100',
    down: 'text-red-600 bg-red-100',
    stable: 'text-yellow-600 bg-yellow-100',
  };

  const trendIcons = {
    up: '↑',
    down: '↓',
    stable: '→',
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <div className="flex items-baseline mt-1">
            <span className="text-2xl font-bold text-gray-900">{value}</span>
            <span className="ml-1 text-sm text-gray-500">{unit}</span>
          </div>
        </div>
        <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${trendColors[trend]}`}>
          {trendIcons[trend]} {change}
        </div>
      </div>
      <div className="mt-4 flex items-center">
        <div className="p-2 rounded-lg bg-gray-50">
          {icon}
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) => (
  <div className="flex items-start">
    <div className="flex-shrink-0">
      <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-emerald-50">
        {icon}
      </div>
    </div>
    <div className="ml-4">
      <h4 className="text-base font-medium text-gray-900">{title}</h4>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
    </div>
  </div>
);

const DeviceCard = ({ 
  name, 
  type, 
  connected, 
  lastSynced, 
  onConnect 
}: { 
  name: string; 
  type: string; 
  connected: boolean; 
  lastSynced: string; 
  onConnect: () => void;
}) => (
  <div className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start">
      <div>
        <h4 className="font-medium text-gray-900">{name}</h4>
        <p className="text-sm text-gray-500">{type}</p>
      </div>
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        connected ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
      }`}>
        {connected ? 'Connected' : 'Disconnected'}
      </span>
    </div>
    <div className="mt-4 flex items-center justify-between">
      <span className="text-sm text-gray-500">Last synced: {lastSynced}</span>
      <button
        onClick={onConnect}
        className={`px-3 py-1 rounded-full text-sm font-medium ${
          connected 
            ? 'bg-gray-100 text-gray-800 hover:bg-gray-200' 
            : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
        }`}
      >
        {connected ? 'Disconnect' : 'Connect'}
      </button>
    </div>
  </div>
);

export default HealthDashboard;
