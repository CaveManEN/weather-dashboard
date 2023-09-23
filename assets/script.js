document.addEventListener('DOMContentLoaded', function () {
    var APIKey = "734ae32f4b8a953fba7dd433e3b5136d";
    var cityInput = document.getElementById('city-input');
    var cityWeather = document.getElementById('city-weather');
    var cityListElement = document.getElementById('city-list');
    var resetCityListButton = document.getElementById('reset-city-list-button');
    var forecastURL;

    // Retrieve a list of cities from local storage
    var cityList = JSON.parse(localStorage.getItem('cityList')) || [];

    resetCityListButton.addEventListener('click', resetCityList);

    // Function to update the 5-day weather forecast
    function updateCityForecast(dayNumber, forecastDate, forecastIconCode, forecastTempKelvin, forecastWind, forecastHumidity, cardId) {
        var forecastTempFahrenheit = Math.round((forecastTempKelvin - 273.15) * 9/5 + 32);
        var forecastIconURL = `https://openweathermap.org/img/w/${forecastIconCode}.png`;

        var formattedDate = dayjs(forecastDate).format('M/DD/YYYY');

        var forecastDayElement = document.getElementById(cardId);

        if (forecastDayElement) {
            forecastDayElement.innerHTML = `
                <h4>${formattedDate}</h4>
                <img src="${forecastIconURL}" alt="Weather Icon">
                <h4>Temp: ${forecastTempFahrenheit}°F</h4>
                <h4>Wind: ${forecastWind} MPH</h4>
                <h4>Humidity: ${forecastHumidity}%</h4>
            `;
        }
    }

    // Attach a click event to the search button
    document.getElementById('save-city-button').addEventListener('click', function (event) {
        event.preventDefault();
        // Get the user-entered city name
        var city = cityInput.value.trim();

        if (city === "") {
            alert('Please enter a city name');
        } else {
            // URL for fetching current weather data
            var weatherURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + APIKey;

            // Fetch current weather data from the API
            fetch(weatherURL)
                .then(function (response) {
                    return response.json();
                })
                .then(function (data) {
                    console.log("Weather data", data);
                    // Extract relevant weather info from the API response
                    var cityName = data.name;
                    var temp = data.main.temp;
                    var wind = data.wind.speed;
                    var humidity = data.main.humidity;
                    var lat = data.coord.lat;
                    var lon = data.coord.lon;

                    // Function to update the displayed current weather
                    updateCityWeather(cityName, data.weather, temp, wind, humidity);

                    // URL for weather forecast data
                    forecastURL = "https://api.openweathermap.org/data/2.5/forecast?lat=" + lat + "&lon=" + lon + "&appid=" + APIKey;

                    // Fetch weather forecast data from API
                    return fetch(forecastURL);
                })
                .then(function (response) {
                    return response.json();
                })
                .then(function (forecastData) {
                    console.log("Forecast data", forecastData);
                    // Process and display the 5-day forecast
                    var dayNumber = 1;
                    for (var i = 0; i < forecastData.list.length; i++) {
                        var forecastItem = forecastData.list[i];
                        if (forecastItem.dt_txt.includes("15:00:00")) {
                            var forecastDate = forecastItem.dt_txt;
                            var forecastIconCode = forecastItem.weather[0].icon;
                            var forecastTemp = forecastItem.main.temp;
                            var forecastWind = forecastItem.wind.speed;
                            var forecastHumidity = forecastItem.main.humidity;

                            // Update the HTML display with the forecast data
                            updateCityForecast(dayNumber, forecastDate, forecastIconCode, forecastTemp, forecastWind, forecastHumidity, `forecast-day-${dayNumber}`);
                            dayNumber++;
                        }
                    }
                })
                .catch(function (error) {
                    console.log(error);
                    alert('Error fetching data. Please try again.');
                });

            // Add the searched city to the city list
            cityList.push({ city: city });

            // Store the updated city list in local storage
            localStorage.setItem('cityList', JSON.stringify(cityList));

            // Display the list of searched cities
            showCities();
        }
    });

    // Function to display after the API is fetched
    function updateCityWeather(cityName, weatherData, tempKelvin, wind, humidity) {
        var tempFahrenheit = Math.round((tempKelvin - 273.15) * 9/5 + 32);
        var weatherIconCode = weatherData[0].icon;
        var iconURL = `https://openweathermap.org/img/w/${weatherIconCode}.png`;
        cityWeather.innerHTML = `
        <h2>${cityName} ${dayjs().format('M/DD/YYYY')}</h2>
        <img src="${iconURL}" alt="Weather Icon">
        <h4>Temp: ${tempFahrenheit}°F</h4>
        <h4>Wind: ${wind} MPH</h4>
        <h4>Humidity: ${humidity}%</h4>
        `;
    }

    // Function to display the list of searched cities
    function showCities() {
        cityListElement.innerHTML = '';
        var uniqueCities = [];

        cityList.forEach(function (cityObj) {
            if (!uniqueCities.includes(cityObj.city)) {
                uniqueCities.push(cityObj.city);
                var li = document.createElement('li');
                var cityButton = document.createElement('button');
                cityButton.textContent = cityObj.city;
                cityButton.classList.add('list-group-item', 'list-group-item-dark', 'text-center', 'mb-2', 'rounded', 'full-width-button');

                cityButton.addEventListener('click', function () {
                    cityInput.value = cityObj.city;
                    document.getElementById('save-city-button').click();
                });

                li.appendChild(cityButton);
                cityListElement.appendChild(li);
            }
        });
    }

    // Function to reset the city list
    function resetCityList(event) {
        event.preventDefault();
        localStorage.removeItem('cityList');
        cityList = [];

        var forecastDays = document.querySelectorAll(".forecast-day");
        forecastDays.forEach(function (forecastDay) {
            forecastDay.innerHTML = `
                <h4><br></h4>
                <h4><br></h4>
                <h4>Temp: </h4>
                <h4>Wind: </h4>
                <h4>Humidity: </h4>
            `;
        });

        cityWeather.innerHTML = `
            <h2>Please enter a city name</h2>
            <h4>Temp: </h4>
            <h4>Wind: </h4>
            <h4>Humidity: </h4>
        `;
        showCities();
    }
});
