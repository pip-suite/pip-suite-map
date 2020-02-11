{
    const config = function registerIconSets($mdIconProvider, pipTranslateProvider) {
        $mdIconProvider
            .iconSet('map', 'map-icons.svg', 512); //find it in map-edit.html template - put to template cache

        pipTranslateProvider.translations('en', {
            MAP_NEW: 'New',
            MAP_NEW_SAVE: 'Create',
            MAP_EDIT: 'Edit',
            MAP_EDIT_SAVE: 'Save',
            MAP_DELETE: 'Delete'
        });

        pipTranslateProvider.translations('ru', {
            MAP_NEW: 'Создать',
            MAP_NEW_SAVE: 'Создать',
            MAP_EDIT: 'Редактировать',
            MAP_EDIT_SAVE: 'Сохранить',
            MAP_DELETE: 'Удалить'
        });
    }

    angular.module('pipMapsEdit')
        .config(config);
}