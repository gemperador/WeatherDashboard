// Define Variables
var apiKey = "fce6bd9d569c80c55e49fc3d9cabf2fe";
var baseUrl = "https://api.openweathermap.org";
var today = moment().format("L");

var currentWeatherEl = document.querySelector("#city-weather");
var searchInput = document.querySelector("#search-input");
var searchForm = document.querySelector("#search-form");
var recentCitySearchArr = [];

function fetchCoords(search) {
    var apiUrl = `${baseUrl}/data/2.5/weather?q=${search}&appid=${apiKey}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.coord) {
                fetchWeather(data.coord, search);
            }
        });
}

function fetchWeather(coord, cityName) {
    var { lat, lon } = coord;
    var apiUrl = `${baseUrl}/data/2.5/onecall?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            displayCurrentWeather(data, cityName);
            displayFiveDayForecast(data);
        });
}

function displayCurrentWeather(data, cityName) {
    // Display current city weather conditions
    var cityNameEl = document.createElement("h1");
    cityNameEl.innerHTML = `${cityName}  ${today}`;
    cityNameEl.setAttribute("class", "mb-4");
    cityNameEl.style.textTransform = "uppercase";

    var iconCode = data.current.weather[0].icon;
    var iconEl = document.createElement("img");
    iconEl.src = `https://openweathermap.org/img/w/${iconCode}.png`;

    var cityTempEl = document.createElement("p");
    cityTempEl.innerHTML = `Temperature: ${data.current.temp} °F`;

    var cityWindEl = document.createElement("p");
    cityWindEl.innerHTML = `Wind Speed: ${data.current.wind_speed} MPH`;

    var cityHumidEl = document.createElement("p");
    cityHumidEl.innerHTML = `Humidity: ${data.current.humidity} %`;

    var uvIndexEl = document.createElement("p");
    var uvIndexSpan = document.createElement("span");
    uvIndexSpan.setAttribute("id", "uvIndexColor");
    uvIndexSpan.setAttribute("class", "px-2 py-2 mt-2 rounded");
    uvIndexSpan.innerHTML = data.current.uvi;
    uvIndexEl.innerHTML = `UV Index: `;
    uvIndexEl.appendChild(uvIndexSpan);

    currentWeatherEl.append(
        cityNameEl,
        iconEl,
        cityTempEl,
        cityWindEl,
        cityHumidEl,
        uvIndexEl
    );

    setUVIndexColor(data.current.uvi);
}

function setUVIndexColor(uvi) {
    var uvIndexEl = document.querySelector("#uvIndexColor");
    if (uvi <= 5) {
        uvIndexEl.style.backgroundColor = "#72f05d";
        uvIndexEl.style.color = "white";
    } else if (uvi <= 7) {
        uvIndexEl.style.backgroundColor = "#e09936";
    } else if (uvi <= 10) {
        uvIndexEl.style.backgroundColor = "#eb2902";
        uvIndexEl.style.color = "white";
    } else {
        uvIndexEl.style.backgroundColor = "#8a2173";
        uvIndexEl.style.color = "white";
    }
}

function displayFiveDayForecast(data) {
    var forecastTitleEl = document.createElement("h3");
    forecastTitleEl.textContent = "Five Day Forecast:";
    document.querySelector("#forecast-title").append(forecastTitleEl);

    for (let i = 0; i < 5; i++) {
        var cityInfo = {
            date: data.daily[i].dt,
            icon: data.daily[i].weather[0].icon,
            temp: data.daily[i].temp.day,
            wind: data.daily[i].wind_speed,
            humidity: data.daily[i].humidity,
        };

        var currentDate = moment.unix(cityInfo.date).format("MM/DD/YYYY");
        var forecastIconURL = `https://openweathermap.org/img/w/${cityInfo.icon}.png`;

        var futureCard = document.createElement("div");
        futureCard.setAttribute("class", "pl-3");
        futureCard.innerHTML = `
            <div class="card pl-3 pt-3 mb-3 bg-light text-dark">
                <div class="card-body">
                    <h5>${currentDate}</h5>
                    <p><img src="${forecastIconURL}"></p>
                    <p>Temp: ${cityInfo.temp} °F</p>
                    <p>Wind: ${cityInfo.wind} MPH</p>
                    <p>Humidity: ${cityInfo.humidity}%</p>
                </div>
            </div>
        `;

        document.querySelector("#five-day-forecast").append(futureCard);
    }
}

function handleSearchForm(e) {
    e.preventDefault();
    clearWeatherData();

    var cityName = searchInput.value.trim();
    if (cityName) {
        fetchCoords(cityName);
        if (!recentCitySearchArr.includes(cityName)) {
            recentCitySearchArr.push(cityName);
            addCityToHistory(cityName);
        }
        localStorage.setItem("city", JSON.stringify(recentCitySearchArr));
    }
}

function clearWeatherData() {
    document.querySelector("#forecast-title").innerHTML = "";
    document.querySelector("#five-day-forecast").innerHTML = "";
    currentWeatherEl.innerHTML = "";
}

function addCityToHistory(cityName) {
    var searchedCityEl = document.createElement("li");
    searchedCityEl.setAttribute("class", "list-group-item");
    searchedCityEl.textContent = cityName;
    searchedCityEl.addEventListener("click", function () {
        clearWeatherData();
        searchInput.value = cityName;
        fetchCoords(cityName);
    });

    document.querySelector("#search-history").append(searchedCityEl);
}

searchForm.addEventListener("submit", handleSearchForm);

document.addEventListener("DOMContentLoaded", function () {
    var searchHistory = JSON.parse(localStorage.getItem("city"));
    if (searchHistory) {
        recentCitySearchArr = searchHistory;
        var lastSearchedCity = searchHistory[searchHistory.length - 1];
        fetchCoords(lastSearchedCity);
        searchHistory.forEach(city => addCityToHistory(city));
    }
});
