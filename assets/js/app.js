ymaps.ready(init);

function init() {
    // Создаем выпадающую панель с поисковыми подсказками и прикрепляем ее к HTML-элементу по его id.
    var suggestView1 = new ymaps.SuggestView('suggest1',{
        results: 3,
    });
}
