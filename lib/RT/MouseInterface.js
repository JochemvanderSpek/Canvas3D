"use strict";


// implement the Interface as a function that can be called by RT.addInterface (Utils.js)
// hence, it doesn't have an initialize() function like other RT classes
RT.MouseInterface = function( config ){

	this.createMouseInterface = function( context ){

		this.m_context = context;
		this.m_mouseNow = new RT.Vec2();
		this.m_mouseBefore = new RT.Vec2();
		this.m_mouseOrigin = new RT.Vec2();
		this.m_mouseScaleFactor = 1.0;
		this.m_mouseDown = false;
		this.m_mouseMoved = false;
		this.m_mouseDownProxy = $.proxy( this.mouseDown, this );
		this.m_mouseMoveProxy = $.proxy( this.mouseMove, this );
		this.m_mouseUpProxy = $.proxy( this.mouseUp, this );
		this.m_mouseEnterProxy = $.proxy( this.mouseEnter, this );
		this.m_mouseLeaveProxy = $.proxy( this.mouseLeave, this );
		this.m_mouseOverProxy = $.proxy( this.mouseOver, this );
		this.m_mouseOutProxy = $.proxy( this.mouseOut, this );
		if( $.timer ){
			this.m_doubleClickTimer = $.timer();
			this.m_doubleClickTimer.set( { action: $.proxy( this.doubleClickTimeOut, this ), time : 200, autostart : false } );
		}

		this.mouseEnable();

		this.hasMouseInterface = true;
	}

	this.initializeMouseInterface = function(){
	}

	this.destroyMouseInterface = function(){
		this.mouseDisable();
		this.hasMouseInterface = false;
	}

	this.setMouseInterfaceContext = function( context ){
		this.m_context = context;
	}

	this.mouseEnable = function(){
		$( document ).on( 'mousedown.proxy', this.m_mouseDownProxy );
		$( document ).on( 'mousemove.proxy', this.m_mouseMoveProxy );
		$( document ).on( 'mouseup.proxy', this.m_mouseUpProxy );
		$( document ).on( 'mouseenter.proxy', this.m_mouseEnterProxy );
		$( document ).on( 'mouseleave.proxy', this.m_mouseLeaveProxy );
		$( document ).on( 'mouseover.proxy', this.m_mouseOverProxy );
		$( document ).on( 'mouseout.proxy', this.m_mouseOutProxy );
	}

	this.onMouseEnable = function(){
		// reimplement in subclass
	}

	this.mouseDisable = function(){
		$( document ).off( 'mousedown.proxy', this.m_mouseDownProxy );
		$( document ).off( 'mousemove.proxy', this.m_mouseMoveProxy );
		$( document ).off( 'mouseup.proxy', this.m_mouseUpProxy );
		$( document ).off( 'mouseenter.proxy', this.m_mouseEnterProxy );
		$( document ).off( 'mouseleave.proxy', this.m_mouseLeaveProxy );
		$( document ).off( 'mouseover.proxy', this.m_mouseOverProxy );
		$( document ).off( 'mouseout.proxy', this.m_mouseOutProxy );
	}

	this.onMouseDisable = function(){
		// reimplement in subclass
	}

	this.mouseDown = function( e ){
		this.m_mouseDown = true;

		this.m_mouseBefore.x = this.m_mouseNow.x;
		this.m_mouseBefore.y = this.m_mouseNow.y;

		this.m_mouseNow.x = ( e.clientX - this.m_mouseOrigin.x ) / this.m_mouseScaleFactor; 
		this.m_mouseNow.y = ( e.clientY - this.m_mouseOrigin.y ) / this.m_mouseScaleFactor; 

		this.m_mouseMoved = false;

		this.onMouseDown.call( this.m_context || this, e );
	}

	this.onMouseDown = function( e ){
		// reimplement in subclass
	}

	this.mouseMove = function( e ){
		this.m_mouseBefore.x = this.m_mouseNow.x;
		this.m_mouseBefore.y = this.m_mouseNow.y;

		this.m_mouseNow.x = ( e.clientX - this.m_mouseOrigin.x ) / this.m_mouseScaleFactor; 
		this.m_mouseNow.y = ( e.clientY - this.m_mouseOrigin.y ) / this.m_mouseScaleFactor; 

		this.m_mouseMoved = true;

		this.onMouseMove.call( this.m_context || this, e );
	}

	this.onMouseMove = function( e ){
		// reimplement in subclass
	}

	this.mouseEnter = function( e ){
		this.m_mouseBefore.x = this.m_mouseNow.x;
		this.m_mouseBefore.y = this.m_mouseNow.y;

		this.m_mouseNow.x = ( e.clientX - this.m_mouseOrigin.x ) / this.m_mouseScaleFactor; 
		this.m_mouseNow.y = ( e.clientY - this.m_mouseOrigin.y ) / this.m_mouseScaleFactor; 

		this.onMouseEnter.call( this.m_context || this, e );
	}

	this.onMouseEnter = function( e ){
		// reimplement in subclass
	}

	this.mouseLeave = function( e ){
		this.m_mouseBefore.x = this.m_mouseNow.x;
		this.m_mouseBefore.y = this.m_mouseNow.y;

		this.m_mouseNow.x = ( e.clientX - this.m_mouseOrigin.x ) / this.m_mouseScaleFactor; 
		this.m_mouseNow.y = ( e.clientY - this.m_mouseOrigin.y ) / this.m_mouseScaleFactor; 

		this.onMouseLeave.call( this.m_context || this, e );
	}

	this.onMouseLeave = function( e ){
		// reimplement in subclass
	}

	this.mouseOver = function( e ){
		this.m_mouseBefore.x = this.m_mouseNow.x;
		this.m_mouseBefore.y = this.m_mouseNow.y;

		this.m_mouseNow.x = ( e.clientX - this.m_mouseOrigin.x ) / this.m_mouseScaleFactor; 
		this.m_mouseNow.y = ( e.clientY - this.m_mouseOrigin.y ) / this.m_mouseScaleFactor; 

		this.onMouseOver.call( this.m_context || this, e );
	}

	this.onMouseOver = function( e ){
		// reimplement in subclass
	}

	this.mouseOut = function( e ){
		this.m_mouseBefore.x = this.m_mouseNow.x;
		this.m_mouseBefore.y = this.m_mouseNow.y;

		this.m_mouseNow.x = ( e.clientX - this.m_mouseOrigin.x ) / this.m_mouseScaleFactor; 
		this.m_mouseNow.y = ( e.clientY - this.m_mouseOrigin.y ) / this.m_mouseScaleFactor; 

		this.onMouseOut.call( this.m_context || this, e );
	}

	this.onMouseOut = function( e ){
		// reimplement in subclass
	}

	this.doubleClickTimeOut = function( e ) {
		this.m_doubleClickTimer.stop();
	}

	this.mouseUp = function( e ){
		this.m_mouseDown = false;

		this.m_mouseBefore.x = this.m_mouseNow.x;
		this.m_mouseBefore.y = this.m_mouseNow.y;

		this.m_mouseNow.x = ( e.clientX - this.m_mouseOrigin.x ) / this.m_mouseScaleFactor; 
		this.m_mouseNow.y = ( e.clientY - this.m_mouseOrigin.y ) / this.m_mouseScaleFactor; 

		this.onMouseUp.call( this.m_context || this, e );

		if( this.m_doubleClickTimer ){
			if( this.m_doubleClickTimer.isActive ){
				// doubleClick
				this.onDoubleCLick.call( this.m_context || this, e );
			}
			else{
				this.m_doubleClickTimer.play( true );
			}
		}
	}

	this.onMouseUp = function( e ){
		// reimplement in subclass
	}

	this.onDoubleCLick = function( e ){
		// reimplement in subclass
	}

	this.getMouseNow = function(){
		return( this.m_mouseNow );
	}

	this.getMouseBefore = function(){
		return( this.m_mouseBefore );
	}

	return( this );
};


