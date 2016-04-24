"use strict";

RT.Flock = function( position ){
	this.createEventDispatcherInterface();

	this.m_position = position.clone() || new RT.Vec2();
	this.m_size = 100.0;
	this.m_initialSpread = 50.0;
	this.m_moveToCenter = 0.1;
	this.m_alignMotion = 0.1;
	this.m_alignSpeed = 0.1;
	this.m_brownianMotion = 0.1;
	this.m_distanceWeighting = 1.0;
	this.m_velocity = 20.0;
	this.m_maxDistance = 500.0;
	this.m_drag = 0.0;

	this.m_gravityCenters = new Array();
}

RT.addInterface( RT.Flock, RT.EventDispatcherInterface );

RT.Flock.prototype.initialize = function() {
	this.initializeEventDispatcherInterface();

	this.m_elements = new Array();
	for( var i = 0; i < this.m_size; i++ ){
		var newPos = new RT.Vec2( { x:1.0, y:0.0 } );
		var r = ( 2.0 * Math.random() - 1.0 ) * Math.TAU;
		newPos.rotate( r );
		newPos.sca( Math.random() * this.m_initialSpread );
		newPos.inc( this.m_position );

		// create the flock member as a Verlet2
		this.m_elements.push( [ new RT.Vec2( newPos ), new RT.Vec2( newPos ) ] );
	}
}

RT.Flock.prototype.toJSON = function(){
	var object = {};
	object.size = this.m_size;
	object.position = this.m_position.clone();
	object.initialSpread = this.m_initialSpread;
	object.moveToCenter = this.m_moveToCenter;
	object.gravityCenters = RT.clone( this.m_gravityCenters );
	object.brownianMotion = this.m_brownianMotion;
	object.distanceWeighting = this.m_distanceWeighting;
	object.velocity = this.m_velocity;
	object.maxDistance = this.m_maxDistance;
	return( object );
}

RT.Flock.prototype.fromJSON = function( object ){
	if( object.size ){ 
		this.m_size = object.size;
	}
	if( object.position !== undefined ){ 
		this.m_position = RT.clone( object.position );
	}
	if( object.initialSpread !== undefined ){ 
		this.m_initialSpread = object.initialSpread;
	}
	if( object.moveToCenter !== undefined ){ 
		this.m_moveToCenter = object.moveToCenter;
	}
	if( object.gravityCenters !== undefined ){ 
		this.m_gravityCenters = RT.clone( object.gravityCenters );
	}
	if( object.brownianMotion !== undefined ){ 
		this.m_brownianMotion = object.brownianMotion;
	}
	if( object.distanceWeighting !== undefined ){ 
		this.m_distanceWeighting = object.distanceWeighting;
	}
	if( object.velocity !== undefined ){ 
		this.m_velocity = object.velocity;
	}
	if( object.maxDistance !== undefined ){ 
		this.m_maxDistance = object.maxDistance;
	}
	this.initialize();
	this.dispatchEvent( new RT.Event( 'changed', this, undefined ) );
}

RT.Flock.prototype.createGravityCenter = function( position, weight ){
	var center = { 'position':position, 'weight':weight };
	this.m_gravityCenters.push( center );
	return( center );
}

RT.Flock.prototype.getElements = function(){
	return( this.m_elements );
}

RT.Flock.prototype.update = function(){

	// weighted averages reduce to simple summed averages
	// when the neighbourhood is infinity, so the calculation
	// can be done as an aggregate, rather than calculating
	// the weight of each member to each member.
	this.m_position.set();
	for( var i = 0; i < this.m_elements.length; i++ ){
		this.m_position.inc( this.m_elements[ i ][ 0 ] );
	}
	this.m_position.div( this.m_elements.length );

	for( var i = 0; i < this.m_elements.length; i++ ){
		var Evi = RT.Vec2.difference( this.m_elements[ i ][ 0 ], this.m_elements[ i ][ 1 ] );
		Evi.normalize();
		var r = RT.Vec2.difference( this.m_position, this.m_elements[ i ][ 0 ] );
		var distanceFactor = ( 1.0 - this.m_distanceWeighting ) + this.m_distanceWeighting * Math.min( Math.max( 0.0, ( r.getlen() / this.m_maxDistance ) ), 1.0 );

		r.normalize();
		// apply force toward center
		Evi.lerp( r, this.m_moveToCenter * distanceFactor );
		// add brownian motion
		Evi.rotate( this.m_brownianMotion * ( 2.0 * Math.random() - 1.0 ) * Math.TAU );

		// move toward gravity centers
		for( var j = 0; j < this.m_gravityCenters.length; j++ ){
			var center = this.m_gravityCenters[ j ];
			if( center.weight > 0.0 ){
				r = RT.Vec2.difference( center.position, this.m_elements[ i ][ 0 ] );
				center.distance = r.getlen();
				var distanceFactor = ( 1.0 - this.m_distanceWeighting ) + this.m_distanceWeighting * Math.min( Math.max( 0.0, ( center.distance / this.m_maxDistance ) ), 1.0 );
				Evi.lerp( r, center.weight * distanceFactor );
			}
		}

		// set the length of the new velocity to speed Edi
		Evi.setlen( this.m_velocity );
		// apply the velocity
		this.m_elements[ i ][ 1 ].set( this.m_elements[ i ][ 0 ] );
		this.m_elements[ i ][ 0 ].inc( Evi );
	}
}

RT.Flock.prototype.draw = function( context, options ){
	var vec = options.Vec2;
	if( vec === undefined ){
		vec = { 'fillStyle':'rgba( 128, 0, 0, 0.5 )', 'strokeStyle':'rgba( 255, 0, 0, 0.8 )', 'radius':3.0 };
	}
	for( var i = 0; i < this.m_elements.length; i++ ){
		this.m_elements[ i ][ 0 ].draw( context, vec );
	}
	if( options.Center ){
		// @TODO parseColor
		var radius = options.Center.radius || 10.0;
		context.beginPath();
		context.moveTo( this.m_position.x + radius, this.m_position.y );
		context.arc( this.m_position.x, this.m_position.y, radius, 0, Math.TAU );
		context.closePath();

		context.fillStyle = 'rgba( ' + options.Center.r + ', ' + options.Center.g + ', ' + options.Center.b + ', ' + this.m_moveToCenter + ' )';
		context.fill();
		context.strokeStyle = 'rgba( ' + options.Center.r + ', ' + options.Center.g + ', ' + options.Center.b + ', 1.0 )';
		context.stroke();
	}
	if( options.GravityCenter ){
		for( var j = 0; j < this.m_gravityCenters.length; j++ ){
			var radius = options.GravityCenter.radius || 10.0;
			var center = this.m_gravityCenters[ j ];
			context.beginPath();
			context.moveTo( center.position.x + radius, center.position.y );
			context.arc( center.position.x, center.position.y, radius, 0, Math.TAU );
			context.closePath();

			context.fillStyle = 'rgba( ' + options.GravityCenter.r + ', ' + options.GravityCenter.g + ', ' + options.GravityCenter.b + ', ' + center.weight + ' )';
			context.fill();

			context.strokeStyle = 'rgba( ' + options.GravityCenter.r + ', ' + options.GravityCenter.g + ', ' + options.GravityCenter.b + ', 1.0 )';
			context.stroke();
		}
	}
}

RT.Flock.prototype.destroy = function(){
	this.dispatchEvent( new RT.Event( 'destroy', this, undefined ) );
  	this.destroyEventDispatcherInterface();
}

