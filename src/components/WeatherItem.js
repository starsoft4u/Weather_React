import React from 'react';
import './WeatherItem.css';

function WeatherItem(props) {
  const current = props.current;
  const weather = props.weather;

  return (
    <div className={current ? "Weather-Item current" : "Weather-Item"}>
      <div className="title">{weather.title}</div>
      <div className="time-stamp">{weather.timestamp}</div>
      <img className="weather-icon" src={weather.icon} alt="Weather Icon" />
      <div><span className="temperature">{`${weather.temperature}°`}</span>F</div>
      <div className="feel">{`RealFeel® ${weather.feel}°`}</div>
      <div>{weather.weather}</div>
    </div>
  );
}

export default WeatherItem;
