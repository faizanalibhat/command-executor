/*
* DESCRIPTION OF PICK FUNCTION
* - THIS FUNCTION IS RESPONSIBLE FOR EXTRACTING THE KEYS FROM REQ OBJECT.
* - THE KEYS ARE EXTRACTED FOR VALIDATION PURPOSE BECAUSE WE WRITE A JOI OBJECT REPRESENTING THE REQ OBJECT BUT VALIDATION ONLY CONTAINS A FEW KEYS LIKE (body, query, params) THE REST OF THE OBJECT IS TO BE STRIPPED.
* - THIS FUNCTION PICKS ONLY THE KEYS NEEDED AND CREATED A OBJECT OUT OF THEM. THUS STRIPPING THE REQ OBJECT OF OTHER KEYS.
*/

const pick = function (object, keys) {
  let objToValidate = {};
  for (let key of keys) {
    if (object.hasOwnProperty(key) && Object.keys(object[key]).length != 0) {
      objToValidate[key] = object[key];
    }
  }
  return objToValidate;
}

module.exports = pick;