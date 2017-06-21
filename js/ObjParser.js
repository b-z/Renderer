/**
 * @author Zhou Bowei
 */

var ObjParser = function() {

}

ObjParser.prototype = {
    constructor: ObjParser,
    parse: function(str) {
        // console.log(str);
        var geometry = new Geometry();

        var lines = str.split('\n');
        var vs = [];
        var fs = [];
        var vns = [];
        var vts = [];
        // var faceTable = [];
        for (var i = 0; i < lines.length; i++) {
            var s = lines[i].split(' ');
            if (!s.length) {
                continue;
            }
            switch (s[0]) {
                case 'v':
                    vs.push(s);
                    break;
                case 'vn':
                    vns.push(s);
                    break;
                case 'vt':
                    vts.push(s);
                    break;
                case 'f':
                    fs.push(s);
                    break;
                default:
                    console.log(lines[i]);
            }
        }

        // vs
        for (var i = 0; i < vs.length; i++) {
            geometry.vertices.push(new Vector3D(
                parseFloat(vs[i][1]),
                parseFloat(vs[i][2]),
                parseFloat(vs[i][3])
            ));
        }

        // vns
        for (var i = 0; i < vns.length; i++) {
            vns[i] = new Vector3D(
                parseFloat(vns[i][1]),
                parseFloat(vns[i][2]),
                parseFloat(vns[i][3])
            );
        }
        // fs
        for (var i = 0; i < fs.length; i++) {
            var slash = fs[i][1].split('/').length;
            var idx;
            var n_idx;
            if (slash == 1) {
                idx = [parseInt(fs[i][1]), parseInt(fs[i][2]), parseInt(fs[i][3])];
            }
            if (slash == 3) {
                idx = [parseInt(fs[i][1].split('/')[0]), parseInt(fs[i][2].split('/')[0]), parseInt(fs[i][3].split('/')[0])];
                n_idx = [parseInt(fs[i][1].split('/')[2]), parseInt(fs[i][2].split('/')[2]), parseInt(fs[i][3].split('/')[2])];
            }
            for (var j = 0; j < 3; j++) {
                if (idx[j] < 0) {
                    idx[j] += vs.length;
                } else {
                    idx[j]--;
                }
                if (n_idx) {
                    n_idx[j]--;
                }
            }
            var f = new Face();
            f[i].a = idx[0];
            f[i].b = idx[1];
            f[i].c = idx[2];
            if (n_idx) {
                f[i].na = vns[n_idx[0]];
                f[i].nb = vns[n_idx[1]];
                f[i].nc = vns[n_idx[2]];
            }
            geometry.faces.push(f);
        }

    }
}
