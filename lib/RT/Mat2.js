"use strict";

RT.Mat2 = function( transformArray, isOrtho ){
	if( transformArray ){
		this.m_x = new RT.Vec2( { 'x':transformArray[ 0 ], 'y':transformArray[ 1 ] } );
		this.m_y = new RT.Vec2( { 'x':transformArray[ 2 ], 'y':transformArray[ 3 ] } );
		this.m_t = new RT.Vec2( { 'x':transformArray[ 4 ], 'y':transformArray[ 5 ] } );
	}
	else{
		this.m_x = new RT.Vec2();
		this.m_y = new RT.Vec2();
		this.m_t = new RT.Vec2();
		this.identity();
	}
	if( isOrtho === undefined ){
		this.m_isOrtho = true;
	}
	else{
		this.m_isOrtho = isOrtho;
	}
	return( this );
}

RT.Mat2.prototype.identity = function() {
	this.m_x.set( { 'x':1.0, 'y':0.0 } );
	this.m_y.set( { 'x':0.0, 'y':1.0 } );
	this.m_t.set( { 'x':0.0, 'y':0.0 } );
};

RT.Mat2.prototype.multiply = function( matrix ) {
	var m11 = this.m_x.x * matrix.this.m_x.x + this.m_y.x * matrix.this.m_x.y;
	var m12 = this.m_x.y * matrix.this.m_x.x + this.m_y.y * matrix.this.m_x.y;

	var m21 = this.m_x.x * matrix.this.m_y.x + this.m_y.x * matrix.this.m_y.y;
	var m22 = this.m_x.y * matrix.this.m_y.x + this.m_y.y * matrix.this.m_y.y;

	var dx = this.m_x.x * matrix.this.m_t.x + this.m_y.x * matrix.this.m_t.y + this.m_t.x;
	var dy = this.m_x.y * matrix.this.m_t.x + this.m_y.y * matrix.this.m_t.y + this.m_t.y;

	this.m_x.x = m11;
	this.m_x.y = m12;
	this.m_y.x = m21;
	this.m_y.y = m22;
	this.m_t.x = dx;
	this.m_t.y = dy;
}

RT.Mat2.prototype.transform = function( vec2 ) {
	var p = this.m_t.clone();
	p.incsca( this.m_x, vec2.x );
	p.incsca( this.m_y, vec2.y );
	return( p );
}

RT.Mat2.prototype.invert = function() {
	var d = ( this.m_x.x * this.m_y.y - this.m_x.y * this.m_y.x );
	if( d != 0.0 ){
		d = 1.0 / d;
		var m0 = this.m_y.y * d;
		var m1 = -this.m_x.y * d;
		var m2 = -this.m_y.x * d;
		var m3 = this.m_x.x * d;
		var m4 = d * ( this.m_y.x * this.m_t.y - this.m_y.y * this.m_t.x );
		var m5 = d * ( this.m_x.y * this.m_t.x - this.m_x.x * this.m_t.y );

		this.m_x.x = m0;
		this.m_x.y = m1;
		this.m_y.x = m2;
		this.m_y.y = m3;
		this.m_t.x = m4;
		this.m_t.y = m5;
	}
	else{
		RT.Error( new RT.Error( RT.Error.DIVISION_BY_ZERO ) );
	}
};

RT.Mat2.prototype.inverse = function() {
	var d = ( this.m_x.x * this.m_y.y - this.m_x.y * this.m_y.x );
	if( d != 0.0 ){
		d = 1.0 / d;
		var m0 = this.m_y.y * d;
		var m1 = -this.m_x.y * d;
		var m2 = -this.m_y.x * d;
		var m3 = this.m_x.x * d;
		var m4 = d * ( this.m_y.x * this.m_t.y - this.m_y.y * this.m_t.x );
		var m5 = d * ( this.m_x.y * this.m_t.x - this.m_x.x * this.m_t.y );
		return( new RT.Mat2( [ m0, m1, m2, m3 ,m4, m5 ] ) );
	}
	else{
		RT.Error( new RT.Error( RT.Error.DIVISION_BY_ZERO ) );
	}
};

RT.Mat2.prototype.rotate = function( rad ) {
	var c = Math.cos( rad );
	var s = Math.sin( rad );
	var m11 = this.m_x.x * c + this.m_y.x * s;
	var m12 = this.m_x.y * c + this.m_y.y * s;
	var m21 = this.m_x.x * -s + this.m_y.x * c;
	var m22 = this.m_x.y * -s + this.m_y.y * c;
	this.m_x.x = m11;
	this.m_x.y = m12;
	this.m_y.x = m21;
	this.m_y.y = m22;
};

RT.Mat2.prototype.setRotation = function( rad ) {
	var c = Math.cos( rad );
	var s = Math.sin( rad );
	this.m_x.x = c;
	this.m_x.y = s;
	this.m_y.x = -s;
	this.m_y.y = c;
};

RT.Mat2.prototype.getRotation = function() {
	return( this.m_x.angle() );
};

RT.Mat2.prototype.translateLocal = function( delta ) {
	this.m_t.incsca( this.m_x, delta.x );
	this.m_t.incsca( this.m_y, delta.y );
};

RT.Mat2.prototype.translateGlobal = function( delta ) {
	this.m_t.inc( delta );
};

RT.Mat2.prototype.scale = function( scale ) {
	this.m_x.sca( scale.x );
	this.m_y.sca( scale.y );
};

RT.Mat2.prototype.setScale = function( scale ) {
	this.m_x.setlen( scale.x );
	this.m_y.setlen( scale.y );
};

RT.Mat2.prototype.getScale = function() {
	return( new RT.Vec2( { 'x':this.m_x.getlen(), 'y':this.m_x.getlen() } ) );
};

RT.Mat2.prototype.setTranslation = function( t ) {
	this.m_t.set( t );
}

RT.Mat2.prototype.getTranslation = function() {
	return( this.m_t );
}

RT.Mat2.prototype.getXAxis = function() {
	return( this.m_x );
}

RT.Mat2.prototype.setXAxis = function( axis ) {
	this.m_x.set( axis );
	if( this.m_isOrtho ){
		this.m_y.set( this.m_x );
		this.m_y.perp();
	}
}

RT.Mat2.prototype.getYAxis = function() {
	return( this.m_y );
}

RT.Mat2.prototype.setYAxis = function( axis ) {
	this.m_y.set( axis );
	if( this.m_isOrtho ){
		this.m_x.set( this.m_y );
		this.m_x.perp();
		this.m_x.inv();
	}
}

RT.Mat2.prototype.clone = function() {
	var m = new RT.Mat2();
	m.m_x = this.m_x.clone();
	m.m_y = this.m_y.clone();
	m.m_t = this.m_t.clone();
	m.m_isOrtho = this.m_isOrtho;
	return( m );
}

RT.Mat2.prototype.toJSON = function() {
	var object = {};
	object.x = this.m_x.toJSON();
	object.y = this.m_y.toJSON();
	object.t = this.m_t.toJSON();
	object.isOrtho = ( this.m_isOrtho ? 'true' : 'false' );
	return( object );
}

RT.Mat2.prototype.fromJSON = function( object ) {
	this.m_x.fromJSON( object.x );
	this.m_y.fromJSON( object.y );
	this.m_t.fromJSON( object.t );
	this.m_isOrtho = ( object.isOrtho == 'true' );
}

RT.Mat2.prototype.draw = function( context, options ) {
	var s = options.size || 10.0;
 	context.lineWidth = options.lineWidth || 1;
 	context.strokeStyle = '#f00';
	context.beginPath();
	context.moveTo( this.m_t.x, this.m_t.y );
	context.lineTo( this.m_t.x + this.m_x.x * s, this.m_t.y + this.m_x.y * s );
	context.stroke();

	context.beginPath();
 	context.strokeStyle = '#0f0';
	context.moveTo( this.m_t.x, this.m_t.y );
	context.lineTo( this.m_t.x + this.m_y.x * s, this.m_t.y + this.m_y.y * s );
	context.stroke();
}
