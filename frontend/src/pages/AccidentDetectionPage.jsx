import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  FileImage,
  FileVideo,
  Cpu,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  Save,
  ShieldCheck,
  RefreshCw,
  Info,
  Layers,
  MapPin
} from 'lucide-react';
import { aiApi, accidentsApi } from '../services/api';
import { SeverityBadge } from '../components/SeverityBadge';
import { useAuth } from '../context/AuthContext';

export const AccidentDetectionPage = () => {
  const { isOperator } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('image'); // 'image' or 'video'
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [modelStatus, setModelStatus] = useState(null);

  // Incident registration form fields
  const [incidentAddress, setIncidentAddress] = useState('Intersection of 5th Ave & 42nd St, NY');
  const [incidentLat, setIncidentLat] = useState(40.7527);
  const [incidentLng, setIncidentLng] = useState(-73.9818);
  const [savingIncident, setSavingIncident] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(null);

  useEffect(() => {
    aiApi.getStatus().then((res) => {
      setModelStatus(res.data);
    }).catch((e) => console.warn('Could not read AI status:', e));
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError('');
      setSavedSuccess(null);
    }
  };

  const handleRunAnalysis = async () => {
    if (!selectedFile) {
      setError('Please select or upload a media file first.');
      return;
    }

    setAnalyzing(true);
    setError('');
    setResult(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      let res;
      if (activeTab === 'image') {
        res = await aiApi.analyzeImage(formData);
      } else {
        res = await aiApi.analyzeVideo(formData);
      }
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'AI analysis failed to process file.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveIncident = async (autoVerify = false) => {
    if (!result) return;
    setSavingIncident(true);
    try {
      const detection = result.detection;
      const payload = {
        detection_id: detection.id,
        latitude: incidentLat,
        longitude: incidentLng,
        address: incidentAddress,
        description: `AI Detection: ${detection.severity} potential accident detected with ${detection.confidence_score}% confidence score. Objects identified: ${Array.isArray(detection.detected_objects) ? detection.detected_objects.join(', ') : 'None'}.`,
        severity: detection.severity,
        ai_confidence: detection.confidence_score,
      };

      const res = await accidentsApi.createAccident(payload);
      const newAccident = res.data.accident;

      if (autoVerify && isOperator) {
        await accidentsApi.verifyAccident(newAccident.id, {
          verification_status: 'Verified',
          severity: detection.severity,
        });
        newAccident.verification_status = 'Verified';
      }

      setSavedSuccess(newAccident);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to register incident in database.');
    } finally {
      setSavingIncident(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            AI Road Accident Computer Vision
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Real-time inference pipeline for traffic surveillance media
          </p>
        </div>

        {/* Model Transparency Status Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          <Cpu className="w-4 h-4 text-indigo-400" />
          <div className="text-left">
            <p className="text-[10px] text-slate-400 uppercase font-mono">Inference Engine</p>
            <p className="font-semibold text-slate-200">
              {modelStatus?.configured ? 'Trained Accident Weights Active' : 'Diagnostic / Configurable Mode'}
            </p>
          </div>
        </div>
      </div>

      {/* Scientific Limitation Notice per Section 1 & Section 7 */}
      <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30 flex items-start gap-3 text-xs text-indigo-200">
        <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-white uppercase font-mono tracking-wider">Scientific Operational Notice: </span>
          <span>
            AI detection represents probabilistic machine inference and does not claim 100% real-world accuracy.
            Per public safety protocol, all AI detections are marked as <strong>Pending Human Verification</strong> before any emergency dispatch can be authorized.
          </span>
        </div>
      </div>

      {/* Media Type Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => {
            setActiveTab('image');
            setSelectedFile(null);
            setPreviewUrl(null);
            setResult(null);
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'image'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <FileImage className="w-4 h-4" />
          <span>Upload Image</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('video');
            setSelectedFile(null);
            setPreviewUrl(null);
            setResult(null);
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'video'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <FileVideo className="w-4 h-4" />
          <span>Upload Video</span>
        </button>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 flex items-center gap-2.5 text-xs text-rose-300">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Upload & Preview on Left, AI Inference Result on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Upload Box & Media Preview */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800">
            <h2 className="text-sm font-bold text-white mb-1">Upload Media For Inspection</h2>
            <p className="text-xs text-slate-400 mb-4">
              Supported formats: {activeTab === 'image' ? 'JPG, PNG, WEBP, BMP' : 'MP4, AVI, MOV, WEBM'} (Max 32MB)
            </p>

            {/* Drop Zone */}
            <label className="border-2 border-dashed border-slate-700 hover:border-rose-500/50 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer bg-slate-900/40 hover:bg-slate-900/70 transition-all">
              <UploadCloud className="w-10 h-10 text-slate-500 mb-2" />
              <p className="text-xs font-semibold text-slate-200">
                {selectedFile ? selectedFile.name : `Click or drag road ${activeTab} to analyze`}
              </p>
              <p className="text-[10px] text-slate-400 font-mono mt-1">
                {selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB` : 'Surveillance camera footage or scene photo'}
              </p>
              <input
                type="file"
                accept={activeTab === 'image' ? 'image/*' : 'video/*'}
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {/* Action Buttons */}
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono">
                {selectedFile ? 'Media ready for ingestion' : 'No file selected'}
              </span>

              <button
                onClick={handleRunAnalysis}
                disabled={!selectedFile || analyzing}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold shadow-lg shadow-rose-900/30 transition-all disabled:opacity-40"
              >
                {analyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing Inference...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Run AI Analysis</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Media Preview Box */}
          {previewUrl && (
            <div className="glass-panel p-4 rounded-2xl border border-slate-800">
              <h3 className="text-xs font-bold text-slate-400 uppercase font-mono mb-3">
                {result?.detection?.result_media_path ? 'AI Vision Bounding Box Overlay' : 'Source Media Preview'}
              </h3>
              <div className="relative rounded-xl overflow-hidden bg-black flex items-center justify-center max-h-96">
                {activeTab === 'image' ? (
                  <img
                    src={result?.detection?.result_media_path ? `/${result.detection.result_media_path}` : previewUrl}
                    alt="Preview"
                    className="w-full h-auto max-h-96 object-contain"
                  />
                ) : (
                  <video src={previewUrl} controls className="w-full h-auto max-h-96" />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: AI Analysis Result Panel (Section 8 Format) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <h2 className="text-sm font-bold text-white tracking-wide uppercase font-mono flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-rose-400" />
                  AI Analysis Result
                </h2>
                {result && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    {result.detection.inference_time_ms}ms
                  </span>
                )}
              </div>

              {!result ? (
                <div className="py-16 text-center text-slate-500 space-y-2">
                  <Layers className="w-8 h-8 mx-auto opacity-40" />
                  <p className="text-xs font-mono">Upload media and click "Run AI Analysis"</p>
                  <p className="text-[11px] text-slate-400">Structured telemetry will render here</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Detection status */}
                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                    <p className="text-[10px] text-slate-400 uppercase font-mono">Detection</p>
                    <p className={`text-base font-bold ${result.detection.is_accident_detected ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {result.detection.is_accident_detected ? 'Possible Road Accident' : 'No Incident Detected'}
                    </p>
                  </div>

                  {/* Confidence & Severity */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                      <p className="text-[10px] text-slate-400 uppercase font-mono">Confidence</p>
                      <p className="text-xl font-mono font-black text-white">
                        {result.detection.confidence_score}%
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                      <p className="text-[10px] text-slate-400 uppercase font-mono">Severity</p>
                      <div className="mt-1">
                        <SeverityBadge severity={result.detection.severity} size="lg" pulse={result.detection.severity === 'Critical'} />
                      </div>
                    </div>
                  </div>

                  {/* Detected Objects List */}
                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                    <p className="text-[10px] text-slate-400 uppercase font-mono mb-2">Detected Objects / Features</p>
                    <div className="flex flex-wrap gap-1.5">
                      {Array.isArray(result.detection.detected_objects) && result.detection.detected_objects.length > 0 ? (
                        result.detection.detected_objects.map((obj, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-slate-800 text-[11px] font-mono text-slate-200 border border-slate-700"
                          >
                            {obj}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-500 font-mono">No specific objects classified</span>
                      )}
                    </div>
                  </div>

                  {/* Operational Status */}
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-amber-400 uppercase font-mono">Status</p>
                      <p className="text-xs font-bold text-amber-300">Pending Human Verification</p>
                    </div>
                    <ShieldCheck className="w-5 h-5 text-amber-400" />
                  </div>

                  {/* Location assignment for incident recording */}
                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                    <p className="text-[10px] text-slate-400 uppercase font-mono flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-400" /> Incident Location
                    </p>
                    <input
                      type="text"
                      value={incidentAddress}
                      onChange={(e) => setIncidentAddress(e.target.value)}
                      placeholder="Street address or highway marker"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none font-mono"
                    />
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <input
                        type="number"
                        step="0.0001"
                        value={incidentLat}
                        onChange={(e) => setIncidentLat(parseFloat(e.target.value))}
                        placeholder="Latitude"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-slate-300 font-mono text-xs"
                      />
                      <input
                        type="number"
                        step="0.0001"
                        value={incidentLng}
                        onChange={(e) => setIncidentLng(parseFloat(e.target.value))}
                        placeholder="Longitude"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-slate-300 font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Save & Verification Action Buttons (Section 8) */}
            {result && !savedSuccess && (
              <div className="pt-4 border-t border-slate-800 space-y-2 mt-4">
                <button
                  onClick={() => handleSaveIncident(false)}
                  disabled={savingIncident}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Incident (Pending Verification)</span>
                </button>

                {isOperator && (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleSaveIncident(true)}
                      disabled={savingIncident}
                      className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950/40"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Verify Incident</span>
                    </button>
                    <button
                      onClick={() => {
                        setResult(null);
                        setSelectedFile(null);
                        setPreviewUrl(null);
                      }}
                      className="py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {savedSuccess && (
              <div className="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
                <p className="text-xs font-bold text-white">Incident Saved: {savedSuccess.incident_id}</p>
                <p className="text-[11px] text-slate-400">
                  Status: {savedSuccess.verification_status} ({savedSuccess.response_status})
                </p>
                <button
                  onClick={() => navigate(`/incidents/${savedSuccess.id}`)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-all mt-2 inline-block"
                >
                  View Incident Record &rarr;
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
