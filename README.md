# mindsmash-angular-uxtable
Yet another data table for AngularJS.

### Features

* Sorting (no *multisort*)
* Pagination
* ...

### 1. Installation:

#### 1.1 via bower:

```
$ bower install mindsmash-angular-uxtable --save
```

*please use either the minified or unminified file in the `dist` directory*

coming soon...

### 2. Configuration

```
{
    tableClass: 'table table-striped',
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

### 3. API

#### 3.1 Sorting

* `getSorting()` - Returns the current table sorting. The result object will be of the form `{ key: 'name', asc: true }`.
* `setSorting(key, asc)` - Sets the table sorting. Sorting will be ignored for unknown or unsortable table columns.
  * `{String} key`: The column key.
  * `{Boolean} [asc]`: The sorting direction. The referenced column will be toggled if *asc* is missing. The toggle sequence will be: a) ascending, b) decending, c) no sorting.

#### 3.2 Pagination

* `getPage()` - Returns the current page.
* `getPageSize()` - Returns the current page size.
* `setPage(page)` - Sets the page to *page*. This is a shorthand for `setPagination(page, null)`.
  * `{Number} page`: The new page.
* `setPageSize(pageSize)` - Sets the page size to *pageSize*. This is a shorthand for `setPagination(null, pageSize)`.
  * `{Number} pageSize`: The new page size.
* `setPagination(page, pageSize)` - Sets the *page* and / or *pageSize*.
  * `{Number} [page]`: The new page.
  * `{Number} [pageSize]`: The new page size.

#### 3.3 Selection

* `select()` - Select one or more table rows.
  * `{String|Array|Object} items`: The items to be selected in the table. This can either be a single table row (or table row key) or a list of table rows (or table row keys). If no argument is present, all items *of the current page* will be selected.
* `deselect()` - Deselect one or more table rows.
  * `{String|Array|Object} items`: The items to be deselected in the table. This can either be a single table row (or table row key) or a list of table rows (or table row keys). If no argument is present, all items *of the current page* will be deselected.
* `setSelection()` - Resets the current table selection.
  * `{Array|Object} items`: The new table selection. This can either be a list of table rows (or table row keys).







more coming soon...

## Contributors

   * Fynn Feldpausch, mindsmash GmbH
