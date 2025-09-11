const city = document.querySelector('.city');
const searchBtn = document.querySelector('.search-btn');
const searchCity = document.querySelector('.search.section-message');
const weatherInfo = document.querySelector('.weather');
const country = document.querySelector('.country-txt');
const temp = document.querySelector('.temp-txt');
const condition = document.querySelector('.condition-txt');
const currentDate = document.querySelector('.current-date-txt');

const weatherImg = document.querySelector('.src');

const detailsBtns = document.querySelectorAll('.details-btn');
const detailsViews = document.querySelectorAll('.details-view');

const feelsLikeTxt = document.querySelector('#feels-like-txt');
const pressureTxt = document.querySelector('#pressure-txt');
const humidityTxt = document.querySelector('#humidity-txt');
const minTxt = document.querySelector('#min-txt'); 
const maxTxt = document.querySelector('#max-txt'); 

const windDegTxt = document.querySelector('#wind-deg-txt');
const windGustTxt = document.querySelector('#wind-gust-txt');
const windSpeedTxt = document.querySelector('#wind-speed-txt');

const sunriseTxt = document.querySelector('#sunrise-txt');
const sunsetTxt = document.querySelector('#sunset-txt');

const visibilityTxt = document.querySelector('#visibility-txt');
const cloudsTxt = document.querySelector('#clouds-txt');

const popoverLat = document.querySelector('#popover-lat');
const popoverLon = document.querySelector('#popover-lon');

const forecastContainer = document.querySelector('.forecast-container');
const gmapsBtn = document.querySelector('#gmaps-btn');

const apiKey = '717b64c259b63d6656a8032709d0a797';
const notFound = document.querySelectorAll('.search.section-message')[1]; 

let currentLon = 0;
let currentLat = 0; 

searchBtn.addEventListener('click', () => {
    if(city.value.trim() != '') {
        updateWeatherInfo(city.value);
        city.value = '';
        city.blur();
    }
})

city.addEventListener('keydown', (event) => {
    if(event.key === 'Enter' && city.value.trim() != '') {
        updateWeatherInfo(city.value);
        city.value = '';
        city.blur();
    }
    console.log(event);
})

async function getFetchData(endpoint, city) {
    const apiUrl = `/api/weather?endpoint=${endpoint}&city=${city}`;
    const response = await fetch(apiUrl);
    return response.json();
}

async function updateWeatherInfo(cityName) {
    const [weatherData, forecastData] = await Promise.all([
        getFetchData('weather', cityName),
        getFetchData('forecast', cityName)
    ]);

    if (weatherData.cod != 200) {
        showDisplaySection(notFound);
        return;
    }

    const {
        name: cityName_api,
        main: {
            temp: temperature, 
            humidity: humidityValue,
            feels_like,
            pressure,
            temp_min,
            temp_max
        },
        weather: [{main: weatherCondition, id: weatherId}],
        wind: {speed, deg, gust},
        sys: {sunrise, sunset},
        visibility,
        clouds: {all: cloudiness},
        coord: {lon, lat}
    } = weatherData;

    currentLon = lon;
    currentLat = lat;

    country.textContent = cityName_api;
    temp.textContent = `${Math.round(temperature)} °C`;
    condition.textContent = weatherCondition;

    weatherImg.src = `assets/weather/${getWeatherIcon(weatherId)}`;
    
    const now = new Date();
    const options = { weekday: 'short', day: 'numeric', month: 'short' };
    currentDate.textContent = now.toLocaleDateString('en-US', options);

    if (popoverLat && popoverLon) {
        popoverLat.textContent = lat.toFixed(4);
        popoverLon.textContent = lon.toFixed(4);
        gmapsBtn.href = `https://www.google.com/maps?q=${lat},${lon}`;
    }

    feelsLikeTxt.textContent = `${Math.round(feels_like)}°C`;
    pressureTxt.textContent = `${pressure} hPa`;
    humidityTxt.textContent = `${humidityValue}%`;
    minTxt.textContent = `${Math.round(temp_min)}°`;
    maxTxt.textContent = `${Math.round(temp_max)}°`;

    const directions = ['North', 'Northeast', 'East', 'Southeast', 'South', 'Southwest', 'West', 'Northwest'];
    const directionIndex = Math.round(deg / 45) % 8;
    windDegTxt.textContent = `${directions[directionIndex]} (${deg}°)`;
    windGustTxt.textContent = gust ? `${Math.round(gust * 3.6)} km/h` : 'No gusts';
    windSpeedTxt.textContent = `${Math.round(speed * 3.6)} km/h`;

    const formatTime = (unix) => new Date(unix * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    sunriseTxt.textContent = formatTime(sunrise);
    sunsetTxt.textContent = formatTime(sunset);

    visibilityTxt.textContent = `${visibility / 1000} km`;
    cloudsTxt.textContent = `${cloudiness}%`;

    updateForecastInfo(forecastData.list);

    showDisplaySection(weatherInfo);

    detailsBtns.forEach(btn => btn.classList.remove('active'));
    detailsViews.forEach(view => view.classList.remove('active'));
    
    document.querySelector('.details-btn[data-view="atmosphere"]').classList.add('active');
    document.querySelector('#atmosphere-view').classList.add('active');
}

function getWeatherIcon(id){
    if (id <= 232) return 'thunderstorm.svg';
    if (id <= 321) return 'drizzle.svg';
    if (id <= 531) return 'rain.svg';
    if (id <= 622) return 'snow.svg';
    if (id <= 781) return 'atmosphere.svg';
    if (id === 800) return 'clear.svg';
    else return 'clouds.svg';
}

function updateForecastInfo(forecastList) {
    forecastContainer.innerHTML = '';

    const dailyForecasts = forecastList.filter(item => item.dt_txt.includes("12:00:00"));

    dailyForecasts.forEach(day => {
        const date = new Date(day.dt * 1000);
        const dayOptions = { weekday: 'short', day: 'numeric' };
        const dayString = date.toLocaleDateString('en-US', dayOptions).replace(',', '');

        const temp = `${Math.round(day.main.temp)} °C`;
        const icon = getWeatherIcon(day.weather[0].id);

        const forecastItem = document.createElement('div');
        forecastItem.classList.add('forecast-item');
        forecastItem.innerHTML = `
            <h5 class="forecast-item-date regular-txt">${dayString}</h5>
            <img src="assets/weather/${icon}" class="forecast-item-img">
            <h5 class="forecast-item-temp">${temp}</h5>
        `;
        forecastContainer.appendChild(forecastItem);
    });
}

function showDisplaySection(section){
    [weatherInfo, searchCity, notFound].forEach(sec => sec.style.display = 'none');
    section.style.display = 'flex';
}

detailsBtns.forEach(button => {
    button.addEventListener('click', () => {
        detailsBtns.forEach(btn => btn.classList.remove('active'));
        detailsViews.forEach(view => view.classList.remove('active'));
        
        button.classList.add('active');
        
        const viewName = button.dataset.view;
        document.querySelector(`#${viewName}-view`).classList.add('active');
    });
});

const infoBtn = document.querySelector('#info-btn');
if (infoBtn) {
    infoBtn.addEventListener('click', () => {
        if (currentLat && currentLon) {
            const googleMapsUrl = `https://maps.google.com/?q=${currentLat},${currentLon}`;
            window.open(googleMapsUrl, '_blank');
        }
    });
}