"use strict";

/** 
 * usage: create a new ResourceLoader, add resources to load with addResource
 * and fire 'initialize()'. 
 * context: is the context in which all callbacks
 * are called (usually the calling object), including the individual resource callbacks.
 * the loader-level success callback is called only when all resource-level success- 
 * or failcallbacks have been called. The loader-level progress callback is called just 
 * before a resource-level fail- or successcallback.
 * consecutive: if set, the resources are loaded one after another, the next is
 * loaded not before the previous either failed or succeeded
 * ordered: the resource-level callbacks are guaranteed to be fired in the 
 * order that the resources were added to the loader.
  */

RT.ResourceLoader = function( context, callbackSuccess, callbackProgress, callbackFailed, info, consecutive, ordered ){
	// store the callbacks for the loader
	this.m_context = context;
	this.m_callbackSuccess = $.proxy( callbackSuccess, this.m_context );
	this.m_callbackProgress = $.proxy( callbackProgress, this.m_context );
	this.m_callbackFailed = $.proxy( callbackFailed, this.m_context );
	this.m_info = info;
	this.m_consecutive = ( consecutive == undefined ) ? true : consecutive;
	this.m_ordered = ( ordered == undefined ) ? true : ordered;

	// derived info
	this.m_resources = new Array();
	this.m_percentage = 0.0;
	this.m_failedResources = 0;
	this.m_loadedResources = 0;
	this.m_consecutiveIndex = 0;
}

RT.ResourceLoader.prototype.addResource = function( type, url, callbackSuccess, callbackFailed, timeout ) {
	var r = new RT.Resource( type, url, this.m_resources.length, this, this.onSuccess, this.onFailed, timeout );
	this.m_resources.push( { 
		resource : r,
		successCallback : $.proxy( callbackSuccess, this.m_context ),
		failedCallback : $.proxy( callbackFailed, this.m_context ),
		success : false,
		failed : false,
		called : false
	} );
}

RT.ResourceLoader.prototype.initialize = function() {
	if( this.m_resources.length ){
		if( this.m_consecutive ){
			this.loadConsecutive();
		}
		else {
			for( var i = 0; i < this.m_resources.length; i++ ){
				this.m_resources[ i ].resource.initialize();
			}
		}
	}
}

//! loadConsecutive loads the next resource in the array
//! only used when this.m_consecutive is true
RT.ResourceLoader.prototype.loadConsecutive = function() {
	if( this.m_consecutiveIndex < this.m_resources.length ){
		this.m_resources[ this.m_consecutiveIndex ].resource.initialize();
		this.m_consecutiveIndex++;
		return( true );
	}
	return( false );
}

RT.ResourceLoader.prototype.purge = function() {
	this.m_resources = new Array();
	this.m_percentage = 0.0;
	this.m_loadedResources = 0;
	this.m_failedResources = 0;
	this.m_resources.splice( 0, this.m_resources.length );
}

RT.ResourceLoader.prototype.getPercentage = function() {
	return( this.m_percentage );
}

RT.ResourceLoader.prototype.getResources = function() {
	return( this.m_resources );
}

RT.ResourceLoader.prototype.hasFailed = function() {
	return( this.m_failedResources > 0 );
}

RT.ResourceLoader.prototype.onSuccess = function( resource ) {
	if( this.m_consecutive ){
		this.loadConsecutive();
	}

	this.m_resources[ resource.m_id ].success = true;
	this.m_loadedResources++;

	this.calculateProgress();

	this.callNext();

	// check if we're done without fails
	if( this.m_loadedResources == this.m_resources.length ){
		// call the remaining uncalled resources in order
		while( ! this.callNext() );

		if( this.m_callbackSuccess ){
			this.m_callbackSuccess( this );
		}
	}
	else if( this.m_loadedResources + this.m_failedResources == this.m_resources.length ){
		// call the remaining uncalled resources in order
		while( ! this.callNext() );

		if( this.m_callbackFailed ){
			this.m_callbackFailed( this );
		}
	}
}

RT.ResourceLoader.prototype.onFailed = function( resource ) {
	if( this.m_consecutive ){
		this.loadConsecutive();
	}

	this.m_failedResources++;
	this.m_resources[ resource.m_id ].failed = true;

	this.calculateProgress();

	this.callNext();

	if( this.m_loadedResources + this.m_failedResources == this.m_resources.length ){
		// call the remaining uncalled resources in order
		while( ! this.callNext() );

		if( this.m_callbackFailed ){
			this.m_callbackFailed( this );
		}
	}
}

RT.ResourceLoader.prototype.calculateProgress = function() {
	this.m_percentage = 100.0 * ( ( this.m_loadedResources + this.m_failedResources ) / this.m_resources.length );
	if( this.m_callbackProgress ){
		this.m_callbackProgress( this );
	}
}

RT.ResourceLoader.prototype.callNext = function() {
	// we call the resource callbacks in order, find the
	// last of the consecutively loaded resources that has not been called
	for( var i = 0; i < this.m_resources.length; i++ ){
		if( ! this.m_resources[ i ].called ){
			if( this.m_resources[ i ].success ){
				if( this.m_resources[ i ].successCallback ){
					this.m_resources[ i ].successCallback( this.m_resources[ i ].resource );
				}
				// even if there is no callback, we flag this resource as called.
				this.m_resources[ i ].called = true;
			}
			else if( this.m_resources[ i ].failed ){
				if( this.m_resources[ i ].failedCallback ){
					this.m_resources[ i ].failedCallback( this.m_resources[ i ].resource );
				}
				// even if there is no callback, we flag this resource as called.
				this.m_resources[ i ].called = true;
			}
			// only if ordered will we wait for the next iteration
			if( this.m_ordered ){
				return( false );
			}
		}
	}
	return( true );
}
