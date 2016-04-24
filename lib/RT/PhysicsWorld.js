"use strict";


RT.PhysicsWorld = function( config ) {
	if( ! config ){
		config = new RT.PhysicsWorld.Config();
	}
	else if( config.type != "RT.PhysicsWorld.Config" ){
		RT.error( new RT.Error( RT.Error.WRONG_TYPE, "RT.PhysicsWorld needs either an RT.PhysicsWorld.Config, or no argument at all." ) );
	}
	this.m_config = config;
	this.m_initialized = false;
}

RT.PhysicsWorld.prototype.initialize = function(){
	this.m_world = new b2World( new b2Vec2( this.m_config.gravity.x, this.m_config.gravity.y ), this.m_config.doSleep );

	if( this.m_config.debugDraw ){
		//setup debug draw
		var debugDraw = new b2DebugDraw();
		debugDraw.SetSprite( document.getElementById( this.m_config.debugDrawCanvas ).getContext("2d") );
		debugDraw.SetDrawScale( this.m_config.debugDrawScale );
		debugDraw.SetFillAlpha( this.m_config.debugDrawAlpha );
		debugDraw.SetLineThickness( this.m_config.debugDrawThickness );
		// @TODO add config flags
		debugDraw.SetFlags( this.m_config.debugDrawFlags );
		this.m_world.SetDebugDraw( debugDraw );
	}
	this.m_initialized = true;
}

RT.PhysicsWorld.prototype.createPhysicsBody = function( config ){
	var body = new RT.PhysicsBody( config );
	this.addPhysicsBody( body );
	return( body );
}

RT.PhysicsWorld.prototype.addPhysicsBody = function( body ){
	this.m_world.CreateBody( body.m_bodyDef ).CreateFixture( body.m_fixtureDef );
}

RT.PhysicsWorld.Config = function() {
	return( {
	    type : "RT.PhysicsWorld.Config",
		gravity : { x:0.0, y:100.0 }, 
		doSleep : true,
		debugDraw : true, 
		debugDrawCanvas : "canvas",
		debugDrawScale : 1.0, 
		debugDrawAlpha : 1.0, 
		debugDrawThickness : 1.0,
		debugDrawFlags : b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit
	});
}
