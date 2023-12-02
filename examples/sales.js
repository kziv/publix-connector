const publixConnector = require('@kziv/publix-connector');

// Instantiate the Sales connector.
const Sales = new publixConnector.Sales();

// We'll use a predefined store ID here but normally you'll want to retrieve
// one using the Stores connector.
const storeId = 2671411;

// Get sales for a given department.
Sales.getSales(storeId, { departments: ['alcohol']})
  .then((data) => {
    console.log(data);
  });
