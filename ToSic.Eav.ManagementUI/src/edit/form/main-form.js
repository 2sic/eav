﻿/* global angular */
(function () {
	"use strict";

	var app = angular.module("eavEditEntity");

	// The controller for the main form directive
	app.controller("EditEntityWrapperCtrl", function editEntityCtrl($q, $http, $scope, items, $modalInstance, $window, $translate) {

	    var vm = this;
	    vm.itemList = items;

	    // this is the callback after saving - needed to close everything
	    vm.afterSave = function(result) {
	        if (result.status === 200)
	            vm.close(result);
	        else {
	            alert($translate.instant("Errors.UnclearError"));
	        }
	    };

	    vm.state = {
	        isDirty: function() {
	            throw $translate.instant("Errors.InnerControlMustOverride");
	        }
	    };

	    vm.close = function (result) {
		    $modalInstance.close(result);
		};


	    vm.maybeLeave = function maybeLeave(e) {
	        var unsavedChangesText = $translate.instant("Errors.UnsavedChanges");
	        if (vm.state.isDirty() && !confirm(unsavedChangesText + " " + $translate.instant("Message.ExitOk")))
	            e.preventDefault();
	    };

	    $scope.$on('modal.closing', vm.maybeLeave);
	    $window.addEventListener('beforeunload', function (e) {
	        var unsavedChangesText = $translate.instant("Errors.UnsavedChanges");
	        if (vm.state.isDirty()) {
	            (e || window.event).returnValue = unsavedChangesText; //Gecko + IE
	            return unsavedChangesText; //Gecko + Webkit, Safari, Chrome etc.
	        }
	        return null;
	    });
	});

})();