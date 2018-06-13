const TWITCH_STREAM_URL = 'https://api.twitch.tv/kraken/streams/'
const STATE = {
    query: "",
}
let totalStreams;
let randomNumber;

 
function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }

let errorMessage = `   <div>
Sorry, we can't find that game :(
<div>
  `



function getGameStream(searchGame, callback) {
    const twitchQueryData = {
        client_id: 'fa5umnj3xn4y05ao1vlqcwn66enqph',
        game: `${searchGame}`,
        query: `${searchGame}`,
        stream_type: 'live',
        format: 'jsonp',
        limit: 1,
        offset: randomNumber,
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

function watchChangeStream() {
    $('.main-content').on('click', '.change-streamer', event => {
        event.preventDefault();
        getGameStream(STATE.query, processSearchResults);
    })
}

function processSearchResults(data) {
    STATE.searchResults = data;
    render(STATE);
}

function render(state) {
    totalStreams = STATE.searchResults._total;
    randomNumber = getRandomInt(totalStreams);
    displayTwitchStream(state.searchResults);
}

function displayTwitchStream(data) {
    if (STATE.searchResults._total === 0) {
    $('.main-content').html(errorMessage);
    } else {
    const results = data.streams.map((item, index) => renderResult(item)).join("");
    $('.main-content').html(results);
    $('.twitch-search').appendTo('.bot-container')
    $('.description').remove()
    }
}



function renderResult(result) {
    return `
    <div class="stream-section">

        <a href="${result.channel.url}" target="_blank" class="streamer-name">Watching: ${result.channel.name}</a>
        <iframe
            class="stream-video"
            src="http://player.twitch.tv/?channel=${result.channel.name}"
            height="300"
            width="400"M
            frameborder="2"
            scrolling="no"
            allowfullscreen="true"
            autoplay="true">
        </iframe><br>
        <button type="button" class="change-streamer">Change Streamer</button>
    </div>
    `
}
//<a href="${result.channel.url}" target="_blank"><img src="${result.preview.medium}"</a>

function loadPage() {
    // render(STATE);
    watchSubmit();
    watchChangeStream();
}

$(loadPage);