"use strict";


RT.Renderer = function( parentElement, x, y, width, height, global, classes ){

	this.createLayerInterface( parentElement, classes );
	this.createEventDispatcherInterface();

	var parent = $( '#' + parentElement.id );
	var offset = parent.offset() || {};
	if( ! x ){
		x = offset.x || 0;
	}
	if( ! y ){
		y = offset.y || 0;
	}
	if( ! width ){
		width = parent.width() || 800;
	}
	if( ! height ){
		height = parent.height() || 600;
	}

	this.setLayerRect( x, y, width, height, global );

	this.m_viewportScale = 1.0;
	this.m_layerRect.width = width;
	this.m_layerRect.height = height;
	this.m_viewportWidth = this.m_layerRect.width;
	this.m_viewportHeight = this.m_layerRect.height;
	this.m_screenCenterX = this.m_viewportWidth / 2.0;
	this.m_screenCenterY = this.m_viewportHeight / 2.0;
	this.m_viewportCenterX = this.m_screenCenterX;
	this.m_viewportCenterY = this.m_screenCenterY;
	this.m_nextViewportCenterX = this.m_viewportCenterX;
	this.m_nextViewportCenterY = this.m_viewportCenterY;
	this.m_nextViewportScale = this.m_viewportScale;
	this.m_previousViewportCenterX = this.m_viewportCenterX;
	this.m_previousViewportCenterY = this.m_viewportCenterY;
	this.m_previousViewportScale = this.m_viewportScale;
	this.m_dragViewport = false;
	this.m_constrainViewport = true;
	this.m_isAnimating = false;
	this.m_animationLERPFactor = 0.8;
	this.m_animationValue = 0.0;

	if( $.timer ){
		this.m_doubleClickTimer = $.timer();
		this.m_doubleClickTimer.set( { action: $.proxy( this.doubleClickTimeOut, this ), time : 200, autostart : false } );
	}
}

RT.addInterface( RT.Renderer, RT.EventDispatcherInterface );
RT.addInterface( RT.Renderer, RT.LayerInterface );

RT.Renderer.prototype.initialize = function() {
	this.initializeEventDispatcherInterface();
	this.initializeLayerInterface();

	if( this.m_canvas ){
		this.m_canvas.clear();
		// TODO rescale on initialize
	}
	else{
		//! @TODO switch canvases depending on canvas/svg/div, etc.
		this.m_canvas = Raphael( this.m_baseLayer, this.m_layerRect.width, this.m_layerRect.height );
	}

	this.getBaseLayer().bind( 'mousedown', $.proxy( this.onCanvasMouseDown, this ) );
	this.getBaseLayer().bind( 'mousemove', $.proxy( this.onCanvasMouseMove, this ) );
	this.getBaseLayer().bind( 'mouseup', $.proxy( this.onCanvasMouseUp, this ) );

	this.calculateViewport();

    this.m_initialized = true;
	this.dispatchEvent( new RT.Event( 'initialize', this, undefined ) );
}

RT.Renderer.prototype.resize = function( w, h ) {
	this.setLayerRect( 0, 0, w, h );
    this.m_canvas.setSize( w, h );

	this.m_viewportWidth = this.m_layerRect.width;
	this.m_viewportHeight = this.m_layerRect.height;
	this.m_screenCenterX = this.m_viewportWidth / 2.0;
	this.m_screenCenterY = this.m_viewportHeight / 2.0;

	if( ! this.m_isAnimating ){
		this.calculateViewport();
	}
}

RT.Renderer.prototype.globalToLocal = function( global ) {
	var local = { x:global.x, y:global.y };
	// first transform to local wrt the layer
	var rect = this.getLayerRect( true ); // layer in global coords
	local.x -= rect.left;
	local.y -= rect.top;
	// then get the point relative to the viewport, scaled by the viewportscale
	var vpl = ( this.m_viewportCenterX - 0.5 * this.m_viewportWidth );
	var vpt = ( this.m_viewportCenterY - 0.5 * this.m_viewportHeight );
	local.x = vpl + local.x * this.m_viewportScale;
	local.y = vpt + local.y * this.m_viewportScale;
	return( local );
}

RT.Renderer.prototype.localToGlobal = function( local ) {
	var global = { x:local.x, y:local.y };
	// first transform to global wrt the viewport
	var vpl = ( this.m_viewportCenterX - 0.5 * this.m_viewportWidth );
	var vpt = ( this.m_viewportCenterY - 0.5 * this.m_viewportHeight );
	global.x -= vpl;
	global.y -= vpt;
	global.x /= this.m_viewportScale;
	global.y /= this.m_viewportScale;
	// then make global wrt the layer
	var rect = this.getLayerRect( true ); // layer in global coords
	global.x += rect.left;
	global.y += rect.top;
	return( global );
}

RT.Renderer.prototype.frameElement = function( element, offset, extraZoom ) {
	var newBox = element.getBBox( true );
	this.m_nextViewportCenterX = newBox.x + newBox.width / 2.0 + ( offset ? offset.x : 0 );
	this.m_nextViewportCenterY = newBox.y + newBox.height / 2.0 + ( offset ? offset.y : 0 );

	var sx = newBox.width / this.m_layerRect.width;
	var sy = newBox.height / this.m_layerRect.height;
	var s = Math.max( ( 5.0 / this.m_layerRect.width ), Math.max( sx, sy ) );

	this.m_nextViewportScale = ( 1.0 + ( extraZoom || 0.0 ) ) * s;

	this.setKeyFrame();

	this.dispatchEvent( new RT.Event( 'changeviewportscale', this, this.m_nextViewportScale ) );

	if( ! this.m_isAnimating ){
		this.calculateViewport();
	}
}

RT.Renderer.prototype.setKeyFrame = function() {
	this.m_animationValue = 0.0;
	this.m_previousViewportCenterX = this.m_viewportCenterX;
	this.m_previousViewportCenterY = this.m_viewportCenterY;
	this.m_previousViewportScale = this.m_viewportScale;
}

RT.Renderer.prototype.zoom = function( x, y, factor ) {
	var local = this.globalToLocal( { 'x':x, 'y':y } );
	this.m_nextViewportCenterX = local.x;
	this.m_nextViewportCenterY = local.y;

	var sx = factor;
	var sy = factor;
	var s = Math.max( ( 5.0 / this.m_layerRect.width ), Math.max( sx, sy ) );

	this.m_nextViewportScale = s;

	this.setKeyFrame();

	this.dispatchEvent( new RT.Event( 'changeviewportscale', this, this.m_nextViewportScale ) );

	if( ! this.m_isAnimating ){
		this.calculateViewport();
	}
}

RT.Renderer.prototype.saveViewport = function() {
	this.m_viewportCenterXSaved = this.m_viewportCenterX;
	this.m_viewportCenterYSaved = this.m_viewportCenterY;
	this.m_viewportScaleSaved = this.m_viewportScale;
//	console.log( 'save to : ' + this.m_viewportScale );
}

RT.Renderer.prototype.restoreViewport = function() {
	this.m_nextViewportCenterX = this.m_viewportCenterXSaved;
	this.m_nextViewportCenterY = this.m_viewportCenterYSaved;
	if( this.m_viewportCenterYSaved > this.m_nextViewportScale ){
		this.m_nextViewportScale = this.m_viewportScaleSaved;
	}
	this.setKeyFrame();

	this.dispatchEvent( new RT.Event( 'changeviewportscale', this, this.m_nextViewportScale ) );
	if( ! this.m_isAnimating ){
		this.calculateViewport();
	}
//	console.log( 'restore to : ' + this.m_nextViewportScale + ' current scale : ' + this.m_viewportScale );
}

RT.Renderer.prototype.onCanvasMouseDown = function( e ) {
	this.dispatchEvent( new RT.Event( 'mousedown', this, e ) );
}

RT.Renderer.prototype.onCanvasMouseMove = function( e ) {
	this.dispatchEvent( new RT.Event( 'mousemove', this, e ) );
}

RT.Renderer.prototype.doubleClickTimeOut = function( e ) {
	this.m_doubleClickTimer.stop();
}

RT.Renderer.prototype.onCanvasMouseUp = function( e ) {
	this.dispatchEvent( new RT.Event( 'mouseup', this, e ) );

	if( this.m_doubleClickTimer ){
		if( this.m_doubleClickTimer.isActive ){
			// doubleClick
			this.dispatchEvent( new RT.Event( 'doubleclick', this, e ) );
		}
		else{
			this.m_doubleClickTimer.play( true );
		}
	}
}

RT.Renderer.prototype.destroy = function() {
	if( this.m_canvas ){
		this.m_canvas.clear();
		this.m_canvas.remove();
	}
	this.destroyEventDispatcherInterface();
	this.destroyLayerInterface();
}

RT.Renderer.prototype.getElement = function( id ) {
	return( this.m_canvas.getById( id ) );
}

RT.Renderer.prototype.getScreenSize = function() {
	return( { width:this.m_layerRect.width, height:this.m_layerRect.height } );
}

RT.Renderer.prototype.rect = function( x, y, w, h, r ) {
	if( ! this.m_canvas ){
		var err;
	}
	return( this.m_canvas.rect( x, y, w, h, r ) );
}

RT.Renderer.prototype.clear = function() {
	return( this.m_canvas.clear() );
}

RT.Renderer.prototype.circle = function( x, y, r ) {
	return( this.m_canvas.circle( x, y, r ) );
}

RT.Renderer.prototype.path = function( path ) {
	return( this.m_canvas.path( path ) );
}

RT.Renderer.prototype.setScale = function( scale ) {
	this.m_nextViewportScale = scale;

	this.m_animationValue = 0.0;

	if( ! this.m_isAnimating ){
		this.calculateViewport();
	}
}

RT.Renderer.prototype.getScale = function() {
	return( this.m_nextViewportScale );
}

RT.Renderer.prototype.calculateViewport = function() {

	var dx = ( this.m_viewportCenterX - this.m_nextViewportCenterX );
	var dy = ( this.m_viewportCenterY - this.m_nextViewportCenterY );
	var ds = ( this.m_viewportScale - this.m_nextViewportScale );
	if( Math.sqrt( dx * dx + dy * dy + ( 100.0 * ds * ds ) + 0.0000001 ) > 0.01 ){
		this.dispatchEvent( new RT.Event( 'startanimating', this ) );
		this.m_isAnimating = true;
	}
	else{
		this.m_viewportCenterX = this.m_nextViewportCenterX;
		this.m_viewportCenterY = this.m_nextViewportCenterY;
		this.m_viewportScale  = this.m_nextViewportScale;
		this.dispatchEvent( new RT.Event( 'stopanimating', this ) );
		this.m_isAnimating = false;
	}
	this.dispatchEvent( new RT.Event( 'animate', this ) );

	var ads = Math.abs( ds );
	var scaleLerp = this.m_animationLERPFactor + 0.5 * ( 1.0 - this.m_animationLERPFactor ) * ( ( ads < 0.1 ) ? ( 10.0 * ( 0.1 - ads ) ) : 0.0 );

	this.m_viewportCenterX = this.m_animationLERPFactor * this.m_viewportCenterX + ( 1.0 - this.m_animationLERPFactor ) * this.m_nextViewportCenterX;
	this.m_viewportCenterY = this.m_animationLERPFactor * this.m_viewportCenterY + ( 1.0 - this.m_animationLERPFactor ) * this.m_nextViewportCenterY;
	this.m_viewportScale = scaleLerp * this.m_viewportScale + ( 1.0 - scaleLerp ) * this.m_nextViewportScale;

	this.m_viewportWidth = this.m_layerRect.width * this.m_viewportScale;
	this.m_viewportHeight = this.m_layerRect.height * this.m_viewportScale;

	this.constrainViewport();

	this.m_canvas.setViewBox( this.m_viewportCenterX - 0.5 * this.m_viewportWidth, this.m_viewportCenterY - 0.5 * this.m_viewportHeight, this.m_viewportWidth, this.m_viewportHeight, false );
}

RT.Renderer.prototype.constrainViewport = function() {
	if( this.m_constrainViewport ){

		var d = ( this.m_viewportCenterX - 0.5 * this.m_viewportWidth );
		if( d < 0.0 ){
			this.m_viewportCenterX = 0.5 * this.m_viewportWidth;
		}
		d = ( this.m_viewportCenterX + 0.5 * this.m_viewportWidth );
		if( d > this.m_layerRect.width ){
			this.m_viewportCenterX = this.m_layerRect.width - 0.5 * this.m_viewportWidth;
		}
		d = ( this.m_viewportCenterY - 0.5 * this.m_viewportHeight );
		if( d < 0.0 ){
			this.m_viewportCenterY = 0.5 * this.m_viewportHeight;
		}
		d = ( this.m_viewportCenterY + 0.5 * this.m_viewportHeight );
		if( d > this.m_layerRect.height ){
			this.m_viewportCenterY = this.m_layerRect.height - 0.5 * this.m_viewportHeight;
		}
		d = ( this.m_nextViewportCenterX - 0.5 * ( this.m_nextViewportScale * this.m_layerRect.width ) );
		if( d < 0.0 ){
			this.m_nextViewportCenterX = 0.5 * ( this.m_nextViewportScale * this.m_layerRect.width );
		}
		d = ( this.m_nextViewportCenterX + 0.5 * ( this.m_nextViewportScale * this.m_layerRect.width ) );
		if( d > this.m_layerRect.width ){
			this.m_nextViewportCenterX = this.m_layerRect.width - 0.5 * ( this.m_nextViewportScale * this.m_layerRect.width );
		}
		d = ( this.m_nextViewportCenterY - 0.5 * ( this.m_nextViewportScale * this.m_layerRect.height ) );
		if( d < 0.0 ){
			this.m_nextViewportCenterY = 0.5 * ( this.m_nextViewportScale * this.m_layerRect.height );
		}
		d = ( this.m_nextViewportCenterY + 0.5 * ( this.m_nextViewportScale * this.m_layerRect.height ) );
		if( d > this.m_layerRect.height ){
			this.m_nextViewportCenterY = this.m_layerRect.height - 0.5 * ( this.m_nextViewportScale * this.m_layerRect.height );
		}
	}
}

RT.Renderer.prototype.setBlockUserInteraction = function( state ) {
	this.m_blockUserInteraction = state;
}

RT.Renderer.prototype.startDrag = function( curMouseX, curMouseY ) {
	this.m_dragViewport = true;
	this.m_curMouseX = curMouseX;
	this.m_curMouseY = curMouseY;
	this.m_prevMouseX = this.m_curMouseX;
	this.m_prevMouseY = this.m_curMouseY;
}

RT.Renderer.prototype.drag = function( curMouseX, curMouseY ) {

	this.m_curMouseX = curMouseX;
	this.m_curMouseY = curMouseY;

	if( ! this.m_blockUserInteraction ){
		if( this.m_dragViewport && this.m_prevMouseX && this.m_prevMouseY ){
			var dx = ( this.m_prevMouseX - this.m_curMouseX ) * this.m_nextViewportScale;
			var dy = ( this.m_prevMouseY - this.m_curMouseY ) * this.m_nextViewportScale;
			this.offsetViewport( dx, dy );
			this.dispatchEvent( new RT.Event( 'drag', this ) );
		}

	}
	this.m_prevMouseX = this.m_curMouseX;
	this.m_prevMouseY = this.m_curMouseY;
}

RT.Renderer.prototype.stopDrag = function( curMouseX, curMouseY ) {
	this.m_dragViewport = false;
	this.m_curMouseX = curMouseX;
	this.m_curMouseY = curMouseY;
	this.m_prevMouseX = this.m_curMouseX;
	this.m_prevMouseY = this.m_curMouseY;
}

RT.Renderer.prototype.offsetViewport = function( x, y ) {
	if( ! this.m_blockUserInteraction ){
		this.m_nextViewportCenterX += x;
		this.m_nextViewportCenterY += y;

		this.setKeyFrame();

		if( ! this.m_isAnimating ){
			this.calculateViewport();
		}
	}
}
