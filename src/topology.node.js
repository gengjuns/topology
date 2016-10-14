(function (Topology) {

    var NodeType = {};
    NodeType.BasicNet = 0;
    NodeType.PrivateNet = 1;
    NodeType.Route = 2;
    NodeType.Loadbalance = 3;
    NodeType.Ip = 4;
    NodeType.Host = 5;
    NodeType.Firewall = 6;

    var NodeTypeMap = [
        {
            id: NodeType.Host,
            map: [NodeType.BasicNet, NodeType.PrivateNet]
        },
        {
            id: NodeType.Ip,
            map: [NodeType.BasicNet]
        },
        {
            id: NodeType.Loadbalance,
            map: [NodeType.Ip, NodeType.PrivateNet]
        },
        {
            id: NodeType.Route,
            map: [NodeType.Loadbalance, NodeType.BasicNet]
        },
        {
            id: NodeType.PrivateNet,
            map: [NodeType.Route]
        },
    ];


    function Node(name, type) {
        this.name = name;
        this.width = 32;
        this.height = 32;
        this.x = 0;
        this.y = 0;
        this.style = {fillStyle: '255, 85, 85', fontSize: '10px', font: "Microsoft YaHei"};
        //nodetype
        this.type = type;
        this.selected = false;
        this.alpha = 2;
        this.scala = 1;
        this.rotate = 0;
        this.childNodes = [];
        this.parentNode = null;
        this.childArrangeType = 'x';
        if (this.type == Topology.Node.NodeType.PrivateNet) {
            this.childArrangeType = 'y';
        }
    };


    Node.prototype = new Topology.AbstractNode();

    Node.prototype.addChildNode = function (node, box) {
        node.parentNode = this;
        this.childNodes.push(node);
        box.nodes.push(node);
    };

    Node.prototype.drawText = function (ctx) {
        var name = this.getName();
        if (!name || name == '') return;
        var textWidth = ctx.measureText(name).width;
        ctx.font = this.style.fontSize + ' ' + this.style.font;
        //ctx.strokeStyle = 'rgba(255, 3, 0, '+ this.alpha+')';
        //ctx.strokeText(name, -this.width/2+ (this.width - textWidth)/2, this.height/2 + 12);

        ctx.fillStyle = 'rgba(15, 15, 15, ' + this.alpha + ')';
        ctx.fillText(name, -this.width / 2 + (this.width - textWidth) / 2, this.height / 2 + 12);
    };

    Node.prototype.drawTip = function (ctx) {
        var tip = this.getTip();
        if (!tip || tip == '') return;

        var textWidth = ctx.measureText(tip).width;
        ctx.save();
        ctx.beginPath();
        ctx.font = this.style.fontSize + ' ' + this.style.font;
        ctx.strokeStyle = 'rgba(230, 230, 230, ' + this.alpha + ')';
        if (textWidth > this.width) {
            ctx.strokeText(tip, -this.wdith - 2, -this.y - 2);
        } else {
            ctx.strokeText(tip, -this.width() + this.getWidth() - textWidth - 2, this.getY() - 2);
        }
        ctx.stroke();
        ctx.closePath();
        ctx.restore();
    };

    Node.prototype.drawSelectedRect = function (ctx) {
        var textWidth = ctx.measureText(this.getName()).width;
        var w = Math.max(this.width, textWidth);
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(248,31,72, 0.9)';
        //ctx.fillStyle = 'rgba(168,202,236,0.1)';
        ctx.rect(-w / 2 - 3, -this.height / 2 - 2, w + 6, this.height + 16);
        //ctx.fill();
        ctx.stroke();
        ctx.closePath();
        ctx.restore();
    };

    Node.prototype.draw = function (ctx) {
        if (!this.isVisible()) return;
        var node = this;
        var ratio = Topology.util.getPixelRatio(ctx);
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.rotate);
        ctx.scale(this.scala, this.scala);

        if (node.isSelected() || node.isFocus()) {
            this.drawSelectedRect(ctx);
        }

        var image = this.getImage();
        if (image != null) {
            //ctx.rect(-this.width/2, -this.height/2, this.width, this.height);
            //ctx.clip();
            //console.log(this.ratio);
            //console.log(image.width);
            // 注意，这里的 width 和 height 变成了 width * ratio 和 height * ratio
            ctx.drawImage(image, -this.width * ratio / 2, -this.height * ratio / 2, this.width * ratio, this.height * ratio);

            //ctx.drawImage(image, -this.width/2, -this.height/2);
        } else {
            ctx.beginPath();
            ctx.fillStyle = 'rgba(' + this.style.fillStyle + ',' + this.alpha + ')';
            ctx.rect(-this.width / 2, -this.height / 2, this.width, this.height);
            ctx.fill();
            ctx.closePath();
        }
        this.drawText(ctx);
        if (this.isTipVisible) {
            this.drawTip(ctx);
        }
        ctx.restore();
    };

    Node.prototype.split = function (angle) {
        var node = this;

        function genNode(x, y, r, beginDegree, endDegree) {
            var newNode = new Topology.Node();
            newNode.setImage(node.image);
            newNode.setLocation(x, y);
            newNode.draw = function (ctx) {
                ctx.save();
                ctx.arc(this.x + this.width / 2, this.y + this.height / 2, r, beginDegree, endDegree);
                ctx.clip();
                ctx.beginPath();
                if (this.image != null) {
                    ctx.drawImage(this.image, this.x, this.y);
                } else {
                    ctx.fillStyle = 'rgba(' + this.style.fillStyle + ',' + this.alpha + ')';
                    ctx.rect(this.x, this.y, this.width, this.height);
                    ctx.fill();
                }
                ctx.closePath();
                ctx.restore();
            };
            return newNode;
        };
        Node.prototype.calculateNodePosition = function () {
        };

        var beginDegree = angle;
        var endDegree = angle + Math.PI;

        var nodeA = genNode(node.x, node.y, node.width, beginDegree, endDegree);
        var nodeB = genNode(node.x, node.y, node.width, beginDegree + Math.PI, beginDegree);

        return {
            nodeA: nodeA,
            nodeB: nodeB
        };
    };
    function InheritNode(name, type) {
        var node = new Node(name, type);

        node.drawSelectedRect = function (ctx, nodeType) {
            var nodeTypeMap = Topology.Node.NodeTypeMap;

            var isSupportted = false;
            for (var j in nodeTypeMap) {
                if (nodeTypeMap[j].id == nodeType) {
                    var supportedTypes = nodeTypeMap[j].map;
                    if (supportedTypes) {
                        for (var t in supportedTypes) {
                            if (supportedTypes[t] == this.type) {
                                isSupportted = true;
                            }
                        }
                    }
                }
            }

            if (isSupportted) {
                var textWidth = ctx.measureText(this.getName()).width;
                var w = Math.max(this.width, textWidth);
                ctx.save();
                ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
                ctx.beginPath();
                ctx.strokeStyle = 'rgba(248,31,72, 0.9)';
                //ctx.fillStyle = 'rgba(168,202,236,0.1)';
                ctx.rect(-w / 2 - 3, -this.height / 2 - 2, w + 6, this.height + 16);
                //ctx.fill();
                ctx.stroke();
                ctx.closePath();
                ctx.restore();
            }

            for (var i = 0; i < this.childNodes.length; i++) {
                this.childNodes[i].drawSelectedRect(ctx, nodeType);
            }

        };

        node.calculateNodePosition = function () {
            var node = this;
            if (node.childNodes.length > 0) {
                var x = node.x;
                var y = node.y;

                if (node.childArrangeType == 'x') {
                    //横向的排列
                    var horizon_x_inc = 100;
                    var horizon_y_inc = 200;
                    var topY = y - ((node.childNodes.length - 1) * horizon_y_inc) / 2;
                    for (var i = 0; i < node.childNodes.length; i++) {
                        var childNode = node.childNodes[i];
                        var x_child = x + horizon_x_inc;
                        var y_child = topY + i * horizon_y_inc;
                        childNode.setLocation(x_child, y_child);
                        childNode.calculateNodePosition();

                    }
                } else if (node.childArrangeType == 'y') {
                    //纵向的排列
                    var vertical_x_inc = 100;
                    var vertical_y_inc = 100;
                    for (var i = 0; i < node.childNodes.length; i++) {
                        var childNode = node.childNodes[i];
                        var x_child = x + (i + 1) * vertical_x_inc;
                        var y_child = y + vertical_y_inc;
                        childNode.setLocation(x_child, y_child);
                        childNode.calculateNodePosition();
                    }
                }
            }
        };

        node.draw = function (ctx) {

            if (!node.isVisible()) return;
            var ratio = Topology.util.getPixelRatio(ctx);
            ctx.save();
            ctx.translate(node.x + node.width / 2, node.y + node.height / 2);
            ctx.rotate(node.rotate);
            ctx.scale(node.scala, node.scala);

            if (node.isSelected() || node.isFocus()) {
                node.drawSelectedRect(ctx);
            }

            var image = node.getTypeImage(type);
            if (image != null) {
                ctx.drawImage(image, -node.width * ratio / 2, -node.height * ratio / 2, node.width * ratio, node.height * ratio);
            } else {
                ctx.beginPath();
                ctx.fillStyle = 'rgba(' + node.style.fillStyle + ',' + node.alpha + ')';
                ctx.rect(-node.width / 2, -node.height / 2, node.width, node.height);
                ctx.fill();
                ctx.closePath();
            }
            node.drawText(ctx);
            if (node.isTipVisible) {
                node.drawTip(ctx);
            }
            ctx.restore();

            if (node.childNodes.length > 0) {
                for (var i = 0; i < node.childNodes.length; i++) {
                    var childNode = node.childNodes[i];
                    childNode.draw(ctx);
                    var link = new Topology.FabricLink(node, childNode, node.childArrangeType);
                    link.lineWidth = 1;
                    link.strokeColor = '97,97,97';
                    link.draw(ctx);

                }
            }
        };
        return node;
    }


    Topology.Node = Node;
    Topology.InheritNode = InheritNode;
    Topology.Node.NodeType = NodeType;
    Topology.Node.NodeTypeMap = NodeTypeMap;


})(Topology);
