# mindsmash-angular-uxtable
Yet another data table for AngularJS. The current implementation features data sorting, pagination, filters and more. The library is designed to easily integrate with a Spring Boot application backend, but can also be used with any other framework. 

**Please note:** This library is work in progress.

### Table of Contents

   - [Installation](#1-installation)
   - [Configuration & Initialization](#2-configuration--initialization)
   - [Directives](#3-directives)
   - [API](#4-api)
      - [Column Definition](#41-column-definition)
      - [Column Visibility](#42-column-visibility)
      - [Sorting](#43-sorting)
      - [Pagnation](#44-pagination)
      - [Selection & Active Column](#45-selection--active-column)
      - [Filters & Facets](#46-filters--facets)

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

### 2. Configuration & Initialization

TODO...

**[Back to top](#table-of-contents)**

### 3. Directives

**[Back to top](#table-of-contents)**

### 4. API

#### 4.1 Column Definition

Upcoming...

**[Back to top](#table-of-contents)**

#### 4.2 Column Visibility

* `getVisibility(key)` - Returns the column's visibility status.
  * `{String} key`: The column key.
* `toggleVisibility(key)` - Toggles the column's visibility status. This is short for `setVisibility(key, null)`.
  * `{String} key`: The column key.
* `setVisibility(key, isVisible)` - Sets the column's visibility status to *isVisible*.
  * `{String} key`: The column key.
  * `{Boolean} [isVisible]`: The column's visibility status.

**[Back to top](#table-of-contents)**

#### 4.3 Sorting

* `getSorting()` - Returns the current table sorting.
* `setSorting(key, asc)` - Sets the table sorting. Sorting will be ignored for unknown or unsortable table columns.
  * `{String} key`: The column key.
  * `{Boolean} [asc]`: The sorting direction. The referenced column will be toggled if *asc* is missing. The toggle sequence will be: a) ascending, b) decending, c) no sorting.

**[Back to top](#table-of-contents)**

#### 4.4 Pagination

* `getPage()` - Returns the current page.
* `getPageSize()` - Returns the current page size.
* `setPage(page)` - Sets the page to *page*. This is short for `setPagination(page, null)`.
  * `{Number} page`: The new page.
* `firstPage()` - Sets the page to the first page.
* `prevPage()` - Sets the page to the previous page (if available).
* `nextPage()` - Sets the page to the next page (if available).
* `lastPage()` - Sets the page to the last page.
* `setPageSize(pageSize)` - Sets the page size to *pageSize*. This is short for `setPagination(null, pageSize)`.
  * `{Number} pageSize`: The new page size.
* `getPagination()` - Returns the current page and page size.
* `setPagination(page, pageSize)` - Sets the *page* and / or *pageSize*.
  * `{Number} [page]`: The new page.
  * `{Number} [pageSize]`: The new page size.

**[Back to top](#table-of-contents)**

#### 4.5 Selection & Active Column

* `select()` - Select one or more table rows.
  * `{String|Array|Object} items`: The items to be selected in the table. This can either be a single table row (or table row key) or a list of table rows (or table row keys). If no argument is present, all items *of the current page* will be selected.
* `deselect()` - Deselect one or more table rows.
  * `{String|Array|Object} items`: The items to be deselected in the table. This can either be a single table row (or table row key) or a list of table rows (or table row keys). If no argument is present, all items *of the current page* will be deselected.
* `getSelection()` - Returns the current table selection keys.
* `setSelection()` - Resets the current table selection.
  * `{Array|Object} items`: The new table selection. This can either be a list of table rows (or table row keys).

**[Back to top](#table-of-contents)**

#### 4.6 Filters & Facets

* `getFilter(key)` - Returns the current filter for this column.
  * `{String} key`: The column key.
* `setFilter(key, filter)` - Sets the filter term for this column.
  * `{String} key`: The column key.
  * `{String} filter`: The filter term.
* `clearFilter(key)` - Removes the current filter (if any) for this column.
  * `{String} key`: The column key.
* `clearFilters()` - Removes any filters (if any).

**[Back to top](#table-of-contents)**

## Contributors

   * Fynn Feldpausch @ [mindsmash GmbH](https://www.mindsmash.com/)
   * Piers Wermbter @ [mindsmash GmbH](https://www.mindsmash.com/)
