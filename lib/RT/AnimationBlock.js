"use strict";

RT.AnimationBlock = function( animationSubject, numberOfFrames ){
	this.createEventDispatcherInterface();

	this.m_subject = animationSubject;
	this.m_numberOfFrames = numberOfFrames;

	this.m_onCurveChangedProxy = $.proxy( this.onCurveChanged, this );

	this.m_curves = {};
	this.m_relative = false;

	this.m_currentTime = 0.0;
	this.m_currentFrame = 0;

	this.m_lockExceptions = {};
}

RT.addInterface( RT.AnimationBlock, RT.EventDispatcherInterface );

RT.AnimationBlock.prototype.initialize = function() {
	this.initializeEventDispatcherInterface();

	this.m_currentTime = 0.0;
	this.m_currentFrame = 0;

    this.m_initialized = true;
	this.dispatchEvent( new RT.Event( 'initialize', this, undefined ) );
}

RT.AnimationBlock.prototype.fromJSON = function( object ) {
	this.m_numberOfFrames = parseInt( object.numberOfFrames );

	for( var c in this.m_curves ){
		this.m_curves[ c ].destroy();
	}

	this.m_curves = {};

	for( var c in object.curves ){
		var curve = new RT.KeyframeCurve();
		curve.fromJSON( object.curves[ c ] );
		curve.addEventListener( 'changed', this.m_onCurveChangedProxy );
		curve.initialize();
		this.m_curves[ c ] = curve;
	}

	this.m_relative = ( object.relative == 'true' );

	this.m_currentTime = 0.0;
	this.m_currentFrame = 0;

	this.dispatchEvent( new RT.Event( 'changed', this, 'fromJSON' ) );
}

RT.AnimationBlock.prototype.toJSON = function() {
	var object = {};
	object.numberOfFrames = this.m_numberOfFrames;
	object.curves = {};
	for( var c in this.m_curves ){
		object.curves[ c ] = this.m_curves[ c ].toJSON();
	}
	object.relative = ( this.m_relative ? 'true' : 'false' );
	return( object );
}

RT.AnimationBlock.prototype.getCurves = function() {
	return( this.m_curves );
}

RT.AnimationBlock.prototype.getSubject = function() {
	return( this.m_subject );
}

RT.AnimationBlock.prototype.getCurve = function( curve ) {
	return( this.m_curves[ curve ] );
}

RT.AnimationBlock.prototype.setKeyframe = function( curve, keyframe, position, sendEvent ) {
	if( ! this.m_curves[ curve ] ){
		this.m_curves[ curve ] = new RT.KeyframeCurve( this.m_numberOfFrames, RT.Curve.INTERPOLATION_LINEAR, 3 );
		this.m_curves[ curve ].addEventListener( 'changed', this.m_onCurveChangedProxy );
		this.m_curves[ curve ].initialize();
	}
	this.m_curves[ curve ].setKeyframe( keyframe, position, true );
	if( sendEvent ){
		this.dispatchEvent( new RT.Event( 'changed', this, 'setKeyframe' ) );
	}
}

RT.AnimationBlock.prototype.removeKeyframe = function( curve, keyframe, sendEvent ) {
	if( this.m_curves[ curve ] ){
		this.m_curves[ curve ].removeKeyframe( keyframe, true );
		if( sendEvent ){
			this.dispatchEvent( new RT.Event( 'changed', this, 'removeKeyframe' ) );
		}
	}
}

RT.AnimationBlock.prototype.hasKeyframe = function( curve ) {
	if( this.m_curves[ curve ] ){
		return( this.m_curves[ curve ].hasKeyframe() );
	}
	return( false );
}

RT.AnimationBlock.prototype.removeCurve = function( curve, sendEvent ) {
	if( this.m_curves[ curve ] ){
		this.m_curves[ curve ].removeEventListener( 'changed', this.m_onCurveChangedProxy );
		delete this.m_curves[ curve ];
		if( sendEvent ){
			this.dispatchEvent( new RT.Event( 'changed', this, 'removeCurve' ) );
		}
	}
}

RT.AnimationBlock.prototype.offset = function( offset ) {
	for( var c in this.m_curves ){
		this.m_curves[ c ].offset( offset );
	}
}

RT.AnimationBlock.prototype.scale = function( scale ) {
	for( var c in this.m_curves ){
		this.m_curves[ c ].scale( scale );
	}
}

RT.AnimationBlock.prototype.getNumberOfFrames = function() {
	return( this.m_numberOfFrames );
}

RT.AnimationBlock.prototype.getRelative = function() {
	return( this.m_relative );
}

RT.AnimationBlock.prototype.setRelative = function( state, sendEvent ) {
	if( this.m_relative != state ){
		this.m_relative = state;
		if( sendEvent ){
			this.dispatchEvent( new RT.Event( 'changed', this, 'setRelative' ) );
		}
	}
}

RT.AnimationBlock.prototype.lockResources = function() {
	if( this.m_resourcesLocked ){
		RT.Error( 'AnimationBlock::lockResources:resources already locked, call unlock first' );
	}
	if( this.canLockResources() ){
		this.m_resourcesLocked = true;
		return( true );
	}
	else{
		this.m_resourcesLocked = false;
		return( false );
	}
}

RT.AnimationBlock.prototype.removeResourceLockingException = function( resource ) {
	this.m_lockExceptions[ resource ] = false;
}

RT.AnimationBlock.prototype.addResourceLockingException = function( resource ) {
	this.m_lockExceptions[ resource ] = true;
}

RT.AnimationBlock.prototype.unlockResources = function() {
	// can always unlock
	for( var c in this.m_curves ){
		if( ! this.m_lockExceptions[ c ] ){
			this.m_subject.unlockAnimationResource( c );
		}
	}
}

RT.AnimationBlock.prototype.canLockResources = function() {
	for( var c in this.m_curves ){
		if( ! this.m_lockExceptions[ c ] ){
			if( this.m_subject.isAnimationResourceLocked( c ) ){
				return( false );
			}
		}
	}
	return( true );
}

RT.AnimationBlock.prototype.getTimeStep = function() {
	return( 1.0 / ( this.m_numberOfFrames - 1 ) );
}

RT.AnimationBlock.prototype.syncTimeToFrame = function() {
	this.m_currentTime = Math.min( Math.max( 0.0, this.m_currentFrame / ( this.m_numberOfFrames - 1 ) ), 1.0 );
}

RT.AnimationBlock.prototype.syncFrameToTime = function() {
	this.m_currentFrame = Math.min( Math.max( 0, Math.round( this.m_currentTime * ( this.m_numberOfFrames - 1 ) ) ), this.m_numberOfFrames - 1 );
}

RT.AnimationBlock.prototype.setCurrenTime = function( time ) {
	if( time != this.m_currentTime ){
		this.m_currentTime = time;
		this.syncFrameToTime();
		this.dispatchEvent( new RT.Event( 'changed', this, 'setCurrentTime' ) );
	}
}

RT.AnimationBlock.prototype.timeStep = function( step ) {
	var prevValue = this.m_currentTime;
	this.m_currentTime += step;
	var end = false;
	if( this.m_currentTime >= 1.0 ){
		this.m_currentTime = 1.0;
		end = true;
	}
	else if( this.m_currentTime <= 0.0 ){
		this.m_currentTime = 0.0;
		end = true;
	}
	this.syncFrameToTime();
	if( prevValue != this.m_currentTime ){
		this.dispatchEvent( new RT.Event( 'changed', this, 'timeStep' ) );
	}
	return( ! end );
}

RT.AnimationBlock.prototype.getCurrentTime = function() {
	return( this.m_currentTime );
}

RT.AnimationBlock.prototype.getCurrentFrame = function() {
	return( this.m_currentFrame );
}

RT.AnimationBlock.prototype.setCurrentFrame = function( frame ) {
	if( frame < 0 || frame >= this.m_numberOfFrames ){
		RT.Error( 'AnimationBlock::setCurrentFrame: setCurrentFrame out of range (' + frame + ' / ' + this.m_numberOfFrames + ')' );
		return( false );
	}
	this.m_currentFrame = frame;
	this.syncTimeToFrame();
	return( true );
}

RT.AnimationBlock.prototype.prevFrame = function() {
	var nextFrame = this.m_currentFrame - 1;
	if( nextFrame < 0 ){
		nextFrame = 0;
		return( false );
	}
	return( this.setCurrentFrame( nextFrame ) );
}

RT.AnimationBlock.prototype.nextFrame = function() {
	var nextFrame = this.m_currentFrame + 1;
	if( nextFrame >= this.m_numberOfFrames ){
		nextFrame = this.m_numberOfFrames - 1;
		return( false );
	}
	return( this.setCurrentFrame( nextFrame ) );
}

RT.AnimationBlock.prototype.getLastFrame = function() {
	return( this.m_numberOfFrames - 1 );
}

RT.AnimationBlock.prototype.setCurrentTime = function( frame ){
	this.m_currentTime = Math.min( Math.max( 0.0, frame / ( this.m_numberOfFrames - 1 ) ), 1.0 );
	this.syncFrameToTime();
}

RT.AnimationBlock.prototype.update = function() {
	// @TODO looptypes, pingpong
	// map the animation onto the subject
	if( this.m_resourcesLocked ){
		for( var c in this.m_curves ){
			var point = this.m_curves[ c ].getInterpolatedPointAtTime( this.m_currentTime );
			if( point ){
				// transform to global coords if necessary
				if( this.m_relative ){
					point = this.m_subject.localToGlobal( point );
				}

				this.m_subject.setAnimationValue( c, point );
			}
			else{
				RT.error( 'AnimationBlock:: warning:point from curve is undefined' );
			}
		}
	}
}

RT.AnimationBlock.prototype.onCurveChanged = function( e ) {
	this.dispatchEvent( new RT.Event( 'changed', this, undefined ) );
}


RT.AnimationBlock.prototype.draw = function( context, options ) {
	if( ! options ){
		options = { 	
			'Curve':{ 'strokeStyle':'rgba( 255, 0, 0, 0.8 )', 'lineWidth':1.0,
				'Points':{ 'fillStyle':'rgba( 128, 0, 0, 0.5 )', 'strokeStyle':'rgba( 255, 0, 0, 0.8 )', 'radius':3.0 },
				'Knots':{ 'fillStyle':'rgba( 128, 128, 0, 0.5 )', 'strokeStyle':'rgba( 255, 255, 0, 0.8 )', 'radius':2.0 }
			},
			'Begin':{ 'fillStyle':'rgba( 255, 255, 0, 0.5 )', 'strokeStyle':'rgba( 255, 255, 0, 0.8 )', 'radius':3.0 },
			'End':{ 'fillStyle':'rgba( 0, 255, 255, 0.5 )', 'strokeStyle':'rgba( 0, 255, 255, 0.8 )', 'radius':3.0 },
			'Current':{ 'fillStyle':'rgba( 0, 255, 0, 0.5 )', 'strokeStyle':'rgba( 0, 255, 0, 0.8 )', 'radius':3.0 }
		}
	}
	if( options.Curve ){
		for( var c in this.m_curves ){
			this.m_curves[ c ].draw( context, options.Curve );
		}
	}
	// @TODO begin/end
}


RT.AnimationBlock.prototype.destroy = function(){
	this.dispatchEvent( new RT.Event( 'destroy', this, undefined ) );
  	this.destroyEventDispatcherInterface();
}

