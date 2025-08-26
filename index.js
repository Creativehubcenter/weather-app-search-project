const apiKey = "acd9714ee41f8958099b13cfc45a4186"; 
const weatherUrl = "https://api.openweathermap.org/data/2.5/weather";
const forecastUrl = "https://api.openweathermap.org/data/2.5/forecast";

const cityElement = document.querySelector(".weather-app-city");
const iconElement = document.querySelector(".weather-app-icon");
const tempElement = document.querySelector(".weather-app-temperature");
const detailsElement = document.querySelector(".weather-app-details");
const forecastElement = document.querySelector(".weather-forecast");
const form = document.getElementById("search-form");
const clockElement = document.getElementById("clock");

let clockInterval;

function startCityClock(timezoneOffset) {
  if (clockInterval) clearInterval(clockInterval);

  function updateCityTime() {
    const now = new Date();

    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    
    const cityTime = new Date(utc + timezoneOffset * 1000);

    const hours = String(cityTime.getHours()).padStart(2, "0");
    const minutes = String(cityTime.getMinutes()).padStart(2, "0");
    const seconds = String(cityTime.getSeconds()).padStart(2, "0");

    clockElement.textContent = `${hours}:${minutes}:${seconds}`;
  }

  updateCityTime();
  clockInterval = setInterval(updateCityTime, 1000);
}

async function getWeather(city) {
  try {
    const response = await axios.get(weatherUrl, {
      params: {
        q: city,
        appid: apiKey,
        units: "metric"
      }
    });

    const data = response.data;
    cityElement.textContent = data.name;
    tempElement.textContent = `${Math.round(data.main.temp)}°C`;
    detailsElement.textContent = `${data.weather[0].description}, Humidity: ${data.main.humidity}%, Wind: ${Math.round(data.wind.speed)} km/h`;
    iconElement.src = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

    startCityClock(data.timezone);
  } catch (error) {
    cityElement.textContent = "City not found!";
    tempElement.textContent = "--°C";
    detailsElement.textContent = "---";
    iconElement.src = "";
    clockElement.textContent = "--:--:--";
  }
}


async function getForecast(city) {
  try {
    const response = await axios.get(forecastUrl, {
      params: {
        q: city,
        appid: apiKey,
        units: "metric"
      }
    });

    const data = response.data;
    forecastElement.innerHTML = "";

    const dailyForecasts = data.list.filter(f => f.dt_txt.includes("12:00:00"));

    dailyForecasts.forEach(forecast => {
      const date = new Date(forecast.dt * 1000);
      const options = { weekday: "short" };
      const day = date.toLocaleDateString(undefined, options);

      forecastElement.innerHTML += `
        <div>
          <div class="weather-forecast-date">${day}</div>
          <img src="http://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png" class="weather-forecast-icon" />
          <div class="weather-forecast-temperatures">
            <span>${Math.round(forecast.main.temp_max)}°</span> 
            <span>${Math.round(forecast.main.temp_min)}°</span>
          </div>
        </div>
      `;
    });
  } catch (error) {
    forecastElement.innerHTML = "Forecast unavailable";
  }
}

form.addEventListener("submit", function(e) {
  e.preventDefault();
  const city = document.getElementById("search-input").value.trim();
  if (city) {
    getWeather(city);
    getForecast(city);
  }
});

getWeather("London");
getForecast("London");
