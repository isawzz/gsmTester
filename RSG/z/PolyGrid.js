class PolyGrid {
	constructor(id, { shape = 'hex', rows = 3, cols = 2, idPrefix } = {}) {
		//board struct that holds elems together
		unitTestGrid('!!!!!!!!!!!!!', id, shape, rows, cols, idPrefix);
		this.dhelp = {};
		this.idCounters = { field: 0, corner: 0, edge: 0, other: 0 };
		this.shape = shape;
		this.sides = shape == 'hex' ? 6 : shape == 'quad' ? 4 : 3;
		this.degree = shape == 'hex' ? 3 : shape == 'quad' ? 4 : 6;
		this.idPrefix = idPrefix;
		this.objects = {};
		this.obj_type = shape + 'grid';
		this.id = id; //needs to be provided!
		if (rows == undefined) return;
		if (shape == 'hex') {
			rows = rows % 2 != 0 ? rows : rows + 1; // bei hex muss das ungerade sein: was wenn nicht?
			this.topcols = cols; // cols in top row
			this.colarr = this.calc_hex_col_array(rows, this.topcols);
		} else if (shape == 'quad') {
			this.topcols = cols;
			this.colarr = new Array(rows).fill(cols);
		}
		unitTestGrid(rows, cols, this.colarr);
		this.maxcols = arrMax(this.colarr);
		this.rows = rows;
		this.cols = cols;
		this.fields = []; //list of ids
		this.corners = [];
		this.edges = [];
		this.calcMetrics();
	}
	addPositions({ wdef = null, hdef = null } = {}) {
		//console.log('WAAAAAAAAAAAAAAAAAAS????????????');
		//bei hex geht auch gut: wdef=14,hdef=16
		//calculates base positions not real positions!
		//for real positions, addVisuals will use multipliers and x,y offset
		this.wdef = 4; // besser bei opt=fit! wdef?wdef:this.shape == 'hex'?14:4;
		this.hdef = 4; //hdef?hdef:this.shape == 'hex'?16:4;
		let fields = Object.values(this.objects).filter(x => x.obj_type == 'field');
		this.recurseFields(this.fields[0]);

		//shift all fields so that located in middle of m
		//find minx,maxx,w,h,miny,maxy
		let left = indexOfMin(fields, 'x').val;
		let right = indexOfMax(fields, 'x').val;
		let top = indexOfMin(fields, 'y').val;
		let bottom = indexOfMax(fields, 'y').val;

		this.wBoard = right - left + this.wdef; // + this.wdef/2;
		this.hBoard = bottom - top + this.hdef; // + this.hdef/2;
		//console.log('left',left,'right',right,'wdef',this.wdef,'wBoard',this.wBoard)
		let dx = (left + right) / 2;
		let dy = (top + bottom) / 2;
		unitTestGrid('verschieben um', -dx, -dy);
		for (const f of fields) {
			f.x -= dx;
			f.y -= dy;
		}

		//polys zu fields dazu
		let q = [[0.5, -0.5], [0.5, 0.5], [-0.5, 0.5], [-0.5, -0.5]];
		let hex = [[0, -0.5], [0.5, -0.25], [0.5, 0.25], [0, 0.5], [-0.5, 0.25], [-0.5, -0.25]];
		let triup = [[0, -0.5], [0.5, 0.5], [-0.5, 0.5]];
		let tridown = [[-0.5, 0.5], [0.5, 0.5], [-0.5, 0.5]];
		let pts = this.shape == 'hex' ? hex : this.shape == 'quad' ? q : this.shape == 'triup' ? triup : tridown;
		for (const f of fields) {
			f.poly = getPoly(pts, f.x, f.y, this.wdef, this.hdef);
		}

		this.vertices = correctPolys(this.fields.map(fid => this.objects[fid].poly), 1, 1);
		unitTestGrid(this.vertices);

		//add nodes
		for (const f of fields) {
			for (let i = 0; i < f.poly.length; i++) {
				let nid = f.corners[i];
				if (!nid) continue;
				let el = this.objects[nid];
				let pt = f.poly[i];
				el.h = 1; //this.hdef;
				el.w = 1; //this.wdef;
				el.x = pt.x;
				el.y = pt.y;
			}
		}

		// add edges
		for (const f of fields) {
			for (let i = 0; i < f.edges.length; i++) {
				let eid = f.edges[i];
				if (!eid) continue;
				let el = this.objects[eid];
				let n1 = this.objects[el.corners[0]];
				let n2 = this.objects[el.corners[1]];
				el.x1 = n1.x;
				el.y1 = n1.y;
				el.x2 = n2.x;
				el.y2 = n2.y;
				el.x = (n1.x + n2.x) / 2;
				el.y = (n1.y + n2.y) / 2;
				el.thickness = 1;
			}
		}
	}
	addVisuals(
		gName,
		{
			nodeShape = 'circle',
			factors = [43, 50, 12, 12, 10],
			w,
			h,
			f2nRatio = 4,
			opt = 'fitRatio', //'fitStretch','none'
			gap = 4,
			margin = 0,
			edgeColor = 'maroon',
			fieldColor = 'beige',
			nodeColor = 'sienna'
		} = {}
	) {
		this.gName = gName;
		this.nodeShape = nodeShape;
		let [fw, fh, nw, nh, ew] = factors;
		if (startsWith(opt, 'fit')) {
			[fw, fh, nw, nh, ew] = bestFitScaleFactors(this.wBoard, this.wdef, this.hBoard, this.hdef, f2nRatio, ew, {
				gName: gName,
				w: w,
				h: h,
				margin: margin,
				maintainRatio: opt[3] == 'R'
			});
		}
		for (const id of this.fields) {
			let el = this.objects[id];
			createBoardElem(el, this.id, gName, 'main', el.w * fw - gap, el.h * fh - gap, fieldColor, this.shape, fw, fh);
		}
		for (const id of this.corners) {
			let el = this.objects[id];
			createBoardElem(el, this.id, gName, 'main', Math.max(this.wdef * nw, ew), Math.max(this.hdef * nh, ew), nodeColor, this.nodeShape, fw, fh);
		}
		for (const id of this.edges) {
			let el = this.objects[id];
			createBoardElem(el, this.id, gName, 'main', el.thickness * ew, 0, edgeColor, 'line', fw, fh);
		}
	}
	draw() {
		this.drawElems(this.fields);
		this.drawElems(this.edges);
		this.drawElems(this.corners);
	}
	drawElems(idlist) {
		for (const id of idlist) {
			let el = this.objects[id];
			if (el.ms) {
				el.ms.draw();
			}
		}
	}
	fromExisting(data) {
		//console.log(data)
		//assuming get a board like object as produced by grid_util
		//if just get loose objects, can still extract the board info from either spec or some other game data
		this.dhelp = {};
		this.idCounters = { field: 0, corner: 0, edge: 0, other: 0 };
		this.colarr = data.colarr;
		this.cols = data.cols;
		this.edges = data.edges;
		this.fields = data.fields;
		this.id = data.id;
		this.maxcols = data.maxcols;
		this.corners = data.corners;
		this.obj_type = data.obj_type;
		this.objects = data.objects;
		this.rows = data.rows;
		this.topcols = data.topcols;
		this.shape = stringBefore(this.obj_type, 'grid');
		this.sides = this.shape == 'hex' ? 6 : this.shape == 'quad' ? 4 : 3;
		this.fieldsByRowCol = {};
		for (const fid of this.fields) {
			addIfKeys(this.fieldsByRowCol, [this.objects[fid].row, this.objects[fid].col], fid);
		}
		this.calcMetrics();
		this.verifyMetrics();
	}
	fromScratch() {
		if (this.shape == 'hex') {
			this.hexFromScratch();
		} else if (this.shape == 'quad') {
			this.quadFromScratch();
		}
	}
	getNeighbors(id) {
		if (!(id in this.objects)) {
			error('ERROR: id', id, 'NOT present in', this.id);
		}
		let el = this.objects[id];
		if (el.obj_type == 'field') {
			return el.neighbors.concat(el.corners.concat(el.edges));
		} else if (el.obj_type == 'corner') {
			return el.fields.concat(el.edges);
		} else {
			return el.fields.concat(el.corners);
		}
	}
	get(id) {
		if (id in this.objects) {
			return this.objects[id];
		} else {
			error('PolyGrid get request:', id);
			return null;
		}
	}
	hexFromScratch() {
		//only adds abstract nodes/edges/fields, no pos info or visuals - output same as from server!
		this.dhelp = {};
		this.idCounters = { field: 0, corner: 0, edge: 0, other: 0 };
		this.imiddleRow = (this.rows - 1) / 2;
		let offsetsHex = [[0, -0.5], [0.5, -0.25], [0.5, 0.25], [0, 0.5], [-0.5, 0.25], [-0.5, -0.25]];
		let offsetsQuad = [[-0.5, -0.5], [0.5, -0.5], [0.5, 0.5], [-0.5, 0.5]];
		this.offsets = this.shape == 'quad' ? offsetsQuad : offsetsHex;
		let idxQuadRow = [-1, 0, 0, -1];
		let idxQuadCol = [0, 0, -1, -1];
		let idxHexRow = [-1, -1, 0, 0, 0, -1];
		let idxHexCol = [0, 1, 1, 0, -1, -1];
		this.indexRow = this.shape == 'quad' ? idxQuadRow : idxHexRow;
		this.indexCol = this.shape == 'quad' ? idxQuadCol : idxHexCol;
		this.fieldsByRowCol = {};
		//fields
		for (let irow = 0; irow < this.colarr.length; irow++) {
			this.fieldsByRowCol[irow + 1] = {};
			let colstart = this.maxcols - this.colarr[irow];
			for (let j = 0; j < this.colarr[irow]; j++) {
				var icol = colstart + 2 * j;
				let field = {};
				field.obj_type = 'field';
				field.id = this.getId(field);
				field.row = irow + 1;
				field.col = icol + 1;
				field.edges = arrCreate(6, () => null);
				field.neighbors = arrCreate(6, () => null);
				field.corners = arrCreate(6, () => null);
				this.objects[field.id] = field;
				this.fields.push(field.id);
				this.fieldsByRowCol[irow + 1][icol + 1] = field.id;
			}
		}
		//nodes________________
		for (const fid of this.fields) {
			let field = this.objects[fid];
			//nodes field is irow+1,icol+1
			for (let inode = 0; inode < this.sides; inode++) {
				//make node idByRC
				let nrow = field.row + this.indexRow[inode];
				let ncol = field.col + this.indexCol[inode];
				let irc = 'n' + '-' + nrow + '_' + ncol;
				let node = null;
				if (irc in this.dhelp) {
					node = this.dhelp[irc];
				} else {
					node = {};
					node.obj_type = 'corner';
					node.id = this.getId(node);
					node.row = nrow;
					node.col = ncol;
					node.edges = arrCreate(3, () => null);
					node.fields = arrCreate(3, () => null);
					this.corners.push(node.id);
					this.dhelp[irc] = node;
					this.objects[node.id] = node;
				}
				if (inode == 0) {
					node.fields[1] = field.id;
				} else if (inode == 1) {
					node.fields[2] = field.id;
				} else if (inode == 2) {
					node.fields[2] = field.id;
				} else if (inode == 3) {
					node.fields[0] = field.id;
				} else if (inode == 4) {
					node.fields[0] = field.id;
				} else if (inode == 5) {
					node.fields[1] = field.id;
				}
				field.corners[inode] = node.id;
			}
		}
		//edges________________
		for (const fid of this.fields) {
			let field = this.objects[fid];
			//field indices is irow+1,icol+1
			for (let inode = 0; inode < this.sides; inode++) {
				let in1 = inode;
				let in2 = (inode + 1) % 6;
				let n1 = this.objects[field.corners[in1]];
				let n2 = this.objects[field.corners[in2]];

				let startNode = n1;
				if (n1.row > n2.row) {
					startNode = n2;
				}
				if (n1.row == n2.row && n1.col > n2.col) {
					startNode = n2;
				}
				let endNode = startNode == n1 ? n2 : n1;

				let irc = 'e' + startNode.id + '_' + endNode.id;
				let edge = null;
				if (irc in this.dhelp) {
					edge = this.dhelp[irc];
				} else {
					edge = {};
					edge.obj_type = 'edge';
					edge.id = this.getId(edge);
					edge.row = startNode.row;
					edge.col = startNode.col;
					edge.fields = [null, null];
					edge.leftField = null;
					edge.rightField = null;
					edge.corners = [startNode.id, endNode.id];
					edge.startNode = startNode.id;
					edge.endNode = endNode.id;
					//add this edge id to each node's edges list ok
					if (inode == 0) {
						n1.edges[1] = edge.id;
						n2.edges[2] = edge.id;
					} else if (inode == 1) {
						n1.edges[1] = edge.id;
						n2.edges[0] = edge.id;
					} else if (inode == 2) {
						n1.edges[2] = edge.id;
						n2.edges[0] = edge.id;
					} else if (inode == 3) {
						n1.edges[2] = edge.id;
						n2.edges[1] = edge.id;
					} else if (inode == 4) {
						n1.edges[0] = edge.id;
						n2.edges[1] = edge.id;
					} else if (inode == 5) {
						n1.edges[0] = edge.id;
						n2.edges[2] = edge.id;
					}

					//add edge to board, dhelp
					this.edges.push(edge.id);
					this.dhelp[irc] = edge;
					this.objects[edge.id] = edge;
				}
				if (inode < 3) {
					edge.fields[1] = field.id;
					edge.leftField = field.id;
				} else {
					edge.fields[0] = field.id;
					edge.rightField = field.id;
				}
				field.edges[inode] = edge.id;
			}
		}
		//add fields of fields ok
		for (const fid of this.fields) {
			let f = this.objects[fid];
			for (let i = 0; i < 6; i++) {
				let e = this.objects[f.edges[i]];
				for (const f1 of e.fields) {
					if (f1 && f1 != fid) {
						f.neighbors[i] = f1;
					}
				}
			}
		}
		this.verifyMetrics();
	}
	addDiagonals_unused() {
		//each field now has 8 field neighbors
		for (const id of this.fields) {
			let f = this.objects[id];
			let r = f.row;
			let c = f.col;
			let newFieldNei = arrCreate(8, () => null);
			let i = 0;
			for (const neid of f.fields) {
				newFieldNei[i] = neid;
				i += 2;
			}
			if (r - 1 in this.fieldsByRowCol && c - 1 in this.fieldsByRowCol[r - 1]) {
				newFieldNei[7] = this.fieldsByRowCol[r - 1][c - 1];
			}
			if (r - 1 in this.fieldsByRowCol && c + 1 in this.fieldsByRowCol[r - 1]) {
				newFieldNei[1] = this.fieldsByRowCol[r - 1][c + 1];
			}
			if (r + 1 in this.fieldsByRowCol && c + 1 in this.fieldsByRowCol[r + 1]) {
				newFieldNei[3] = this.fieldsByRowCol[r + 1][c + 1];
			}
			if (r + 1 in this.fieldsByRowCol && c - 1 in this.fieldsByRowCol[r + 1]) {
				newFieldNei[5] = this.fieldsByRowCol[r + 1][c - 1];
			}
			f.fields = newFieldNei;
		}
		//each node now has 8 edge neigbors
		for (const id of this.corners) {
			let node = this.objects[id];
			let newEdgeNei = arrCreate(8, () => null);
			let i = 0;
			for (const neid of node.edges) {
				newEdgeNei[i] = neid;
				i += 2;
			}
			node.edges = newEdgeNei;
		}

		//add diagonal edges
		for (const fid of this.fields) {
			let field = this.objects[fid];
			for (let inode = 0; inode < this.sides; inode++) {
				let in1 = inode;
				let in2 = (inode + 2) % this.sides;
				let n1 = this.objects[field.corners[in1]];
				let n2 = this.objects[field.corners[in2]];

				let startNode = n1;
				if (n1.row > n2.row) {
					startNode = n2;
				}
				if (n1.row == n2.row && n1.col > n2.col) {
					startNode = n2;
				}
				let endNode = startNode == n1 ? n2 : n1;

				let irc = 'e' + startNode.id + '_' + endNode.id;
				let edge = null;
				if (irc in this.dhelp) {
					edge = this.dhelp[irc];
				} else {
					edge = {};
					edge.obj_type = 'edge';
					edge.id = this.getId(edge);
					edge.row = startNode.row;
					edge.col = startNode.col;
					edge.fields = [fid]; //cross edges only have 1 field neighbor
					edge.crossesField = fid;
					edge.corners = [startNode.id, endNode.id];
					edge.startNode = startNode.id;
					edge.endNode = endNode.id;
					//add this edge id to each node's edges list ok
					if (inode == 0) {
						n1.edges[5] = edge.id;
						n2.edges[1] = edge.id;
					} else if (inode == 1) {
						n1.edges[7] = edge.id;
						n2.edges[3] = edge.id;
					} else if (inode == 2) {
						n1.edges[1] = edge.id;
						n2.edges[5] = edge.id;
					} else if (inode == 3) {
						n1.edges[3] = edge.id;
						n2.edges[7] = edge.id;
					}

					//add edge to board, dhelp
					this.edges.push(edge.id);
					this.dhelp[irc] = edge;
					this.objects[edge.id] = edge;
				}
				field.edges.push(edge.id);
			}
		}
	}
	quadFromScratch() {
		//only adds abstract nodes/edges/fields, no pos info or visuals - output same as from server!
		this.dhelp = {};
		this.idCounters = { field: 0, corner: 0, edge: 0, other: 0 };
		let offsetsHex = [[0, -0.5], [0.5, -0.25], [0.5, 0.25], [0, 0.5], [-0.5, 0.25], [-0.5, -0.25]];
		let offsetsQuad = [[0.5, -0.5], [0.5, 0.5], [-0.5, 0.5], [-0.5, -0.5]];
		this.offsets = this.shape == 'quad' ? offsetsQuad : offsetsHex;
		let idxQuadRow = [-1, 0, 0, -1];
		let idxQuadCol = [0, 0, -1, -1];
		let idxHexRow = [-1, -1, 0, 0, 0, -1];
		let idxHexCol = [0, 1, 1, 0, -1, -1];
		this.indexRow = this.shape == 'quad' ? idxQuadRow : idxHexRow;
		this.indexCol = this.shape == 'quad' ? idxQuadCol : idxHexCol;
		this.fieldsByRowCol = {};
		//fields_________________
		for (let irow = 0; irow < this.colarr.length; irow++) {
			this.fieldsByRowCol[irow + 1] = {};
			for (let icol = 0; icol < this.colarr[irow]; icol++) {
				let field = {};
				//console.log('-------------------------------------------new field!!!!!');
				field.obj_type = 'field';
				field.id = this.getId(field);
				field.row = irow + 1;
				field.col = icol + 1;
				field.edges = arrCreate(4, () => null);
				field.neighbors = arrCreate(4, () => null);
				field.corners = arrCreate(4, () => null);
				this.objects[field.id] = field;
				this.fields.push(field.id);
				this.fieldsByRowCol[irow + 1][icol + 1] = field.id;
			}
		}

		//nodes________________
		for (const fid of this.fields) {
			let field = this.objects[fid];
			//nodes field is irow+1,icol+1
			for (let inode = 0; inode < this.sides; inode++) {
				//make node idByRC
				let nrow = field.row + this.indexRow[inode];
				let ncol = field.col + this.indexCol[inode];
				let irc = 'n' + '-' + nrow + '_' + ncol;
				let node = null;
				if (irc in this.dhelp) {
					node = this.dhelp[irc];
				} else {
					node = {};
					node.obj_type = 'corner';
					node.id = this.getId(node);
					node.row = nrow;
					node.col = ncol;
					node.edges = arrCreate(4, () => null);
					node.fields = arrCreate(4, () => null);
					this.corners.push(node.id);
					this.dhelp[irc] = node;
					this.objects[node.id] = node;
				}
				if (inode == 0) {
					node.fields[2] = field.id;
				} else if (inode == 1) {
					node.fields[3] = field.id;
				} else if (inode == 2) {
					node.fields[0] = field.id;
				} else if (inode == 3) {
					node.fields[1] = field.id;
				}
				field.corners[inode] = node.id;
			}
		}
		//edges________________
		for (const fid of this.fields) {
			let field = this.objects[fid];
			//field indices is irow+1,icol+1
			for (let i = 3; i < 7; i++) {
				let inode = i % 4;
				let in1 = inode;
				let in2 = (inode + 1) % this.sides;
				let n1 = this.objects[field.corners[in1]];
				let n2 = this.objects[field.corners[in2]];

				let startNode = n1;
				if (n1.row > n2.row) {
					startNode = n2;
				}
				if (n1.row == n2.row && n1.col > n2.col) {
					startNode = n2;
				}
				let endNode = startNode == n1 ? n2 : n1;

				let irc = 'e' + startNode.id + '_' + endNode.id;
				let edge = null;
				if (irc in this.dhelp) {
					edge = this.dhelp[irc];
				} else {
					edge = {};
					edge.obj_type = 'edge';
					edge.id = this.getId(edge);
					edge.row = startNode.row;
					edge.col = startNode.col;
					edge.fields = [null, null];
					edge.leftField = null;
					edge.rightField = null;
					edge.topField = null;
					edge.bottomField = null;
					edge.crossField = null;
					edge.corners = [startNode.id, endNode.id];
					edge.startNode = startNode.id;
					edge.endNode = endNode.id;
					//add this edge id to each node's edges list ok
					if (inode == 0) {
						n1.edges[2] = edge.id;
						n2.edges[0] = edge.id;
					} else if (inode == 1) {
						n1.edges[3] = edge.id;
						n2.edges[1] = edge.id;
					} else if (inode == 2) {
						n1.edges[0] = edge.id;
						n2.edges[2] = edge.id;
					} else if (inode == 3) {
						n1.edges[1] = edge.id;
						n2.edges[3] = edge.id;
					}

					//add edge to board, dhelp
					this.edges.push(edge.id);
					this.dhelp[irc] = edge;
					this.objects[edge.id] = edge;
				}
				if (inode == 0) {
					edge.fields[1] = field.id;
					edge.leftField = field.id;
				} else if (inode == 1) {
					edge.fields[0] = field.id;
					edge.topField = field.id;
				} else if (inode == 2) {
					edge.fields[0] = field.id;
					edge.rightField = field.id;
				} else if (inode == 3) {
					edge.fields[1] = field.id;
					edge.bottomField = field.id;
				}
				field.edges[(inode + 1) % 4] = edge.id;
			}
		}

		//add fields of fields ok
		for (const fid of this.fields) {
			let f = this.objects[fid];
			for (let i = 0; i < 4; i++) {
				if (!f.edges[i]) continue;
				let e = this.objects[f.edges[i]];
				for (const f1 of e.fields) {
					if (f1 && f1 != fid) {
						f.neighbors[i] = f1;
					}
				}
			}
		}
		this.verifyMetrics();
	}
	getId(o) {
		if ('obj_type' in o && o.obj_type in this.idCounters) {
			this.idCounters[o.obj_type] += 1;
			let prefix = o.obj_type[0];
			if (!empty(this.idPrefix)) {
				prefix = this.idPrefix + prefix;
			}
			return prefix + this.idCounters[o.obj_type];
		} else {
			let prefix = 'o';
			if (!empty(this.idPrefix)) {
				prefix = this.idPrefix + prefix;
			}
			this.idCounters['other'] += 1;
			return prefix + this.idCounters['other'];
		}
	}
	recurseFields(fid, { x = 0, y = 0 } = {}) {
		if (!fid) return;
		let f = this.objects[fid];
		//console.log(fid, f, this.objects);
		if ('done' in f) return;
		f.done = true;
		f.h = this.hdef;
		f.w = this.wdef;
		f.x = x;
		f.y = y;

		for (let i = 0; i < this.sides; i++) {
			let sid_nei = f.neighbors[i];
			if (sid_nei != null) {
				//recurse with appropriate x,y
				let dx = 0;
				let dy = 0;
				if (this.shape == 'hex') {
					if (i == 0) {
						dx += this.wdef / 2;
						dy -= (3 * this.hdef) / 4;
					} else if (i == 1) {
						dx += this.wdef;
					} else if (i == 2) {
						dx += this.wdef / 2;
						dy += (3 * this.hdef) / 4;
					} else if (i == 3) {
						dx -= this.wdef / 2;
						dy += (3 * this.hdef) / 4;
					} else if (i == 4) {
						dx -= this.wdef;
					} else if (i == 5) {
						dx -= this.wdef / 2;
						dy -= (3 * this.hdef) / 4;
					}
				} else if (this.shape == 'quad') {
					if (i == 0) {
						dy -= this.hdef;
					} else if (i == 1) {
						dx += this.wdef;
					} else if (i == 2) {
						dy += this.hdef;
					} else if (i == 3) {
						dx -= this.wdef;
					}
				}
				this.recurseFields(sid_nei, { x: x + dx, y: y + dy });
			}
		}
	}
	removeFromUI() {
		for (const id in this.objects) {
			let o = this.objects[id];
			if ('ms' in o) {
				o.ms.removeFromUI();
			}
			if ('removeFromUI' in o) {
				o.removeFromUI();
			}
		}
	}
	calc_hex_col_array(rows, cols) {
		let colarr = []; //how many cols in each row
		for (let i = 0; i < rows; i++) {
			colarr[i] = cols;
			if (i < (rows - 1) / 2) cols += 1;
			else cols -= 1;
		}
		return colarr;
	}
	calcMetrics() {
		this.nNodes = 0;
		this.nEdges = 0;
		this.nFields = 0;
		if (this.shape == 'hex') {
			for (let i = 0; i < (this.rows - 1) / 2 + 1; i++) {
				let n = this.colarr[i];
				this.nFields += n == this.maxcols ? n : 2 * n;
				this.nNodes += 2 * (2 * n + 1);
				this.nEdges += n * 2 * 2 + (n == this.maxcols ? n + 1 : 2 * (n + 1));
			}
		} else if (this.shape == 'quad') {
			this.nNodes = (this.cols + 1) * (this.rows + 1);
			this.nFields = this.cols * this.rows;
			this.nEdges = this.cols * (this.rows + 1) + this.rows * (this.cols + 1);
		}
	}
	verifyMetrics(verbose = false) {
		if (verbose) {
			wlog('*** verifying board ***', this.id);
		}
		if (this.corners.length != this.nNodes || this.edges.length != this.nEdges || this.fields.length != this.nFields) {
			wlog('hexgrid', this.rows, this.cols, 'should have:');
			wlog('\t', this.nFields, 'fields');
			wlog('\t', this.nNodes, 'nodes');
			wlog('\t', this.nEdges, 'edges');
			wlog('\ttotal:', this.nEdges + this.nFields + this.nNodes);
			wlog(this.fields.length, 'fields', this.corners.length, 'nodes,', this.edges.length, 'edges, total:', Object.keys(this.objects).length);
		} else if (verbose) {
			wlog('CORRECT!', this.fields.length, 'fields', this.corners.length, 'nodes,', this.edges.length, 'edges, total:', Object.keys(this.objects).length);
		}
	}
}

function addStructure(id, o) {
	S_old.structures[id] = o;
}
function getStructure(id) {
	return S_old.structures[id];
}

//#region board building

function boardFromData(bServer, serverObjects, shape) {
	if (!('fields' in bServer)) {
		error('board is not a board with fields, so algo does NOT apply!', bServer);
		return null;
	}

	let sObjects = dict2list(serverObjects, 'id');

	//assuming that board object bServer is present in initial data and that it has rows, cols info
	//assuming that board shape (hex,quad) is known (eg., from user spec STRUCTURE)
	let b_new = new PolyGrid(bServer.id, { shape: shape, rows: 5, cols: 3 }); // bServer.rows, cols: bServer.cols});
	//console.log('shape', shape, 'rows', bServer.rows, 'cols', bServer.cols);
	b_new.fromScratch();
	let b_old = jsCopy(b_new);

	//console.log('fieldsByRowCol', b_new.fieldsByRowCol);

	//replacing all field,node,edge data in b_new with serverObject data
	b_new.fields = dict2list(_setToList(bServer.fields), 'id').map(x => x.id);

	//console.log('bServer', bServer);

	// b_new.corners = [];
	// for (const k of bServer.corners._set) {
	// }

	b_new.corners = 'corners' in bServer ? _setToList(bServer.corners).map(x => x._obj) : [];
	b_new.edges = 'edges' in bServer ? _setToList(bServer.edges).map(x => x._obj) : [];
	b_new.nFields = b_new.fields.length;
	b_new.nEdges = b_new.edges.length;
	b_new.nNodes = b_new.corners.length;
	b_new.objects = {};
	b_new.dhelp = {};
	b_new.fieldsByRowCol = {};

	//b_new hat jetzt die richtigen fields, corners, edges und empty objects

	let oldByNew = {};
	let old_objects = dict2list(b_old.objects, 'id');
	//console.log('old_objects', old_objects);

	//update fields
	//console.log('************** FIELDS *********************');
	for (let i = 0; i < b_new.fields.length; i++) {
		let fid_new = b_new.fields[i];
		let o_new = sObjects[fid_new];
		//console.log('fid_new', fid_new, 'o_new', o_new, b_new.fields);
		//console.log();

		let match =
			shape == 'hex'
				? firstCond(old_objects, x => x.obj_type == 'field' && x.row - 1 == o_new.row && x.col - 1 == o_new.col)
				: firstCond(old_objects, x => x.obj_type == 'field' && x.row == o_new.row && x.col == o_new.col);
		let o_old = match;

		//console.log('>>>>>>>>>>match', match);
		//console.log(o_old, o_old.row, o_new.row, o_old.col, o_new.col, o_old.id, fid_new);

		let o = o_old;

		setKeys(b_new.fieldsByRowCol, [o_new.row, o_new.col], fid_new);
		o.row = o_new.row;
		o.col = o_new.col;
		oldByNew[fid_new] = o_old.id;

		//remember old corner and edge ids to access corner/edge old objects for update!
		if ('corners' in o_new) {
			for (let i = 0; i < o_new.corners.length; i++) {
				let cid = o_new.corners[i]._obj;
				if (cid) {
					//console.log('new corner id:', cid, 'matches old id:', o_old.corners[i]);
					oldByNew[cid] = o_old.corners[i];
				}
			}
		}
		if ('edges' in o_new) {
			for (let i = 0; i < o_new.edges.length; i++) {
				let eid = o_new.edges[i]._obj;
				if (eid) oldByNew[eid] = o_old.edges[i];
			}
		}

		//actual object of new board should be o_old updated!
		o.id = fid_new; //id ist jetzt genau die von server object!
		o.neighbors = 'neighbors' in o_new ? o_new.neighbors.map(x => (x ? x._obj : null)) : arrCreate(b_new.sides, () => null);
		o.corners = 'corners' in o_new ? o_new.corners.map(x => (x ? x._obj : null)) : arrCreate(b_new.sides, () => null);
		o.edges = 'edges' in o_new ? o_new.edges.map(x => (x ? x._obj : null)) : arrCreate(b_new.sides, () => null);
		o.serverObject = o_new; //server object is now linked to front field object

		b_new.objects[fid_new] = o;
	}

	//update corners
	//NEIN auch das muss correcten!!! cannot assume same order!!!!!
	//console.log('************** CORNERS *********************');
	//console.log('new corner ids:', b_new.corners);
	//console.log('old corner ids:', b_old.corners);
	for (let i = 0; i < b_new.corners.length; i++) {
		let cid_new = b_new.corners[i];
		let o_new = sObjects[cid_new];
		if (!cid_new) continue;
		let cid_old = oldByNew[cid_new];
		//console.log(cid_new, 'matches', cid_old);

		let o = b_old.objects[cid_old];
		let o_old = o;
		//update old corner object and add to b_new.objects
		o.id = cid_new; //id ist jetzt genau die von server object!
		//console.log('o_new', o_new);
		//console.log('o_old', o_old);

		//bin mir jetzt nicht sicher ob corner fields neighbors oder fields genannt werden!
		o.fields = 'fields' in o_new ? o_new.fields.map(x => (x ? x._obj : null)) : arrCreate(o_old.fields.length, () => null);
		// o.neighbors = 'neighbors' in o_new ? o_new.neighbors.map(x => (x ? x._obj : null)) : arrCreate(b_new.sides, () => null);
		//o.corners = 'corners' in o_new ? o_new.corners.map(x => (x ? x._obj : null)) : arrCreate(o_old.corners.length, () => null);
		o.edges = 'edges' in o_new ? o_new.edges.map(x => (x ? x._obj : null)) : arrCreate(o_old.edges.length, () => null);
		o.serverObject = o_new; //server object is now linked to front field object

		b_new.objects[cid_new] = o;
	}

	//update edges
	for (let i = 0; i < b_new.edges.length; i++) {
		let cid_new = b_new.edges[i];
		let o_new = sObjects[cid_new];
		if (!cid_new) continue;
		let cid_old = oldByNew[cid_new];
		//console.log(cid_new, 'matches', cid_old);

		let o = b_old.objects[cid_old];
		//update old corner object and add to b_new.objects
		o.id = cid_new; //id ist jetzt genau die von server object!

		//bin mir jetzt nicht sicher ob corner fields neighbors oder fields genannt werden!
		o.fields = 'fields' in o_new ? o_new.fields.map(x => (x ? x._obj : null)) : arrCreate(o_old.fields.length, () => null);
		// o.neighbors = 'neighbors' in o_new ? o_new.neighbors.map(x => (x ? x._obj : null)) : arrCreate(b_new.sides, () => null);
		o.corners = 'corners' in o_new ? o_new.corners.map(x => (x ? x._obj : null)) : arrCreate(o_old.corners.length, () => null);
		//o.edges = 'edges' in o_new ? o_new.edges.map(x => (x ? x._obj : null)) : arrCreate(o_old.edges.length, () => null);
		o.serverObject = o_new; //server object is now linked to front field object

		b_new.objects[cid_new] = o;
	}

	return b_new;
}
function createQuadGrid(tableData, areaName, dataInfo) {
	let shape = 'quad';
	console.log('tableData', tableData);
	console.log('areaName', areaName);
	console.log('dataInfo', dataInfo);
	console.log('shape', shape);
	console.log(tableData);
	let serverObjects = dict2list(tableData, 'id');
	let o = findMatchingObject_dep(serverObjects, dataInfo);
	//console.log('o', o);
	//console.log('serverObjects', serverObjects);
	if (o == null) {
		//no matching object was found. not enough info to create a structure
		//or, could detect if fields exist, but that is kind of weit hergeholt
		//console.log('cannot create a board! no board data found in', data);
		return;
	}

	let boardServerObject = o;
	let b = boardFromData(boardServerObject, serverObjects, shape);
	b.addPositions();

	let area = getArea(areaName);
	if (!('w' in area)) {
		area.w = area.div.offsetWidth;
		area.h = area.div.offsetHeight;
	}
	//console.log('createQuadgrid', area);
	let palBoard = getSYS('pals')[area.iPalette];
	let fieldColor = palBoard[6];
	let edgeColor = palBoard[4];
	let nodeColor = palBoard[2];

	b.addVisuals(area.gName, { w: area.w, h: area.h, margin: 25, edgeColor: edgeColor, fieldColor: fieldColor, nodeColor: nodeColor });
	b.draw();
	return b;
}
function createBoardElem(el, boardId, gName, syskey, w, h, color, shape, xmult, ymult) {
	//console.log('createBoardElem', el);
	//console.log(boardId, gName, syskey, w, h, color, shape, xmult, ymult);
	console.log('hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh')
	let ms = new MS(el.id, gName);
	x = el.x * xmult;
	y = el.y * ymult;
	if (shape == 'circle') {
		ms.ellipse({ w: w, h: h }).ellipse({ className: 'overlay', w: w, h: h });
		ms.setPos(x, y);
	} else if (shape == 'hex') {
		ms.hex({ w: w, h: h }).hex({ className: 'overlay', w: w, h: h });
		ms.setPos(x, y);
	} else if (shape == 'quad') {
		ms.rect({ w: w, h: h }).rect({ className: 'overlay', w: w, h: h });
		ms.setPos(x, y);
	} else if (shape == 'triangle') {
		//TODO!!!!
		ms.rect({ w: w, h: h }).hex({ className: 'overlay', w: w, h: h });
		ms.setPos(x, y);
	} else if (shape == 'line') {
		let x1 = el.x1 * xmult;
		let y1 = el.y1 * ymult;
		let x2 = el.x2 * xmult;
		let y2 = el.y2 * ymult;
		let thickness = w;
		let fill = color;
		ms.line({ className: 'ground', x1: x1, y1: y1, x2: x2, y2: y2, fill: fill, thickness: thickness }).line({
			className: 'overlay',
			x1: x1,
			y1: y1,
			x2: x2,
			y2: y2,
			thickness: thickness
		});
	}
	ms.setBg(color, shape != 'line');
	ms.tag('board', boardId);
	el.ms = ms;
	registerVisualForTableObject(el.id, ms, syskey);
	return ms;
}
function findMatchingObject_dep(olist, condList) {
	//each cond is supposedly a list of [propName,val]
	if (isListOfLiterals(condList)) {
		condList = [condList];
	}
	for (const o of olist) {
		let isMatch = true;
		for (const tuple of condList) {
			if (!(tuple[0] in o) || o[tuple[0]] != tuple[1]) {
				isMatch = false;
				break;
			}
		}
		if (isMatch) {
			return o;
		}
	}
	return null;
}
function getAreaSize(areaName) { }
//#endregion

//#region board labeling, handlers...
function disableClick(el) {
	let ms = 'ms' in el ? el.ms : el;
	ms.clickHandler = null;
	ms.disable();
}
function enableClick(el, handler) {
	// //console.log('enableClick_________________start')
	let ms = 'ms' in el ? el.ms : el;
	ms.clickHandler = handler;
	ms.enable();
	// //console.log(ms,el,handler)
	// //console.log('enableClick_________________end')
}
function disableHover(el) {
	let ms = 'ms' in el ? el.ms : el;
	ms.mouseEnterHandler = null;
	ms.mouseLeaveHandler = null;
	ms.disable();
}
function enableHover(el, enterHandler, leaveHandler) {
	// //console.log('enableClick_________________start')
	// //console.log('enterHandler', enterHandler);
	// //console.log('leaveHandler', leaveHandler);
	let ms = 'ms' in el ? el.ms : el;
	ms.mouseEnterHandler = enterHandler;
	ms.mouseLeaveHandler = leaveHandler;
	ms.enable();

	// //console.log(ms, el);
	// //console.log('enableClick_________________end')
}
function glabels(board, ids, func, { bg, fg, contrastBackground = false, force = true, shrinkFont = false, wrap = false, fz = 20 } = {}) {
	for (const id of ids) {
		let el = board.objects[id];
		let val = func(el);
		glabel(el, val, { bg: bg, fg: fg, contrastBackground: contrastBackground, force: force, shrinkFont: shrinkFont, wrap: wrap, fz: fz });
	}
}
function glabel(el, val, { bg, fg, contrastBackground = false, force = true, shrinkFont = false, wrap = false, fz = 20 } = {}) {
	let ms = el.ms;
	if (contrastBackground) {
		unitTestMS('.................fill black!!!');
		ms.text({ txt: val, force: force, shrinkFont: shrinkFont, wrap: wrap, fz: fz, bg: 'white', fill: 'black' });
	} else {
		ms.text({ txt: val, force: force, shrinkFont: shrinkFont, wrap: wrap, fz: fz, bg: bg, fill: fg });
	}
}

//#endregion

//#region board add remove elements utilities
//not implemented!!!
function addEdge(board, cid1, cid2) {
	//adds edge between these 2 nodes,
	//also add this edge to fields divided by it (the 2 (or 1 if cross edge in quad) fields that contains both corners!)
}
function removeUIandObject(board, el) {
	//remove ui
	if ('ms' in el) {
		el.ms.removeFromUI();
		delete el.ms;
	}
	//remove object
	delete board.objects[el.id];
}
function removeAllCornersAndEdges(board) {
	//let cornersCopy =
}
function removeEdge(board, id) {
	let el = board.objects[id];
	unitTestGrid(board, id, el);
	//just edge is removed
	//will not affect any other element
	//remove the edge from end nodes edges lists
	for (const f of el.fields) {
		//remove this edge from field.edges
		if (!f) continue;
		arrReplace(board.objects[f].edges, id, null);
	}
	//remove the edge from fields edge's list
	for (const f of el.corners) {
		//remove this edge from field.edges
		if (!f) continue;
		arrReplace(board.objects[f].edges, id, null);
	}
	removeInPlace(board.edges, id);
	removeUIandObject(board, el);
}
function removeCorner(board, id) {
	let el = board.objects[id];
	let edges = el.edges.slice();
	unitTestGrid(edges);
	for (const e of edges) {
		if (!e) continue;
		removeEdge(board, e);
	}
	//let type = el.obj_type;
	for (const f of el.fields) {
		//remove this node from field.corners
		if (!f) continue;
		arrReplace(board.objects[f].corners, id, null);
	}
	removeInPlace(board.corners, id);
	removeUIandObject(board, el);
}
function removeOnClick(board) {
	unitTestGrid('hallo', board, board.objects);
	for (const id in board.objects) {
		let el = board.objects[id];
		if (!('ms' in el)) return;
		if (el.obj_type == 'corner') {
			enableClick(el, () => removeCorner(board, el.id));
		} else if (el.obj_type == 'edge') {
			enableClick(el, () => removeEdge(board, el.id));
		}
	}
}
//#endregion

//#region building VERBOSE
function createPolyGridV(data, areaName, dataInfo, shape) {
	unitTestSpec('createPolyGrid', 'data', data, 'areaName', areaName);
	unitTestSpec('dataInfo', dataInfo, 'shape', shape);

	let serverObjects = dict2list(data.table, 'id');

	//from data must detect object that fullfillst dataInfo
	//dataInfo is a condition on some property==value (if more than one, will be list of prop,val pairs) within table objects in data
	let o = findMatchingObject_dep(serverObjects, dataInfo);
	if (o == null) {
		//no matching object was found. not enough info to create a structure
		//or, could detect if fields exist, but that is kind of weit hergeholt
		//console.log('cannot create a board! no board data found in', data);
		return;
	}

	let boardServerObject = o;
	unitTestSpec('*************************************************');
	unitTestSpec('boardServerObject', boardServerObject, 'objects', serverObjects);
	unitTestStructure(H);

	let b = boardFromData(boardServerObject, serverObjects, shape);
	//console.log(b);
	b.addPositions();

	let area = sysvarGet(areaName);
	if (!('w' in area)) {
		area.w = area.d.offsetWidth;
		area.h = area.d.offsetHeight;
	}

	unitTestGrid(area);
	b.addVisuals(area.g.id, { w: area.w, h: area.h, margin: 25 });
	b.draw();
	return b;
}

//#endregion

//#fixedWidthWrapGrid
class FixedWidthWrapGrid {
	constructor(ms, cols, {wGrid,hGrid,hField, margin = 10, gap = 4}={}) {
		this.cont = ms;
		this.g = ms.elem;
		setOrigin(this.g,false);
		this.cols = cols;
		this.margin = margin;
		this.gap = gap;
		if (isdef(wGrid) && isdef(hGrid)) {this.wCont = wGrid;this.hCont = hGrid;}
		else [this.wCont,this.hCont] = ms.getSize();

		//console.log('size of grid',this.wCont,'x',this.hCont)

		this.iNext = 0;
		this.bounds = [];//array of already berechnete bounds
		this.w = this.wCont - 2 * margin;
		this.h = this.hCont - 2 * margin;
		this.origin = { x: margin, y: margin };

		this.wField = this.w / this.cols;
		this.hField = isdef(hField) ? hField : this.wField;

	}
	nextBounds() {
		let i = this.iNext;
		let irow = Math.floor(i / this.cols);
		let icol = i % this.cols;
		let x = this.origin.x + this.wField / 2 + icol * this.wField;
		let y = this.origin.y + this.hField / 2 + irow * this.hField;
		let w = this.wField - this.gap;
		let h = this.hField - this.gap;
		this.iNext += 1;
		return [x, y, w, h];
	}
}


//#region trash
function findMatchingFieldId(sf, bFront) {
	let row = sf.row;
	let col = sf.col;
	//console.log(sf.id, row, col, bFront.fieldsByRowCol, bFront.fieldsByRowCol[row][col]);
	let bf = bFront.fieldsByRowCol[row][col];
	//let bf = lookup(bFront, ['fieldsByRowCol', row, col]);
	return bf;
}
function presentObject_dep(id, o_new, o_old, options) {
	let ms = getuiG(id, 'main');
	if (!ms) return;
	let akku = [];
	//console.log(options.sysprop);
	//achtung!!! der hier schaut garnicht ob sysprops changed und er beachtet keine complex props!!!!!
	let color = 'black'; //standard text color for presentation >>TODO: soll das undefined sein?
	for (const prop in o_new) {
		if (isdef(options.sysprop[prop])) {
			let res = options.sysprop[prop](id, ms, o_new, o_old, options);
			//res can contain {color,text} or be null if nothing else needs to be done
			if (nundef(res)) continue;
			else {
				if (isdef(res.color)) color = res.color;
				if (isdef(res.text)) akku.push((options.showProps ? prop + ':' : '') + res.text);
				continue;
			}
		}
		if (isdef(options.optOut) && isdef(options.optOut[prop])) continue;
		let nval = o_new[prop];
		if (isSimple(nval)) {
			let noChange = (nundef(o_old) ? null : o_old[prop]) == nval;
			if (options.updateIf != 'always' && noChange) continue;

			let sval = nval.toString();
			akku.push((options.showProps ? prop + ':' : '') + sval);
		}
	}
	if (empty(akku)) return;
	ms.multiText({ txt: akku, fz: options.fontSize, fill: color });
}

//#endregion
