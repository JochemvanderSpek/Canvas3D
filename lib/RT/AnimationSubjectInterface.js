"use strict";

/**
 implement the Interface as a function that can be called by RT.addInterface (Utils.js)
*/
RT.AnimationSubjectInterface = function(){

	this.createAnimationSubjectInterface = function(){
		this.hasAnimationSubjectInterface = true;
		this.m_lockedAnimationResources = {};
	}

	this.initializeAnimationSubjectInterface = function(){
	}

	this.destroyAnimationSubjectInterface = function(){
		this.hasAnimationSubjectInterface = false;
	}

	this.lockAnimationResource = function( index ){
		this.m_lockedAnimationResources.index = true;
	}

	this.isAnimationResourceLocked = function( index ){
		if( $.type( index ) == 'array' ){
			for( var i = 0; i < index.length; i++ ){
				if( this.m_lockedAnimationResources[ index[ i ] ] === true ){
					return( true );
				}
			}
		}
		else if( $.type( index ) == 'object' ){
			for( var i in index ){
				if( this.m_lockedAnimationResources[ index[ i ] ] === true ){
					return( true );
				}
			}
		}
		else{
			return( this.m_lockedAnimationResources[ index ] === true );
		}
		return( false );
	}

	this.unlockAnimationResource = function( index ){
		if( this.m_lockedAnimationResources.index ){
			delete this.m_lockedAnimationResources.index;
		}
		else{
			RT.Error( 'AnimationSubjectInterface::releaseAnimationResource:try to unlock unlocked resource' );
		}
	}

	this.getLockedAnimationResources = function(){
		return( this.m_lockedAnimationResources );
	}

	this.setAnimationValue = function( index, value ) {
	}

	this.localToGlobal = function( coordinate ) {
		return( coordinate );
	}

	this.localToGlobal = function( coordinate ) {
		return( coordinate );
	}

	return( this );
};
