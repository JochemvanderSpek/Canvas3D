"use strict";

RT.BooleanEditView = function( parentNode, object, property ){
	RT.PropertyEditView.call( this, parentNode, object, property );

	this.getBaseLayer().addClass( 'BooleanEditView' );

	/*
	  .PropertyEditContainer        -->+-------------------------------+  
	  .PropertyEditElementContainer --->+-------------+ +-------------+<---- .PropertyEditNameContainer
	  .PropertyEditElement          ---->m_editElement| |[m_nameLabel]<----- .PropertyEditName
	   .BooleanCheckBox                |+-------------+ +-------------+|  
	                                   +-------------------------------+

	*/

	var editContainer = $( '<div class="PropertyEditContainer">' );

	var container = $( '<div class="PropertyEditElementContainer">' );
	this.m_editElement = $( '<div class="PropertyEditElement BooleanCheckBox">' );
	this.m_editElement.on( 'mousedown', $.proxy( this.onValueChange, this ) );
	container.append( this.m_editElement );
	editContainer.append( container );

	container = $( '<div class="PropertyEditNameContainer">' );
	this.m_nameLabel = $( '<div class="PropertyEditName TextMedium">' + this.m_property + '</div>' );
	container.append( this.m_nameLabel );
	editContainer.append( container );

	this.getBaseLayer().append( editContainer );
}

RT.makeSubClass( RT.BooleanEditView, RT.PropertyEditView );

RT.BooleanEditView.prototype.onValueChange = function( e ) {
	e.stopPropagation();
	if( this.m_editElement.hasClass( 'BooleanCheckBoxSelected' ) ){
		this.m_editElement.removeClass( 'BooleanCheckBoxSelected' );
		this.m_editElement.addClass( 'BooleanCheckBoxUnselected' );
	}
	else if( this.m_editElement.hasClass( 'BooleanCheckBoxUnselected' ) ){
		this.m_editElement.removeClass( 'BooleanCheckBoxUnselected' );
		this.m_editElement.addClass( 'BooleanCheckBoxSelected' );
	}

	this.syncPropertyToView();

	if( this.m_valueElement ){
		this.m_valueElement.html( this.m_object[ this.m_property ] );
	}
	
	this.dispatchEvent( new RT.Event( 'valuechanged', this, this.getValue() ) );
}

RT.BooleanEditView.prototype.syncPropertyToView = function( e ) {
	// reimplemented from PropertyEditView
	if( this.m_editElement.hasClass( 'BooleanCheckBoxSelected' ) ){
		this.m_object[ this.m_property ] = true;
	}
	else if( this.m_editElement.hasClass( 'BooleanCheckBoxUnselected' ) ){
		this.m_object[ this.m_property ] = false;
	}
}

RT.BooleanEditView.prototype.syncViewToProperty = function( e ) {
	// reimplemented from PropertyEditView
	if( this.m_object[ this.m_property ] == true ){
		if( this.m_editElement.hasClass( 'BooleanCheckBoxUnselected' ) ){
			this.m_editElement.removeClass( 'BooleanCheckBoxUnselected' );
		}
		if( ! this.m_editElement.hasClass( 'BooleanCheckBoxSelected' ) ){
			this.m_editElement.addClass( 'BooleanCheckBoxSelected' );
		}
	}
	else if( this.m_object[ this.m_property ] == false ){
		if( this.m_editElement.hasClass( 'BooleanCheckBoxSelected' ) ){
			this.m_editElement.removeClass( 'BooleanCheckBoxSelected' );
		}
		if( ! this.m_editElement.hasClass( 'BooleanCheckBoxUnselected' ) ){
			this.m_editElement.addClass( 'BooleanCheckBoxUnselected' );
		}
	}
}

RT.BooleanEditView.prototype.setEnabled = function( state ) {
	// reimplemented from PropertyEditView
	if( state ){
		if( this.m_editElement ){ this.m_editElement.removeAttr( 'disabled' ); }
		if( this.m_editElement ){ this.m_editElement.removeClass( 'PropertyEditDisabled' ); }
		if( this.m_editElement ){ this.m_editElement.addClass( 'PropertyEditEnabled' ); }
		if( this.m_nameLabel ){ this.m_nameLabel.removeClass( 'PropertyEditDisabled' ); }
		if( this.m_nameLabel ){ this.m_nameLabel.addClass( 'PropertyEditEnabled' ); }
	}
	else{
		if( this.m_editElement ){ this.m_editElement.attr( 'disabled', 'disabled' ); }
		if( this.m_editElement ){ this.m_editElement.removeClass( 'PropertyEditEnabled' ); }
		if( this.m_editElement ){ this.m_editElement.addClass( 'PropertyEditDisabled' ); }
		if( this.m_nameLabel ){ this.m_nameLabel.removeClass( 'PropertyEditEnabled' ); }
		if( this.m_nameLabel ){ this.m_nameLabel.addClass( 'PropertyEditDisabled' ); }
	}
}
