import React, { useState, useEffect } from "react";
import { fetchWeather } from "./api/fetchWeather";
import './App.css';


const App = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [cityName, setCityName] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [temperatureUnit, setTemperatureUnit] = useState("C");

  useEffect(() => {
    const savedSearches = localStorage.getItem("recentSearches");
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
    
    const savedUnit = localStorage.getItem("temperatureUnit");
    if (savedUnit) {
      setTemperatureUnit(savedUnit);
    }
  }, []);

  const fetchData = async (city) => {
    setIsLoading(true);
    try {
      const data = await fetchWeather(city);
      setWeatherData(data);
      setCityName("");
      setError(null);
      updateRecentSearches(city);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      fetchData(cityName);
    }
  };

  const updateRecentSearches = (city) => {
    const updatedSearches = [city, ...recentSearches.filter(search => search !== city)].slice(0, 5);
    setRecentSearches(updatedSearches);
    localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
  };

  const toggleTemperatureUnit = () => {
    const newUnit = temperatureUnit === "C" ? "F" : "C";
    setTemperatureUnit(newUnit);
    localStorage.setItem("temperatureUnit", newUnit);
  };

  return (
    <div className="container">
      <div className="main-content">
        <div className="search-container">
          <input
            type="text"
            placeholder="Enter city name..."
            value={cityName}
            onChange={(e) => setCityName(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button className="unit-toggle" onClick={toggleTemperatureUnit}>
            °{temperatureUnit === "C" ? "F" : "C"}
          </button>
        </div>
        
        {isLoading && <div className="loading">Loading...</div>}
        {error && <div className="error">{error}</div>}
        
        {weatherData && (
          <div className="weather-info">
            <h2>
              {weatherData.location.name}, {weatherData.location.region},{" "}
              {weatherData.location.country}
            </h2>
            <img
              src={weatherData.current.condition.icon}
              alt={weatherData.current.condition.text}
            />
            <div className="weather-details">
              <p>
                Temperature: {temperatureUnit === "C" ? weatherData.current.temp_c : weatherData.current.temp_f} °{temperatureUnit}
              </p>
              <p>Condition: {weatherData.current.condition.text}</p>
              <p>Humidity: {weatherData.current.humidity}%</p>
              <p>Pressure: {weatherData.current.pressure_mb} mb</p>
              <p>Visibility: {weatherData.current.vis_km} km</p>
            </div>
          </div>
        )}
      </div>
      
      <div className="recent-searches">
        <h3>Recent Searches</h3>
        <ul>
          {recentSearches.map((city, index) => (
            <li key={index} onClick={() => fetchData(city)}>
              {city}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default App;
