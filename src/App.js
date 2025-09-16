import React, { useState, useEffect } from 'react';
import { Search, MapPin, Cloud, Thermometer, Wind } from 'lucide-react';

const API_KEY = 'd6def4924ad5f9a9b59f3ae895b234cb';

const WeatherApp = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [city, setCity] = useState('Lyon');
  const [loading, setLoading] = useState(false);
  const [coordinates, setCoordinates] = useState({ lat: 45.7578137, lon: 4.8320114 });
  const [activeMap, setActiveMap] = useState('precipitation');

  // Fonction pour obtenir les coordonnées d'une ville
  const getCoordinates = async (cityName) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${cityName},fr&limit=1&appid=${API_KEY}`
      );
      const data = await response.json();
      if (data.length > 0) {
        return { lat: data[0].lat, lon: data[0].lon };
      }
      throw new Error('Ville non trouvée');
    } catch (error) {
      console.error('Erreur géocodage:', error);
      return null;
    }
  };

  // Fonction pour récupérer les données météo
  const fetchWeatherData = async (lat, lon) => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&lang=fr&units=metric&appid=${API_KEY}`
      );
      const data = await response.json();
      setWeatherData(data);
    } catch (error) {
      console.error('Erreur API météo:', error);
    } finally {
      setLoading(false);
    }
  };

  // Recherche d'une ville
  const handleCitySearch = async (e) => {
    if (e) e.preventDefault();
    const coords = await getCoordinates(city);
    if (coords) {
      setCoordinates(coords);
      fetchWeatherData(coords.lat, coords.lon);
    }
  };

  // Chargement initial
  useEffect(() => {
    fetchWeatherData(coordinates.lat, coordinates.lon);
  }, []);

  // Fonction pour grouper les prévisions par jour
  const groupForecastByDay = (list) => {
    const grouped = {};
    list.forEach(item => {
      const date = new Date(item.dt * 1000).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(item);
    });
    return Object.keys(grouped).slice(0, 5).map(date => ({
      date,
      forecasts: grouped[date]
    }));
  };

  // Fonction pour obtenir l'URL de la carte météo
  const getMapUrl = (type, z = 8, x = 128, y = 97) => {
    const mapTypes = {
      precipitation: 'precipitation_new',
      temp: 'temp_new',
      wind: 'wind_new'
    };
    return `https://tile.openweathermap.org/map/${mapTypes[type]}/${z}/${x}/${y}.png?appid=${API_KEY}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
        <div className="text-white text-xl">Chargement...</div>
      </div>
    );
  }

  if (!weatherData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
        <div className="text-white text-xl">Erreur de chargement des données météo</div>
      </div>
    );
  }

  const dailyForecasts = groupForecastByDay(weatherData.list);
  const currentForecast = dailyForecasts[selectedDay];
  const mainWeather = currentForecast.forecasts[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-blue-600">
      {/* Header */}
      <header className="bg-white shadow-lg p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
              ☀️
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Sun Forecast</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="relative">
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCitySearch(e)}
                placeholder="Rechercher une ville..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
            <button
              onClick={handleCitySearch}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <MapPin className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Navigation des jours */}
      <nav className="bg-white bg-opacity-20 backdrop-blur-sm p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex space-x-4 overflow-x-auto">
            {dailyForecasts.map((day, index) => (
              <button
                key={index}
                onClick={() => setSelectedDay(index)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg transition-all ${
                  selectedDay === index
                    ? 'bg-white text-blue-600 shadow-lg'
                    : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                }`}
              >
                <div className="text-center">
                  <div className="text-sm font-semibold">
                    {index === 0 ? "Aujourd'hui" : new Date(day.date).toLocaleDateString('fr-FR', { weekday: 'short' })}
                  </div>
                  <div className="text-xs">
                    {new Date(day.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Contenu principal */}
      <main className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Informations météo principales */}
          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold">{weatherData.city.name}</h2>
                <p className="text-lg opacity-80">{mainWeather.weather[0].description}</p>
              </div>
              <img
                src={`https://openweathermap.org/img/wn/${mainWeather.weather[0].icon}@2x.png`}
                alt={mainWeather.weather[0].description}
                className="w-16 h-16"
              />
            </div>
            
            <div className="text-5xl font-bold mb-4">
              {Math.round(mainWeather.main.temp)}°C
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="opacity-70">Ressenti</div>
                <div className="font-semibold">{Math.round(mainWeather.main.feels_like)}°C</div>
              </div>
              <div>
                <div className="opacity-70">Humidité</div>
                <div className="font-semibold">{mainWeather.main.humidity}%</div>
              </div>
              <div>
                <div className="opacity-70">Vent</div>
                <div className="font-semibold">{Math.round(mainWeather.wind.speed * 3.6)} km/h</div>
              </div>
            </div>
          </div>

          {/* Prévisions horaires */}
          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-6 text-white">
            <h3 className="text-xl font-bold mb-4">Prévisions de la journée</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {currentForecast.forecasts.map((forecast, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm w-12">
                      {new Date(forecast.dt * 1000).toLocaleTimeString('fr-FR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                    <img
                      src={`https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png`}
                      alt={forecast.weather[0].description}
                      className="w-8 h-8"
                    />
                    <span className="text-sm flex-1">{forecast.weather[0].description}</span>
                  </div>
                  <span className="font-semibold">{Math.round(forecast.main.temp)}°C</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cartes météo */}
        <div className="mt-8">
          <h3 className="text-2xl font-bold text-white mb-4">Cartes météorologiques</h3>
          
          {/* Sélecteur de type de carte */}
          <div className="flex space-x-2 mb-4">
            <button
              onClick={() => setActiveMap('precipitation')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                activeMap === 'precipitation'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
              }`}
            >
              <Cloud className="h-4 w-4" />
              <span>Précipitations</span>
            </button>
            <button
              onClick={() => setActiveMap('temp')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                activeMap === 'temp'
                  ? 'bg-red-500 text-white'
                  : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
              }`}
            >
              <Thermometer className="h-4 w-4" />
              <span>Température</span>
            </button>
            <button
              onClick={() => setActiveMap('wind')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                activeMap === 'wind'
                  ? 'bg-green-500 text-white'
                  : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
              }`}
            >
              <Wind className="h-4 w-4" />
              <span>Vent</span>
            </button>
          </div>

          {/* Grille de cartes */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, index) => {
              const x = 128 + (index % 3) * 2;
              const y = 97 + Math.floor(index / 3) * 2;
              return (
                <div key={index} className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-2">
                  <img
                    src={getMapUrl(activeMap, 8, x, y)}
                    alt={`Carte ${activeMap} ${index + 1}`}
                    className="w-full h-32 object-cover rounded"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyOCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjY2NjIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkNhcnRlIG5vbiBkaXNwb25pYmxlPC90ZXh0Pjwvc3ZnPg==';
                    }}
                  />
                  <p className="text-white text-xs mt-1 text-center">
                    Zone {index + 1}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default WeatherApp;