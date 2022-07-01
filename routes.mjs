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

  // create a new game for user
  app.post('/games', GamesController.create);

  // save user game state
  app.put('/games', GamesController.save);

  // get latest game for user
  app.get('/games', GamesController.retrieve);

  // sign up
  app.post('/signup', UsersController.signup);

  // login
  app.post('/login', UsersController.login);

  // logout
  app.post('/logout', UsersController.logout);
}
