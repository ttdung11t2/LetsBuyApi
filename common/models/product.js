'use strict';
import _ from 'lodash'

module.exports = (Product) => {
  // Define remote method
  Product.transferData = async (data, cb) => {
    try {
      const returnData = await returnDataPromise(data)
      cb(null, returnData)
    } catch (error) {
      cb(error)
    }
    
    // Fake promise
    function returnDataPromise(data) {
      return new Promise((resolve, reject) => {
        if (_.has(data, "name")) {
          resolve({
            success: true,
            data: data
          })
        } else {
          reject("Invalid parameter.")
        }
      })
    }
  }
  
  // Expose remote method
  Product.remoteMethod('transferData', {
    accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
    returns: {root: true},
    http: {path: '/transfer-data', verb: 'post'}
  });
};
