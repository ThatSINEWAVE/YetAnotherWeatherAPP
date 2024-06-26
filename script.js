// Function to get the latitude and longitude from a location string
async function getCoordinates(location) {
  const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json`);
  const data = await response.json();
  if (data.length > 0) {
    const { lat, lon } = data[0];
    return { latitude: lat, longitude: lon };
  }
  throw new Error('Location not found');
}

// Function to get the current weather data from the API
async function getCurrentWeather(latitude, longitude) {
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m,apparent_temperature,relativehumidity_2m,dewpoint_2m,precipitation_probability,rain,showers,snowfall,snow_depth,pressure_msl,surface_pressure,cloud_cover,visibility,wind_speed_10m&forecast_days=1`);
  const data = await response.json();
  return data;
}

// Function to update the UI with the weather data
function updateWeatherUI(data, location) {
  const cityElement = document.getElementById('city');
  const dateElement = document.getElementById('date');
  const weatherIconElement = document.getElementById('weather-icon');
  const temperatureElement = document.getElementById('temperature');
  const feelsLikeElement = document.getElementById('feels-like');
  const windSpeedElement = document.getElementById('wind-speed');
  const humidityElement = document.getElementById('humidity');
  const rainChanceElement = document.getElementById('rain-chance');
  const weatherInfo = document.querySelector('.weather-info');

  // Update the UI elements with the weather data
  cityElement.textContent = location;
  dateElement.textContent = new Date().toLocaleString();

  // Get the Font Awesome icon class based on the weather code
  let iconClass;
  switch (data.current_weather.weathercode) {
    case 0: // Clear sky
      iconClass = 'fa-sun';
      break;
    case 1: // Mainly clear
    case 2: // Partly cloudy
      iconClass = 'fa-cloud-sun';
      break;
    case 3: // Overcast
      iconClass = 'fa-cloud';
      break;
    case 4: // Fog
      iconClass = 'fa-smog';
      break;
    case 5: // Drizzle
    case 6: // Rain
      iconClass = 'fa-cloud-showers-heavy';
      break;
    case 7: // Thunderstorm
      iconClass = 'fa-bolt';
      break;
    case 8: // Snow
      iconClass = 'fa-snowflake';
      break;
    case 9: // Freezing rain
      iconClass = 'fa-cloud-rain';
      break;
    case 10: // Ice pellets
      iconClass = 'fa-snowflakes';
      break;
    case 11: // Hail
      iconClass = 'fa-cloud-hail';
      break;
    case 12: // Showers
      iconClass = 'fa-cloud-rain';
      break;
    // Add more cases as needed for other weather codes
    default:
      iconClass = 'fa-question-circle';
  }

  weatherIconElement.className = `fas ${iconClass}`;
  temperatureElement.textContent = `${data.current_weather.temperature}°C`;
  feelsLikeElement.textContent = `Feels Like: ${data.hourly.apparent_temperature[0]}°C`;
  windSpeedElement.textContent = `Wind Speed: ${data.current_weather.windspeed} m/s`;
  humidityElement.textContent = `Humidity: ${data.hourly.relativehumidity_2m[0]} %`;
  rainChanceElement.textContent = `Rain Chance: ${data.hourly.precipitation_probability[0]} %`;
  weatherInfo.style.display = 'block';
}

// Get the theme switch and container elements
const themeSwitch = document.getElementById('theme-switch');
const container = document.querySelector('body');

// Function to set the theme
function setTheme(theme) {
  if (theme === 'dark') {
    container.classList.add('dark-theme');
    localStorage.setItem('theme', 'dark');
  } else {
    container.classList.remove('dark-theme');
    localStorage.setItem('theme', 'light');
  }
}

// Get the user's preference from localStorage
const savedTheme = localStorage.getItem('theme');

// Set the initial theme based on the user's preference or system setting
if (savedTheme) {
  setTheme(savedTheme);
} else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
  setTheme('dark');
} else {
  setTheme('light');
}

// Set the theme switch state based on the saved theme
if (savedTheme === 'dark') {
  themeSwitch.checked = true;
} else {
  themeSwitch.checked = false;
}

// Update the theme when the switch is toggled
themeSwitch.addEventListener('change', () => {
  setTheme(themeSwitch.checked ? 'dark' : 'light');
});

// Add event listener to the location input form
const locationInput = document.getElementById('location-input');
const locationSubmit = document.getElementById('location-submit');

locationSubmit.addEventListener('click', async () => {
  const location = locationInput.value.trim();
  if (location) {
    try {
      const { latitude, longitude } = await getCoordinates(location);
      const weatherData = await getCurrentWeather(latitude, longitude);
      updateWeatherUI(weatherData, location);
    } catch (error) {
      console.error(error);
      alert('Location not found. Please try again.');
    }
  } else {
    alert('Please enter a location.');
  }
});