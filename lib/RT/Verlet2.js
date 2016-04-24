"use strict";


RT.Verlet2 = function( position, fixed, cellSpace, bounds ){
	this.createCellInterface( cellSpace );
	this.createEventDispatcherInterface();

	this.m_cur = new RT.Vec2( position );
	this.m_prev = new RT.Vec2( position );
	this.m_drag = 0.0;
	this.m_restitution = 0.9;
	this.m_friction = 0.8;
	this.m_gravity = new RT.Vec2( 0.0, 0.0 );
	this.m_feelGravity = true;
	this.m_limitVelocity = cellSpace ? true : false;
	this.m_animator = undefined;
	if( cellSpace ){
		var half = cellSpace.getHalfCellSize();
		this.m_maxVelocity = Math.min( half.x, half.y ) / 2.0;
	}
	else {
		this.m_maxVelocity = 0.0;
	}
	this.m_fixed = ( ( fixed == undefined ) ? false : fixed );

	return( this );
}

RT.addInterface( RT.Verlet2, RT.CellInterface );
RT.addInterface( RT.Verlet2, RT.EventDispatcherInterface );

RT.Verlet2.prototype.initialize = function(){
	this.initializeEventDispatcherInterface();
	this.initializeCellInterface();

	if( this.m_cellSpace ){
		this.m_cellSpace.register( this );
	}
}

RT.Verlet2.prototype.toJSON = function() {
	var object = {};

	object.cur = this.m_cur.clone();
	object.prev = this.m_prev.clone();
	object.drag = this.m_drag;
	object.restitution = this.m_restitution;
	object.friction = this.m_friction;
	object.gravity = this.m_gravity;
	object.feelGravity = this.m_feelGravity;
	object.limitVelocity = this.m_limitVelocity;
	object.maxVelocity = this.m_maxVelocity;
	object.fixed = this.m_fixed;

	return( object );
}

RT.Verlet2.prototype.fromJSON = function( object ) {
	if( object ){
		this.m_cur.set( object.cur );
		this.m_prev.set( object.prev );
		this.m_drag = object.drag;
		this.m_restitution = object.restitution;
		this.m_friction = object.friction;
		this.m_gravity = object.gravity;
		this.m_feelGravity = object.feelGravity;
		this.m_limitVelocity = object.limitVelocity;
		this.m_maxVelocity = object.maxVelocity;
		this.m_fixed = object.fixed;

		this.initialize();
	}
}

// required for cell interface
RT.Verlet2.prototype.getPosition = function() {
	return( this.m_cur );
}

// required for cell interface
RT.Verlet2.prototype.getAABB = function() {
	// @TODO 
	return( this.m_aabb );
}

RT.Verlet2.prototype.update = function(){
	// this is a verlet integration scheme,
	// we use the original Verlet for now
	// with a timestep of 1.0.
	
	// original:
	// xi+1 = xi + (xi - xi-1) + a * dt * dt
	// time-corrected verlet:
	// xi+1 = xi + (xi - xi-1) * (dti / dti-1) + a * dti * dti

	// if drag is 100%, just move cpos to ppos and return.
	if( this.m_fixed || this.m_drag >= 1.0 ){
		this.push();
		if( this.m_cellSpace ){
			this.m_cellSpace.register( this );
		}
		return;
	}

	if( this.m_feelGravity ){
		this.m_cur.inc( this.m_gravity );
	}

	// limit the velocity so we dont cross cells
	this.limitVelocity();
	var vel = RT.Vec2.difference( this.m_cur, this.m_prev );

	// reduce velocity by drag (so no danger of exceeding limit)
	if( this.m_drag > 0.0 ){
		vel.sca( 1.0 - this.m_drag );
		// limit the current position 
		this.m_cur.set( this.m_prev ).inc( vel );
	}

	// collide if we have a cellspace
	if( this.m_cellSpace ){
		var result = this.m_cellSpace.collide( this );
		if( result.collide ){
			this.m_cur.set( result.position );
			// calculate the velocity
			vel = RT.Vec2.difference( this.m_cur, this.m_prev );
			// decompose into components along and perp to the collision normal
			var t = RT.Vec2.normal( result.normal );
			var dx = t.dot( vel );
			var dy = result.normal.dot( vel );
			// apply friction tangentially
			dx *= this.m_friction;
			// and reflection and restitution
			dy *= -this.m_restitution;
			// reconstruct the velocity vector
			vel.ini().incsca( t, dx ).incsca( result.normal, dy );
		}
	}

	// store the current position
	this.push();

	// and step
	this.m_cur.inc( vel );

	if( isNaN( this.m_cur.x ) || isNaN( this.m_cur.y ) ){
		RT.error( 'Verlet2 value is NaN' );
	}
	if( ! isFinite( this.m_cur.x ) || ! isFinite( this.m_cur.y ) ){
		RT.error( 'Verlet2 value is not finite' );
	}

	if( this.m_cellSpace ){
		this.m_cellSpace.register( this );
	}

}

RT.Verlet2.prototype.setFixed = function( state ){
	this.m_fixed = state;
}

RT.Verlet2.prototype.getFixed = function(){
	return( this.m_fixed );
}

RT.Verlet2.prototype.setGravity = function( v ){
	this.m_gravity.set( v );
}

RT.Verlet2.prototype.getGravity = function(){
	return( this.m_gravity );
}

RT.Verlet2.prototype.setFeelGravity = function( state ){
	this.m_feelGravity = state;
}

RT.Verlet2.prototype.getFeelGravity = function(){
	return( this.m_feelGravity );
}

RT.Verlet2.prototype.move = function( delta ){
	if( ! this.m_fixed ){
		this.m_cur.x += delta.x;
		this.m_cur.y += delta.y;
	}
}

RT.Verlet2.prototype.limitVelocity = function(){
	if( this.m_limitVelocity && this.m_maxVelocity > 0.0 ){
		var v = RT.Vec2.difference( this.m_cur, this.m_prev );
		var h = v.hyp();
		if( h > this.m_maxVelocity * this.m_maxVelocity ){
			h = Math.sqrt( h );
			v.x /= h;
			v.y /= h;
			v.x *= this.m_maxVelocity;
			v.y *= this.m_maxVelocity;
			this.m_cur.x = this.m_prev.x + v.x;
			this.m_cur.y = this.m_prev.y + v.y;
		}
	}
}



RT.Verlet2.prototype.moveTo = function( position, keepVelocity ){
	if( ! this.m_fixed ){
		if( keepVelocity ){
			var v = this.getVelocity();
		}
		this.m_cur.x = position.x;
		this.m_cur.y = position.y;
		if( keepVelocity ){
			this.setVelocity( v );
		}
	}
}

RT.Verlet2.prototype.moveTowards = function( position, maxVelocity ){
	if( ! this.m_fixed ){
		var d = RT.Vec2.difference( position, this.m_cur );
		d.maximize( maxVelocity );
		this.m_cur.inc( d );
	}
}

RT.Verlet2.prototype.moveToAndStop = function( position ){
	if( ! this.m_fixed ){
		this.moveTo( position );
		this.push();
	}
}

RT.Verlet2.prototype.displace = function( delta ){
	if( ! this.m_fixed ){
		this.m_cur.x += delta.x;
		this.m_cur.y += delta.y;
		this.m_prev.x += delta.x;
		this.m_prev.y += delta.y;
	}
}

RT.Verlet2.prototype.getCurPos = function() {
	return( this.m_cur );
}

RT.Verlet2.prototype.getPrevPos = function() {
	return( this.m_prev );
}

RT.Verlet2.prototype.setCurPos = function( v ) {
	if( ! this.m_fixed ){
		this.m_cur = v;
	}
}

RT.Verlet2.prototype.setPrevPos = function( v ) {
	if( ! this.m_fixed ){
		this.m_prev = v;
	}
}

RT.Verlet2.prototype.getVelocityVector = function( ) {
	return( RT.Vec2.difference( this.m_cur, this.m_prev ) );
}

RT.Verlet2.prototype.setVelocityVector = function( v ) {
	if( ! this.m_fixed ){
		this.m_prev.x = this.m_cur.x - v.x;
		this.m_prev.y = this.m_cur.y - v.y;
	}
}

RT.Verlet2.prototype.getVelocity = function( ) {
	return( this.m_cur.dist( this.m_prev ) );
}

RT.Verlet2.prototype.setVelocity = function( s ) {
	if( ! this.m_fixed ){
		var difference = RT.Vec2.difference( this.m_cur, this.m_prev );
		difference.setlen( s );
		this.m_prev.x = this.m_cur.x - difference.x;
		this.m_prev.y = this.m_cur.y - difference.y;
	}
}

RT.Verlet2.prototype.addVelocity = function( v ) {
	if( ! this.m_fixed ){
		this.m_prev.x -= v.x;
		this.m_prev.y -= v.y;
	}
}

RT.Verlet2.prototype.setDrag = function( drag ) {
	this.m_drag = drag;
}

RT.Verlet2.prototype.getDrag = function( ) {
	return( this.m_drag );
}

RT.Verlet2.prototype.setRestitution = function( s ) {
	this.m_restitution = s;
}

RT.Verlet2.prototype.getRestitution = function( ) {
	return( this.m_restitution );
}

RT.Verlet2.prototype.setFriction = function( s ) {
	this.m_friction = s;
}

RT.Verlet2.prototype.getFriction = function( ) {
	return( this.m_friction );
}

RT.Verlet2.prototype.draw = function( context, options ) {
	var radius = 5.0;
	var fillStyle = 'rgb( 255, 255, 0)';
	var strokeStyle = 'rgb( 255, 0, 0)';
	if( options ){
		if( options.radius !== undefined ){
			radius = options.radius;
		}
		if( options.fillStyle !== undefined ){
			fillStyle = options.fillStyle;
		}
		if( options.strokeStyle !== undefined ){
			strokeStyle = options.strokeStyle;
		}
	}

	context.save();
	context.beginPath();
	context.moveTo( this.m_cur.x + radius, this.m_cur.y );
	context.arc( this.m_cur.x, this.m_cur.y, radius, 0, Math.TAU );
	context.closePath();

	context.fillStyle = fillStyle;
	context.fill();

	context.strokeStyle = strokeStyle;
	context.stroke();
	context.restore();
}

RT.Verlet2.prototype.push = function( ) {
	this.m_prev.set( this.m_cur );
}

RT.Verlet2.prototype.pop = function( ) {
	this.set( this.m_prev );
}

RT.Verlet2.prototype.destroy = function( ) {
	this.dispatchEvent( new RT.Event( 'destroy', this, undefined ) );
  	this.destroyEventDispatcherInterface();
	this.destroyCellInterface();
}

