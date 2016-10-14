(function(Topology){
	/**
	 * Abstract node object
	 * @param {int} id
	 * @param {String} name
	 */
	function AbstractNode(name) {
		this.id = null;
		this.x = 0;
		this.y = 0;
		this.width = 0;
		this.height = 0;
		this.visible = true;
		this.dragable = true;

		this.name = name;
		this.image = null;
		this.color = null;
		this.layout = null;
		this.gravitate = null;//function(){};
		this.parentContainer = null;
		this.inContainer = null;
		this.outContainer = null;
		this.fixed = false;
	};

	AbstractNode.prototype = new Topology.Element();

	AbstractNode.prototype.getName = function(){
		return this.name;
	};

	AbstractNode.prototype.setName = function(n){
		this.name = n;
		return this;
	};

	AbstractNode.prototype.getImage = function(){
		return this.image;
	};

	AbstractNode.prototype.setImage = function(i){
		var node = this;
		if(typeof i == 'string'){
			var img = this.image = new Image();
			this.image.onload = function(){
				node.setSize(img.width, img.height);
			};
			this.image.src = i;
		}else{
			this.image = i;
		}
	};

	AbstractNode.prototype.getTypeImage = function(type){
		var host = Topology.Node.NodeType.Host;
		var basic = Topology.Node.NodeType.BasicNet;
		var firewell = Topology.Node.NodeType.Firewall;
		var ip = Topology.Node.NodeType.Ip;
		var lb = Topology.Node.NodeType.Loadbalance;
		var route = Topology.Node.NodeType.Route;
		var privateNet = Topology.Node.NodeType.PrivateNet;

		var src = null;
		switch(type)
		{
			case Topology.Node.NodeType.Host:
				src = './img/net/host.png';
				break;
			case Topology.Node.NodeType.BasicNet:
				src = './img/net/basic.png';
				break;
			case Topology.Node.NodeType.Firewall:
				src = './img/net/firewell.png';
				break;
			case Topology.Node.NodeType.Ip:
				src = './img/net/internet.png';
				break;
			case Topology.Node.NodeType.Loadbalance:
				src = './img/net/lb.png';
				break;
			case Topology.Node.NodeType.Route:
				src = './img/net/route.png';
				break;
			case Topology.Node.NodeType.PrivateNet:
				src = './img/net/private_network.png';
				break;
			default:
				src = null;
		}


		if(src == null) return null;

		var img = new Image();
		img.src = src;
		return img;
	};

	AbstractNode.prototype.getType = function(){
		return this.type;
	};

	AbstractNode.prototype.setType = function(type){
		this.type = type;
		this.setImage(this.getTypeImage(type));
	};

	Topology.AbstractNode = AbstractNode;

})(Topology);
