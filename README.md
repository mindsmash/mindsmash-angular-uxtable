# mindsmash-angular-uxtable
Yet another data table for AngularJS.

### Features

coming soon...

### 1. Installation:

#### 1.1 via bower:

`
$ bower install mindsmash-angular-uxtable --save
`

*please use either the minified or unminified file in the `dist` directory*

coming soon...

### 2. Configuration

coming soon...

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

more coming soon...

## Contributors

   * Fynn Feldpausch, mindsmash GmbH
