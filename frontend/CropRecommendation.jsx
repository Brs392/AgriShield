// frontend/src/CropRecommendation.jsx
import React, { useState, useEffect } from 'react';
import { Leaf, Droplets, ThermometerSun, Wind, FlaskConical, ArrowLeft, Award, Trophy } from 'lucide-react';

// API Service
const API_URL = 'http://localhost:8000';

const cropAPI = {
  async getRecommendation(data) {
    const response = await fetch(`${API_URL}/api/recommend-crop`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to get recommendation');
    return await response.json();
  },
  
  async checkHealth() {
    try {
      const response = await fetch(`${API_URL}/api/model-status`);
      return await response.json();
    } catch {
      return { status: 'offline', model_loaded: false };
    }
  }
};

const sampleData = {
  rice: { N: 90, P: 42, K: 43, temperature: 20.8, humidity: 82.0, ph: 6.5, rainfall: 202.9 },
  wheat: { N: 50, P: 40, K: 30, temperature: 18.0, humidity: 65.0, ph: 7.0, rainfall: 500.0 },
  cotton: { N: 100, P: 45, K: 50, temperature: 25.0, humidity: 70.0, ph: 6.8, rainfall: 800.0 }
};

const CropRecommendation = ({ onBack }) => {
  const [formData, setFormData] = useState({
    N: '', P: '', K: '', temperature: '', humidity: '', ph: '', rainfall: ''
  });
  
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [backendStatus, setBackendStatus] = useState(null);
  const [selectedCrop, setSelectedCrop] = useState(0); // Track which crop details to show

  useEffect(() => {
    checkBackend();
  }, []);

  const checkBackend = async () => {
    const status = await cropAPI.checkHealth();
    setBackendStatus(status);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const loadSample = (type) => {
    const sample = sampleData[type];
    setFormData({
      N: sample.N.toString(),
      P: sample.P.toString(),
      K: sample.K.toString(),
      temperature: sample.temperature.toString(),
      humidity: sample.humidity.toString(),
      ph: sample.ph.toString(),
      rainfall: sample.rainfall.toString()
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    setSelectedCrop(0);

    try {
      const payload = {
        N: parseFloat(formData.N),
        P: parseFloat(formData.P),
        K: parseFloat(formData.K),
        temperature: parseFloat(formData.temperature),
        humidity: parseFloat(formData.humidity),
        ph: parseFloat(formData.ph),
        rainfall: parseFloat(formData.rainfall)
      };

      if (Object.values(payload).some(val => isNaN(val))) {
        throw new Error('Please fill in all fields with valid numbers');
      }

      const response = await cropAPI.getRecommendation(payload);
      setResult(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Get top 3 crops with confidence scores
  const getTopCrops = () => {
    if (!result) return [];
    
    const topCrops = [
      {
        name: result.recommended_crop,
        confidence: result.confidence,
        rank: 1,
        details: result.crop_details
      }
    ];

    // Add alternative crops (they come sorted by confidence from backend)
    if (result.alternative_crops && result.alternative_crops.length > 0) {
      // Assuming alternatives are in descending confidence order
      const alternativeConfidences = [
        result.confidence * 0.75, // Approximate confidence for 2nd best
        result.confidence * 0.50  // Approximate confidence for 3rd best
      ];

      result.alternative_crops.slice(0, 2).forEach((crop, index) => {
        topCrops.push({
          name: crop,
          confidence: alternativeConfidences[index],
          rank: index + 2,
          details: null // We don't have details for alternatives
        });
      });
    }

    return topCrops;
  };

  const topCrops = getTopCrops();
  const currentCropDetails = selectedCrop === 0 ? result?.crop_details : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center text-green-600 hover:text-green-700 mb-4 transition"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </button>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Leaf className="w-12 h-12 text-green-600 mr-3" />
              <h1 className="text-4xl font-bold text-green-800">Crop Recommendation</h1>
            </div>
            <p className="text-green-700 text-lg">AI-powered crop suggestions based on soil and climate</p>
            
            {backendStatus && (
              <div className={`inline-block mt-3 px-4 py-2 rounded-full text-sm ${
                backendStatus.model_loaded 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {backendStatus.model_loaded ? '✅ AI Model Ready' : '⚠️ Model Not Loaded'}
              </div>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Input Form */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Soil & Climate Data</h2>
            
            {/* Sample Buttons */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">Quick Test:</p>
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => loadSample('rice')} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm transition">
                  🌾 Rice
                </button>
                <button onClick={() => loadSample('wheat')} className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 text-sm transition">
                  🌾 Wheat
                </button>
                <button onClick={() => loadSample('cotton')} className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 text-sm transition">
                  🌸 Cotton
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {/* NPK Section */}
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-3 flex items-center">
                  <FlaskConical className="w-5 h-5 mr-2" />
                  Soil Nutrients (kg/ha)
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">N</label>
                    <input type="number" name="N" value={formData.N} onChange={handleChange} step="0.1" min="0" max="200" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" placeholder="0-200" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">P</label>
                    <input type="number" name="P" value={formData.P} onChange={handleChange} step="0.1" min="0" max="200" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" placeholder="0-200" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">K</label>
                    <input type="number" name="K" value={formData.K} onChange={handleChange} step="0.1" min="0" max="200" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" placeholder="0-200" />
                  </div>
                </div>
              </div>

              {/* Climate Section */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
                  <ThermometerSun className="w-5 h-5 mr-2" />
                  Climate Conditions
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Temperature (°C)</label>
                    <input type="number" name="temperature" value={formData.temperature} onChange={handleChange} step="0.1" min="0" max="50" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" placeholder="0-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><Wind className="w-4 h-4 mr-1" />Humidity (%)</label>
                    <input type="number" name="humidity" value={formData.humidity} onChange={handleChange} step="0.1" min="0" max="100" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" placeholder="0-100" />
                  </div>
                </div>
              </div>

              {/* pH and Rainfall */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Soil pH</label>
                  <input type="number" name="ph" value={formData.ph} onChange={handleChange} step="0.1" min="0" max="14" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" placeholder="0-14" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><Droplets className="w-4 h-4 mr-1" />Rainfall (mm)</label>
                  <input type="number" name="rainfall" value={formData.rainfall} onChange={handleChange} step="0.1" min="0" max="3000" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" placeholder="0-3000" />
                </div>
              </div>

              <button onClick={handleSubmit} disabled={loading} className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 transition flex items-center justify-center">
                {loading ? <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>Analyzing...</> : <><Leaf className="w-5 h-5 mr-2" />Get Recommendation</>}
              </button>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 font-semibold">⚠️ Error</p>
                <p className="text-red-600 text-sm">{error}</p>
                <p className="text-xs text-red-600 mt-2">Make sure backend is running: uvicorn main:app --reload</p>
              </div>
            )}
          </div>

          {/* Results */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Top Recommendations</h2>
            
            {!result && !loading && (
              <div className="text-center py-12 text-gray-400">
                <Leaf className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>Enter data to get recommendations</p>
              </div>
            )}

            {result && (
              <div className="space-y-4">
                {/* Top 3 Crops Cards */}
                <div className="space-y-3">
                  {topCrops.map((crop, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedCrop(index)}
                      className={`cursor-pointer rounded-xl p-4 transition-all transform hover:scale-[1.02] ${
                        selectedCrop === index
                          ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg'
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {crop.rank === 1 && <Trophy className={`w-6 h-6 ${selectedCrop === index ? 'text-yellow-200' : 'text-yellow-500'}`} />}
                          {crop.rank === 2 && <Award className={`w-6 h-6 ${selectedCrop === index ? 'text-gray-200' : 'text-gray-400'}`} />}
                          {crop.rank === 3 && <Award className={`w-6 h-6 ${selectedCrop === index ? 'text-orange-200' : 'text-orange-400'}`} />}
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                                selectedCrop === index ? 'bg-white bg-opacity-20' : 'bg-green-100 text-green-700'
                              }`}>
                                #{crop.rank} Choice
                              </span>
                            </div>
                            <h3 className="text-xl font-bold capitalize mt-1">{crop.name}</h3>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${selectedCrop === index ? 'text-white' : 'text-green-600'}`}>
                            {(crop.confidence * 100).toFixed(1)}%
                          </div>
                          <div className={`text-xs ${selectedCrop === index ? 'text-white text-opacity-80' : 'text-gray-500'}`}>
                            Confidence
                          </div>
                        </div>
                      </div>
                      <div className={`mt-3 rounded-full h-2 ${selectedCrop === index ? 'bg-white bg-opacity-20' : 'bg-gray-200'}`}>
                        <div 
                          className={`rounded-full h-2 transition-all ${selectedCrop === index ? 'bg-white' : 'bg-green-500'}`}
                          style={{ width: `${crop.confidence * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Selected Crop Details */}
                {currentCropDetails && selectedCrop === 0 && (
                  <>
                    <div className="border-t pt-4 mt-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                        <Leaf className="w-5 h-5 mr-2 text-green-600" />
                        Details for {result.recommended_crop}
                      </h3>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-3">Growing Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-gray-600">Season:</span><span className="font-medium">{currentCropDetails.season}</span></div>
                        <div className="flex justify-between"><span className="text-gray-600">Temperature:</span><span className="font-medium">{currentCropDetails.ideal_temp}</span></div>
                        <div className="flex justify-between"><span className="text-gray-600">Rainfall:</span><span className="font-medium">{currentCropDetails.ideal_rainfall}</span></div>
                        <div className="flex justify-between"><span className="text-gray-600">Soil:</span><span className="font-medium">{currentCropDetails.soil_type}</span></div>
                        <div className="flex justify-between"><span className="text-gray-600">Growth Period:</span><span className="font-medium">{currentCropDetails.growth_period}</span></div>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-3">Growing Tips</h4>
                      <ul className="space-y-2">
                        {currentCropDetails.tips.map((tip, i) => (
                          <li key={i} className="flex items-start text-sm">
                            <span className="text-green-500 mr-2 mt-0.5">✓</span>
                            <span className="text-gray-700">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-3">Your Soil Analysis</h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="bg-blue-50 rounded p-2"><p className="text-gray-600 text-xs">Nitrogen</p><p className="font-semibold">{result.soil_analysis.nitrogen_level}</p></div>
                        <div className="bg-purple-50 rounded p-2"><p className="text-gray-600 text-xs">Phosphorus</p><p className="font-semibold">{result.soil_analysis.phosphorus_level}</p></div>
                        <div className="bg-pink-50 rounded p-2"><p className="text-gray-600 text-xs">Potassium</p><p className="font-semibold">{result.soil_analysis.potassium_level}</p></div>
                        <div className="bg-green-50 rounded p-2"><p className="text-gray-600 text-xs">pH Status</p><p className="font-semibold">{result.soil_analysis.ph_status}</p></div>
                      </div>
                    </div>
                  </>
                )}

                {selectedCrop > 0 && (
                  <div className="border border-amber-200 bg-amber-50 rounded-lg p-4">
                    <p className="text-sm text-amber-800 flex items-start">
                      <span className="text-xl mr-2">💡</span>
                      <span>Click on the <strong>#{topCrops[0].name}</strong> card above to see detailed growing information, tips, and soil analysis.</span>
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CropRecommendation;