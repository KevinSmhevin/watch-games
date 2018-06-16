// all global variables declared
/* global $ */

const TWITCH_STREAM_URL = 'https://api.twitch.tv/kraken/streams/';
const GIANTBOMB_SEARCH_URL = 'https://www.giantbomb.com/api/search/';
let totalStreams;
// let randomNumber;

// object for storing dynamic query data
const STATE = {
  query: '',
  filter: '',
  randomNumber: undefined,
};

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
  giantBombError: `<div class="error-message">
        Please try again
        <div>`,
  noUserInput: `<div class="error-message">
    Please type a game in the searchbox
  <div>`,
};

// AJAX or JSONP query functions for API request

function getGameInfo(searchGame, callback) {
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
  };
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
  };
  $.getJSON(TWITCH_STREAM_URL, twitchQueryData, callback);
}

// math functions for obtaining a random number and random streamer

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function getRandomNumber(num) {
  let randomNumber;
  if (num === 'random') {
    randomNumber = getRandomInt(totalStreams);
  } else if (num === '10') {
    randomNumber = getRandomInt(10);
  } else if (num === '25') {
    randomNumber = getRandomInt(25);
  } else if (num === '50') {
    randomNumber = getRandomInt(50);
  } else if (num === '100') {
    randomNumber = getRandomInt(100);
  } else if (num === '500') {
    randomNumber = getRandomInt(500);
  }
  return randomNumber;
}

// render related functions for altering the DOM

function renderGiantBombResult(result) {
  return `
        <div class="game-summary"> ${result.name} Summary:<br>
            ${result.deck}
        </div>
        `;
}

function renderTwitchResult(result) {
  return `
        <div class="stream-section">
    
            <a href="${result.channel.url}" target="_blank" class="streamer-name">Watching: ${result.channel.name}</a>
            <iframe
                class="stream-video"
                src="https://player.twitch.tv/?channel=${result.channel.name}"
                height="300"
                width="400"M
                frameborder="2"
                scrolling="no"
                allowfullscreen="true"
                autoplay="true">
            </iframe><br>
            <form action='#' role="form" class="change-stream-form">
            <label for="changing-stream" class="filter-label">Filter Streamers:</label>
            <select name="stream-filter" class="stream-filter">
            <option value="random">Random</option>
            <option value="10">Top 10</option>
            <option value="25">Top 25</option>
            <option value="50">Top 50</option>
            <option value="100">Top 100</option>
            <option value="500">Top 500</option>
            </select>
            <button type="submit" class="change-streamer">Change Streamer</button>
            </form>
        </div>
        `;
}

function displayButton() {
  $('.guide-button').prop('hidden', false);
}

function displayGameInfo(data) {
  if (STATE.twitchSearchResults._total !== 0) {
    const bombResults = data.results.map(item => renderGiantBombResult(item)).join('');
    $('section').html(bombResults);
  } else {
    $('section').html(errors.giantBombError);
  }
}

function displayTwitchStream(data) {
  if (STATE.twitchSearchResults._total === 0) {
    $('.main-content').html(errors.noGameError);
  } else if (STATE.twitchSearchResults._total < STATE.randomNumber) {
    $('.main-content').html(errors.notEnoughStreamsError);
  } else if (STATE.query === '') {
    $('.main-content').html(errors.noUserInput);
  } else {
    const results = data.streams.map(item => renderTwitchResult(item)).join('');
    $('.main-content').html(results);
    $('.guide-description').prop('hidden', true);
  }
}

function render(state) {
  totalStreams = STATE.twitchSearchResults._total;
  displayTwitchStream(state.twitchSearchResults);
  displayGameInfo(state.giantBombSearchResults);
  displayButton();
}

// functions for processing search results

function processGiantBombSearchResults(data) {
  STATE.giantBombSearchResults = data;
  render(STATE);
}

function processTwitchSearchResults(data) {
  STATE.twitchSearchResults = data;
  render(STATE);
}

// event listener functions

function watchSubmit() {
  $('.twitch-search-form').submit((event) => {
    event.preventDefault();
    STATE.randomNumber = 0;
    const queryTarget = $(event.currentTarget).find('.search-query');
    STATE.query = queryTarget.val();
    queryTarget.val('');
    getGameStream(STATE.query, processTwitchSearchResults);
    getGameInfo(STATE.query, processGiantBombSearchResults);
  });
}

function watchChangeStream() {
  $('.main-content').on('click', '.change-streamer', (event) => {
    event.preventDefault();
    STATE.filter = $('.stream-filter').val();
    STATE.randomNumber = getRandomNumber(STATE.filter);
    getGameStream(STATE.query, processTwitchSearchResults, STATE.randomNumber);
  });
}

function watchGuideButton() {
  $('.guide-button').click((event) => {
    event.preventDefault();
    $('.guide-description').toggle();
  });
}

function watchBackgroundSwitch() {
  $('.slider').click(() => {
    $('body').toggleClass('background');
  });
}

// functions for loading all event listeners

function loadPage() {
  watchSubmit();
  watchChangeStream();
  watchGuideButton();
  watchBackgroundSwitch();
}


$(loadPage);
