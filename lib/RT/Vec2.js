"use strict";


RT.Vec2 = function( x, y, op ){
	if( op ){
		// assumes x and y are RT.Vec2, and op is one of:
		switch( op ){
			case '-':
				this.x = x.x - y.x;
				this.y = x.y - y.y;
			break;
			case '+':
				this.x = x.x + y.x;
				this.y = x.y + y.y;
			break;
		}		
	}
	else{
		if( ( x != undefined ) && ( y != undefined ) && ( ! ( x instanceof RT.Vec2 ) ) ){
			this.x = parseFloat( x );
			this.y = parseFloat( y );
		}
		else if( ( x != undefined ) && x instanceof RT.Vec2 ){
			this.x = x.x;
			this.y = x.y;
		}
		else if( ( x != undefined ) && ( x.hasOwnProperty( 'x' ) && x.hasOwnProperty( 'y' ) ) ){
			this.x = x.x;
			this.y = x.y;
		}
		else{
			this.x = 0.0;
			this.y = 0.0;
		}
	}
	return( this );
}

RT.Vec2.distance = function( v1, v2 ) {
	var dx = v1.x - v2.x;
	var dy = v1.y - v2.y;
	return( Math.sqrt( dx * dx + dy * dy + 0.000001 ) );
}

RT.Vec2.average = function( v1, v2 ) {
	var dx = ( v1.x + v2.x ) * 0.5;
	var dy = ( v1.y + v2.y ) * 0.5;
	return( new RT.Vec2( dx, dy ) );
}

RT.Vec2.difference = function( v1, v2 ) {
	var dx = v1.x - v2.x;
	var dy = v1.y - v2.y;
	return( new RT.Vec2( dx, dy ) );
}

RT.Vec2.sum = function( v1, v2 ) {
	var dx = v1.x + v2.x;
	var dy = v1.y + v2.y;
	return( new RT.Vec2( dx, dy ) );
}

RT.Vec2.normal = function( v ) {
	// get the normal vector to v
	var n = new RT.Vec2( -v.y, v.x );
	n.normalize();
	return( n );
}

RT.Vec2.normalized = function( v ) {
	// get the normalized vector v
	var n = new RT.Vec2( v.x, v.y );
	n.normalize();
	return( n );
}

RT.Vec2.copy = function( v ) {
	// return a copy of v
	return( new RT.Vec2( v ) );
}

RT.Vec2.lerp = function( v1, v2, factor ){
	// factor lerps this vector to other from 0->1
	var v = new RT.Vec2( v1.x, v1.y );
	v.lerp( v2, factor );
	return( v );
}

RT.Vec2.prototype.toString = function() {
	return( "x:" + this.x + " y:" + this.y );
}

RT.Vec2.prototype.toJSON = function() {
	return( { 'x':this.x, 'y':this.y } );
}

RT.Vec2.prototype.fromJSON = function( object ) {
	this.set( object );
}

RT.Vec2.prototype.clone = function() {
	return( new RT.Vec2( this ) );
}
	
RT.Vec2.prototype.clampMinMax = function( min, max ){
	this.x = this.x < min.x ? min.x : this.x;
	this.x = this.x > max.x ? max.x : this.x;
	this.y = this.y < min.y ? min.y : this.y;
	this.y = this.y > max.y ? max.y : this.y;
	return( this );
}

RT.Vec2.prototype.clampMin = function( min ){
	this.x = this.x < min.x ? min.x : this.x;
	this.y = this.y < min.y ? min.x : this.y;
	return( this );
}

RT.Vec2.prototype.clampMax = function( max ){
	this.x = this.x > max.x ? max.x : this.x;
	this.y = this.y > max.y ? max.y : this.y;
	return( this );
}

RT.Vec2.prototype.set = function( other ){
	if( other === undefined ){
		this.x = 0.0;
		this.y = 0.0;
	}
	else{
		this.x = other.x;
		this.y = other.y;
	}
	return( this );
}

RT.Vec2.prototype.setsca = function( other, factor ){
	this.x = other.x * factor;
	this.y = other.y * factor;
	return( this );
}

RT.Vec2.prototype.lerp = function( other, factor ){
	// factor lerps this vector to other from 0->1
	this.x = ( 1.0 - factor ) * this.x + factor * other.x;
	this.y = ( 1.0 - factor ) * this.y + factor * other.y;
	return( this );
}

RT.Vec2.prototype.cmp = function( v, epsilon ) {
	// equals if smaller than or equal to epsilon
	return( Math.abs( this.hyp() - v.hyp() ) <= epsilon );
}

RT.Vec2.prototype.eq = function( v ) {
	// equals
	return( this.hyp() == v.hyp() );
}

RT.Vec2.prototype.st = function( v ) {
	// smaller than <
	return( this.hyp() < v.hyp() );
}

RT.Vec2.prototype.le = function( v ) {
	// larger than >
	return( this.hyp() > v.hyp() );
}

RT.Vec2.prototype.se = function( v ) {
	// smaller than or equal to 
	return( this.hyp() <= v.hyp() );
}

RT.Vec2.prototype.lt = function( v ) {
	// larger than or equal to 
	return( this.hyp() >= v.hyp() );
}

RT.Vec2.prototype.dec = function( v ) {
	// subtract v from this (decrement)
	this.x -= v.x;
	this.y -= v.y;
	return( this );
}

RT.Vec2.prototype.sub = function( a, b ) {
	// set this to be a - b
	this.x = a.x - b.x;
	this.y = a.y - b.y;
	return( this );
}

RT.Vec2.prototype.inc = function( v ) {
	// add v to this (increment)
	this.x += v.x;
	this.y += v.y;
	return( this );
}

RT.Vec2.prototype.inv = function() {
	// invert
	this.x *= -1.0;
	this.y *= -1.0;
	return( this );
}

RT.Vec2.prototype.ini = function() {
	// initialize
	this.x = 0.0;
	this.y = 0.0;
	return( this );
}

RT.Vec2.prototype.div = function( s ) {
	// divide uniform with s
	this.x /= s;
	this.y /= s;
	return( this );
}

RT.Vec2.prototype.sca = function( s ) {
	// scale uniform with s
	this.x *= s;
	this.y *= s;
	return( this );
}

RT.Vec2.prototype.mul = function( v ) {
	// scale with components of v
	this.x *= v.x;
	this.y *= v.y;
	return( this );
}

RT.Vec2.prototype.incsca = function( v, s ) {
	// increase with v * s
	this.x += v.x * s;
	this.y += v.y * s;
	return( this );
}

RT.Vec2.prototype.decsca = function( v, s ) {
	// decrease with v * s
	this.x -= v.x * s;
	this.y -= v.y * s;
	return( this );
}

RT.Vec2.prototype.dist = function( v ) {
	// the distance from this to v
	var dx = this.x - v.x;
	var dy = this.y - v.y;
	return( Math.sqrt( dx * dx + dy * dy + 0.000001 ) );
}

RT.Vec2.prototype.getlen = function() {
	return( Math.sqrt( this.x * this.x + this.y * this.y + 0.000001 ) );
}

RT.Vec2.prototype.setlen = function( value ) {
	var d = this.getlen();
	if( d > 0.0 ){
		value /= d;
		this.x *= value;
		this.y *= value;
	}
	else{
		this.x = value;
		this.y = 0.0;
	}
	return( this );
}

RT.Vec2.prototype.hyp = function() {
	return( this.x * this.x + this.y * this.y );
}

RT.Vec2.prototype.normalize = function() {
	var hyp = this.x * this.x + this.y * this.y;
	if( hyp <= 0.000001 ){
		// we do some quantum mechanics here, 
		// give a random direction normal back if |this| near zero length
		this.x = Math.random();
		this.y = Math.random();
		hyp = this.x * this.x + this.y * this.y;
	}
	length = Math.sqrt( hyp );
	this.x /= length;
	this.y /= length;
	return( this );
}

RT.Vec2.prototype.maximize = function( maxLength ) {
	length = this.getlen();
	if( length > maxLength ){
		this.x /= length;
		this.y /= length;
		this.x *= maxLength;
		this.y *= maxLength;
	}
	return( this );
}

RT.Vec2.prototype.rotate = function( radians, absolute ) {
	if( ! absolute ){
		var x = this.x;
		var y = this.y;
		var c = Math.cos( radians );
		var s = Math.sin( radians );
		this.x = x * c - y * s;
		this.y = x * s + y * c;
	}
	else{
		// make this vector point in the direction that makes an angle with the x-axis 
		var l = this.getlen();
		this.x = Math.cos( radians ) * l;
		this.y = Math.sin( radians ) * l;
	}
	return( this );
}

RT.Vec2.prototype.perp = function() {
	// make this vector rotate 90 degrees ccw (perpendicular)
	var x = this.x;
	this.x = -this.y;
	this.y = x;
	return( this );
}

RT.Vec2.prototype.abs = function() {
	this.x = Math.abs( this.x );
	this.y = Math.abs( this.y );
	return( this );
}

RT.Vec2.prototype.dot = function( v ) {
	return( this.x * v.x + this.y * v.y );
}

RT.Vec2.prototype.cross = function( v ) {
	return( this.x * v.y - this.y * v.x );
}

RT.Vec2.prototype.angle = function( axis ) {
	if( ! axis ){
		// return the angle with x-axis in radians
		// assumes vector is normalized
		if( this.x < -1.0 || this.x > 1.0 ){
			RT.Error( new RT.Error( RT.Error.INVALID_VALUE ) );
		}
		var a = Math.acos( this.x );
		// if the vector points below the x-axis, take the complemetary angle
		if( this.y < 0.0 ){
			a = 2.0 * Math.PI - a;
		}
		return( a );
	}
	else {
		// assumes axis is a normalized Vec2
		return( this.dot( axis ) * Math.PI );
	}
}

RT.Vec2.prototype.draw = function( context, options ) {
	context.save();
	context.beginPath();
	context.moveTo( this.x + options.radius, this.y );
	context.arc( this.x, this.y, options.radius, 0, Math.TAU );
	context.closePath();

	context.fillStyle = options.fillStyle;
	context.fill();

	context.strokeStyle = options.strokeStyle;
	context.stroke();
	context.restore();
}




