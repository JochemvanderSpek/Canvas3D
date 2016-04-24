"use strict";

RT.PropertyEditView = function( parentNode, object, property ){
	this.createEventDispatcherInterface();
	this.createLayerInterface( parentNode, 'PropertyEditView' );
	this.m_object = object;
	this.m_property = property;
	this.m_editElement = undefined;
	this.m_nameLabel = undefined;
	this.m_valueElement = undefined;

	return( this );
}

RT.addInterface( RT.PropertyEditView, RT.LayerInterface );
RT.addInterface( RT.PropertyEditView, RT.EventDispatcherInterface );

RT.PropertyEditView.prototype.initialize = function() {
	this.initializeEventDispatcherInterface();
	this.initializeLayerInterface();

	this.syncViewToProperty();

    this.m_initialized = true;
	this.dispatchEvent( new RT.Event( 'initialize', this, undefined ) );
}

RT.PropertyEditView.prototype.getProperty = function() {
	return( this.m_property );
}

RT.PropertyEditView.prototype.setProperty = function( p ) {
	this.m_property = p;
}

RT.PropertyEditView.prototype.getValue = function() {
	return( this.m_object[ this.m_property ] );
}

RT.PropertyEditView.prototype.setValue = function( value ) {
	this.m_object[ this.m_property ] = value;
	this.syncViewToProperty();
}

RT.PropertyEditView.prototype.syncPropertyToView = function( e ) {
	// reimplement in subclass
}

RT.PropertyEditView.prototype.syncViewToProperty = function( e ) {
	// reimplement in subclass
}

RT.PropertyEditView.prototype.setEnabled = function( state ) {
	// reimplement in subclass
}

RT.PropertyEditView.prototype.destroy = function(){
	this.dispatchEvent( new RT.Event( 'destroy', this, undefined ) );
  	this.destroyEventDispatcherInterface();
	this.destroyLayerInterface();
}
