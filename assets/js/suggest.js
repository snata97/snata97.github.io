let point;
let tempInCelsius;
const T0=273.15;
const weather = document.getElementById("weather");
const nameCity = document.getElementById("nameCity");
const temperature = document.getElementById("temperature");

ymaps.ready(init);

function init() {
    // Создаем выпадающую панель с поисковыми подсказками и прикрепляем ее к HTML-элементу по его id.
    var suggestView1 = new ymaps.SuggestView('city',{
        results: 3,
    });
    
    suggestView1.events.add('select', function (event) {
        getCoords(event.get("item").value);
        setTimeout(getWeather,300);
        setTimeout(setCityAndWeather,3000,event.get("item").displayName);
    });
}

function setCityAndWeather(city){
    nameCity.innerHTML = city;
    temperature.innerHTML = tempInCelsius + " °C";
    weather.classList.remove("disp_none");
}

function getCoords(cityValue) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'https://geocode-maps.yandex.ru/1.x?apikey=fe6ff201-9007-40b4-8641-4ee03d369364&geocode='+cityValue+'&format=json');
        xhr.send();
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                point = (JSON.parse(xhr.response)).response.GeoObjectCollection.featureMember[0].GeoObject.Point.pos.split(' ', 2);
            }
        };
}

function getWeather(){
    var xhr = new XMLHttpRequest();
        xhr.open('GET', 'https://api.openweathermap.org/data/2.5/weather?lat='+point[0]+'&lon='+point[1]+'&appid=623d727b9cee4746bf0c777c2743f7dd');
        xhr.send();
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                let tempInKelvin = JSON.parse(xhr.response).main.temp;
                tempInCelsius = (tempInKelvin - T0).toFixed(1);
                console.log(tempInCelsius);
            }
        };
}

