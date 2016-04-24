"use strict";

RT.PropertyIndicatorView = function( parentNode, object, property ){
	this.createEventDispatcherInterface();
	this.createLayerInterface( parentNode, 'PropertyIndicatorView' );
	this.m_object = object;
	this.m_property = property;
	this.m_indicatorLayer = undefined;
	this.m_nameLabel = undefined;
	this.m_valueLabel = undefined;

	return( this );
}

RT.addInterface( RT.PropertyIndicatorView, RT.LayerInterface );
RT.addInterface( RT.PropertyIndicatorView, RT.EventDispatcherInterface );

RT.PropertyIndicatorView.prototype.initialize = function() {
	this.initializeEventDispatcherInterface();
	this.initializeLayerInterface();

	this.syncViewToProperty();

    this.m_initialized = true;
	this.dispatchEvent( new RT.Event( 'initialize', this, undefined ) );
}

RT.PropertyIndicatorView.prototype.getProperty = function() {
	return( this.m_property );
}

RT.PropertyIndicatorView.prototype.setProperty = function( p ) {
	this.m_property = p;
}

RT.PropertyIndicatorView.prototype.getValue = function() {
	return( this.m_object[ this.m_property ] );
}

RT.PropertyIndicatorView.prototype.setValue = function( value ) {
	this.m_object[ this.m_property ] = value;
	this.syncViewToProperty();
}

RT.PropertyIndicatorView.prototype.syncPropertyToView = function( e ) {
	// reimplement in subclass
}

RT.PropertyIndicatorView.prototype.syncViewToProperty = function( e ) {
	// reimplement in subclass
}

RT.PropertyIndicatorView.prototype.destroy = function(){
	this.dispatchEvent( new RT.Event( 'destroy', this, undefined ) );
  	this.destroyEventDispatcherInterface();
	this.destroyLayerInterface();
}
