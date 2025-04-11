const catchError = function (controller) {
  return async function (req, res, next) {
    try {
      await controller(req, res);
    }
    catch(error) {
      console.log("HERE: ", error);
      next(error);
    }
  }
}

module.exports = catchError;