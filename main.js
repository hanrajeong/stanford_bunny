// CMPT 361 Assignment 3
// Hanra Jeong
// 301449735

// most codes are from the given tutorial codes in CMPT361 courses
// including GraphicsProgrammingLab, JavaScriptTutorial, WebGLTutorial

var gl;
var canvas;

// to store the given bunny information from bunny.js
var vertices = [];
var faces = [];
// store the bunny to display
var positions = [];
var normPositions = [];
var tempNormPositions = [];

// this variables are for "vertex-shader" + transformation
// source for html is displayed here
// https://www.cs.uregina.ca/Links/class-info/315/WWW/Lab4/
// https://math.hws.edu/graphicsbook/c7/s2.html
// http://web.cs.wpi.edu/~emmanuel/courses/cs4731/A14/slides/lecture17.pdf

var vMatrix;
var vMatrix_store;
var projMatrix;
var projection_store;
var transMatrix = mat4();
var transformation_store;
var no;
var aspect;

// below code is from the tutorial and just changed the values
// Define a camera location
var eye = vec3(0, 0, 10);
// Define the target position
var target = vec3(0, 0, 0);
// Define the up direction
var up = vec3(0, 1, 0);
// Create view matrix.
var vMatrix = lookAt(eye, target, up);

// the assigned value is taken by trial-and-error
var spotLight = vec4(0.0, 0.0, 0.0, 0.0);
var spotLight_store;
// given condition
// The spotlight is located at (0, 4, 2) and aims at (0,0,0) initially.
var spotLightVec = vec4(0.0, 4.0, 2.0, 1.0);
var degree = 60;
degree = Math.cos(degree);
var lightspinning = false;

var pointLightMat = mat4();
// the number is found by the error and trial
var pointLight = vec4(6.0, 6.0, 0.0, 1.0);

// This is to turn on and off the light with the button p and s
// I put the default to turn on both of them
var pointLightBool = true;
var spotLightBool = true;

var lightAngle = 0;
var tmpLightAngle = 0;
var tX;
var tY;
var temptX;

var translationOriginal;
var rotationOriginal;
var transZ = 0;

var translationAfter = vec2(0, 0);
var rotationAfter = vec2(0.0, 0.0);

var click = false;
var rotating = false;


window.onload = function init() {
    
    vertices = get_vertices();
    // normPositions = new Array(vertices.length);
    faces = get_faces();

    // this code is from the given tutorial
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    for (var j = 0; j < vertices.length; j++) {
        tempNormPositions[j] = vec3(0.0, 0.0, 0.0);
    }
    // read the vertices and faces
    for(var i = 0; i < faces.length; i++) {
        var idx1 = faces[i][0] - 1;
        var idx2 = faces[i][1] - 1;
        var idx3 = faces[i][2] - 1;
        
        var ver1 = vec4(vertices[idx1]);
        var ver2 = vec4(vertices[idx2]);
        var ver3 = vec4(vertices[idx3]);
        // var v1 = vertices[faces[i][0] - 1];
        // var v2 = vertices[faces[i][1] - 1];
        // var v3 = vertices[faces[i][2] - 1];
        // var v4 = normalize(v1, v2, v3);
        positions.push(ver1);
        positions.push(ver2);
        positions.push(ver3);
        // positions.push(v4);
        // triangle normals -> this is to flatten the surface, about the detail code and explanation, please refer to the below link
        // http://www.opengl-tutorial.org/beginners-tutorials/tutorial-8-basic-shading/
        var temp1 = subtract(ver2, ver1);
        var temp2 = subtract(ver3, ver1);
        no = normalize(cross(temp1, temp2));
        var n = normalize(no);

        // normPositions.push(no);
        // normPositions.push(no);
        // normPositions.push(no);

        tempNormPositions[idx1] = add(n, tempNormPositions[idx1]);
        tempNormPositions[idx2] = add(n, tempNormPositions[idx2]);
        tempNormPositions[idx3] = add(n, tempNormPositions[idx3]);
    }

    for(var k = 0; k < faces.length; k++) {
        var idx1 = faces[k][0] - 1;
        var idx2 = faces[k][1] - 1;
        var idx3 = faces[k][2] - 1;
        // var ttt = vec3(normalize())
        normPositions.push(normalize(tempNormPositions[idx1]));
        normPositions.push(normalize(tempNormPositions[idx2]));
        normPositions.push(normalize(tempNormPositions[idx3]));
    }

    gl.viewport(0, 0, canvas.width, canvas.height);

    // set the background color to light gray because the final given image has the light gray
    // color percentage refered to the following reference
    // https://www.december.com/html/spec/colorper.html
    gl.clearColor(0.84, 0.84, 0.84, 1.0);

    // Enable depth testing
    gl.enable(gl.DEPTH_TEST);

    // Use initShaders helper to load the vertex-shader and fragment
    // shader from the html page.
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    // Use the shader program
    gl.useProgram(program);

    vMatrix_store = gl.getUniformLocation(program, "vMatrix");
    projection_store = gl.getUniformLocation(program, "projection");
    transformation_store = gl.getUniformLocation(program, "transformation");

    // Create a new vertex buffer.
    var bufferId = gl.createBuffer();
    // Bind the buffer to ARRAY_BUFFER.
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normPositions), gl.STATIC_DRAW);

    // Set the vertex attribute pointer for the normal attribute. 
    // It is okay to use the default VAO.
    var verNormal = gl.getAttribLocation(program, "verNormal");
    gl.vertexAttribPointer(verNormal, 3, gl.FLOAT, false, 0, 0);
    // Enable the vertex position attribute. 
    gl.enableVertexAttribArray(verNormal);



    // Create a new vertex buffer.
    var bufferVer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferVer); // Bind the buffer to ARRAY_BUFFER.n
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positions), gl.STATIC_DRAW);

    // Set the vertex attribute pointer for the position attribute. 
    // It is okay to use the default VAO.
    var verPosition = gl.getAttribLocation(program, "verPosition");
    gl.vertexAttribPointer(verPosition, 4, gl.FLOAT, false, 0, 0);
    // Enable the vertex position attribute. 
    gl.enableVertexAttribArray(verPosition);

    // Calculate the aspect ratio.
    aspect = canvas.width / canvas.height;


    pos = gl.getUniformLocation(program, "spotLightVec");
    gl.uniform4fv(pos, flatten(spotLightVec));

    pos = gl.getUniformLocation(program, "degree");
    gl.uniform1f(pos, degree);

    // (f) [3 marks] Phong reflection and shading
    // for the detail code, please also refer to index.html
    // about the assigned value, got the idea from 
    // https://mtrebi.github.io/2017/01/25/phong-illumination.html
    // about the code, got the idea from
    // https://learnopengl.com/Lighting/Materials

    // Implement the Phong reflection model and Phong Shading so that the bunny looks realistic and 3D. You need to compute vectors such as normals yourself.
    // This is for the phong implementation
    // on js, it is more about set the values
    // and on html, it is more about calculation

    // Assign the values to each vectors
    var ligAmbient = vec4(0.05, 0.023, 0, 1.0);
    var ligDiffuse = vec4(0.8, 0.7, 0, 1);
    var ligSpecular = vec4(1, 0.8, 0.2, 1.0);
    // This material ambient, diffuse and specular come from the following link,
    // http://devernay.free.fr/cours/opengl/materials.html
    var matAmbient = vec4(0.24725, 0.1995, 0.0745, 1.0);
    var matDiffuse = vec4(0.75164, 0.60648, 0.22648, 1.0);
    var matSpecular = vec4(0.628281, 0.555802, 0.366065, 1.0);
    // starting from the middle
    var shininess = 128 * 0.4;
    // there are 2 ways to to do this,
    // rather passing ligAmbient and matAmbient together, and then multiply in html
    // but just passing the multiplied result can be more efficient and easy, so I did the second way
    var ambientResult = mult(ligAmbient, matAmbient);
    var diffuseResult = mult(ligDiffuse, matDiffuse);
    var specularResult = mult(ligSpecular, matSpecular);
    // passing the computed result to the html
    var pos = gl.getUniformLocation(program, "ambientResult");
    gl.uniform4fv(pos, flatten(ambientResult));

    pos = gl.getUniformLocation(program, "diffuseResult");
    gl.uniform4fv(pos, flatten(diffuseResult));

    pos = gl.getUniformLocation(program, "specularResult");
    gl.uniform4fv(pos, flatten(specularResult));

    pos = gl.getUniformLocation(program, "shininess");
    gl.uniform1f(pos, shininess);


    // The horizontal and vertical movement of the mouse when 
    // the left mouse button is pressed should correspond to X and Y translation.
    // https://antonlytvynov.medium.com/html5-canvas-mouse-events-a685a76e584e
    // https://stackoverflow.com/questions/23085893/canvas-mouse-event-issue-on-mouseclick
    // when the mouse is clicked, get the initial position
    // https://stackoverflow.com/questions/47737404/detecting-left-and-right-mouse-events-for-a-canvas-game
    window.addEventListener("mousedown", function(e) {
        // left click
        // moving
        if(e.button == 0) {
            click = true;
            translationOriginal = vec2(e.clientX, e.clientY);
        }
        // right click
        // rotating
        else if(e.button == 2) {
            rotating = true;
            rotationOriginal = vec2(e.clientX, e.clientY);
        }
    });

    window.addEventListener("mousemove", function(e) {
        if(click) {
            // 3.0 is found by trial and error to smootly move the bunny
            tX = (e.clientX - translationOriginal[0])/canvas.width * 3.0;
            // console.log(tX);
            tY = (e.clientY - translationOriginal[1])/canvas.height * 3.0;
            // console.log(tY);
            translationAfter[0] += tX;
            translationAfter[1] -= tY;
            translationOriginal = vec2(e.clientX, e.clientY);
        }
        if(rotating) {
            tX = (e.clientX - rotationOriginal[0]) / canvas.width * 180;
            tY = (e.clientY - rotationOriginal[1]) / canvas.height * 180;
            transMatrix = mult(transMatrix, rotate(tX, [0, 1, 0]));
            transMatrix = mult(transMatrix, rotate(tY, [1, 0, 0]));
            rotationOriginal = vec2(e.clientX, e.clientY);
        }
    });

    window.addEventListener("mouseup", function(e) {
        if(e.button == 0) {
            click = false;
        }
        if(e.button == 0) {
            rotating = false;
        }
    });

    // https://stackoverflow.com/questions/55010695/addeventlistener-isnt-triggering-on-keypress
    // https://stackoverflow.com/questions/5597060/detecting-arrow-key-presses-in-javascript
    window.onkeydown = checkKey;
    function checkKey(e) {
        if(e.keyCode == '38') {
            transZ += 0.1;
        }
        else if(e.keyCode == '40') {
            transZ -= 0.1;
        }
        // Also implement a reset function so that whenever the user press key “r”, the bunny returns to its initial location and orientation.
        // https://css-tricks.com/snippets/javascript/javascript-keycodes/
        // r
        else if(e.keyCode == '82') {
            // to reset,
            // initialize the transformation matrix again
            transMatrix = mat4();
            // initialize the transformation matrix for point light
            pointLightMat = mat4();
            // by the given condition, starting point of the bunny is 0, 0, 0
            // thus initialize to the initial starting point
            translating = vec3(0.0, 0.0, 0.0);
        }
        // p
        else if(e.keyCode == '80') {
            if(pointLightBool == true) {
                pointLightBool = false;
            }
            else {
                pointLightBool = true;
            }
            tmpLightAngle = lightAngle;
        }
        // s
        else if(e.keyCode == '83') {
            if(spotLightBool == true) {
                spotLightBool = false;
            }
            else {
                spotLightBool = true;
            }
            temptX = tX;
        }
    };

    requestAnimationFrame(render);

};

function render() {
    gl.clear( gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);

    // Create a projection matrix.
    projMatrix = perspective(60.0, aspect, 0.1, 500.0);
    transMatrix = mult(translate(translationAfter[0], translationAfter[1], transZ), transMatrix);
    // console.log(translationAfter);
    // console.log(transMatrix[1]);
    pointLightMat = mult(rotate(1, [0, 1, 0]), mult(translate(translationAfter[0], translationAfter[1], transZ), pointLightMat));

    translationAfter = vec2(0, 0);
    transZ = 0;

    var pos2 = gl.getUniformLocation(program, "pointLightBool");
    var pos3 = gl.getUniformLocation(program, "spotLightBool")
    if(pointLightBool) {
        gl.uniform1i(pos2, 1);
        lightAngle += 0.1;
    }
    else {
        gl.uniform1i(pos2, 0);
        lightAngle = tmpLightAngle;
    }
    if(spotLightBool) {
        gl.uniform1i(pos3, 1);
        tX += 0.3;
    }
    else {
        gl.uniform1i(pos3, 0);
        tX = temptX;
    }

    // while(true) {
    //     var ch;
    //     if(spotLight[0] < -20) {
    //         ch = 0.1;
    //     }
    //     else if(spotLight[0] > 20) {
    //         ch = -0.1;
    //     }
    //     spotLight+=ch;
    // };
    // this code is running itself recursively,
    // so rather than implement it with the while loop, I implemented with the if statement
    // Requirement :
    // The spotlight has a cutoff angle of 30 degrees and an angular attenuation coefficient e=1.
    if(lightspinning == true) {
        spotLight[0] = spotLight[0] - 0.1;
        if(spotLight[0] < -30.0) {
            lightspinning = false;
        }
    }
    else {
        spotLight[0] = spotLight[0] + 0.1;
        if(spotLight[0] > 30.0) {
            lightspinning = true;
        }
    }

    var pos4 = gl.getUniformLocation(program, "pointLightMat");
    gl.uniformMatrix4fv(pos4, false, flatten(pointLightMat));

    gl.uniformMatrix4fv(transformation_store, false, flatten(transMatrix));
    gl.uniformMatrix4fv(vMatrix_store, false, flatten(vMatrix));
    gl.uniformMatrix4fv(projection_store, false, flatten(projMatrix));

    var pos5 = gl.getUniformLocation(program, "pointLight");
    gl.uniform4fv(pos5, flatten(pointLight));
    spotLight_store = gl.getUniformLocation(program, "spotLight");
    gl.uniform4fv(spotLight_store, flatten(spotLight));

    gl.drawArrays(gl.TRIANGLES, 0, positions.length);

    // Call this function repeatedly
    requestAnimationFrame(render);
}