const BaseConnector = require('./BaseConnector');

/**
 * Sales connector.
 */
class Sales extends BaseConnector {
  /**                                                                            │
   * Mapping of department names to category IDs                                 │
   *                                                                             │
   * @see https://accessibleweeklyad.publix.com/PublixAccessibility/Entry/LandingContent?storeid=2671411
   */
  #departments = {
    bogo: 5232540,
    baby: 5232519,
    bakery: 5232520,
    beauty: 5232530,
    alcohol: 5232521,
    dairy: 5232525,
    deli: 5232526,
    floral: 5232527,
    frozen: 5232528,
    grocery: 5232529,
    health: 5232789,
    housewares: 5232531,
    meat: 5232533,
    nonfood: 5232805,
    pet: 5232535,
    produce: 5232537,
    seafood: 5232538,
    gathershare: 5232561,
  };

  /**
   * Gets a list of products on sale for a given store.
   *
   * @param string storeId
   *   ID for the store to get sales for.
   * @param object filters
   *   Optional filters for sales.
   * @param array filters.departments
   * @param filters.brand
   *
   * @return array
   *   List of current Sales.
   */
  async getSales(storeId, filters = {}) {
    const sales = [];

    // If no departments are requested, that means search all of them.
    const departments = filters.departments ?? Object.keys(this.#departments);
    departments.forEach((currentDept) => {
      // This creates a stack of promises that we'll resolve all at once.
      sales.push(this.getSalesByDepartment(storeId, currentDept));
    });

    // Resolve and flatten the array of promises.
    const final = await Promise.all(sales);
    return final.flatMap((item) => item);
  }

  async getSalesByDepartment(storeId, dept) {
    const categoryId = this.#departments[dept];
    const sales = [];

    // We get a DOM object back that we can parse for the HTML
    // we want. In this case, it's store data.
    const $ = await this.connect('/BrowseByListing/ByCategory/', {
      StoreID: storeId,
      CategoryID: categoryId,
    });
    if (!$) {
      return sales;
    }

    const saleList = $('#BrowseContent div.theTile');
    if (!saleList.length) {
      return sales;
    }

    saleList.each((i, el) => {
      const itemButton = $(el).find('.shoppingListButton');
      const salePrice = Number(itemButton.attr('data_finalprice')).toFixed(2);
      const productId = parseInt(itemButton.attr('data_listingid'), 10);

      // Coupon listings don't have a product ID and therefore can be skipped.
      if (!productId) {
        return;
      }

      sales.push({
        storeId: parseInt(itemButton.attr('data_storeid'), 10),
        startDate: new Date(itemButton.attr('data_startdate')),
        endDate: new Date(itemButton.attr('data_expdate')),
        salePrice,
        description: itemButton.attr('data_description'),
        isBogo: parseInt(salePrice, 10) === 0,
        product: {
          productId,
          name: itemButton.attr('data_title'),
          image: itemButton.attr('data-image'),
          dept,
        },
      });
    });

    return sales;
  }
}

module.exports = Sales;
