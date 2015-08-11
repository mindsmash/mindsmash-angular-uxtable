angular.module('mindsmash.uxTable').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('_uxTable.html',
    "<table class=\"ux-table\" ng-class=\"cfg.tableClass\"><thead><tr><th class=\"ux-table-selection\"><input type=\"checkbox\" ux-table-selection content=\"content\" selection=\"state.selection\" selection-key=\"cfg.selectionKey\"></th><th ng-repeat=\"column in columns | filter : { show: true }\" ng-click=\"sortBy(column.key)\" ng-class=\"{ 'sort': column.sort !== false, 'sort-asc': state.orderBy.key === column.key && state.orderBy.asc === true, 'sort-desc': state.orderBy.key=== column.key && state.orderBy.asc === false }\"><span ng-if=\"column.i18n\">{{ column.i18n | translate }}</span> <span ng-if=\"!column.i18n\">{{ column.name }}</span></th></tr></thead><tbody><tr><td colspan=\"{{ 1 + (columns | filter : { show: true }).length }}\" class=\"ux-table-empty\" ng-if=\"!content.length\">---</td></tr><tr><tr ng-repeat=\"row in content\" ng-init=\"$rowIndex = state.page * state.pageSize + $index + 1; $rowClass = cfg.rowClick(row, idx);\" ng-click=\"cfg.rowClick(row, $rowIndex, $event)\" ng-class=\"$rowClass\"><td class=\"ux-table-selection\"><input type=\"checkbox\" checklist-model=\"state.selection\" checklist-value=\"row[cfg.selectionKey]\"></td><td ng-repeat=\"column in columns | filter : { show: true }\" ux-table-cell data-label=\"{{ column.i18n ? (column.i18n | translate) : column.name }}\" data-empty=\"{{ !row[column.key] }}\">{{ row[column.key] }}</td></tr></tbody></table>"
  );


  $templateCache.put('_uxTableCounter.html',
    "<div class=\"ux-table-counter\" ng-show=\"isInit && pagination.countTotal\">{{ cfg.i18n | translate : pagination }}</div>"
  );


  $templateCache.put('_uxTableFacets.html',
    "<div class=\"ux-table-facets\"><ul class=\"list-group\" ng-repeat=\"column in cfg.columns\" ng-if=\"column.show\"><li class=\"list-group-item list-group-input\" ng-class=\"{ active: !!columnFilter }\"><span class=\"badge pointer pull-right\" ng-click=\"columnFilter = ''; setFilter(column.key, '')\">&times;</span> <input type=\"text\" class=\"form-control input-sm\" placeholder=\"{{ column.name }}\" ng-model=\"columnFilter\" ng-model-options=\"{ updateOn: 'default blur', debounce: {'default': 500, 'blur': 0} }\" ng-change=\"setFilter(column.key, columnFilter)\"></li><li ng-repeat=\"term in cfg.facets[column.key].terms.slice(0, 10)\" ng-if=\"term.count > 1\" class=\"list-group-item pointer\" ng-class=\"{ active: term.active }\" ng-click=\"toggleFacet(column.key, term.term)\"><span class=\"badge pull-right\">{{ term.count }}</span> {{ term.term }}</li></ul></div>"
  );


  $templateCache.put('_uxTablePagination.html',
    "<div class=\"ux-table-pagination\" ng-show=\"cfg.isInit && cfg.totalItems\"><pagination ng-change=\"cfg.ngChange()\" ng-model=\"cfg.ngModel\" total-items=\"cfg.totalItems\" items-per-page=\"cfg.itemsPerPage\" max-size=\"cfg.maxSize\" rotate=\"cfg.rotate\" direction-links=\"cfg.directionLinks\" previous-text=\"{{ cfg.previousText }}\" next-text=\"{{ cfg.nextText }}\" boundary-links=\"cfg.boundaryLinks\" first-text=\"{{ cfg.firstText }}\" last-text=\"{{ cfg.lastText }}\"></pagination></div>"
  );


  $templateCache.put('_uxTablePaginationSize.html',
    "<div class=\"ux-table-pagination-size\" ng-show=\"cfg.isInit\"><ng-dropdown-multiselect selected-model=\"ngModel\" options=\"cfg.options\" extra-settings=\"cfg\" events=\"cfg.events\"></ng-dropdown-multiselect></div>"
  );


  $templateCache.put('_uxTableSelectionCounter.html',
    "<div class=\"ux-table-selection-counter\"><span ng-show=\"selection.selectionSize\">{{ (cfg.i18n + '.count') | translate : selection }} (<a href=\"#\" ng-click=\"resetSelection()\">{{ (cfg.i18n + '.clear') | translate : selection }}</a>)</span></div>"
  );


  $templateCache.put('_uxTableToggle.html',
    "<div class=\"ux-table-toggle\" ng-show=\"cfg.isInit\"><ng-dropdown-multiselect selected-model=\"ngModel\" options=\"cfg.options\" extra-settings=\"cfg\" checkboxes=\"true\" events=\"cfg.events\" ng-class=\"cfg.css\"></ng-dropdown-multiselect></div>"
  );

}]);
