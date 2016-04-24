"use strict";


 /**
    * A BehaviourSequence is a composite-BehaviourNode that 
    * requires either ALL children to be selected,
    * or at least one and selects the first sequence that can be selected
    * or selects the next child in the sequence each time select is called.
    * when setRandomized( true ) is called, the order of the children is randomized
 */
 RT.BehaviourSequence = function( subject, context ){
	RT.BehaviourNode.call( this, subject, context );

	this.m_randomized = false;

	return( this );
}

RT.makeSubClass( RT.BehaviourSequence, RT.BehaviourNode );

RT.BehaviourSequence.prototype.initialize = function() {
	RT.BehaviourNode.prototype.initialize.call( this );
}

RT.BehaviourSequence.prototype.setRandomized = function( state ) {
	this.m_randomized = state;
	if( this.m_randomized ){
		this.shuffle();
	}
}

RT.BehaviourSequence.prototype.getRandomized = function( state ) {
	return( this.m_randomized );
}

/**
 implement onSelect handler from BehaviourNode
*/
RT.BehaviourSequence.prototype.onSelect = function( queue ) {

	// if randomized, use the shuffeled array
	var children = this.m_children;
	if( this.m_randomized ){
		children = this.m_shuffleCopy;
	}

	for( var i = 0; i < children.length; i++ ){
		if( ! children[ i ].select.call( children[ i ], queue ) ){
			return( false );
		}
	}
	return( true );
}

/**
 * reshuffle when the list of children changed
*/
RT.BehaviourSequence.prototype.onAddChild = function( node ) {
	if( this.m_randomized ){
		this.shuffle();
	}
}

/**
 * clamps the this.m_lastSelected value against the number of children and
 * reshuffles when the list of children changed
*/
RT.BehaviourSequence.prototype.onRemoveChild = function() {
	if( this.m_randomized ){
		this.shuffle();
	}
}

/**
 * reimplemented from behaviourNode, called when a child dispatches a 'end'
 * event, f.i. an action that has terminated after it's animation ended
 */
RT.BehaviourSequence.prototype.onTerminateNode = function( e ) {
	var node = e.m_caller;
	for( var i = 0; i < this.m_children.length; i++ ){
		if( this.m_children[ i ] == node ){
			this.terminate();
			break;
		}
	}
}

/**
 * reshuffle the children into a randomly ordered copy of the children list
*/
RT.BehaviourSequence.prototype.shuffle = function() {
	// reshuffle when child list changed
	this.m_shuffleCopy = this.m_children.shallowCopy();
	for( var i = 1; i < this.m_shuffleCopy.length; i++ ){
		var ri = -1;
		var rj = -1;
		while( ri == rj ){
			ri = Math.min( Math.floor( Math.random() * this.m_shuffleCopy.length ), this.m_shuffleCopy.length - 1 );
			rj = Math.min( Math.floor( Math.random() * this.m_shuffleCopy.length ), this.m_shuffleCopy.length - 1 );
		}
		var tmp = this.m_shuffleCopy[ ri ];
		this.m_shuffleCopy[ ri ] = this.m_shuffleCopy[ rj ];
		this.m_shuffleCopy[ rj ] = tmp;
	}
}

