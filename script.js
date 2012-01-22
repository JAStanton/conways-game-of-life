/* Author: Jonathan Stanton

*/

var CONWAY = function() {
	
	//private functions
	Object.prototype.clone = function() {
	var newObj = (this instanceof Array) ? [] : {};
	for (var i in this) {
		if (i == 'clone') continue;
			if (this[i] && typeof this[i] == "object") {
				newObj[i] = this[i].clone();
			} else newObj[i] = this[i];
		} return newObj;
	};

	return {
		init : function() {
			document.onkeydown = this.KeyCheck;
			document.onmouseup = this.mouse_up;
			var canvas = document.getElementById('conway');
			canvas.onmousedown = this.mouse_down;
			canvas.onmousemove = this.mouse_move;
			this.drawing = false;
			this.width = canvas.getAttribute("width");
			this.height = canvas.getAttribute("height");
			this.blockSize = canvas.getAttribute('data-size') * 1;
			this.ctx = canvas.getContext('2d');
			this.status = "paused";
			this.draw_mode = false;
			this.cells = [];
			this.create_grid();
			this.init_populate();
			this.draw_board();
			this.draw_cells();
			this.draw_pause();
		},
		mouse_move : function(){
			var x = event.offsetX,
				y = event.offsetY;

			if(CONWAY.drawing && CONWAY.draw_mode){
				CONWAY.mouse_draw(x,y,"red",true);
			}
		},
		mouse_draw : function(x,y,color,add){
			var x_mod = x % CONWAY.blockSize, 
				y_mod = y % CONWAY.blockSize,
				block_x = x - x_mod,
				block_y = y - y_mod,
				col = block_x / CONWAY.blockSize,
				row = block_y / CONWAY.blockSize;

			CONWAY.ctx.fillStyle = color; 
			CONWAY.ctx.fillRect(block_x,block_y,CONWAY.blockSize,CONWAY.blockSize);
			if(add) CONWAY.add_cell(col,row);
		},
		mouse_down : function(){ 
			CONWAY.drawing = true;
			if(CONWAY.draw_mode) CONWAY.mouse_draw(event.offsetX,event.offsetY,"red",true);
		},
		mouse_up : function(){ CONWAY.drawing = false; },
		init_populate : function(){
			this.add_cells([[1,0],[2,1],[2,2],[1,2],[0,2]]); //glider
			// this.add_cells([[10,10],[09,11],[10,11],[11,11],[09,12],[11,12],[10,13]]); //Small Exploder
			// this.add_cells([[8,10],[10,10],[12,10],[8,11],[12,11],[8,12],[12,12],[8,13],[12,13],[8,14],[10,14],[12,14],]); //Exploder
			// this.add_cells([[15,10],[16,10],[17,10],[18,10],[19,10],[20,10],[21,10],[22,10],[23,10],[24,10]]); //10 Cell Row
			this.add_cells([[10,10],[11,10],[12,10],[13,10],[9,11],[13,11],[13,12],[9,13],[12,13]]); //Lightweight SpaceShip
			// this.add_cells([[10,10],[11,10],[13,10],[14,10],[10,11],[11,11],[13,11],[14,11],[11,12],[13,12],[09,13],[11,13],[13,13],[15,13],[09,14],[11,14],[13,14],[15,14],[09,15],[10,15],[14,15],[15,15]]); //Tumbler
		},
		draw_line : function(x1, y1, x2, y2, color_line){
			this.ctx.strokeStyle = color_line;
			this.ctx.lineWidth = 1;
			this.ctx.beginPath();
			this.ctx.moveTo(x1, y1);
			this.ctx.lineTo(x2, y2);
			this.ctx.stroke();
		},
		draw_grid : function(){
			for (var r = 0; r < this.num_rows; r++) {
				this.draw_line(0,r * this.blockSize,this.width,r * this.blockSize,"grey");
			}
			for (var c = 0; c < this.num_columns; c++) {
				this.draw_line(c * this.blockSize, 0,c * this.blockSize,this.height);
			}
		},
		draw_cell : function(column,row){
			this.ctx.fillStyle = "rgb(255,255,255)"; 
			this.ctx.fillRect(column * this.blockSize,row * this.blockSize,this.blockSize,this.blockSize);
		},
		draw_cells : function(){
			for (var i = this.cells.length - 1; i >= 0; i--) {
				this.draw_cell(this.cells[i][0],this.cells[i][1]);
			}
		},
		draw_pause : function(){
			var x = this.width / 2;
			var y = this.height / 2;

			this.ctx.font = (30 * ((this.width  * 1) / 400)) + "pt Calibri";
			this.ctx.textAlign = "center";
			this.ctx.fillStyle = "blue";
			this.ctx.fillText("Paused!", x, y);
	
		},
		draw_board : function(){
			this.ctx.fillStyle = "rgb(0,0,0)"; 
			this.ctx.fillRect(0,0,this.width,this.height);
		},
		remove_cell : function(column,row,i){
			this.grid[column][row] = 0;
			this.cells.splice(i,1);
		},
		add_cell : function(column,row){
			this.cells.push([column,row]);
			this.grid[column][row] = 1;
		},
		add_cells : function(arr){
			for (var i = arr.length - 1; i >= 0; i--) {
				this.add_cell(arr[i][0],arr[i][1]);
			}
		},
		create_grid : function(){
			this.grid = [];
			this.num_columns = Math.floor(this.width / this.blockSize);
			this.num_rows = Math.floor(this.height / this.blockSize);
			for (var i = this.num_rows - 1; i >= 0; i--) {
				this.grid.push(new Array(this.num_columns));
			}
		},
		frame : function(){
			if(this.status == "playing"){
				this.draw_board();
				this.move_cells();
				this.draw_cells();
				this.t = setTimeout(function(){CONWAY.frame();},  100); //next frame
			}
		},
		check_cell : function(col,row){
			if(col < 0 || row < 0 || col > this.num_columns || row  > this.num_rows) return 0;
			var count = 0;
			if(this.grid[col] === undefined) return 0; //glitch fix
			if(this.grid[col][row] == 1){ //alive
				count++; 
			}else{ //dead
				if(this.neighbors[col] === undefined) this.neighbors[col] = [];
				if(this.neighbors[col][row] === undefined) this.neighbors[col][row] = 0;
				this.neighbors[col][row]++;
			}
			return count;
		},
		move_cells : function(){
			var cells_temp = this.cells.clone();
			this.neighbors = [];
			var remove_cell_queue = [];
			this.add_cell_queue = [];

			for (var i = cells_temp.length - 1; i >= 0; i--) {
				
				var count = 0,
					col = cells_temp[i][0],
					row = cells_temp[i][1];

				count += this.check_cell(col,row - 1); //up
				count += this.check_cell(col,row + 1); //down
				count += this.check_cell(col - 1,row); //left
				count += this.check_cell(col + 1,row); //right
				count += this.check_cell(col + 1 ,row - 1); //up-right
				count += this.check_cell(col - 1,row - 1); //up-left
				count += this.check_cell(col + 1,row + 1); //down-right
				count += this.check_cell(col - 1,row + 1); //down-left

				if(count < 2 || count > 3){ remove_cell_queue.push([col,row, i]); }

			}

			for (var x = 0; x < remove_cell_queue.length; x++) {
				this.remove_cell(remove_cell_queue[x][0],remove_cell_queue[x][1],remove_cell_queue[x][2]);
			}

			//check the counts for the neighbors, if == 3 add, confusing array structure
			for (var i_col = this.neighbors.length - 1; i_col >= 0; i_col--) {
				if(this.neighbors[i_col] !== undefined){
					for (var i_row = this.neighbors[i_col].length - 1; i_row >= 0; i_row--) {
						if(this.neighbors[i_col][i_row] == 3){
							this.add_cell(i_col,i_row);
						}
					}
				}
			} //end neighbors search
			

		},
		KeyCheck : function(){
			var KeyID = event.keyCode;
			switch(KeyID) {
				case 68:
					if(CONWAY.status == "playing"){
						CONWAY.status = "paused";
					}
					switch(CONWAY.draw_mode){
						case true:
						CONWAY.draw_mode = false;
						CONWAY.draw_board();
						CONWAY.draw_cells();
						CONWAY.draw_pause();
						break;
						case false:
						CONWAY.draw_mode = true;
						CONWAY.draw_board();
						CONWAY.draw_cells();
							CONWAY.draw_grid();
						break;
					}
					break;
			case 83:
			CONWAY.draw_mode = false;
			switch(CONWAY.status){
				case "playing":
					CONWAY.status = "paused";
					CONWAY.draw_pause();
				break;
				case "paused":
					CONWAY.status = "playing";
					CONWAY.frame();
				break;
			}
			break;
			}
		}
	};
}();

CONWAY.init();

