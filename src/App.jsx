import React, { useState, useEffect } from "react";
import { fetchWeather } from "./api/fetchWeather";

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
    <div>
      <input
        type="text"
        placeholder="Enter city name..."
        value={cityName}
        onChange={(e) => setCityName(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button onClick={toggleTemperatureUnit}>
        Switch to °{temperatureUnit === "C" ? "F" : "C"}
      </button>
      
      {isLoading && <div>Loading...</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}
      
      {weatherData && (
        <div>
          <h2>
            {weatherData.location.name}, {weatherData.location.region},{" "}
            {weatherData.location.country}
          </h2>
          <p>
            Temperature: {temperatureUnit === "C" ? weatherData.current.temp_c : weatherData.current.temp_f} °{temperatureUnit}
          </p>
          <p>Condition: {weatherData.current.condition.text}</p>
          <img
            src={weatherData.current.condition.icon}
            alt={weatherData.current.condition.text}
          />
          <p>Humidity: {weatherData.current.humidity} %</p>
          <p>Pressure: {weatherData.current.pressure_mb} mb</p>
          <p>Visibility: {weatherData.current.vis_km} km</p>
        </div>
      )}
      
      <div>
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
