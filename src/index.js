import './styles.css';
import anime from 'animejs/lib/anime.es.js';

const gridWidth = 4;
const gridHeight = 3;

const grid = document.querySelector('.grid');
const gridSize = gridWidth * gridHeight;

const colors = ['rgb(255, 0, 0)', 'rgb(0, 128, 0)', 'rgb(0, 0, 255)'];

for (let i = 0; i < gridSize; i += 1) {
  const dot = document.createElement('div');
  const x = i % gridWidth;
  const y = Math.floor(i / gridWidth);

  dot.setAttribute('id', `dot-${x}-${y}`);
  if (y === 0) {
    dot.classList.add('dot');
    dot.style.backgroundColor = colors[0];
  } else if (y === 1) {
    dot.classList.add('dot');
    dot.style.backgroundColor = colors[1];
  } else {
    dot.classList.add('dot');
    dot.style.backgroundColor = colors[2];
  }
  grid.appendChild(dot);
}

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
    dots.push(`#dot-${x}-${i}`);
  }

  return dots;
};

const removeDotsAbove = (id) => {
  const dotsAbove = getDotsAbove(id);
  console.log(dotsAbove);

  const remove = anime.timeline({
    autoplay: false,
  });

  // remove dissapearing dot
  remove.add({
    targets: `#${id}`,
    opacity: 0,
    autoplay: false,
  });

  if (dotsAbove.length > 0) {
    // make dots above the dissapearing dot fall
    remove.add({
      targets: dotsAbove,
      translateY: (dotsAbove.length === 1) ? 32 : 28,
      autoplay: false,
    });

    // fix dot positions after falling dots animation
    for (let i = dotsAbove.length - 1; i >= 0; i -= 1) {
      remove.add({
        targets: (i === dotsAbove.length - 1) ? `#${id}` : `${dotsAbove[i + 1]}`,
        background: document.querySelector(`${dotsAbove[i]}`).style.backgroundColor,
        opacity: 1,
        easing: 'steps(1)',
        autoplay: false,
      });

      remove.add({
        targets: dotsAbove[i + 1],
        background: document.querySelector(`${dotsAbove[i]}`).style.backgroundColor,
        translateY: 0,
        autoplay: false,
      });
    }

    // fill in empty coordinates with new dots
    remove.add({
      targets: dotsAbove[0],
      background: colors[anime.random(0, colors.length - 1)],
      translateY: [-20, 0],
      autoplay: false,
    });
  } else {
    // fill in empy coordinates with new dots
    remove.add({
      targets: `#${id}`,
      opacity: 1,
      translateY: [-20, 0],
      autoplay: false,
    });
  }

  remove.play();
};

let selectedDots = [];

const selectDot = (id) => {
  const select = anime.timeline({
    autoplay: false,
  });

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

  select.play();
};

const unselectDots = () => {
  selectedDots = [];

  const unselect = anime.timeline({
    autoplay: false,
  });

  unselect.add({
    targets: '.dot',
    scale: 1,
    autoplay: false,
  });

  unselect.play();
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
  if (selectedDots.length < 2) return false;
  if (!isValidMove()) return false;

  let color;
  for (let i = 0; i < selectedDots.length; i += 1) {
    const thisDotColor = document.querySelector(`#${selectedDots[i]}`).style.backgroundColor;

    if (i === 0) color = thisDotColor;
    else if (color !== thisDotColor) {
      unselectDots();
      return false;
    }
  }

  return true;
};

const dots = document.querySelectorAll('.dot');
dots.forEach((dot) => {
  dot.onclick = () => {
    console.log(dot.id);
    console.log(`before: ${selectedDots}`);
    selectDot(dot.id);
    console.log(`after: ${selectedDots}`);
    if (selectedDots.length >= 2) {
      if (dotsConnected()) {
        console.log('dots connected');
        selectedDots.forEach((selectedDot) => removeDotsAbove(selectedDot));
      }
      unselectDots();
    }
  };
});

// // document.querySelector('#oneone').onclick = replace;
// const rect = document.querySelector('#dot-0-1').getBoundingClientRect();
// console.log(rect.top, rect.right, rect.bottom, rect.left);

// const dot = document.querySelector('#dot-3-1').getBoundingClientRect();
// console.log(dot.top, dot.right, dot.bottom, dot.left);

const getCenterCoordinates = (element) => {
  const shape = element.getBoundingClientRect();
  return { x: shape.left + (shape.width / 2), y: (shape.top + (shape.height / 2)) };
};
console.log(getCenterCoordinates(document.querySelector('#dot-3-1')));
