import './styles.css';
import anime from 'animejs/lib/anime.es.js';

const GRID_WIDTH = 6;
const GRID_HEIGHT = 6;
const NUM_CONNECTED_DOTS = 2;

const grid = document.querySelector('.grid');
const gridDots = [];
let score = 0;

const colors = ['rgb(172, 170, 118)', 'rgb(91, 115, 141)', 'rgb(219, 73, 84)', 'rgb(253, 182, 176)', 'rgb(239, 179, 93)'];

for (let x = 0; x < GRID_WIDTH; x += 1) {
  const tempDots = [];

  for (let y = 0; y < GRID_HEIGHT; y += 1) {
    const dot = document.createElement('div');

    dot.setAttribute('id', `dot-${x}-${y}`);
    dot.classList.add('dot');
    const color = colors[anime.random(0, colors.length - 1)];
    dot.style.backgroundColor = color;

    tempDots.push(color);
    grid.appendChild(dot);
  }

  gridDots.push(tempDots);
}
console.log(gridDots);

const setup = anime({
  targets: '.dot',
  translateY: 200,
  duration: 1000,
  autoplay: false,
});

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

const dotsConnected = () => {
  if (selectedDots.length < NUM_CONNECTED_DOTS) return false;
  if (!isValidMove()) return false;

  let color;
  for (let i = 0; i < selectedDots.length; i += 1) {
    const thisDotColor = document.querySelector(`#${selectedDots[i]}`).style.backgroundColor;

    if (i === 0) color = thisDotColor;
    else if (color !== thisDotColor) {
      return false;
    }
  }

  score += (selectedDots.length - NUM_CONNECTED_DOTS) + 1;
  return true;
};

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
      }
      unselectDots(timeline);
    }

    console.log(`score: ${score}`);
    // timeline.play();
  };
});

// const getCenterCoordinates = (element) => {
//   const shape = element.getBoundingClientRect();
//   return { x: shape.left + (shape.width / 2), y: (shape.top + (shape.height / 2)) };
// };
// console.log(getCenterCoordinates(document.querySelector('#dot-3-1')));
