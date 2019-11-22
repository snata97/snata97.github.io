document.getElementById("inputCity").addEventListener('input', update);
ymaps.ready(init);
let myMap;

function getCities(cityValue) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address");
    let data = JSON.stringify(
    {
        query : cityValue,
        count : '3',
        from_bound: { "value": "city" },
        to_bound: { "value": "city" }
    });
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Authorization", "Token c75c303d3b5f500995a3a79c44ee7ba394f195f8");
    xhr.onload = () => resolve(JSON.parse(xhr.responseText));
    xhr.onerror = () => reject(xhr.statusText);
    xhr.send(data);
  });
}

function getCoords(cityValue) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", "https://geocode-maps.yandex.ru/1.x?apikey=fe6ff201-9007-40b4-8641-4ee03d369364&geocode="+cityValue+"&format=json");
        xhr.onload = () => resolve(JSON.parse(xhr.responseText));
        xhr.onerror = () => reject(xhr.statusText);
        xhr.send();
    });
}

function getWeather(point){
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", "https://api.openweathermap.org/data/2.5/weather?lat="+point[1]+"&lon="+point[0]+"&appid=623d727b9cee4746bf0c777c2743f7dd");
        xhr.onload = () => resolve(JSON.parse(xhr.responseText));
        xhr.onerror = () => reject(xhr.statusText);
        xhr.send();
    });
}

function update({
  target: {
    value
  }
}) {
    getCities(value).then(
        response => displayResult(response.suggestions),
        error => console.log(`Rejected: ${error}`)
    );
}

function displayResult(cities){
    hideCities();
    addCities(cities);
}

function hideCities() {
    let listCities = document.querySelectorAll('#ulCities li');
    for(let i = 0; i < 3; i++){
        listCities[i].classList.add('display_none');// этого можно вообще избежать, если написать подходящий стиль. посмотри псевдо-классы
        listCities[i].innerHTML="";
    }
}

function addCities(cities) {
    let countsCities = cities.length;
    let listCities = document.querySelectorAll('#ulCities li');
    let cityData;
    for(let i = 0; i < 3 && i < countsCities; i++){
        cityData = cities[i];
        let region_with_type = cityData.data.region_with_type;
        let city = cityData.data.city;
        let city_name_full = cityData.value;
        let cityForLi;
        if(city_name_full.toUpperCase() === region_with_type.toUpperCase()){
            cityForLi = city;
        }
        else {
            cityForLi = city + ", " + region_with_type;
        }
        listCities[i].innerHTML = cityForLi;
        listCities[i].classList.remove("display_none");
    }
}

function getCity(valueCity){
    let city = valueCity.innerHTML;
    document.getElementById("inputCity").value = city;
    hideCities();
    let coords, tempreture;
    getCoords(city).then(
        response => {
            coords = response.response.GeoObjectCollection.featureMember[0].GeoObject.Point.pos.split(' ', 2);// небезопасно?
            return getWeather(coords);
        },
        error => console.log(`Rejected: ${error}`),
    ).then(
        response =>{
            tempreture = getCelsius(response.main.temp);
            outputWeather(tempreture);
            return setTempretureOnMap(coords, tempreture);
        },
        error => console.log(`Rejected: ${error}`),
    );
}

function getCelsius(tempInKelvin){
    const T0=273.15;
    const weather = document.getElementById("weather");
    const nameCity = document.getElementById("nameCity");
    const temperature = document.getElementById("temperature");
    let tempInCelsius = (tempInKelvin - T0).toFixed(1);
    return tempInCelsius;
}

function outputWeather(tempInCelsius){
    nameCity.innerHTML = document.getElementById("inputCity").value;
    temperature.innerHTML = tempInCelsius;
    weather.classList.remove("display_none");
}

function init () {
    myMap = new ymaps.Map("map", {
        center: [55.76, 37.64],
        zoom: 7
    });
    myGeoObject = new ymaps.GeoObject({
        geometry: {
            type: "Point",
            coordinates: [55.76, 37.64]
        },
        properties: {
            iconContent: "5",
        }
    }, {
        preset: 'islands#blueStretchyIcon'
    }),
    myMap.geoObjects.add(myGeoObject);
}

function setTempretureOnMap(coords, tempreture){
    myMap.setCenter([coords[1],coords[0]]);
    let mapIcon = myMap.geoObjects.get(0);
    mapIcon.geometry.setCoordinates([coords[1], coords[0]]);
    mapIcon.properties.set("iconContent",tempreture);
}
