"use strict";


RT.BooleanIndicatorView = function( parentNode, object, property ){
	RT.PropertyIndicatorView.call( this, parentNode, object, property );

	this.getBaseLayer().addClass( 'BooleanIndicatorView' );

	//  .PropertyIndicatorView     ->+--------------------------------+  
	//  .PropertyNameContainer     -->+-------------+ +--------------+<---- .PropertyValueContainer
	//  .PropertyName              --->m_nameLabel  | |[m_valueLabel]<---- .PropertyValue
	//                               |+-------------+ +--------------+| 
	//                               +--------------------------------+  

	var container = $( '<div class="PropertyNameContainer">' );
	this.m_nameLabel = $( '<div class="PropertyIndicatorName TextMedium">' + this.m_property + '</div>' );
	this.getBaseLayer().append( container );

	container = $( '<div class="PropertyValueContainer">' );
	this.m_valueLabel = $( '<div class="PropertyIndicatorElement BooleanCheckBox PropertyIndicatorDisabled">' );
	this.getBaseLayer().append( container );
}

RT.makeSubClass( RT.BooleanIndicatorView, RT.PropertyIndicatorView );

RT.BooleanIndicatorView.prototype.syncPropertyToView = function( e ) {
	// reimplemented from PropertyIndicatorView
	if( this.m_valueLabel.hasClass( 'BooleanCheckBoxSelected' ) ){
		this.m_object[ this.m_property ] = true;
	}
	else if( this.m_valueLabel.hasClass( 'BooleanCheckBoxUnselected' ) ){
		this.m_object[ this.m_property ] = false;
	}
}

RT.BooleanIndicatorView.prototype.syncViewToProperty = function( e ) {
	// reimplemented from PropertyIndicatorView
	if( this.m_object[ this.m_property ] == true ){
		if( this.m_valueLabel.hasClass( 'BooleanCheckBoxUnselected' ) ){
			this.m_valueLabel.removeClass( 'BooleanCheckBoxUnselected' );
		}
		if( ! this.m_valueLabel.hasClass( 'BooleanCheckBoxSelected' ) ){
			this.m_valueLabel.addClass( 'BooleanCheckBoxSelected' );
		}
	}
	else if( this.m_object[ this.m_property ] == false ){
		if( this.m_valueLabel.hasClass( 'BooleanCheckBoxSelected' ) ){
			this.m_valueLabel.removeClass( 'BooleanCheckBoxSelected' );
		}
		if( ! this.m_valueLabel.hasClass( 'BooleanCheckBoxUnselected' ) ){
			this.m_valueLabel.addClass( 'BooleanCheckBoxUnselected' );
		}
	}
}

RT.BooleanIndicatorView.prototype.setEnabled = function( state ) {
	// reimplemented from PropertyIndicatorView
	if( state ){
		if( this.m_valueLabel ){ this.m_valueLabel.removeClass( 'PropertyIndicatorDisabled' ); }
		if( this.m_valueLabel ){ this.m_valueLabel.addClass( 'PropertyIndicatorEnabled' ); }
		if( this.m_nameLabel ){ this.m_nameLabel.removeClass( 'PropertyIndicatorDisabled' ); }
		if( this.m_nameLabel ){ this.m_nameLabel.addClass( 'PropertyIndicatorEnabled' ); }
	}
	else{
		if( this.m_valueLabel ){ this.m_valueLabel.removeClass( 'PropertyIndicatorEnabled' ); }
		if( this.m_valueLabel ){ this.m_valueLabel.addClass( 'PropertyIndicatorDisabled' ); }
		if( this.m_nameLabel ){ this.m_nameLabel.removeClass( 'PropertyIndicatorEnabled' ); }
		if( this.m_nameLabel ){ this.m_nameLabel.addClass( 'PropertyIndicatorDisabled' ); }
	}
}
