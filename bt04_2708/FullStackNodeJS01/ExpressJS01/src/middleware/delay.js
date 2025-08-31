const delay = (ms) => {
  return (req, res, next) => {
    setTimeout(() => {
      next();
    }, ms);
  };
};

module.exports = { delay };