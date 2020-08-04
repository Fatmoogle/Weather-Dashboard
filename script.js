
var queryURL = "http://api.openweathermap.org/data/2.5/weather?q=";
var apiKey = "&units=imperial&appid=7ef3b1787fac18535ef4cdc8f06930e6";

$(document).ready(function() {
  $("#search-button").on("click", function() {
    var searchValue = $("#search-value").val();
    
    // clear input box
    $("#search-value").val("");
  
    searchWeather(searchValue);
  });

  $(".history").on("click", "li", function() {
    searchWeather($(this).text());
  });

  function makeRow(text) {
    var li = $("<li>").addClass("list-group-item list-group-item-action").text(text);
    $(".history").append(li);
  }

  function searchWeather(searchValue) {
    $.ajax({
      type: "GET",
      url: queryURL + searchValue + apiKey,
      dataType: "json",
      success: function(data) {
        // create history link for this search
        if (history.indexOf(searchValue) === -1) {
          history.push(searchValue);
          window.localStorage.setItem("history", JSON.stringify(history));
    
          makeRow(searchValue);
        }
        
        // clear any old content

        // create html content for current weather (create elements on the fly)
        // need one for: city, date, temperature, humidity, wind speed, and uv index

        var weatherDiv = $("<div>");

        //  City Name
        var city = data.name;
        var cityElement = $("<h1>").text(city);
        weatherDiv.append(cityElement);

        //  Current Date
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();
        today = mm + '/' + dd + '/' + yyyy;
        cityElement.append(" " + today);

        // Icon
        var iconId = data.weather[0].icon;
        var iconURL = "http://openweathermap.org/img/wn/" + iconId + "@2x.png";
        var icon = $("<img>").attr("src", iconURL);
        cityElement.append(icon);

        //  Temperature
        var temperature = data.main.temp
        var tempElement = $("<p>").text("Temperature: " + temperature + " ℉");
        weatherDiv.append(tempElement);

        //  Humidity
        var humidity = data.main.humidity;
        var humidityElement = $("<p>").text("Humidity: " + humidity + "%");
        weatherDiv.append(humidityElement);

        //  Wind Speed
        var wind = data.wind.speed;
        var windElement = $("<p>").text("Wind Speed: " + wind + " MPH");
        weatherDiv.append(windElement);

        // UV Index
        // var uvIndex = 

        // merge and add to page (append!)
        $("#today").append(weatherDiv);

        // call follow-up api endpoints
        getForecast(searchValue);
        getUVIndex(data.coord.lat, data.coord.lon);
      }
    });
  }
  
  // Make seperate VAR that holds FORECAST in the url, not WEATHER
  
  var forecastURL = "http://api.openweathermap.org/data/2.5/forecast?q=";

  function getForecast(searchValue) {
    $.ajax({
      type: "GET",
      url: forecastURL + searchValue + apiKey,
      dataType: "json",
      success: function(data) {
        // overwrite any existing content with title and empty row
        $("#forecast").empty();
        
        // loop over all forecasts (by 3-hour increments)
        for (var i = 0; i < data.list.length; i++) {
          // only look at forecasts around 3:00pm
          if (data.list[i].dt_txt.indexOf("15:00:00") !== -1) {
            // create html elements for a bootstrap card
            
            var card = $("<div>").addClass("card-body");
            
            //THEN I am presented with a 5-day forecast that displays the date, an icon representation of weather conditions, the temperature, and the humidity
            
            //  Current Date
            var today = new Date();
            var dd = String(today.getDate()).padStart(2, '0');
            var mm = String(today.getMonth() + 1).padStart(2, '0'); 
            var yyyy = today.getFullYear();
            today = mm + '/' + dd + '/' + yyyy;
            card.append(" " + today);

            // Icon
            var iconId = data.list[i].weather[0].icon;
            var iconURL = "http://openweathermap.org/img/wn/" + iconId + "@2x.png";
            var icon = $("<img>").attr("src", iconURL);
            card.append(icon);

            // Temperature
            var temperatureFore = data.list[i].main.temp
            var tempElementFore = $("<p>").text("Temp: " + temperatureFore + " ℉");
            card.append(tempElementFore);
            
            // Humidity
            var humidityFore = data.list[i].main.humidity
            var humidityElementFore = $("<p>").text("Humidity: " + humidityFore + "%");
            card.append(humidityElementFore);

            // merge together and put on page
            $("#forecast").append(card);
          }
        }
      }
    });
  }

  function getUVIndex(lat, lon) {
    $.ajax({
      type: "",
      url: "" + lat + "&lon=" + lon,
      dataType: "json",
      success: function(data) {
        var uv = $("<p>").text("UV Index: ");
        var btn = $("<span>").addClass("btn btn-sm").text(data.value);
        
        // change color depending on uv value
        
        $("#today .card-body").append(uv.append(btn));
      }
    });
  }

  // get current history, if any
  var history = JSON.parse(window.localStorage.getItem("history")) || [];

  if (history.length > 0) {
    searchWeather(history[history.length-1]);
  }

  for (var i = 0; i < history.length; i++) {
    makeRow(history[i]);
  }
});
