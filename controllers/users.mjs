import jsSHA from 'jssha';

/**
 * Hash a password.
 * @param {string} password Password.
 * @returns Hashed password.
 */
const hashPassword = (password) => {
  const shaObj = new jsSHA('SHA-512', 'TEXT', { encoding: 'UTF8' });
  shaObj.update(password);
  return shaObj.getHash('HEX');
};

export default function initUsersController(db) {
  const login = async (req, res) => {
    console.log(req.body);
    try {
      const user = await db.User.findOne({
        where: {
          email: req.body.email,
        },
      });
      console.log('user', user);

      if (user) {
        const hashedPassword = hashPassword(req.body.password);
        console.log('hashed password', hashedPassword);

        if (hashedPassword === user.password) {
          res.cookie('loggedIn', true);
          res.cookie('userId', user.id);
          res.send({ id: user.id, email: user.email });
        } else {
          console.log('not logged in ');
          res.status(401).send({
            error: 'The login information is incorrect.',
          });
        }
      } else {
        console.log('not logged in ');
        res.status(401).send({
          error: 'The login information is incorrect.',
        });
      }
    }
    catch (error) {
      console.log(error);
    }
  };

  const logout = async (req, res) => {
    try {
      const user = await db.User.findOne({
        where: {
          id: req.cookies.userId,
        },
      });
      console.log('user', user);

      if (user) {
        res.clearCookie('loggedIn');
        res.clearCookie('userId');

        res.send({ id: user.id });
      } else {
        res.status(404).send({
          error: 'Logout failed.',
        });
      }
    }
    catch (error) {
      console.log(error);
    }
  };

  const signup = async (req, res) => {
    console.log(req.body);
    try {
      const user = await db.User.findOne({
        where: {
          email: req.body.email,
        },
      });
      console.log('user', user);

      if (!user) {
        const hashedPassword = hashPassword(req.body.password);
        console.log('hashed password', hashedPassword);

        const newUser = {
          email: req.body.email,
          password: hashedPassword,
        };

        const userNew = await db.User.create(newUser);

        res.send({
          email: userNew.email,
        });
      } else {
        res.status(409).send({
          error: 'The email address is already in use.',
        });
      }
    }
    catch (error) {
      console.log(error);
    }
  };

  return {
    login,
    logout,
    signup,
  };
}
