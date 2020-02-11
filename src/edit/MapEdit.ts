interface IMapEditBindings {
    [key: string]: any;

    overlay: any;
    onEdit: any;
    mapOptions: any;
    showActionPanel: any;
    actionTypes: any;
    control: any;
    disabled: any;
}

const MapEditBindings: IMapEditBindings = {
    overlay: '<pipOverlay',
    onEdit: '&?pipOnEdit',
    mapOptions: '=?pipMapOptions',
    showActionPanel: '<?pipShowActionPanel',
    actionTypes: '<?pipActionTypes',
    control: '&?pipControl',
    disabled: '<?pipDisabled',
    disabledPolygons: '<?pipDisabledPolygons',
    disabledPolygonsOptions: '<?pipDisabledPolygonsOptions',
    disabledPolylines: '<?pipDisabledPolylines',
    disabledPolylinesOptions: '<?pipDisabledPolylinesOptions',
    disabledCircles: '<?pipDisabledCircles',
    disabledCirclesOptions: '<?pipDisabledCirclesOptions'
}

class actionTypes {
    public static clearMap: string = 'clear';
    public static addCircle: string = 'circle';
    public static addRectangle: string = 'rectangle';
    public static addPolygon: string = 'polygon';
    public static addLine: string = 'line';
}

class MapEditChanges implements ng.IOnChangesObject, IMapEditBindings {
    [key: string]: ng.IChangesObject<any>;

    overlay: ng.IChangesObject<any>;
    mapOptions: ng.IChangesObject<any>;
    showActionPanel: ng.IChangesObject<boolean>;
    actionTypes: ng.IChangesObject<any>;
    disabled: ng.IChangesObject<boolean>;
    control: any;
    onEdit: any;
}


class MapEditController {
    public map = {
        control: {},
        options: {
            disableDefaultUI: true,
            mapTypeId: "satellite",
            panControl: false,
            zoomControl: false,
            mapTypeControl: false,
            streetViewControl: false
        }
    };
    public drawingManagerControl: any = {};
    public drawingManagerOptions: any = {};
    public currentOverlay: any = {};
    public actionTypes: any[];

    public showActionPanel: boolean;
    public overlay: any;
    public mapOptions: any;
    public onEdit: Function;
    public control: Function;
    public disabled: boolean;

    private _circleOptions = {
        fillColor: '#F8E81C',
        fillOpacity: 0.2,
        strokeWeight: 3,
        strokeColor: '#F8E81C',
        clickable: false,
        editable: !this.disabled,
        zIndex: 1
    };
    private _polygonOptions = {
        fillColor: '#F8E81C',
        fillOpacity: 0.2,
        strokeWeight: 3,
        strokeColor: '#F8E81C',
        clickable: false,
        editable: !this.disabled,
        draggable: !this.disabled,
        zIndex: 1
    };
    private _polylineOptions = {
        strokeWeight: 6,
        strokeColor: '#F8E81C',
        clickable: false,
        editable: !this.disabled,
        zIndex: 1
    };
    private _markerOptions = {
        icon: {
            path: 0,
            scale: 4,
            strokeWeight: 8,
            fillColor: '#F8E81C',
            strokeColor: '#F8E81C',
            strokeOpacity: 0.9,
            draggable: !this.disabled
        }
    };

    private _rectangleOptions = {
        fillColor: '#F8E81C',
        fillOpacity: 0.2,
        strokeWeight: 3,
        strokeColor: '#F8E81C',
        clickable: false,
        editable: !this.disabled,
        draggable: !this.disabled,
        zIndex: 1
    };

    constructor(
        private $element: JQuery,
        private $scope: ng.IScope,
        private $mdConstant: any,
        private $document: ng.IDocumentService,
        private $timeout: ng.ITimeoutService,
        private uiGmapGoogleMapApi: any
    ) {
        $element.addClass('pip-map-edit');

        uiGmapGoogleMapApi.then((maps) => {
            this.drawingManagerOptions = {
                drawingControl: false,
                drawingControlOptions: {
                    position: google.maps.ControlPosition.TOP_CENTER,
                    drawingModes: [
                        google.maps.drawing.OverlayType.CIRCLE,
                        google.maps.drawing.OverlayType.POLYGON,
                        google.maps.drawing.OverlayType.POLYLINE
                    ]
                },
                circleOptions: this._circleOptions,
                polygonOptions: this._polygonOptions,
                polylineOptions: this._polylineOptions,
                markerOptions: this._markerOptions,
                rectangleOptions: this._rectangleOptions
                
            };
        });

        $scope.$watch('$ctrl.map.control.getGMap', () => {
            if (this.currentOverlay && this.currentOverlay.setMap && _.isFunction(this.map.control['getGMap'])) {
                this.currentOverlay.setMap(this.map.control['getGMap']());
                this.fitBounds();
            }
        });

        $scope.$watch('$ctrl.mapOptions.embededMap', () => {
            _.assign(this.map, this.mapOptions);
        }, true);

        $scope.$watch('$ctrl.mapOptions.isEmbeded', () => {
            _.assign(this.map, this.mapOptions);
        });


        $scope.$watch('$ctrl.drawingManagerControl.getDrawingManager', (val) => {
            if (!this.drawingManagerControl.getDrawingManager) {
                return;
            }

            google.maps.event.addListener(this.drawingManagerControl.getDrawingManager(), 'overlaycomplete', (e) => {
                this.drawingManagerControl.getDrawingManager().setDrawingMode(null);
                this.setOverlay(e.overlay, e.type, false);
                this.onEditOverlay();
            });

            google.maps.event.addListener(this.drawingManagerControl.getDrawingManager(), 'drawingmode_changed', () => {
                if (this.drawingManagerControl.getDrawingManager().getDrawingMode() !== null) {
                    if (this.currentOverlay && this.currentOverlay.map) this.currentOverlay.setMap(null);
                }
            });

            google.maps.event.addDomListener(document, 'keyup', (e) => {
                const code = (e.keyCode ? e.keyCode : e.which);

                if (code === 27) {
                    this.drawingManagerControl.getDrawingManager().setDrawingMode(null);
                }

                if (code === 46) {
                    this.clearMap();
                }
            });

        });
    }

    public $onDestroy(): void {

    }

    public $onChanges(changes: MapEditChanges): void {
        if (changes.overlay && changes.overlay.currentValue) {
            this.setOverlay(this.convertToGoogleMapOverlay(changes.overlay.currentValue), changes.overlay.currentValue.type);
        }

        if (changes.disabled) {
            if (this.currentOverlay) {
                this.currentOverlay.setDraggable(!changes.disabled.currentValue);
                if (this.currentOverlay.setEditable) this.currentOverlay.setEditable(!changes.disabled.currentValue);
            }
        }
    }

    public $onInit() {
        angular.extend(this.map, this.mapOptions);

        if (this.control) {
            this.control({ control: this });
        }
    }

    private fitBounds() {
        if (!this.map.control['getGMap'] || !this.currentOverlay) return;

        switch (this.overlay.type) {
            case 'circle': {
                this.map.control['getGMap']().fitBounds(this.currentOverlay.getBounds());
                break;
            }

            case 'marker': {
                if (this.currentOverlay.getPosition) {
                    this.map.control['getGMap']().panTo(this.currentOverlay.getPosition());
                }
                break;
            }

            case 'rectangle': {
                this.map.control['getGMap']().fitBounds(this.currentOverlay.getBounds());
                break;
            }

            default: {
                if (this.currentOverlay.getPath().getArray().length > 0) {
                    var bounds = new google.maps.LatLngBounds();
                    _.each(this.currentOverlay.getPath().getArray(), (coor) => {
                        bounds.extend(coor);
                    });
                    this.map.control['getGMap']().fitBounds(bounds);
                }
            }
        }
    }

    private convertToGoogleMapOverlay(overlay) {
        if (overlay.type === 'polygon') {
            return this.createPolygon(overlay);
        }

        if (overlay.type === 'line' || overlay.type === 'polyline') {
            return this.createPolyline(overlay);
        }

        if (overlay.type === 'circle') {
            return this.createCircle(overlay);
        }

        if (overlay.type === 'marker') {
            return this.createMarker(overlay);
        }

        if (overlay.type === 'rectangle') {
            return this.createRectangle(overlay);
        }
    }

    private createMarker(overlay: any) {
        if ((overlay.pos && overlay.pos.coordinates) || (overlay.latitude && overlay.longitude)) {
            let centerCoords = {};
            centerCoords = {
                lat: overlay.pos.coordinates ? overlay.pos.coordinates[1] : overlay.latitude,
                lng: overlay.pos.coordinates ? overlay.pos.coordinates[0] : overlay.longitude
            };

            const marker = new google.maps.Marker(angular.extend(
                this.getOptionsByType('marker'),
                { position: centerCoords }
            ));

            if (this.map.control['getGMap']) marker.setMap(this.map.control['getGMap']());

            return marker;
        }

        return new google.maps.Circle(this.getOptionsByType('circle'));
    }

    private createCircle(overlay: any) {
        if (overlay.center && (overlay.center.coordinates || (overlay.center.latitude && overlay.center.longitude)) && overlay.distance) {
            let centerCoords = {};
            centerCoords = {
                lat: overlay.center.coordinates ? overlay.center.coordinates[1] : overlay.center.latitude,
                lng: overlay.center.coordinates ? overlay.center.coordinates[0] : overlay.center.longitude
            };

            const circle = new google.maps.Circle(angular.extend(
                this.getOptionsByType('circle'),
                { center: centerCoords, radius: overlay.distance }
            ));

            if (this.map.control['getGMap']) circle.setMap(this.map.control['getGMap']());

            return circle;
        }

        return new google.maps.Circle(this.getOptionsByType('circle'));
    }

    private createPolygon(overlay) {
        if (overlay.geometry && overlay.geometry.coordinates) {
            const polygonCoords = [];

            _.each(overlay.geometry.coordinates[0], (coor) => {
                polygonCoords.push({ lat: coor[1], lng: coor[0] });
            });

            const polygon = new google.maps.Polygon(angular.extend(
                this.getOptionsByType('polygon'),
                { paths: polygonCoords }
            ));

            if (this.map.control['getGMap']) polygon.setMap(this.map.control['getGMap']());

            return polygon;
        }

        return new google.maps.Polygon(this.getOptionsByType('polygon'));;
    }

    private createPolyline(overlay) {
        if (overlay.geometry && overlay.geometry.coordinates) {
            const polylineCoords = [];

            _.each(overlay.geometry.coordinates, (coor) => {
                polylineCoords.push({ lat: coor[1], lng: coor[0] });
            });

            const polyline = new google.maps.Polyline(angular.extend(
                this.getOptionsByType('line'),
                { path: polylineCoords }
            ));

            if (this.map.control['getGMap']) polyline.setMap(this.map.control['getGMap']());

            return polyline;
        }

        return new google.maps.Polyline(this.getOptionsByType('line'));
    }

    private createRectangle(overlay) {
        if (overlay.bounds) {
            var rectangleBounds = overlay.bounds;
            var rectangle = new google.maps.Rectangle(angular.extend(this.getOptionsByType('rectangle'), { bounds: rectangleBounds }));

            if (this.map.control['getGMap'])
                rectangle.setMap(this.map.control['getGMap']());
            
            return rectangle;
        }
        return new google.maps.Rectangle(this.getOptionsByType('rectangle'));
    };

    private getOptionsByType(type: string): any {
        switch (type) {
            case 'polygon':
                return _.cloneDeep(angular.extend(this._polygonOptions, this.getDisableOptions()));
            case 'circle':
                return _.cloneDeep(angular.extend(this._circleOptions, this.getDisableOptions()));
            case 'line':
                return _.cloneDeep(angular.extend(this._polylineOptions, this.getDisableOptions()));
            case 'polyline':
                return _.cloneDeep(angular.extend(this._polylineOptions, this.getDisableOptions()));
            case 'marker':
                return _.cloneDeep(angular.extend(this._markerOptions, this.getDisableOptions()));
            case 'rectangle':
                return _.cloneDeep(angular.extend(this._rectangleOptions, this.getDisableOptions()));
        }
    }

    private getDisableOptions() {
        return {
            editable: !this.disabled,
            draggable: !this.disabled
        }
    }

    private setOverlay(overlay, type, fitBounds = true) {
        if (!overlay) return;

        this.clearMap();
        this.currentOverlay = overlay || {};
        this.currentOverlay.type = type;
        switch (type) {
            case 'circle': {
                this.currentOverlay.center_changed = () => {
                    this.onEditOverlay();
                };

                this.currentOverlay.radius_changed = () => {
                    this.onEditOverlay();
                };
                break;
            }

            case 'marker': {
                if (!this.currentOverlay.addListener) return;

                this.currentOverlay.addListener('position_changed', () => {
                    this.onEditOverlay();
                });
                break;
            }

            case 'rectangle': {
                if (!this.currentOverlay.addListener)
                    return;
                this.currentOverlay.addListener('bounds_changed', () => {
                    this.onEditOverlay();
                });
                break;
            }

            default: {
                if (!this.currentOverlay.getPath) return;

                google.maps.event.addListener(this.currentOverlay.getPath(), 'set_at', () => {
                    this.onEditOverlay();
                });

                google.maps.event.addListener(this.currentOverlay.getPath(), 'insert_at', () => {
                    this.onEditOverlay();
                });
            }
        }

        if (fitBounds) this.fitBounds();
    }

    private onEditOverlay() {
        if (this.onEdit) this.onEdit({
            overlay: this.currentOverlay,
            bounds: this.currentOverlay && this.currentOverlay.type === 'rectangle' ? {
                north: this.currentOverlay.getBounds().getNorthEast().lat(),
                east: this.currentOverlay.getBounds().getNorthEast().lng(),
                south: this.currentOverlay.getBounds().getSouthWest().lat(),
                west: this.currentOverlay.getBounds().getSouthWest().lng(),
            } : {},
            type: this.currentOverlay ? this.currentOverlay.type : null,
            path: this.currentOverlay && (this.currentOverlay.type === 'polygon' || this.currentOverlay.type === 'polyline') ? this.currentOverlay.getPath() : [],
            center: this.currentOverlay && this.currentOverlay.type === 'circle' ?
                this.currentOverlay.getCenter() : this.currentOverlay && this.currentOverlay.getPosition && this.currentOverlay.type === 'marker' ? this.currentOverlay.getPosition() : {},
            radius: this.currentOverlay && this.currentOverlay.type === 'circle' ? this.currentOverlay.getRadius() : {}
        });
    }

    public showAction(action) {
        return !this.actionTypes ? true : this.actionTypes.includes(action);
    }

    public get showPanel() {
        return this.showActionPanel === false ? false : true;
    }

    public addCircle() {
        this.drawingManagerOptions.drawingMode = google.maps.drawing.OverlayType.CIRCLE;
    }

    public addPolygon() {
        this.drawingManagerOptions.drawingMode = google.maps.drawing.OverlayType.POLYGON;
    }
    
    public addRectangle() {
        this.drawingManagerOptions.drawingMode = google.maps.drawing.OverlayType.RECTANGLE;
    }

    public addLine() {
        this.drawingManagerOptions.drawingMode = google.maps.drawing.OverlayType.POLYLINE;
    }

    public addMarker() {
        this.drawingManagerOptions.drawingMode = google.maps.drawing.OverlayType.MARKER;
    }

    public clearMap() {
        this.drawingManagerOptions.drawingMode = null;
        if (this.currentOverlay && this.currentOverlay.map) {
            this.currentOverlay.setMap(null);
            this.currentOverlay = null;
            this.onEditOverlay();
        }
    }

}

let config = function (uiGmapGoogleMapApiProvider) {
    uiGmapGoogleMapApiProvider.configure({
        libraries: 'drawing'
    });
};

(() => {
    angular.module('pipMapsEdit')
        .component('pipMapEdit', {
            bindings: MapEditBindings,
            templateUrl: 'edit/MapEdit.html',
            controller: MapEditController,
            controllerAs: '$ctrl'
        })
        .config(config);
})();
