// eslint-disable-next-line import/no-extraneous-dependencies
const publixConnector = require('@kziv/publix-connector');

// Instantiate the Stores connector.
const Stores = new publixConnector.Stores({
  shouldParseAddresses: true,
  // This is only needed if shouldParseAddresses is `true`.
  addressParserApiKey: 'YOUR-GEOCOD.IO-API-KEY',
});

// Get stores for a given location, promise style.
// You can also use async/await syntax.
Stores.getStores('Orlando, FL')
  .then((data) => {
    console.log(data);
  });
