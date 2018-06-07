const TWITCH_STREAM_URL = 'https://api.twitch.tv/kraken/streams/'
const STATE = {
    query: "",
}

function getGameStream(searchGame, callback) {
    const twitchQueryData = {
        client_id: 'fa5umnj3xn4y05ao1vlqcwn66enqph',
        game: `${searchGame}`,
        query: `${searchGame}`,
        stream_type: 'live',
        limit: 5
    }
    $.getJSON(TWITCH_STREAM_URL, twitchQueryData, callback)
}

function watchSubmit() {
    $('.twitch-search').submit(event =>{
        event.preventDefault();
        const queryTarget = $(event.currentTarget).find('.search-query');
        STATE.query = queryTarget.val();
        queryTarget.val("");
        getGameStream(STATE.query, processSearchResults);
    });
}

function processSearchResults(data) {
    STATE.searchResults = data;
    render(STATE);
}

function watchChangeChannel() {
    //this will load the change channel button
}

function render(state) {
    displayTwitchStream(state.searchResults)
}

function displayTwitchStream(data) {
    const results = data.streams.map((item, index) => renderResult(item));
    $('.main-content').html(results);
}

function renderResult(result) {
    return `
    <div>
        <a href="https://www.twitch.tv/${result.channel.name}" target="_blank">${result.channel.name}</a><br>
        <a href="https://www.twitch.tv/${result.channel.name}" target="_blank"><img src="${result.preview.medium}"</a>
    </div>
    `
}

function loadPage() {
    watchSubmit();
}

$(loadPage);