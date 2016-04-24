"use strict";


RT.FlockViewController = function( parentElement, name, flock ){
	if( ! flock ){
		throw( new RT.Error( RT.Error.WRONG_TYPE, "RT.FlockViewController needs a Flock to view" ) );
	}

	this.m_flock = flock;
	this.m_name = name;

	var baseLayer = document.createElement( 'div' ); 
	baseLayer.setAttribute( 'id', name + 'baseLayer' ); 
	baseLayer.setAttribute( 'class', 'FlockViewController' ); 
	parentElement.appendChild( baseLayer );

	var newdiv = document.createElement( 'div' );
	newdiv.setAttribute( 'id', name + 'player' ); 
	newdiv.setAttribute( 'class', 'slider' ); 
	baseLayer.appendChild( newdiv );
/*
	newdiv = document.createElement( 'div' );
	newdiv.setAttribute( 'id', name + 'ball' ); 
	newdiv.setAttribute( 'class', 'slider' ); 
	baseLayer.appendChild( newdiv );

	newdiv = document.createElement( 'div' );
	newdiv.setAttribute( 'id', name + 'banana' ); 
	newdiv.setAttribute( 'class', 'slider' ); 
	baseLayer.appendChild( newdiv );
*/
	$( '#' + name + 'player' ).slider();
	$( '#' + name + 'player' ).on( "slide", $.proxy( this.onSlide, this ) );

//	$( '#' + name + 'ball' ).slider();
//	$( '#' + name + 'ball' ).on( "slide", $.proxy( this.onSlide, this ) );

//	$( '#' + name + 'banana' ).slider();
//	$( '#' + name + 'banana' ).on( "slide", $.proxy( this.onSlide, this ) );
}

RT.FlockViewController.prototype.initialize = function() {
}

RT.FlockViewController.prototype.update = function(){

}

RT.FlockViewController.prototype.draw = function( ctx ){
}


RT.FlockViewController.prototype.onSlide = function( ui ){
	var v = $( '#' + ui.currentTarget.id ).slider( "option", "value" ) / 100.0;
	if( v < 0.05 ){
		v = 0.00;
	}

	if( ui.currentTarget.id == this.m_name + "player" ){
		this.m_flock.m_moveToPlayer = v * 0.3;
	}
	else if( ui.currentTarget.id == this.m_name + "ball" ){
		this.m_flock.m_moveToBall = v * 0.3;
	}
	else if( ui.currentTarget.id == this.m_name + "banana" ){
		this.m_flock.m_moveToBanana = v * 0.3;
	}
}
