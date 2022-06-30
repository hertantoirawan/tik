import { resolve } from 'path';
import db from './models/index.mjs';
import initGamesController from './controllers/games.mjs';
import initUsersController from './controllers/users.mjs';

export default function bindRoutes(app) {
  const GamesController = initGamesController(db);
  const UsersController = initUsersController(db);

  // Root route returns the Webpack-generated main.html file
  app.get('/', (request, response) => {
    response.sendFile(resolve('dist', 'main.html'));
  });

  // create a new game
  app.post('/games', GamesController.create);

  // get existing game
  app.get('/games/:id', GamesController.retrieve);

  // evaluate move
  // app.post('/games/:id/connect', GamesController.connect);

  // login
  // app.post('/login', UsersController.login);

  // logout
}
