angular.module('mindsmash.uxTable').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('_uxTableCounter.html',
    "<div ng-class=\"conf.counter.ngClass\" ng-show=\"conf.countTotal\"></div>"
  );


  $templateCache.put('_uxTableFacets.html',
    "<div ng-class=\"conf.facets.ngClass\"><ul ng-repeat=\"column in conf.columns\" class=\"list-group\" ng-if=\"column.show\"><li class=\"list-group-item list-group-input\" ng-class=\"{ active: !!columnFilter }\"><span class=\"badge pointer pull-right\" ng-click=\"columnFilter = ''; setFilter(column.key, '')\">&times;</span> <input type=\"text\" class=\"form-control input-sm\" placeholder=\"{{ column.name }}\" ng-model=\"columnFilter\" ng-model-options=\"{ updateOn: 'default blur', debounce: {'default': 500, 'blur': 0} }\" ng-change=\"setFilter(column.key, columnFilter)\"></li><li ng-repeat=\"term in conf.facets.options[column.key].terms.slice(0, conf.facets.maxFacetCount)\" ng-if=\"term.count >= conf.facets.minFacetSize\" class=\"list-group-item pointer\" ng-class=\"{ active: term.active }\" ng-click=\"toggleFacet(column.key, term.term)\"><span class=\"badge pull-right\">{{ term.count }}</span>{{ term.term }}</li></ul></div>"
  );


  $templateCache.put('_uxTablePagination.html',
    "<div ng-class=\"conf.pagination.ngClass\" ng-show=\"conf.pageCount > 1\"><pagination ng-change=\"confLocal.ngChange()\" ng-model=\"confLocal.ngModel\" total-items=\"conf.countTotal\" items-per-page=\"conf.pageSize\" max-size=\"conf.pagination.maxSize\" rotate=\"conf.pagination.rotate\" direction-links=\"conf.pagination.directionLinks\" previous-text=\"{{ conf.pagination.previousText }}\" next-text=\"{{ conf.pagination.nextText }}\" boundary-links=\"conf.pagination.boundaryLinks\" first-text=\"{{ conf.pagination.firstText }}\" last-text=\"{{ conf.pagination.lastText }}\"></pagination></div>"
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
    "<table ng-class=\"conf.view.ngClass\"><thead><tr><th ng-if=\"conf.view.selection\" class=\"ux-table-selection\"><input type=\"checkbox\" ux-table-selection api=\"\" data=\"data\" selection=\"conf.selection\" selection-key=\"conf.view.selectionKey\"></th><th ng-repeat=\"column in conf.columns | filter : { show: true }\">{{ column.name }}</th></tr></thead><tbody><tr ng-if=\"!data.length\"><td colspan=\"{{ 1 + (conf.columns | filter : { show: true }).length }}\" class=\"ux-table-empty\">- - -</td></tr><tr><tr ng-repeat=\"row in data\" ng-click=\"rowClick(row, $index, $event)\" ng-class=\"{ active: conf.active === $index }\"><td ng-if=\"conf.view.selection\" class=\"ux-table-selection\"><input type=\"checkbox\" checklist-model=\"conf.selection\" checklist-value=\"row[conf.view.selectionKey]\" class=\"ux-table-selection-input\"></td><td ng-repeat=\"column in conf.columns | filter : { show: true }\" ux-table-cell>{{ row[column.key] }}</td></tr></tbody></table>"
  );

}]);
