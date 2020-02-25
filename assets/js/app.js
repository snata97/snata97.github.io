document.getElementById("createWeather").addEventListener("click", createComponentWeather);
document.getElementById("destroyWeather").addEventListener("click", destroyComponentWeather);

let selectedInput;
let idSelectedInput;
let idContainer;

function createComponentWeather() {
    let divBlockWeather = document.createElement("div");
    divBlockWeather.className = "blockWeather";
    let counter = document.getElementById("counter").getAttribute("value");
    counter++;
    divBlockWeather.id = "Block"+counter;
    document.getElementById("counter").setAttribute("value",counter);
    //Input
    let divInput = document.createElement("div");
    divInput.className = "input";
    let inputInputCity = document.createElement("input");
    inputInputCity.id = "Input" + counter;
    inputInputCity.placeholder="Введите название города";
    inputInputCity.className = "inputCity";
    inputInputCity.type = "text";
    inputInputCity.oninput = update;
    let inputUl = document.createElement("ul");
    inputUl.className = "ulCities";
    let inputLI1 = document.createElement("li");
    inputLI1.className = "ulCities__item";
    inputLI1.onclick = getCity;
    let inputLI2 = document.createElement("li");
    inputLI2.className = "ulCities__item";
    inputLI2.onclick = getCity;
    let inputLI3 = document.createElement("li");
    inputLI3.className = "ulCities__item";
    inputLI3.onclick = getCity;
    inputUl.appendChild(inputLI1);
    inputUl.appendChild(inputLI2);
    inputUl.appendChild(inputLI3);
    divInput.appendChild(inputInputCity);
    divInput.appendChild(inputUl);
    divBlockWeather.appendChild(divInput);
    //
    //Weather
    let divWeather = document.createElement("div");
    divWeather.className = "weather";
    let divNameCity = document.createElement("h3");
    divNameCity.className = "weather__nameCity";
    let divWeatherTempr = document.createElement("div");
    divWeatherTempr.className = "weather__temperature";
    let divMap = document.createElement("div");
    divMap.className = "map";
    let divNameMap = document.createElement("div");
    divNameMap.id = "map" + "Input" + counter;
    divMap.appendChild(divNameMap);
    divWeather.appendChild(divNameCity);   
    divWeather.appendChild(divWeatherTempr);  
    divWeather.appendChild(divMap);  
    divBlockWeather.appendChild(divWeather);
    //
    document.body.appendChild(divBlockWeather);
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
function destroyComponentWeather(){
    delete mycar;
    document.getElementsByClassName("blockWeather")[0].remove();
}

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

function getCity(){
    let city = this.innerHTML;
    let coords;
    ymaps.ready(init);
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
    window["Map"+ idSelectedInput] = new ymaps.Map("map"+idSelectedInput, {
        center: [55.76, 37.64],
        zoom: 7
    });
    window["myGeoObject"+ idSelectedInput] = new ymaps.GeoObject({
        geometry: {
            type: "Point",
            coordinates: [55.76, 37.64]
        },
        properties: {
            iconContent: "5",
        }
    }, {
        preset: "islands#blueStretchyIcon"
    });
     window["Map"+ idSelectedInput].geoObjects.add(window["myGeoObject"+ idSelectedInput]);
}

function setTempretureOnMap(coords, tempreture){
    let lat = coords[1];
    let lon = coords[0];
    (window["Map"+ idSelectedInput]).setCenter([lat,lon]);
    window["mapIcon"+idSelectedInput] = window["Map"+ idSelectedInput].geoObjects.get(0);
    window["mapIcon"+idSelectedInput].geometry.setCoordinates([lat, lon]);
    window["mapIcon"+idSelectedInput].properties.set("iconContent",tempreture+" °C");
}


