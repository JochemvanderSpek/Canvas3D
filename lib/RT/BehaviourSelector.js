"use strict";


 /**
    * A BehaviourSelector is a composite-BehaviourNode that 
    * selects the first node in the sequence that selects true
    * or selects a random node
    * @abstract
 */
 RT.BehaviourSelector = function( subject, context ){
	RT.BehaviourNode.call( this, subject, context );

	this.m_selected = undefined;
	this.m_randomized = false;

	return( this );
}

RT.makeSubClass( RT.BehaviourSelector, RT.BehaviourNode );

RT.BehaviourSelector.prototype.initialize = function() {
	RT.BehaviourNode.prototype.initialize.call( this );
	if( this.m_randomized ){
		this.shuffle();
	}
}

RT.BehaviourSelector.prototype.setRandomized = function( state ) {
	this.m_randomized = state;
	if( this.m_randomized ){
		this.shuffle();
	}
}

RT.BehaviourSelector.prototype.getRandomized = function( state ) {
	return( this.m_randomized );
}

/**
 implement onSelect handler from BehaviourNode
*/
RT.BehaviourSelector.prototype.onSelect = function( queue ) {
	this.m_selected = undefined;

	// if randomized, use the shuffeled array
	var children = this.m_children;
	if( this.m_randomized ){
		this.shuffle();
		children = this.m_shuffleCopy;
	}

	for( var i = 0; i < children.length; i++ ){
		if( children[ i ].select.call( children[ i ], queue ) ){
			this.m_selected = children[ i ];
			this.info = '' + this.getName() + ' selected ' + children[ i ].getName();
			return( true );
		}
		else{
			this.info = '' + this.getName() + ' rejected ' + children[ i ].getName();
		}

	}
	return( false );
}

/**
 get the selected node
*/
RT.BehaviourSelector.prototype.getSelected = function() {
	return( this.m_selected );
}	

/**
 * invalidate the selected node if it is removed.
*/
RT.BehaviourSelector.prototype.onRemoveChild = function( node ) {
	if( this.m_selected == node ){
		this.m_selected = undefined;
	}
	if( this.m_randomized ){
		this.shuffle();
	}
}

/**
 * reshuffle
*/
RT.BehaviourSelector.prototype.onAddChild = function( node ) {
	if( this.m_randomized ){
		this.shuffle();
	}
}

/**
 * reimplemented from behaviourNode, called when a child dispatches a 'end'
 * event, f.i. an action that has terminated after it's animation ended
 */
RT.BehaviourSelector.prototype.onEndNode = function( e ) {
	var node = e.m_caller;
	for( var i = 0; i < this.m_children.length; i++ ){
		if( this.m_children[ i ] == node ){
			this.end();
			break;
		}
	}
}

/**
 * reshuffle the children into a randomly ordered copy of the children list
*/
RT.BehaviourSelector.prototype.shuffle = function() {
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

