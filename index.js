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

let errorMessage = `   <div class="error-message">
Sorry, we can't find that game :(, please try searching again.
<div>
  `
let errorMessage2 = `   <div class="error-message">
Sorry, there is not enough people streaming this game for that filter :(
<div>
    `

function getGameInfo (searchGame, callback) {
    const queryData = {      
        url: GIANTBOMB_SEARCH_URL,
        data: {
            api_key: '90c7bce2628d7e30be2c973efd4ed4bec505aa14',
            query: `${searchGame}`,
            resources: 'game',
            format: 'jsonp',
            limit: 1,
        },
        dataType: 'jsonp',
        type: 'GET',
        crossDomain: true,
        jsonp: 'json_callback',
        success: callback,
    }
    $.ajax(queryData);
}

function getGameStream(searchGame, callback, randomNumber) {
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
        randomNumber = 0
        const queryTarget = $(event.currentTarget).find('.search-query');
        STATE.query = queryTarget.val();
        queryTarget.val("");
        getGameStream(STATE.query, processSearchResults);
        getGameInfo(STATE.query, processBombSearchResults);
    });
}

function watchChangeStream() {
    $('.main-content').on('click', '.change-streamer', event => {
        event.preventDefault();
        STATE.filter = $('.stream-filter').val();
        getNumber(STATE.filter)
        getGameStream(STATE.query, processSearchResults, randomNumber);
    })
}

function processBombSearchResults(data) {
    STATE.bombSearchResults = data;
    render(STATE);
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
    displayTwitchStream(state.searchResults);
    displayGameInfo(state.bombSearchResults);
    displayButton()
}

function displayButton() {
    $('.guide-button').prop('hidden', false)
}

function watchGuideButton() {
    $('.guide-button').click(event => {
        $('.description').toggle();
    });
}

function displayGameInfo(data) {
    const bombResults = data.results.map((item, index) => renderBombResult(item)).join("");
    $('.bot-container').html(bombResults)
}

function displayTwitchStream(data) {
    if (STATE.searchResults._total === 0) {
    $('.main-content').html(errorMessage);
    }
    else if (STATE.searchResults._total < randomNumber) {
    $('.main-content').html(errorMessage2);
    } 
    else {
    const results = data.streams.map((item, index) => renderResult(item)).join("");
    $('.main-content').html(results);
    // $('.twitch-search').appendTo('.bot-container')
    $('.description').prop('hidden', true)
    }
}

function renderBombResult(result) {
    const platforms = result.platforms.filter(word => word === name).join("");
    return `
    <div class="game-summary"> ${result.name} Summary:<br>
        ${result.deck}
    </div>
    `
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
        <label for="changing-stream" class="filter-label">Filter Streamers:</label>
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
    watchSubmit();
    watchChangeStream();
    watchGuideButton();
}



$(loadPage);