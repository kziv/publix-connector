const publixConnector = require('publix-connector');

// Instantiate the Stores connector.
const Stores = new publixConnector.Stores({
  shouldParseAddresses: true,
  addressParserApiKey: 'YOUR-GEOCOD.IO-API-KEY'
});

// Get stores for a given location.
Stores.getStores('some sort of address')
  .then(data => {
    console.log(data);
  });
