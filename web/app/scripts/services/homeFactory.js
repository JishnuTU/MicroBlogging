'use strict';

angular.module('webApp')
	.constant("baseURL","https://localhost:3443/")

	.factory('NavFactory',['$resource','baseURL',function($resource,baseURL){
		var navFac = {};
		navFac.search=
			$resource(baseURL + "home/search");
			
		return navFac;
	}])


;