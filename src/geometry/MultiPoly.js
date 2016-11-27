/**
 * Common methods for MultiPoint, MultiLineString and MultiPolygon
 * @mixin maptalks.Geometry.MultiPoly
 */
maptalks.Geometry.MultiPoly = {
    /**
     * Get coordinates of the collection
     * @return {maptalks.Coordinate[]|maptalks.Coordinate[][]|maptalks.Coordinate[][][]} coordinates
     */
    getCoordinates:function () {
        var coordinates = [];
        var geometries = this.getGeometries();
        if (!maptalks.Util.isArray(geometries)) {
            return null;
        }
        for (var i = 0, len = geometries.length; i < len; i++) {
            coordinates.push(geometries[i].getCoordinates());
        }
        return coordinates;
    },

    /**
     * Set new coordinates to the collection
     * @param {maptalks.Coordinate[]|maptalks.Coordinate[][]|maptalks.Coordinate[][][]} coordinates
     * @returns {maptalks.Geometry} this
     * @fires maptalk.Geometry#shapechange
     */
    setCoordinates:function (coordinates) {
        if (maptalks.Util.isArrayHasData(coordinates)) {
            var geometries = [];
            for (var i = 0, len = coordinates.length; i < len; i++) {
                var p = new this.GeometryType(coordinates[i], this.config());
                geometries.push(p);
            }
            this.setGeometries(geometries);
        } else {
            this.setGeometries([]);
        }
        return this;
    },

    _initData:function (data) {
        if (maptalks.Util.isArrayHasData(data)) {
            if (data[0] instanceof this.GeometryType) {
                this.setGeometries(data);
            } else {
                this.setCoordinates(data);
            }
        }
    },

    _checkGeometries:function (geometries) {
        if (maptalks.Util.isArray(geometries)) {
            for (var i = 0, len = geometries.length; i < len; i++) {
                if (geometries[i] && !(geometries[i] instanceof this.GeometryType)) {
                    throw new Error('Geometry is not valid for collection, index:' + i);
                }
            }
        }
        return geometries;
    },

    //override _exportGeoJSONGeometry in GeometryCollection
    _exportGeoJSONGeometry:function () {
        var points = this.getCoordinates();
        var coordinates = maptalks.GeoJSON.toNumberArrays(points);
        return {
            'type':this.getType(),
            'coordinates': coordinates
        };
    }
};
