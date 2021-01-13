const HttpStatus = require("http-status-codes");
const { jwtHandle, bcryptHandle, errorCustom } = require('../utils');

module.exports = {
  register: async (req, res, next) => {
    const User = req.db.model('User');
    const { username, password, confirmPassword } = req.body;
    if (password !== confirmPassword)
      throw new errorCustom(HttpStatus.BAD_REQUEST, 'Confirm password wrong');
    if (await User.findOne({ username, isRemoved: false }))
      throw new errorCustom(HttpStatus.BAD_REQUEST, 'Account existed');

    const user = await User.create({
      username,
      password: await bcryptHandle.encrypt(password),
    });

    const accessToken = jwtHandle.sign({
      userID: user._id,
      username
    });
    await User.findByIdAndUpdate(user._id, { accessToken });
    req.message = 'Regist success!';
    return {
      accessToken: 'Bearer ' + accessToken,
      userID: user._id,
      username
    };
  },
  login: async (req, res, next) => {
    const User = req.db.model('User');
    const { username, password } = req.body;
    const user = await User.findOne({ username, isRemoved: false });
    if (!user) throw new CustomError(HttpStatus.NOT_FOUND, `Account wasn't existed`);
    const checkPass = await bcryptHandle.compare(password, user.password);
    if (!checkPass) throw new CustomError(HttpStatus.BAD_REQUEST, 'Password wrong!');

    const accessToken = jwtHandle.sign({
      userID: user._id,
      username: user.username,
    });

    await User.findByIdAndUpdate(user._id, { accessToken });

    req.message = 'Login success!';
    return {
      accessToken: 'Bearer ' + accessToken,
      userID: user._id,
      username: user.username,
    };
  },
  logout: async (req, res, next) => {
    const { user } = req;
    const User = req.db.model('User');
    await User.findByIdAndUpdate(user.userID, { accessToken: '' });
    req.message = 'Logout success!';
  },
  getUserInfo: async (req, res, next) => {
    return req.user;
  }
};
