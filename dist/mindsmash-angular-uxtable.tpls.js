angular.module('mindsmash.uxTable').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('_uxTable.html',
    "<table class=\"ux-table\" ng-class=\"cfg.tableClass\">\n" +
    "\t<thead>\n" +
    "\t\t<tr>\n" +
    "\t\t\t<th\n" +
    "\t\t\t\tng-repeat=\"column in columns | filter : { show: true }\"\n" +
    "\t\t\t\tng-click=\"sortColumn(column.key)\"\n" +
    "\t\t\t\tng-class=\"{ 'sort': column.sort !== false, 'sort-asc': state.orderBy.key === column.key && state.orderBy.asc === true, 'sort-desc': state.orderBy.key=== column.key && state.orderBy.asc === false }\">\n" +
    "\t\t\t\t\t<span ng-if=\"column.i18n\">{{ column.i18n | translate }}</span>\n" +
    "\t\t\t\t\t<span ng-if=\"!column.i18n\">{{ column.name }}</span>\n" +
    "\t\t\t</th>\n" +
    "\t\t</tr>\n" +
    "\t</thead>\n" +
    "\t<tbody>\n" +
    "\t\t<tr ng-repeat=\"row in content\">\n" +
    "\t\t\t<td ng-repeat=\"column in columns | filter : { show: true }\" ux-table-cell>{{ row[column.key] }}</td>\n" +
    "\t\t</tr>\n" +
    "\t</tbody>\n" +
    "</table>"
  );


  $templateCache.put('_uxTableCounter.html',
    "<div class=\"ux-table-counter\" ng-show=\"isInit\">\n" +
    "\t{{ cfg.i18n | translate : state }}\n" +
    "</div>"
  );


  $templateCache.put('_uxTablePagination.html',
    "<div class=\"ux-table-pagination\" ng-show=\"cfg.isInit\">\n" +
    "\t<pagination\n" +
    "\t\tng-change=\"cfg.ngChange()\"\n" +
    "\t\tng-model=\"cfg.ngModel\"\n" +
    "\t\ttotal-items=\"cfg.totalItems\"\n" +
    "\t\titems-per-page=\"cfg.itemsPerPage\"\n" +
    "\t\tmax-size=\"cfg.maxSize\"\n" +
    "\t\trotate=\"cfg.rotate\"\n" +
    "\t\tdirection-links=\"cfg.directionLinks\"\n" +
    "\t\tprevious-text=\"{{ cfg.previousText }}\"\n" +
    "\t\tnext-text=\"{{ cfg.nextText }}\"\n" +
    "\t\tboundary-links=\"cfg.boundaryLinks\"\n" +
    "\t\tfirst-text=\"{{ cfg.firstText }}\"\n" +
    "\t\tlast-text=\"{{ cfg.lastText }}\">\n" +
    "\t</pagination>\n" +
    "</div>"
  );


  $templateCache.put('_uxTablePaginationSize.html',
    "<div class=\"ux-table-pagination-size\" ng-show=\"cfg.isInit\">\n" +
    "\t<ng-dropdown-multiselect\n" +
    "\t\tselected-model=\"ngModel\"\n" +
    "\t\toptions=\"cfg.options\"\n" +
    "\t\textra-settings=\"cfg\"\n" +
    "\t\tevents=\"cfg.events\">\n" +
    "\t</ng-dropdown-multiselect>\n" +
    "</div>"
  );


  $templateCache.put('_uxTableToggle.html',
    "<div class=\"ux-table-toggle\" ng-show=\"cfg.isInit\">\n" +
    "\t<ng-dropdown-multiselect\n" +
    "\t\tselected-model=\"ngModel\"\n" +
    "\t\toptions=\"cfg.options\"\n" +
    "\t\textra-settings=\"cfg\"\n" +
    "\t\tcheckboxes=\"true\"\n" +
    "\t\tevents=\"cfg.events\"\n" +
    "\t\tng-class=\"cfg.css\">\n" +
    "\t</ng-dropdown-multiselect>\n" +
    "</div>"
  );

}]);
