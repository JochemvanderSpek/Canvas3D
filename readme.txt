The Canvas3D software lets you simply place various geometrical shapes, texts and external objects into an empty space where x and z define the ground plane, and y is up. I've tried to keep the commands similar to what you've used for canvas. There's just a 3rd dimension added to the translate, rotate and scaling commands. 

// before you start using the library, you need to create a canvas object like this:
var canvas3D = new KABK.Canvas3D();

// then you need to initialize it calling:
canvas3D.initialize();

//set the background color of the world
setBackgroundColor( r, g, b );

// set the location of the 'eye' of the camera
setCameraPosition( x, y, z )

// set the position that the camera looks at
setCameraCenter( x, y, z )

// make the camera spin automatically around the current camera center
setAutoRotate( state, speed )




The idea is that you have a 'reference axis' that determines where in the 3D space your objects are placed.
The commands that control this reference axis are:

// translate the reference axis along the current x, y and z axes
translate( x, y, z );

// rotate in radians around the x, y and z-axis 2 * Math.PI is a full circle
rotate( x, y, z );

// scale the reference axis
scale( x, y, z );

// save teh current reference axis so we can 'jump' back to it, using restore.
save();

// jumps back to a previously saved reference axis
restore();

// this function loads an object and once it is loaded, 
// the callback function is called
loadObject( url, callback )

// can save the entire scene as an .obj file
saveOBJ();

// sets the current material, which can be any of:
// 'flat': makes the material render all faces as flat, and does not suggest any round corners
// 'shaded': makes the material look smooth without any highlight
// 'wireframe': makes the object drawn as lines between the vertices
// 'phong' renders the object as shiny plastic
material( name )

// set the current color, so that any new object is drawn with this
colorRGB( r, g, b )
colorHSL( h, s, l )

// to create objects, use any of the 'box', 'cylinder', 'sphere' functions.
// and an object is created at the position, rotaton and scaling of the current
// reference axis, for instance:

var object = canvas3D.box( 10, 20, 30 );

there are four functions with which you can change the objects position, rotation and scaling,

// set the position to the center of the world
object.setPosition( 0.0, 0.0, 0.0 );
// get the current position of the object
object.getPosition();
// translate the object along the objects x-axis
object.translate( 10, 0, 0 ); 
// rotate around the x-axis
object.rotate( 0.1 * Math.PI, 0.0, 0.0 );
// scale by half
object.scale( 0.5, 0.5, 0.5 );

// you can copy any object already in the scene to the position dictated by the current reference axis
copy( object )

// ellipsoid gives you an object that interpolates between a star-shape
// and a sphere and a cube. exponent1 and 2 control the shape over the
// horizontal and vertical direction. The scaling parameters control how the object
// is being 'tapered'.
ellipsoid( width, height, depth, exponent1, exponent2, scalingStart, scalingMid, scalingEnd );

// remove an object from the scene
remove( object )

// begin describing a shape by its components of vertices and triangles
// an object consists of 'faces' or triangles, that connect three points, or 'vertices'
beginShape()

// add a point to the shape
vertex( x, y, z )

// add a triangle between three vertices, of which you give the indices as parameter
face( a, b, c )

// create a triangle immediately by giving three points using their x, y and z - positions
triangle( x1, y1, z1, x2, y2, z2, x3, y3, z3  )

// end the shape, and place it into the world
endShape()

// this function allows you to create a tree shape, calling the callback function for
// every branch it draws
tree( depth, numBranches, callback )


// a heightfield creates a 3d 'map' of a 3=2d image, that can be a canvas or
// an actual image loaded from disk. The baseHeight determines the height
// of the solid object underneath the map.
heightField( width, height, depth, image, baseHeight );

// create a heightfield based on a so called 'chladni' calculation
createChladniHeightField( width, height, depth, baseHeight, frequency, damping )

// in the animation loop, you can call the update function to calculate a new iteration
// of the chladni simulation, see https://thelig.ht/chladni/
updateChladniHeightField( frequency )

// blobs are 'gooey' spheres that blend into eachother when they get close.
blob( radius );

// the blobs are not directly visible, so after creating them, you need to call
// createBlobGeometry. When you set 'binary' to 'true', a lego-like object is formed,
// otherwise it creates a smooth surface. the 'size' is the size of the 3d volume
// that is considered, starting from the origin. only positive values are allowed
// and if any blob is (partially) outside this volume, it will be cut off. 
// the subdivision parameter determines how fine-grained the surface will be.
// be careful with this one, as it is very computationally intensive when you 
// go above say, 50. the isolevel should be set to 0.9 (or if omitted, is set to that value)
createBlobGeometry( binary, size, subdivision, isoLevel );

// for the other functions, the underlying library 'three' provides the documentary
// http://threejs.org/docs/api/extras/geometries/BoxGeometry.html
box( width, height, depth );

http://threejs.org/docs/api/extras/geometries/CylinderGeometry.html
cylinder( radiusTop, radiusBottom, height, radiusSegments, heightSegments );

// http://threejs.org/docs/#Reference/Extras.Geometries/DodecahedronGeometry
dodecahedron( radius, detail );

// http://threejs.org/docs/#Reference/Extras.Geometries/IcosahedronGeometry
icosahedron( radius, detail );

// http://threejs.org/docs/#Reference/Extras.Geometries/OctahedronGeometry
octahedron( radius, detail );

// http://threejs.org/docs/#Reference/Extras.Geometries/SphereGeometry
sphere( radius, widthSegments, heightSegments );

// http://threejs.org/docs/#Reference/Extras.Geometries/TetrahedronGeometry
terahedron( radius, detail );

// http://threejs.org/docs/#Reference/Extras.Geometries/TextGeometry
text( text, parameters );

// http://threejs.org/docs/#Reference/Extras.Geometries/TorusGeometry
torus( radius, tube, radialSegments, tubularSegments, arc );

// http://threejs.org/docs/#Reference/Extras.Geometries/TorusKnotGeometry
knot( radius, tube, radialSegments, tubularSegments, p, q, heightScale );

// http://threejs.org/docs/#Reference/Extras.Geometries/TubeGeometry
// except that 'path' is a list of points, given either as an array like this:
// [ [x1,y1,z1], [x2,y2,z2], ... ], or as a list of objects containing 'x', 'y' and 'z' properties like this:
// [ { 'x':x1, 'y':y1, 'z':z1 }, { 'x':x2, 'y':y2, 'z':z2 }, ... ]
tube( path, segments, radius, radiusSegments, closed );

In order to load external objects, use the .obj format, used for instance by MAYA and most other 3D software. It's actually quite a simple text-based format, so you *could* generate a new model from a script by outputting just a plain-text obj file if you are so inclined ;) see http://en.wikipedia.org/wiki/Wavefront_.obj_file for details.
you can save .obj files using th saveOBJ() command after you've created the geometry. The file will be downloaded by the browser into your default download folder. Open the .obj file in Meshlab (sometimes this doesnt work, in that case you have to load it in cinema4D, export it, and then load it into meshlab).

In Chrome on Mac, you can load files directly from the harddisk by starting a webserver in your working directory. Open a terminal (Applications/utilities/terminal) and type:

cd /path/to/3DCourse/folder/
python -m SimpleHTTPServer

and you will see:

Serving HTTP on 0.0.0.0 port 8000 ...

this means that a webserver is running now from your directory, allowing you to direct your browser to http://localhost:8000/example_loading_objects.htm This is actually very useful in website development, as you can run everything locally this way. I believe safari loads the page directly, but also firefox needs a local webbrowser. For Windows, you have to download python first, from https://www.python.org/downloads/.

you need this for the example_heightField_from_image.htm example and the example_loading_objects.htm.

best of luck !

J