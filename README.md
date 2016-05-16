# Canvas3D
*a simple, entry level library to create 3D shapes using javascript*

The Canvas3D software lets you simply place various geometrical shapes, texts and external objects into an empty space where x and z define the ground plane, and y is up. I've tried to keep the commands similar to what you've used for canvas. There's just a 3rd dimension added to the translate, rotate and scaling commands.

![screenshot 1](/rsrc/screenshots/screenshot_01.jpg?raw=true "screenshot 1")

- [Getting started](#getting-started)
    - [Canvas](#canvas)
    - [World, Camera](#world-camera)
    - [Reference Axis](#reference-axis)
    - [Loading and saving objects](#loading-and-saving-objects)
    - [Materials](#materials)
    - [Creating and manipulating objects](#creating-and-manipulating-objects)
- [Objects](#objects)
    - [Manipulations](#manipulations)
    - [More shapes](#more-shapes)
    - [Three JS shapes and functions](#three-js-shapes-and-functions)

##Getting started

In order to run all the examples, you have to start a webserver in the directory where all the examples reside. To do this, open a terminal 

    Applications/utilities/terminal

and type:

    cd /path/to/Canvas3D/
    
if you don't know the path where the Canvas3D-3.0 files are created, you can type 'cd ' in the terminal (without quotes but with the trailing space) and then drag and drop the Canvas3D-3.0 folder from the finder onto the terminal. This will result in the name of the folder being appended as text to the 'cd' command.

then hit 'enter' and type:
    
    python -m SimpleHTTPServer

and you will see:

    Serving HTTP on 0.0.0.0 port 8000 ...

This means that a webserver is running now from your directory, allowing you to direct your browser to 
    
    http://localhost:8000/example_loading_objects.htm
    
or to 

    http://localhost:8000
    
which shows you all the files in the Canvas3D-3.0 directory.

This is actually very useful in website development, as you can run everything locally this way. For Windows, you have to download python first, from [https://www.python.org/downloads/](https://www.python.org/downloads/).

###Canvas

Before you start using the library, you need to create a canvas object like this:

    var canvas3D = new KABK.Canvas3D();

then you need to initialize it calling:

    canvas3D.initialize();

###World, Camera

Set the background color of the world

    setBackgroundColor( r, g, b );

Set the location of the 'eye' of the camera

    setCameraPosition( x, y, z );

Set the position that the camera looks at

    setCameraCenter( x, y, z );

Make the camera spin automatically around the current camera center

    setAutoRotate( state, speed );

###Reference Axis

The idea is that you have a 'reference axis' that determines where in the 3D space your objects are placed.

The commands that control this reference axis are as following;

Translate the reference axis along the current x, y and z axes

    translate( x, y, z );

Rotate in radians around the x, y and z-axis 2 * Math.PI is a full circle

    rotate( x, y, z );

Scale the reference axis

    scale( x, y, z );

Save the current reference axis so we can 'jump' back to it, using restore.

    save();

Jumps back to a previously saved reference axis

    restore();

###Loading and saving objects

This function loads an object and once it is loaded, the callback function is called

    loadObject( url, callback );

You can save the entire scene as an .obj file

    saveOBJ();

###Materials

Set the current material

    material( name );

Which can be any of:

- flat : makes the material render all faces as flat, and does not suggest any round corners
- shaded : makes the material look smooth without any highlight
- wireframe : makes the object drawn as lines between the vertices
- phong : renders the object as shiny plastic.

Set the current color, so that any new object is drawn with this

    colorRGB( r, g, b );
    colorHSL( h, s, l );

##Creating and manipulating objects

###Objects

To create objects, use any of the 'box', 'cylinder' or 'sphere' functions. An object is created at the position, rotation and scaling of the current reference axis, for instance:

    var object = canvas3D.box( 10, 20, 30 );

###Manipulations

There are four functions with which you can change the objects position, rotation and scaling

Set the position to the center of the world
    
    object.setPosition( 0.0, 0.0, 0.0 );

Get the current position of the object

    object.getPosition();

Translate the object along the objects x-axis
    
    object.translate( 10, 0, 0 ); 

Rotate around the x-axis
    
    object.rotate( 0.1 * Math.PI, 0.0, 0.0 );

Scale by half
    
    object.scale( 0.5, 0.5, 0.5 );

You can copy any object already in the scene to the position dictated by the current reference axis

    copy( object );

Remove an object from the scene
    
    remove( object );

###More shapes

Ellipsoid gives you an object that interpolates between a star-shape and a sphere and a cube. exponent1 and 2 control the shape over the horizontal and vertical direction. The scaling parameters control how the object is being 'tapered'.

    ellipsoid( width, height, depth, exponent1, exponent2, scalingStart, scalingMid, scalingEnd );


Begin describing a shape by its components of vertices and triangles.  
An object consists of 'faces' or triangles, that connect three points, or 'vertices'

    beginShape();

Add a point to the shape

    vertex( x, y, z );

Add a triangle between three vertices, of which you give the indices as parameter

    face( a, b, c );

Create a triangle immediately by giving three points using their x, y and z - positions

    triangle( x1, y1, z1, x2, y2, z2, x3, y3, z3  );

End the shape, and place it into the world

    endShape();

Summing up:

    beginShape();
    vertex( x, y, z );
    face( a, b, c );
    triangle( x1, y1, z1, x2, y2, z2, x3, y3, z3  );
    endShape();

This function allows you to create a tree shape, calling the callback function for every branch it draws

    tree( depth, numBranches, callback );

A heightfield creates a 3d 'map' of a 3=2d image, that can be a canvas or an actual image loaded from disk. The baseHeight determines the height of the solid object underneath the map.

    heightField( width, height, depth, image, baseHeight );

Create a heightfield based on a so called 'chladni' calculation

    createChladniHeightField( width, height, depth, baseHeight, frequency, damping );

In the animation loop, you can call the update function to calculate a new iteration of the chladni simulation, see [https://thelig.ht/chladni/](https://thelig.ht/chladni/)

    updateChladniHeightField( frequency );

Blobs are 'gooey' spheres that blend into eachother when they get close.

    blob( radius );

The blobs are not directly visible, so after creating them, you need to call createBlobGeometry. When you set 'binary' to 'true', a lego-like object is formed, otherwise it creates a smooth surface. the 'size' is the size of the 3d volume that is considered, starting from the origin. only positive values are allowed. If any blob is (partially) outside this volume, it will be cut off. The subdivision parameter determines how fine-grained the surface will be.  
Be careful with this one, as it is very computationally intensive when you go above say, 50. the isolevel should be set to 0.9 (or if omitted, is set to that value).

    createBlobGeometry( binary, size, subdivision, isoLevel );

###Three JS shapes and functions

For the other functions, the underlying library 'three' provides the documentation 

Box
[http://threejs.org/docs/api/extras/geometries/BoxGeometry.html]()

    box( width, height, depth );

Cylinder
[http://threejs.org/docs/api/extras/geometries/CylinderGeometry.html]()

    cylinder( radiusTop, radiusBottom, height, radiusSegments, heightSegments );

Dodecahedron
[http://threejs.org/docs/#Reference/Extras.Geometries/DodecahedronGeometry]()

    dodecahedron( radius, detail );

Icosahedron
[http://threejs.org/docs/#Reference/Extras.Geometries/IcosahedronGeometry]()

    icosahedron( radius, detail );

Octahedron
[http://threejs.org/docs/#Reference/Extras.Geometries/OctahedronGeometry]()

    octahedron( radius, detail );

Sphere
[http://threejs.org/docs/#Reference/Extras.Geometries/SphereGeometry]()

    sphere( radius, widthSegments, heightSegments );

Tetrahedron
[http://threejs.org/docs/#Reference/Extras.Geometries/TetrahedronGeometry]()

    tetrahedron( radius, detail );

Text
[http://threejs.org/docs/#Reference/Extras.Geometries/TextGeometry]()

    text( text, parameters );

Torus
[http://threejs.org/docs/#Reference/Extras.Geometries/TorusGeometry]()

    torus( radius, tube, radialSegments, tubularSegments, arc );

Knot
[http://threejs.org/docs/#Reference/Extras.Geometries/TorusKnotGeometry]()

    knot( radius, tube, radialSegments, tubularSegments, p, q, heightScale );

Tube
[http://threejs.org/docs/#Reference/Extras.Geometries/TubeGeometry]()

except that 'path' is a list of points, given either as an array like this:  

    [ [x1,y1,z1], [x2,y2,z2], ... ];

or as a list of objects containing 'x', 'y' and 'z' properties like this:

    [ { 'x':x1, 'y':y1, 'z':z1 }, { 'x':x2, 'y':y2, 'z':z2 }, ... ];

    tube( path, segments, radius, radiusSegments, closed );

