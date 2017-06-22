/**
 * @author Zhou Bowei
 */


function render(camera, geometry) {
    console.log(camera, geometry);

    var clear_color = new Color();
    var draw_map = new Matrix(SIZE.width, SIZE.height, clear_color);
    var depth_map = new Matrix(SIZE.width, SIZE.height, Infinity); // 深度缓存

    geometry.computeFaceCoordinates(camera);
}

function realToScreen(camera, v) {
    // 真实坐标转换到屏幕坐标

    var p = camera.pos.clone(); // p -> v
    var q = v.clone();
    q.minus(p);
    // 参数方程:
    // x = p.x + q.x * t;
    // y = p.y + q.y * t;
    // z = p.z + q.z * t;

    var a = camera.plane.a;
    var b = camera.plane.b;
    var c = camera.plane.c;
    var d = camera.plane.d;

    var t = (-d - (a * p.x + b * p.y + c * p.z)) /
        (a * q.x + b * q.y + c * q.z);

    var x = p.x + q.x * t - camera.image_center.x;
    var y = p.y + q.y * t - camera.image_center.y;
    var z = p.z + q.z * t - camera.image_center.z;
    var vec = new Vector3D(x, y, z);
    var sy = vec.multiplyVector(camera.up);
    var sx = vec.multiplyVector(camera.left);
    
    var r = new Vector2D(sx, sy);
    console.log(v, r);
    return r;
}
