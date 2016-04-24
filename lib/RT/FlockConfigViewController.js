"use strict";


RT.FlockConfigViewController = function( parentElement, name, config ){
	if( ! config ){
		config = new RT.Flock.Config();
	}
	else if( config.type != "RT.Flock.Config" ){
		throw( new RT.Error( RT.Error.WRONG_TYPE, "RT.Flock needs either an RT.Flock.Config, or no argument at all." ) );
	}

	var baseLayer = document.createElement( 'div' ); 
	baseLayer.setAttribute( 'id', name + 'baseLayer' ); 
	baseLayer.setAttribute( 'class', 'FlockConfigViewController' ); 
	parentElement.appendChild( baseLayer );

	var newdiv = document.createElement( 'div' ); 
	newdiv.setAttribute( 'id', name + 'slider1' ); 
	newdiv.setAttribute( 'class', 'slider' ); 
	baseLayer.appendChild( newdiv );

	$( '#' + name + 'slider1' ).slider();
	$( '#' + name + 'slider1' ).on( "slide", $.proxy( this.onSlide, this ) );
}

RT.FlockConfigViewController.prototype.initialize = function() {
}

RT.FlockConfigViewController.prototype.update = function(){

}

RT.FlockConfigViewController.prototype.draw = function( ctx ){
}


RT.FlockConfigViewController.prototype.onSlide = function( ui ){
	console.log( "yay" );
}
