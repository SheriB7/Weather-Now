//  DOM 
var searchItem = document.querySelector("#search-item");
var cityNameInput = document.querySelector("#city-name");
var currentWeather = document.querySelector("#current-weather");
var currentWeather = document.querySelector("#weather");
var previousSearchContainer = document.querySelector("#previous-searches");
var previousSearches = document.querySelector("#previous-searches");
var fiveDayHeader = document.querySelector("#five-day");
var dailyCardContainer = document.querySelector("#daily-forecast");
var searchValue = document.querySelector("#city-name").textContent;
// localCityArray GV
var localCityArray = [];


let previousSearch = JSON.parse(localStorage.getItem("searches"));

// localStorage is removed 
if (previousSearch !== null) {
    for (let i = 0; i < previousSearch.length; i++) {
        if (previousSearch[i] === null) {
            previousSearch.splice(i, i+1);
        } else {
            localCityArray.push(previousSearch[i]);
        }
    }
}

var updateSearchHistory = () => {
    // searches from localStorage 
    previousSearch = JSON.parse(localStorage.getItem("searches"));

    // Declared under function to ensure list is updated each time
    var existingButtons = document.querySelectorAll("#previous-searches button");

    if (previousSearch !== null) {
        existingButtons.forEach(button => {
            // Ensures buttons aren't repeated for existing searches
            for (let i = 0; i < previousSearch.length; i++)
            if (button.dataset.city.includes(previousSearch[i])) {
                previousSearch.splice(i, i + 1);
            }
        })
        for (let i = 0; i < previousSearch.length; i++) {
            var searchButton = document.createElement("button");
            searchButton.classList.add("m-2", "btn", "btn-light");
            // Sets data-city attribute on button for event listener to reference
            searchButton.dataset.city = previousSearch[i];
            searchButton.textContent = previousSearch[i];
            searchButton.addEventListener("click", (event) => {
                // References data-city property to call API
                callOpenWeather(event.target.dataset.city);
            })
            previousSearchContainer.appendChild(searchButton); 
        }
    }
}


var updateLocalStorage = (city) => {
    if (localCityArray.includes(city)) {
        return;
    } else {
        localCityArray.push(city);

        // Stores for next user visit
        localStorage.setItem("searches", JSON.stringify(localCityArray));
        
        // Calls updateSearchHistory to add new search to previous search buttons
        updateSearchHistory();
    }
}

var callOpenWeather = (city) => {
    // Creates URL for initial API
    var apiUrlCoords = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial&appid=0656324568a33303c80afd015f0c27f8";

    // Fetch
    fetch(apiUrlCoords)
    .then(function (response) {
            if (!response.ok) {
            currentWeather.innerHTML = "";
            currentWeather.textContent = "Try again!";
            var errorText = document.createElement("li");
            errorText.textContent = "City not found.";
            currentWeather.appendChild(errorText);
            dailyCardContainer.innerHTML = "";
            
            fiveDayHeader.classList.add("hidden");
        } else {
                response.json()
                .then(function (data) {
            //  variable for later
            var cityName = data.name;

            
            var oneCallUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${data.coord.lat}&lon=${data.coord.lon}&exclude=minutely,hourly,alerts&units=imperial&appid=0656324568a33303c80afd015f0c27f8`;
            
            // Fetch current and daily weather 
            fetch(oneCallUrl)
            .then(function (response) {
                if (response.ok) {
                    response.json()
                    .then(function (data) {
                // Creates icon to display current weather status
                var icon = ("<img src='https://openweathermap.org/img/w/" + data.current.weather[0].icon + ".png' alt='Weather icon'>");

                // Displays city name, weather icon, and current date pulled from moment.js
                currentWeather.innerHTML = cityName + " (" + moment().format("MM/DD/YYYY") + ") " + icon;

                var liArray = [];
                
                // Clears any existing list items from previous searches
                currentWeather.innerHTML = "";

                // current weather holder
                for (let i = 0; i < 4; i++) {
                    var li = document.createElement("li");
                    li.classList.add("mb-2");
                    liArray.push(li);
                }

                liArray[0].innerHTML = "Temperature: " + data.current.temp + " &deg;F" ;
                liArray[1].textContent = "Humidity: " + data.current.humidity + "%";
                liArray[2].textContent = "Wind Speed: " + data.current.wind_speed + " MPH";

                // UV Index 
                if (data.current.uvi <= 2) {
                    liArray[3].innerHTML = `UV Index: <button class="btn btn-info uv">${data.current.uvi}</button>`;
                } else if (data.current.uvi > 2 && data.current.uvi <= 5) {
                    liArray[3].innerHTML = `UV Index: <button class="btn btn-success uv">${data.current.uvi}</button>`;
                } else if (data.current.uvi > 5 && data.current.uvi <= 8) {
                    liArray[3].innerHTML = `UV Index: <button class="btn btn-warning uv">${data.current.uvi}</button>`;
                } else {
                    liArray[3].innerHTML = `UV Index: <button class="btn btn-danger uv">${data.current.uvi}</button>`;
                }

                
                liArray.forEach(li => {
                    currentWeather.append(li);
                })

                let dailyArray = [];

            
                dailyCardContainer.innerHTML = "";

                // Loop for 5 day weather 
                for (let i = 0; i < 5; i++) {
                    var dailyCard = document.createElement("div");
                    
                    dailyCard.innerHTML = `
                    <div class="p-2 m-2 card bg-info text-white">
                        <h2>${moment().add(i + 1, "days").format("MM/DD/YYYY")}</h2>
                        <ul id="weather">
                            <li><img src='https://openweathermap.org/img/w/${data.daily[i].weather[0].icon}.png' alt="Weather icon" class="mx-auto"></li>
                            <li>Temp: ${data.daily[i].temp.day} &deg;F</li>
                            <li>Humidity: ${data.daily[i].humidity}%</li>
                        </ul>
                    </div>`;

                dailyArray.push(dailyCard);
                }
                
                // fiveDayHeader.removeClass("hidden");
                
                dailyArray.forEach(card => {
                    dailyCardContainer.appendChild(card);
                })
                
                updateLocalStorage(cityName);
            })
        }
        })
    })
}
})   
}

// Event listener
searchItem.addEventListener("submit", (event) => {
    event.preventDefault();
    
    
    if (searchValue === "") {
        currentWeather.textContent = "Please enter a city!";
        currentWeather.innerHTML = "";
        dailyCardContainer.innerHTML = "";
        // Hides 5-day forecast if API won't be called
        fiveDayHeader.classList.add("hidden");
    } else {
        // Calls API to fetch provided value
        callOpenWeather(searchValue);
        // Clears text in input
        cityNameInput.value = "";
    }
});
// Default city to display at run time
callOpenWeather("Atlanta");
// Called at run time to populate search buttons for previous searches in localStorage
updateSearchHistory();