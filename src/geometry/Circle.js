/**
 * @classdesc
 * Represents a Circle Geometry, a child class of [maptalks.Polygon]{@link maptalks.Polygon}. <br>
 *     It means it shares all the methods defined in [maptalks.Polygon]{@link maptalks.Polygon} besides some overrided ones.
 * @class
 * @category geometry
 * @extends maptalks.Polygon
 * @mixes maptalks.Geometry.Center
 * @param {maptalks.Coordinate} center - center of the circle
 * @param {Number} radius           - radius of the circle
 * @param {Object} [options=null]   - construct options defined in [maptalks.Circle]{@link maptalks.Circle#options}
 * @example
 * var circle = new maptalks.Circle([100, 0], 1000, {
 *     id : 'circle0'
 * });
 */
maptalks.Circle = maptalks.Polygon.extend(/** @lends maptalks.Circle.prototype */{
    includes:[maptalks.Geometry.Center],

    /**
     * @property {Object} options
     * @property {Number} [options.numberOfShellPoints=60]   - number of shell points when converting the circle to a polygon.
     */
    options:{
        'numberOfShellPoints':60
    },

    initialize:function (coordinates, radius, opts) {
        this._coordinates = new maptalks.Coordinate(coordinates);
        this._radius = radius;
        this._initOptions(opts);
    },

    /**
     * Get radius of the circle
     * @return {Number}
     */
    getRadius:function () {
        return this._radius;
    },

    /**
     * Set a new radius to the circle
     * @param {Number} radius - new radius
     * @return {maptalks.Circle} this
     * @fires maptalks.Circle#shapechange
     */
    setRadius:function (radius) {
        this._radius = radius;
        this.onShapeChanged();
        return this;
    },

    /**
     * Gets the shell of the circle as a polygon, number of the shell points is decided by [options.numberOfShellPoints]{@link maptalks.Circle#options}
     * @return {maptalks.Coordinate[]} - shell coordinates
     */
    getShell:function () {
        var measurer = this._getMeasurer(),
            center = this.getCoordinates(),
            numberOfPoints = this.options['numberOfShellPoints'],
            radius = this.getRadius();
        var shell = [],
            rad, dx, dy;
        for (var i = 0; i < numberOfPoints; i++) {
            rad = (360 * i / numberOfPoints) * Math.PI / 180;
            dx = radius * Math.cos(rad);
            dy = radius * Math.sin(rad);
            var vertex = measurer.locate(center, dx, dy);
            shell.push(vertex);
        }
        return shell;
    },

    /**
     * Circle won't have any holes, always returns null
     * @return {null}
     */
    getHoles:function () {
        return null;
    },

    _containsPoint: function (point, tolerance) {
        var center = this._getCenter2DPoint(),
            size = this.getSize(),
            t = maptalks.Util.isNil(tolerance) ? this._hitTestTolerance() : tolerance;
        return center.distanceTo(point) <= size.width / 2 + t;
    },

    _computeExtent:function (measurer) {
        if (!measurer || !this._coordinates || maptalks.Util.isNil(this._radius)) {
            return null;
        }

        var radius = this._radius;
        var p1 = measurer.locate(this._coordinates, radius, radius);
        var p2 = measurer.locate(this._coordinates, -radius, -radius);
        return new maptalks.Extent(p1, p2);
    },

    _computeGeodesicLength:function () {
        if (maptalks.Util.isNil(this._radius)) {
            return 0;
        }
        return Math.PI * 2 * this._radius;
    },

    _computeGeodesicArea:function () {
        if (maptalks.Util.isNil(this._radius)) {
            return 0;
        }
        return Math.PI * Math.pow(this._radius, 2);
    },

    _exportGeoJSONGeometry: function () {
        var coordinates = maptalks.GeoJSON.toNumberArrays([this.getShell()]);
        return {
            'type' : 'Polygon',
            'coordinates' : coordinates
        };
    },

    _toJSON:function (options) {
        var center = this.getCenter();
        var opts = maptalks.Util.extend({}, options);
        opts.geometry = false;
        var feature = this.toGeoJSON(opts);
        feature['geometry'] = {
            'type' : 'Polygon'
        };
        return {
            'feature' : feature,
            'subType' : 'Circle',
            'coordinates'  : [center.x, center.y],
            'radius'  : this.getRadius()
        };
    }

});

maptalks.Circle.fromJSON = function (json) {
    var feature = json['feature'];
    var circle = new maptalks.Circle(json['coordinates'], json['radius'], json['options']);
    circle.setProperties(feature['properties']);
    return circle;
};
