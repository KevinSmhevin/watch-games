const TWITCH_STREAM_URL = 'https://api.twitch.tv/kraken/streams/'
const GIANTBOMB_SEARCH_URL = 'https://www.giantbomb.com/api/search/';

const STATE = {
    query: "",
    filter: "",
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

function getGameInfo (searchGame, callback) {
    const queryData = {
        api_key: `90c7bce2628d7e30be2c973efd4ed4bec505aa14`,
        url: GIANTBOMB_SEARCH_URL,
        query: `${searchGame}`,
        resources: 'game',
        format: 'jsonp',
        limit: 1,
    }
    $.getJSON(GIANTBOMB_SEARCH_URL, queryData, callback)
}

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
        STATE.filter = $('.stream-filter').val();
        getGameStream(STATE.query, processSearchResults);
    })
}

function processSearchResults(data) {
    STATE.searchResults = data;
    render(STATE);
}

function getNumber(num) {
    if (num === "random") {
        randomNumber = getRandomInt(totalStreams);
    } else if (num === "25") {
        randomNumber = getRandomInt(25)
    } else if (num === "50") {
        randomNumber = getRandomInt(50)
    } else if (num === "100") {
        randomNumber = getRandomInt(100)
    }
    return randomNumber
}

function render(state) {
    totalStreams = STATE.searchResults._total;
    getNumber(STATE.filter)
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
        <form action='#' class="change-stream">
        <label for="changing-stream"></label>
        <select name="stream-filter" class="stream-filter">
        <option value="random">Random</option>
        <option value="25">Top 25</option>
        <option value="50">Top 50</option>
        <option value="100">Top 100</option>
        </select>
        <button type="submit" class="change-streamer">Change Streamer</button>
        </form>
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