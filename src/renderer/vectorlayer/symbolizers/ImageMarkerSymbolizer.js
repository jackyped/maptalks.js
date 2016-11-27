maptalks.symbolizer.ImageMarkerSymbolizer = maptalks.symbolizer.PointSymbolizer.extend({

    initialize:function (symbol, geometry, painter) {
        this.symbol = symbol;
        this.geometry = geometry;
        this.painter = painter;
        this.style = this._defineStyle(this.translate());
    },


    symbolize:function (ctx, resources) {
        var style = this.style;
        if (style['markerWidth'] === 0 || style['markerHeight'] === 0 || style['markerOpacity'] === 0) {
            return;
        }
        var cookedPoints = this._getRenderContainerPoints();
        if (!maptalks.Util.isArrayHasData(cookedPoints)) {
            return;
        }

        var img = this._getImage(resources);
        if (!img) {
            if (!maptalks.Browser.phantomjs && console) {
                console.warn('no img found for ' + (this.style['markerFile'] || this._url[0]));
            }
            return;
        }
        this._prepareContext(ctx);
        var width = style['markerWidth'];
        var height = style['markerHeight'];
        if (!maptalks.Util.isNumber(width) || !maptalks.Util.isNumber(height)) {
            width = img.width;
            height = img.height;
            style['markerWidth'] = width;
            style['markerHeight'] = height;
            var imgURL = [style['markerFile'], style['markerWidth'], style['markerHeight']];
            if (!resources.isResourceLoaded(imgURL)) {
                resources.addResource(imgURL, img);
            }
            var painter = this.getPainter();
            if (!painter.isSpriting()) {
                painter.removeCache();
            }
        }
        var alpha;
        if (!(this instanceof maptalks.symbolizer.VectorPathMarkerSymbolizer) &&
            maptalks.Util.isNumber(style['markerOpacity']) && style['markerOpacity'] < 1)  {
            alpha = ctx.globalAlpha;
            ctx.globalAlpha *= style['markerOpacity'];
        }
        var p;
        for (var i = 0, len = cookedPoints.length; i < len; i++) {
            p = cookedPoints[i];
            var origin = this._rotate(ctx, p, this._getRotationAt(i));
            if (origin) {
                p = origin;
            }
            //图片定位到中心底部
            maptalks.Canvas.image(ctx, img,
                p.x - width / 2,
                p.y - height,
                width, height);
            if (origin) {
                ctx.restore();
            }
        }
        if (alpha !== undefined) {
            ctx.globalAlpha = alpha;
        }
    },

    _getImage:function (resources) {
        var img = !resources ? null : resources.getImage([this.style['markerFile'], this.style['markerWidth'], this.style['markerHeight']]);
        return img;
    },

    getPlacement:function () {
        return this.symbol['markerPlacement'];
    },

    getRotation: function () {
        var r = this.style['markerRotation'];
        if (!maptalks.Util.isNumber(r)) {
            return null;
        }
        //to radian
        return r * Math.PI / 180;
    },

    getDxDy:function () {
        var s = this.style;
        var dx = s['markerDx'] || 0,
            dy = s['markerDy'] || 0;
        return new maptalks.Point(dx, dy);
    },

    getMarkerExtent:function (resources) {
        var url = this.style['markerFile'],
            img = resources ? resources.getImage(url) : null;
        var width = this.style['markerWidth'] || (img ? img.width : 0),
            height = this.style['markerHeight'] || (img ? img.height : 0);
        var dxdy = this.getDxDy();
        return new maptalks.PointExtent(dxdy.add(-width / 2, 0), dxdy.add(width / 2, -height));
    },

    translate:function () {
        var s = this.symbol;
        return {
            'markerFile'    : s['markerFile'],
            'markerOpacity' : maptalks.Util.getValueOrDefault(s['markerOpacity'], 1),
            'markerWidth'   : maptalks.Util.getValueOrDefault(s['markerWidth'], null),
            'markerHeight'  : maptalks.Util.getValueOrDefault(s['markerHeight'], null),
            'markerDx'      : maptalks.Util.getValueOrDefault(s['markerDx'], 0),
            'markerDy'      : maptalks.Util.getValueOrDefault(s['markerDy'], 0)
        };
    }
});


maptalks.symbolizer.ImageMarkerSymbolizer.test = function (symbol) {
    if (!symbol) {
        return false;
    }
    if (!maptalks.Util.isNil(symbol['markerFile'])) {
        return true;
    }
    return false;
};
