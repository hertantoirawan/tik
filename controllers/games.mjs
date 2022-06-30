const GRID_WIDTH = 6;
const GRID_HEIGHT = 6;

const colors = ['rgb(172, 170, 118)', 'rgb(91, 115, 141)', 'rgb(219, 73, 84)', 'rgb(253, 182, 176)', 'rgb(239, 179, 93)'];

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
    const grid = JSON.stringify(createGrid());

    const newGame = {
      gameState: {
        grid,
      },
    };

    try {
      const game = await db.Game.create(newGame);

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
      // get the game by the ID passed in the request
      const game = await db.Game.findByPk(request.params.id);

      // send the updated game back to the user.
      response.send({
        id: game.id,
        grid: game.gameState.grid,
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
  };
}
