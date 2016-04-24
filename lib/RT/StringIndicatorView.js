"use strict";

RT.StringIndicatorView = function( parentNode, object, property ){
	RT.PropertyIndicatorView.call( this, parentNode, object, property );

	this.getBaseLayer().addClass( 'StringIndicatorView' );

	/*
	    .StringIndicatorView         -->+--------------------------------+
	    .PropertyNameContainer       --->+-------------+ +--------------+<--- .PropertyValueContainer  
	    .PropertyName                ---->m_nameLabel  | |[m_valueLabel]<---- .PropertyValue
	                                    |+-------------+ +--------------+|
	                                    +--------------------------------+
	*/
	var container = $( '<div class="PropertyNameContainer">' );
	this.m_nameLabel = $( '<div class="PropertyName TextMedium">' + this.m_property + '</div>' );
	this.getBaseLayer().append( container );

	container = $( '<div class="PropertyValueContainer">' );
	this.m_valueLabel = $( '<div class="PropertyValue">' );
	this.getBaseLayer().append( container );
}

RT.makeSubClass( RT.StringIndicatorView, RT.PropertyEditView );

RT.StringIndicatorView.prototype.syncPropertyToView = function( e ) {
	// reimplemented from StringIndicatorView
	var value = this.m_valueLabel.html();
	if( this.m_object[ this.m_property ] != value ){
		this.m_object[ this.m_property ] = value;
		return( true );
	}
	else{
		return( false );
	}
}

RT.StringIndicatorView.prototype.syncViewToProperty = function( e ) {
	// reimplemented from StringIndicatorView
	var value = this.m_object[ this.m_property ];
	var ev = ( '' + this.m_editElement.html() );
	if( ev != ( '' + value ) ){
		this.m_valueLabel.html( value );
		return( true );
	}
	else{
		return( false );
	}
}
