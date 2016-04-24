"use strict";


RT.VerletChain = function(){
	this.createEventDispatcherInterface();
	this.m_startPosition = new RT.Vec2();
	this.m_endPosition = new RT.Vec2();
	this.m_numLinks = 10;
	this.m_constant = 0.8;

	this.m_joints = new Array();
	this.m_constraints = new Array();
	return( this );
}

RT.addInterface( RT.VerletChain, RT.EventDispatcherInterface );

RT.VerletChain.prototype.initialize = function() {

	this.initializeEventDispatcherInterface();

	for( var i = 0; i < this.m_numLinks; i++ ){

		var f = i / ( this.m_numLinks - 1 );
		var lerp = RT.Vec2.lerp( this.m_startPosition, this.m_endPosition, f );

		var joint = new RT.Verlet2( lerp, false );
		joint.setRestitution( 0.9 );
		joint.setGravity( { 'x':0.0, 'y':0.7 } );
		joint.setRestitution( 0.4 );
		joint.setDrag( 0.01 );
		joint.initialize();
		this.m_joints.push( joint );
		if( i ){
			var cns = new RT.SpringConstraint( this.m_joints[ i - 1 ], this.m_joints[ i ] );
			cns.setConstant( this.m_constant );
			cns.initialize();
			this.m_constraints.push( cns );
		}
	}

	this.m_initialized = true;
	this.dispatchEvent( new RT.Event( 'initialize', this, undefined ) );
}

RT.VerletChain.prototype.update = function() {
	for( var i = 0; i < this.m_joints.length; i++ ){
		this.m_joints[ i ].update();
	}
	for( var i = 0; i < this.m_constraints.length; i++ ){
		this.m_constraints[ i ].update();
	}
}

RT.VerletChain.prototype.setStartPosition = function( p ) {
	this.m_startPosition.set( p );
}

RT.VerletChain.prototype.getStartPosition = function( p ) {
	return( this.m_startPosition );
}

RT.VerletChain.prototype.setEndPosition = function( p ) {
	this.m_endPosition.set( p );
}

RT.VerletChain.prototype.getEndPosition = function( p ) {
	return( this.m_endPosition );
}

RT.VerletChain.prototype.setEndPosition = function( p ) {
	this.m_endPosition.set( p );
}

RT.VerletChain.prototype.getEndPosition = function( p ) {
	return( this.m_endPosition );
}

RT.VerletChain.prototype.getFirstJoint = function() {
	return( this.m_joints[ 0 ] );
}

RT.VerletChain.prototype.getLastJoint = function() {
	return( this.m_joints[ this.m_joints.length - 1 ] );
}

RT.VerletChain.prototype.setNumLinks = function( n ) {
	this.m_numLinks = n;
}

RT.VerletChain.prototype.getNumLinks = function() {
	return( this.m_numLinks );
}

RT.VerletChain.prototype.setConstant = function( n ) {
	this.m_constant = n;
}

RT.VerletChain.prototype.getConstant = function() {
	return( this.m_constant );
}

RT.VerletChain.prototype.draw = function( context, options ) {
	if( options.Verlet2 ){
		for( var i = 0; i < this.m_joints.length; i++ ){
			this.m_joints[ i ].draw( context, options.Verlet2 );
		}
	}
	if( options.SpringConstraint ){
		for( var i = 0; i < this.m_constraints.length; i++ ){
			this.m_constraints[ i ].draw( context, options.SpringConstraint );
		}
	}
}

RT.VerletChain.prototype.destroy = function() {
	this.dispatchEvent( new RT.Event( 'destroy', this, undefined ) );
  	this.destroyEventDispatcherInterface();
}
