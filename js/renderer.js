/**
 * @author Zhou Bowei
 */


function render(camera, geos, context) {
    console.log(camera, geos);

    context.save();
    context.fillStyle = "white";
    context.fillRect(0, 0, SIZE.width, SIZE.height);
    context.restore();

    var use_perspective = $('#perspective')[0].checked;

    if ($('#wireframe')[0].checked) {
        for (var i = 0; i < geos.length; i++) {
            geos[i].computeFaceCoordinates(camera, use_perspective);
            geos[i].drawWireframe(context);
        }
    } else if ($('#raster')[0].checked) {
        var clear_color = new Color(255, 255, 255);
        // var draw_map = new Matrix(SIZE.width, SIZE.height, clear_color);
        var z_buffer = new Matrix(SIZE.width, SIZE.height, Infinity); // 深度缓存
        for (var i = 0; i < geos.length; i++) {
            geos[i].computeFaceCoordinates(camera, use_perspective);
            geos[i].drawRaster(camera, z_buffer, context);
        }
    } else if ($('#raytracing')[0].checked) {

    }
}

function generateRandomColor() {
    var colors = ['rgb(230, 115, 115)', 'rgb(240, 98, 146)', 'rgb(186, 104, 200)', 'rgb(149, 117, 205)', 'rgb(121, 134, 203)', 'rgb(100, 181, 246)',
        'rgb(79, 195, 247)', 'rgb(76, 207, 224)', 'rgb(77, 182, 172)', 'rgb(129, 199, 132)',
        'rgb(174, 213, 129)', 'rgb(220, 231, 117)', 'rgb(255, 241, 119)', 'rgb(255, 213, 79)', 'rgb(255, 183, 77)', 'rgb(255, 138, 101)'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

function updateCamera() {
    var cx = parseFloat($('#camera_x').val());
    var cy = parseFloat($('#camera_y').val());
    var cz = parseFloat($('#camera_z').val());
    var cpos = new Vector3D(cx, cy, cz);
    var lx = parseFloat($('#look_x').val());
    var ly = parseFloat($('#look_y').val());
    var lz = parseFloat($('#look_z').val());
    var clook = new Vector3D(lx, ly, lz);
    var ux = parseFloat($('#up_x').val());
    var uy = parseFloat($('#up_y').val());
    var uz = parseFloat($('#up_z').val());
    var up = new Vector3D(ux, uy, uz);
    var scale = parseFloat($('#scale').val());
    var distance = parseFloat($('#distance').val());
    cam.set(cpos, clook, distance, scale, up);
    var lix = parseFloat($('#light_x').val());
    var liy = parseFloat($('#light_y').val());
    var liz = parseFloat($('#light_z').val());
    light.pos = new Vector3D(lix, liy, liz);
}

function realToScreen(camera, v, use_perspective) {
    // 真实坐标转换到屏幕坐标

    var p, q;
    if (use_perspective) {
        p = camera.pos.clone(); // p -> v
        q = v.clone();
        q.minus(p);
    } else {
        q = camera.normal;
        p = v.clone();
    }

    var a = camera.image_plane.a;
    var b = camera.image_plane.b;
    var c = camera.image_plane.c;
    var d = camera.image_plane.d;

    var t = (-d - (a * p.x + b * p.y + c * p.z)) /
        (a * q.x + b * q.y + c * q.z);

    var x = p.x + q.x * t - camera.image_center.x;
    var y = p.y + q.y * t - camera.image_center.y;
    var z = p.z + q.z * t - camera.image_center.z;
    var vec = new Vector3D(x, y, z);
    var sy = vec.multiplyVector(camera.up);
    var sx = vec.multiplyVector(camera.left);

    sx *= camera.scale * (use_perspective ? 1 : 2);
    sy *= camera.scale * (use_perspective ? 1 : 2);
    sx += SIZE.width / 2;
    sy += SIZE.height / 2;
    var r = new Vector2D(sx, sy);

    // console.log(v, r);
    return r;
}

function computeDepth(camera, v) {
    var tmp = v.clone();
    tmp.minus(camera.pos);
    return tmp.length2();
}
