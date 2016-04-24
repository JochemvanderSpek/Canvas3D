"use strict";


RT.KeyboardInterface = function( config ){

	this.createKeyboardInterface = function( context ){
		this.m_context = context;
		this.m_onKeyDownProxy = $.proxy( this.keyDown, this );
		this.m_onKeyUpProxy = $.proxy( this.keyUp, this );

		this.hasKeyboardInterface = true;
	}

	this.initializeKeyboardInterface = function(){
		$( document ).on( 'keydown', this.m_onKeyDownProxy );
		$( document ).on( 'keyup', this.m_onKeyUpProxy );
	}

	this.destroyKeyboardInterface = function(){
		$( document ).off( 'keydown', this.m_onKeyDownProxy );
		$( document ).off( 'keyup', this.m_onKeyUpProxy );
		this.hasKeyboardInterface = false;
	}

	this.keyDown = function( e ){
		var code = ( e.which || e.key || e.keyCode );
		this.onKeyDown( code );
	}

	this.onKeyDown = function( code ){
		// reimplement
	}

	this.keyUp = function( e ){
		var code = ( e.which || e.key || e.keyCode );
		this.onKeyUp( code );
	}

	this.onKeyUp = function( code ){
		// reimplement
	}

	return( this );
};

