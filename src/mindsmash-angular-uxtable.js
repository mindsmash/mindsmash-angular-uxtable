(function(angular) {
    'use strict';
    
    function UxTableFactory($rootScope, $timeout, defaultConfig) {
        this.get = function(name, config) {
            if (angular.isUndefined(config)) {
                config = {};
            }
            var tableConfig = angular.merge({}, defaultConfig, config);
            return new UxTable($rootScope, $timeout, name, tableConfig);
        };
    }
    
    function UxTable($rootScope, $timeout, tableName, tableConfig) {
        var self = this;
        
        self.getConfig = function() {
            return config;
        };
        
        self.getData = function() {
            return data;
        };
        
        // ===== Table Configuration & Session Storage
        
        var storageKey = 'uxTable.' + tableName;
        
        var loadConfig = function() {
            var stored = sessionStorage[storageKey];
            return stored ? JSON.parse(sessionStorage[storageKey]) : {};
        };
        
        var saveConfig = function() {
            sessionStorage[storageKey] = JSON.stringify({
                page: config.page,
                pageSize: config.pageSize,
                orderBy: config.orderBy,
                columns: config.columns,
                filters: config.filters
            });
        };
        
        var config = angular.extend(angular.extend({
            source: angular.noop,
            columns: [],
            selection: [],
            active: null,
            filters: {}
        }, tableConfig), loadConfig());
        
        // build i18n key
        var i18n = function(name) {
            if(!name || name.indexOf(tableConfig.i18n.prefix) === 0) { return name; }
            var trim = name.replace(/ /g, '');
            return tableConfig.i18n.prefix + trim.toLowerCase();
        };
        
        // normalize columns
        for (var i = 0; i < config.columns.length; i++) {
            var column = config.columns[i];
            config.columns[i] = angular.extend({
                name: '',
                show: true, // is the column visible?
                sticky: false, // can the visibility status be toggled?
                sort: true, // is the column sortable? may be a sort key
                filter: true, // is the column filterable?
                facets: false // are facets enabled?
            }, column);
            config.columns[i].name = i18n(config.columns[i].name);
            config.columns[i].sortKey = angular.isString(column.sort) ? column.sort : column.key;
        }
        
        // ===== Table Data & Reloading
        
        var data = [];
        
        self.load = function() {
            var params = config.requestConverter(config, self);
            config.source(params).then(function(response) {
                var converted = config.responseConverter(response, self);
                var facets = converted.meta.facets;
                delete converted.meta.facets;
                angular.extend(config, converted.meta);
                self.setFacets(facets);
                data = converted.data;
                $rootScope.$emit('uxTable.dataChanged', data);
                $rootScope.$emit('uxTable.configChanged', config);
            });
        };
        
        // ===== Table Pagination
        
        self.getPage = function() {
            return config.page;
        };
        
        self.getPageSize = function() {
            return config.pageSize;
        };
        
        self.setPage = function(page) {
            self.setPagination(page, null);
        };
        
        self.firstPage = function() {
            self.setPagination(0, null);
        };
        
        self.prevPage = function() {
            self.setPagination(Math.max(0, config.page - 1), null);
        };
        
        self.nextPage = function() {
            self.setPagination(Math.min(config.page + 1, config.pageCount - 1), null);
        };
        
        self.lastPage = function() {
            self.setPagination(config.pageCount - 1, null);
        };
        
        self.setPageSize = function(pageSize) {
            self.setPagination(null, pageSize);
        };
        
        self.setPagination = function(page, pageSize) {
            var reload = false;
            if (page !== null && 0 <= page && page !== config.page) {
                config.page = page;
                reload = true;
            }
            if (pageSize !== null && 0 < pageSize && pageSize !== config.pageSize) {
                config.pageSize = pageSize;
                reload = true;
            }
            if (reload) {
                $rootScope.$emit('uxTable.configChanged', config);
                saveConfig();
                self.load();
            }
        };
        
        // ===== Table Column Toggle
        
        self.getVisibility = function(key) {
            for (var i = 0; i < config.columns.length; i++) {
                var column = config.columns[i];
                if (column.key === key) {
                    return column.show;
                }
            }
            return null;
        };
        
        self.toggleVisibility = function(key) {
            self.setVisibility(key, null);
        };
        
        self.setVisibility = function(key, isVisible) {
            if (angular.isObject(key)) {
                key = key.key;
            }
            for (var i = 0; i < config.columns.length; i++) {
                var column = config.columns[i];
                if (column.key === key) {
                    if (!column.sticky) {
                        column.show = isVisible !== null ? isVisible : !column.show;
                        saveConfig();
                    }
                    return;
                }
            }
        };
        
        // ===== Table Row Selection
        
        self.prevActive = function() {
            self.toggleActive(config.active - 1);
        };
        
        self.nextActive = function() {
            self.toggleActive(config.active + 1);
        };
        
        self.clearActive = function() {
            self.toggleActive(null);
        };
        
        self.toggleActive = function(idx) {
            if (idx === null || idx === config.active) {
                config.active = null;
            } else if (idx < 0 && config.page > 0) {
                self.prevPage();
                config.active = config.pageSize - 1;
            } else if (idx >= config.pageSize && config.page < config.pageCount - 1) {
                self.nextPage();
                config.active = 0;
            } else if (idx >= 0 && idx < data.length) {
                config.active = idx;
            }
        };
        
        self.toggleSelection = function(key) {
            self.setSelection(key, null);
        };
        
        self.setSelection = function(key, isSelected) {
            if (angular.isObject(key)) {
                key = key[config.view.selectionKey];
            }
            var idx = config.selection.indexOf(key);
            if (idx < 0 && isSelected !== false) {
                config.selection.push(key);
            } else if (idx >= 0 && isSelected !== true) {
                config.selection.splice(idx, 1);
            }
        };
        
        self.setPageSelection = function(isSelected) {
            for (var i = 0; i < data.length; i++) {
                var key = data[i][config.view.selectionKey];
                self.setSelection(key, isSelected);
            }
        };
        
        self.clearSelection = function() {
            config.selection = [];
            $rootScope.$emit('uxTable.configChanged', config);
        };
        
        // ===== Table Filter & Facets
        
        self.getFilter = function(key) {
            return config.filters[key];
        };
        
        self.setFilter = function(key, filter) {
            if (filter) {
                config.filters[key] = filter;
            } else {
                delete config.filters[key];
            }
            saveConfig();
            self.load();
        };
        
        self.clearFilter = function(key) {
            self.setFilter(key, null);
        };
        
        self.clearFilters = function() {
            config.filters = {};
        };
        
        var mergeFacetTerms = function(facetName, facetTerms) {
            var facet = config.facets.options[facetName];
            for (var i = 0; i < facetTerms.length; i++) {
                var term = facetTerms[i];
                term.active = false;
                if (angular.isDefined(facet)) {
                    for (var j = 0; j < facet.terms.length; j++) {
                        if (facet.terms[j].term === term.term) {
                            term.active = facet.terms[j].active === true;
                            break;
                        }
                    }
                }
            }
            return facetTerms;
        };
        
        self.setFacets = function(facets) {
            var result = {};
            for (var i = 0; i < facets.length; i++) {
                var facet = facets[i];
                result[facet.name] = {
                    type: facet.type,
                    terms: mergeFacetTerms(facet.name, facet.terms)
                };
            }
            config.facets.options = result;
        };
        
        self.toggleFacet = function(name, term) {
            var facet = config.facets.options[name];
            if (angular.isDefined(facet)) {
                for (var i = 0; i < facet.terms.length; i++) {
                    var termObj = facet.terms[i];
                    if (termObj.term === term) {
                        termObj.active = !termObj.active;
                        self.load();
                        return;
                    }
                }
            }
        };
        
        // ===== Table Sorting
        
        self.getSorting = function() {
            return config.orderBy;
        };
        
        self.setSorting = function(key, asc) {
            for (var i = 0; i < config.columns.length; i++) {
                var column = config.columns[i];
                if (column.sortKey === key) {
                    if (column.sort !== false) {
                        if (!config.orderBy || config.orderBy.key !== key) {
                            config.orderBy = {
                                key: key,
                                asc: asc !== false
                            };
                        } else if (config.orderBy.asc === true) {
                            config.orderBy.asc = false;
                        } else if (config.orderBy.asc === false) {
                            delete config.orderBy;
                        }
                        saveConfig();
                        $rootScope.$emit('uxTable.configChanged', config);
                        self.load();
                    }
                    return;
                }
            }
        };
        
        // ===== Load Initial Table Data
        
        this.load();
    }
    
    angular.module('mindsmash.uxTable', ['mindsmash.hotkeys', 'pascalprecht.translate'])
    
    .provider('UxTableFactory', function UxTableFactoryProvider() {
        var defaultConfig = {
            page: 0,
            pageSize: 10,
            orderBy: null,
            i18n: {
                prefix: 'uxTable.'
            },
            view: { //TODO: cleanup
                ngClass: 'ux-table-view table',
                keyboard: true,
                selection: true,
                selectionKey: 'id',
                rowAction: angular.noop, // function(row, idx, api, $event)...
                mobileViewSize: undefined, // media size to display mobile view (xs,sm,...), multiple values as comma-separated list
                mobileViewTemplate: undefined, // replacement template for mobile view (instead of table),
                scope: {} // additions/overrides to the scope backing the table (additional action methods etc.)
            },
            pagination: {
                ngClass: 'ux-table-pagination',
                maxSize: 5,
                rotate: true,
                directionLinks: true,
                previousText: '‹',
                nextText: '›',
                boundaryLinks: true,
                firstText: '«',
                lastText: '»'
            },
            paginationSize: {
                ngClass: 'ux-table-pagination-size',
                template: '<span>{{ conf.pageSize }}&nbsp;<span class="caret"></span></span>',
                closeOnBlur: true,
                closeOnSelect: false,
                closeOnDeselect: false,
                options: [10, 25, 50, 100]
            },
            toggle: {
                ngClass: 'ux-table-toggle',
                template: '<span><span class="glyphicon glyphicon-th" aria-hidden="true"></span>&nbsp;<span class="caret"></span></span>',
                closeOnBlur: true,
                closeOnSelect: false,
                closeOnDeselect: false,
            },
            counter: {
                ngClass: 'ux-table-counter',
                template: '<span translate="uxTable.tableCounter" translate-values="{ start: conf.page * conf.pageSize + 1, end: conf.page * conf.pageSize + conf.count, total: conf.countTotal }"></span>'
            },
            selectionCounter: {
                ngClass: 'ux-table-selection-counter',
                template: '<span><span translate="uxTable.selectionCounter" translate-values="{ count: conf.selection.length }"></span><span ng-show="conf.selection.length"> (<a href="#" ng-click="clear()">clear</a>)</span></span>'
            },
            facets: {
                ngClass: 'ux-table-facets',
                maxFacetCount: 5,
                minFacetSize: 3,
                options: {}
            },
            requestConverter: function(config, api) {
                var orderBy = config.orderBy;
                var params = {
                    _page: config.page,
                    _pageSize: config.pageSize,
                    _orderBy: (orderBy && orderBy.key) ? orderBy.key + (orderBy.asc ? ',asc' : ',desc') : null
                };
                
                var facets = {};
                // collect facet options
                for (var i = 0; i < config.columns.length; i++) {
                    var column = config.columns[i];
                    if (column.facets) {
                        facets['$' + config.columns[i].key] = [''];
                    }
                }
                // collect active facets
                for (var termName in config.facets.options) {
                    if (config.facets.options.hasOwnProperty(termName)) {
                        var facet = config.facets.options[termName];
                        for (var j = 0; j < facet.terms.length; j++) {
                            var termObj = facet.terms[j];
                            if (termObj.active) {
                                facets['$' + termName].push(termObj.term);
                            }
                        }
                    }
                }
                
                return angular.extend(params, facets, config.filters);
            },
            responseConverter: function(response, api) {
                var result = {
                    meta: {
                        page: response.page.number,
                        pageSize: response.page.size,
                        pageCount: response.page.totalPages,
                        count: response.page.numberOfElements,
                        countTotal: response.page.totalElements,
                        facets: response.page.facets || []
                    },
                    data: response
                };
                
                if (angular.isArray(response.sort) && response.sort.length > 0) {
                    result.meta.orderBy = {
                        key: response.sort[0].property,
                        asc: response.sort[0].ascending
                    };
                }
                
                return result;
            }
        };
        
        this.setConfig = function(config) {
            defaultConfig = config;
            return this;
        };
        
        this.$get = function($rootScope, $timeout) {
            return new UxTableFactory($rootScope, $timeout, defaultConfig);
        };
    })
    
    .directive('uxTableView', function($rootScope, hotkeys, ElementClickListener, screenSize) {
        return {
            replace: true,
            restrict: 'AE',
            templateUrl: '_uxTableView.html',
            scope: {
                api: '&'
            },
            controller: function($scope) {
                this.api = $scope.api();
            },
            link: function($scope, elem, attrs, ctrl) {
                var api = ctrl.api;
                
                $scope.conf = {};
                $scope.sortBy = api.setSorting;
                $scope.rowClick = function(row, idx, $event) {
                    api.toggleActive(idx);
                };
                
                var updateConf = function(event, conf) {
                    $scope.conf = conf;
                };
                var updateData = function(event, data) {
                    $scope.data = data;
                };
                
                hotkeys.bindTo($scope).add({
                    combo: 'shift+left',
                    callback: api.firstPage
                }).add({
                    combo: 'left',
                    callback: api.prevPage
                }).add({
                    combo: 'right',
                    callback: api.nextPage
                }).add({
                    combo: 'shift+right',
                    callback: api.lastPage
                }).add({
                    combo: 'space',
                    callback: function($event) {
                        if ($scope.conf.active !== null) {
                            $event.preventDefault();
                            api.toggleSelection($scope.data[$scope.conf.active][$scope.conf.view.selectionKey]);
                        }
                    }
                }).add({
                    combo: 'return',
                    callback: function($event) {
                        if ($scope.conf.active !== null) {
                            $event.preventDefault();
                            var idx = $scope.conf.active;
                            var row = $scope.data[idx];
                            $scope.conf.view.rowAction(row, idx, api, $event);
                            $scope.conf.active = null;
                        }
                    }
                }).add({
                    combo: 'up',
                    callback: function($event) {
                        if ($scope.conf.active !== null) {
                            $event.preventDefault();
                            api.prevActive();
                        }
                    }
                }).add({
                    combo: 'down',
                    callback: function($event) {
                        if ($scope.conf.active !== null) {
                            $event.preventDefault();
                            api.nextActive();
                        }
                    }
                }).add({
                    combo: 'esc',
                    callback: function($event) {
                        if ($scope.conf.active !== null) {
                            $event.preventDefault();
                            api.clearActive();
                        }
                    }
                });
                
                // register
                $rootScope.$on('uxTable.configChanged', updateConf);
                $rootScope.$on('uxTable.dataChanged', updateData);
                ElementClickListener.register('uxTable.view', elem, api.clearActive, true);
                // initialize
                updateConf(null, api.getConfig());
                updateData(null, api.getData());

                var viewConf = $scope.conf.view;
                if (!!viewConf.mobileViewTemplate && !!viewConf.mobileViewSize) {
                    $scope.mobile = screenSize.is(viewConf.mobileViewSize);
                    screenSize.on(viewConf.mobileViewSize, function (mobile) {
                        $scope.mobile = mobile;
                    });
                }

                angular.extend($scope, api.getConfig().view.scope);
            }
        };
    })
    
    .directive('uxTablePagination', function($rootScope, $timeout) {
        return {
            replace: true,
            restrict: 'AE',
            templateUrl: '_uxTablePagination.html',
            scope: {
                api: '&'
            },
            controller: function($scope){
                var api = $scope.api();

                $scope.conf = {};

                $scope.current = {
                    page: 0
                };

                $scope.hasPrevious = function(page){
                    page = !page ? $scope.current.page : page;
                    return page > 1;
                };

                $scope.hasNext = function(page){
                    page = !page ? $scope.current.page : page;
                    return (page < $scope.conf.pageCount);  
                };

                $scope.selectPage = function(page, event){
                    if(page >= 1 && page <= $scope.conf.pageCount){
                        api.setPage(page - 1);
                    }
                }; 
            },
            link: function($scope, elem, attrs) {
                var api = $scope.api();                
                var createPagesArray = function(from, to){
                    var pages = [];
                    for (var i = from; i <= to; i++) {
                        pages.push({
                            number: i,
                            active: $scope.current.page == i
                        });
                    }
                    return pages;
                };

                var getPages = function(conf){
                    var start = 1;
                    var end = conf.pageCount;
                    if((end - start) > (conf.pagination.maxSize - 1)){
                        start = ($scope.current.page - Math.floor((conf.pagination.maxSize - 1) / 2) > 0) ? $scope.current.page - Math.floor((conf.pagination.maxSize - 1) / 2) : 1;
                        end = start + (conf.pagination.maxSize - 1);
                        if(end > conf.pageCount){
                            end = conf.pageCount;
                            start = end - (conf.pagination.maxSize - 1);
                        }
                    }
                    return createPagesArray(start, end);
                };

                var updateConf = function(event, conf) {
                    $scope.conf = conf;
                    $scope.current.page = conf.page + 1;
                    $scope.pages = getPages(conf);
                };
                
                // register
                $rootScope.$on('uxTable.configChanged', updateConf);
                // initialize
                updateConf(null, api.getConfig());
            }
        };
    })
    
    .directive('uxTablePaginationSize', function($rootScope, $compile, $filter) {
        return {
            replace: true,
            restrict: 'AE',
            templateUrl: '_uxTablePaginationSize.html',
            scope: {
                api: '&'
            },
            link: {
                pre: function($scope, elem, attrs) {
                    var api = $scope.api();
                    
                    $scope.conf = {};
                    $scope.confLocal = {
                        ngModel: null,
                        options: [],
                        extraSettings: {
                            dynamicTitle: false,
                            displayProp: 'label',
                            idProp: 'id',
                            externalIdProp: 'id',
                            enableSearch: false,
                            selectionLimit: 1,
                            showCheckAll: false,
                            showUncheckAll: false,
                            groupByTextProvider: angular.noop,
                            scrollable: true,
                            scrollableHeight: 'auto',
                            smartButtonMaxItems: 1,
                            smartButtonTextConverter: angular.noop
                        },
                        events: {
                            onItemSelect: function(item) {
                                api.setPagination(0, item.id);
                            }
                        }
                    };
                    
                    var updateConf = function(event, conf) {
                        var options = [];
                        
                        for (var i = 0; i < conf.paginationSize.options.length; i++) {
                            var option = conf.paginationSize.options[i];
                            options.push({ id: option, label: ('' + option) });
                        }
                        if (conf.paginationSize.options.indexOf(conf.pageSize) === -1) {
                            options.push({ id: conf.pageSize, label: ('' + conf.pageSize) });
                        }
                        
                        $scope.conf = conf;
                        $scope.confLocal.ngModel = { id: conf.pageSize, label: ('' + conf.pageSize) };
                        $scope.confLocal.options = $filter('orderBy')(options, 'id');
                        $scope.confLocal.extraSettings.closeOnBlur = conf.paginationSize.closeOnBlur;
                        $scope.confLocal.extraSettings.closeOnSelect = conf.paginationSize.closeOnSelect;
                        $scope.confLocal.extraSettings.closeOnDeselect = conf.paginationSize.closeOnDeselect;
                        
                        var template = conf.paginationSize.template;
                        if (template.indexOf('<') !== 0) {
                            template = '<span>' + template + '</span>';
                        }
                        if (angular.isString(template) && $scope.confLocal.template !== template) {
                            elem.find('button.dropdown-toggle').html($compile(template)($scope));
                            $scope.confLocal.template = template;
                        }
                    };
                    
                    // register
                    $rootScope.$on('uxTable.configChanged', updateConf);
                    // initialize
                    updateConf(null, api.getConfig());
                }
            }
        };
    })
    
    .directive('uxTableToggle', function($rootScope, $compile) {
        return {
            replace: true,
            restrict: 'AE',
            templateUrl: '_uxTableToggle.html',
            scope: {
                api: '&'
            },
            link: {
                pre: function($scope, elem, attrs) {
                    var api = $scope.api();
                    
                    $scope.conf = {};
                    $scope.confLocal = {
                        ngModel: [],
                        options: [],
                        extraSettings: {
                            dynamicTitle: false,
                            displayProp: 'name',
                            idProp: 'key',
                            externalIdProp: 'key',
                            enableSearch: false,
                            selectionLimit: 0,
                            showCheckAll: false,
                            showUncheckAll: false,
                            groupByTextProvider: angular.noop,
                            scrollable: true,
                            scrollableHeight: 'auto',
                            smartButtonMaxItems: 0,
                            smartButtonTextConverter: angular.noop
                        },
                        events: {
                            onItemSelect: function(item) {
                                api.setVisibility(item.key, true);
                            },
                            onItemDeselect: function(item) {
                                if ($scope.confLocal.ngModel.length === 0) {
                                    $scope.confLocal.ngModel.push(item);
                                } else {
                                    api.setVisibility(item.key, false);
                                }
                            }
                        }
                    };
                    
                    var updateConf = function(event, conf) {
                        var options = [];
                        var selected = [];
                        
                        for (var i = 0; i < conf.columns.length; i++) {
                            var column = conf.columns[i];
                            if (!column.sticky) {
                                options.push({
                                    key: column.key,
                                    name: column.name
                                });
                                if (column.show) {
                                    selected.push({
                                        key: column.key
                                    });
                                }
                            }
                        }
                        
                        $scope.conf = conf;
                        $scope.confLocal.ngModel = selected;
                        $scope.confLocal.options = options;
                        $scope.confLocal.extraSettings.closeOnBlur = conf.toggle.closeOnBlur;
                        $scope.confLocal.extraSettings.closeOnSelect = conf.toggle.closeOnSelect;
                        $scope.confLocal.extraSettings.closeOnDeselect = conf.toggle.closeOnDeselect;
                        
                        var template = conf.toggle.template;
                        if (template.indexOf('<') !== 0) {
                            template = '<span>' + template + '</span>';
                        }
                        if (angular.isString(template) && $scope.confLocal.template !== template) {
                            elem.find('button.dropdown-toggle').html($compile(template)($scope));
                            $scope.confLocal.template = template;
                        }
                    };
                    
                    // register
                    $rootScope.$on('uxTable.configChanged', updateConf);
                    // initialize
                    updateConf(null, api.getConfig());
                }
            }
        };
    })
    
    .directive('uxTableCounter', function($rootScope, $compile) {
        return {
            replace: true,
            restrict: 'AE',
            templateUrl: '_uxTableCounter.html',
            scope: {
                api: '&'
            },
            link: function($scope, elem, attrs) {
                var api = $scope.api();
                
                $scope.conf = {};
                $scope.confLocal = {};
                var updateConf = function(event, conf) {
                    $scope.conf = conf;
                    
                    var template = conf.counter.template;
                    if (template.indexOf('<') !== 0) {
                        template = '<span>' + template + '</span>';
                    }
                    if (angular.isString(template) && $scope.confLocal.template !== template) {
                        elem.html($compile(template)($scope));
                        $scope.confLocal.template = template;
                    }
                };
                
                // register
                $rootScope.$on('uxTable.configChanged', updateConf);
                // initialize
                updateConf(null, api.getConfig());
            }
        };
    })
    
    .directive('uxTableSelectionCounter', function($rootScope, $compile) {
        return {
            replace: true,
            restrict: 'AE',
            templateUrl: '_uxTableSelectionCounter.html',
            scope: {
                api: '&'
            },
            link: function($scope, elem, attrs) {
                var api = $scope.api();
                
                $scope.conf = {};
                $scope.confLocal = {};
                var updateConf = function(event, conf) {
                    $scope.conf = conf;
                    
                    var template = conf.selectionCounter.template;
                    if (template.indexOf('<') !== 0) {
                        template = '<span>' + template + '</span>';
                    }
                    if (angular.isString(template) && $scope.confLocal.template !== template) {
                        elem.html($compile(template)($scope));
                        $scope.confLocal.template = template;
                    }
                };
                
                $scope.clear = function() {
                   api.clearSelection(); 
                };
                
                // register
                $rootScope.$on('uxTable.configChanged', updateConf);
                // initialize
                updateConf(null, api.getConfig());
            }
        };
    })
    
    .directive('uxTableFacets', function($rootScope) {
        return {
            replace: true,
            restrict: 'AE',
            templateUrl: '_uxTableFacets.html',
            scope: {
                api: '&'
            },
            link: function($scope, elem, attr) {
                var api = $scope.api();
                
                $scope.conf = {};
                var updateConf = function(event, conf) {
                    $scope.conf = conf;
                };
                
                $scope.getFilter = function(key){
                    return $scope.conf.filters[key];
                };

                $scope.setFilter = function(key, value) {
                    api.setFilter(key, value);
                };
                $scope.toggleFacet = function(key, value) {
                    api.toggleFacet(key, value);
                };
                
                // register
                $rootScope.$on('uxTable.configChanged', updateConf);
                // initialize
                updateConf(null, api.getConfig());
            }
        };
    })
    
    // ===== INTERNAL
    
    .directive('uxTableCell', function($compile) {
        return {
            scope: false,
            require: '^uxTableView',
            link: function($scope, elem, attrs) {
                var template = $scope.column.template;
                if (angular.isString(template)) {
                    elem.html($compile(template)($scope));
                }
            }
        };
    })
    
    .directive('uxTableSelection', function($timeout) {
        return {
            replace: true,
            require: '^uxTableView',
            scope: {
                data: '=',
                selection: '=',
                selectionKey: '='
            },
            link: function($scope, elem, attrs, ctrl) {
                var api = ctrl.api;
                
                var updateState = function(newVal, oldVal) {
                    if (newVal === oldVal) { return; }
                    var numberOfItemsSelected = 0;
                    for (var i = 0; i < $scope.data.length; i++) {
                        if ($scope.selection.indexOf($scope.data[i][$scope.selectionKey]) !== -1) {
                            numberOfItemsSelected += 1;
                        }
                    }
                    switch (numberOfItemsSelected) {
                        case 0: // none selected
                            elem.prop('checked', false).prop('indeterminate', false); break;
                        case $scope.data.length: // all selected
                            elem.prop('checked', true).prop('indeterminate', false); break;
                        default: // some selected
                            elem.prop('checked', false).prop('indeterminate', true);
                    }
                };
                $scope.$watch('data', updateState, true);
                $scope.$watch('selection', updateState, true);
                
                elem.bind('change', function() {
                    $timeout(function() {
                        if(elem.prop('checked')) {
                            api.setPageSelection(true);
                        } else {
                            api.setPageSelection(false);
                        }
                    });
                });
            }
        };
    })
    
    .factory('ElementClickListener', function($window, $timeout) {
        var listeners = {};
        var window = angular.element($window);
        
        var isTarget = function(targetElem, targetClick) {
            while(targetClick.length !== 0) {
                if (targetClick[0] === targetElem[0]) {
                    return true;
                }
                targetClick = targetClick.parent();
            }
            return false;
        };
        
        window.on('click', function($event) {
            for (var key in listeners) {
                if (listeners.hasOwnProperty(key)) {
                    var listener = listeners[key];
                    var targetElem = listener.element;
                    var targetClick = angular.element($event.target);
                    if (isTarget(targetElem, targetClick)) {
                        if (!listener.inverse) {
                            $timeout(listener.callback);
                        }
                    } else {
                        if (listener.inverse) {
                            $timeout(listener.callback);
                        }
                    }
                }
            }
        });
        
        return {
            register: function(key, element, callback, inverse) {
                listeners[key] = {
                    element: angular.element(element),
                    callback: callback,
                    inverse: inverse
                };
            },
            deregister: function(key) {
                delete listeners[key];
            }
        };
    });
    
})(angular);