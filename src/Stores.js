const BaseConnector = require('./BaseConnector');
const Geocodio = require('geocodio-library-node');

class Stores extends BaseConnector {

  /**
   * Class constructor.
   *
   * @param {Object} config Optional configuration.
   * @param {string} [config.addressParserApiKey] - API key for the given address parser
   * @param {boolean} [config.shouldParseAddresses=false] - Whether or not to parse raw addresses into components.
   *   Not including addressParserApiKey will set this to false regardless of passed in value.
   */
  constructor(config = {}) {
    // Always call the super constructor.
    super();

    // Let passed in config override defaults.
    // We want to define every config option so
    // we don't have to check if it exists, only value.
    this.defaults = Object.assign({
      addressParserApiKey: null,
      shouldParseAddresses: false
    }, config);
  }

  /**
   * Gets a list of stores from Publix based on location info.
   *
   * @param int zip
   *   ZIP code to search for stores near.
   *
   * @return array
   *   List of stores near the given ZIP code.
   */
  async getStores(zip) {
    const stores = new Map();

    // We get a DOM object back that we can parse for the HTML
    // we want. In this case, it's store data.
    const $ = await this.connect(null, {CityStateZip: zip});
    if (!$) {
      return stores;
    }

    // Parse the HTML for store data. Syntax is based on jQuery.
    const storeList = $('#neupStoreLocation div.storeLocation_storeListTile');
    if (!storeList.length) {
      return stores;
    }

    // Add to stores list keyed by store_num for easier lookup in the address parsing.
    storeList.each((i, el) => {
      const link = $(el).find('a.action-tracking-directions').first();
      if (link) {
        // e.g. 7326 McCutcheon Rd Chattanooga, TN 37421
        //const storeNum = parseInt(link.attr('href').split('/').pop(), 10); // Removes leading zeros
        const storeNum = link.attr('href').split('/').pop().replace(/^0+/, '');
        stores.set(storeNum, {
          publixId: link.attr('data-tracking-storeid'),
          storeNum: storeNum,
          name: $(el).find('.addressHeadline').text(),
          addressRaw: $(el).find('.addressStoreTitle').text(), // This is the WHOLE address including city, state, zip
        });
      }
    });

    // Parse the raw addresses from the API for all the new stores.
    if (this.defaults.shouldParseAddresses && stores.size) {
      // Extract the raw addresses from the list of stores.
      let rawAddressObject = {};
      stores.forEach((store, storeId) => {
        rawAddressObject[storeId] = store.addressRaw;
      });

      // Get the the parsed addresses as a batch.
      // @todo normalize the data fields so services can be swapped out.
      const parsedStoreAddresses = await this.parseAddresses(rawAddressObject);
      if (parsedStoreAddresses) {
        for (const [storeId, parsedAddress] of Object.entries(parsedStoreAddresses)) {
          if (parsedAddress) {
            // Returns object ref, no need to set it back in.
            const store = stores.get(storeId);
            store.address = parsedAddress;
          }
        }
      }

    }

    return stores;
  }

  /**
   * Parses a batch of addresses into their components.
   * Uses the geocod.io API.
   *
   * @param {Object>} addresses
   *   The unparsed addresses, keyed by storeId.
   *
   * @return {Object>}
   *   Parsed address data, keyed by StoreId.
   */
  async parseAddresses(addresses) {
    // We use the geocod.io API which allows bundling of
    // addresses into a batch to minimize requests.
    // @todo allow service swapping via a standard interface.
    const geocoder = new Geocodio(this.defaults.addressParserApiKey);
    const response = await geocoder.geocode(addresses);

    const final = {};

    if (response.results) {
      for (const [storeId, parsedAddress] of Object.entries(response.results)) {
        final[storeId] = parsedAddress.response.results[0] ?? null;
      }
    }

    return final;
  }

}

module.exports = Stores;
