import { useState } from 'react';
import { Building, Activity, AlertTriangle, ThermometerSun, Droplets, Zap, Wind, Users, TrendingUp } from 'lucide-react';

export function BuildingView() {
  const [selectedBuilding, setSelectedBuilding] = useState<string>('tower-a');

  const buildings = [
    {
      id: 'tower-a',
      name: 'Tower A',
      address: '123 Main Street',
      floors: 15,
      sqft: '450,000',
      occupancy: 87,
      status: 'operational',
      alerts: 2,
    },
    {
      id: 'tower-b',
      name: 'Tower B',
      address: '125 Main Street',
      floors: 12,
      sqft: '380,000',
      occupancy: 92,
      status: 'operational',
      alerts: 1,
    },
    {
      id: 'building-c',
      name: 'Building C',
      address: '200 Oak Avenue',
      floors: 8,
      sqft: '220,000',
      occupancy: 78,
      status: 'maintenance',
      alerts: 4,
    },
  ];

  const buildingDetails = {
    'tower-a': {
      systems: [
        { name: 'HVAC', status: 'warning', value: '89%', icon: Wind, alert: 'Filter replacement due' },
        { name: 'Electrical', status: 'good', value: '100%', icon: Zap, alert: null },
        { name: 'Water', status: 'good', value: '100%', icon: Droplets, alert: null },
        { name: 'Fire Safety', status: 'good', value: '100%', icon: AlertTriangle, alert: null },
      ],
      environmentals: {
        temperature: '72°F',
        humidity: '45%',
        airQuality: 'Good',
        energyUsage: '2,450 kWh',
      },
      recentIssues: [
        { floor: 8, issue: 'HVAC Filter Replacement Needed', priority: 'high', time: '2 hours ago' },
        { floor: 12, issue: 'Conference Room AC', priority: 'medium', time: '1 day ago' },
      ],
      upcomingMaintenance: [
        { task: 'Elevator Annual Inspection', date: 'Dec 5, 2024', type: 'Required' },
        { task: 'Fire Alarm Test', date: 'Dec 15, 2024', type: 'Scheduled' },
      ],
    },
    'tower-b': {
      systems: [
        { name: 'HVAC', status: 'good', value: '94%', icon: Wind, alert: null },
        { name: 'Electrical', status: 'good', value: '100%', icon: Zap, alert: null },
        { name: 'Water', status: 'warning', value: '95%', icon: Droplets, alert: 'Minor leak on Floor 5' },
        { name: 'Fire Safety', status: 'good', value: '100%', icon: AlertTriangle, alert: null },
      ],
      environmentals: {
        temperature: '71°F',
        humidity: '48%',
        airQuality: 'Good',
        energyUsage: '2,180 kWh',
      },
      recentIssues: [
        { floor: 5, issue: 'Restroom Water Leak', priority: 'medium', time: '1 day ago' },
      ],
      upcomingMaintenance: [
        { task: 'Fire Suppression Test', date: 'Dec 2, 2024', type: 'Required' },
        { task: 'HVAC Quarterly Service', date: 'Jan 10, 2025', type: 'Scheduled' },
      ],
    },
    'building-c': {
      systems: [
        { name: 'HVAC', status: 'good', value: '91%', icon: Wind, alert: null },
        { name: 'Electrical', status: 'warning', value: '98%', icon: Zap, alert: 'Exit light repair needed' },
        { name: 'Water', status: 'good', value: '100%', icon: Droplets, alert: null },
        { name: 'Fire Safety', status: 'warning', value: '95%', icon: AlertTriangle, alert: 'Exit light issue' },
      ],
      environmentals: {
        temperature: '70°F',
        humidity: '42%',
        airQuality: 'Excellent',
        energyUsage: '1,320 kWh',
      },
      recentIssues: [
        { floor: 3, issue: 'Emergency Exit Light Repair', priority: 'high', time: '5 hours ago' },
        { floor: 6, issue: 'Thermostat Calibration', priority: 'low', time: '2 days ago' },
      ],
      upcomingMaintenance: [
        { task: 'Generator Quarterly Test', date: 'Nov 30, 2024', type: 'Required' },
        { task: 'Parking Lot Lighting Check', date: 'Dec 8, 2024', type: 'Scheduled' },
      ],
    },
  };

  const selected = buildings.find(b => b.id === selectedBuilding)!;
  const details = buildingDetails[selectedBuilding as keyof typeof buildingDetails];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">Building Management</h1>
        <p className="text-gray-600">
          Monitor and manage all your properties in real-time
        </p>
      </div>

      {/* Building Selection */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {buildings.map((building) => (
          <button
            key={building.id}
            onClick={() => setSelectedBuilding(building.id)}
            className={`text-left p-6 rounded-xl border-2 transition-all ${
              selectedBuilding === building.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building className="w-6 h-6 text-blue-600" />
              </div>
              {building.alerts > 0 && (
                <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                  {building.alerts} alerts
                </span>
              )}
            </div>
            <h3 className="text-gray-900 mb-1">{building.name}</h3>
            <p className="text-sm text-gray-600 mb-3">{building.address}</p>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>{building.floors} floors</span>
              <span>•</span>
              <span>{building.sqft} sq ft</span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600"
                  style={{ width: `${building.occupancy}%` }}
                />
              </div>
              <span className="text-sm text-gray-600">{building.occupancy}%</span>
            </div>
          </button>
        ))}
      </div>

      {/* Building Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Systems Status */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <ThermometerSun className="w-5 h-5 text-orange-600" />
                <span className="text-sm text-gray-600">Temperature</span>
              </div>
              <div className="text-gray-900">{details.environmentals.temperature}</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Droplets className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-gray-600">Humidity</span>
              </div>
              <div className="text-gray-900">{details.environmentals.humidity}</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Wind className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-600">Air Quality</span>
              </div>
              <div className="text-gray-900">{details.environmentals.airQuality}</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-yellow-600" />
                <span className="text-sm text-gray-600">Energy</span>
              </div>
              <div className="text-gray-900">{details.environmentals.energyUsage}</div>
            </div>
          </div>

          {/* Systems */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-gray-900 mb-4">Building Systems</h2>
            <div className="space-y-4">
              {details.systems.map((system, index) => {
                const Icon = system.icon;
                return (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        system.status === 'good' ? 'bg-green-100' :
                        system.status === 'warning' ? 'bg-orange-100' :
                        'bg-red-100'
                      }`}>
                        <Icon className={`w-5 h-5 ${
                          system.status === 'good' ? 'text-green-600' :
                          system.status === 'warning' ? 'text-orange-600' :
                          'text-red-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-gray-900">{system.name}</h3>
                          {system.status === 'good' && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                              Operational
                            </span>
                          )}
                          {system.status === 'warning' && (
                            <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">
                              Needs Attention
                            </span>
                          )}
                        </div>
                        {system.alert && (
                          <p className="text-sm text-gray-600">{system.alert}</p>
                        )}
                      </div>
                      <div className="text-gray-900">{system.value}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Issues */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-gray-900 mb-4">Recent Issues</h2>
            <div className="space-y-3">
              {details.recentIssues.map((issue, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`w-1 h-12 rounded-full ${
                      issue.priority === 'high' ? 'bg-red-500' :
                      issue.priority === 'medium' ? 'bg-orange-500' :
                      'bg-blue-500'
                    }`} />
                    <div className="flex-1">
                      <h3 className="text-gray-900 mb-1">Floor {issue.floor}: {issue.issue}</h3>
                      <p className="text-sm text-gray-600">{issue.time}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      issue.priority === 'high' ? 'bg-red-100 text-red-700' :
                      issue.priority === 'medium' ? 'bg-orange-100 text-orange-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {issue.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Building Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-gray-900 mb-4">Building Information</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Floors</span>
                <span className="text-gray-900">{selected.floors}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Square Footage</span>
                <span className="text-gray-900">{selected.sqft} sq ft</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Occupancy</span>
                <span className="text-gray-900">{selected.occupancy}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Status</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  selected.status === 'operational' ? 'bg-green-100 text-green-700' :
                  'bg-orange-100 text-orange-700'
                }`}>
                  {selected.status}
                </span>
              </div>
            </div>
          </div>

          {/* Upcoming Maintenance */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-gray-900 mb-4">Upcoming Maintenance</h3>
            <div className="space-y-3">
              {details.upcomingMaintenance.map((item, index) => (
                <div key={index} className="pb-3 border-b border-gray-200 last:border-0 last:pb-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="text-sm text-gray-900">{item.task}</h4>
                    <span className={`px-2 py-1 rounded text-xs whitespace-nowrap ${
                      item.type === 'Required' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {item.type}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">{item.date}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-6">
            <h3 className="text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                Create Work Order
              </button>
              <button className="w-full py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                View Floor Plans
              </button>
              <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                Ask AI About Building
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
