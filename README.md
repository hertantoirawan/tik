# Tik
Tik is a connect-the-dot game.

**LIVE LINK** : [https://connect-the-tik.herokuapp.com/](https://connect-the-tik.herokuapp.com/)

## Features
<img src="https://user-images.githubusercontent.com/17814490/177370951-b9f74069-57b1-484b-8dd1-e5fa492ee2d7.jpg" width="200"> <img src="https://user-images.githubusercontent.com/17814490/177370958-daf41f1a-0a20-45fa-9892-2c5cef9d9f0e.jpg" width="200"> <img src="https://user-images.githubusercontent.com/17814490/177373183-d0873fb5-d04a-4a44-9125-d3ffd33134ec.jpg" width="200">

- Minimum connected dots is 2
- Dots can be connected to dots above, below, left, right (not diagonal) and to dots of the same color
- Dots can be connected by holding a mouse click and move the pointer over other dots
- Connected dots will dissapear, dots above them will fall, empty spaces will be filled with new dots
- Dots colors are randomly chosen out of 5 options
- Each connected pair of dots will score 1, eg: 2 dots -> 1 point, 3 dots -> 2 points, and so on 
- Restart will give player a new set of dots, and resets the score
- Game state is saved after every move
- After login, player can choose to play a new game or continue last game

## How to setup and run
- ```npm i``` to install dependencies
- Install and start postgresql database locally
- ```npx sequelize db:create``` to create database
- ```npx sequelize db:migrate``` to create tables
- ```npm run watch``` to run webpack
- ```nodemon index.mjs``` to use nodemon
- Go to ```localhost:3004/``` to start using the app

## Tech Used / Data Source
- UI design and background are based on a popular connect-the-dot game, [Dots](https://www.dots.co/) 
- UI, excluding the dots grid, is done using [Bootstrap](https://getbootstrap.com/)
- Database is using [PostgreSQL](https://www.postgresql.org/)
- Animation done using [anime.js](https://animejs.com/)
- Module bundler done using [Webpack](https://webpack.js.org/)

## Documentation
More documentation about the development of the app in [Wiki](https://github.com/hertantoirawan/tik/wiki).

