// App.js
import axios from 'axios';
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

const App = () => {
  const [location, setLocation] = useState<{
    latitude: number, longitude: number
  } | null>(null);
  const [weather, setWeather] = useState({
    conditions: {
      icon: '',
      text: ''
    },
    temperature: 0,
    location: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setLocation({ latitude, longitude });
          },
          (error) => {
            console.error('Error getting location:', error);
          }
        );
      } catch (error) {
        console.error('Error fetching location data:', error);
      }
    };
    fetchData()
  }, []);

  useEffect(() => {
    if (location) {
      const { latitude, longitude } = location;
      const fetchWeatherData = async () => {
        try {
          const { data } = await axios.post('http://localhost:5000/api/weather', {
            latitude,
            longitude,
          });
          console.log('====================================');
          console.log(data);
          console.log('====================================');
          setWeather(data);
        } catch (error) {
          console.error('Error fetching weather data:', error);
        }
      };

      fetchWeatherData();

      socket.on('weatherUpdate', (data) => {
        setWeather(data);
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [location]);
  console.log('weather', weather?.conditions?.icon);

  return (
    <div className="App">


      <div className="location">
        <h1 className="location-timezone">{weather?.location}</h1>
        <img src={weather?.conditions?.icon} alt="icon" id="icon" />
      </div>

      <div className="temperature">
        <div className="degree-section">
          <h2 className="temperature-degree">{weather?.temperature}</h2>
          <span>°C</span>
        </div>

        <div className="temperature-description"></div>
      </div>
    </div >
  );
};

export default App;
