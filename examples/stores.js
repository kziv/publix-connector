const publixConnector = require('@kziv/publix-connector');

// Instantiate the Stores connector.
const Stores = new publixConnector.Stores({
  shouldParseAddresses: true,
  addressParserApiKey: 'YOUR-GEOCOD.IO-API-KEY',
});

// Get stores for a given location, promise style.
// You can also use async/await syntax.
Stores.getStores('some sort of address')
  .then((data) => {
    console.log(data);
  });
