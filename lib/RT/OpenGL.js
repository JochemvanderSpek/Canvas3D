"use strict";


RT.OpenGL = {};

RT.OpenGL.s_canvas = {};
RT.OpenGL.s_context = {};

RT.OpenGL.addCanvas = function( name, canvas ){
	this.s_canvas[ name ] = canvas;
	this.s_context[ name ] = null;

	try {
		this.s_context[ name ] = canvas[ 0 ].getContext( 'webgl' ) || canvas[ 0 ].getContext( 'experimental-webgl' );
	}
	catch( e ){
		RT.error( 'An error occured creating the OpenGL context' );
	}

	if( ! this.s_context[ name ] ){
		RT.error( 'Unable to initialize WebGL. Your browser may not support it.' );
	}
}

RT.OpenGL.getCanvas = function( name ){
	return( this.s_canvas[ name ] );
}

RT.OpenGL.getContext = function( name ){
	return( this.s_context[ name ] );
}
