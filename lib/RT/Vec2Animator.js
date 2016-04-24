"use strict";


RT.Vec2Animator = function( v ){

	this.createEventDispatcherInterface();

	this.m_v = v;
	this.m_v1 = undefined;
	this.m_v2 = undefined;
	this.m_stopwatch = new RT.Stopwatch();
	this.m_stopwatch.addEventListener( 'start', $.proxy( this.onEvent, this ) );
	this.m_stopwatch.addEventListener( 'end', $.proxy( this.onEvent, this ) );
	this.m_stopwatch.addEventListener( 'update', $.proxy( this.onEvent, this ) );
	this.m_stopwatch.addEventListener( 'pause', $.proxy( this.onEvent, this ) );
	this.m_stopwatch.addEventListener( 'resume', $.proxy( this.onEvent, this ) );

	return( this );
}

RT.addInterface( RT.Vec2Animator, RT.EventDispatcherInterface );

RT.Vec2Animator.calculateDurationFromSpeed = function( v1, v2, speed ) {
	var isCurve = false;
	if( v1.m_interpolationType ){
		// v1 is assumed to be a curve, v2 is the speed and speed is undefined
		speed = v2;
		isCuve = true;
	}
	if( isNaN( speed ) || ! isFinite( speed ) || speed == 0 ){
		RT.error( 'Verlet2Animator invalid speed for duration calculation' );
	}

	var length = 0.0;
	if( isCurve ){
		length = v1.getLength();
	}
	else{
		RT.Vec2.difference( v1, v2 ).getlen();
	}

	return( length / speed );
}

RT.Vec2Animator.prototype.update = function(){
	if( this.m_stopwatch.isRunning() ){
		var lerp = this.m_stopwatch.getNormalizedTime();

		if( ! this.m_isCurve ){
			this.m_v.x = ( 1.0 - lerp ) * this.m_v1.x + lerp * this.m_v2.x;
			this.m_v.y = ( 1.0 - lerp ) * this.m_v1.y + lerp * this.m_v2.y;
		}
		else{
			this.m_v.set( this.m_v1.getInterpolatedPoint( lerp ) );
			if( isNaN( this.m_v.x ) || isNaN( this.m_v.y ) ){
				RT.error( 'Verlet2Animator value is NaN' );
			}
			if( ! isFinite( this.m_v.x ) || ! isFinite( this.m_v.y ) ){
				RT.error( 'Verlet2Animator value is not finite' );
			}
//			RT.trace( 'lerp: ' + lerp.toFixed( 3 ) + ' ' + this.m_v.toString() );
		}
		this.m_stopwatch.update();
	}
}

RT.Vec2Animator.prototype.onEvent = function( e ) {
	this.dispatchEvent( e );
}

// TODO animateCurve

RT.Vec2Animator.prototype.animateTo = function( v, duration, fixedTimeStep ) {
	this.m_isCurve = false;
	this.m_v1 = this.m_v.clone();
	this.m_v2 = v.clone();
	this.m_stopwatch.start( duration, fixedTimeStep );
}

RT.Vec2Animator.prototype.animateLine = function( v1, v2, duration, fixedTimeStep ) {
	this.m_isCurve = false;
	this.m_v1 = v1.clone();
	this.m_v2 = v2.clone();
	this.m_stopwatch.start( duration, fixedTimeStep );
}

RT.Vec2Animator.prototype.animateCurve = function( curve, duration, fixedTimeStep ) {
	this.m_isCurve = true;
	this.m_v1 = curve.clone();
	this.m_stopwatch.start( duration, fixedTimeStep );
}

RT.Vec2Animator.prototype.draw = function( context, options ) {
	if( options.Curve ){
		if( this.m_isCurve ){
			this.m_v1.draw( context, options.Curve );
		}
		else{
		 	context.strokeStyle = options.Curve.strokeStyle;
		 	context.lineWidth = options.Curve.lineWidth;
			context.beginPath();
			context.moveTo( this.m_v1.x, this.m_v1.y );
			context.lineTo( this.m_v2.x, this.m_v2.y );
			context.stroke();

		}
	}
	if( ! this.m_isCurve ){
		if( options.Begin ){
			this.m_v1.draw( context, options.Begin );
		}
		if( options.End ){
			this.m_v2.draw( context, options.End );
		}
		if( options.Current ){
			this.m_v.draw( context, options.Current );
		}
	}
}

RT.Vec2Animator.prototype.destroy = function( ) {
	this.m_stopwatch.destroy();
	this.dispatchEvent( new RT.Event( 'destroy', this, undefined ) );
  	this.destroyEventDispatcherInterface();
}

