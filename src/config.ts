{
    const config = function (uiGmapGoogleMapApiProvider) {
        uiGmapGoogleMapApiProvider.configure({
            key: 'AIzaSyBg6cm-FDBFPWzRcn39AuSHGQSrdtVIjEo',
            v: '3.23',
            libraries: 'geometry'
        });
    };

    angular.module('pipMaps')
        .config(config);
}