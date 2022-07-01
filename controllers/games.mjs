const GRID_WIDTH = 6;
const GRID_HEIGHT = 6;

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

/*
 * ========================================================
 * ========================================================
 * ========================================================
 * ========================================================
 *
 *                  Controller Functions
 *
 * ========================================================
 * ========================================================
 * ========================================================
 */

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
      });

      games[0].update({ gameState: { grid: request.body.grid } });

      // send the updated game back to the user.
      response.send({
        id: user.id,
        grid: request.body.grid,
      });
    } catch (error) {
      response.status(500).send(error);
    }
  };

  // return all functions we define in an object
  // refer to the routes file above to see this used
  return {
    create,
    retrieve,
    save,
  };
}
