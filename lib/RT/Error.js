"use strict";




RT.Error = function( type, message ){
	this.m_type = type;
	this.m_message = message;
}

RT.Error.prototype.toString = function() {
	return( "RT.Error: " + this.m_type + " message:" + this.m_message );
}

RT.Error.prototype.toHTML = function() {
	return( "<p>RT.Error: " + this.m_type + "<br>message:" + this.m_message );
}

RT.error = function( error ) {
	if( $.type( error ) == 'string' ){
		error = new RT.Error( RT.Error.GENERIC, error );
	}
	switch( RT.Error.mode ){
		case 'alert':
			RT.errorAlert( error );
			break;
		case 'throw':
			RT.errorThrow( error );
			break;
		case 'layer':
			RT.errorLayer( error );
			break;
		case 'console':
		default:
			RT.trace( error.toString() );
	}
}

RT.errorAlert = function( error ) {
	alert( error.toString() );
}

RT.errorThrow = function( error ) {
	throw( error );
}

RT.errorLayer = function( error ) {
	RT.Error.layer.html( error.toHTML() );
	RT.Error.layer.show();
}

RT.setErrorLayer = function( layer ) {
	RT.Error.layer = layer;
}

RT.setErrorMode = function( mode ) {
	RT.Error.mode = mode;
}

RT.Error.MODE_LAYER					= 'layer';
RT.Error.MODE_THROW					= 'throw';
RT.Error.MODE_ALERT					= 'alert';
RT.Error.MODE_CONSOLE				= 'console';
RT.Error.mode						= RT.Error.MODE_CONSOLE;
RT.Error.layer						= $( '#errorLayer' );

RT.Error.DIVISION_BY_ZERO 			= "Division By Zero";
RT.Error.INVALID_VALUE 				= "Invalid Value";
RT.Error.MISSING_ARGUMENT			= "Missing Argument";
RT.Error.WRONG_TYPE					= "Wrong Type";
RT.Error.MISSING_ITEM				= "Missing Item";
RT.Error.INCOMPLETE_IMPLEMENTATION	= "Incomplete Implementation";
RT.Error.GENERIC					= "Generic";

