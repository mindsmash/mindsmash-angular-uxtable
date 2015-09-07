angular.module('mindsmash.uxTable').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('_uxTableCounter.html',
    "<div ng-class=\"conf.counter.ngClass\" ng-show=\"conf.countTotal\"></div>"
  );


  $templateCache.put('_uxTableFacets.html',
    "<div ng-class=\"conf.facets.ngClass\"><ul ng-repeat=\"column in conf.columns\" class=\"list-group\" ng-if=\"column.filter || column.facets\" ng-show=\"column.show\"><li class=\"list-group-item list-group-input\" ng-class=\"{ active: !!columnFilter }\" ng-if=\"column.filter\"><span class=\"badge pointer pull-right\" ng-click=\"columnFilter = ''; setFilter(column.key, '')\">&times;</span> <input type=\"text\" class=\"form-control input-sm\" placeholder=\"{{ column.name }}\" ng-init=\"columnFilter = getFilter(column.key)\" ng-model=\"columnFilter\" ng-model-options=\"{ updateOn: 'default blur', debounce: {'default': 500, 'blur': 0} }\" ng-change=\"setFilter(column.key, columnFilter)\"></li><li ng-repeat=\"term in conf.facets.options[column.key].terms.slice(0, conf.facets.maxFacetCount)\" ng-if=\"column.facets && term.count >= conf.facets.minFacetSize\" class=\"list-group-item pointer\" ng-class=\"{ active: term.active }\" ng-click=\"toggleFacet(column.key, term.term)\"><span class=\"badge pull-right\">{{ term.count }}</span>{{ term.term }}</li></ul></div>"
  );


  $templateCache.put('_uxTablePagination.html',
    "<div ng-class=\"conf.pagination.ngClass\" ng-show=\"conf.pageCount > 1\"><ul class=\"pagination\"><li ng-class=\"{disabled: (!hasPrevious() || !conf.pagination.boundaryLinks)}\" class=\"pagination-first\"><a href ng-click=\"selectPage(1, $event)\">{{conf.pagination.firstText}}</a></li><li ng-class=\"{disabled: (!hasPrevious() || !conf.pagination.directionLinks)}\" class=\"pagination-prev\"><a href ng-click=\"selectPage(current.page - 1, $event)\">{{conf.pagination.previousText}}</a></li><li ng-class=\"{active: page.number == current.page}\" ng-repeat=\"page in pages\" class=\"pagination-page\"><a href ng-click=\"selectPage(page.number, $event)\">{{page.number}}</a></li><li ng-class=\"{disabled: (!hasNext() || !conf.pagination.directionLinks)}\" class=\"pagination-next\"><a href ng-click=\"selectPage(current.page + 1, $event)\">{{conf.pagination.nextText}}</a></li><li ng-class=\"{disabled: (!hasNext() || !conf.pagination.boundaryLinks)}\" class=\"pagination-last\"><a href ng-click=\"selectPage(conf.pageCount, $event)\">{{conf.pagination.lastText}}</a></li></ul></div>"
  );


  $templateCache.put('_uxTablePaginationSize.html',
    "<div ng-class=\"conf.paginationSize.ngClass\"><ng-dropdown-multiselect selected-model=\"confLocal.ngModel\" options=\"confLocal.options\" extra-settings=\"confLocal.extraSettings\" events=\"confLocal.events\"></ng-dropdown-multiselect></div>"
  );


  $templateCache.put('_uxTableSelectionCounter.html',
    "<div ng-class=\"conf.selectionCounter.ngClass\" ng-show=\"conf.countTotal\"></div>"
  );


  $templateCache.put('_uxTableToggle.html',
    "<div ng-class=\"conf.toggle.ngClass\"><ng-dropdown-multiselect selected-model=\"confLocal.ngModel\" options=\"confLocal.options\" extra-settings=\"confLocal.extraSettings\" events=\"confLocal.events\" checkboxes=\"true\"></ng-dropdown-multiselect></div>"
  );


  $templateCache.put('_uxTableView.html',
    "<table ng-class=\"conf.view.ngClass\"><thead><tr><th ng-if=\"conf.view.selection\" class=\"ux-table-selection\"><input type=\"checkbox\" ux-table-selection data=\"data\" selection=\"conf.selection\" selection-key=\"conf.view.selectionKey\"></th><th ng-repeat=\"column in conf.columns | filter : { show: true }\" ng-click=\"sortBy(column.key)\" ng-class=\"{ 'sort': column.sort !== false, 'sort-asc': conf.orderBy.key === column.key && conf.orderBy.asc === true, 'sort-desc': conf.orderBy.key === column.key && conf.orderBy.asc === false }\">{{ column.name }}</th></tr></thead><tbody><tr ng-if=\"!data.length\"><td colspan=\"{{ 1 + (conf.columns | filter : { show: true }).length }}\" class=\"ux-table-empty\">- - -</td></tr><tr><tr ng-repeat=\"row in data\" ng-click=\"rowClick(row, $index, $event)\" ng-class=\"{ active: conf.active === $index }\"><td ng-if=\"conf.view.selection\" class=\"ux-table-selection\"><input type=\"checkbox\" checklist-model=\"conf.selection\" checklist-value=\"row[conf.view.selectionKey]\" class=\"ux-table-selection-input\"></td><td ng-repeat=\"column in conf.columns | filter : { show: true }\" ux-table-cell>{{ row[column.key] }}</td></tr></tbody></table>"
  );

}]);
