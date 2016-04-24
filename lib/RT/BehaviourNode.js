"use strict";



/** The BehaviourNode MUST always dispatch a 'terminate' event, 
 * when the selection was succesful (ie returned true). This can be done
 * later in the process (actions that run for a certain time f.i.)
 * or immediately, when the BehaviourNode does not take more time.
 * the subject must be an ActionSubjectInterface, so that we can override
 * actions when higher priority actions are needed.
 */
RT.BehaviourNode = function( subject, context ){
	this.m_context = context || this;

	this.createEventDispatcherInterface( this.m_context );

	if( subject && ! subject.hasActionSubjectInterface ){
		RT.error( new RT.Error( RT.Error.INCOMPLETE_IMPLEMENTATION, "the subject to a BehaviourNode must implement ActionSubjectInterface" ) );
	}

	this.m_subject = subject;
	this.m_children = new Array();
	this.m_tag = '';
	this.m_priority = 0;
	this.m_name = '';
	this.m_verbose = false;

	// these are added and removed from nodes that are added and removed
	this.m_onSelectNodeSuccessProxy = $.proxy( this.onSelectNodeSuccess, this.m_context );
	this.m_onSelectNodeFailProxy = $.proxy( this.onSelectNodeFail, this.m_context );
	this.m_onTerminateNodeProxy = $.proxy( this.onTerminateNode, this.m_context );

	return( this );
}

RT.addInterface( RT.BehaviourNode, RT.EventDispatcherInterface );

/** 
*/
RT.BehaviourNode.prototype.initialize = function() {

	this.initializeEventDispatcherInterface();

	if( ! this.onSelect ){
		RT.error( new RT.Error( RT.Error.INCOMPLETE_IMPLEMENTATION, "A BehaviourNode needs to implement onSelect" ) );
	}
	// onAddChild, onRemoveChild and onDraw are optional

	for( var i = 0; i < this.m_children.length; i++ ){
		this.m_children[ i ].initialize();
	}
}

RT.BehaviourNode.prototype.select = function( queue ){
	if( this.m_subject ){
		// test if we collide with the current priority in this queue
		if( this.m_priority <= this.m_subject.getCurrentPriority( queue ) ){
			if( this.getVerbose() ){
				RT.trace( 'failed priority :' + this.m_name + ( this.info ? ( ' (info: ' + this.info + ')' ) : '' ) );
			}
			this.dispatchEvent( new RT.Event( 'selectfail', this, undefined ) );
			return( false );
		}
	}
	else{
		if( this.getVerbose() ){
			RT.trace( 'warning :' + this.m_name + ' has no action subject' );
		}
	}
	if( this.onSelect.call( this.m_context, queue ) ){
		if( this.getVerbose() ){
			RT.trace( 'selected node:' + this.m_name + ( this.info ? ( ' (info: ' + this.info + ')' ) : '' ) );
		}
		this.dispatchEvent( new RT.Event( 'selectsuccess', this, undefined ) );
		return( true );
	}
	else{
		if( this.getVerbose() ){
			RT.trace( 'rejected node:' + this.m_name + ( this.info ? ( ' (info: ' + this.info + ')' ) : '' ) );
		}
		this.dispatchEvent( new RT.Event( 'selectfail', this, undefined ) );
		return( false );
	}
}

/** sets the priority of this branch of the tree, an override
* should always pass the priority down to it's children
*/
RT.BehaviourNode.prototype.setPriority = function( priority ){
	this.m_priority = priority;
	for( var i = 0; i < this.m_children.length; i++ ){
		this.m_children[ i ].setPriority( priority );
	}
}

RT.BehaviourNode.prototype.getPriority = function(){
	return( this.m_priority );
}

RT.BehaviourNode.prototype.setName = function( name ){
	this.m_name = name;
}

RT.BehaviourNode.prototype.getName = function(){
	return( this.m_name );
}

RT.BehaviourNode.prototype.setVerbose = function( state ){
	this.m_verbose = state;
}

RT.BehaviourNode.prototype.getVerbose = function(){
	return( this.m_verbose );
}

RT.BehaviourNode.prototype.draw = function( context, options ) {
	if( this.onDraw ){
		this.onDraw.call( this.m_context, context, options );
	}
}

RT.BehaviourNode.prototype.addChild = function( node ) {
	if( node instanceof RT.BehaviourNode ){
		if( ( this.m_children.indexOf( node ) == -1 ) && ( ! node.hasChild( this ) ) ){
			node.addEventListener( 'terminate', this.m_onTerminateNodeProxy );
			node.addEventListener( 'selectsuccess', this.m_onSelectNodeSuccessProxy );
			node.addEventListener( 'selectfail', this.m_onSelectNodeFailProxy );
			node.setPriority( this.m_priority );
			if( node.getName() == '' ){
				node.setName( this.getName() + '_child_' + this.m_children.length );
			}
			this.m_children.push( node );
			if( this.onAddChild ){
				this.onAddChild.call( this.m_context, node );
			}
			return( node );
		}
		else{
			// TODO error
			return( false );
		}
	}
	else{
		// TODO error
		return( false );
	}
}

RT.BehaviourNode.prototype.removeChild = function( node ) {
	if( node instanceof RT.BehaviourNode ){
		var index = this.m_children.indexOf( node );
		if( index != -1 ){
			node.removeEventListener( 'terminate', this.m_onTerminateNodeProxy );
			node.removeEventListener( 'selectsuccess', this.m_onSelectNodeSuccessProxy );
			node.removeEventListener( 'selectfail', this.m_onSelectNodeFailProxy );
			this.m_children.splice( index, 1 );
			if( this.onRemoveChild ){
				this.onRemoveChild.call( this.m_context, node );
			}
			return( true );
		}
		else{
			// TODO error
			return( false );
		}
	}
	else{
		// TODO error
		return( false );
	}
}

RT.BehaviourNode.prototype.hasChild = function( node, shallow ) {
	if( node instanceof RT.BehaviourNode ){
		// check if this has the node itself
		var index = this.m_children.indexOf( node );
		if( index != -1 ){
			return( true );
		}
		// otherwise check the children recursively
		else if( ! shallow ){
			for( var i = 0; i < this.m_children.length; i++ ){
				if( this.m_children[ i ].hasChild( node, true ) ){
					return( true );
				}
			}
		}
	}
	return( false );
}

RT.BehaviourNode.prototype.terminate = function() {
	this.dispatchEvent( new RT.Event( 'terminate', this, undefined ) );
}

RT.BehaviourNode.prototype.onSelectNodeSuccess = function( e ) {
}

RT.BehaviourNode.prototype.onSelectNodeFail = function( e ) {
}

RT.BehaviourNode.prototype.onTerminateNode = function( e ) {
	this.dispatchEvent( new RT.Event( 'terminate', this, undefined ) );
}

RT.BehaviourNode.prototype.destroy = function() {
	this.dispatchEvent( new RT.Event( 'destroy', this, undefined ) );

	for( var i = 0; i < this.m_children.length; i++ ){
		this.m_children[ i ].destroy();
	}

	this.destroyEventDispatcherInterface();
}
