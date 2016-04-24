"use strict";


RT.Dialog = function( parentElement, filename, callbackOK, callbackCancel ){

	this.m_id = filename.replace( /[.\/]/g, "_" );

	this.m_callbackOK = callbackOK;
	this.m_callbackCancel = callbackCancel;

	var baseLayer = document.createElement( 'div' ); 
	baseLayer.setAttribute( 'id', this.m_id + 'baseLayer' ); 
	parentElement.appendChild( baseLayer );

	$( '#' + this.m_id + 'baseLayer' ).load( filename, $.proxy( this.initialize, this ) );
}

RT.Dialog.prototype.initialize = function() {
	var onOK = $.proxy( this.onOK, this );
	var onCancel = $.proxy( this.onCancel, this );

	$( '#' + this.m_id + 'baseLayer #OKButton' ).click( onOK );
	$( '#' + this.m_id + 'baseLayer #CancelButton' ).click( onCancel );
}

RT.Dialog.prototype.onOK = function( event ) {
	event.preventDefault();
	if( this.m_callbackOK ){
		this.m_callbackOK( this.m_userData );
	}
}

RT.Dialog.prototype.onCancel = function( event ) {
	event.preventDefault();
	if( this.m_callbackCancel ){
		this.m_callbackCancel( this.m_userData );
	}
}
