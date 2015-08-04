(function(angular) {
    'use strict';
    
    angular.module('mindsmash.uxTable', ['checklist-model', 'angularjs-dropdown-multiselect', 'ui.bootstrap.pagination'])
    
    /**
     * Provides the outer scope for the uxTable.
     */
    .directive('uxTableScope', function() {
        return {
            priority: 100,
            restrict: 'A',
            controller: ['$scope', function($scope) {
                this.$isInit = false;
                this.$tableCtrl = undefined;
                this.$tableElem = undefined;
                
                // ===== Initialization
                this.init = function(ctrl, elem) {
                    if (!!ctrl && !!elem) {
                        this.$isInit = true;
                        this.$tableCtrl = ctrl;
                        this.$tableElem = elem;
                    }
                };
                
                // ===== Messaging
                this.broadcast = function(name, args) {
                    $scope.$broadcast(name, args);
                };
            }]
        };
    })
    
    /**
     * The uxTable default configuration.
     */
    .constant('uxTableConf', {
        tableClass: 'table',
        rowClass: angular.noop,
        rowClick: angular.noop,
        selectionKey: 'id',
        requestConverter: function(state) {
            var orderBy = state.orderBy;
            return _.pick({
                _page: state.page,
                _pageSize: state.pageSize,
                _orderBy: (orderBy && orderBy.key) ? orderBy.key + (orderBy.asc ? ',asc' : ',desc') : null
            }, function(value) {
                return angular.isDefined(value) && value !== null;
            });
        },
        responseConverter: function(data) {
            var result = {
                state: {
                    count: data.page.numberOfElements,
                    countTotal: data.page.totalElements,
                    page: data.page.number,
                    pageSize: data.page.size,
                },
                content: data
            };
            if (angular.isArray(data.sort) && data.sort.length > 0) {
                result.state.orderBy = {
                    key: data.sort[0].property,
                    asc: data.sort[0].ascending
                };
            }
            return result;
        }
    })
    
    /**
     * The actual uxTable directive.
     */
    .directive('uxTable', ['$http', '$q', '$timeout', 'uxTableConf', function($http, $q, $timeout, uxTableConf) {
        return {
            scope: true,
            priority: 10,
            restrict: 'A',
            require: ['uxTable', '?^^uxTableScope'],
            templateUrl: '_uxTable.html',
            controller: ['$scope', '$element', function($scope, $element) {
                
                // ===== Table State TODO: retrieve from config
                
                $scope.state = {
                    page: 0,
                    pageSize: 10,
                    orderBy: {
                        key: 'id', // TODO: should be the selection key maybe?
                        asc: true
                    }
                };
                
                this.getConfig = function() {
                    return $scope.cfg;
                };
                
                // ===== Messaging
                
                var broadcast = function(name, args) {
                    var delegate = $scope.$ctrl && $scope.$ctrl.$isInit;
                    var delegateFn = delegate ? $scope.$ctrl.broadcast : $scope.$broadcast;
                    delegateFn(name, args);
                };
                
                // ===== Data Source
                
                var source = null;
                
                $scope.content = [];
                
                this.setSource = function(src) {
                    if (angular.isFunction(src) || angular.isObject(src) || angular.isArray(src)) {
                        source = src;
                        broadcast('uxTable.sourceChanged', source);
                    } else {
                        throw 'Invalid source type: ' + (typeof src);
                    }
                };
                
                this.reload = function() {
                    var promise = null;
                    if (angular.isFunction(source)) {
                        var fncParams = $scope.cfg.requestConverter($scope.state);
                        promise = source(fncParams);
                    } else if (angular.isArray(source)) {
                        var start = $scope.state.page * $scope.state.pageSize;
                        var data = source.slice(start, start + $scope.state.pageSize);
                        var deferred = $q.defer();
                        deferred.resolve({
                            data: data,
                            page: {
                                numberOfElements: data.length,
                                totalElements: source.length,
                                number: $scope.state.page,
                                size: $scope.state.pageSize
                            }
                        });
                        promise = deferred.promise;
                    } else if (angular.isObject(source)) {
                        var reqParams = $scope.cfg.requestConverter($scope.state);
                        if (source.method === 'GET') {
                            promise = $http(angular.merge({ params: reqParams }, source));
                        } else {
                            promise = $http(angular.merge({ data: reqParams }, source));
                        }
                    }
                    if (promise !== null) {
                        promise.then(function(data) {
                            $timeout(function() {
                                var response = $scope.cfg.responseConverter(data);
                                angular.extend($scope.state, response.state);
                                broadcast('uxTable.stateChanged', $scope.state);
                                $scope.content = response.content;
                                broadcast('uxTable.contentChanged', $scope.content);
                            });
                        });
                    } else {
                        throw 'Unknown source type: ' + promise;
                    }
                };
                
                // ===== Columns
                
                $scope.columns = [];
                
                // TODO: verify column data here
                /**
                 * Creates a new column object to be used in a uxTable.
                 * Note that the returned column is not added to the table.
                 * 
                 * @param {String} columnData.key The internally used column key.
                 * @param {String} columnData.name The column's header name.
                 * @param {Boolean} [columnData.sticky=true] The column's visibility possibilities.
                 * @param {Boolean} [columnData.show=true] The column's visibility status.
                 * @param {Boolean} [columnData.sort=true] The column's sorting possibilities.
                 * @param {String} [columnData.template] A custom template ('column' and 'row' available in $scope).
                 */
                var buildColumn = function(columnData) {
                    return angular.extend({
                        show: true,
                        sort: true,
                    }, columnData);
                };
                
                /**
                 * Adds a new column to the uxTable.
                 * 
                 * @param {Object} columnData The column definition.
                 * @param {Number} [idx] The index at which the column should be added.
                 */
                this.addColumn = function(columnData, idx) {
                    var column = buildColumn(columnData);
                    for (var i = 0; i < $scope.columns.length; i++) {
                        if ($scope.columns[i].key === column.key) {
                            throw 'Column key already defined: ' + column.key;
                        }
                    }
                    idx = angular.isDefined(idx) ? idx : $scope.columns.length;
                    $scope.columns.splice(idx, 0, column);
                    broadcast('uxTable.columnsChanged', $scope.columns);
                };
                
                /**
                 * Removes a column from the uxTable.
                 * 
                 * @param {String} key The column key.
                 */
                this.removeColumn = function(key) {
                    for (var i = 0; i < $scope.columns.length; i++) {
                        if ($scope.columns[i].key === key) {
                            $scope.columns.splice(i, 1);
                            broadcast('uxTable.columnsChanged', $scope.columns);
                            return;
                        }
                    }
                    throw 'Unknown column key: ' + key;
                };
                
                /**
                 * Sets the columns for the uxTable.
                 * 
                 * @param {Object[]} columnsData The column definitions.
                 */
                this.setColumns = function(columnsData) {
                    var keys = [];
                    var columns = [];
                    for (var i = 0; i < columnsData.length; i++) {
                        var column = buildColumn(columnsData[i]);
                        if (keys.indexOf(column.key) !== -1) {
                            throw 'Column key already defined: ' + column.key;
                        }
                        keys.push(column.key);
                        columns.push(column);
                    }
                    $scope.columns = columns;
                    broadcast('uxTable.columnsChanged', $scope.columns);
                };
                
                // ===== Column Visibility
                
                this.getVisibility = function(key) {
                    for (var i = 0; i < $scope.columns.length; i++) {
                        var column = $scope.columns[i];
                        if (column.key === key) {
                            return column.show;
                        }
                    }
                    throw 'Unknown column key: ' + key;
                };
                
                this.setVisibility = function(key, show) {
                    for (var i = 0; i < $scope.columns.length; i++) {
                        var column = $scope.columns[i];
                        if (column.key === key) {
                            if (!column.sticky && column.show !== show) {
                                column.show = show;
                                broadcast('uxTable.visibilityChanged', $scope.columns);
                            }
                            return;
                        }
                    }
                    throw 'Unknown column key: ' + key;
                };
                
                this.toggleVisibility = function(key) {
                    if (this.isVisible(key)) {
                        setVisibility(key, true);
                    } else {
                        setVisibility(key, false);
                    }
                };
                
                // ===== Table Sorting
                
                this.getSorting = function() {
                    return $scope.state.orderBy;
                };
                
                this.setSorting = function(key, asc) {
                    for (var i = 0; i < $scope.columns.length; i++) {
                        var column = $scope.columns[i];
                        if (column.key === key) {
                            if (column.sort) {
                                if (!$scope.state.orderBy || $scope.state.orderBy.key !== key) {
                                    $scope.state.orderBy = {
                                        key: key,
                                        asc: asc !== false
                                    };
                                } else if ($scope.state.orderBy.asc === true) {
                                    $scope.state.orderBy.asc = false;
                                } else if ($scope.state.orderBy.asc === false) {
                                    delete $scope.state.orderBy;
                                }
                                broadcast('uxTable.sortingChanged', $scope.state.orderBy);
                                this.reload();
                            }
                            return;
                        }
                    }
                    throw 'Unknown column key: ' + key;
                };
                
                // ===== Table Pagination
                
                this.getPage = function() {
                    return $scope.state.page;
                };
                
                this.setPage = function(page) {
                    this.setPagination(page, null);
                };
                
                this.getPageSize = function() {
                    return $scope.state.pageSize;
                };
                
                this.setPageSize = function(pageSize) {
                    this.setPagination(null, pageSize);
                };
                
                this.getPagination = function() {
                    return {
                        page: $scope.state.page,
                        pageSize: $scope.state.pageSize
                    };
                };
                
                this.setPagination = function(page, pageSize) {
                    var reload = false;
                    if (angular.isNumber(page) && 0 <= page) {
                        $scope.state.page = page;
                        reload = true;
                    }
                    if (angular.isNumber(pageSize) && 0 < pageSize) {
                        $scope.state.pageSize = pageSize;
                        reload = true;
                    }
                    if (reload) {
                        broadcast('uxTable.paginationChanged', {
                            page: $scope.state.page,
                            pageSize: $scope.state.pageSize
                        });
                        this.reload();
                    }
                };
                
                // ===== Table Selection
                
                $scope.state.selection = [];
                $scope.$watch('state.selection', function(newVal, oldVal) {
                    if (newVal !== oldVal) {
                        broadcast('uxTable.selectionChanged', newVal);
                    }
                }, true);
                
                this.select = function(items) {
                    if (angular.isUndefined(items)) { // select all
                        $scope.state.selection = $scope.content.reduce(function(acc, item) {
                            var key = item[$scope.cfg.selectionKey];
                            if ($scope.state.selection.indexOf(key) === -1) {
                                acc.push(key);
                            }
                            return acc;
                        }, $scope.state.selection);
                    } else if (angular.isArray(items)) { //select some
                        $scope.state.selection = items.reduce(function(acc, item) {
                            var key = angular.isObject(item) ? item[$scope.cfg.selectionKey] : item;
                            if ($scope.state.selection.indexOf(key) === -1) {
                                acc.push(key);
                            }
                            return acc;
                        }, $scope.state.selection);
                    } else { // select one
                        var key = angular.isObject(items) ? items[$scope.cfg.selectionKey] : items;
                        var idx = $scope.state.selection.indexOf(key);
                        if (idx === -1) {
                            $scope.state.selection.push(key);
                        }
                    }
                };
                
                this.deselect = function(items) {
                    if (angular.isUndefined(items)) { // deselect all
                        $scope.state.selection = $scope.content.reduce(function(acc, item) {
                            var key = item[$scope.cfg.selectionKey];
                            var idx = $scope.state.selection.indexOf(key);
                            if (idx !== -1) {
                                $scope.state.selection.splice(idx, 1);
                            }
                            return acc;
                        }, $scope.state.selection);
                    } else if (angular.isArray(items)) { // deselect some
                        $scope.state.selection = items.reduce(function(acc, item) {
                            var key = angular.isObject(item) ? item[$scope.cfg.selectionKey] : item;
                            var idx = $scope.state.selection.indexOf(key);
                            if (idx !== -1) {
                                $scope.state.selection.splice(idx, 1);
                            }
                            return acc;
                        }, $scope.state.selection);
                    } else { // deselect one
                        var key = angular.isObject(items) ? items[$scope.cfg.selectionKey] : items;
                        var idx = $scope.state.selection.indexOf(key);
                        if (idx !== -1) {
                            $scope.state.selection.splice(idx, 1);
                        }
                    }
                };
                
                this.getSelection = function() {
                    return $scope.state.selection;
                };
                
                this.setSelection = function(items) {
                    var selection = [];
                    for (var i = 0; i < items.length; i++) {
                        var item = items[i];
                        var key = angular.isObject(item) ? item[$scope.cfg.selectionKey] : item;
                        if (selection.indexOf(key) === -1) {
                            selection.push(key);
                        }
                    }
                    $scope.state.selection = selection;
                };
            }],
            link: {
                pre: function($scope, elem, attr, ctrl) {
                    
                    // ===== Expose API
                    if (ctrl[1] !== null) {
                        ctrl[1].init(ctrl[0], elem);
                        $scope.$ctrl = ctrl[1];
                    }
                },
                post: function($scope, elem, attr, ctrl) {
                    var attrCfg = attr.uxTable;
                    var evalCfg = angular.isDefined(attrCfg) ? $scope.$parent.$eval(attrCfg) : {};
                    ctrl.cfg = angular.extend(uxTableConf, evalCfg);
                    
                    
                    // ===== API Binding
                    $scope.cfg = ctrl.cfg;
                    
                    // ===== Initialization
                    ctrl[0].setColumns($scope.cfg.columns);
                    ctrl[0].setSource($scope.cfg.source);
                    ctrl[0].reload();
                    
                    
                    // ===== Sorting
                    $scope.setSorting = function(key) {
                        ctrl[0].setSorting(key);
                    };
                    
                    // ===== Selection
                    
                    // ===== Bind API to $scope
                    var tableName = $scope.cfg.name; //TODO: || Util.uuid();
                    $scope.$parent[tableName] = ctrl[0];
                }
            }
        };
    }])
    
    /**
     * A uxTable cell. For internal use only.
     */
    .directive('uxTableCell', ['$compile', function($compile) {
        return {
            priority: 0,
            scope: false,
            require: '^uxTable',
            link: function($scope, elem, attr, ctrl) {
                var template = $scope.column.template;
                if (angular.isString(template)) {
                    elem.html($compile(template)($scope));
                }
            }
        };
    }])
    
    /**
     * A uxTable row selector. For internal use only.
     */
    .directive('uxTableSelection', ['$timeout', function($timeout) {
        return {
            priority: 0,
            replace: true,
            require: '^uxTable',
            scope: {
                content: '=',
                selection: '=',
                selectionKey: '='
            },
            link: function($scope, elem, attrs, ctrl) {
                
                var updateState = function(newVal, oldVal) {
                    if (newVal === oldVal) { return; }
                    var numberOfItemsSelected = 0;
                    for (var i = 0; i < $scope.content.length; i++) {
                        if ($scope.selection.indexOf($scope.content[i][$scope.selectionKey]) !== -1) {
                            numberOfItemsSelected += 1;
                        }
                    }
                    switch (numberOfItemsSelected) {
                        case 0: // none selected
                            elem.prop('checked', false).prop('indeterminate', false); break;
                        case $scope.content.length: // all selected
                            elem.prop('checked', true).prop('indeterminate', false); break;
                        default: // some selected
                            elem.prop('checked', false).prop('indeterminate', true);
                    }
                };
                $scope.$watch('content', updateState, true);
                $scope.$watch('selection', updateState, true);
                
                elem.bind('change', function() {
                    $timeout(function() {
                        if(elem.prop('checked')) {
                            ctrl.select($scope.content);
                        } else {
                            ctrl.deselect($scope.content);
                        }
                    });
                });
            }
        };
    }])
    
    /**
     * A uxTable pagination handler.
     * 
     * @param {Number} [uxTablePagination.maxSize=5] Limit number for pagination size.
     * @param {Boolean} [uxTablePagination.rotate=true] Whether to keep current page in the middle of the visible ones.
     * @param {Boolean} [uxTablePagination.directionLinks=true] Whether to display Previous / Next buttons.
     * @param {String} [uxTablePagination.previousText='‹'] Text for Previous button.
     * @param {String} [uxTablePagination.nextText='›'] Text for Next button.
     * @param {Boolean} [uxTablePagination.boundaryLinks=true] Whether to display First / Last buttons.
     * @param {String} [uxTablePagination.firstText='«'] Text for First button.
     * @param {String} [uxTablePagination.lastText='»'] Text for Last button.
     */
    .directive('uxTablePagination', function() {
        return {
            priority: 0,
            scope: true,
            replace: true,
            restrict: 'A',
            require: '^uxTableScope',
            templateUrl: '_uxTablePagination.html',
            link: function($scope, elem, attr, ctrl) {
                var attrCfg = attr.uxTablePagination;
                var evalCfg = angular.isDefined(attrCfg) ? $scope.$parent.$eval(attrCfg) : {};
                
                $scope.cfg = angular.extend({
                    maxSize: 5,
                    rotate: true,
                    directionLinks: true,
                    previousText: '‹',
                    nextText: '›',
                    boundaryLinks: true,
                    firstText: '«',
                    lastText: '»',
                }, evalCfg, {
                    isInit: false,
                    ngModel: 0,
                    totalItems: 0,
                    itemsPerPage: 0,
                    ngChange: function() {
                        if (ctrl.$isInit) {
                            ctrl.$tableCtrl.setPagination($scope.cfg.ngModel - 1, null);
                        }
                    }
                });
                
                $scope.$on('uxTable.state', function(event, state) {
                    $scope.cfg.ngModel = state.page + 1;
                    $scope.cfg.totalItems = state.countTotal;
                    $scope.cfg.itemsPerPage = state.pageSize;
                    $scope.cfg.isInit = true;
                });
            }
        };
    })
    
    /**
     * A uxTable page size chooser.
     * 
     * @param {Boolean} [uxTablePaginationSize.closeOnBlur=true] Close the column chooser on blur.
     * @param {String} [uxTablePaginationSize.buttonClasses='btn btn-default'] The button's CSS classes.
     */
    .directive('uxTablePaginationSize', function() {
        return {
            priority: 0,
            scope: true,
            replace: true,
            restrict: 'A',
            require: '^uxTableScope',
            templateUrl: '_uxTablePaginationSize.html',
            link: {
                pre: function($scope, elem, attr, ctrl) {
                    var attrCfg = attr.uxTablePaginationSize;
                    var evalCfg = angular.isDefined(attrCfg) ? $scope.$parent.$eval(attrCfg) : {};
                    
                    $scope.cfg = angular.extend({
                        closeOnBlur: true,
                        buttonClasses: 'btn btn-default'
                    }, evalCfg, {
                        dynamicTitle: true,
                        displayProp: 'label',
                        idProp: 'id',
                        externalIdProp: 'id',
                        enableSearch: false,
                        selectionLimit: 1,
                        showCheckAll: false,
                        showUncheckAll: false,
                        closeOnSelect: true,
                        closeOnDeselect: true,
                        groupByTextProvider: angular.noop,
                        scrollable: true,
                        scrollableHeight: 'auto',
                        smartButtonMaxItems: 1,
                        smartButtonTextConverter: angular.noop,
                        options: [
                            { id: 10, label: '10' },
                            { id: 25, label: '25' },
                            { id: 50, label: '50' },
                            { id: 100, label: '100' }],
                        events: {
                            onItemSelect: function(item) {
                                if (ctrl.$isInit) {
                                    ctrl.$tableCtrl.setPagination(0, item.id);
                                }
                            }
                        },
                        isInit: false
                    });
                    
                    $scope.ngModel = { id: 0 };
                    $scope.$on('uxTable.paginationChanged', function(event, pagination) {
                        if (!_.some($scope.cfg.options, 'id', pagination.pageSize)) {
                            var idx = _.findIndex($scope.cfg.options, function(option) {
                                return option.id > pagination.pageSize;
                            });
                            idx = idx < 0 ? $scope.cfg.options.length : idx;
                            $scope.cfg.options.splice(idx, 0, { id: pagination.pageSize, label: '' + pagination.pageSize });
                        }
                        $scope.ngModel = { id: pagination.pageSize };
                        $scope.cfg.isInit = true;
                    });
                }
            }
        };
    })
    
    /**
     * Displays the number of elements currently visible in the uxTable.
     * 
     * @param {String|false} [uxTableCounter.i18n=false] A $translate key to be used (uxTable pagination state available in $scope).
     * @param {String} [uxTableCounter.template='{{ from }} – {{ to }} of {{ total }}'] A custom template (uxTable pagination state available in $scope).
     */
    .directive('uxTableCounter', ['$compile', function($compile) {
        return {
            priority: 0,
            scope: true,
            replace: true,
            restrict: 'A',
            require: '^uxTableScope',
            templateUrl: '_uxTableCounter.html',
            link: function($scope, elem, attr, ctrl) {
                var attrCfg = attr.uxTableCounter;
                var evalCfg = angular.isDefined(attrCfg) ? $scope.$parent.$eval(attrCfg) : {};
                
                $scope.cfg = angular.extend({
                    i18n: false,
                    template: '<span>{{ page * pageSize + 1 }} &ndash; {{ page * pageSize + count }} of {{ countTotal }}</span>'
                }, evalCfg, {
                    isInit: false
                });
                
                if (!angular.isString($scope.cfg.i18n)) {
                    elem.html($compile($scope.cfg.template)($scope));
                }
                
                $scope.$on('uxTable.paginationChanged', function(event, pagination) {
                    if (angular.isString($scope.cfg.i18n)) {
                        $scope.pagination = pagination;
                    } else {
                        angular.extend($scope, pagination);
                    }
                    $scope.isInit = true;
                });
            }
        };
    }])
    
    /**
     * A uxTable column chooser.
     * 
     * @param {Boolean} [uxTableToggle.closeOnBlur=true] Close the column chooser on blur.
     * @param {String} [uxTableToggle.buttonClasses='btn btn-default'] The button's CSS classes.
     * @param {String} [uxTableToggle.icon='zmdi zmdi-view-column'] The button's icon.
     * @param {Boolean} [uxTableToggle.caret=true] Show the button's dropdown caret.
     */
    .directive('uxTableToggle', ['$q', '$timeout', '$translate', function($q, $timeout, $translate) {
        return {
            priority: 0,
            scope: true,
            replace: true,
            restrict: 'A',
            require: '^uxTableScope',
            templateUrl: '_uxTableToggle.html',
            link: {
                pre: function($scope, elem, attr, ctrl) {
                    var attrCfg = attr.uxTableToggle;
                    var evalCfg = angular.isDefined(attrCfg) ? $scope.$parent.$eval(attrCfg) : {};
                    
                    $scope.cfg = angular.extend({
                        closeOnBlur: true,
                        buttonClasses: 'btn btn-default',
                        icon: 'zmdi zmdi-view-column',
                        caret: true
                    }, evalCfg, {
                        dynamicTitle: false,
                        displayProp: 'name',
                        idProp: 'key',
                        externalIdProp: 'key',
                        enableSearch: false,
                        selectionLimit: 0,
                        showCheckAll: false,
                        showUncheckAll: false,
                        closeOnSelect: false,
                        closeOnDeselect: false,
                        groupByTextProvider: angular.noop,
                        scrollable: true,
                        scrollableHeight: 'auto',
                        smartButtonMaxItems: 0,
                        smartButtonTextConverter: angular.noop,
                        options: [],
                        events: {
                            onItemSelect: function(item) {
                                if (ctrl.$isInit) {
                                    ctrl.$tableCtrl.toggleColumn(item.key, true);
                                }
                            },
                            onItemDeselect: function(item) {
                                if ($scope.ngModel.length === 0) {
                                    $scope.ngModel.push(item);
                                } else if (ctrl.$isInit) {
                                    ctrl.$tableCtrl.toggleColumn(item.key, false);
                                }
                            }
                        },
                        isInit: false
                    });
                    
                    $scope.ngModel = [];
                    $scope.$on('uxTable.columns', function(event, columns) {
                        
                        $scope.cfg.options = [];
                        
                        var deferred = $q.defer();
                        deferred.resolve([]);
                        var promise = deferred.promise;
                        
                        var fn = function(option, options) {
                            if (angular.isString(option.i18n)) {
                                return $translate(option.i18n).then(function(text) {
                                    option.name = text;
                                    delete option.i18n;
                                    options.push(option);
                                    return options;
                                });
                            } else {
                                options.push(option);
                                var deferred = $q.defer();
                                deferred.resolve(options);
                                return deferred.promise;
                            }
                        };
                        
                        for (var i = 0; i < columns.length; i++) {
                            var option = _.pick(columns[i], 'key', 'name', 'i18n');
                            promise = promise.then(_.bind(fn, this, option));
                        }
                        
                        promise.then(function(options) {
                            $scope.cfg.options = options;
                        });
                        
                        var selected = [];
                        for (var x = 0; x < columns.length; x++) {
                            if (columns[x].show) {
                                selected.push({ key: columns[x].key });
                            }
                        }
                        
                        $scope.ngModel = selected;
                        $scope.cfg.isInit = true;
                    });
                },
                post: function($scope, elem, attr, ctrl) {
                    var html = '<i class="' + $scope.cfg.icon + '"></i>';
                    if ($scope.cfg.caret) {
                        html += '&nbsp;<span class="caret"></span>';
                    }
                    elem.find('button').html(html);
                }
            }
        };
    }]);
})(angular);
