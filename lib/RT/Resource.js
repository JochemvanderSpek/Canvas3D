"use strict";


/**
 * A Resource is loaded when initialized. The context is the JS context in which
 * the success and fail callbacks are called (usually the ResourceLoader)
 * the loaded object (be it JSON, an image tag, or other) is stored in the m_data property
 */

RT.Resource = function( type, url, id, context, callbackSuccess, callbackFailed, timeout ){
	this.m_type = type;
	this.m_url = url;
	this.m_id = id;
	this.m_timeout = timeout || 10000;
	this.m_statusText = "ok";
	this.m_callbackSuccess = $.proxy( callbackSuccess, context );
	this.m_callbackFailed = $.proxy( callbackFailed, context );
}

RT.Resource.JSON 	= "JSON";
RT.Resource.IMAGE 	= "IMAGE";
RT.Resource.AUDIO 	= "AUDIO";

RT.Resource.prototype.initialize = function() {
	var success = $.proxy( this.onSuccess, this );
	var failedAJAX = $.proxy( this.onFailedAJAX, this );
	var failedGeneric = $.proxy( this.onFailedGeneric, this );
	switch( this.m_type ){
		case RT.Resource.JSON:
			$.ajax( {
			  url: this.m_url,
			  dataType: 'json',
			  timeout: this.m_timeout
			} )
			.done( success )
			.fail( failedAJAX );
		break;
		case RT.Resource.IMAGE:
			this.m_data = $( '<img/>' ).error( failedGeneric ).load( success ).attr( { 'src': this.m_url } );	
		break;		
		case RT.Resource.AUDIO:
			this.m_data = $( '<audio/>' ).error( failedGeneric ).load( success ).attr( { 'src': this.m_url } );			
		break;
	}
}

RT.Resource.prototype.onSuccess = function( data ) {
	switch( this.m_type ){
		case RT.Resource.JSON:
			this.m_data = data;
			break;
		case RT.Resource.IMAGE:
			break;
		case RT.Resource.AUDIO:
			break;
	}
	this.m_callbackSuccess( this );
}

RT.Resource.prototype.getData = function() {
	return( this.m_data );
}

RT.Resource.prototype.getType = function(){
	return( this.m_type );
}	

RT.Resource.prototype.getUrl = function(){
	return( this.m_url );
}	

RT.Resource.prototype.getId = function(){
	return( this.m_id );
}	

RT.Resource.prototype.getTimeout = function(){
	return( this.m_timeout );
}	

RT.Resource.prototype.getStatusText = function(){
	return( this.m_statusText );
}	

RT.Resource.prototype.getCallbackSuccess = function(){
	return( this.m_callbackSuccess );
}	

RT.Resource.prototype.getCallbackFailed = function(){
	return( this.m_callbackFailed );
}	

RT.Resource.prototype.onFailedAJAX = function( event ) {
	this.m_statusText = event.statusText;
	this.m_callbackFailed( this );
}

RT.Resource.prototype.onFailedGeneric = function() {
	this.m_statusText = "generic fail";
	this.m_callbackFailed( this );
}
