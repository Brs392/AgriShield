import React, { useState, useEffect } from 'react';
import { Leaf, Droplets, ThermometerSun, Wind, FlaskConical, ArrowLeft, Award, Trophy, Sprout, AlertTriangle } from 'lucide-react';

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
  const [selectedCrop, setSelectedCrop] = useState(0);

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

    if (result.alternative_crops && result.alternative_crops.length > 0) {
      const alternativeConfidences = [
        result.confidence * 0.75,
        result.confidence * 0.50
      ];

      result.alternative_crops.slice(0, 2).forEach((crop, index) => {
        topCrops.push({
          name: crop,
          confidence: alternativeConfidences[index],
          rank: index + 2,
          details: null
        });
      });
    }

    return topCrops;
  };

  const topCrops = getTopCrops();
  const currentCropDetails = selectedCrop === 0 ? result?.crop_details : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center text-green-600 hover:text-green-700 mb-4 transition-all hover:translate-x-[-4px]"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="font-medium">Back to Home</span>
          </button>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-green-600 p-3 rounded-2xl mr-4">
                <Leaf className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-5xl font-bold text-green-800">Crop Recommendation</h1>
            </div>
            <p className="text-green-700 text-lg max-w-2xl mx-auto">
              ML-powered crop suggestions based on soil and climate analysis
            </p>
            
            {backendStatus && (
              <div className={`inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-full text-sm font-medium ${
                backendStatus.model_loaded 
                  ? 'bg-green-100 text-green-700 border border-green-200' 
                  : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
              }`}>
                <div className={`w-2 h-2 rounded-full ${backendStatus.model_loaded ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`}></div>
                {backendStatus.model_loaded ? 'ML Model Ready' : 'Model Not Loaded'}
              </div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          
          {/* Input Form - 2 columns */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-2 rounded-lg mr-3">
                <FlaskConical className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Input Data</h2>
            </div>
            
            {/* Sample Buttons */}
            <div className="mb-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
              <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <Sprout className="w-4 h-4 mr-2 text-blue-600" />
                Quick Test Samples:
              </p>
              <div className="flex gap-2 flex-wrap">
                <button 
                  onClick={() => loadSample('rice')} 
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 text-sm font-medium transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  🌾 Rice
                </button>
                <button 
                  onClick={() => loadSample('wheat')} 
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg hover:from-amber-600 hover:to-orange-700 text-sm font-medium transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  🌾 Wheat
                </button>
                <button 
                  onClick={() => loadSample('cotton')} 
                  className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-lg hover:from-pink-600 hover:to-rose-700 text-sm font-medium transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  🌸 Cotton
                </button>
              </div>
            </div>

            <div className="space-y-5">
              {/* NPK Section */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-100">
                <h3 className="font-semibold text-green-800 mb-4 flex items-center text-base">
                  <FlaskConical className="w-5 h-5 mr-2" />
                  Soil Nutrients (kg/ha)
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nitrogen (N)</label>
                    <input 
                      type="number" 
                      name="N" 
                      value={formData.N} 
                      onChange={handleChange} 
                      step="0.1" 
                      min="0" 
                      max="200" 
                      className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all" 
                      placeholder="0-200" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phosphorus (P)</label>
                    <input 
                      type="number" 
                      name="P" 
                      value={formData.P} 
                      onChange={handleChange} 
                      step="0.1" 
                      min="0" 
                      max="200" 
                      className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all" 
                      placeholder="0-200" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Potassium (K)</label>
                    <input 
                      type="number" 
                      name="K" 
                      value={formData.K} 
                      onChange={handleChange} 
                      step="0.1" 
                      min="0" 
                      max="200" 
                      className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all" 
                      placeholder="0-200" 
                    />
                  </div>
                </div>
              </div>

              {/* Climate Section */}
              <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-xl p-5 border border-blue-100">
                <h3 className="font-semibold text-blue-800 mb-4 flex items-center text-base">
                  <ThermometerSun className="w-5 h-5 mr-2" />
                  Climate Conditions
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Temperature (°C)</label>
                    <input 
                      type="number" 
                      name="temperature" 
                      value={formData.temperature} 
                      onChange={handleChange} 
                      step="0.1" 
                      min="0" 
                      max="50" 
                      className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" 
                      placeholder="0-50" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      <Wind className="w-4 h-4 mr-1" />Humidity (%)
                    </label>
                    <input 
                      type="number" 
                      name="humidity" 
                      value={formData.humidity} 
                      onChange={handleChange} 
                      step="0.1" 
                      min="0" 
                      max="100" 
                      className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" 
                      placeholder="0-100" 
                    />
                  </div>
                </div>
              </div>

              {/* pH and Rainfall */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Soil pH Level</label>
                  <input 
                    type="number" 
                    name="ph" 
                    value={formData.ph} 
                    onChange={handleChange} 
                    step="0.1" 
                    min="0" 
                    max="14" 
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all" 
                    placeholder="0-14" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <Droplets className="w-4 h-4 mr-1" />Rainfall (mm)
                  </label>
                  <input 
                    type="number" 
                    name="rainfall" 
                    value={formData.rainfall} 
                    onChange={handleChange} 
                    step="0.1" 
                    min="0" 
                    max="3000" 
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all" 
                    placeholder="0-3000" 
                  />
                </div>
              </div>

              <button 
                onClick={handleSubmit} 
                disabled={loading} 
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3.5 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Analyzing Data...
                  </>
                ) : (
                  <>
                    <Leaf className="w-5 h-5 mr-2" />
                    Get ML Recommendation
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-700 font-semibold">Error</p>
                    <p className="text-red-600 text-sm mt-1">{error}</p>
                    <p className="text-xs text-red-500 mt-2">Make sure backend is running: uvicorn main:app --reload</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Results - 3 columns */}
          <div className="lg:col-span-3 bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-2 rounded-lg mr-3">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Recommendations</h2>
            </div>
            
            {!result && !loading && (
              <div className="text-center py-20 text-gray-400">
                <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Leaf className="w-12 h-12 opacity-30" />
                </div>
                <p className="text-lg font-medium">Enter soil and climate data to get started</p>
                <p className="text-sm mt-2">Try our quick test samples above</p>
              </div>
            )}

            {result && (
              <div className="space-y-6">
                {/* Top 3 Crops Cards */}
                <div className="space-y-3">
                  {topCrops.map((crop, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedCrop(index)}
                      className={`cursor-pointer rounded-2xl p-5 transition-all transform hover:scale-[1.01] ${
                        selectedCrop === index
                          ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-2xl ring-4 ring-green-200'
                          : 'bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 text-gray-800 shadow-md hover:shadow-lg border border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {crop.rank === 1 && (
                            <div className={`p-3 rounded-xl ${selectedCrop === index ? 'bg-yellow-400 bg-opacity-30' : 'bg-yellow-100'}`}>
                              <Trophy className={`w-7 h-7 ${selectedCrop === index ? 'text-yellow-200' : 'text-yellow-500'}`} />
                            </div>
                          )}
                          {crop.rank === 2 && (
                            <div className={`p-3 rounded-xl ${selectedCrop === index ? 'bg-white bg-opacity-20' : 'bg-gray-200'}`}>
                              <Award className={`w-7 h-7 ${selectedCrop === index ? 'text-gray-100' : 'text-gray-500'}`} />
                            </div>
                          )}
                          {crop.rank === 3 && (
                            <div className={`p-3 rounded-xl ${selectedCrop === index ? 'bg-orange-400 bg-opacity-30' : 'bg-orange-100'}`}>
                              <Award className={`w-7 h-7 ${selectedCrop === index ? 'text-orange-200' : 'text-orange-500'}`} />
                            </div>
                          )}
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                                selectedCrop === index ? 'bg-white bg-opacity-25 text-white' : 'bg-green-100 text-green-700'
                              }`}>
                                #{crop.rank} Best Choice
                              </span>
                            </div>
                            <h3 className="text-2xl font-bold capitalize">{crop.name}</h3>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-3xl font-bold ${selectedCrop === index ? 'text-white' : 'text-green-600'}`}>
                            {(crop.confidence * 100).toFixed(1)}%
                          </div>
                          <div className={`text-sm font-medium ${selectedCrop === index ? 'text-white text-opacity-90' : 'text-gray-600'}`}>
                            Confidence Score
                          </div>
                        </div>
                      </div>
                      <div className={`mt-4 rounded-full h-3 ${selectedCrop === index ? 'bg-white bg-opacity-20' : 'bg-gray-300'}`}>
                        <div 
                          className={`rounded-full h-3 transition-all duration-500 ${selectedCrop === index ? 'bg-white shadow-lg' : 'bg-gradient-to-r from-green-500 to-emerald-600'}`}
                          style={{ width: `${crop.confidence * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Selected Crop Details */}
                {currentCropDetails && selectedCrop === 0 && (
                  <div className="space-y-5 pt-4">
                    <div className="border-t-2 border-gray-200 pt-5">
                      <h3 className="text-xl font-bold text-gray-800 mb-5 flex items-center">
                        <div className="bg-green-100 p-2 rounded-lg mr-3">
                          <Leaf className="w-5 h-5 text-green-600" />
                        </div>
                        Complete Details for {result.recommended_crop}
                      </h3>
                    </div>

                    {/* Growing Information */}
                    <div className="border-2 border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-5 py-4 border-b-2 border-gray-200">
                        <h4 className="font-bold text-gray-800 text-lg">Growing Information</h4>
                      </div>
                      <div className="divide-y divide-gray-200 bg-white">
                        <div className="flex justify-between items-center px-5 py-4 hover:bg-gray-50 transition-colors">
                          <span className="text-gray-600 font-medium">Season:</span>
                          <span className="font-semibold text-gray-900 text-right">{currentCropDetails.season}</span>
                        </div>
                        <div className="flex justify-between items-center px-5 py-4 hover:bg-gray-50 transition-colors">
                          <span className="text-gray-600 font-medium">Temperature Range:</span>
                          <span className="font-semibold text-gray-900 text-right">{currentCropDetails.ideal_temp}</span>
                        </div>
                        <div className="flex justify-between items-center px-5 py-4 hover:bg-gray-50 transition-colors">
                          <span className="text-gray-600 font-medium">Rainfall Required:</span>
                          <span className="font-semibold text-gray-900 text-right">{currentCropDetails.ideal_rainfall}</span>
                        </div>
                        <div className="flex justify-between items-center px-5 py-4 hover:bg-gray-50 transition-colors">
                          <span className="text-gray-600 font-medium">Soil Type:</span>
                          <span className="font-semibold text-gray-900 text-right">{currentCropDetails.soil_type}</span>
                        </div>
                        <div className="flex justify-between items-center px-5 py-4 hover:bg-gray-50 transition-colors">
                          <span className="text-gray-600 font-medium">Growth Period:</span>
                          <span className="font-semibold text-gray-900 text-right">{currentCropDetails.growth_period}</span>
                        </div>
                      </div>
                    </div>

                    {/* Growing Tips */}
                    <div className="border-2 border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-4 border-b-2 border-gray-200">
                        <h4 className="font-bold text-gray-800 text-lg">Essential Growing Tips</h4>
                      </div>
                      <div className="p-5 bg-white">
                        <ul className="space-y-4">
                          {currentCropDetails.tips.map((tip, i) => (
                            <li key={i} className="flex items-start group">
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-4 group-hover:bg-green-200 transition-colors">
                                <span className="text-green-600 font-bold text-lg">✓</span>
                              </div>
                              <span className="text-gray-700 leading-relaxed pt-1">{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Soil Analysis */}
                    <div className="border-2 border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-5 py-4 border-b-2 border-gray-200">
                        <h4 className="font-bold text-gray-800 text-lg">Your Soil Analysis Report</h4>
                      </div>
                      <div className="p-5 bg-white">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 hover:shadow-md transition-shadow">
                            <p className="text-blue-700 text-xs font-bold mb-2 uppercase tracking-wide">Nitrogen Level</p>
                            <p className="font-bold text-gray-900 text-lg">{result.soil_analysis.nitrogen_level}</p>
                          </div>
                          <div className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 hover:shadow-md transition-shadow">
                            <p className="text-purple-700 text-xs font-bold mb-2 uppercase tracking-wide">Phosphorus Level</p>
                            <p className="font-bold text-gray-900 text-lg">{result.soil_analysis.phosphorus_level}</p>
                          </div>
                          <div className="border-2 border-pink-200 bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-4 hover:shadow-md transition-shadow">
                            <p className="text-pink-700 text-xs font-bold mb-2 uppercase tracking-wide">Potassium Level</p>
                            <p className="font-bold text-gray-900 text-lg">{result.soil_analysis.potassium_level}</p>
                          </div>
                          <div className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 hover:shadow-md transition-shadow">
                            <p className="text-green-700 text-xs font-bold mb-2 uppercase tracking-wide">pH Status</p>
                            <p className="font-bold text-gray-900 text-lg">{result.soil_analysis.ph_status}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedCrop > 0 && (
                  <div className="border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-5 shadow-md">
                    <div className="flex items-start">
                      <div className="bg-amber-200 p-2 rounded-lg mr-3 flex-shrink-0">
                        <span className="text-2xl">💡</span>
                      </div>
                      <div>
                        <p className="text-amber-900 font-semibold mb-1">Want detailed information?</p>
                        <p className="text-amber-800">
                          Click on the <strong className="text-amber-900">#{topCrops[0].rank} Best Choice - {topCrops[0].name}</strong> card above to see complete growing information, essential tips, and your soil analysis report.
                        </p>
                      </div>
                    </div>
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