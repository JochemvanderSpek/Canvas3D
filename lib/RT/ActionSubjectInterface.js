"use strict";

/**
 implement the Interface as a function that can be called by RT.addInterface (Utils.js)
*/
RT.ActionSubjectInterface = function(){

	this.createActionSubjectInterface = function( queues ){
		this.hasActionSubjectInterface = true;
		this.m_actions = new Array();
		for( var i = 0; i < ( queues || 2 ); i++ ){
			this.m_actions.push( new Array() );
		}
		this.m_currentActionCell = undefined;
		this.m_removeActionProxy = $.proxy( this.onRemoveAction, this );
	}

	this.initializeActionSubjectInterface = function(){
	}

	this.destroyActionSubjectInterface = function(){
		this.hasActionSubjectInterface = false;
		if( this.m_actions !== undefined ){
			for( var i = 0; i < this.m_actions.length; i++ ){
				for( var j = 0; j < this.m_actions[ i ].length; j++ ){
					this.m_actions[ i ][ j ].end();
				}
				this.m_actions[ i ].splice( 0, this.m_actions.length );
			}
			this.m_actions.splice( 0, this.m_actions.length );
			delete this.m_actions;
		}
	}

	/** 
	* adds a specified action to a specified queue
	* @param action (required)
	* @param queue (optional) if no queue is specified, the action is added to queue 0
	* @param index (optional) if no index is specified, the action is pushed onto the queue
	* @attention if index is given, the current action at that index is aborted.
	*/
	this.addAction = function( action, queue, index ) {
		if( queue === undefined ){
			queue = 0;
		}
		if( queue < 0 || queue >= this.m_actions.length ){
			// TODO error
		}
		else{
			if( this.m_actions[ queue ].indexOf( action ) == -1 ){
				if( index === undefined ){
					this.m_actions[ queue ].push( action );
					if( this.hasEventDispatcherInterface ){
						this.dispatchEvent( new RT.Event( 'addaction', this, { 'action':action, 'queue':queue, 'index':( this.m_actions[ queue ].length - 1 ) } ) );
					}
				}
				else if( index >= 0 && index <= this.m_actions[ queue ].length ){
					// if the action replaces another action in the queue,
					// abort that action and replace.
					var previousAction = this.m_actions[ queue ][ index ];
					this.m_actions[ queue ][ index ] = action;
					if( this.hasEventDispatcherInterface ){
						this.dispatchEvent( new RT.Event( 'addaction', this, { 'action':action, 'queue':queue, 'index':index } ) );
					}
					previousAction.abort();
				}
				action.addEventListener( 'end', this.m_removeActionProxy );
			}
			this.sortActionsByPriority();
		}
	}

	/** 
	* @private
	* used to remove an ation from the queue when it has ended, was aborted, or got destroyed.
	* @attention DONT CALL DIRECTLY
	*/
	this.onRemoveAction = function( e ) {
		this.removeAction( e.m_caller );
	}

	/**
	* finds an action in a specified queue and removes it from the queue
	* @param action (required)
	* @param queue (optional) if no queue is specified, the action is searched in the queues
	*/
	this.removeAction = function( action, queue ) {
		var index = -1;
		if( queue == undefined ){
			for( var i = 0; i < this.m_actions.length; i++ ){
				index = this.m_actions[ i ].indexOf( action );
				if( index != -1 ){
					queue = i;
					break;
				}
			}
		}
		else if( queue < 0 || queue >= this.m_actions.length ){
			// TODO error
		}
		else{
			index = this.m_actions[ queue ].indexOf( action );
		}

		if( index >= 0 ){
			action.removeEventListener( 'end', this.m_removeActionProxy );
			if( this.hasEventDispatcherInterface ){
				this.dispatchEvent( new RT.Event( 'removeaction', this, { 'action':action, 'queue':queue, 'index':index } ) );
			}
			this.m_actions[ queue ].splice( index, 1 );
			this.sortActionsByPriority();
		}
	}

	/**
	* calls 'end' on all actions in all queues
	*/
	this.endAllActions = function() {
		// copy the actions, as end calls this.removeAction via 'end' event
		var safeArray = new Array();
		for( var i = 0; i < this.m_actions.length; i++ ){
			for( var j = 0; j < this.m_actions[ i ].length; j++ ){
				safeArray.push( this.m_actions[ i ][ j ] );
			}
		}
		for( var i = 0; i < safeArray.length; i++ ){
			safeArray[ i ].end();
		}
	}

	/**
	* calls 'abort' on all actions in all queues
	*/
	this.abortAllActions = function() {
		// copy the actions, as abort calls this.removeAction via 'abort' event
		var safeArray = new Array();
		for( var i = 0; i < this.m_actions.length; i++ ){
			for( var j = 0; j < this.m_actions[ i ].length; j++ ){
				safeArray.push( this.m_actions[ i ][ j ] );
			}
		}
		for( var i = 0; i < safeArray.length; i++ ){
			safeArray[ i ].abort();
		}
	}

	/**
	* calls 'destroy' on all actions
	* @param queue only destroy actions in this queue
	* @param priority only destroy actions with this priority
	*/
	this.destroyAllActions = function( queue, priority ) {
		// copy the actions, as destroy calls this.removeAction via 'destroy' event
		var safeArray = new Array();
		if( ! queue ){
			for( var i = 0; i < this.m_actions.length; i++ ){
				for( var j = 0; j < this.m_actions[ i ].length; j++ ){
					if( priority == undefined || this.m_actions[ i ][ j ].getPriority() == priority ){
						safeArray.push( this.m_actions[ i ][ j ] );
					}
				}
			}
		}
		else if( queue >= 0 && queue < this.m_actions.length ){
			for( var j = 0; j < this.m_actions[ queue ].length; j++ ){
				if( priority == undefined || this.m_actions[ i ][ j ].getPriority() == priority ){
					safeArray.push( this.m_actions[ queue ][ j ] );
				}
			}
		}
		for( var i = 0; i < safeArray.length; i++ ){
			safeArray[ i ].destroy();
		}
	}

	/** 
	*	@returns true if the specified queue has specified action
	* if no action is specified, checks if any queue contains any action
	* if no queue is specified, all queues are searched for the specified action
	* @param action (optional)
	* @param queue (optional)
	*/
	this.hasAction = function( action, queue ) {
		if( action ){
			if( queue == undefined ){
				for( var i = 0; i < this.m_actions.length; i++ ){
					var index = this.m_actions[ i ].indexOf( action );
					if( index != -1 ){
						return( true );
					}
				}
			}
			else if( queue < 0 || queue >= this.m_actions.length ){
				// TODO error
				return( false );
			}
			else{
				return( this.m_actions[ queue ].indexOf( action ) )
			}
		}
		else{
			for( var i = 0; i < this.m_actions.length; i++ ){
				if( this.m_actions[ i ].length ){
					return( true );
				}
			}
			return( false );
		}
	}

	/** 
	*	returns the array of actions for specified queue
	* @param queue (required)
	*/
	this.getActionQueue = function( queue ) {
		return( this.m_actions[ queue ] );
	}

	/** 
	*	searches all queues for the first action with tag
	* @param tag (required)
	*/
	this.findActionByTag = function( tag ) {
		for( var i = 0; i < this.m_actions.length; i++ ){
			for( var j = 0; j < this.m_actions[ i ].length; j++ ){
				if( this.m_actions[ i ][ j ].getTag() == tag ){
					return( this.m_actions[ i ][ j ] );
				}
			}
		}
		return( undefined );
	}


	/** 
	* @return the actual action queues
	*/
	this.getActions = function() {
		return( this.m_actions );
	}

	/** 
	*	retrieves the action with specified index in queue
	* @param queue (optional, if not given, 0 is assumed)
	* @param index (optional, if not given, 0 is assumed)
	*/
	this.getAction = function( queue, index ) {
		if( queue == undefined ){
			queue = 0;
		}
		if( index == undefined ){
			index = 0;
		}
		if( queue >= 0 && queue < this.m_actions.length ){
			if( this.m_actions[ queue ].length > 0 && index >= 0 && index < this.m_actions[ queue ].length ){
				return( this.m_actions[ queue ][ index ] );
			}
			else{
				return( undefined );
			}
		}
		else{
			return( undefined );
		}
	}

	/** 
	*	retrieves the list of actions at index 0 for all queues
	*/
	this.getCurrentActions = function() {
		var actions = new Array();
		for( var i = 0; i < this.m_actions.length; i++ ){
			if( this.m_actions[ i ].length ){
				actions.push( this.m_actions[ i ][ 0 ] );
			}
		}
		return( actions );
	}

	/** 
	*	sorts the queues in descending order according to action.getPriority()
	* we sort 'by hand' because sort isnt stable.
	*/
	this.sortActionsByPriority = function(){
		for( var i = 0; i < this.m_actions.length; i++ ){
			for( var j = 0; j < this.m_actions[ i ].length - 1; j++ ){
				for( var k = j + 1; k < this.m_actions[ i ].length; k++ ){
					if( this.m_actions[ i ][ j ].getPriority() < this.m_actions[ i ][ k ].getPriority() ){
						// swap
						var action = this.m_actions[ i ][ j ];
						this.m_actions[ i ][ j ] = this.m_actions[ i ][ k ];
						this.m_actions[ i ][ k ] = action;
					}
				}
			}
		}
		this.dispatchEvent( new RT.Event( 'actionssorted', this ) );
	}

	/** 
	* retrieve the priority of the action at place 0 in the requested queue
	* @return -1 if no actions are in the queues
	*/
	this.getCurrentPriority = function( queue ){
		if( queue === undefined ){
			queue = 0;
		}
		if( this.m_actions[ queue ].length ){
			return( this.m_actions[ queue ][ 0 ].getPriority() );
		}
		else{
			return( -1 );
		}
	}

	/** 
	*	updates the first action in the queue, ends any action 
	* that returned false on update
	* @param queue the queue to update
	* @return true if there was no action ended, and an action was updated.
	*/
	this.updateActions = function( queue ){
		var anyAction = false;
		var endAction = undefined;
		if( this.m_actions !== undefined ){
			if( queue >= 0 && queue < this.m_actions.length ){
				if( this.m_actions[ queue ].length ){
					if( ! this.m_actions[ queue ][ 0 ].update() ){
						endAction = this.m_actions[ queue ][ 0 ];
						endAction.end();
					}
					anyAction = true;
				}
			}
		}
		return( ( endAction === undefined ) && anyAction );
	}

	/** 
	*	gives the number of actions in a queue
	* @param queue (optional, if not given the total number of actions in all queues are summed)
	* @return the length of the array corresponding to the requested queue.
	*/
	this.getNumberOfActions = function( queue ){
		var sum = 0;
		if( queue === undefined ){
			for( var i = 0; i < this.m_actions.length; i++ ){
				sum += this.m_actions[ i ].length;
			}
		}
		else{
			sum = this.m_actions[ queue ].length;
		}
		return( sum );
	}

	/** 
	*	used by actions to determine the cell in which to start the action
	* and the cell in which to end it. Only when the action is ended
	* the setCurrentActionCell is called.
	* @return the cell that the subject is (supposed to be) in.
	*/
	this.getCurrentActionCell = function(){
		return( this.m_currentActionCell );
	}

	/** 
	*	used by actions to set the destination cell. 
	* This is only called when the action is ended.
	* @return nothing
	*/
	this.setCurrentActionCell = function( cell ){
		this.m_currentActionCell = cell;
	}

	/** 
	*	draws the first action in each queue
	* @param context the graphics context in the canvas
	* @param options draw options
	*/
	this.drawActions = function( context, options ){
		for( var i = 0; i < this.m_actions.length; i++ ){
			if( this.m_actions[ i ].length ){
				this.m_actions[ i ][ 0 ].draw( context, options );
			}
		}
	}

	return( this );
};
