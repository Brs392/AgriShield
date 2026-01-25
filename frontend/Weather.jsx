import React, { useState } from "react";
import { Cloud, Leaf, AlertTriangle, Droplets, Thermometer, Wind, MapPin, Search, AlertCircle, CheckCircle, Info, Eye, BookOpen, ChevronRight, Sprout, Shield, Activity } from "lucide-react";

const Weather = () => {
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [crop, setCrop] = useState("");
  const [weatherFetched, setWeatherFetched] = useState(false);

  // Comprehensive crop list
  const cropsList = [
    // Cereals
    "Rice", "Wheat", "Maize", "Barley", "Oats", "Sorghum",
    // Millets
    "Pearl Millet", "Finger Millet", "Foxtail Millet", "Little Millet", "Kodo Millet", "Barnyard Millet",
    // Cash Crops
    "Cotton", "Sugarcane", "Jute",
    // Oilseeds
    "Groundnut", "Soybean", "Sunflower", "Mustard", "Sesame", "Linseed", "Castor",
    // Pulses
    "Chickpea", "Pigeon Pea", "Green Gram", "Black Gram", "Lentil", "Field Pea",
    // Vegetables
    "Potato", "Onion", "Tomato", "Brinjal", "Chilli", "Capsicum", "Cabbage", "Cauliflower", "Okra", "Carrot", "Radish", "Spinach",
    // Fruits
    "Banana", "Mango", "Apple", "Grapes", "Orange", "Papaya", "Pineapple", "Coconut",
    // Beverages & Others
    "Tea", "Coffee", "Rubber",
    // Spices
    "Turmeric", "Ginger", "Garlic", "Coriander", "Cumin", "Fenugreek", "Clove", "Cardamom", "Arecanut"
  ];

  // Dummy weather data
  const currentWeather = {
    temperature: 32,
    rainfall: 45,
    humidity: 78,
    windSpeed: 12,
    cloudCover: 65,
    condition: "Partly Cloudy",
    feelsLike: 36,
    location: district && state ? `${district}, ${state}` : "Your Location"
  };

  const weeklyForecast = [
    { day: "Mon", high: 34, low: 28, rain: 20, icon: "☀️", condition: "Sunny" },
    { day: "Tue", high: 36, low: 29, rain: 10, icon: "🌤️", condition: "Partly Cloudy" },
    { day: "Wed", high: 30, low: 26, rain: 60, icon: "🌧️", condition: "Rainy" },
    { day: "Thu", high: 28, low: 25, rain: 80, icon: "⛈️", condition: "Thunderstorm" },
    { day: "Fri", high: 31, low: 27, rain: 40, icon: "🌧️", condition: "Rainy" },
    { day: "Sat", high: 33, low: 28, rain: 15, icon: "🌤️", condition: "Partly Cloudy" },
    { day: "Sun", high: 35, low: 29, rain: 5, icon: "☀️", condition: "Sunny" },
  ];

  // Crop-specific advisory based on weather
  const getCropAdvisory = (cropName) => {
    const advisoryMap = {
      "Rice": {
        advisory: "Ensure proper drainage during heavy rainfall. Avoid fertilizer application on rainy days. Monitor water level in paddies.",
        irrigation: "Daily monitoring needed. Reduce irrigation during rainfall.",
        sowing: "Best during monsoon. Avoid if temperature drops below 20°C.",
        spraying: "Do not spray pesticides during heavy rain. Wait 2 days after rain.",
        harvesting: "Harvest when grain moisture is 20-25%. Avoid during high humidity.",
        risk: currentWeather.rainfall > 60 ? "High" : "Medium"
      },
      "Wheat": {
        advisory: "Monitor humidity closely to prevent fungal diseases. Maintain soil moisture levels. Avoid waterlogging.",
        irrigation: "3-4 irrigations needed. First irrigation at crown root stage.",
        sowing: "Optimal: October-November. Temperature should be 15-25°C.",
        spraying: "Spray fungicides if humidity > 85%. Avoid during winds > 15 km/h.",
        harvesting: "Harvest at 12-13% moisture. Typically April-May.",
        risk: currentWeather.humidity > 80 ? "High" : "Low"
      },
      "Cotton": {
        advisory: "Avoid pesticide spraying during high wind and rainfall. Ensure good drainage. Monitor for pest infestations.",
        irrigation: "6-8 irrigations needed depending on rainfall. Critical at flowering stage.",
        sowing: "May-June. Soil temperature should be > 20°C.",
        spraying: "Do not spray if wind speed > 20 km/h. Spray early morning or late evening.",
        harvesting: "First pick at 60% boll opening. September-October.",
        risk: currentWeather.windSpeed > 15 ? "High" : "Medium"
      },
      "Maize": {
        advisory: "Ensure good drainage to prevent root diseases. Monitor for pests in high humidity. Provide support during storms.",
        irrigation: "5-6 irrigations needed. Critical at tasseling stage.",
        sowing: "March-April or June-July depending on season. Soil temp > 15°C.",
        spraying: "Spray in early morning. Avoid within 48 hours of rainfall.",
        harvesting: "Harvest when grain reaches 20-25% moisture. August-September.",
        risk: currentWeather.humidity > 75 ? "Medium" : "Low"
      },
      "Sugarcane": {
        advisory: "Maintain consistent irrigation. Heavy rainfall may cause root rot. Monitor for pests.",
        irrigation: "Year-round irrigation needed. 18-24 months crop cycle.",
        sowing: "February-March or September-October. Temp 20-30°C ideal.",
        spraying: "Spray insecticides every 15 days during growing season.",
        harvesting: "Harvest after 12 months. Best during November-March.",
        risk: currentWeather.humidity > 85 ? "High" : "Low"
      },
      "Potato": {
        advisory: "Ensure proper drainage to prevent late blight. Monitor humidity for fungal diseases. Avoid frost.",
        irrigation: "4-5 irrigations needed. Regular monitoring required.",
        sowing: "September-October. Temperature 15-20°C optimal.",
        spraying: "Spray fungicide weekly if rainfall > 2mm. Early blight control crucial.",
        harvesting: "Harvest 3-4 months after planting. March-April.",
        risk: currentWeather.humidity > 90 ? "High" : "Low"
      },
      "Tomato": {
        advisory: "Avoid overhead watering to prevent fungal diseases. Ensure good air circulation. Monitor for pests.",
        irrigation: "Drip irrigation recommended. 20-25 days interval.",
        sowing: "Year-round possible. Temperature 20-25°C optimal.",
        spraying: "Do not spray during extreme heat. Early morning best.",
        harvesting: "Harvest at pink stage. 60-80 days after flowering.",
        risk: currentWeather.temperature > 35 ? "High" : "Low"
      },
      "Onion": {
        advisory: "Good drainage essential. Avoid waterlogging. Monitor for pink rot in high humidity.",
        irrigation: "8-10 irrigations needed. Reduce in last month.",
        sowing: "October-November. Temperature 13-24°C optimal.",
        spraying: "Spray fungicide if humidity > 85%. Avoid in last 2 weeks before harvest.",
        harvesting: "When 50% foliage turns yellow. March-April.",
        risk: currentWeather.rainfall > 50 ? "Medium" : "Low"
      },
      "Chilli": {
        advisory: "Avoid excess moisture. Ensure good air circulation. Monitor for pest infestations.",
        irrigation: "Summer: 7-10 days, Winter: 15-20 days.",
        sowing: "May-June. Temperature 20-30°C optimal.",
        spraying: "Spray weekly for pest management. Avoid after irrigation.",
        harvesting: "Continuous picking from 150 days. August-September.",
        risk: currentWeather.humidity > 80 ? "Medium" : "Low"
      },
      "Banana": {
        advisory: "Ensure continuous irrigation. Protect from strong winds. Mulch heavily.",
        irrigation: "Regular throughout year. 200-250mm monthly needed.",
        sowing: "June-July best. Temperature 20-30°C optimal.",
        spraying: "Monthly spray for disease management. Avoid during heavy rain.",
        harvesting: "9-12 months after planting. Year-round harvesting possible.",
        risk: currentWeather.windSpeed > 20 ? "High" : "Low"
      }
    };

    return advisoryMap[cropName] || {
      advisory: "Monitor weather conditions and follow standard agronomic practices for your crop.",
      irrigation: "Follow local agricultural guidelines for irrigation.",
      sowing: "Follow recommended sowing schedule for your region.",
      spraying: "Always follow pesticide label instructions.",
      harvesting: "Harvest at optimal maturity stage for quality.",
      risk: "Medium"
    };
  };

  const generateAlerts = () => {
    const alerts = [];
    
    if (currentWeather.rainfall > 60) {
      alerts.push({
        type: "warning",
        title: "Heavy Rain Warning",
        description: "Delay pesticide spraying and ensure proper drainage. Risk of waterlogging.",
        icon: AlertTriangle,
        color: "red"
      });
    }
    
    if (currentWeather.temperature > 35) {
      alerts.push({
        type: "heat",
        title: "Heat Stress Alert",
        description: "High temperature detected. Increase irrigation frequency and provide shade if needed.",
        icon: Thermometer,
        color: "orange"
      });
    }

    if (currentWeather.humidity > 85) {
      alerts.push({
        type: "humidity",
        title: "High Humidity Alert",
        description: "Ideal conditions for fungal diseases. Apply preventive fungicide treatment.",
        icon: AlertCircle,
        color: "yellow"
      });
    }

    if (currentWeather.windSpeed > 15) {
      alerts.push({
        type: "wind",
        title: "Strong Wind Alert",
        description: "Do not conduct any spraying operations. Avoid mechanical operations.",
        icon: Wind,
        color: "blue"
      });
    }

    return alerts.length > 0 ? alerts : [
      {
        type: "info",
        title: "Favorable Conditions",
        description: "Current weather conditions are suitable for farming operations.",
        icon: CheckCircle,
        color: "green"
      }
    ];
  };

  const handleSearch = () => {
    if (state && district) {
      setWeatherFetched(true);
    } else {
      alert("Please select both State and District");
    }
  };

  const weatherAlerts = generateAlerts();
  const cropAdvisory = crop ? getCropAdvisory(crop) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50">
      {/* Hero Section */}
      <div 
        className="relative bg-cover bg-center py-20 px-4"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(https://images.unsplash.com/photo-1495567720989-cebfbe6d6b8d?w=1200&h=400&fit=crop)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4 rounded-2xl animate-pulse">
              <Cloud className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white drop-shadow-lg">
              Weather Forecast & Agricultural Advisory
            </h1>
          </div>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto">
            Real-time weather updates and crop-specific agricultural advisories to help you plan irrigation, sowing, spraying, and harvesting decisions
          </p>

          {/* Feature Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
            {[
              { icon: Thermometer, value: "Real-time", label: "Weather Data", color: "red" },
              { icon: Sprout, value: "100+", label: "Crop Types", color: "green" },
              { icon: AlertCircle, value: "Smart", label: "Alerts", color: "yellow" },
              { icon: Activity, value: "7-Day", label: "Forecast", color: "blue" }
            ].map((stat, idx) => (
              <div 
                key={idx} 
                className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:bg-white/20 transition transform hover:scale-105"
              >
                <stat.icon className="w-8 h-8 text-white mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-gray-200">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        
        {/* Understanding Weather Patterns Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl shadow-2xl p-8 mb-12 text-white">
          <h2 className="text-3xl font-bold mb-6 flex items-center">
            <Eye className="w-8 h-8 mr-3" />
            Understanding Weather Patterns for Agriculture
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Temperature Impact",
                desc: "Affects crop growth rate, pest activity, and disease spread. Each crop has optimal temperature range (15-35°C for most crops).",
                icon: "🌡️"
              },
              {
                title: "Rainfall & Irrigation",
                desc: "Critical for crop development. Heavy rainfall (>60mm) may cause waterlogging. Monitor to optimize irrigation scheduling.",
                icon: "💧"
              },
              {
                title: "Humidity & Diseases",
                desc: "High humidity (>85%) creates favorable conditions for fungal diseases. Early morning spraying recommended when humidity is lower.",
                icon: "🌫️"
              },
              {
                title: "Wind Conditions",
                desc: "Strong winds (>15 km/h) affect pesticide application, pollination, and can cause physical damage to crops.",
                icon: "💨"
              }
            ].map((item, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-white/40 transition">
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-gray-100 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-12 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Search className="w-6 h-6 mr-3 text-blue-600" />
            Get Weather & Advisory Information
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* State Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <MapPin className="w-4 h-4 inline mr-2" />
                Select State
              </label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition bg-gray-50 hover:bg-white"
              >
                <option value="">Choose State...</option>
                <option value="Punjab">Punjab</option>
                <option value="Haryana">Haryana</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
                <option value="Madhya Pradesh">Madhya Pradesh</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Andhra Pradesh">Andhra Pradesh</option>
                <option value="Rajasthan">Rajasthan</option>
                <option value="Bihar">Bihar</option>
                <option value="West Bengal">West Bengal</option>
                <option value="Gujarat">Gujarat</option>
              </select>
            </div>

            {/* District Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <MapPin className="w-4 h-4 inline mr-2" />
                Select District
              </label>
              <input
                type="text"
                placeholder="e.g., Ludhiana, Hisar"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition bg-gray-50 hover:bg-white"
              />
            </div>

            {/* Crop Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <Leaf className="w-4 h-4 inline mr-2" />
                Select Crop
              </label>
              <select
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition bg-gray-50 hover:bg-white"
              >
                <option value="">Choose a crop...</option>
                {cropsList.map((cropName) => (
                  <option key={cropName} value={cropName}>{cropName}</option>
                ))}
              </select>
            </div>

            {/* Search Button */}
            <div className="flex items-end">
              <button 
                onClick={handleSearch}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:to-cyan-700 transition font-semibold shadow-lg transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <Search className="w-5 h-5" />
                <span>Get Weather</span>
              </button>
            </div>
          </div>
        </div>

        {/* Output Section - Current Weather */}
        {weatherFetched && (
          <>
            <div className="bg-white rounded-3xl shadow-2xl p-8 mb-12 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Thermometer className="w-6 h-6 mr-3 text-red-600" />
                Current Weather Conditions
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                {[
                  { icon: Thermometer, label: "Temperature", value: `${currentWeather.temperature}°C`, unit: "Feels like " + currentWeather.feelsLike + "°C", gradient: "from-red-500 to-orange-500" },
                  { icon: Droplets, label: "Rainfall", value: `${currentWeather.rainfall} mm`, unit: "Last 24 hours", gradient: "from-blue-500 to-cyan-500" },
                  { icon: Cloud, label: "Humidity", value: `${currentWeather.humidity}%`, unit: "Relative", gradient: "from-indigo-500 to-blue-500" },
                  { icon: Wind, label: "Wind Speed", value: `${currentWeather.windSpeed} km/h`, unit: "Current", gradient: "from-teal-500 to-green-500" },
                  { icon: Cloud, label: "Cloud Cover", value: `${currentWeather.cloudCover}%`, unit: "Sky coverage", gradient: "from-gray-500 to-slate-500" },
                ].map((card, idx) => (
                  <div key={idx} className={`bg-gradient-to-br ${card.gradient} rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition transform hover:-translate-y-1`}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-xs opacity-90 mb-1">{card.label}</p>
                        <p className="text-2xl font-bold">{card.value}</p>
                      </div>
                      <card.icon className="w-8 h-8 opacity-30" />
                    </div>
                    <p className="text-xs opacity-75">{card.unit}</p>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-4 border border-blue-200">
                <p className="text-gray-800 flex items-start space-x-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Location:</strong> {currentWeather.location} | <strong>Condition:</strong> {currentWeather.condition}</span>
                </p>
              </div>
            </div>

            {/* Active Weather Alerts */}
            <div className="bg-white rounded-3xl shadow-2xl p-8 mb-12 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <AlertTriangle className="w-6 h-6 mr-3 text-orange-600" />
                Active Weather Alerts & Warnings
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                {weatherAlerts.map((alert, idx) => (
                  <div key={idx} className={`border-l-4 bg-gradient-to-br rounded-xl p-6 hover:shadow-lg transition`}
                    style={{
                      borderLeftColor: alert.color === 'red' ? '#ef4444' : alert.color === 'yellow' ? '#eab308' : alert.color === 'orange' ? '#f97316' : alert.color === 'blue' ? '#3b82f6' : '#22c55e',
                      background: alert.color === 'red' ? 'linear-gradient(to right, rgb(254, 242, 242), rgb(254, 226, 226))' : 
                                 alert.color === 'yellow' ? 'linear-gradient(to right, rgb(254, 252, 231), rgb(254, 248, 199))' :
                                 alert.color === 'orange' ? 'linear-gradient(to right, rgb(254, 245, 235), rgb(254, 231, 197))' :
                                 alert.color === 'blue' ? 'linear-gradient(to right, rgb(239, 246, 255), rgb(219, 234, 254))' :
                                 'linear-gradient(to right, rgb(240, 253, 244), rgb(220, 252, 231))'
                    }}>
                    <div className="flex items-start space-x-4">
                      <div style={{backgroundColor: alert.color === 'red' ? '#ef4444' : alert.color === 'yellow' ? '#eab308' : alert.color === 'orange' ? '#f97316' : alert.color === 'blue' ? '#3b82f6' : '#22c55e'}} className="p-3 rounded-full flex-shrink-0">
                        <alert.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg">{alert.title}</h3>
                        <p className="text-sm text-gray-700 mt-2">{alert.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Crop-Specific Advisory */}
            {crop && cropAdvisory && (
              <div className="bg-white rounded-3xl shadow-2xl p-8 mb-12 border border-gray-100 animate-fade-in">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <BookOpen className="w-6 h-6 mr-3 text-green-600" />
                  {crop} - Weather-Based Advisory
                </h2>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  {/* Risk Level */}
                  <div className={`bg-gradient-to-br rounded-2xl p-6 border-2 ${cropAdvisory.risk === 'High' ? 'from-red-50 to-red-100 border-red-300' : 'from-yellow-50 to-yellow-100 border-yellow-300'}`}>
                    <div className="flex items-center space-x-4">
                      <AlertTriangle className={`w-10 h-10 ${cropAdvisory.risk === 'High' ? 'text-red-600' : 'text-yellow-600'}`} />
                      <div>
                        <h3 className="font-bold text-gray-900">Current Risk Level</h3>
                        <p className={`text-lg font-bold ${cropAdvisory.risk === 'High' ? 'text-red-600' : 'text-yellow-600'}`}>{cropAdvisory.risk}</p>
                      </div>
                    </div>
                  </div>

                  {/* General Advisory */}
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-300">
                    <div className="flex items-start space-x-4">
                      <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-bold text-gray-900 mb-2">General Advisory</h3>
                        <p className="text-gray-700 text-sm">{cropAdvisory.advisory}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Advisory Cards */}
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  {[
                    { title: "💧 Irrigation", content: cropAdvisory.irrigation, color: "blue" },
                    { title: "🌱 Sowing", content: cropAdvisory.sowing, color: "green" },
                    { title: "🚜 Spraying", content: cropAdvisory.spraying, color: "yellow" },
                    { title: "🎯 Harvesting", content: cropAdvisory.harvesting, color: "purple" }
                  ].map((adv, idx) => (
                    <div key={idx} className={`bg-gradient-to-br rounded-2xl p-5 border-2`}
                      style={{
                        background: adv.color === 'blue' ? 'linear-gradient(to right, rgb(239, 246, 255), rgb(224, 242, 254))' :
                                   adv.color === 'green' ? 'linear-gradient(to right, rgb(240, 253, 244), rgb(220, 252, 231))' :
                                   adv.color === 'yellow' ? 'linear-gradient(to right, rgb(254, 252, 231), rgb(254, 248, 199))' :
                                   'linear-gradient(to right, rgb(243, 232, 255), rgb(233, 213, 255))',
                        borderColor: adv.color === 'blue' ? '#3b82f6' : adv.color === 'green' ? '#22c55e' : adv.color === 'yellow' ? '#eab308' : '#a855f7'
                      }}>
                      <h4 className="font-bold text-gray-900 mb-2">{adv.title}</h4>
                      <p className="text-sm text-gray-700 leading-relaxed">{adv.content}</p>
                    </div>
                  ))}
                </div>

                {/* Recommended Actions */}
                <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl p-6 border-l-4 border-green-600">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                    Recommended Actions for Today
                  </h3>
                  <ul className="space-y-2 text-gray-800">
                    {cropAdvisory.risk === 'High' ? (
                      <>
                        <li className="flex items-center space-x-3">
                          <span className="text-green-600 font-bold">✓</span>
                          <span>Monitor field conditions closely due to unfavorable weather</span>
                        </li>
                        <li className="flex items-center space-x-3">
                          <span className="text-green-600 font-bold">✓</span>
                          <span>Postpone any planned pesticide spraying</span>
                        </li>
                        <li className="flex items-center space-x-3">
                          <span className="text-green-600 font-bold">✓</span>
                          <span>Check drainage systems and clear if necessary</span>
                        </li>
                      </>
                    ) : (
                      <>
                        <li className="flex items-center space-x-3">
                          <span className="text-green-600 font-bold">✓</span>
                          <span>Weather conditions are favorable for operations</span>
                        </li>
                        <li className="flex items-center space-x-3">
                          <span className="text-green-600 font-bold">✓</span>
                          <span>Ideal time for irrigation or pesticide application</span>
                        </li>
                        <li className="flex items-center space-x-3">
                          <span className="text-green-600 font-bold">✓</span>
                          <span>Continue regular monitoring for pest and disease</span>
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            )}

            {/* 7-Day Forecast */}
            <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Cloud className="w-6 h-6 mr-3 text-blue-600" />
                7-Day Weather Forecast
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {weeklyForecast.map((day, idx) => (
                  <div key={idx} className="bg-gradient-to-br from-sky-50 to-blue-50 border-2 border-sky-200 rounded-2xl p-4 text-center hover:shadow-lg transition transform hover:scale-105">
                    <h4 className="font-bold text-gray-900 mb-2">{day.day}</h4>
                    <div className="text-3xl mb-3">{day.icon}</div>
                    <p className="text-xs text-gray-600 font-semibold mb-2">{day.condition}</p>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-gray-600">High</p>
                        <p className="font-bold text-lg text-gray-900">{day.high}°</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Low</p>
                        <p className="font-semibold text-gray-700">{day.low}°</p>
                      </div>
                      <div className="bg-blue-100 rounded-lg px-2 py-1">
                        <p className="text-xs text-blue-900 font-semibold">💧 {day.rain}mm</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Empty State Message */}
        {!weatherFetched && (
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl border-2 border-dashed border-gray-300 p-12 text-center">
            <Cloud className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-700 mb-2">Get Started</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Select your state, district, and a crop to view current weather conditions, weather alerts, and crop-specific agricultural advisory recommendations.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Weather;
