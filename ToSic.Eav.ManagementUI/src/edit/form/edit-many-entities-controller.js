﻿/* global angular */
(function () {
    "use strict";

    var app = angular.module("eavEditEntity");

    // The controller for the main form directive
    app.controller("EditEntities", function editEntityCtrl(appId, $http, $scope, entitiesSvc, toastr, $filter, debugState) {

        var vm = this;
        vm.debug = debugState;
        vm.isWorking = 0; // isWorking is > 0 when any $http request runs
        var translate = $filter("translate");

        vm.registeredControls = [];
        vm.registerEditControl = function (control) {
            vm.registeredControls.push(control);
        };

        vm.afterSaveEvent = $scope.afterSaveEvent;

        vm.isValid = function () {
            var valid = true;
            angular.forEach(vm.registeredControls, function (e, i) {
                if (!e.isValid())
                    valid = false;
            });
            return valid;
        };

        $scope.state.isDirty = function() {
            var dirty = false;
            angular.forEach(vm.registeredControls, function(e, i) {
                if (e.isDirty())
                    dirty = true;
            });
            return dirty;
        };

        $scope.state.setPristine = function() {
            angular.forEach(vm.registeredControls, function(e, i) {
                e.setPristine();
            });
        };

        vm.save = function (close) {
            vm.isWorking++;
            var saving = toastr.info(translate("Message.Saving"));
            entitiesSvc.saveMany(appId, vm.items).then(function (result) {
                toastr.clear(saving);
                $scope.state.setPristine();
                toastr.success(translate("Message.Saved"), { timeOut: 3000 });
                if(close)
                    vm.afterSaveEvent(result);
                vm.isWorking--;
            });
        };

        vm.items = null;

        entitiesSvc.getManyForEditing(appId, $scope.itemList)
            .then(function (result) {
                vm.items = result.data;
                angular.forEach(vm.items, function (v, i) {

                    // If the entity is null, it does not exist yet. Create a new one
                    if (!vm.items[i].Entity && !!vm.items[i].Header.ContentTypeName)
                        vm.items[i].Entity = entitiesSvc.newEntity(vm.items[i].Header);

                    vm.items[i].Entity = enhanceEntity(vm.items[i].Entity);
                });
                vm.willPublish = vm.items[0].Entity.IsPublished;
            });

        vm.willPublish = false;

        vm.togglePublish = function() {
            vm.willPublish = !vm.willPublish;
            angular.forEach(vm.items, function(v, i) {
                vm.items[i].Entity.IsPublished = vm.willPublish;
            });
        };

        vm.toggleSlotIsEmpty = function (item) {
            if (!item.Header.Group)
                item.Header.Group = {};
            item.Header.Group.SlotIsEmpty = !item.Header.Group.SlotIsEmpty;
        };

    });



})();