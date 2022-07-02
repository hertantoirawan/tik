import './styles.css';
import anime from 'animejs/lib/anime.es.js';
import axios from 'axios';

const GRID_WIDTH = 6;
const GRID_HEIGHT = 6;
const NUM_CONNECTED_DOTS = 2;

let gridDots = [];
let score = 0;

const getDotsAbove = (id) => {
  const dots = [];

  const idTokens = id.split('-');
  const x = idTokens[1];
  const y = idTokens[2];

  for (let i = 0; i < y; i += 1) {
    if (gridDots[x][i] !== '') dots.push(`#dot-${x}-${i}`);
  }

  return dots;
};

let selectedDots = [];

const getDotsAboveSelected = () => {
  const dotsAbove = [];

  selectedDots.forEach((selectedDot) => dotsAbove.push(getDotsAbove(selectedDot)));

  return dotsAbove.flat();
};

const getEmptyDots = () => {
  const emptyDots = [];
  const emptyColumns = {};

  selectedDots.forEach((selectedDot) => {
    const x = selectedDot.split('-')[1];

    if (x in emptyColumns) emptyColumns[x] += 1;
    else emptyColumns[x] = 1;
  });

  Object.keys(emptyColumns).forEach((key) => {
    for (let i = 0; i < emptyColumns[key]; i += 1) {
      emptyDots.push(`#dot-${key}-${i}`);
    }
  });

  return emptyDots;
};

const removeConnectedDots = (remove) => {
  selectedDots.forEach((selectedDot) => {
    const idTokens = selectedDot.split('-');
    gridDots[idTokens[1]][idTokens[2]] = '';
  });

  anime({
    targets: selectedDots.map((selectedDot) => `#${selectedDot}`),
    opacity: 0,
    scale: 1,
  });

  // remove.add({
  //   targets: selectedDots.map((selectedDot) => `#${selectedDot}`),
  //   opacity: 0,
  //   scale: 1,
  //   autoplay: false,
  // });
};

const dropDotsAbove = (remove) => {
  const dotsAbove = getDotsAboveSelected();

  if (dotsAbove.length > 0) {
    // make dots above the dissapearing dot fall
    remove.add({
      targets: dotsAbove,
      translateY: (dotsAbove.length === 1) ? 32 : 28,
      autoplay: false,
    });
  }
};

const replaceEmptyDots = (replace) => {
  const emptyDots = getEmptyDots();
  console.log(`empty dots: ${emptyDots}`);
  // fill in empty coordinates with new dots
  replace.add({
    targets: emptyDots,
    background: () => colors[anime.random(0, colors.length - 1)],
    translateY: [-20, 0],
    opacity: 1,
    autoplay: false,
  });
};

const animatedFixDotsPositionsColors = (fix) => {
  for (let i = 0; i < selectedDots.length; i += 1) {
    const dotsAbove = getDotsAbove(selectedDots[i]);

    if (dotsAbove.length > 0) {
      // fix dot colors after falling dots animation
      for (let j = dotsAbove.length - 1; j >= 0; j -= 1) {
        fix.add({
          targets: (j === (dotsAbove.length - 1)) ? `#${selectedDots[i]}` : `${dotsAbove[j + 1]}`,
          background: document.querySelector(`${dotsAbove[j]}`).style.backgroundColor,
          opacity: 1,
          easing: 'linear',
          autoplay: false,
        });
      }

      // fix dots positions after falling dots animation
      // TODO: need to hide animation
      fix.add({
        targets: dotsAbove,
        translateY: (el, index) => ((index === 0) ? el.style.transform.translateY : 0),
        easing: 'linear',
        autoplay: false,
      });
    }
  }
};

const fixDotsPositionsColors = (fix) => {
  let column = GRID_WIDTH - 1;
  while (column >= 0) {
    let row = GRID_HEIGHT - 1;

    while (row >= 0) {
      if (gridDots[row][column] === '') {
        for (let i = row - 1; i >= 0; i -= 1) {
          if (gridDots[i][column] !== '') {
            // swap empty dot with first dot above
            const nonEmptyDot = gridDots[i][column];
            gridDots[i][column] = '';
            gridDots[row][column] = nonEmptyDot;

            // animate dots position fix
            anime({
              targets: `#dot-${i}-${column}`,
              opacity: 0,
            });
            anime({
              targets: `#dot-${row}-${column}`,
              background: nonEmptyDot,
              opacity: 1,

            });

            break;
          }
        }
      }
      row -= 1;
    }
    column -= 1;
  }

  console.log('after');
  console.log(gridDots);
};

const animatedSelectDot = (select, id) => {
  if (selectedDots.includes(id)) {
    select.add({
      targets: `#${id}`,
      scale: 1,
      autoplay: false,
    });
  } else {
    select.add({
      targets: `#${id}`,
      scale: 1.2,
      autoplay: false,
    });

    selectedDots.push(id);
  }
};

const selectDot = (select, id) => {
  if (selectedDots.includes(id)) {
    selectedDots.splice(selectedDots.indexOf(id), 1);
    anime({
      targets: `#${id}`,
      scale: 1,
    });
  } else {
    selectedDots.push(id);
    anime({
      targets: `#${id}`,
      scale: 1.2,
    });
  }
};

const unselectDots = (unselect) => {
  selectedDots = [];

  anime.timeline({
    autoplay: true,
  }).add({
    targets: '.dot',
    scale: 1,
    delay: 1000,
  });

  // unselect.add({
  //   targets: '.dot',
  //   scale: 1,
  //   autoplay: false,
  // });
};

const isValidMove = () => {
  let prevX;
  let prevY;

  for (let i = 0; i < selectedDots.length; i += 1) {
    const idTokens = selectedDots[i].split('-');
    const x = idTokens[1];
    const y = idTokens[2];

    if (i > 0) {
      if ((Math.abs(prevY - y) + Math.abs(prevX - x)) !== 1) return false;
    }

    prevX = x;
    prevY = y;
  }

  return true;
};

/**
 * Get color from div ID.
 * @param {string} id Div ID.
 * @returns Background color of div.
 */
const getDotColorFromID = (id) => {
  const idTokens = id.split('-');
  const x = idTokens[1];
  const y = idTokens[2];

  return gridDots[x][y];
};

const dotsConnected = () => {
  if (selectedDots.length < NUM_CONNECTED_DOTS) return false;
  if (!isValidMove()) return false;

  let color;
  for (let i = 0; i < selectedDots.length; i += 1) {
    const thisDotColor = getDotColorFromID(selectedDots[i]);

    if (i === 0) color = thisDotColor;
    else if (color !== thisDotColor) {
      return false;
    }
  }

  score += (selectedDots.length - NUM_CONNECTED_DOTS) + 1;
  return true;
};

/**
 * Add click events to dots.
 */
const addDotClicks = () => {
  const dots = document.querySelectorAll('.dot');
  dots.forEach((dot) => {
    dot.onclick = () => {
      const timeline = anime.timeline({
        autoplay: false,
      });

      selectDot(timeline, dot.id);

      if (selectedDots.length >= NUM_CONNECTED_DOTS) {
        if (dotsConnected()) {
          console.log(`dots connected: ${selectedDots}`);
          removeConnectedDots(timeline);
          fixDotsPositionsColors(timeline);
          // replaceEmptyDots(timeline);
          saveGame();
        }
        unselectDots(timeline);
      }

      console.log(`score: ${score}`);
    // timeline.play();
    };
  });
};

/**
 * Display initial dots grid.
 * @param {string[][]} param0 Array of array of colors.
 */
const displayGrid = ({ grid }) => {
  // gridDots = JSON.parse(grid);
  gridDots = grid;

  const gridElement = document.querySelector('.grid');
  gridElement.innerHTML = '';

  for (let x = 0; x < gridDots.length; x += 1) {
    for (let y = 0; y < gridDots[x].length; y += 1) {
      const dot = document.createElement('div');

      dot.setAttribute('id', `dot-${x}-${y}`);
      dot.classList.add('dot');
      dot.style.backgroundColor = gridDots[x][y];

      gridElement.appendChild(dot);
    }
  }

  addDotClicks();

  console.log(gridDots);
};

const switchToLoginMode = () => {
  document.querySelector('.login-container').style.display = 'block';
  document.querySelector('.grid').style.display = 'none';
  document.querySelector('.btn-logout').hidden = true;
  document.querySelector('.feedback').innerHTML = '&nbsp;';

  document.querySelector('#username').value = '';
  document.querySelector('#password').value = '';
};

const switchToLoggedinMode = () => {
  document.querySelector('.login-container').style.display = 'none';
  document.querySelector('.feedback').innerHTML = '&nbsp;';
};

const switchToGameMode = () => {
  document.querySelector('.grid').style.display = 'block';
  document.querySelector('.btn-logout').hidden = false;
  document.querySelector('.feedback').innerHTML = '&nbsp;';
};

let currentGame = null;

/**
 * Start new game.
 */
const createGame = () => {
  // Make a request to create a new game
  axios.post('/games')
    .then((response) => {
      // set the global value to the new game.
      currentGame = response.data;

      // display it out to the user
      displayGrid(currentGame);

      switchToGameMode();
    })
    .catch((error) => {
      // handle error
      console.log(error);
    });
};
// createGame();

/**
 * Save game state.
 */
const saveGame = () => {
  axios.put('/games', { grid: gridDots })
    .then((response) => {
      // set the global value to the new game.
      currentGame = response.data;
    })
    .catch((error) => {
      // handle error
      console.log(error);
    });
};

/**
 * Continue previous game.
 */
const continueGame = () => {
  axios.get('/games')
    .then((response) => {
      // set the global value to the new game.
      currentGame = response.data;

      // display it out to the user
      displayGrid(currentGame);

      switchToGameMode();
    })
    .catch((error) => {
      // handle error
      console.log(error);
    });
};

const logout = () => {
  axios
    .post('/logout')
    .then((response) => {
      console.log(response.data);

      switchToLoginMode();
    })
    .catch((error) => console.log(error));
};

const loginBtn = document.querySelector('.btn-login');
loginBtn.addEventListener('click', () => {
  const isLoginFormValid = document.querySelector('#login-form').reportValidity();

  if (isLoginFormValid) {
    axios.post('/login', {
      email: document.querySelector('#username').value,
      password: document.querySelector('#password').value,
    })
      .then((response) => {
        console.log(response.data);

        switchToLoggedinMode();

        axios.get('/games')
          .then((resp) => {
            const lastGame = resp.data;
            console.log(lastGame);

            document.querySelector('.btn-continue-modal').click();
          })
          .catch((error) => {
            console.log('no existing game exists');
            createGame();
          });
      })
      .catch((error) => {
        // handle error
        console.log(error);
        document.querySelector('#loginFeedback').innerHTML = error.response.data.error;
      });
  }
});

const signupBtn = document.querySelector('.btn-signup');
signupBtn.addEventListener('click', () => {
  const isSignupFormValid = document.querySelector('#signup-form').reportValidity();

  if (isSignupFormValid) {
    axios.post('/signup', {
      email: document.querySelector('#signupUsername').value,
      password: document.querySelector('#signupPassword').value,
    })
      .then((response) => {
        console.log(response.data);

        document.querySelector('.btn-close').click();

        document.querySelector('#loginFeedback').innerHTML = 'New user has been created.<br/>Please log in to continue.';
      })
      .catch((error) => {
      // handle error
        console.log(error);
        document.querySelector('#signupFeedback').innerHTML = error.response.data.error;
      });
  }
});

const newGameBtn = document.querySelector('.btn-new-game');
newGameBtn.addEventListener('click', createGame);

const continueGameBtn = document.querySelector('.btn-continue-game');
continueGameBtn.addEventListener('click', continueGame);

const logoutBtn = document.querySelector('.btn-logout');
logoutBtn.addEventListener('click', logout);

// const getCenterCoordinates = (element) => {
//   const shape = element.getBoundingClientRect();
//   return { x: shape.left + (shape.width / 2), y: (shape.top + (shape.height / 2)) };
// };
// console.log(getCenterCoordinates(document.querySelector('#dot-3-1')));
