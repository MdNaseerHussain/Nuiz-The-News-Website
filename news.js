//jshint esversion:6

require("dotenv").config();

const express = require("express");
const https = require("https");
const NewsAPI = require("newsapi");
const newsapi = new NewsAPI(process.env.NEWS_API);
//var favicon = require("serve-favicon");
// var path = require("path");
const ejs = require("ejs");
const favicon = require("express-favicon");
const app = express();

app.set("view engine", "ejs");

app.use(express.static("public"));
//app.use(favicon(path.join(__dirname, "public", "favicon.ico")));

let sports = [];
let business = [];
let health = [];
let politics = [];
let technology = [];
let entertainment = [];

app.get("/", function (req, res) {
  res.redirect("/home");
});

app.get("/home", function (req, res) {
  const options = {
    method: "GET",
    hostname: "covid-193.p.rapidapi.com",
    port: null,
    path: "/statistics?country=India",
    headers: {
      "x-rapidapi-key": process.env.COVID_API,
      "x-rapidapi-host": "covid-193.p.rapidapi.com",
      useQueryString: true,
    },
  };

  /*----------------------Today-----------*/
  https.get(options, function (response) {
    response.on("data", function (hexData) {
      const covidData = JSON.parse(hexData);

      var totalCases = covidData.response[0].cases.total;
      var newCases = covidData.response[0].cases.new;
      var totalDeaths = covidData.response[0].deaths.total;
      var newDeaths = covidData.response[0].deaths.new;
      var totalRecovered = covidData.response[0].cases.recovered;

      /*---------------------- Weather-------------------*/
      const cityName = "Bhubaneswar";
      const query = cityName;
      const apiKey = process.env.WEATHER_API;
      const units = "metric";
      const url =
        "https://api.openweathermap.org/data/2.5/weather?appid=" +
        apiKey +
        "&units=" +
        units +
        "&q=" +
        query;

      https.get(url, function (response) {
        response.on("data", function (data) {
          let weatherData = JSON.parse(data);
          const temp = weatherData.main.temp;
          let weatherDescription = weatherData.weather[0].description;
          const icon = weatherData.weather[0].icon;
          const iconURL =
            "https://openweathermap.org/img/wn/" + icon + "@2x.png";

          let today = new Date();
          let yesterday = new Date();
          let val = "Sun";
          let val2 = "Jan";
          let minu = String(today.getMinutes());
          if (minu.length == 1) minu = "0" + minu;

          weatherDescription =
            weatherDescription[0].toUpperCase() +
            weatherDescription.substring(1);

          switch (today.getDay()) {
            case 1:
              val = "Mon";
              break;
            case 2:
              val = "Tue";
              break;
            case 3:
              val = "Wed";
              break;
            case 4:
              val = "Thurs";
              break;
            case 5:
              val = "Fri";
              break;
            case 6:
              val = "Sat";
              break;
            default:
              break;
          }

          switch (today.getMonth()) {
            case 1:
              val2 = "Feb";
              break;
            case 2:
              val2 = "Mar";
              break;
            case 3:
              val2 = "Apr";
              break;
            case 4:
              val2 = "May";
              break;
            case 5:
              val2 = "Jun";
              break;
            case 6:
              val2 = "Jul";
              break;
            case 7:
              val2 = "Aug";
              break;
            case 8:
              val2 = "Sep";
              break;
            case 9:
              val2 = "Oct";
              break;
            case 10:
              val2 = "Nov";
              break;
            case 11:
              val2 = "Dec";
              break;
            default:
              break;
          }
          let tempf = 1.8 * temp + 32;
          yesterday.setDate(today.getDate() - 1);

          var dd = yesterday.getDate();

          var mm = yesterday.getMonth() + 1;
          var yyyy = yesterday.getFullYear();
          if (dd < 10) {
            dd = "0" + dd;
          }

          if (mm < 10) {
            mm = "0" + mm;
          }
          const yesDay = yyyy + "-" + mm + "-" + dd;

          const prevDay = {
            method: "GET",
            hostname: "covid-193.p.rapidapi.com",
            port: null,
            path: "/history?country=India&day=" + yesDay,
            headers: {
              "x-rapidapi-key": process.env.COVID_API,
              "x-rapidapi-host": "covid-193.p.rapidapi.com",
              useQueryString: true,
            },
          };

          /*----------------------PREVDAY-----------------------*/
          https.get(prevDay, function (response) {
            response.on("data", function (data) {
              const covidData2 = JSON.parse(data);

              //         var totalCases = covidData.response[0].cases.total;
              // var newCases = covidData.response[0].cases.new;
              // var totalDeaths = covidData.response[0].deaths.total;
              // var newDeaths = covidData.response[0].deaths.new;
              // var totalRecovered = covidData.response[0].cases.recovered;

              var prevTotalCases = covidData2.response[0].cases.total;
              var prevTotalRecovered = covidData2.response[0].cases.recovered;
              var prevDeaths = covidData2.response[0].deaths.total;
              let newRecovered = totalRecovered - prevTotalRecovered;
              let newTotal = totalCases - prevTotalCases;
              let newDeathss = totalDeaths - prevDeaths;

              res.render("home", {
                Data1: totalCases,
                Data2: newTotal,
                Data3: totalDeaths,
                Data4: newDeathss,
                Data5: totalRecovered,
                Data6: newRecovered,
                Data7: temp - (temp % 1),
                Data8: weatherDescription,
                Data9: cityName,
                Data10: val,
                Data11: val2,
                Data12: today.getDate(),
                Data13: today.getHours(),
                Data14: minu,
                Data15: tempf - (tempf % 1),
                Icon: iconURL,
              });
            });
          });
        });
      });
    });
  });
});

app.get("/articles/:topic", (req, res) => {
  const topic = req.params.topic;
  const obj = {
    category: topic,
    language: "en",
    country: "us",
  };

  //   const newArticle={
  //     title:title,
  //     imgURL:imgURL,
  //     fullArticleUrl:fullArticleUrl,
  //     shortContent:shortContent
  // }

  const isEmpty = (str) => {
    return !str || str.length === 0;
  };

  const isValidUrl = (string) => {
    let url;

    try {
      url = new URL(string);
    } catch (_) {
      return false;
    }

    return url.protocol === "http:" || url.protocol === "https:";
  };

  newsapi.v2.topHeadlines(obj).then((response) => {
    sports = [];
    business = [];
    health = [];
    politics = [];
    technology = [];
    entertainment = [];
    for (let i = 0; i < response.articles.length; i++) {
      const title = response.articles[i].title;
      const imgURL = response.articles[i].urlToImage;
      const fullArticleUrl = response.articles[i].url;
      const shortContent = response.articles[i].content;

      if (
        isEmpty(title) ||
        isEmpty(shortContent) ||
        shortContent.length < 200 ||
        !isValidUrl(imgURL) ||
        !isValidUrl(fullArticleUrl)
      ) {
        continue;
      }

      const newArticle = {
        title: title,
        imgURL: imgURL,
        fullArticleUrl: fullArticleUrl,
        shortContent: shortContent,
        topic: topic,
      };

      switch (topic) {
        case "sports":
          sports.push(newArticle);
          break;

        case "politics":
          politics.push(newArticle);
          break;

        case "business":
          business.push(newArticle);
          break;

        case "health":
          health.push(newArticle);
          break;

        case "technology":
          technology.push(newArticle);
          break;

        case "entertainment":
          entertainment.push(newArticle);
          break;
      }
    }

    switch (topic) {
      case "sports":
        res.render("hpage", { arr: sports, titleName: "Sports" }); //Error
        break;

      case "politics":
        res.render("hpage", { arr: politics });
        break;

      case "business":
        res.render("hpage", { arr: business });
        break;

      case "health":
        res.render("hpage", { arr: health });
        break;

      case "technology":
        res.render("hpage", { arr: technology });
        break;

      case "entertainment":
        res.render("hpage", { arr: entertainment });
        break;
    }
  });
});
app.listen(process.env.PORT || 3000, function () {
  console.log("Server is running on port 3000.");
});
