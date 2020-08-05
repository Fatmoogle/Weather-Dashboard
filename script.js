
var queryURL = "http://api.openweathermap.org/data/2.5/weather?q=";
var apiKey = "&units=imperial&appid=7ef3b1787fac18535ef4cdc8f06930e6";

$(document).ready(function() {
  $("#search-button").on("click", function() {
    var searchValue = $("#search-value").val();
    
    // clears input box
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
        
        // clears any old content
        $("#today").empty();

        // This creates html content for current weather (create elements on the fly)

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
  // 5 Day forecast requires a slightly different URL
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
            
            var card = $("<div>").addClass("card-body-fore");
                        
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

  var apiKeyUV ="7ef3b1787fac18535ef4cdc8f06930e6"

  function getUVIndex(lat, lon) {
    $.ajax({
      type: "GET",
      url: "http://api.openweathermap.org/data/2.5/uvi?appid="+ apiKeyUV + "&lat=" + lat + "&lon=" + lon,
      dataType: "json",
      success: function(data) {
        var uv = $("<p>").text("UV Index: ");
        var btn = $("<span>").addClass("btn btn-sm").text(data.value);
        var uvValue = parseInt(data.value);

        // change color depending on uv value
        // 0 - 2 is favorable (default is green)
        // 3 - 5 is moderate
        // Over 6 is Severe
        
        if(uvValue > 6) {
          $(btn).attr("style", "background-color:red");
          console.log("uv severe");
          
        }else if(uvValue > 3) {
          $(btn).attr("style", "background-color:yellow");
          console.log("uv moderate");
        };

        $("#today").append(uv.append(btn));
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
