const input = document.getElementById('inputCity');
var city;
let listCities = document.getElementById('ulCities');
const T0=273.15;
const weather = document.getElementById("weather");
const nameCity = document.getElementById("nameCity");
const temperature = document.getElementById("temperature");

function getCities(cityValue) {
         post('https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address', 
              { query : cityValue,
                count : '20',
                from_bound: { "value": "city" },
                to_bound: { "value": "city" }
              }
         )
            .then(data => displayResult(data.suggestions))      // обрабатываем результат вызова response.json()
            .catch(error => console.error(error))

            function post(url, data) {
                  return fetch(url, {
                    method: 'POST',              // метод POST
                    body: JSON.stringify(data),  // типа запрашиаемого документа
                    headers: new Headers({
                      'Content-Type': 'application/json',
                      'Accept': 'application/json',
                      'Authorization': 'Token c75c303d3b5f500995a3a79c44ee7ba394f195f8' 
                    }),
                  })
            .then(response => response.json()) // возвращаем промис
        }
}

function getCoords(cityValue) {
         fetch('https://geocode-maps.yandex.ru/1.x?apikey=fe6ff201-9007-40b4-8641-4ee03d369364&geocode='+cityValue+'&format=json')
          .then(res => res.json())
          .then(json => getWeather(json.response.GeoObjectCollection.featureMember[0].GeoObject.Point.pos.split(' ', 2)));
}

function getWeather(point){
    console.log(point);
    fetch('https://api.openweathermap.org/data/2.5/weather?lat='+point[1]+'&lon='+point[0]+'&appid=623d727b9cee4746bf0c777c2743f7dd')
          .then(res => res.json())
          .then(json => outputWeather(json.main.temp));
}

function update({
  target: {
    value
  }
}) {
    getCities(value);
}

function displayResult(cities){
    removeCities();
    addCities(cities);
}

function removeCities() {
    while(listCities.firstChild){
    	listCities.removeChild(listCities.firstChild);
    }
}

function addCities(cities) {
    let countsCities = cities.length;
    
    for(let i = 0; i < 3 && i < countsCities; i++){
        let region_with_type = cities[i].data.region_with_type;
        let city = cities[i].data.city;
        let city_name_full = cities[i].value;
        let cityForLi;
        if(city_name_full.toUpperCase() === region_with_type.toUpperCase()){
            cityForLi = city;
        }
        else {
            cityForLi = city + ", " + region_with_type;
        }
        let newLi = document.createElement('li');
        newLi.id = 'my-id'+i;
        newLi.onclick = function() { getCity(this); };
        newLi.innerHTML = cityForLi;
        listCities.appendChild(newLi);
    }
}

function getCity(valueCity){
    city = valueCity.innerHTML;
    input.value = city;
    removeCities();
    getCoords(city);
}
    
function outputWeather(tempInKelvin){
    let tempInCelsius = (tempInKelvin - T0).toFixed(1);
    nameCity.innerHTML = city;
    temperature.innerHTML = tempInCelsius;
    weather.classList.remove("disp_none");
}

input.addEventListener('input', update);


ы