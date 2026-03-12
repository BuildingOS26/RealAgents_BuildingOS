import { useState, useEffect } from 'react';
import { Plus, Search, FileText, Clock, MapPin, User, Calendar, X, ChevronDown } from 'lucide-react';
import { useAuth } from '../modules/auth/AuthContext';
import { API_URL } from '../lib/api';

interface WorkOrder {
  id: string;
  wo_number: string;
  title: string;
  location_name: string;
  location_building_id: string;
  assigned_user_name: string;
  due_date: string;
  est_time: string;
  status: 'open' | 'in_progress' | 'completed';
  priority: 'normal' | 'high' | 'urgent';
  created_at: string;
}

interface Building {
  id: string;
  name: string;
}

export function WorkOrders() {
  const { profile } = useAuth();
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'in_progress' | 'completed'>('all');
  
  // New work order form state
  const [newWorkOrder, setNewWorkOrder] = useState({
    wo_number: '',
    title: '',
    location_building_id: '',
    due_date: '',
    est_time: '',
    priority: 'normal' as 'normal' | 'high' | 'urgent',
  });

  // Fetch buildings for the dropdown (company-scoped)
  useEffect(() => {
    if (!profile?.company) return;
    
    const fetchBuildings = async () => {
      try {
        const response = await fetch(`${API_URL}/_api/buildings?companyId=${encodeURIComponent(profile.company)}`);
        if (response.ok) {
          const data = await response.json();
          setBuildings(data || []);
        }
      } catch (error) {
        console.error('Error fetching buildings:', error);
      }
    };
    fetchBuildings();
  }, [profile?.company]);

  // Fetch work orders (company-scoped)
  useEffect(() => {
    if (!profile?.company) return;
    
    const fetchWorkOrders = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/_api/work-orders?companyId=${encodeURIComponent(profile.company)}`);
        if (response.ok) {
          const data = await response.json();
          setWorkOrders(data || []);
        }
      } catch (error) {
        console.error('Error fetching work orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkOrders();
  }, [profile?.company]);

  // Create work order
  const handleCreateWorkOrder = async () => {
    if (!newWorkOrder.wo_number || !newWorkOrder.title || !profile?.company) {
      alert('Please fill in WO Number and Title');
      return;
    }

    const selectedBuilding = buildings.find(b => b.id === newWorkOrder.location_building_id);
    
    const workOrderData = {
      ...newWorkOrder,
      company_id: profile.company,
      location_name: selectedBuilding?.name || '',
      assigned_user_name: profile.name || 'Unknown User',
      assigned_user_id: profile.id || '',
      status: 'open',
    };

    try {
      const response = await fetch(`${API_URL}/_api/work-orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workOrderData),
      });

      if (response.ok) {
        const created = await response.json();
        setWorkOrders(prev => [created, ...prev]);
        setShowCreateModal(false);
        setNewWorkOrder({
          wo_number: '',
          title: '',
          location_building_id: '',
          due_date: '',
          est_time: '',
          priority: 'normal',
        });
      }
    } catch (error) {
      console.error('Error creating work order:', error);
    }
  };

  // Filter work orders
  const filteredWorkOrders = workOrders.filter(wo => {
    const matchesSearch = 
      wo.wo_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.location_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || wo.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Stats
  const openCount = workOrders.filter(wo => wo.status === 'open').length;
  const inProgressCount = workOrders.filter(wo => wo.status === 'in_progress').length;
  const completedCount = workOrders.filter(wo => wo.status === 'completed').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-700';
      case 'in_progress': return 'bg-yellow-100 text-yellow-700';
      case 'completed': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700';
      case 'high': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Work Orders</h1>
          <p className="text-gray-600">
            {workOrders.length} maintenance tasks included
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Work Order
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-semibold text-gray-900">{openCount}</p>
              <p className="text-gray-600">Open Tasks</p>
            </div>
            <div className="w-16 h-16 rounded-full border-4 border-blue-500 flex items-center justify-center">
              <span className="text-blue-600 font-medium">{openCount}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-semibold text-gray-900">{inProgressCount}</p>
              <p className="text-gray-600">In Progress</p>
            </div>
            <div className="w-16 h-16 rounded-full border-4 border-yellow-500 flex items-center justify-center">
              <span className="text-yellow-600 font-medium">{inProgressCount}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-semibold text-gray-900">{completedCount}</p>
              <p className="text-gray-600">Completed</p>
            </div>
            <div className="w-16 h-16 rounded-full border-4 border-green-500 flex items-center justify-center">
              <span className="text-green-600 font-medium">{completedCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search work orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'open', 'in_progress', 'completed'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'All' : status === 'in_progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Work Orders List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500">Loading work orders...</p>
          </div>
        ) : filteredWorkOrders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No work orders found</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create First Work Order
            </button>
          </div>
        ) : (
          filteredWorkOrders.map((wo) => (
            <div key={wo.id} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-mono text-gray-500">{wo.wo_number}</span>
                    <h3 className="text-lg font-medium text-gray-900">{wo.title}</h3>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{wo.location_name || 'No location'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{wo.assigned_user_name}</span>
                    </div>
                    {wo.due_date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Due: {new Date(wo.due_date).toLocaleDateString()}</span>
                      </div>
                    )}
                    {wo.est_time && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>Est: {wo.est_time}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {wo.priority !== 'normal' && (
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(wo.priority)}`}>
                      {wo.priority}
                    </span>
                  )}
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(wo.status)}`}>
                    {wo.status === 'in_progress' ? 'In Progress' : wo.status.charAt(0).toUpperCase() + wo.status.slice(1)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                <button className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                  View Files
                </button>
                <button className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                  Add Update
                </button>
                <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Update Status
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Work Order Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-lg p-6 mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Create Work Order</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              {/* WO Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Work Order Number *
                </label>
                <input
                  type="text"
                  placeholder="e.g., WO-2847"
                  value={newWorkOrder.wo_number}
                  onChange={(e) => setNewWorkOrder(prev => ({ ...prev, wo_number: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g., CRAC Filter Replacement"
                  value={newWorkOrder.title}
                  onChange={(e) => setNewWorkOrder(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Location (Building Dropdown) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <div className="relative">
                  <select
                    value={newWorkOrder.location_building_id}
                    onChange={(e) => setNewWorkOrder(prev => ({ ...prev, location_building_id: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                  >
                    <option value="">Select a building</option>
                    {buildings.map((building) => (
                      <option key={building.id} value={building.id}>
                        {building.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Assigned To (Auto-filled) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assigned To
                </label>
                <input
                  type="text"
                  value={profile?.name || 'Current User'}
                  disabled
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={newWorkOrder.due_date}
                  onChange={(e) => setNewWorkOrder(prev => ({ ...prev, due_date: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Estimated Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Time
                </label>
                <input
                  type="text"
                  placeholder="e.g., 2 hours"
                  value={newWorkOrder.est_time}
                  onChange={(e) => setNewWorkOrder(prev => ({ ...prev, est_time: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <div className="flex gap-2">
                  {(['normal', 'high', 'urgent'] as const).map((priority) => (
                    <button
                      key={priority}
                      type="button"
                      onClick={() => setNewWorkOrder(prev => ({ ...prev, priority }))}
                      className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        newWorkOrder.priority === priority
                          ? priority === 'urgent' ? 'bg-red-600 text-white' 
                            : priority === 'high' ? 'bg-orange-600 text-white'
                            : 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateWorkOrder}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Work Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
