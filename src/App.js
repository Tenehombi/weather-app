import React, { useState, useEffect } from 'react';
import { Search, MapPin, Cloud, Thermometer, Wind, Sun, CloudRain, Eye, Droplets } from 'lucide-react';

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
      <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600 flex items-center justify-center">
        <div className="bg-white rounded-3xl p-12 shadow-2xl text-center max-w-md mx-auto">
          <div className="animate-spin rounded-full h-20 w-20 border-6 border-purple-500 border-t-transparent mx-auto"></div>
          <div className="text-gray-800 text-2xl font-bold mt-6">Chargement...</div>
          <div className="text-purple-600 text-lg mt-2">Récupération des données météo</div>
        </div>
      </div>
    );
  }

  if (!weatherData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-400 via-pink-500 to-purple-600 flex items-center justify-center">
        <div className="bg-white rounded-3xl p-12 shadow-2xl text-center max-w-md mx-auto">
          <div className="text-red-600 text-6xl mb-4"></div>
          <div className="text-gray-800 text-2xl font-bold">Erreur de chargement</div>
          <div className="text-red-600 text-lg mt-2">Impossible de récupérer les données météo</div>
        </div>
      </div>
    );
  }

  const dailyForecasts = groupForecastByDay(weatherData.list);
  const currentForecast = dailyForecasts[selectedDay];
  const mainWeather = currentForecast.forecasts[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600">
      {/* Header coloré et centré */}
      <header className="bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center mb-8">
            <div className="flex justify-center items-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full flex items-center justify-center shadow-xl mr-4">
                <Sun className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-5xl font-bold text-white"> Sun Forecast </h1>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-xl ml-4">
                <Cloud className="w-8 h-8 text-white" />
              </div>
            </div>
            <p className="text-xl text-yellow-100 font-semibold"> Prévisions Météo Colorées </p>
          </div>
          
          <div className="flex justify-center">
            <div className="flex items-center bg-white bg-opacity-20 rounded-full p-2 shadow-lg">
              <div className="relative">
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCitySearch(e)}
                  placeholder="🔍 Rechercher une ville..."
                  className="pl-12 pr-6 py-4 bg-white rounded-full text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-yellow-300 w-80 text-lg font-medium text-center"
                />
                <Search className="absolute left-4 top-5 h-6 w-6 text-gray-500" />
              </div>
              <button
                onClick={handleCitySearch}
                className="ml-2 px-6 py-4 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-full hover:from-green-500 hover:to-blue-600 transition-all duration-300 shadow-lg transform hover:scale-110 font-bold"
              >
                <MapPin className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation colorée des jours */}
      <nav className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 py-6">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-center space-x-4 overflow-x-auto">
            {dailyForecasts.map((day, index) => (
              <button
                key={index}
                onClick={() => setSelectedDay(index)}
                className={`flex-shrink-0 px-8 py-6 rounded-2xl transition-all duration-300 transform hover:scale-110 shadow-lg min-w-32 ${
                  selectedDay === index
                    ? 'bg-white text-purple-700 shadow-2xl scale-110 border-4 border-yellow-400'
                    : 'bg-white bg-opacity-30 text-white hover:bg-opacity-50'
                }`}
              >
                <div className="text-center">
                  <div className="text-lg font-bold mb-1">
                    {index === 0 ? "Aujourd'hui" : new Date(day.date).toLocaleDateString('fr-FR', { weekday: 'short' })}
                  </div>
                  <div className="text-sm opacity-90">
                     {new Date(day.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                  </div>
                  <div className="mt-2 text-2xl">
                    {day.forecasts[0].weather[0].icon.includes('01') ? '☀️' : 
                     day.forecasts[0].weather[0].icon.includes('02') ? '⛅' :
                     day.forecasts[0].weather[0].icon.includes('09') ? '🌧️' :
                     day.forecasts[0].weather[0].icon.includes('10') ? '🌦️' : '☁️'}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Contenu principal centré et coloré */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Informations météo principales */}
        <div className="bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 rounded-3xl p-10 shadow-2xl mb-8 text-center">
          <div className="mb-8">
            <h2 className="text-6xl font-bold text-white mb-4"> {weatherData.city.name}</h2>
            <p className="text-3xl text-yellow-200 capitalize font-semibold mb-2">{mainWeather.weather[0].description}</p>
            <p className="text-xl text-blue-200">
               {new Date(mainWeather.dt * 1000).toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long' 
              })}
            </p>
          </div>
          
          <div className="flex justify-center items-center mb-8">
            <img
              src={`https://openweathermap.org/img/wn/${mainWeather.weather[0].icon}@4x.png`}
              alt={mainWeather.weather[0].description}
              className="w-32 h-32 drop-shadow-2xl mr-8"
            />
            <div className="text-8xl font-bold text-white">
               {Math.round(mainWeather.main.temp)}°C
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl p-6 text-center shadow-xl">
              <div className="text-4xl mb-2"></div>
              <div className="text-white text-lg font-medium">Ressenti</div>
              <div className="text-white text-3xl font-bold">{Math.round(mainWeather.main.feels_like)}°C</div>
            </div>
            <div className="bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl p-6 text-center shadow-xl">
              <div className="text-4xl mb-2"></div>
              <div className="text-white text-lg font-medium">Humidité</div>
              <div className="text-white text-3xl font-bold">{mainWeather.main.humidity}%</div>
            </div>
            <div className="bg-gradient-to-br from-green-400 to-teal-500 rounded-2xl p-6 text-center shadow-xl">
              <div className="text-4xl mb-2"></div>
              <div className="text-white text-lg font-medium">Vent</div>
              <div className="text-white text-3xl font-bold">{Math.round(mainWeather.wind.speed * 3.6)} km/h</div>
            </div>
            <div className="bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl p-6 text-center shadow-xl">
              <div className="text-4xl mb-2"></div>
              <div className="text-white text-lg font-medium">Pression</div>
              <div className="text-white text-3xl font-bold">{mainWeather.main.pressure} hPa</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Prévisions horaires */}
          <div className="bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-3xl p-8 shadow-2xl">
            <h3 className="text-3xl font-bold text-white mb-6 text-center"> Prévisions de la journée</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {currentForecast.forecasts.slice(0, 8).map((forecast, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-white bg-opacity-20 rounded-2xl backdrop-blur-sm">
                  <div className="flex items-center space-x-4">
                    <span className="text-white text-lg font-bold w-16 text-center">
                       {new Date(forecast.dt * 1000).toLocaleTimeString('fr-FR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                    <img
                      src={`https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png`}
                      alt={forecast.weather[0].description}
                      className="w-12 h-12"
                    />
                    <div className="text-center">
                      <span className="text-white text-lg font-medium capitalize block">{forecast.weather[0].description}</span>
                      <div className="text-yellow-200 text-sm"> {forecast.main.humidity}% humidité</div>
                    </div>
                  </div>
                  <span className="text-white text-2xl font-bold"> {Math.round(forecast.main.temp)}°C</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cartes météo */}
          <div className="bg-gradient-to-br from-green-400 via-teal-500 to-blue-500 rounded-3xl p-8 shadow-2xl">
            <h3 className="text-3xl font-bold text-white mb-6 text-center"> Cartes Météorologiques</h3>
            
            {/* Sélecteur de type de carte */}
            <div className="flex flex-col space-y-3 mb-6">
              <button
                onClick={() => setActiveMap('precipitation')}
                className={`flex items-center justify-center space-x-3 px-6 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 text-lg font-bold ${
                  activeMap === 'precipitation'
                    ? 'bg-white text-blue-600 shadow-2xl scale-105'
                    : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                }`}
              >
                <span className="text-2xl"></span>
                <span>Précipitations</span>
              </button>
              <button
                onClick={() => setActiveMap('temp')}
                className={`flex items-center justify-center space-x-3 px-6 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 text-lg font-bold ${
                  activeMap === 'temp'
                    ? 'bg-white text-red-600 shadow-2xl scale-105'
                    : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                }`}
              >
                <span className="text-2xl"></span>
                <span>Température</span>
              </button>
              <button
                onClick={() => setActiveMap('wind')}
                className={`flex items-center justify-center space-x-3 px-6 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 text-lg font-bold ${
                  activeMap === 'wind'
                    ? 'bg-white text-green-600 shadow-2xl scale-105'
                    : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                }`}
              >
                <span className="text-2xl"></span>
                <span>Vent</span>
              </button>
            </div>
          </div>
        </div>

        {/* Grille de cartes centrée */}
        <div className="bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600 rounded-3xl p-8 shadow-2xl">
          <h3 className="text-4xl font-bold text-white mb-8 text-center">Vue Géographique</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => {
              const x = 128 + (index % 3) * 2;
              const y = 97 + Math.floor(index / 3) * 2;
              return (
                <div key={index} className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-4 hover:bg-opacity-30 transition-all duration-300 transform hover:scale-105 text-center">
                  <img
                    src={getMapUrl(activeMap, 8, x, y)}
                    alt={`Carte ${activeMap} ${index + 1}`}
                    className="w-full h-32 object-cover rounded-xl shadow-lg mb-3"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyOCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMikiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPvCfpK4gQ2FydGUgbm9uIGRpc3BvbmlibGU8L3RleHQ+PC9zdmc+';
                    }}
                  />
                  <p className="text-white text-lg font-bold">
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