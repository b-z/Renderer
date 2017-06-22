/**
 * @author Zhou Bowei
 */


function Geometry() {
    this.faces = [];
    this.vertices = [];
}

Object.assign(Geometry.prototype, {

});

function Face() {
    this.a = -1;
    this.b = -1;
    this.c = -1;
    this.na = new Vector3D();
    this.nb = new Vector3D();
    this.nc = new Vector3D();

    this.normal = new Vector3D();
}

Object.assign(Face.prototype, {

});

function Vector3D(x, y, z) {
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
}

Object.assign(Vector3D.prototype, {
    fromVector: function(n) {
        this.x = n.x;
        this.y = n.y;
        this.z = n.z;
    }
});



function Camera(pos, look) {
    this.pos = pos;
    this.look = look;
}

Object.assign(Camera.prototype, {
    lookAt: function(p) {
        this.look.fromVector(p);
    },
    setPosition: function(p) {
        this.pos.fromVector(p);
    }
});

function Matrix(nx, ny, init) {
    this.data = [];
    for (var i = 0; i < nx; i++) {
        var tmp = [];
        for (var j = 0; j < ny; j++) {
            tmp.push(init);
        }
        this.data.push(tmp);
    }
}

Object.assign(Matrix.prototype, {

});

function Color(r, g, b) {
    this.r = r || 0;
    this.g = g || 0;
    this.b = b || 0;
}
