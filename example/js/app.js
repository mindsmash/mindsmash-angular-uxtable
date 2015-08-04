(function() {
	'use strict';
	
	angular.module('app', ['pascalprecht.translate', 'mindsmash.uxTable'])
	
	.controller('AppCtrl', function($scope, $q) {
		$scope.name = 'AngularJS';

		$scope.table = {
			name: 'userListTable',
			source: [{
				id: 1,
				name: "Allison Barnes",
				email: "barnes@test.com"
			},{
				id: 2,
				name: "Andy Chambers",
				email: "chambers@test.com"
			},{
				id: 3,
				name: "Ronnie Francis",
				email: "francis@test.com"
			},{
				id: 4,
				name: "Alan Peters",
				email: "peters@test.com"
			},{
				id: 5,
				name: "Ellen Mcdaniel",
				email: "mcdaniel@test.com"
			}],
			fetch: function(data) {
				$scope.content = data;
			},
			columns: [
				{ key: 'name', name: 'Name', show: true },
				{ key: 'email', name: 'Email', show: true }
			]
		};
	});
})();