"use strict";

RT.Stopwatch = function(){

	this.createEventDispatcherInterface();

	this.m_time = 0;
	this.m_lapseTime = 0;
	this.m_duration = 0.0;
	this.m_running = false;
	this.m_fixedTimeStep = true;
	this.m_timeStep = 0.03;
	this.m_normalizedTime = 0.0;

	return( this );
}

RT.addInterface( RT.Stopwatch, RT.EventDispatcherInterface );

RT.Stopwatch.prototype.update = function(){
	if( this.m_running ){
		this.m_normalizedTime = Math.min( this.m_time / this.m_duration, 1.0 );

		// test here, so we always end with lerp = 1.0
		if( this.m_time >= this.m_duration ){
			this.m_running = false;
			this.dispatchEvent( new RT.Event( 'end', this, undefined ) );
		}
		else{
			var t = ( new Date() ).getTime();
			var dt = ( this.m_fixedTimeStep ? this.m_timeStep : ( Math.abs( t - this.m_lapseTime ) / 1000.0 ) );
			this.m_lapseTime = t;
			this.m_time += dt;
			this.dispatchEvent( new RT.Event( 'update', this, undefined ) );
		}
	}
}

RT.Stopwatch.prototype.start = function( duration, fixedTimeStep ) {
	if( fixedTimeStep !== undefined ){
		this.m_fixedTimeStep = true;
		this.m_timeStep = fixedTimeStep;
	}
	if( isNaN( duration ) || ! isFinite( duration ) || duration == 0.0 ){
		RT.error( 'Stopwatch start with invalid duration' );
	}
	this.m_duration = duration;
	this.m_lapseTime = ( ( new Date() ).getTime() );
	this.m_normalizedTime = 0.0;
	this.m_time = 0.0;
	this.m_running = true;
	this.dispatchEvent( new RT.Event( 'start', this, undefined ) );
}

RT.Stopwatch.prototype.getNormalizedTime = function( ) {
	return( this.m_normalizedTime );
}

RT.Stopwatch.prototype.isRunning = function( ) {
	return( this.m_running );
}

RT.Stopwatch.prototype.pause = function( state ) {
	if( state && ( ! this.m_running ) ){
		this.m_lapseTime = ( ( new Date() ).getTime() );
		this.dispatchEvent( new RT.Event( 'pause', this, undefined ) );
	}
	else if( ! state && this.m_running ){
		this.dispatchEvent( new RT.Event( 'resume', this, undefined ) );
	}
	this.m_running = ! state;
}

RT.Stopwatch.prototype.destroy = function( ) {
	this.dispatchEvent( new RT.Event( 'destroy', this, undefined ) );
  	this.destroyEventDispatcherInterface();
}

