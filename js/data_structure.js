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

});
