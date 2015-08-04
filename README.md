# mindsmash-angular-uxtable
Yet another data table for AngularJS. **This library is work in progress.**

### Features

* Sorting
* Pagination
* Selection
* ...

### Table of Contents

   - [Installation](#1-installation)
   - [Configuration](#2-configuration)
   - [API](#3-api)
      - [Column Definition](#31-column-definition)
      - [Column Visibility](#32-column-visibility)
      - [Sorting](#33-sorting)
      - [Pagnation](#34-pagination)
      - [Selection](#35-selection)

### 1. Installation:

   1. Download the [latest release](https://github.com/mindsmash/mindsmash-angular-uxtable/releases) or the [current master](https://github.com/mindsmash/mindsmash-angular-uxtable/archive/master.zip) from GitHub. You can also use [Bower](http://bower.io) to install the latest version:
   ```
   $ bower install mindsmash-angular-uxtable --save
   ```
   
   2. Include the library in your website (please use either the minified or unminified file in the `dist` directory):
   ```
   <script src="mindsmash-angular-uxtable/mindsmash-angular-uxtable.min.js"></script>
   ```
   
   3. Add uxTable as a dependency to your app:
   ```
   angular.module('your-app', ['mindsmash.uxTable']);
   ```

**[Back to top](#table-of-contents)**

### 2. Configuration

```
{
    tableClass: 'table',
    requestConverter: function(state) {
        // The result of the evaluation must be a plain object containing the
        // current request parameters. These are _page, _pageSize and _orderBy.
    },
    responseConverter: function(data) {
        // The result of the evaluation must be an object containing the new
        // table content (JSON array) and the new table state (incl. count,
        // countTotal, page, pageSize).
    },
    rowClass: function(rowData, rowIndex) {
        // The result of the evaluation can be a string representing space
        // delimited class names, an array, or a map of class names to boolean
        // values. In the case of a map, the names of the properties whose
        // values are truthy will be added as css classes to the element.
    },
    rowClick: function(rowData, rowIndex, $event) {
        // Handle the row click event.
    }
}
```

**[Back to top](#table-of-contents)**

### 3. API

#### 3.1 Column Definition

**[Back to top](#table-of-contents)**

#### 3.2 Column Visibility

**[Back to top](#table-of-contents)**

#### 3.3 Sorting

* `getSorting()` - Returns the current table sorting.
* `setSorting(key, asc)` - Sets the table sorting. Sorting will be ignored for unknown or unsortable table columns.
  * `{String} key`: The column key.
  * `{Boolean} [asc]`: The sorting direction. The referenced column will be toggled if *asc* is missing. The toggle sequence will be: a) ascending, b) decending, c) no sorting.

**[Back to top](#table-of-contents)**

#### 3.4 Pagination

* `getPage()` - Returns the current page.
* `getPageSize()` - Returns the current page size.
* `setPage(page)` - Sets the page to *page*. This is a shorthand for `setPagination(page, null)`.
  * `{Number} page`: The new page.
* `setPageSize(pageSize)` - Sets the page size to *pageSize*. This is a shorthand for `setPagination(null, pageSize)`.
  * `{Number} pageSize`: The new page size.
* `getPagination()` - Returns the current page and page size.
* `setPagination(page, pageSize)` - Sets the *page* and / or *pageSize*.
  * `{Number} [page]`: The new page.
  * `{Number} [pageSize]`: The new page size.

**[Back to top](#table-of-contents)**

#### 3.5 Selection

* `select()` - Select one or more table rows.
  * `{String|Array|Object} items`: The items to be selected in the table. This can either be a single table row (or table row key) or a list of table rows (or table row keys). If no argument is present, all items *of the current page* will be selected.
* `deselect()` - Deselect one or more table rows.
  * `{String|Array|Object} items`: The items to be deselected in the table. This can either be a single table row (or table row key) or a list of table rows (or table row keys). If no argument is present, all items *of the current page* will be deselected.
* `getSelection()` - Returns the current table selection keys.
* `setSelection()` - Resets the current table selection.
  * `{Array|Object} items`: The new table selection. This can either be a list of table rows (or table row keys).

**[Back to top](#table-of-contents)**

## Contributors

   * Fynn Feldpausch, mindsmash GmbH
