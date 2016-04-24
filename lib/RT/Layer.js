"use strict";


RT.Layer = function( parentElement, classes ){
	this.createLayerInterface( parentElement, classes );
	this.createEventDispatcherInterface();
}

RT.addInterface( RT.Layer, RT.EventDispatcherInterface );
RT.addInterface( RT.Layer, RT.LayerInterface );

RT.Layer.prototype.initialize = function() {
	this.initializeEventDispatcherInterface();
	this.initializeLayerInterface();

    this.m_initialized = true;
	this.dispatchEvent( new RT.Event( 'initialize', this, undefined ) );
}

RT.Layer.prototype.destroy = function() {
	this.destroyEventDispatcherInterface();
	this.destroyLayerInterface();
}
