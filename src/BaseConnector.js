const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Base class for all connectors.
 */
class BaseConnector {
  // Base URL of the Publix site.
  // This is their plain text accessible site which makes parsing markup
  // easier.
  baseUrl = 'https://accessibleweeklyad.publix.com/PublixAccessibility';

  // Query string parameters required of all calls to the site.
  baseParams = {
    NuepRequest: true,
  };

  /**
   * Gets scraped data from Publix's site.
   *
   * @param string endpoint
   *   The specific site endpoint to call.
   * @param object callParams
   *   Query string parameters for the specific call.
   *
   * @return object
   *   Cheerio DOM object for parsing.
   */
  async connect(endpoint, callParams) {
    // If there's a specific endpoint, concat it.
    let callUrl = this.baseUrl;
    if (endpoint) {
      callUrl += `/${endpoint}`;
    }

    // Merge the call-specific params with global params.
    const params = {
      ...this.baseParams,
      ...callParams,
    };

    // Make the call.
    let response;
    try {
      response = await axios.get(
        callUrl,
        { params },
      );
    }
    catch (err) {
      console.log(err);
      return response;
    }

    // Calls to Publix return HTML because they're scraped,
    // as they don't offer an API. Since all calls will need
    // to be parsed, we do it here instead of in the caller's
    // scope.
    if (Object.prototype.hasOwnProperty.call(response, 'data') && response.data.length) {
      const $ = cheerio.load(response.data);
      return $;
    }

    return response;
  }
}

module.exports = BaseConnector;
