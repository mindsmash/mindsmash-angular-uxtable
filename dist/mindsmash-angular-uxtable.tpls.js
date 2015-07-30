angular.module('mindsmash.uxTable').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('_uxTable.html',
    "<table class=\"ux-table\" ng-class=\"cfg.tableClass\"><thead><tr><th ng-repeat=\"column in columns | filter : { show: true }\" ng-click=\"setSorting(column.key)\" ng-class=\"{ 'sort': column.sort !== false, 'sort-asc': state.orderBy.key === column.key && state.orderBy.asc === true, 'sort-desc': state.orderBy.key=== column.key && state.orderBy.asc === false }\"><span ng-if=\"column.i18n\">{{ column.i18n | translate }}</span> <span ng-if=\"!column.i18n\">{{ column.name }}</span></th></tr></thead><tbody><tr ng-repeat=\"row in content\" ng-init=\"$rowIndex = state.page * state.pageSize + $index + 1; $rowClass = cfg.rowClick(row, idx);\" ng-click=\"cfg.rowClick(row, $rowIndex, $event)\" ng-class=\"$rowClass\"><td ng-repeat=\"column in columns | filter : { show: true }\" ux-table-cell data-label=\"{{ column.i18n ? (column.i18n | translate) : column.name }}\" data-empty=\"{{ !row[column.key] }}\">{{ row[column.key] }}</td></tr></tbody></table>"
  );


  $templateCache.put('_uxTableCounter.html',
    "<div class=\"ux-table-counter\" ng-show=\"isInit\">{{ cfg.i18n | translate : state }}</div>"
  );


  $templateCache.put('_uxTablePagination.html',
    "<div class=\"ux-table-pagination\" ng-show=\"cfg.isInit\"><pagination ng-change=\"cfg.ngChange()\" ng-model=\"cfg.ngModel\" total-items=\"cfg.totalItems\" items-per-page=\"cfg.itemsPerPage\" max-size=\"cfg.maxSize\" rotate=\"cfg.rotate\" direction-links=\"cfg.directionLinks\" previous-text=\"{{ cfg.previousText }}\" next-text=\"{{ cfg.nextText }}\" boundary-links=\"cfg.boundaryLinks\" first-text=\"{{ cfg.firstText }}\" last-text=\"{{ cfg.lastText }}\"></pagination></div>"
  );


  $templateCache.put('_uxTablePaginationSize.html',
    "<div class=\"ux-table-pagination-size\" ng-show=\"cfg.isInit\"><ng-dropdown-multiselect selected-model=\"ngModel\" options=\"cfg.options\" extra-settings=\"cfg\" events=\"cfg.events\"></ng-dropdown-multiselect></div>"
  );


  $templateCache.put('_uxTableToggle.html',
    "<div class=\"ux-table-toggle\" ng-show=\"cfg.isInit\"><ng-dropdown-multiselect selected-model=\"ngModel\" options=\"cfg.options\" extra-settings=\"cfg\" checkboxes=\"true\" events=\"cfg.events\" ng-class=\"cfg.css\"></ng-dropdown-multiselect></div>"
  );

}]);
