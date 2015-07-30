(function(angular) {
    'use strict';
    
    angular.module('mindsmash.uxTable', ['angularjs-dropdown-multiselect', 'ui.bootstrap.pagination'])
    
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
        tableClass: 'table table-striped',
        rowClass: angular.noop,
        rowClick: angular.noop,
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
    .directive('uxTable', ['$http', '$q', '$timeout', 'Util', 'uxTableConf', function($http, $q, $timeout, Util, uxTableConf) {
        return {
            scope: true,
            priority: 10,
            restrict: 'A',
            require: ['uxTable', '?^^uxTableScope'],
            templateUrl: '_uxTable.html',
            controller: ['$scope', '$element', function($scope, $element) {
                
                // ===== Messaging
                var broadcast = function(name, args) {
                    if ($scope.$ctrl && $scope.$ctrl.$isInit) {
                        $scope.$ctrl.broadcast(name, args);
                    } else {
                        $scope.$broadcast(name, args);
                    }
                };
                
                // ===== Data Source
                $scope.source = null;
                this.setSource = function(source) {
                    $scope.source = source;
                    broadcast('uxTable.source', $scope.columns);
                    return this;
                };
                
                // ===== Table State TODO: retrieve from config
                $scope.state = {
                    page: 0,
                    pageSize: 10,
                    orderBy: {
                        key: 'id',
                        asc: true
                    }
                };
                
                // ===== Table Columns
                $scope.columns = [];
                
                /**
                 * Creates a new column object to be used in a uxTable.
                 * Note that the returned column is not added to the table.
                 * 
                 * @param {String} columnData.key The internally used column key.
                 * @param {String} columnData.name The column's header name.
                 * @param {Boolean} [columnData.show=true] The column's visibility status.
                 * @param {Boolean} [columnData.sort=true] The column's sorting possibilities.
                 * @param {String} [columnData.template] A custom template ('column' and 'row' available in $scope).
                 */
                this.newColumn = function(columnData) {
                    return angular.extend({
                        show: true,
                        sort: true,
                    }, columnData);
                };
                
                /**
                 * Sets the columns for the uxTable.
                 * 
                 * @param {Object[]} columnsData The column definitions.
                 */
                this.setColumns = function(columnsData) {
                    if (angular.isArray(columnsData) && columnsData.length > 0) {
                        $scope.columns = _.map(columnsData, function(columnData) {
                            return this.newColumn(columnData);
                        }, this);
                        if(!_.some($scope.columns, 'show', true)) {
                            $scope.columns[0].show = true;
                        }
                    }
                    broadcast('uxTable.columns', $scope.columns);
                    return this;
                };
                
                /**
                 * Adds a new column to the uxTable.
                 * 
                 * @param {Object} columnData The column definitions.
                 * @param {Number} idx The index at which the column should be added.
                 */
                this.addColumn = function(columnData, idx) {
                    idx = angular.isDefined(idx) ? idx : $scope.columns.length;
                    $scope.columns.splice(idx, 0, this.newColumn(columnData));
                    broadcast('uxTable.columns', $scope.columns);
                    return this;
                };
                
                /**
                 * Removes a column from the uxTable.
                 * 
                 * @param {String} key The column key.
                 */
                this.removeColumn = function(key) {
                    if ($scope.columns.length > 1) {
                        var idx = _.findIndex($scope.columns, 'key', key);
                        $scope.columns.splice(idx, 1);
                        if(!_.some($scope.columns, 'show', true)) {
                            $scope.columns[0].show = true;
                        }
                    }
                    broadcast('uxTable.columns', $scope.columns);
                    return this;
                };
                
                /**
                 * Toggles a column's visibility status.
                 * 
                 * @param {String} key The column key.
                 * @param {Boolean} [show] Set the visibility to a specific value.
                 */
                this.toggleColumn = function(key, show) {
                    var column = _.find($scope.columns, 'key', key);
                    if (column) {
                        show = angular.isDefined(show) ? show : !column.show;
                        if(show || _.some($scope.columns, function(column) {
                            return column.key !== key && column.show === true;
                        })) {
                            column.show = show;
                            broadcast('uxTable.columns', $scope.columns);
                        }
                    }
                };
                
                // ===== Table Sorting
                
                this.getSorting = function() {
                    return $scope.state.orderBy;
                };
                
                this.setSorting = function(key, asc) {
                    var column = _.find($scope.columns, 'key', key);
                    if (column && column.sort) {
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
                        broadcast('uxTable.state', $scope.state);
                        this.reload();
                    }
                };
                
                // ===== Table Pagination
                
                this.getPage = function() {
                    return $scope.state.page;
                };
                
                this.getPageSize = function() {
                    return $scope.state.pageSize;
                };
                
                this.setPage = function(page) {
                    this.setPagination(page, null);
                };
                
                this.setPageSize = function(pageSize) {
                    this.setPagination(null, pageSize);
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
                        broadcast('uxTable.state', $scope.state);
                        this.reload();
                    }
                };
                
                // ===== Table Filter
                // TODO
                
                // ===== Table Content
                $scope.content = [];
                this.reload = function() {
                    var promise = null;
                    if (angular.isFunction($scope.source)) {
                        var params = $scope.cfg.requestConverter($scope.state);
                        promise = $scope.source(params);
                    } else if (angular.isObject($scope.source)) { // TODO: implement
                        promise = $http($scope.source);
                    } else if (angular.isArray($scope.source)) { // TODO: implement
                        var start = $scope.state.page * $scope.state.size;
                        var content = $scope.source.slice(start, start + $scope.state.size);
                        var deferred = $q.defer();
                        deferred.resolve(content);
                        promise = deferred.promise;
                    }
                    if (promise !== null) {
                        promise.then(function(data) {
                            $scope.cfg.fetch(data);
                            $timeout(function() {
                                var response = $scope.cfg.responseConverter(data);
                                angular.extend($scope.state, response.state);
                                broadcast('uxTable.state', $scope.state);
                                $scope.content = response.content;
                                broadcast('uxTable.content', $scope.content);
                            });
                        });
                    }
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
                    $scope.cfg = ctrl.cfg;
                    
                    // ===== Initialization
                    ctrl[0].setColumns($scope.cfg.columns);
                    ctrl[0].setSource($scope.cfg.source);
                    ctrl[0].reload();
                    
                    // ===== Sorting
                    $scope.setSorting = function(key) {
                        ctrl[0].setSorting(key);
                    };
                    
                    // ===== Bind API to $scope
                    var tableName = $scope.cfg.name || Util.uuid();
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
                    $scope.$on('uxTable.state', function(event, state) {
                        if (!_.some($scope.cfg.options, 'id', state.pageSize)) {
                            var idx = _.findIndex($scope.cfg.options, function(option) {
                                return option.id > state.pageSize;
                            });
                            idx = idx < 0 ? $scope.cfg.options.length : idx;
                            $scope.cfg.options.splice(idx, 0, { id: state.pageSize, label: '' + state.pageSize });
                        }
                        $scope.ngModel = { id: state.pageSize };
                        $scope.cfg.isInit = true;
                    });
                }
            }
        };
    })
    
    /**
     * Displays the number of elements currently visible in the uxTable.
     * 
     * @param {String|false} [uxTableCounter.i18n=false] A $translate key to be used (uxTable state available in $scope).
     * @param {String} [uxTableCounter.template='{{ from }} – {{ to }} of {{ total }}'] A custom template (uxTable state available in $scope).
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
                
                $scope.$on('uxTable.state', function(event, state) {
                    if (angular.isString($scope.cfg.i18n)) {
                        $scope.state = state;
                    } else {
                        angular.extend($scope, state);
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
