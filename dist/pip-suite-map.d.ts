declare module pip.maps {

let google: any;






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
const MapEditBindings: IMapEditBindings;
class actionTypes {
    static clearMap: string;
    static addCircle: string;
    static addRectangle: string;
    static addPolygon: string;
    static addLine: string;
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
    private $element;
    private $scope;
    private $mdConstant;
    private $document;
    private $timeout;
    private uiGmapGoogleMapApi;
    map: {
        control: {};
        options: {
            disableDefaultUI: boolean;
            mapTypeId: string;
            panControl: boolean;
            zoomControl: boolean;
            mapTypeControl: boolean;
            streetViewControl: boolean;
        };
    };
    drawingManagerControl: any;
    drawingManagerOptions: any;
    currentOverlay: any;
    actionTypes: any[];
    showActionPanel: boolean;
    overlay: any;
    mapOptions: any;
    onEdit: Function;
    control: Function;
    disabled: boolean;
    private _circleOptions;
    private _polygonOptions;
    private _polylineOptions;
    private _markerOptions;
    private _rectangleOptions;
    constructor($element: JQuery, $scope: ng.IScope, $mdConstant: any, $document: ng.IDocumentService, $timeout: ng.ITimeoutService, uiGmapGoogleMapApi: any);
    $onDestroy(): void;
    $onChanges(changes: MapEditChanges): void;
    $onInit(): void;
    private fitBounds();
    private convertToGoogleMapOverlay(overlay);
    private createMarker(overlay);
    private createCircle(overlay);
    private createPolygon(overlay);
    private createPolyline(overlay);
    private createRectangle(overlay);
    private getOptionsByType(type);
    private getDisableOptions();
    private setOverlay(overlay, type, fitBounds?);
    private onEditOverlay();
    showAction(action: any): boolean;
    readonly showPanel: boolean;
    addCircle(): void;
    addPolygon(): void;
    addRectangle(): void;
    addLine(): void;
    addMarker(): void;
    clearMap(): void;
}
let config: (uiGmapGoogleMapApiProvider: any) => void;






























}
