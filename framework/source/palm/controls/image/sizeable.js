//* @protected
enyo.sizeableMixin = {
	zoom: 1,
	getClientRect: function() {
		var n = this.hasNode();
		if (n) {
			return n.getBoundingClientRect();
		}
	},
	getZoomRect: function() {
		var r = this.getClientRect();
		return {
			left: 0,
			top: 0,
			width: r.width,
			height: r.height
		}
	},
	centeredZoomStart: function(e) {
		var cRect = this.getClientRect();
		var zRect = this.getZoomRect();
		var s = this.fetchScrollPosition();
		this._zoomStart = {
			scale: e.scale,
			zoom: this.zoom,
			centerX: e.centerX - (cRect.left + zRect.left),
			centerY: e.centerY - (cRect.top + zRect.top),
			scrollX: s.l,
			scrollY: s.t,
			offsetLeft: cRect.left + zRect.left,
			offsetTop: cRect.top + zRect.top,
			zoomOffsetLeft: zRect.left,
			zoomOffsetTop: zRect.top,
			zoomWidth: zRect.width,
			zoomHeight: zRect.height,
			clientWidth: cRect.width,
			clientHeight: cRect.height
		};
	},
	centeredZoomChange: function(e) {
		var gs = this._zoomStart;
		e.scale = e.scale || gs.scale;
		var centerX = (e.centerX - gs.offsetLeft) || gs.centerX;
		var centerY = (e.centerY - gs.offsetTop) || gs.centerY;
		var zs = this.calcScale(e.scale, gs.zoom);
		var ds = zs.scale;
		// this is the offset after scaling
		var x = this.calcScaledOffset(ds, gs.centerX, gs.clientWidth, gs.zoomWidth, gs.zoomOffsetLeft);
		// add the scaled scroll offset
		x += ds * gs.scrollX;
		// now account for the moving center
		x += ds * (gs.centerX - centerX);
		// this is the offset after scaling
		var y = this.calcScaledOffset(ds, gs.centerY, gs.clientHeight, gs.zoomHeight, gs.zoomOffsetTop);
		// add the scaled scroll offset
		y += ds * gs.scrollY;
		// now account for the moving center
		y += ds * (gs.centerY - centerY);
		return {zoom: zs.zoom, x: x, y: y};
	},
	calcScale: function(inScale, inZoom) {
		// round to two decimal places to reduce jitter
		var ds = Math.round(inScale * 100) / 100;
		// note: zoom by the initial gesture zoom multiplied by scale;
		// this ensures we zoom enough to not be annoying.
		var z = inZoom * ds;
		// if scales beyond max zoom, disallow scaling so we simply pan
		// and set scale to total amount we have scaled since start
		if (z > this.getMaxZoom()) {
			ds = this.getMaxZoom() / inZoom;
		}
		// adjust for scales beyond min zoom
		if (z < this.getMinZoom()) {
			ds = this.getMinZoom() / inZoom;
		}
		return {scale: ds, zoom: z};
	},
	calcScaledOffset: function(ds, pt, c, z, os) {
		if ((c - z) < 0 || ((ds - 1) * z / 2) > os) {
			if (z * ds > c) {
				return (ds - 1) * pt - os;
			} else {
				return (ds - 1) * pt + (c - z * ds) / 2;
			}
		} else {
			return (ds - 1) * (pt - z / 2);
		}
	},
	calcScaledCenter: function(pt, ds, s, c, z, cos, zos) {
		pt -= ds * s;
		if ((c - z) < 0 || ((ds - 1) * z / 2) > zos) {
			if (z * ds > c) {
				return (pt + zos) / (ds - 1) + (cos + zos);
			} else {
				return (pt - (c - z * ds) / 2) / (ds - 1) + (cos + zos);
			}
		} else {
			return pt / (ds - 1) + z / 2 + (cos + zos);
		}
	},
	calcZoomCenter: function(inScale, x, y) {
		var cRect = this.getClientRect();
		var zRect = this.getZoomRect();
		var s = this.fetchScrollPosition();
		var zs = this.calcScale(inScale, this.zoom);
		var ds = zs.scale;
		var cx = this.calcScaledCenter(x, ds, s.l, cRect.width, zRect.width, cRect.left, zRect.left);
		var cy = this.calcScaledCenter(y, ds, s.t, cRect.height, zRect.height, cRect.top, zRect.top);
		return {x: cx, y: cy};
	},
	resetZoom: function() {
		// reset zoom to its original value.
		this.setZoom(this.getMinZoom());
	},
	findScroller: function() {
		if (this._scroller) {
			return this._scroller;
		}
		var n = this.hasNode(), c;
		while (n) {
			c = enyo.$[n.id];
			if (c && c instanceof enyo.BasicScroller) {
				return (this._scroller = c);
			}
			n = n.parentNode;
		}
	},
	fetchScrollPosition: function() {
		var p = {t: 0, l: 0};
		var s = this.findScroller();
		if (s) {
			p.l = s.getScrollLeft();
			p.t = s.getScrollTop();
		}
		return p;
	},
	setScrollPosition: function(inX, inY) {
		var s = this.findScroller();
		if (s) {
			s.setScrollTop(inY);
			s.setScrollLeft(inX);
		}
	},
	setScrollPositionDirect: function(inX, inY) {
		var s = this.findScroller();
		if (s) {
			s.setScrollPositionDirect(inX, inY);
		}
	}
};
