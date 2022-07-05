import './styles.css';
import anime from 'animejs/lib/anime.es.js';
import axios from 'axios';

const MIN_CONNECTED_DOTS = 2;
const LINE_WIDTH = 6;

let gridDots = [];
let score = 0;
let currentGame = null;
let selectedDots = [];

/**
 * Setup canvas for drawing lines.
 */
const setupCanvas = () => {
  const canvas = document.querySelector('#drawLayer');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.left = '0px';
  canvas.style.top = '0px';
};
setupCanvas();

/**
 * Remove line between dots.
 */
const removeLines = () => {
  const canvas = document.querySelector('#drawLayer');
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
};

/**
 * Get center coordinates of an element.
 * @param {Element} element HTML element.
 * @returns Element coordinates.
 */
const getCenterCoordinates = (element) => {
  const shape = element.getBoundingClientRect();
  return { x: shape.left + (shape.width / 2), y: (shape.top + (shape.height / 2)) };
};

/**
 * Prepare login page.
 */
const switchToLoginMode = () => {
  document.querySelector('.login-container').style.display = 'block';
  document.querySelector('.grid').style.display = 'none';
  document.querySelector('.game-container').style.display = 'none';
  document.querySelector('.feedback').innerHTML = '&nbsp;';

  document.querySelector('#username').value = '';
  document.querySelector('#password').value = '';
  document.querySelector('#signupUsername').value = '';
  document.querySelector('#signupPassword').value = '';
};

/**
 * Prepare transition between login and game page.
 */
const switchToLoggedinMode = () => {
  document.querySelector('.login-container').style.display = 'none';
  document.querySelector('.feedback').innerHTML = '&nbsp;';
};

/**
 * Prepare game page.
 */
const switchToGameMode = () => {
  document.querySelector('.grid').style.display = 'block';
  document.querySelector('.game-container').style.display = 'block';
  document.querySelector('.feedback').innerHTML = '&nbsp;';
};

/**
 * Remove connected dots.
 */
const removeConnectedDots = () => {
  selectedDots.forEach((selectedDot) => {
    const idTokens = selectedDot.split('-');
    gridDots[idTokens[1]][idTokens[2]] = '';
  });

  removeLines();

  anime({
    targets: selectedDots.map((selectedDot) => `#${selectedDot}`),
    opacity: 0,
    scale: 1,
  });
};

/**
 * Fix dots positions after dots are connected.
 */
const fixDotsPositionsColors = () => {
  let column = gridDots[0].length - 1;
  while (column >= 0) {
    let row = gridDots.length - 1;

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

/**
 * Draw lines between dots when they are selected.
 */
const drawLinesBetweenDots = () => {
  if (selectedDots.length > 1) {
    const canvas = document.querySelector('#drawLayer');
    const ctx = canvas.getContext('2d');
    ctx.beginPath();

    // get first dot
    const color = getDotColorFromID(selectedDots[0]);
    const firstSelectedDot = document.querySelector(`#${selectedDots[0]}`);
    const firstCoord = getCenterCoordinates(firstSelectedDot);
    ctx.moveTo(firstCoord.x, firstCoord.y);

    // draw lines from first dot to other dots
    for (let i = 1; i < selectedDots.length; i += 1) {
      if (getDotColorFromID(selectedDots[i]) === color) {
        const coord = getCenterCoordinates(document.querySelector(`#${selectedDots[i]}`));

        ctx.lineTo(coord.x, coord.y);
      } else break;
    }

    ctx.lineWidth = LINE_WIDTH;
    ctx.strokeStyle = color;
    ctx.stroke();
  }
};

/**
 * Unselect a dot.
 */
const unselectDots = () => {
  selectedDots = [];

  removeLines();

  anime.timeline({
    autoplay: true,
  }).add({
    targets: '.dot',
    scale: 1,
    delay: 1000,
  });
};

/**
 * Select a dot.
 * @param {string} id ID of dot to select.
 */
const selectDot = (id) => {
  if (selectedDots.includes(id)) {
    selectedDots.splice(selectedDots.indexOf(id), 1);
    anime({
      targets: `#${id}`,
      scale: 1,
    });
  } else {
    anime({
      targets: `#${id}`,
      scale: 1.2,
    });

    if (selectedDots.length > 0) {
      if (getDotColorFromID(selectedDots[0]) !== getDotColorFromID(id)) {
        unselectDots();
      } else {
        selectedDots.push(id);
        drawLinesBetweenDots();
      }
    } else {
      selectedDots.push(id);
    }
  }
};

/**
 * Remove dots starting from id in selected dots.
 * @param {string} id ID of dots to undo.
 */
const unselectDot = (id) => {
  const index = selectedDots.indexOf(id);
  selectedDots.splice(index);

  // redraw lines
  removeLines();
  drawLinesBetweenDots();
};

/**
 * Is the next move valid?
 * @param {string} id ID of next dot.
 * @returns True if valid, false otherwise.
 */
const isValidMove = (id) => {
  const lastColor = getDotColorFromID(selectedDots.at(-1));
  const newColor = getDotColorFromID(id);

  // make sure colors are the same
  if (lastColor !== newColor) return false;

  const lastIdTokens = selectedDots.at(-1).split('-');
  const lastX = lastIdTokens[1];
  const lastY = lastIdTokens[2];

  const newIdTokens = id.split('-');
  const newX = newIdTokens[1];
  const newY = newIdTokens[2];

  // make sure new dot is above, below, left, right only (no diagonals)
  if ((Math.abs(lastY - newY) + Math.abs(lastX - newX)) !== 1) return false;

  return true;
};

/**
 * Update score.
 * @param {number} newScore New score.
 */
const updateScore = (newScore) => {
  if (newScore) score = newScore;
  else score = 0;

  document.querySelector('.score').textContent = score;
};

/**
 * Add click event to dot.
 * @param {Element} dot Dot element.
 */
const addDotClick = (dot) => {
  dot.onmousedown = (e) => {
    e.preventDefault();
    selectDot(dot.id);
  };

  dot.onmouseover = () => {
    if ((selectedDots.length > 0) && isValidMove(dot.id)) {
      selectDot(dot.id);
    } else if (selectedDots.includes(dot.id)) {
      unselectDot(dot.id);
    }
  };

  dot.onmouseup = () => {
    if (selectedDots.length >= MIN_CONNECTED_DOTS) {
      updateScore(score + (selectedDots.length - MIN_CONNECTED_DOTS) + 1);

      removeConnectedDots();
      fixDotsPositionsColors();
      saveGame();
    }
    unselectDots();
  };
};

/**
 * Add click events to dots.
 */
const addDotClicks = () => {
  const dots = document.querySelectorAll('.dot');
  dots.forEach((dot) => {
    addDotClick(dot);
  });
};

/**
 * Display initial dots grid.
 * @param {string[][]} param0 Array of array of colors.
 */
const displayGrid = ({ grid }) => {
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
};

/**
 * Save game state.
 */
const saveGame = () => {
  axios.put('/games', { grid: gridDots, score })
    .then((response) => {
      currentGame = response.data;

      displayGrid(currentGame);
    })
    .catch((error) => {
      // handle error
      console.log(error);
    });
};

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

      updateScore(0);
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
      updateScore(currentGame.score);

      switchToGameMode();
    })
    .catch((error) => {
      // handle error
      console.log(error);
    });
};

/**
 * Log out of the game.
 */
const logout = () => {
  axios
    .post('/logout')
    .then(() => {
      switchToLoginMode();
    })
    .catch((error) => console.log(error));
};

/**
 * Add click event to Log In button.
 */
const loginBtn = document.querySelector('.btn-login');
loginBtn.addEventListener('click', () => {
  const isLoginFormValid = document.querySelector('#login-form').reportValidity();

  if (isLoginFormValid) {
    axios.post('/login', {
      email: document.querySelector('#username').value,
      password: document.querySelector('#password').value,
    })
      .then(() => {
        switchToLoggedinMode();

        axios.get('/games')
          .then(() => {
            document.querySelector('.btn-continue-modal').click();
          })
          .catch(() => {
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

/**
 * Add click event to Sign Up button.
 */
const signupBtn = document.querySelector('.btn-signup');
signupBtn.addEventListener('click', () => {
  const isSignupFormValid = document.querySelector('#signup-form').reportValidity();

  if (isSignupFormValid) {
    axios.post('/signup', {
      email: document.querySelector('#signupUsername').value,
      password: document.querySelector('#signupPassword').value,
    })
      .then(() => {
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

/**
 * Add click event to Restart button.
 */
const restartBtn = document.querySelector('.restart');
restartBtn.addEventListener('click', () => {
  createGame();
});

/**
 * Add click event to New Game button.
 */
const newGameBtn = document.querySelector('.btn-new-game');
newGameBtn.addEventListener('click', createGame);

/**
 * Add click event to Continue button.
 */
const continueGameBtn = document.querySelector('.btn-continue-game');
continueGameBtn.addEventListener('click', continueGame);

/**
 * Add click event to Log Out button.
 */
const logoutBtn = document.querySelector('.btn-logout');
logoutBtn.addEventListener('click', logout);
