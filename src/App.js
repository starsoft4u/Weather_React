import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import WeatherItem from './components/WeatherItem';
import axios from 'axios';

const APIURL = 'https://api.openweathermap.org/data/2.5';
const APIKEY = '75bc6201f2a66c79b1b8d65f2981b9e0';
const cities = ['London', 'Paris', 'New York', 'Tokyo'];
const countries = ['uk', 'fr', 'us', 'jp'];
const categories = ['Current weather', 'Today', 'Tonight', 'Tomorrow'];

function App() {
  // Timer handle
  let timerId = useRef();

  // Load state
  const [city, setCity] = useState(cities[0]);
  const [data, setData] = useState([]);

  // Refresh UI
  useEffect(() => {
    if (timerId.current) {
      clearTimeout(timerId.current);
    }

    // weather loading function
    const fetchWeatherInfo = (city) => {
      const index = cities.indexOf(city);
      const country = countries[index];

      let todayData = null;
      let tomorrowData = null;

      // Current weather (current, today, tonight)
      axios.get(`${APIURL}/weather?q=${city},${country}&units=imperial&appid=${APIKEY}`).then(res => {
        todayData = res.data;
        // update state if already fetched tomorrow data
        if (tomorrowData) {
          setData([
            Weather(todayData, 0),
            Weather(todayData, 1),
            Weather(todayData, 2),
            Weather(tomorrowData, 3)
          ]);
        }
      }).catch((e) => console.log(e));

      // Tomorrow weather
      axios.get(`${APIURL}/forecast?q=${city},${country}&units=imperial&appid=${APIKEY}`).then(res => {
        let today = new Date();
        let tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        tomorrow = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 13);

        const list = res.data.list;
        tomorrowData = list.reduce((x, y) => {
          const time1 = x.dt * 1000;
          const time2 = y.dt * 1000;
          const time = tomorrow.getTime;

          const d1 = Math.abs(time - time1);
          const d2 = Math.abs(time - time2);

          return d1 > d2 ? y : x;
        });

        // update state if already fetched today data
        if (todayData) {
          setData([
            Weather(todayData, 0),
            Weather(todayData, 1),
            Weather(todayData, 2),
            Weather(tomorrowData, 3)
          ]);
        }
      }).catch((e) => console.log(e));
    };

    // Fetch weather;
    fetchWeatherInfo(city);

    // Refetch weather boradcast every minute
    timerId.current = setTimeout(() => fetchWeatherInfo(city), 1000 * 60);
  }, [city, data.length]);


  // render UI
  return (
    <div className="App">
      <div className="container">
        <div className="header col col-xd-8 col-md-6">
          <div> {
            cities.map((x) => <button key={x} className="btn" onClick={() => setCity(x)}>{x}</button>)
          } </div>
          <hr className={`active${cities.indexOf(city) + 1}`} />
        </div>
        <div className="weather-container mt-4 d-flex justify-content-center"> {
          data.map((weather, index) => {
            if (index === 0) {
              return <WeatherItem key={weather.key} weather={weather} current />
            } else {
              return <WeatherItem key={weather.key} weather={weather} />
            }
          })
        }</div>
      </div>
    </div>
  );
}


// Get weather object from API response
function Weather(obj, index) {
  if (!!!obj) {
    return null;
  }

  // Timestamp
  const current = new Date();
  let timestamp = '';
  if (index === 0) {
    timestamp = current.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
  } else if (index === 3) {
    let tomorrow = new Date(current);
    tomorrow.setDate(tomorrow.getDate() + 1);
    timestamp = `${tomorrow.getMonth() + 1}/${tomorrow.getDate()}`;
  } else {
    timestamp = `${current.getMonth() + 1}/${current.getDate()}`;
  }

  // Temperature & Real feeling
  let temperature = 0;
  let feel = 0;
  if (index === 1) {
    temperature = Math.round(obj.main.temp_max);
    feel = Math.round(obj.main.feels_like + (temperature - obj.main.temp));
  } else if (index === 2) {
    temperature = Math.round(obj.main.temp_min);
    feel = Math.round(obj.main.feels_like - (obj.main.temp - temperature));
  } else {
    temperature = Math.round(obj.main.temp);
    feel = Math.round(obj.main.feels_like);
  }

  return {
    key: categories[index],
    title: categories[index],
    timestamp: timestamp,
    icon: `http://openweathermap.org/img/wn/${obj.weather[0].icon}@2x.png`,
    weather: obj.weather[0].description,
    temperature: temperature,
    feel: feel
  };
}

export default App;
