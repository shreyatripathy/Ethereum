
'use strict';

module.exports = function(app) {
  var ethereum = require('../controllers/EthereumController');

  app.route('/eth/wallet')
    .get(ethereum.get_wallet);
  
    app.route('/eth/balance')
    .get(ethereum.get_balance);

    app.route('/eth/payment')
    .post(ethereum.get_payment);

    app.route('/eth/deposits')
    .get(ethereum.get_deposits);

    app.route('/eth/transfer')
    .post(ethereum.get_transfer);

    app.route('/eth/getDetails')
    .get(ethereum.get_details)
  
};
