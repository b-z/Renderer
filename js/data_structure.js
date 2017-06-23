/**
 * @author Zhou Bowei
 */


function Geometry() {
    this.faces = [];
    this.vertices = [];
    this.color = generateRandomColor();
}

Object.assign(Geometry.prototype, {
    computeFaceCoordinates: function(camera, use_perspective) {
        var len = this.faces.length;
        for (var i = 0; i < len; i++) {
            this.faces[i].computeCoordinates(camera, use_perspective, this.vertices);
        }
    },
    drawWireframe: function(context) {
        var len = this.faces.length;
        for (var i = 0; i < len; i++) {
            this.faces[i].drawWireframe(context, this.vertices);
        }
    },
    drawRaster: function(camera, z_buffer, context) {
        var len = this.faces.length;
        for (var i = 0; i < len; i++) {
            var face = this.faces[i];
            face.drawRaster(camera, z_buffer, context, this.vertices);
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
    this.depth = Infinity;
}

Object.assign(Face.prototype, {
    computeCoordinates: function(camera, use_perspective, vertices) {
        var pa = vertices[this.a];
        var pb = vertices[this.b];
        var pc = vertices[this.c];

        this.ca.fromVector(realToScreen(camera, pa, use_perspective));
        this.cb.fromVector(realToScreen(camera, pb, use_perspective));
        this.cc.fromVector(realToScreen(camera, pc, use_perspective));
    },
    computeDepth: function(camera, vertices) {
        var pa = vertices[this.a];
        var pb = vertices[this.b];
        var pc = vertices[this.c];
        var x = (pa.x + pb.x + pc.x) / 3;
        var y = (pa.y + pb.y + pc.y) / 3;
        var z = (pa.z + pb.z + pc.z) / 3;
        var center = new Vector3D(x, y, z);
        this.depth = computeDepth(camera, center);
    },
    drawWireframe: function(context, vertices) {
        context.save();
        context.lineWidth = 1;
        context.strokeStyle = this.geometry.color;
        context.beginPath();
        context.moveTo(this.ca.x, this.ca.y);
        context.lineTo(this.cb.x, this.cb.y);
        context.lineTo(this.cc.x, this.cc.y);
        context.lineTo(this.ca.x, this.ca.y);
        context.stroke();
        context.restore();
    },
    // intersect: function(orig, end) {
    //     // orig: origin of the ray
    //     // dir: direction of the ray
    //     // v0, v1, v2: vertices of triangle
    //     // t(out): weight of the intersection for the ray
    //     // u(out), v(out): barycentric coordinate of intersection
    //     var dir = end.clone();
    //     dir.minus(orig);
    //     dir.normalize();
    //     var v0 = this.geometry.vertices[this.a].clone();
    //     var v1 = this.geometry.vertices[this.b].clone();
    //     var v2 = this.geometry.vertices[this.c].clone();
    //     var t, u, v;
    //     // E1
    //     var E1 = v1.clone();
    //     E1.minus(v0);
    //     var E2 = v2.clone();
    //     E2.minus(v0);
    //     // P
    //     var P = new Vector3D();
    //     P.cross(dir, E2);
    //
    //     // determinant
    //     var det = E1.multiplyVector(P);
    //
    //     // keep det > 0, modify T accordingly
    //     var T = orig.clone();
    //     T.minus(v0);
    //     if (det <= 0) {
    //         T.multiplyScalar(-1);
    //         det *= -1;
    //     }
    //
    //     // If determinant is near zero, ray lies in plane of triangle
    //     if (det < 0.0001)
    //         return false;
    //
    //     // Calculate u and make sure u <= 1
    //     u = T.multiplyVector(P);
    //     if (u < 0 || u > det)
    //         return false;
    //
    //     // Q
    //     var Q = new Vector3D();
    //     Q.cross(T, E1);
    //
    //     // Calculate v and make sure u + v <= 1
    //     v = dir.multiplyVector(Q);
    //     if (v < 0 || u + v > det)
    //         return false;
    //
    //     // Calculate t, scale parameters, ray intersects triangle
    //     t = E2.multiplyVector(Q);
    //
    //     var fInvDet = 1 / det;
    //     t *= fInvDet;
    //     u *= fInvDet;
    //     v *= fInvDet;
    //
    //     var ret = new Vector3D(
    //         (1 - u - v) * v0.x + u * v1.x + v * v2.x,
    //         (1 - u - v) * v0.y + u * v1.y + v * v2.y,
    //         (1 - u - v) * v0.z + u * v1.z + v * v2.z
    //     );
    //
    //     return ret;
    // },
    // intersect: function(start, end) {//a, b, c, backfaceCulling, optionalTarget) {
    //     var backfaceCulling = false;
    //     var pa = this.geometry.vertices[this.a].clone();
    //     var pb = this.geometry.vertices[this.b].clone();
    //     var pc = this.geometry.vertices[this.c].clone();
    //     var edge1 = pb.clone();
    //     edge1.minus(pa);
    //     var edge2 = pc.clone();
    //     edge2.minus(pa);
    //     var normal = new Vector3D();
    //     normal.cross(edge1, edge2);
    //     // var normal = this.normal.clone();
    //     var direction = end.clone();
    //     direction.minus(start);
    //     direction.normalize();
    //     // Solve Q + t*D = b1*E1 + b2*E2 (Q = kDiff, D = ray direction,
    //     // E1 = kEdge1, E2 = kEdge2, N = Cross(E1,E2)) by
    //     //   |Dot(D,N)|*b1 = sign(Dot(D,N))*Dot(D,Cross(Q,E2))
    //     //   |Dot(D,N)|*b2 = sign(Dot(D,N))*Dot(D,Cross(E1,Q))
    //     //   |Dot(D,N)|*t = -sign(Dot(D,N))*Dot(Q,N)
    //     // if (Math.random()<0.0001)console.log(end, start, direction, normal);
    //     var DdN = direction.multiplyVector(normal);
    //     var sign;
    //     if (DdN > 0) {
    //         if (backfaceCulling) return null;
    //         sign = 1;
    //     } else if (DdN < 0) {
    //         sign = -1;
    //         DdN = -DdN;
    //     } else {
    //         // console.log(DdN);
    //         return null;
    //     }
    //     var diff = start.clone();
    //     diff.minus(pa);
    //     var tmp0 = new Vector3D();
    //     tmp0.cross(diff, edge2);
    //     var DdQxE2 = sign * direction.multiplyVector(tmp0);
    //
    //     // b1 < 0, no intersection
    //     if (DdQxE2 < 0) {
    //         // console.log(222);
    //         return null;
    //     }
    //     var tmp = new Vector3D();
    //     tmp.cross(edge1, diff);
    //     var DdE1xQ = sign * direction.multiplyVector(tmp);
    //     // b2 < 0, no intersection
    //     if (DdE1xQ < 0) {
    //         // console.log(333);
    //
    //         return null;
    //     }
    //     // b1+b2 > 1, no intersection
    //     if (DdQxE2 + DdE1xQ > DdN) {
    //         // console.log(444);
    //
    //         return null;
    //     }
    //     // Line intersects triangle, check if ray does.
    //     var QdN = -sign * diff.multiplyVector(normal);
    //     // t < 0, no intersection
    //     if (QdN < 0) {
    //         // console.log(555);
    //
    //         return null;
    //     }
    //     // Ray intersects triangle.
    //     direction.multiplyScalar(QdN / DdN);
    //     direction.plus(start);
    //     return direction;
    // },
    intersection: function(start, end) {
        var pa = this.geometry.vertices[this.a].clone();
        var pb = this.geometry.vertices[this.b].clone();
        var pc = this.geometry.vertices[this.c].clone();
        // var sa = realToScreen()
    },
    traverse: function(foo) {
        // 对每个点(光栅的)执行foo函数
        var minx = Math.round(Math.min(this.ca.x, this.cb.x, this.cc.x));
        var miny = Math.round(Math.min(this.ca.y, this.cb.y, this.cc.y));
        var maxx = Math.round(Math.max(this.ca.x, this.cb.x, this.cc.x));
        var maxy = Math.round(Math.max(this.ca.y, this.cb.y, this.cc.y));
        for (var i = minx; i <= maxx; i++) {
            for (var j = miny; j <= maxy; j++) {
                var v = new Vector2D(i, j);
                if (v.inTriangle(this.ca, this.cb, this.cc)) {
                    // 映射到真实点
                    var ba = this.ca.clone();
                    ba.minus(this.cb);
                    var bc = this.cc.clone();
                    bc.minus(this.cb);
                    var bv = v.clone();
                    bv.minus(this.cb);
                    var projc = (ba.y * bv.x - ba.x * bv.y) / (ba.y * bc.x - ba.x * bc.y);
                    var proja = (bc.y * bv.x - bc.x * bv.y) / (bc.y * ba.x - bc.x * ba.y);

                    var pa = this.geometry.vertices[this.a].clone();
                    var pb = this.geometry.vertices[this.b].clone();
                    var pc = this.geometry.vertices[this.c].clone();
                    pa.minus(pb);
                    pa.multiplyScalar(proja);
                    pc.minus(pb);
                    pc.multiplyScalar(projc);

                    pb.plus(pa);
                    pb.plus(pc)
                    foo(v, pb); // 屏幕点、真实点
                }
            }
        }
    },
    drawRaster: function(camera, z_buffer, context, vertices) {
        var that = this;
        requestAnimationFrame(function() {
            that.traverse(function(v, p) {
                var depth = computeDepth(camera, p);
                if (v.x >= 0 && v.y >= 0 && v.x < SIZE.width && v.y < SIZE.height) {
                    if (z_buffer.data[v.x][v.y] > depth) {
                        z_buffer.data[v.x][v.y] = depth;

                        var light_vec = light.pos.clone();
                        light_vec.minus(p);
                        light_vec.normalize();

                        var light_color = new Color(0, 0, 0);
                        var ambient = light.color.clone();
                        var diffuse = light.color.clone();
                        var nl = that.normal.multiplyVector(light_vec);
                        diffuse.multiplyScalar(Math.max(0, nl));
                        var specular = light.color.clone();
                        var view_vec = camera.pos.clone();
                        view_vec.minus(p);
                        view_vec.normalize();
                        view_vec.plus(light_vec);
                        view_vec.normalize();
                        specular.multiplyScalar(Math.max(0, view_vec.multiplyVector(that.normal)));

                        light_color.add(ambient, light.ambient);
                        light_color.add(diffuse, light.diffuse);
                        if (nl > 0) {
                            light_color.add(specular, light.specular);
                        }

                        var tmp = that.geometry.color;
                        tmp = tmp.split(/[rgb(,)]+/);
                        var color = new Color(parseInt(tmp[1]),
                            parseInt(tmp[2]),
                            parseInt(tmp[3])
                        );
                        color.multiply(light_color);
                        context.save();
                        context.fillStyle = color.toString();
                        // var d = Math.floor((depth - 100000) / 100000 * 255);
                        // if (d<0)d=0;
                        // if (d>255)d=255;
                        // context.fillStyle = 'rgb('+d+','+d+','+d+')';
                        context.fillRect(v.x, v.y, 1, 1);
                        context.restore();
                    }
                }
            });
        });
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
    },
    clone: function() {
        var v = new Vector2D();
        v.fromVector(this);
        return v;
    },
    inTriangle: function(a, b, c) {
        var ta = this.toLeftTest(a, b) > 0;
        var tb = this.toLeftTest(b, c) > 0;
        var tc = this.toLeftTest(c, a) > 0;
        if (ta == tb && tb == tc) {
            return true;
        } else {
            return false;
        }
    },
    toLeftTest: function(p, q) {
        // this在pq向量的
        // 左边: <0
        // 右边: >0
        // 上面: =0
        return p.x * q.y - p.y * q.x +
            q.x * this.y - q.y * this.x +
            this.x * p.y - this.y * p.x;
    },
    minus: function(v) {
        this.x -= v.x;
        this.y -= v.y;
    },
    plus: function(v) {
        this.x += v.x;
        this.y += v.y;
    },
    length2: function() {
        var t = this.x * this.x + this.y * this.y;
        return t;
    },
    multiplyVector: function(v) {
        return this.x * v.x + this.y * v.y;
    },
    project: function(v) {
        // 在v方向上投影的长度
        return this.multiplyVector(v) / Math.sqrt(v.length2());
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



function Camera() {

}

Object.assign(Camera.prototype, {
    set: function(pos, look, distance, scale, up) {
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
    },
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

Object.assign(Color.prototype, {
    set: function(r, g, b) {
        this.r = r;
        this.g = g;
        this.b = b;
    },
    add: function(c, t) {
        this.r += c.r * t;
        this.g += c.g * t;
        this.b += c.b * t;
    },
    multiply: function(c) {
        this.r *= c.r / 255;
        this.g *= c.g / 255;
        this.b *= c.b / 255;
    },
    multiplyScalar: function(s) {
        this.r *= s;
        this.g *= s;
        this.b *= s;
    },
    clone: function() {
        var c = new Color(this.r, this.g, this.b);
        return c;
    },
    toString: function() {
        var r = Math.floor(this.r);
        if (r < 0) r = 0;
        if (r > 255) r = 255;
        var g = Math.floor(this.g);
        if (g < 0) g = 0;
        if (g > 255) g = 255;
        var b = Math.floor(this.b);
        if (b < 0) b = 0;
        if (b > 255) b = 255;
        return 'rgb(' + r + ',' + g + ',' + b + ')';
    }
});

function Light() {
    this.color = new Color(255, 255, 255);
}
