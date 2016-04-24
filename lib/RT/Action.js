"use strict";

 /**
    * An Action is a leaf-BehaviourNode that applies a certain action to a subject
    * 
    * 
    * @abstract
 */
 RT.Action = function( context, subject, cellTransition ){
	this.createEventDispatcherInterface( context || this );

	this.m_status = RT.Action.STATUS_IDLE;
	this.m_autoStart = true;
	this.m_priority = 0;
	this.m_tag = '';
	this.m_subject = subject;
	this.m_cellTransition = cellTransition;
	this.m_endCell = undefined;
	this.m_animationBlock = undefined;
	this.m_actionTitle = 'Generic Action';
	this.m_view = undefined;

	return( this );
}

RT.addInterface( RT.Action, RT.EventDispatcherInterface );

// the status is sequential, ie it is safe to assume 
// the action has started if status > RT.Action.STATUS_STARTED
RT.Action.STATUS_IDLE 		= 0;
RT.Action.STATUS_STARTED 	= 1;
RT.Action.STATUS_PAUSED		= 2;
RT.Action.STATUS_UPDATING	= 3;
RT.Action.STATUS_ENDED 		= 4;
RT.Action.STATUS_ABORTED	= 5;

RT.Action.prototype.initialize = function() {
	this.initializeEventDispatcherInterface();

	if( ! this.onStart ){
		RT.error( new RT.Error( RT.Error.INCOMPLETE_IMPLEMENTATION, "An Action needs to implement onStart" ) );
	}
	if( ! this.onUpdate ){
		RT.error( new RT.Error( RT.Error.INCOMPLETE_IMPLEMENTATION, "An Action needs to implement onUpdate" ) );
	}
	if( ! this.onUpdate ){
		RT.error( new RT.Error( RT.Error.INCOMPLETE_IMPLEMENTATION, "An Action needs to implement onEnd" ) );
	}
	if( ! this.onAbort ){
		RT.error( new RT.Error( RT.Error.INCOMPLETE_IMPLEMENTATION, "An Action needs to implement onAbort" ) );
	}

	// onPause and onResume are optional
}

/** aborts when autostart does not work
*/
RT.Action.prototype.update = function() {
	// check if we need to start 
	if( this.m_autoStart && ( this.m_status < RT.Action.STATUS_STARTED ) ){
		if( ! this.start() ){
			return( false );
		}
	}

	if( this.m_status >= RT.Action.STATUS_STARTED ){
		if( this.onUpdate.call( this.m_context || this ) ){
			this.m_status = RT.Action.STATUS_UPDATING;
			return( true );
		}
		else{
			return( false );
		}
	}
	return( true );
}

RT.Action.prototype.start = function() {
	if( this.onStart.call( this.m_context || this, this.m_cellTransition ) ){
		this.m_status = RT.Action.STATUS_STARTED;
		if( this.m_subject && this.m_cellTransition ){
			var startCell = this.m_subject.getCurrentActionCell();
			if( startCell ){
				this.m_endCell = startCell.getNeighbour( this.m_cellTransition );
			}
			else{
				// @TODO error
			}
		}
		else{
			// @TODO error
		}
		return( true );
	}
	else{
		return( false );
	}
}

RT.Action.prototype.end = function() {
	if( this.onEnd.call( this.m_context || this ) ){
		this.m_status = RT.Action.STATUS_ENDED;
		if( this.m_subject && this.m_endCell ){
			this.m_subject.setCurrentActionCell( this.m_endCell );
		}
		this.dispatchEvent( new RT.Event( 'end', this, undefined ) );
		return( true );
	}
	else{
		return( false );
	}
}

RT.Action.prototype.abort = function() {
	if( this.onAbort.call( this.m_context || this ) ){
		this.m_status = RT.Action.STATUS_ABORTED;
		this.end();
		return( true );
	}
	else{
		return( false );
	}
}

RT.Action.prototype.pause = function( state ) {
	if( state ){
		if( this.m_status != RT.Action.STATUS_PAUSED ){
			this.m_status = RT.Action.STATUS_PAUSED;
			if( this.onPause ){
				this.onPause.call( this.m_context || this );
			}
		}
	}
	else if( this.m_status == RT.Action.STATUS_PAUSED ){
		this.m_status = RT.Action.STATUS_UPDATING;
		if( this.onResume ){
			this.onResume.call( this.m_context || this );
		}
	}
}

RT.Action.prototype.setView = function( view ){
	this.m_view = view;
}

RT.Action.prototype.getView = function(){
	return( this.m_view );
}

RT.Action.prototype.setAutoStart = function( state ){
	this.m_autoStart = state;
}

RT.Action.prototype.getAutoStart = function(){
	return( this.m_autoStart );
}

RT.Action.prototype.getStatus = function(){
	return( this.m_status );
}

RT.Action.prototype.getPriority = function() {
	return( this.m_priority );
}

RT.Action.prototype.setPriority = function( priority ) {
	this.m_priority = priority;
}

RT.Action.prototype.getTag = function(){
	return( this.m_tag );
}

RT.Action.prototype.setTag = function( tag ){
	this.m_tag = tag;
}


/** @return the title of the action for use in views 
*/
RT.Action.prototype.getActionTitle = function() {
	return( this.m_actionTitle );
}

/** @return the animationBlock (if any)
*/
RT.Action.prototype.getAnimationBlock = function() {
	return( this.m_animationBlock );
}

/** sets the start and end cell for the action, 
* only possible to set *before* the action has started.
*/
RT.Action.prototype.setCellTransition = function( cellTransition ) {
	this.m_cellTransition = cellTransition;
}

/** @return the cell transition -if any- for this action
*/
RT.Action.prototype.getCellTransition = function() {
	return( this.m_cellTransition );
}

/** @return the endcell based on the celltransition -if any-
*/
RT.Action.prototype.getEndCell = function() {
	return( this.m_endCell );
}

/**
* @param status - if defined, return the string value of status
* if status is not defined, return the current status as string 
* @return the status as string
*/
RT.Action.prototype.getStatusString = function( status ) {
	if( status === undefined ){
		status = this.m_status;
	}
	switch( status ){
		case RT.Action.STATUS_IDLE : return( 'Idle' );
		case RT.Action.STATUS_STARTED : return( 'Started' );
		case RT.Action.STATUS_PAUSED : return( 'Paused' );
		case RT.Action.STATUS_UPDATING : return( 'Updating' );
		case RT.Action.STATUS_ENDED : return( 'Ended' );
		case RT.Action.STATUS_ABORTED : return( 'Aborted' );
	}
}


RT.Action.prototype.draw = function( context, options ) {

}

RT.Action.prototype.destroy = function() {
	if( this.m_status >= RT.Action.STATUS_STARTED &&
		this.m_status != RT.Action.STATUS_ENDED ){
		this.abort();
	}
	else{
		this.end();
	}

	this.destroyEventDispatcherInterface();
}
