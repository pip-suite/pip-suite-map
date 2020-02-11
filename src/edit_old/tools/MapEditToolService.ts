(function () {
    'use strict';

    /**
     * @typedef {Object} MapEditToolFct~editObj
     * @property {Object} model Model to edit
     * @property {Object} ctrl Controller of the element
     */


    /**
     * @ngdoc service
     * @name pipMapEditComponent.MapEditToolFct
     * @constructor
     *
     * @description Returns MapEditToolFct
     */
    function /*@ngInject*/ MapEditToolFct(MapEditUndoSrv, pipMapHelperSrv) {
        /**
         * @ngdoc service
         * @name pipMapEditComponent.MapEditToolFct
         * @param {Object} parameters Parameters for tool
         * @param {Object} parameters.options Options for tool
         * @param {Array<Object>} parameters.actions Actions instances for tool
         * @param {Object} parameters.controller Controller associated with the tool elements
         * @param {string} parameters.templateUrl URL to a template for form while editing element using the tool
         * @param {Array<number>} [parameters.actionsDisabledForExisting] Array of actions disabled for existing models
         *
         * @constructor
         * @description Edit tool for map.
         * Provides access to actions and working (create, edit, remove) models through actions
         */
        function MapEditToolFct(parameters) {
            this.ctrl = parameters.controller;
            this.options = angular.merge({}, this.defaultOptions, parameters.options);
            this.actions = parameters.actions;
            this.template = parameters.options.templateUrl;
            this.setupDisabledActions(parameters);
        }


        /**
         * @ngdoc property
         * @propertyOf pipMapEditComponent.MapEditToolFct
         * @name pipMapEditComponent.MapEditToolFct#defaultOptions
         * @type {Object}
         *
         * @description Default tool options
         */
        MapEditToolFct.prototype.defaultOptions = {
            name: 'Edit tool',
            icon: 'plus-circle',
            onSave: angular.noop,
            baseModel: {
                editable: false,
                draggable: false,
                geodesic: false,
                visible: true
            }
        };


        /**
         * @ngdoc method
         * @methodOf pipMapEditComponent.MapEditToolFct
         * @name pipMapEditComponent.MapEditToolFct#setupDisabledActions
         * @param {Object} parameters Parameters for tool
         *
         * @description Sets disabled actions arrays
         */
        MapEditToolFct.prototype.setupDisabledActions = function (parameters) {
            this.actionsDisabledForExisting = this.getActionsByIndexes(parameters.actionsDisabledForExisting);
            this.actionsDisabledForNew = this.getActionsByIndexes(parameters.actionsDisabledForNew);
        };


        /**
         * @ngdoc method
         * @methodOf pipMapEditComponent.MapEditToolFct
         * @name pipMapEditComponent.MapEditToolFct#getActionsByIndexes
         * @param {Array<number>} [indexes = []] Indexes of actions to return array with
         * @return {Array<Object>} Array of actions
         *
         * @description Gets array of actions from actions property with given indexes
         */
        MapEditToolFct.prototype.getActionsByIndexes = function (indexes) {
            indexes = indexes || [];
            return indexes.map(function (value) {
                return this.actions[value];
            }, this);
        };


        /**
         * @ngdoc method
         * @methodOf pipMapEditComponent.MapEditToolFct
         * @name pipMapEditComponent.MapEditToolFct#isActionDisabled
         * @param {Object} action Action to check
         * @return {boolean} true if action is disabled
         *
         * @description Check whether an action is disabled
         */
        MapEditToolFct.prototype.isActionDisabled = function (action) {
            return this.disabledActions.indexOf(action) > -1;
        };


        /**
         * @ngdoc method
         * @methodOf pipMapEditComponent.MapEditToolFct
         * @name pipMapEditComponent.MapEditToolFct#getInfo
         *
         * @description Returns tool info
         */
        MapEditToolFct.prototype.getInfo = function () {
            return {
                name: this.options.name,
                icon: this.options.icon
            };
        };


        /**
         * @ngdoc method
         * @methodOf pipMapEditComponent.MapEditToolFct
         * @name pipMapEditComponent.MapEditToolFct#selectModel
         * @param {Object} model Model to select for edition
         *
         * @description Selects existing model
         */
        MapEditToolFct.prototype.selectModel = function (model) {
            this.setModelToEdit(model);
            this.createUndo(model);
        };


        /**
         * @ngdoc method
         * @methodOf pipMapEditComponent.MapEditToolFct
         * @name pipMapEditComponent.MapEditToolFct#addNewModel
         *
         * @description Creates new model, adds it to given models and select it to edit
         */
        MapEditToolFct.prototype.addNewModel = function () {
            var model = this.createModel();
            this.setModelToEdit(model);
            this.setCreateLabels();

            this.createUndo({});
            //this.addToModelsIfNeeded();
        };


        /**
         * @ngdoc method
         * @methodOf pipMapEditComponent.MapEditToolFct
         * @name pipMapEditComponent.MapEditToolFct#createModel
         * @returns {Object} New model
         *
         * @description Creates new model
         */
        MapEditToolFct.prototype.createModel = function () {
            return angular.extend({
                id: Date.now()
            }, this.options.baseModel);
        };


        /**
         * @ngdoc method
         * @methodOf pipMapEditComponent.MapEditToolFct
         * @name pipMapEditComponent.MapEditToolFct#createUndo
         * @param {Object} model Model to create undo for
         *
         * @description Creates new undo instance
         */
        MapEditToolFct.prototype.createUndo = function (model) {
            this.undo = MapEditUndoSrv.create(model);
        };


        /**
         * @ngdoc method
         * @methodOf pipMapEditComponent.MapEditToolFct
         * @name pipMapEditComponent.MapEditToolFct#setModelToEdit
         * @param {Object} model Model to select for edition
         *
         * @description Sets model to edit
         */
        MapEditToolFct.prototype.setModelToEdit = function (model) {
            this.currentModel = model;

            this.setCurrentlyDisabledActions();
            this.setDefaultAction(model);
            this.setEditLabels();
        };


        /**
         * @ngdoc method
         * @methodOf pipMapEditComponent.MapEditToolFct
         * @name pipMapEditComponent.MapEditToolFct#setCurrentlyDisabledActions
         *
         * @description Sets actions which are disabled according to a current model state
         */
        MapEditToolFct.prototype.setCurrentlyDisabledActions = function () {
            var isNewModel = this.isCurrentModelNew();

            this.disabledActions = isNewModel ? this.actionsDisabledForNew : this.actionsDisabledForExisting;
        };


        /**
         * @ngdoc method
         * @methodOf pipMapEditComponent.MapEditToolFct
         * @name pipMapEditComponent.MapEditToolFct#isCurrentModelNew
         * @returns {boolean} True if model is new or not existing
         *
         * @description Checks if current model is empty or not existing
         */
        MapEditToolFct.prototype.isCurrentModelNew = function () {
            if (!this.currentModel) {
                return true;
            }

            var positions = this.ctrl.getPosition(this.currentModel);
            return !positions.latitude && !positions.longitude;
        };


        /**
         * @ngdoc method
         * @methodOf pipMapEditComponent.MapEditToolFct
         * @name pipMapEditComponent.MapEditToolFct#setDefaultAction
         *
         * @description Sets default action for current model
         */
        MapEditToolFct.prototype.setDefaultAction = function () {
            var enabledActions = this.actions.filter(function (action) {
                return !this.isActionDisabled(action);
            }, this);

            this.setAction(enabledActions[0]);
        };


        /**
         * @ngdoc method
         * @methodOf pipMapEditComponent.MapEditToolFct
         * @name pipMapEditComponent.MapEditToolFct#setCreateLabels
         *
         * @description Sets label for title and save button for create mode
         */
        MapEditToolFct.prototype.setCreateLabels = function () {
            this.title = 'MAP_NEW';
            this.titleSave = 'MAP_NEW_SAVE';
        };


        /**
         * @ngdoc method
         * @methodOf pipMapEditComponent.MapEditToolFct
         * @name pipMapEditComponent.MapEditToolFct#setEditLabels
         *
         * @description Sets label for title and save button for edit mode
         */
        MapEditToolFct.prototype.setEditLabels = function () {
            this.title = 'MAP_EDIT';
            this.titleSave = 'MAP_EDIT_SAVE';
        };


        /**
         * @ngdoc method
         * @methodOf pipMapEditComponent.MapEditToolFct
         * @name pipMapEditComponent.MapEditToolFct#removeCurrentModel
         *
         * @description Removes current model, performs save and finish
         */
        MapEditToolFct.prototype.removeCurrentModel = function () {
            if (!this.currentModel) {
                return;
            }

            this.removeModel(this.currentModel);
        };


        /**
         * @ngdoc method
         * @methodOf pipMapEditComponent.MapEditToolFct
         * @name pipMapEditComponent.MapEditToolFct#removeModel
         * @param {Object} model Model to remove
         *
         * @description Removes a model from models
         */
        MapEditToolFct.prototype.removeModel = function (model) {
            var models = this.ctrl.getModels();
            var index = models.indexOf(model);

            if (index > -1) {
                models.splice(index, 1);
            }
        };


        /**
         * @ngdoc method
         * @methodOf pipMapEditComponent.MapEditToolFct
         * @name pipMapEditComponent.MapEditToolFct#onMapClick
         * @param {Map~eventObj} eventObj Event object with all event data
         *
         * @description On map click handler
         */
        MapEditToolFct.prototype.onMapClick = function (eventObj) {
            if (!this.currentModel) {
                return;
            }

            this.addToModelsIfNeeded();

            var editObj = this.getEditObj();
            this.currentAction.onMapClick(editObj, eventObj);
        };


        /**
         * @ngdoc method
         * @methodOf pipMapEditComponent.MapEditToolFct
         * @name pipMapEditComponent.MapEditToolFct#addToModelsIfNeeded
         *
         * @description Adds model to a models of it is needed
         */
        MapEditToolFct.prototype.addToModelsIfNeeded = function () {
            if (!this.currentModel) {
                return;
            }

            var models = this.ctrl.getModels();
            var index = models.indexOf(this.currentModel);

            if (index === -1) {
                models.push(this.currentModel);
            }
        };


        /**
         * @ngdoc method
         * @methodOf pipMapEditComponent.MapEditToolFct
         * @name pipMapEditComponent.MapEditToolFct#getEventObj
         * @returns {MapEditToolFct~editObj} editObj
         *
         * @description Creates and returns edit object
         */
        MapEditToolFct.prototype.getEditObj = function () {
            return {
                model: this.currentModel,
                ctrl: this.ctrl
            };
        };


        /**
         * @ngdoc method
         * @methodOf pipMapEditComponent.MapEditToolFct
         * @name pipMapEditComponent.MapEditToolFct#onElementClick
         * @param {Map~eventObj} eventObj Event object with all event data
         *
         * @description On element click handler
         */
        MapEditToolFct.prototype.onElementClick = function (eventObj) {
            if (!this.currentModel) {
                return;
            }

            var editObj = this.getEditObj();
            this.currentAction.onElementClick(editObj, eventObj);
        };


        /**
         * @ngdoc method
         * @methodOf pipMapEditComponent.MapEditToolFct
         * @name pipMapEditComponent.MapEditToolFct#finish
         *
         * @description Finish editing model
         */
        MapEditToolFct.prototype.finish = function () {
            if (this.currentAction && this.currentModel) {
                this.currentAction.finish(this.getEditObj());
            }

            this.deleteIfEmpty();

            this.currentModel = null;
            this.currentAction = null;
            this.disabledActions = [];

            this.undo.finish();
            this.undo = null;
        };


        /**
         * @ngdoc method
         * @methodOf pipMapEditComponent.MapEditToolFct
         * @name pipMapEditComponent.MapEditToolFct#deleteIfEmpty
         *
         * @description Deletes current model if it is empty
         */
        MapEditToolFct.prototype.deleteIfEmpty = function () {
            if (!this.currentModel) {
                return;
            }

            var empty = this.ctrl.isModelEmpty(this.currentModel);

            if (empty) {
                this.removeCurrentModel();
            }
        };


        /**
         * @ngdoc method
         * @methodOf pipMapEditComponent.MapEditToolFct
         * @name pipMapEditComponent.MapEditToolFct#setEditOpacity
         *
         * @description Sets opacity for all available models except current
         */
        MapEditToolFct.prototype.setEditOpacity = function () {
            this.setOptionsForNotCurrentModels({
                opacity: 0.4
            });
        };


        /**
         * @ngdoc method
         * @methodOf pipMapEditComponent.MapEditToolFct
         * @name pipMapEditComponent.MapEditToolFct#resetEditOpacity
         *
         * @description Resets opacity for all available models except current
         */
        MapEditToolFct.prototype.resetEditOpacity = function () {
            this.setOptionsForNotCurrentModels({
                opacity: 1
            });
        };


        /**
         * @ngdoc method
         * @methodOf pipMapEditComponent.MapEditToolFct
         * @name pipMapEditComponent.MapEditToolFct#setOptionsForNotCurrentModels
         * @param {Object} options Options to set
         *
         * @description Sets options for all models except currentModel
         */
        MapEditToolFct.prototype.setOptionsForNotCurrentModels = function (options) {
            this.getNotCurrentModels()
                .forEach(function (model) {
                    var plural = this.ctrl.getPlural(model.id);
                    pipMapHelperSrv.setModelOptions(plural, options);
                }, this);
        };


        /**
         * @ngdoc method
         * @methodOf pipMapEditComponent.MapEditToolFct
         * @name pipMapEditComponent.MapEditToolFct#getNotCurrentModels
         * @returns {Array<Object>} Models except current one
         *
         * @description Get models except current model
         */
        MapEditToolFct.prototype.getNotCurrentModels = function () {
            var models = this.ctrl.getModels();
            var modelId = this.currentModel && this.currentModel.id;

            if (modelId) {
                models = models.filter(function (model) {
                    return model.id !== modelId;
                });
            }

            return models;
        };


        /**
         * @ngdoc method
         * @methodOf pipMapEditComponent.MapEditToolFct
         * @name pipMapEditComponent.MapEditToolFct#cancel
         *
         * @description Cancels edition and cancels made changes
         */
        MapEditToolFct.prototype.cancel = function () {
            if (!this.currentModel) {
                return;
            }

            var models = this.ctrl.getModels();
            var index = models.indexOf(this.currentModel);

            if (index === -1) {
                return;
            }

            var savedModel = this.undo.cancel();
            models.splice(index, 1, savedModel);

            this.currentModel = savedModel;
        };


        /**
         * @ngdoc method
         * @methodOf pipMapEditComponent.MapEditToolFct
         * @name pipMapEditComponent.MapEditToolFct#save
         * @param {boolean} [restore = false] If set to true it will restore action after saving
         *
         * @description Performs onSave handler passed to options. Pass current model as the parameter
         */
        MapEditToolFct.prototype.save = function (restore) {
            var empty = this.ctrl.isModelEmpty(this.currentModel);

            if (empty) {
                return;
            }

            //we need to finish active tool before saving (not to save model in edited state)
            var restorer = this.backupAction();
            this.options.onSave(this.currentModel);

            if (restore) {
                restorer();
            }
        };


        /**
         * @ngdoc method
         * @methodOf pipMapEditComponent.MapEditToolFct
         * @name pipMapEditComponent.MapEditToolFct#backupAction
         *
         * @description Finishes current action and returns callback to restore it
         */
        MapEditToolFct.prototype.backupAction = function () {
            var action = this.currentAction;

            if (action) {
                this.setAction();
            }

            return function () {
                this.setAction(action);
            }.bind(this);
        };


        /**
         * @ngdoc method
         * @methodOf pipMapEditComponent.MapEditToolFct
         * @name pipMapEditComponent.MapEditToolFct#setAction
         * @param {Object} [action] Action to set
         *
         * @description Set current action
         */
        MapEditToolFct.prototype.setAction = function (action) {
            var editObj = this.getEditObj();

            if (this.currentAction) {
                this.currentAction.finish(editObj);
            }

            if (!action) {
                return;
            }

            this.currentAction = action;
            action.init(editObj);
        };


        /**
         * @ngdoc method
         * @methodOf pipMapEditComponent.MapEditToolFct
         * @name pipMapEditComponent.MapEditToolFct#isActionActive
         * @param {Object} action Action to check
         *
         * @description Checks if action is current
         */
        MapEditToolFct.prototype.isActionActive = function (action) {
            return this.currentAction === action;
        };


        /**
         * @ngdoc method
         * @methodOf pipMapEditComponent.MapEditToolFct
         * @name pipMapEditComponent.MapEditToolFct#isUndoDisabled
         * @returns {boolean} True if undo is disabled
         *
         * @description Checks whether undo is disabled
         */
        MapEditToolFct.prototype.isUndoDisabled = function () {
            return true;
        };


        return MapEditToolFct;
    }

    angular.module('pipMapsEdit')
        .factory('MapEditToolFct', MapEditToolFct);
})();