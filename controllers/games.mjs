const GRID_WIDTH = 6;
const GRID_HEIGHT = 6;

// 5 colors
const colors = ['rgb(172, 170, 118)',
  'rgb(91, 115, 141)',
  'rgb(219, 73, 84)',
  'rgb(253, 182, 176)',
  'rgb(239, 179, 93)'];

/**
 * Create new grid.
 * @returns Array of array of dots.
 */
const createGrid = () => {
  const gridDots = [];

  for (let x = 0; x < GRID_WIDTH; x += 1) {
    const tempDots = [];

    for (let y = 0; y < GRID_HEIGHT; y += 1) {
      const color = colors[Math.floor(Math.random() * (colors.length - 1))];
      tempDots.push(color);
    }

    gridDots.push(tempDots);
  }

  return gridDots;
};

/**
 * Replace empty dots with new dots.
 * @param {string[][]} param0 Grid.
 * @returns New full grid.
 */
const replaceEmptyDots = ({ grid }) => {
  for (let x = 0; x < grid.length; x += 1) {
    for (let y = 0; y < grid[x].length; y += 1) {
      if (grid[x][y] === '') {
        grid[x][y] = colors[Math.floor(Math.random() * (colors.length - 1))];
      }
    }
  }
  return grid;
};

export default function initGamesController(db) {
  const create = async (request, response) => {
    const grid = createGrid();

    const newGame = {
      gameState: {
        grid,
      },
    };

    try {
      const game = await db.Game.create(newGame);

      const user = await db.User.findOne({
        where: {
          id: request.cookies.userId,
        },
      });
      game.addUser(user);

      response.send({
        id: game.id,
        grid: game.gameState.grid,
      });
    } catch (error) {
      response.status(500).send(error);
    }
  };

  const retrieve = async (request, response) => {
    try {
      const user = await db.User.findOne({
        where: {
          id: request.cookies.userId,
        },
      });

      const games = await user.getGames({
        order: [['id', 'DESC']],
      });

      if (games) {
        response.send({
          id: games[0].id,
          grid: games[0].gameState.grid,
          score: games[0].gameState.score,
        });
      } else {
        response.status(404).send({
          error: 'The game cannot be found.',
        });
      }
    } catch (error) {
      response.status(500).send(error);
    }
  };

  const save = async (request, response) => {
    try {
      const user = await db.User.findOne({
        where: {
          id: request.cookies.userId,
        },
      });

      const games = await user.getGames({
        order: [['id', 'DESC']],
        limit: 1,
      });

      const grid = replaceEmptyDots(request.body);

      games[0].update({
        gameState: {
          grid,
          score: request.body.score,
        },
      });

      response.send({
        id: user.id,
        grid: request.body.grid,
      });
    } catch (error) {
      response.status(500).send(error);
    }
  };

  return {
    create,
    retrieve,
    save,
  };
}
