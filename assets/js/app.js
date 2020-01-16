//document.getElementsByClassName("inputCity")[0].addEventListener("input", update);
document.querySelectorAll('.inputCity').forEach(inpCity => {
    inpCity.addEventListener("input", update);
});
document.querySelectorAll('.ulCities__item').forEach(li => {
    li.addEventListener("click", getCity);
});
 var selectedInput;
 var idSelectedInput;
 var idContainer;

ymaps.ready(init);
let myMap;

function getDataFromApi(body){
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(body.method, body.url);
        if(body.method=="GET"){
            xhr.send();
        }
        else
        {
            for (let [key, value] of Object.entries(body.headers)) {
                xhr.setRequestHeader(key, value);
            }
            xhr.send(body.data);
        }
        xhr.onload = () => resolve(JSON.parse(xhr.responseText));
        xhr.onerror = () => reject(xhr.statusText);
  });
}

function getCities(cityValue) {
        let data = JSON.stringify(
        {
            query : cityValue,
            count : "3",
            from_bound: { "value": "city" },
            to_bound: { "value": "city" }
        });
        let headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": "Token c75c303d3b5f500995a3a79c44ee7ba394f195f8",
        };
        let body = {
            method: "POST",
            url: "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address",
            headers: headers,
            data: data,
        };
        return getDataFromApi(body);
}

function getCoords(cityValue) {
    let body = {
        method: "GET",
        url: "https://geocode-maps.yandex.ru/1.x?apikey=fe6ff201-9007-40b4-8641-4ee03d369364&geocode="+cityValue+"&format=json",
    };
    return getDataFromApi(body);
}

function getWeather(point){
    let body = {
        method: "GET",
        url: "https://api.openweathermap.org/data/2.5/weather?lat="+point[1]+"&lon="+point[0]+"&appid=623d727b9cee4746bf0c777c2743f7dd",
    };
    return getDataFromApi(body);
}

function update({
  target: {
    value
  }
}) {
    selectedInput = document.activeElement;
    idContainer = selectedInput.parentElement.parentElement.id;
    idSelectedInput = selectedInput.id;
    getCities(value).then(
        response => displayResult(response.suggestions),
        error => console.log("Rejected1: ${error}" )
    );
}

function getCity(){
    let city = this.innerHTML;
    let coords;
    selectedInput.value = city;
    hideCities();
    getCoords(city).then(
        response => {
            coords = response.response.GeoObjectCollection.featureMember[0].GeoObject.Point.pos.split(' ', 2);// небезопасно
            return getWeather(coords);
        },
        error => console.log("Rejected2: ${error}"),
    ).then(
        response =>{
            let tempreture = getCelsius(response.main.temp);
            outputWeather(tempreture);
            return setTempretureOnMap(coords, tempreture);
        },
        error => console.log("Rejected3: ${error}"),
    );
}

function displayResult(cities){
    hideCities();
    addCities(cities);
}

function hideCities() {
    var el = document.querySelector("#"+ idSelectedInput);
    let listCities = el.parentNode.querySelectorAll(".ulCities li");
    for(let i = 0; i < 3; i++){
        listCities[i].innerHTML="";
    }
}

function addCities(cities) {
    let countsCities = cities.length;
    var el = document.querySelector("#"+ idSelectedInput);
    let listCities = el.parentNode.querySelectorAll('.ulCities li');
    let cityData;
    for(let i = 0; i < 3 && i < countsCities; i++){
        cityData = cities[i];
        let regionWithType = cityData.data.region_with_type;
        let city = cityData.data.city;
        let cityNameFull = cityData.value;
        let cityForLi;
        if(cityNameFull.toUpperCase() === regionWithType.toUpperCase()){
            cityForLi = city;
        }
        else {
            cityForLi = city + ", " + regionWithType;
        }
        listCities[i].innerHTML = cityForLi;
    }
}

function getCelsius(tempInKelvin){
    const T0=273.15;
    let tempInCelsius = (tempInKelvin - T0).toFixed(1);
    return tempInCelsius;
}

function outputWeather(tempInCelsius){
    let el = document.querySelector("#"+ idContainer);
    el.querySelector('.weather__nameCity').innerHTML = selectedInput.value;
    el.querySelector('.weather__temperature').innerHTML = tempInCelsius;
}

function init () {
    myMap = new ymaps.Map(idContainer+"map", {
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
        preset: "islands#blueStretchyIcon"
    }),
    myMap.geoObjects.add(myGeoObject);
}

function setTempretureOnMap(coords, tempreture){
    let lat = coords[1];
    let lon = coords[0]
    myMap.setCenter([lat,lon]);
    let mapIcon = myMap.geoObjects.get(0);
    mapIcon.geometry.setCoordinates([lat, lon]);
    mapIcon.properties.set("iconContent",tempreture+" °C");
}
