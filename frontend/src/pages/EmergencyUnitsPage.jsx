import React, { useState, useEffect } from 'react';
import {
  Ambulance,
  Shield,
  Flame,
  Plus,
  Edit2,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { unitsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const EmergencyUnitsPage = () => {
  const { isOperator, isAdmin } = useAuth();

  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Add / Edit Modal
  const [showModal, setShowModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [modalForm, setModalForm] = useState({
    unit_id: '',
    vehicle_number: '',
    type: 'Ambulance',
    driver_name: '',
    contact_number: '',
    status: 'Available',
    latitude: 40.7128,
    longitude: -74.0060,
  });
  const [formLoading, setFormLoading] = useState(false);

  const fetchUnits = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterType) params.type = filterType;
      if (filterStatus) params.status = filterStatus;
      const res = await unitsApi.getUnits(params);
      setUnits(res.data.units || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, [filterType, filterStatus]);

  const handleOpenAdd = () => {
    setEditingUnit(null);
    setModalForm({
      unit_id: '',
      vehicle_number: '',
      type: 'Ambulance',
      driver_name: '',
      contact_number: '',
      status: 'Available',
      latitude: 40.7128,
      longitude: -74.0060,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (unit) => {
    setEditingUnit(unit);
    setModalForm({
      unit_id: unit.unit_id,
      vehicle_number: unit.vehicle_number,
      type: unit.type,
      driver_name: unit.driver_name,
      contact_number: unit.contact_number,
      status: unit.status,
      latitude: unit.latitude,
      longitude: unit.longitude,
    });
    setShowModal(true);
  };

  const handleDeleteUnit = async (id, code) => {
    if (!window.confirm(`Confirm decommission and removal of unit ${code}?`)) return;
    try {
      await unitsApi.deleteUnit(id);
      fetchUnits();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete unit');
    }
  };

  const handleStatusQuickChange = async (unitId, newStatus) => {
    try {
      await unitsApi.updateUnit(unitId, { status: newStatus });
      fetchUnits();
    } catch (_err) {
      alert('Failed to update status');
    }
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editingUnit) {
        await unitsApi.updateUnit(editingUnit.id, modalForm);
      } else {
        await unitsApi.createUnit(modalForm);
      }
      setShowModal(false);
      fetchUnits();
    } catch (err) {
      alert(err.response?.data?.error || 'Operation failed');
    } finally {
      setFormLoading(false);
    }
  };

  const getStatusColor = (st) => {
    switch (st) {
      case 'Available':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'Assigned':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
      case 'Dispatched':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      case 'Busy':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-600/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Emergency Response Fleet Management
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Active Ambulance, Police, and Fire & Rescue units deployed across sectors
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchUnits}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {isOperator && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-lg shadow-rose-900/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Register Unit</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-wrap items-center gap-3">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none font-mono"
        >
          <option value="">All Unit Types</option>
          <option value="Ambulance">Ambulance</option>
          <option value="Police">Police</option>
          <option value="Fire & Rescue">Fire & Rescue</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none font-mono"
        >
          <option value="">All Statuses</option>
          <option value="Available">Available</option>
          <option value="Assigned">Assigned</option>
          <option value="Dispatched">Dispatched</option>
          <option value="Busy">Busy</option>
          <option value="Offline">Offline</option>
        </select>
      </div>

      {/* Units Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-500 font-mono text-xs">
            Loading emergency units...
          </div>
        ) : units.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 font-mono text-xs">
            No matching emergency units found.
          </div>
        ) : (
          units.map((u) => (
            <div
              key={u.id}
              className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      u.type === 'Ambulance'
                        ? 'bg-sky-500/20 text-sky-400'
                        : u.type === 'Police'
                        ? 'bg-indigo-500/20 text-indigo-400'
                        : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {u.type === 'Ambulance' ? (
                        <Ambulance className="w-5 h-5" />
                      ) : u.type === 'Police' ? (
                        <Shield className="w-5 h-5" />
                      ) : (
                        <Flame className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-mono font-bold text-white text-sm">{u.unit_id}</h3>
                      <p className="text-[11px] text-slate-400 font-mono">{u.type}</p>
                    </div>
                  </div>

                  <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full border font-bold ${getStatusColor(u.status)}`}>
                    {u.status}
                  </span>
                </div>

                <div className="space-y-2 text-xs font-mono pt-3 text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Vehicle Plate:</span>
                    <span className="font-bold text-slate-200">{u.vehicle_number}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Driver / Officer:</span>
                    <span className="text-slate-200 font-sans font-medium">{u.driver_name}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Radio Frequency / Tel:</span>
                    <span className="text-slate-200">{u.contact_number}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Coordinates:</span>
                    <span className="text-slate-400 text-[11px]">
                      {u.latitude.toFixed(4)}, {u.longitude.toFixed(4)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Strip */}
              {isOperator && (
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  {/* Status Toggle Dropdown */}
                  <select
                    value={u.status}
                    onChange={(e) => handleStatusQuickChange(u.id, e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-[11px] font-mono text-slate-300 focus:outline-none"
                  >
                    <option value="Available">Available</option>
                    <option value="Assigned">Assigned</option>
                    <option value="Dispatched">Dispatched</option>
                    <option value="Busy">Busy</option>
                    <option value="Offline">Offline</option>
                  </select>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(u)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                      title="Edit Unit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteUnit(u.id, u.unit_id)}
                        className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 transition-colors"
                        title="Delete Unit"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Unit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl border border-slate-700 max-w-lg w-full bg-slate-900 shadow-2xl">
            <h2 className="text-base font-bold text-white mb-1">
              {editingUnit ? `Edit Emergency Unit: ${editingUnit.unit_id}` : 'Register New Emergency Unit'}
            </h2>
            <p className="text-xs text-slate-400 mb-4 font-mono">Configure dispatch parameters and driver assignment</p>

            <form onSubmit={handleModalSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase font-mono mb-1">
                    Unit ID (Call Sign)
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!editingUnit}
                    value={modalForm.unit_id}
                    onChange={(e) => setModalForm({ ...modalForm, unit_id: e.target.value })}
                    placeholder="e.g. AMB-103"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-mono disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase font-mono mb-1">
                    Vehicle Number
                  </label>
                  <input
                    type="text"
                    required
                    value={modalForm.vehicle_number}
                    onChange={(e) => setModalForm({ ...modalForm, vehicle_number: e.target.value })}
                    placeholder="EMG-NY-7703"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase font-mono mb-1">
                    Unit Type
                  </label>
                  <select
                    value={modalForm.type}
                    onChange={(e) => setModalForm({ ...modalForm, type: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-mono"
                  >
                    <option value="Ambulance">Ambulance</option>
                    <option value="Police">Police</option>
                    <option value="Fire & Rescue">Fire & Rescue</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase font-mono mb-1">
                    Initial Status
                  </label>
                  <select
                    value={modalForm.status}
                    onChange={(e) => setModalForm({ ...modalForm, status: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-mono"
                  >
                    <option value="Available">Available</option>
                    <option value="Assigned">Assigned</option>
                    <option value="Dispatched">Dispatched</option>
                    <option value="Busy">Busy</option>
                    <option value="Offline">Offline</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase font-mono mb-1">
                    Driver / Officer Name
                  </label>
                  <input
                    type="text"
                    required
                    value={modalForm.driver_name}
                    onChange={(e) => setModalForm({ ...modalForm, driver_name: e.target.value })}
                    placeholder="Paramedic John Doe"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase font-mono mb-1">
                    Contact Radio
                  </label>
                  <input
                    type="text"
                    required
                    value={modalForm.contact_number}
                    onChange={(e) => setModalForm({ ...modalForm, contact_number: e.target.value })}
                    placeholder="+1-555-0199"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase font-mono mb-1">
                    Station Latitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={modalForm.latitude}
                    onChange={(e) => setModalForm({ ...modalForm, latitude: parseFloat(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase font-mono mb-1">
                    Station Longitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={modalForm.longitude}
                    onChange={(e) => setModalForm({ ...modalForm, longitude: parseFloat(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-lg shadow-rose-900/30 transition-all disabled:opacity-50"
                >
                  {formLoading ? 'Saving...' : editingUnit ? 'Save Changes' : 'Register Unit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
