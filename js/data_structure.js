/**
 * @author Zhou Bowei
 */


function Geometry() {
    this.faces = [];
    this.vertices = [];
}

Object.assign(Geometry.prototype, {
    computeFaceCoordinates: function(camera) {
        var len = this.faces.length;
        for (var i = 0; i < len; i++) {
            this.faces[i].computeCoordinates(camera, this.vertices);
        }
    },
    testDraw: function(camera, context) {
        var len = this.faces.length;
        for (var i = 0; i < len; i++) {
            this.faces[i].testDraw(camera, context, this.vertices);
        }
    }
});

function Face() {
    this.a = -1;
    this.b = -1;
    this.c = -1;
    this.na = new Vector3D();
    this.nb = new Vector3D();
    this.nc = new Vector3D();
    this.ca = new Vector2D(); // 三个顶点对应的屏幕坐标
    this.cb = new Vector2D(); //
    this.cc = new Vector2D(); //

    this.normal = new Vector3D();

}

Object.assign(Face.prototype, {
    computeCoordinates: function(camera, vertices) {
        var pa = vertices[this.a];
        var pb = vertices[this.b];
        var pc = vertices[this.c];

        this.ca.fromVector(realToScreen(camera, pa));
        this.cb.fromVector(realToScreen(camera, pb));
        this.cc.fromVector(realToScreen(camera, pc));
    },
    testDraw: function(camera, context, vertices) {
        context.save();
        context.lineWidth = 1;
        context.strokeStyle = 'black';
        context.beginPath();
        context.moveTo(this.ca.x, this.ca.y);
        context.lineTo(this.cb.x, this.cb.y);
        context.lineTo(this.cc.x, this.cc.y);
        context.lineTo(this.ca.x, this.ca.y);
        context.stroke();
        context.restore();
    }
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
    },
    clone: function() {
        var v = new Vector3D();
        v.fromVector(this);
        return v;
    },
    minus: function(v) {
        this.x -= v.x;
        this.y -= v.y;
        this.z -= v.z;
    },
    plus: function(v) {
        this.x += v.x;
        this.y += v.y;
        this.z += v.z;
    },
    normalize: function() {
        var t = this.length2();
        t = Math.sqrt(t);
        this.x /= t;
        this.y /= t;
        this.z /= t;
    },
    multiplyScalar: function(s) {
        this.x *= s;
        this.y *= s;
        this.z *= s;
    },
    multiplyVector: function(v) {
        return this.x * v.x +
            this.y * v.y +
            this.z * v.z;
    },
    length2: function() {
        var t = this.x * this.x + this.y * this.y + this.z * this.z;
        return t;
    },
    cross: function(a, b) {
        // 把当前向量设置成两个向量的叉积
        this.x = a.y * b.z - a.z * b.y;
        this.y = a.z * b.x - a.x * b.z;
        this.z = a.x * b.y - a.y * b.x;
    }
});

function Vector2D(x, y) {
    this.x = x || 0;
    this.y = y || 0;
}

Object.assign(Vector2D.prototype, {
    fromVector: function(n) {
        this.x = n.x;
        this.y = n.y;
    }
});

function Plane(a, b, c, d) {
    // ax+by+cz+d=0
    this.a = a || 0;
    this.b = b || 0;
    this.c = c || 0;
    this.d = d || 0;
}

Object.assign(Plane.prototype, {
    fromPointAndNormal: function(p, n) {
        this.a = n.x;
        this.b = n.y;
        this.c = n.z;
        this.d = n.x * p.x + n.y * p.y + n.z * p.z;
    }
});



function Camera(pos, look, distance, scale, up) {
    // 相机位置
    // 朝向
    // 像平面距离
    // 像平面坐标/真实坐标之间的换算比例
    this.pos = pos;
    this.look = look;
    this.distance = distance;
    this.scale = scale;
    this.normal = new Vector3D();
    this.up = up;
    this.left = new Vector3D();
    this.image_plane = new Plane();
    this.image_center = new Vector3D();
    this.computeImagePlane();
}

Object.assign(Camera.prototype, {
    lookAt: function(p) {
        this.look.fromVector(p);
        this.computeImagePlane();
    },
    setPosition: function(p) {
        this.pos.fromVector(p);
        this.computeImagePlane();
    },
    computeImagePlane: function() {
        // 计算像平面
        var n = this.look.clone();
        n.minus(this.pos);
        n.normalize();

        this.normal.fromVector(n);

        var tmp = n.clone();
        tmp.multiplyScalar(this.up.multiplyVector(n));
        this.up.minus(tmp);
        this.up.normalize();

        this.left.cross(this.up, this.normal);
        this.left.normalize();

        var p = this.pos.clone();
        n.multiplyScalar(this.distance);
        p.plus(n);
        this.image_center.fromVector(p);
        this.image_plane.fromPointAndNormal(p, n);
        // console.log(this);
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
