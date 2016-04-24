"use strict";


// implement the Interface as a function that can be called by RT.addInterface (Utils.js)
RT.EventDispatcherInterface = function(){

	this.createEventDispatcherInterface = function( context ){
		this.m_context = context;
		this.m_eventListeners = {};
		this.hasEventDispatcherInterface = true;
	}

	this.initializeEventDispatcherInterface = function(){
	}

	this.destroyEventDispatcherInterface = function(){
		// TODO make destroy queue
//		for( e in this.m_eventListeners ){
//			this.m_eventListeners[ e ].splice( 0, this.m_eventListeners[ e ].length );
//			delete this.m_eventListeners[ e ];
//		}
		this.hasEventDispatcherInterface = false;
	}

	this.addEventListener = function( type, callee ){
		if( callee === undefined ){
			RT.Error( 'EventDispatcherInterface::addEventListener: adding undefined listener' );
		}
		if( ! this.m_eventListeners[ type ] ){
			this.m_eventListeners[ type ] = new Array();
		}
		// never add twice
		if( this.m_eventListeners[ type ].indexOf( callee ) == -1 ){
			this.m_eventListeners[ type ].push( callee );
		}
	}

	this.removeEventListener = function( type, callee ){
		if( this.m_eventListeners[ type ] ){
			if( callee ){
				var i = this.m_eventListeners[ type ].indexOf( callee );
				if( i >= 0 ){
					this.m_eventListeners[ type ].splice( i, 1 );
				}
			}
			else{
				this.m_eventListeners[ type ].splice( 0, this.m_eventListeners[ type ].length );
				delete this.m_eventListeners[ type ];
			}
		}
	}

	this.dispatchEvent = function( e ){
		if( this.m_eventListeners[ e.m_type ] ){
			// copy the listeners, as the listener may change the list
			var listeners = this.m_eventListeners[ e.m_type ].shallowCopy();
			for( var i = 0; i < listeners.length; i++ ){
				if( listeners[ i ] === undefined ){
					RT.trace( 'here' );
				}
				listeners[ i ].call( this.m_context || this, e );
			}
		}
	}

	return( this );
};
