// all global variables declared
/* eslint-disable */ 
/* global $ alert */

const TWITCH_GAME_URL = 'https://api.twitch.tv/helix/games';
const TWITCH_STREAM_URL = 'https://api.twitch.tv/helix/streams';
const TWITCH_TOP_GAMES_URL = 'https://api.twitch.tv/helix/games/top';
const TWITCH_AUTH_URL =  'https://id.twitch.tv/oauth2/token';
const GIANTBOMB_SEARCH_URL = 'https://www.giantbomb.com/api/search/';
let totalStreams;

// object for storing dynamic query data
const STATE = {
  query: '',
  filter: 'random',
  randomNumber: undefined,
  tabIndex: 0,
  pagination: '',
  access_token: ''
};

// object for storing error messages

const errors = {
  noGameError: `   <div class="error-message">
    Sorry, we can't find that game :(, please try searching again.
    <div>
    <button class="home-button"><i class="fas fa-home"></i></button>
      `,
  notEnoughStreamsError: `   <div class="error-message">
    Sorry, there is not enough people streaming this game for that filter :(
    <div>
    <button class="home-button"><i class="fas fa-home"></i></button>
        `,
  giantBombError: `<div class="error-message">
        Please try again
        <div>
        <button class="home-button"><i class="fas fa-home"></i></button>
        `,
  noUserInput: `<div class="error-message">
    Please type a game in the searchbox
  <div>
  <button class="home-button"><i class="fas fa-home"></i></button>
  `,
};

// AJAX or JSONP query functions for API request

const createQueryToGiantBomb = (searchGame) =>
  ({
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
  });

  const getAuthTokenForTwitch = () => ({
    url: TWITCH_AUTH_URL,
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    data: {
      client_id: 'fa5umnj3xn4y05ao1vlqcwn66enqph',
      client_secret: 'p8mxtcl5vix249js160h8dczk1zsv6',
      grant_type: 'client_credentials'
    },
    dataType: 'json',
    type: 'POST',
  })

  const createQueryToTwitchTopGames = (auth) => ({
    url: TWITCH_TOP_GAMES_URL,
    headers: {'Client-Id': 'fa5umnj3xn4y05ao1vlqcwn66enqph', 'Authorization': `Bearer ${auth}`},
    data: {
      format: 'json',
      first: 21
    },
    dataType: 'json',
    type: 'GET',
  })

  const createQueryToTwitchGames = (searchGame) =>
  ({
    url: TWITCH_GAME_URL,
    headers: {'Client-ID': 'fa5umnj3xn4y05ao1vlqcwn66enqph', 'Authorization': `Bearer ${STATE.access_token}`},
    data: {
      name: `${searchGame}`,
      format: 'json',
    },
    dataType: 'json',
    type: 'GET',
  });

  const createQueryToTwitchStreams = (searchID, pagination = '') => 
  ({
    url: TWITCH_STREAM_URL,
    headers: {'Client-ID': 'fa5umnj3xn4y05ao1vlqcwn66enqph', 'Authorization': `Bearer ${STATE.access_token}`},
    data: {
      game_id: searchID,
      first: 100,
      after: pagination,
    },
    dataType: 'json',
    type: 'GET',
  });

const addSuccessCallback = (settings, callback) => {
  settings.success = callback;
  return settings
};
const addErrorCallback = (settings) => {
  settings.error = (err) => {
    alert('oops, something went wrong. Try again.');
    console.error(err);
  }
  return settings
};

function getGameInfo(searchGame, callback) {
  let queryData = createQueryToGiantBomb(searchGame);
  queryData = addSuccessCallback(queryData, callback);
  queryData = addErrorCallback(queryData);
  $.ajax(queryData);
}

function getAuthToken(callback) {
  let queryData = getAuthTokenForTwitch();
  queryData = addSuccessCallback(queryData, callback);
  queryData = addErrorCallback(queryData);
  $.ajax(queryData)
}

function getTopGames(callback) {
    let queryData = createQueryToTwitchTopGames(STATE.access_token);
    queryData = addSuccessCallback(queryData, callback);
    queryData = addErrorCallback(queryData);
    $.ajax(queryData);
}

function getGameName(searchGame, callback, number) {
  let queryData = createQueryToTwitchGames(searchGame, number);
  queryData = addSuccessCallback(queryData, callback);
  queryData = addErrorCallback(queryData);
  $.ajax(queryData);
}

function getGameStream(callback, pagination) {

  let queryData = createQueryToTwitchStreams(`${STATE.twitchSearchGamesResults.data[0].id}`, pagination)
  queryData = addSuccessCallback(queryData, callback);
  queryData = addErrorCallback(queryData);
  $.ajax(queryData)
}


// math functions for obtaining a random number and random streamer

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function getRandomNumber(num) {
  let randomNumber;
  if (num === 'random') {
    randomNumber = getRandomInt(100);
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
        <div class="game-summary"> <h4 class="summary-title">${result.name} Summary:</h4><br><br>
            <p class="game-description">${result.deck}</p>
        </div>
        `;
}



function renderTwitchTopGameResults(result) {
  for (let i=0; i<result.data.length; i++) {
    result.data[i].box_art_url = result.data[i].box_art_url.replace("{width}", "194")
    result.data[i].box_art_url = result.data[i].box_art_url.replace("{height}", "258")
  }
  return `
    <h2> Current Top Games </h2>
    <br>
    <div class ="top-games-container">
      <div class ="top-games-box">
        <article role="article" class="image-box" tabindex=${STATE.tabIndex}>
        <h4>${result.data[0].name}</h4>
        <img src="${result.data[0].box_art_url}" class="top-games-img" alt="${result.data[0].name}">
        </article>      
      </div>
      <div class ="top-games-box">
        <article role="article" class="image-box" tabindex=${STATE.tabIndex}>
        <h4>${result.data[1].name}</h4>
        <img src ="${result.data[1].box_art_url}" class="top-games-img">
        </article>
      </div>
      <div class ="top-games-box">
        <article role="article" class="image-box" tabindex=${STATE.tabIndex}>
          <h4>${result.data[2].name}</h4>
          <img src ="${result.data[2].box_art_url}" class="top-games-img">
        </article>
      </div>
      <div class ="top-games-box">
      <article role="article" class="image-box" tabindex=${STATE.tabIndex}>
        <h4>${result.data[3].name}</h4>
        <img src ="${result.data[3].box_art_url}" class="top-games-img">
        </article>
      </div>
      <div class ="top-games-box">
      <article role="article" class="image-box" tabindex=${STATE.tabIndex}>
        <h4>${result.data[4].name}</h4>
        <img src ="${result.data[4].box_art_url}" class="top-games-img">
        </article>
      </div>
      <div class ="top-games-box">
      <article role="article" class="image-box" tabindex=${STATE.tabIndex}>
        <h4>${result.data[5].name}</h4>
        <img src ="${result.data[5].box_art_url}" class="top-games-img">
        </article>
      </div>
      <div class ="top-games-box">
      <article role="article" class="image-box" tabindex=${STATE.tabIndex}>
        <h4>${result.data[6].name}</h4>
        <img src ="${result.data[6].box_art_url}" class="top-games-img">
        </article>
      </div>
      <div class ="top-games-box">
      <article role="article" class="image-box" tabindex=${STATE.tabIndex}>
        <h4>${result.data[7].name}</h4>
        <img src ="${result.data[7].box_art_url}" class="top-games-img">
        </article>
      </div>
      <div class ="top-games-box">
        <article role="article" class="image-box" tabindex=${STATE.tabIndex}>
        <h4>${result.data[8].name}</h4>
        <img src ="${result.data[8].box_art_url}" class="top-games-img">
        </article>
      </div>
      <div class ="top-games-box">
      <article role="article" class="image-box" tabindex=${STATE.tabIndex}>
        <h4>${result.data[9].name}</h4>
        <img src ="${result.data[9].box_art_url}" class="top-games-img">
        </article>
      </div>
      <div class ="top-games-box">
        <article role="article" class="image-box" tabindex=${STATE.tabIndex}>
        <h4>${result.data[10].name}</h4>
        <img src ="${result.data[10].box_art_url}" class="top-games-img">
        </article>
      </div>
      <div class ="top-games-box">
        <article role="article" class="image-box" tabindex=${STATE.tabIndex}>
        <h4>${result.data[11].name}</h4>
        <img src ="${result.data[11].box_art_url}" class="top-games-img">
        </article>
      </div>
      <div class ="top-games-box">
        <article role="article" class="image-box" tabindex=${STATE.tabIndex}>
        <h4>${result.data[12].name}</h4>
        <img src ="${result.data[12].box_art_url}" class="top-games-img">
        </article>
      </div>
      <div class ="top-games-box">
        <article role="article" class="image-box" tabindex=${STATE.tabIndex}>
        <h4>${result.data[13].name}</h4>
        <img src ="${result.data[13].box_art_url}" class="top-games-img">
        </article>
      </div>
      <div class ="top-games-box">
        <article role="article" class="image-box" tabindex=${STATE.tabIndex}>
        <h4>${result.data[14].name}</h4>
        <img src ="${result.data[14].box_art_url}" class="top-games-img">
        </article>
      </div>
      <div class ="top-games-box">
      <article role="article" class="image-box" tabindex=${STATE.tabIndex}>
        <h4>${result.data[15].name}</h4>
        <img src ="${result.data[15].box_art_url}" class="top-games-img">
        </article>
      </div>
      <div class ="top-games-box">
        <article role="article" class="image-box" tabindex=${STATE.tabIndex}>
        <h4>${result.data[16].name}</h4>
        <img src ="${result.data[16].box_art_url}" class="top-games-img">
        </article>
      </div>
    <div class ="top-games-box">
      <article role="article" class="image-box" tabindex=${STATE.tabIndex}>
      <h4>${result.data[17].name}</h4>
      <img src ="${result.data[17].box_art_url}" class="top-games-img">
      </article>
    </div>
    <div class ="top-games-box">
      <h4>${result.data[18].name}</h4>
      <img src ="${result.data[18].box_art_url}" class="top-games-img">
    </div>
    <div class ="top-games-box">
    <h4>${result.data[19].name}</h4>
    <img src ="${result.data[19].box_art_url}" class="top-games-img">
  </div>
    </div>
    `
}

function renderTwitchResult(result) {
  console.log(result)
  return `
        <div class="stream-section">
            <iframe
                class="stream-video"
                src="https://player.twitch.tv/?channel=${result.user_name}&parent=kevinsmhevin.github.io"
                height="300"
                width="400"M
                frameborder="2"
                scrolling="no"
                allowfullscreen="true"
                autoplay="true">
            </iframe><br>
            <div class="stream-content-section">
              <div class="stream-title-section">
                <a href="https://www.twitch.tv/${result.user_name}" target="_blank" class="streamer-name">Watching: ${result.user_name}</a>
                <div class="rank-label">Top: ${STATE.randomNumber + 1}</div>
                <div class="viewer-count"><i class="fas fa-user"></i> &nbsp; ${result.viewer_count}</div>
              </div>
            <form action='#' role="form" class="change-stream-form">
              <label for="changing-stream" class="filter-label">Filter Streamers:</label>
                <select name="stream-filter" class="stream-filter">
                  <option value="${STATE.filter}">${STATE.filter}</option>
                  <option value="10">Top 10</option>
                  <option value="25">Top 25</option>
                  <option value="50">Top 50</option>
                  <option value="100">Top 100</option>
                  <option value="500">Top 500</option>
                  <option value="random">Random</option>
                </select>
              <button type="submit" class="change-streamer"><i class="fas fa-random"></i></button>
            </form>
            </div>
          </div>
        `;
}

function displayButton() {
  $('.guide-button').prop('hidden', false);
}

function displayGameInfo(data) {
  if (STATE.twitchSearchResults !== null || STATE.twitchSearchResults !== undefined ) {
    const bombResults = data.results.map(item => renderGiantBombResult(item)).join('');
    $('.stream-content-section').append(bombResults);
  } else {
    $('section').html(errors.giantBombError);
  }
}
function displayTopGames(data) {
  if (STATE.twitchTopGameResults === undefined || STATE.twitchTopGameResults === null) {
    $('.main-content').html(errors.noGameError);
  }
  else if (data === undefined || data === null) {
    $('.main-content').html(errors.noGameError);
  }
  let results = renderTwitchTopGameResults(data)
  $('.main-content').html(results);
}

function displayTwitchStream(data) {
  console.log(data)
  $('.main-content').remove('.error-message')
  if (STATE.twitchSearchGamesResults === undefined || STATE.twitchSearchGamesResults === null ) {
    $('.main-content').html(errors.noGameError);
  } 
  else if (data === undefined || data === null) {
    $('.main-content').html(errors.noGameError);
  }
  else if (STATE.query === '') {
    $('.main-content').html(errors.noUserInput);
  }
  else if (STATE.randomNumber > data.data.length) {
    $('.main-content').html(errors.notEnoughStreamsError)
  } else {
    let results
    if (STATE.randomNumber !== undefined) {
      results = renderTwitchResult(data.data[STATE.randomNumber])
    } else {
      $('.main-content').html(errors.noGameError)
    }
    $('.main-content').html(results);
    $('.guide-description').prop('hidden', true);
  }
}

function render(state) {
  displayTwitchStream(state.twitchSearchIDResults);
  displayGameInfo(state.giantBombSearchResults);
  displayButton();
}

function renderHomePage(state) {
  displayTopGames(state.twitchTopGameResults);
  displayButton();
}

// functions for processing search results

function processGiantBombSearchResults(data) {
  STATE.giantBombSearchResults = data;
  render(STATE);
}

function processAuthToken(data) {
  console.log(data)

  STATE.access_token = data.access_token
  $(loadPage);
}
function processTopTwitchGameResults(data) {
  STATE.twitchTopGameResults = data;
  renderHomePage(STATE);
}
function processTwitchSearchResults(data) {
  STATE.twitchSearchGamesResults = data;
  getGameStream(processTwitchIDSearchResults)
}

function processTwitchIDSearchResults(data) {
  STATE.twitchSearchIDResults = data
  render(STATE);
}

// event listener functions
function onPageLoad() {
  $('.header-banner').click((event) => {
    event.preventDefault();
    getAuthToken(processAuthToken)
    getTopGames(processTopTwitchGameResults);
  })
}

function watchHomeButton() {
  $('.main-content').on('click', '.home-button', (event) => {
    event.preventDefault();
    getTopGames(processTopTwitchGameResults)
  })
}

function watchGamesClick() {
  $('.main-content').on('click', '.top-games-box', (event) => {
    event.preventDefault()
    STATE.randomNumber = 0;
    const queryTarget = $(event.currentTarget).find('h4')
    STATE.query = queryTarget.html()
    STATE.twitchSearchIDResults = null;
    getGameName(STATE.query, processTwitchSearchResults);
    getGameInfo(STATE.query, processGiantBombSearchResults);
  })
}
function watchSubmit() {
  $('.twitch-search-form').submit((event) => {
    event.preventDefault();
    STATE.randomNumber = 0;
    const queryTarget = $(event.currentTarget).find('.search-query');
    STATE.query = queryTarget.val();
    queryTarget.val('');
    STATE.twitchSearchIDResults = null;
    getGameName(STATE.query, processTwitchSearchResults);
    getGameInfo(STATE.query, processGiantBombSearchResults);
  });
}


function watchChangeStream() {
  $('.main-content').on('click', '.change-streamer', (event) => {
    event.preventDefault();
    STATE.filter = $('.stream-filter').val();
    STATE.randomNumber = getRandomNumber(STATE.filter);
    // if ( STATE.randomNumber > 100 ) {
    //   for (let i=1; i<STATE.randomNumber; i+100) {
    //     STATE.pagination = STATE.twitchSearchIDResults.pagination.cursor 
    //     getGameStream(STATE.twitchSearchGamesResults.data[0].id, STATE.pagination)
    //     if (i + 99 >= STATE.randomNumber) {
    //       STATE.randomNumber = STATE.randomNumber - i  
    //       displayTwitchStream(STATE.twitchSearchIDResults)
    //     }
    //   }
    // } else {
    //   displayTwitchStream(STATE.twitchSearchIDResults)
    // }
    displayTwitchStream(STATE.twitchSearchIDResults)
    getGameInfo(STATE.query, processGiantBombSearchResults);
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
  getTopGames(processTopTwitchGameResults)
  onPageLoad();
  watchGamesClick();
  watchSubmit();
  watchChangeStream();
  watchGuideButton();
  watchBackgroundSwitch();
  watchHomeButton();
}

$(getAuthToken(processAuthToken));
