"use strict";



// taken from http://paulirish.com/2011/requestanimationframe-for-smart-animating/
window.requestAnimationFrame = ( function() {
		return( window.requestAnimationFrame   	|| 
			window.webkitRequestAnimationFrame	|| 
			window.mozRequestAnimationFrame    	|| 
			window.oRequestAnimationFrame      	|| 
			window.msRequestAnimationFrame     	|| 
			function( callback ){
				window.setTimeout( callback, 1000.0 / 60.0 );
		} );
} )();


// support indexOf if not exist
if( ! Array.indexOf ){

	Object.defineProperty( Array.prototype, 'indexOf', {
	    value: function ( obj ) {
	        for( var i=0; i < this.length; i++ ){
	            if( this[ i ] == obj ){
	                return( i );
	            }
	        }
	        return( -1 );
	    },
	    enumerable: false
	} );

}

// support shallowCopy if not exist
if( ! Array.shallowCopy ){

	Object.defineProperty( Array.prototype, 'shallowCopy', {
	    value: function () {
	    	var copy = new Array();
			for( var i = 0; i < this.length; i++ ){
				copy[ i ] = this[ i ];
			}
			return( copy );
	    },
	    enumerable: false
	} );

}

// support clear if not exist
if( ! Array.clear ){

	Object.defineProperty( Array.prototype, 'clear', {
	    value: function () {
	    	this.splice( 0, this.length );
	    },
	    enumerable: false
	} );
}

RT.getObjectClass = function( obj ){
	if( obj && obj.constructor && obj.constructor.toString ){
        var arr = obj.constructor.toString().match( /function\s*(\w+)/ );

        if (arr && arr.length == 2) {
            return arr[1];
        }
    }

    return undefined;
}

RT.clone = function( obj ){
	var type = $.type( obj );

	if( type === 'function' ){
		RT.Error( "RT.clone:: can't clone a function !" );
	}
	else if( type === 'error' ){
		RT.Error( "RT.clone:: can't clone an Error object !" );
	}
	else if( type === 'object' ){
		var clone = {};
		for( var i in obj ){
			clone[ i ] = RT.clone( obj[ i ] );
		}
		return( clone );
	}
	else if( type === 'array' ){
		var clone = [];
		for( var i = 0; i < obj.length; i++ ){
			clone.push( RT.clone( obj[ i ] ) );
		}
		return( clone );
	}
	else if( type === 'date' ){
		return( new Date( obj.getTime() ) );
	}
	else if( type === 'string' ){
		return( new String( obj.valueOf() ) );
	}
	else if( type === 'boolean' ){
		return( new Boolean( obj ) );
	}
	else if( type === 'number' ){
		return( new Number( obj ) );
	}
	else if( type === 'regexp' ){
		return( new RegExp( obj.valueOf() ) );
	}
	else{
		RT.Error( "RT.clone:: don't know how to clone unknown type !" );
	}
}

// yes !
Math.TAU = 2.0 * Math.PI;

// make object A inherit from object B
RT.makeSubClass = function( subclass, superclass ) {
	subclass.prototype = new superclass();
	subclass.prototype.constructor = subclass.prototype;
}

// apply the interface function to destination, see
// http://javascriptweblog.wordpress.com/2011/05/31/a-fresh-look-at-javascript-mixins/
RT.addInterface = function( dest, iface, options ){
	iface.call( dest.prototype, options );
}

RT.getMouseX = function( e ){
	var parentOffset = $( e.currentTarget ).offset(); 
	return( e.pageX - parentOffset.left );
}

RT.getMouseY = function( e ){
	var parentOffset = $( e.currentTarget ).offset(); 
	return( e.pageY - parentOffset.top );
}

// getPageScroll() by quirksmode.com
// use getPageScroll()[0] for horizontal scrolled amount
// use getPageScroll()[1] for vertical scrolled amount
function getPageScroll() {
    var xScroll, yScroll;
    if( self.pageYOffset ){
		yScroll = self.pageYOffset;
		xScroll = self.pageXOffset;
    }
    else if( document.documentElement && document.documentElement.scrollTop ){
		yScroll = document.documentElement.scrollTop;
		xScroll = document.documentElement.scrollLeft;
    } 
    else if( document.body ){
    	// all other Explorers
		yScroll = document.body.scrollTop;
		xScroll = document.body.scrollLeft;
    }
    return( new Array( xScroll, yScroll ) );
}

// Adapted from getPageSize() by quirksmode.com
function getPageHeight() {
    var windowHeight
    if( self.innerHeight ){ 
    	// all except Explorer
		windowHeight = self.innerHeight;
    } 
    else if( document.documentElement && document.documentElement.clientHeight ){
		windowHeight = document.documentElement.clientHeight;
    } 
    else if( document.body ){ 
    	// other Explorers
		windowHeight = document.body.clientHeight;
    }
    return( windowHeight );
}

// from http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
RT.generateUUID = function() {
	return( 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace( /[xy]/g, function( c ) {
		    var r = Math.random() * 16 | 0, v = c == 'x' ? r : ( r & 0x3 | 0x8 );
		    return v.toString( 16 );
		} ) );
}

RT.uniqueIDCounter = 0;
RT.generateUniqueID = function() {
	var date = new Date();
	var components = [
	    date.getYear(),
	    date.getMonth(),
	    date.getDate(),
	    date.getHours(),
	    date.getMinutes(),
	    date.getSeconds(),
	    date.getMilliseconds(),
	    ++RT.uniqueIDCounter
	];

	var id = components.join("");	
	return( id );
}

RT.trace = function( message ) {
	try { 
		if( message === undefined ){
			RT.error( 'undefined message sent to RT.trace' );
		}
		console.log( message ); 
	} 
	catch( e ){ 
		alert( message ); 
	}
}

// from http://html5-demos.appspot.com/static/a.download.html
RT.saveFile = function( content, filename, extension ) {
	window.URL = window.webkitURL || window.URL;

	var bb = new Blob( [ content ], { type:'text/plain' } );

	var a = $( '<a>' );
	a.attr( 'download', filename + ( extension !== undefined ? extension : '' ) );
	a.attr( 'href', window.URL.createObjectURL( bb ) );
	a.attr( 'dataset.downloadurl', [ 'text/plain', filename, window.URL.createObjectURL( bb ) ].join(':') );
	a[ 0 ].click();
}

RT.loadFile = function( file, callbackProxy, type ) {
	if( FileReader ){
		var fr = new FileReader();
		if( callbackProxy ){
			fr.onload = function( oFREvent ){
				callbackProxy( oFREvent );
			};
			fr.onloadstart = function( oFREvent ){
				callbackProxy( oFREvent );
			};
			fr.onprogress = function( oFREvent ){
				callbackProxy( oFREvent );
			};
			fr.onabort = function( oFREvent ){
				callbackProxy( oFREvent );
			};
			fr.onerror = function( oFREvent ){
				callbackProxy( oFREvent );
			};
			fr.onloadend = function( oFREvent ){
				callbackProxy( oFREvent );
			};
		}		
		else{
			RT.error( 'Utils::RT.loadFile needs callbackProxy' );
		}
  		switch( type ){
			case undefined:
			case 'text':
				fr.readAsText( file );
				break;
			case 'DataURL':
				fr.readAsDataURL( file );
				break;
		}
	} 
	else {
		RT.error( 'Utils::RT.loadFile doesnt have access to FileReader' );
	    return;
	}   
}

RT.toRadians = function( degrees ){
    return( degrees * Math.PI / 180.0 );
}
RT.toDegrees = function( radians ){
    return( radians * 180.0 / Math.PI );
}


