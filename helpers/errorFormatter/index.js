const errorFormat = (value, msg, param) => {
  return {
    errors: [
      {
        value,
        msg,
        param,
      },
    ],
  };
};
module.exports = { errorFormat };
