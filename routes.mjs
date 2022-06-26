import { resolve } from 'path';
import db from './models/index.mjs';
import initGamesController from './controllers/games.mjs';

export default function bindRoutes(app) {
  const GamesController = initGamesController(db);

  // Root route returns the Webpack-generated main.html file
  app.get('/', (request, response) => {
    response.sendFile(resolve('dist', 'main.html'));
  });

  // create a new game
  app.post('/games', GamesController.create);
  // update a game with new cards
  app.put('/games/:id/deal', GamesController.deal);
}
