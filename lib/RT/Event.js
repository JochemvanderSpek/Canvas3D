"use strict";


RT.Event = function( type, caller, data ){
	this.m_type = type;
	this.m_caller = caller;
	this.m_data = data;
}

RT.Event.prototype.getType = function() {
	return( this.m_type );
}

RT.Event.prototype.getCaller = function() {
	return( this.m_caller );
}

RT.Event.prototype.getData = function() {
	return( this.m_data );
}
