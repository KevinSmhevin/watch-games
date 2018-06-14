// all global variables declared 

const TWITCH_STREAM_URL = 'https://api.twitch.tv/kraken/streams/'
const GIANTBOMB_SEARCH_URL = 'https://www.giantbomb.com/api/search/';
const PLAYS_URL = 'https://api.plays.tv/data/v1/games'
let totalStreams;
let randomNumber;

// object for storing dynamic query data
const STATE = {
    query: "",
    filter: "",
}

// object for storing error messages
const errors = {
    noGameError: `   <div class="error-message">
    Sorry, we can't find that game :(, please try searching again.
    <div>
      `,
    notEnoughStreamsError: `   <div class="error-message">
    Sorry, there is not enough people streaming this game for that filter :(
    <div>
        `,
}

// AJAX or JSONP query functions for API request

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

function getGameVids(callback) {
    const playsQueryData = {
        url: PLAYS_URL,
        data: {
            appid: 'B2SXBYBoD5FpNnOaD5NrCY4ZNY-rBnZpO5Ga',
            appkey: 'fMeN2mzzE-F_nyffAip8Lm4TEBWww387',
        },
        dataType: 'json',
        type: 'GET',
        crossDomain: true,
        // jsonp: 'json_callback',
        success: callback,
    }
    $.ajax(playsQueryData)
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

// event listener functions

function watchSubmit() {
    $('.twitch-search-form').submit(event =>{
        event.preventDefault();
        randomNumber = 0;
        const queryTarget = $(event.currentTarget).find('.search-query');
        STATE.query = queryTarget.val();
        queryTarget.val("");
        getGameStream(STATE.query, processTwitchSearchResults);
        getGameInfo(STATE.query, processGiantBombSearchResults);
    });
}

function watchChangeStream() {
    $('.main-content').on('click', '.change-streamer', event => {
        event.preventDefault();
        STATE.filter = $('.stream-filter').val();
        getRandomNumber(STATE.filter)
        getGameStream(STATE.query, processTwitchSearchResults, randomNumber);
    })
}

function watchGuideButton() {
    $('.guide-button').click(event => {
        $('.guide-description').toggle();
    });
}

function watchPlaysVidTest() {
    $('.test-button').click(event => {
    getGameVids(processPlaysSearchResults)
    });
}

function PlaysVidTest() {
    getGameVids(processPlaysSearchResults)
}
// functions for processing search results 

function processPlaysSearchResults(data) {
    STATE.playsSearchResults = data;
    render(STATE)
}

function processGiantBombSearchResults(data) {
    STATE.giantBombSearchResults = data;
    render(STATE);
}

function processTwitchSearchResults(data) {
    STATE.twitchSearchResults = data;
    render(STATE);
}

// math functions for obtaining a random number and random streamer 

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }

function getRandomNumber(num) {
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

// render related functions for altering the DOM

function render(state) {
    totalStreams = STATE.twitchSearchResults._total;
    displayTwitchStream(state.twitchSearchResults);
    displayGameInfo(state.giantBombSearchResults);
    displayButton()
}

function displayButton() {
    $('.guide-button').prop('hidden', false)
}

function displayGameInfo(data) {
    const bombResults = data.results.map((item, index) => renderGiantBombResult(item)).join("");
    $('.bot-container').html(bombResults)
}

function displayTwitchStream(data) {
    if (STATE.twitchSearchResults._total === 0) {
    $('.main-content').html(errors.noGameError);
    }
    else if (STATE.twitchSearchResults._total < randomNumber) {
    $('.main-content').html(errors.notEnoughStreamsError);
    } 
    else {
    const results = data.streams.map((item, index) => renderTwitchResult(item)).join("");
    $('.main-content').html(results);
    $('.guide-description').prop('hidden', true)
    }
}

function renderGiantBombResult(result) {
    return `
    <div class="game-summary"> ${result.name} Summary:<br>
        ${result.deck}
    </div>
    `
}


function renderTwitchResult(result) {
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

//functions for loading all event listeners



function loadPage() {
    watchSubmit();
    watchChangeStream();
    watchGuideButton();
    watchPlaysVidTest();
}



$(loadPage);