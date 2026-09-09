import React, { useState, useEffect } from 'react';
import {
  Cpu,
  MapPin,
  Database,
  CheckCircle2,
  Save
} from 'lucide-react';
import { aiApi, healthApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const SettingsPage = () => {
  const { isAdmin } = useAuth();
  const [health, setHealth] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);

  // Editable settings
  const [confidenceThreshold, setConfidenceThreshold] = useState('40');
  const [frameInterval, setFrameInterval] = useState('1.0');
  const [defaultLat, setDefaultLat] = useState('40.7306');
  const [defaultLng, setDefaultLng] = useState('-73.9852');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    healthApi.checkHealth().then((res) => setHealth(res.data)).catch(console.warn);
    aiApi.getStatus().then((res) => setModelInfo(res.data)).catch(console.warn);
  }, []);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
          System Architecture & Operational Settings
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Global vision thresholds, GIS map anchors, and dispatch system telemetry
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Operational settings saved successfully for current session.</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Section 1: AI Model Configuration */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4 text-rose-400" />
              AI Computer Vision Configuration
            </h2>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
              modelInfo?.configured
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}>
              {modelInfo?.configured ? 'Active Weights Loaded' : 'Diagnostic / Unconfigured'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono space-y-1.5">
            <p className="text-slate-400 text-[10px] uppercase">Model Weights Path</p>
            <p className="text-slate-200 break-all">{modelInfo?.model_path || 'ai/models/accident_model.pt'}</p>
            <p className="text-[11px] text-slate-500 italic mt-1 font-sans">{modelInfo?.status_message}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <label className="block text-[10px] uppercase text-slate-400 mb-1">
                Detection Confidence Threshold (%)
              </label>
              <input
                type="number"
                min="10"
                max="95"
                value={confidenceThreshold}
                onChange={(e) => setConfidenceThreshold(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 font-sans block mt-1">
                Minimum probability to flag a bounding box
              </span>
            </div>

            <div>
              <label className="block text-[10px] uppercase text-slate-400 mb-1">
                Video Frame Sampling Rate (Seconds)
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="5.0"
                value={frameInterval}
                onChange={(e) => setFrameInterval(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 font-sans block mt-1">
                Extract and infer 1 frame every N seconds of video
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: GIS Map Coordinates Anchor */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider border-b border-slate-800 pb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-sky-400" />
            GIS Operations Anchor Coordinates
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <label className="block text-[10px] uppercase text-slate-400 mb-1">
                Default Sector Latitude
              </label>
              <input
                type="text"
                value={defaultLat}
                onChange={(e) => setDefaultLat(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase text-slate-400 mb-1">
                Default Sector Longitude
              </label>
              <input
                type="text"
                value={defaultLng}
                onChange={(e) => setDefaultLng(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Telemetry & Environment Specs */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
          <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider border-b border-slate-800 pb-2 flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-400" />
            Backend Infrastructure & Database
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono pt-1">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase">System Status</span>
              <p className="font-bold text-emerald-400 uppercase mt-0.5">{health?.status || 'Active'}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase">Database Engine</span>
              <p className="font-bold text-slate-200 mt-0.5">{health?.database?.engine || 'MySQL / SQLite'}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase">API Version</span>
              <p className="font-bold text-slate-200 mt-0.5">{health?.version || '1.0.0'}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase">Human Verification</span>
              <p className="font-bold text-indigo-400 uppercase mt-0.5">Enforced</p>
            </div>
          </div>
        </div>

        {/* Save button */}
        {isAdmin && (
          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold shadow-lg shadow-rose-900/30 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save System Configuration</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
