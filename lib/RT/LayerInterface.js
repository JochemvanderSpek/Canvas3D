"use strict";

RT.LayerInterface = function(){

	this.createLayerInterface = function( parentElement, classes, prepend ){

		this.m_layerID = RT.generateUniqueID();
		this.m_baseLayer = $( '<div>' );
		this.m_baseLayer.attr( 'id', this.m_layerID + 'baseLayer' ); 
		this.m_baseLayer.attr( 'class', classes );

		if( parentElement ){
			if( ! prepend ){
				parentElement.append( this.m_baseLayer );
			}
			else{
				parentElement.prepend( this.m_baseLayer );
			}
		}
		this.m_layerRect = { left:undefined, top:undefined, width:undefined, height:undefined };
		this.m_visible = true;
		this.hasLayerInterface = true;
	}

	this.initializeLayerInterface = function() {
		this.syncLayerToStyle();
	}

	this.destroyLayerInterface = function() {
		this.m_baseLayer.remove();
		this.hasLayerInterface = false;
	}

	this.getDistanceToLayerBorder = function( x, y ) {
		// assume global coords
		var rect = this.getLayerRect( true );
		// take the largest value from x,y to left, right, bottom and top
		var left = -( x - rect.left );
		var right = x - ( rect.left + rect.width );
		var bottom = y - ( rect.top + rect.height );
		var top = -( y - rect.top );
		return( Math.max( left, right, bottom, top ) );
	}

	this.syncLayerToStyle = function() {
		var coords = this.m_baseLayer.position();
		if( coords ){
			this.m_layerRect.left = parseFloat( coords.left );
			this.m_layerRect.top = parseFloat( coords.top );
		}
		this.m_layerRect.width = parseFloat( this.m_baseLayer.outerWidth() );
		this.m_layerRect.height = parseFloat( this.m_baseLayer.outerHeight() );
	}

	this.getBaseLayer = function( layer ) {
		return( this.m_baseLayer );
	}

	this.printLayer = function( indent ) {
		var spaces = "";
		if( indent ){
			for( var i = 0; i < indent; i++ ){
				spaces += " ";
			}
		}
		else{
			indent = 0;
		}
		var ret = { 'l':this.m_layerRect.left, 't':this.m_layerRect.top, 'w':this.m_layerRect.width, 'h':this.m_layerRect.height };
		console.log( spaces + this.m_layerID + " : " + JSON.stringify( ret ) + " -> " + JSON.stringify( this.getCenter() ) );
	}

	this.getLayerZIndex = function() {
		return( this.m_baseLayer.css( 'z-index' ) );
	}

	this.setLayerZIndex = function( index ) {
		this.m_baseLayer.css( { 'z-index':index } );
	}

	this.toggleLayerVisibility = function() {
		this.setLayerVisibility( ! this.m_visible );
	}

	this.setLayerVisibility = function( state ) {
		if( state ){
			this.m_baseLayer.show();
		}
		else{
			this.m_baseLayer.hide();
		}
		this.m_visible = state;
	}

	this.getLayerVisibility = function() {
		return( this.m_visible );
	}

	this.move = function( x, y ) {
		this.m_layerRect.left += x;
		this.m_layerRect.top += y;
		this.m_baseLayer.css( { 'left':this.m_layerRect.left + 'px', 'top':this.m_layerRect.top + 'px' } );
	}

	this.setLayerRect = function( left, top, width, height, global ) {
		this.m_layerRect.left = left;
		this.m_layerRect.top = top;
		this.m_layerRect.width = width;
		this.m_layerRect.height = height;
		if( global && this.m_baseLayer.parent() ){
			var offset = this.m_baseLayer.parent().offset();
			if( offset ){
				this.m_layerRect.left -= offset.left;
				this.m_layerRect.top -= offset.top;
			}
		}
		this.m_baseLayer.css( { 'left':left + 'px', 'top':top + 'px', 'width':width + 'px', 'height':height + 'px', 'position':'absolute' } );
	}

	this.getLayerRect = function( global ) {
		this.syncLayerToStyle();
		var left = this.m_layerRect.left;
		var top = this.m_layerRect.top;
		if( global && this.m_baseLayer.parent() ){
			var offset = this.m_baseLayer.parent().offset();
			if( offset ){
				left += offset.left;
				top += offset.top;
			}
		}
		return( { 'left':left, 'top':top, 'width':this.m_layerRect.width, 'height':this.m_layerRect.height } );
	}

	this.globalToLocal = function( global ) {
		var local = { x:global.x, y:global.y };
		var rect = this.getLayerRect( true ); // layer in global coords
		local.x -= rect.left;
		local.y -= rect.top;
		return( local );
	}

	this.localToGlobal = function( local ) {
		var global = { x:local.x, y:local.y };
		var rect = this.getLayerRect( true ); // layer in global coords
		global.x += rect.left;
		global.y += rect.top;
		return( global );
	}

	this.setLayerCenter = function( x, y, global ) {
		var w = parseInt( this.m_baseLayer.width() );
		var h = parseInt( this.m_baseLayer.height() );
		if( isNaN( w ) || isNaN( h ) ){
			w = this.m_layerRect.width;
			h = this.m_layerRect.height;
		}
		this.m_layerRect.left = parseInt( x - w / 2 );
		this.m_layerRect.top = parseInt( y - h / 2 );
		if( global && this.m_baseLayer.parent() ){
			var offset = this.m_baseLayer.parent().offset();
			if( offset ){
				this.m_layerRect.left -= offset.left;
				this.m_layerRect.top -= offset.top;
//				console.log( 'offset:' + this.m_layerRect.left + '/' + this.m_layerRect.top );
			}
		}
		this.m_baseLayer.css( { 'left':this.m_layerRect.left+'px', 'top':this.m_layerRect.top+'px', 'position':'absolute' } );
	}

	this.setLayerLeftBottom = function( x, y, global ) {
		var w = parseInt( this.m_baseLayer.width() );
		var h = parseInt( this.m_baseLayer.height() );
		if( isNaN( w ) || isNaN( h ) ){
			w = this.m_layerRect.width;
			h = this.m_layerRect.height;
		}
		this.m_layerRect.left = parseInt( x );
		this.m_layerRect.top = parseInt( y - h );
		if( global && this.m_baseLayer.parent() ){
			var offset = this.m_baseLayer.parent().offset();
			if( offset ){
				this.m_layerRect.left -= offset.left;
				this.m_layerRect.top -= offset.top;
//				console.log( 'offset:' + this.m_layerRect.left + '/' + this.m_layerRect.top );
			}
		}
		this.m_baseLayer.css( { 'left':this.m_layerRect.left+'px', 'top':this.m_layerRect.top+'px', 'position':'absolute' } );
	}

	this.getLayerCenter = function( global ) {
		this.syncLayerToStyle();
		var w = this.m_layerRect.width;
		var h = this.m_layerRect.height;
		var l = this.m_layerRect.left;
		var t = this.m_layerRect.top;
		if( global && this.m_baseLayer.parent() ){
			var offset = this.m_baseLayer.parent().offset();
			if( offset ){
				l += offset.left;
				t += offset.top;
			}
		}
		return( { x:( l + ( w / 2 ) ), y:( t + ( h / 2 ) ) } );
	}

	return( this );
}
