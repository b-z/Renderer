function render(camera, geometry) {
	console.log(camera, geometry);

	var clear_color = new Color();
	var draw_map = new Matrix(SIZE.width, SIZE.height, clear_color);
	var depth_map = new Matrix(SIZE.width, SIZE.height, Infinity); // 深度缓存

	
}
