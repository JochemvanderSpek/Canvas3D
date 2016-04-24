"use strict";



RT.PhysicsBody = function( config ) {
	if( ! config ){
		config = new RT.PhysicsBody.Config();
	}
	else if( config.type != "RT.PhysicsBody.Config" ){
		RT.error( new RT.Error( RT.Error.WRONG_TYPE, "RT.PhysicsBody needs either an RT.PhysicsBody.Config, or no argument at all." ) );
	}
	this.m_config = config;
	this.m_initialized = false;
}

RT.PhysicsBody.prototype.initialize = function() {

	this.m_fixtureDef = new b2FixtureDef();
	this.m_fixtureDef.density = this.m_config.density;
	this.m_fixtureDef.friction = this.m_config.friction;
	this.m_fixtureDef.restitution = this.m_config.restitution;

	this.m_fixtureDef.shape = new b2PolygonShape();
	this.m_fixtureDef.shape.SetAsBox( this.m_config.size.w, this.m_config.size.h );

	this.m_bodyDef = new b2BodyDef();
	this.m_bodyDef.position.Set( this.m_config.position.x, this.m_config.position.y );
	this.m_bodyDef.rotation = this.m_config.rotation;
	this.m_bodyDef.linearVelocity.Set( this.m_config.linearVelocity.m_x, this.m_config.linearVelocity.m_y );
	this.m_bodyDef.angularVelocity = this.m_config.angularVelocity;
	this.m_bodyDef.linearDamping = this.m_config.linearDamping;
	this.m_bodyDef.angularDamping = this.m_config.angularDamping;
	this.m_bodyDef.allowSleep = this.m_config.allowSleep;
	this.m_bodyDef.isSleeping = this.m_config.isSleeping;
	this.m_bodyDef.preventRotation = this.m_config.preventRotation;

	if( this.m_config.dynamic ){
         this.m_bodyDef.type = b2Body.b2_dynamicBody;
	}
	else{
         this.m_bodyDef.type = b2Body.b2_staticBody;
	}
	this.m_initialized = true;
}

RT.PhysicsBody.Config = function() {
	return( {
	    type : "RT.PhysicsBody.Config",
		position : { x:0.0, y:0.0 }, // position
		rotation : 0.0, // rotation
		size : { w:1.0, h:1.0 }, // width
		density : 1.0,
		friction : 0.1,
		restitution : 0.9,
		linearVelocity : { x:0.0, y:0.0 },
		angularVelocity : 0.0,
		linearDamping : 0.0,
		angularDamping : 0.0,
		allowSleep : true,
		isSleeping : false,
		preventRotation : false,
		dynamic : true
	});
}