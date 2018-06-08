const TWITCH_STREAM_URL = 'https://api.twitch.tv/kraken/streams/'
const STATE = {
    query: "",
    searchResults: {
        streams: [
            {
            channel: {
                name: 'ninja'
            }
        }]
    }
}

function getGameStream(searchGame, callback) {
    const twitchQueryData = {
        client_id: 'fa5umnj3xn4y05ao1vlqcwn66enqph',
        game: `${searchGame}`,
        query: `${searchGame}`,
        stream_type: 'live',
        format: 'jsonp',
        limit: 1
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
    const results = data.streams.map((item, index) => renderResult(item)).join("");
    $('.main-content').html(results);
}

function renderResult(result) {
    return `
    <div>
        <a href="${result.channel.url}" target="_blank">${result.channel.name}</a><br>
        <iframe
            src="http://player.twitch.tv/?channel=${result.channel.name}"
            height="300"
            width="400"
            frameborder="2"
            scrolling="no"
            allowfullscreen="true"
            autoplay="true">
        </iframe>
    </div>
    `
}
//<a href="${result.channel.url}" target="_blank"><img src="${result.preview.medium}"</a>

function loadPage() {
    render(STATE);
    watchSubmit();
}

$(loadPage);