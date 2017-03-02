(function( window , undefined ) {
var arr = [],
	push = arr.push,
	slice = arr.slice;

var select = (function(){
	//定义正则
	var rnative = /\{\s*\[native/;
	var rtrim = /^\s+|\s+$/g;
	var rbaseselector = /^(?:\#([\w\-]+)|\.([\w\-]+)|(\*)|(\w+))$/;

	//方法检测：方法能力检测，方法定义检测
	//注意异常和代码报错的区别
	try{
		var div = document.createElement("div");
		div.innerHTML = '<p></p>';
		var arr = [];
		push.apply(arr,div.getElementsByTagName('p'));
	}catch(e){	
		push = {
			apply:function(array1,array2){
				for(var i = 0; i < array2.length;i++){
					array1[array1.length++] = array2[i];
				}
			}
		};
	}
	var support = {};	
	support.qsa = rnative.test(document.querySelectorAll + "");
	support.getElementsByClassName = rnative.test(document.getElementsByClassName + "");
	support.trim = rnative.test(String.prototype.trim + "");
	support.indexOf = rnative.test(Array.prototype.indexOf+ '');


	function myTrim(str){
		if(support.trim){
			return str.trim();
		}else{
			return str.replace(rtrim,'');
		}
	}
	function myIndexOf(array,search,startIndex){
		startIndex = startIndex || 0;
		if(support.indexOf){
			return array.indexOf(search,startIndex);
		}else{
			for(var i = startIndex;i < array.length; i++){
				if(array[i] === search){
					return i;
				}
			}
			return -1;
		}
	}
	function unique(array){
		var resArray = [],i=0;
		for(;i<array.length;i++){
			if( myIndexOf(resArray,array[i]) == -1 ){
				resArray.push(array[i]);
			}
		}
		return resArray;
	}


	function getByClassName( className,node ){
		node = node || document;
		var allElem,res = [];
		if(support.getElementsByClassName){
			return node.getElementsByClassName(className);
		}else{
			allElem = node.getByElementsByTagName('*');
			for( var i = 0; i<allElem.length;i++){
				if(allElem[i].className === className){
					res.push(allElem[i]);
				}
			}
			return res;
		}
	}

	function basicSelector(selector,node){	
		node = node || document;
		var results = results || [];
  		var m, temp;
  		m = rbaseselector.exec( selector );
  		if ( m ) {
    		if ( m[ 1 ] && 
                		( temp = document.getElementById( m[ 1 ] ) ) ) {
      		results.push( temp );
    		} else if ( m[ 2 ] ) {
      		push.apply( results, getByClassName( m[ 2 ] ),node);
    		} else if ( m[ 3 ] ) {
      		push.apply( results, node.getElementsByTagName( m[ 3 ] ) ); // selector
    		} else if ( m[ 4 ] ) {
      		push.apply( results, node.getElementsByTagName( m[ 4 ] ) ); // selector
    		}
  		}
  		return results;
		}

	function select2(selector,results){
			results = results || [];
			var selectors = selector.split(" ");
			var arr = [],node = [document];
			for(var i = 0; i<selectors.length; i++){
				for(var j = 0;j < node.length;j++){
					push.apply(arr,basicSelector(selectors[i],node[j]));
				}
					node = arr;
					arr = [];
			}
			push.apply(results,node);
			return results;
	}

	function select ( selector, results ) {
		results = results || [];
	 	var m, temp,selectors,i,subselector;
		if ( typeof selector != 'string' ){return results;}
		if ( support.qsa ) {
		    push.apply( results, document.querySelectorAll( selector ) )
		    return results;
		}
		selectors = selector.split(',');
		for( i = 0; i <selectors.length; i++){
			subselector = myTrim(selectors[i]);
			if(rbaseselector.test(subselector)){
				push.apply( results, basicSelect( subselector ) );
			}else{
				//因为select2函数中已经有对result的处理了，所以这里不需要push
				selector2(subselector,results);
			}
		  }
		  return unique(results);
	}

	return select;
})();
//今后若需要其它的选择器可以用其他的选择器
lu.select = select;

var parseHTML = (function(){
	var div = document.createElement('div');
	function parseHTML ( html ) {
	div.innerHTML = html;
	var res = [];
	for ( var i = 0; i < div.childNodes.length; i++ ) {
		res.push( div.childNodes[ i ] );
	}
	div.innerHTML = "";
	return res;
	}
	return parseHTML;
})();

function lu ( html ) {
	return new lu.prototype.init( html );
}

function getTxt(node,list){
	//用变量child得到node节点的所有子节点
	var child = node.childNodes;
	//遍历所有子节点
	for(var i = 0;i < child.length;i++){
		//判断子节点是不是文本节点
		if(child[i].nodeType == 3){
			//如果是文本节点，就将文字内容加到list数组中
			list.push(child[i].nodeValue);
		}
		if(child[i].nodeType == 1){
			getTxt(child[i],list);
		}
	}
}

lu.fn = lu.prototype = {
	//lu的原型里最好只有属性和init方法，其它所有方法最好是通过混入进来的
	//经过lu出来的元素都是type都是itcst，但是它里面的元素可能不是lu 类型
	constructor: lu,
	//若元素操作过程中使用了arr.push，则length属性会加1；否则就为0；
	length: 0,
	selector: '',   // 表示使用了选择器
  	type: 'lu',
	init: function ( html ) {
		if(html == null || html === ''){
			return;
		}
		if(typeof html === 'function'){
			var oldFn = window.onload;
			if(typeof oldFn ==='function'){
				window.onload = function(){
					oldFn();
					html();
				};
			}else{
				window.onload = html;
			}
			return; //前几个必须要用return，让对象没有events属性
		}
		if(html && html.type === 'lu'){
			//传入的是一个如果lu对象
			//将传入的lu对象的所有元素都加到this中
			//获得一个选择器得到结果的复制，所以它的selector里面也是有值的
			push.apply( this,html);
			this.selector = html.selector;
			this.events = html.events;
			return;
		}
		if(lu.isString(html)){
			if(/^</.test(html)){
				//parseHTML创建节点
				push.apply(this,parseHTML(html));
			}else{
				//select选择器：利用select选择器选择出来的元素不一定是lu元素
				push.apply( this, lu.select( html ) );
				//如果传入的是一个选择器选择dom对象，就为它加上一个selector属性记录内容
				this.selector = html;
			}
		}
		//判断是否为一个dom对象。返回的是一个lu对象
		//只能传入一个dom对象
		//或者写成isDom(html)
		if(html.nodeType){
			this[0] = html;
			//进行遍历的时候使用
			//没有用到数组的push所以要用length设置
			this.length = 1;
		}
		this.events = {}; //一定要放在init里面，放在init外面的话所有的lu对象都会拥有这些属性
						//前面的迹象必须加上return 让其没有此属性	
	}
 }
lu.fn.init.prototype = lu.fn;

lu.extend = lu.fn.extend = function(obj){
	for(var k in obj){
		this[k] = obj[k];
	}
}
//lu和lu.fn区别：形参和外界调用时方式不同。一个是工具函数，一个是实例方法, 工具函数为实例方法服务

lu.extend({
	isString:function(data){
		return typeof data === 'string';
	},
	isDom:function(data){
		if(data.nodeType){
			return true;
		}
		return false;
	},
	isObject:function(obj){
		return typeof obj === 'object';
	},
	each: function ( arr, func ) {
 		var i;
 		// 在 ES5 中还引入了 Array.isArray 的方法专门来判断数组
 		if ( arr instanceof Array || arr.length >= 0) {
 		  for ( i = 0; i < arr.length; i++ ) {
 		    func.call( arr[ i ], i, arr[ i ] );
 		  }
 		} else {
 		  for ( i in arr ) {
 		    func.call( arr[ i ], i, arr[ i ] );
 		  }
 		}
 		return arr;
  	},
 	map: function ( arr, func ) {
 	  var i, res = [], tmp;
 	  if ( arr instanceof Array || arr.length >= 0 ) {
 	    for ( i = 0; i < arr.length; i++ ) {
 	      tmp = func( arr[ i ], i );
 	      if ( tmp != null ) {
 	        res.push( tmp );
 	      }
 	    }
 	  } else {
 	    for ( i in arr ){
 	      tmp = func( arr[ i ], i );
 	      if ( tmp != null ) {
 	        res.push( tmp );
 	      }
 	    }
 	  }
 	  return res;
 	},
 	getStyle:function(dom,name){
 		if(dom.currentStyle){
 			return dom.currentStyle[name];
 		}else{
 			return window.getComputedStyle(dom)[name];
 		}
 	},
 	// 缓动函数作为工具使用, 所以放到 静态成员中
	lu.Easing = {
		line: function ( x, t, b, c, d ) {
			var speed = ( c - b ) / d;
			return speed * t;
		},
		change: function ( x, t, b, c, d ) {
			return Math.log( t + 1 ) / Math.log( d + 1 ) * ( c - b );
		},
		easeInQuad: function (x, t, b, c, d) {
			return c*(t/=d)*t + b;
		},
		easeOutQuad: function (x, t, b, c, d) {
			return -c *(t/=d)*(t-2) + b;
		},
		easeInOutQuad: function (x, t, b, c, d) {
			if ((t/=d/2) < 1) return c/2*t*t + b;
			return -c/2 * ((--t)*(t-2) - 1) + b;
		},
		easeInCubic: function (x, t, b, c, d) {
			return c*(t/=d)*t*t + b;
		},
		easeOutCubic: function (x, t, b, c, d) {
			return c*((t=t/d-1)*t*t + 1) + b;
		},
		easeInOutCubic: function (x, t, b, c, d) {
			if ((t/=d/2) < 1) return c/2*t*t*t + b;
			return c/2*((t-=2)*t*t + 2) + b;
		},
		easeInQuart: function (x, t, b, c, d) {
			return c*(t/=d)*t*t*t + b;
		},
		easeOutQuart: function (x, t, b, c, d) {
			return -c * ((t=t/d-1)*t*t*t - 1) + b;
		},
		easeInOutQuart: function (x, t, b, c, d) {
			if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
			return -c/2 * ((t-=2)*t*t*t - 2) + b;
		},
		easeInQuint: function (x, t, b, c, d) {
			return c*(t/=d)*t*t*t*t + b;
		},
		easeOutQuint: function (x, t, b, c, d) {
			return c*((t=t/d-1)*t*t*t*t + 1) + b;
		},
		easeInOutQuint: function (x, t, b, c, d) {
			if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
			return c/2*((t-=2)*t*t*t*t + 2) + b;
		},
		easeInSine: function (x, t, b, c, d) {
			return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
		},
		easeOutSine: function (x, t, b, c, d) {
			return c * Math.sin(t/d * (Math.PI/2)) + b;
		},
		easeInOutSine: function (x, t, b, c, d) {
			return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
		},
		easeInExpo: function (x, t, b, c, d) {
			return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
		},
			easeOutExpo: function (x, t, b, c, d) {
			return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
		},
		easeInOutExpo: function (x, t, b, c, d) {
			if (t==0) return b;
			if (t==d) return b+c;
			if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
			return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
		},
		easeInCirc: function (x, t, b, c, d) {
			return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
		},
		easeOutCirc: function (x, t, b, c, d) {
			return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
		},
		easeInOutCirc: function (x, t, b, c, d) {
			if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
			return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
		},
		easeInElastic: function (x, t, b, c, d) {
			var s=1.70158;var p=0;var a=c;
			if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
			if (a < Math.abs(c)) { a=c; var s=p/4; }
			else var s = p/(2*Math.PI) * Math.asin (c/a);
			return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
		},
		easeOutElastic: function (x, t, b, c, d) {
			var s=1.70158;var p=0;var a=c;
			if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
			if (a < Math.abs(c)) { a=c; var s=p/4; }
			else var s = p/(2*Math.PI) * Math.asin (c/a);
			return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
		},
		easeInOutElastic: function (x, t, b, c, d) {
			var s=1.70158;var p=0;var a=c;
			if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
			if (a < Math.abs(c)) { a=c; var s=p/4; }
			else var s = p/(2*Math.PI) * Math.asin (c/a);
			if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
			return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
		},
		easeInBack: function (x, t, b, c, d, s) {
			if (s == undefined) s = 1.70158;
			return c*(t/=d)*t*((s+1)*t - s) + b;
		},
		easeOutBack: function (x, t, b, c, d, s) {
			if (s == undefined) s = 1.70158;
			return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
		},
		easeInOutBack: function (x, t, b, c, d, s) {
			if (s == undefined) s = 1.70158; 
			if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
			return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
		},
		easeOutBounce: function (x, t, b, c, d) {
			if ((t/=d) < (1/2.75)) {
				return c*(7.5625*t*t) + b;
			} else if (t < (2/2.75)) {
				return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
			} else if (t < (2.5/2.75)) {
				return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
			} else {
				return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
			}
		}
	}
});


lu.fn.extend({
	each:function(func){
			var i;
			//表示数组和伪数组
			if( this instanceof Array || this.length >= 0){
				for( i = 0; i < this.length; i++){
					func.call(this[i],i,this[i]);
				}
			}else{
				for( i in this){
					func.call(this[i],i,this[i]);
				}
			}
			return this;
	},
	map: function ( func ) {
   		var i, res = [], tmp;
   		if ( this instanceof Array || this.length >= 0 ) {
   		  for ( i = 0; i < this.length; i++ ) {
   		    tmp = func( this[ i ], i );
   		    if ( tmp != null ) {
   		      res.push( tmp );
   		    }
   		  }
   		} else {
   		  for ( i in this ){
   		    tmp = func( this[ i ], i );
   		    if ( tmp != null ) {
   		      res.push( tmp );
   		    }
   		  }
   		}
   		return res;
 	},
	toArray: function () {
 	  //var res = [];
 	  //for ( var i = 0; i < this.length; i++ ) {
 	    //res.push( this[ i ] );
 	  //}
 	  //return res;
 	  return slice.call(this,0);
 	},
 	//括号里面是下标：0 1 2 3 创建出dom对象
 	get:function(index){
 		if( index === undefined ){
 			return this.toArray();
 		}
 		//伪元素有length属性，可以使用下标来获取元素
 		return this[index];
 	},
 	//括号里面是第几个元素：1 2 3 创建出lu对
 	eq:function(index){
 		var dom;
 		if( index>=0 ){
 			dom = this.get(index);
 		}else{
 			dom = this.get(this.length + index);
 		}
 		  // 这里 dom 要么是 undefiend 要么就是 dom 对象
  		  // if ( dom == null ) {
  		  // 在最开始判断，表示一个 length 为 0 的 lu 对象
  		  // } else {
  		  //   // 将 DOM 对象, 包装成 lu 对象
  		  // }
 		return lu(dom);
 		//或者写成return this.constructor( dom );
 	},
	appendTo:function(dom){
		//问题一：dom可能是dom节点（id得到的对象、class得到的对象），lu对象等等
		//问题二：dom可能有一个或者多个，可能是一个数组也有可能不是一个数组。
		//解决方法：先将它转化成一个lu对象，在其第一个元素里面添加
		//问题三：要添加到多个父元素的情况：用cloneNode(true);
		var iObj = lu(dom);
		//var iOjf = this.constructor(dom);
		var newObj = this.constructor();
		for(var i = 0;i <this.length; i++){
			for(var j = 0; j < iObj.length;j++){
				var temp;
				//	j==iObj.length-1
				//	  ? this[i]
				//	  : this[i].childNode(true);
				if(j == 0){
					temp = this[i];
				}else{
					temp = this[i].cloneNode(true);
				}
				//将克隆体和本体都添加到newObj对象中
				//这里只能用push，因为要添加的是一个dom元素的引用
				push.call(newObj,temp);
			 	iObj[j].appendChild(temp);
			}
		}
		return newObj;
	},
	append:function(selector){
		//链式编程 ：return this
		//有两种方法：反向利用appendTo，利用append方法
		// var iObj = this.constructor(selector);
		// var newObj = this.constructor();
		// for(var i = 0; i < iObj.length; i++){
		// 	for(var j = 0; j < this.length; j ++){
		// 		var temp;
		// 		if(j == 0){
		// 			temp = iObj[i];
		// 		}else{
		// 			temp = iObj[i].cloneNode(true);
		// 		}
		// 		push.call(newObj,temp);
		// 		this[j].appendChild(tmp);
		// 	}
		// }
		// return newObj;

		this.constructor(selector).appendTo(this);
		return this;
	},
	prependTo:function(selector){
		var iObj = this.constructor(selector);
		var newObj = this.constructor();
		for(var i = 0; i < this.length; i++){
			for(var j = 0; j < iObj.length;j++){
				var temp = 
					j == iObj.length-1
					? this[i]
					: this[i].cloneNode(true);
				push.call(newObj,temp);
				iObj[j].insertBefore(temp,iObj[j].firstChild);
			}
		}
		return newObj;
	},
	/*click:function(func){
	this.each(function(){ //这里的this代表所有获得的元素
			//this.onclick = func;	//这里的this是对每个遍历之后得到的元素
			//this.addEventListener('click',func);//可以实现事件的追加，考虑兼容ie浏览器	
		});
		return this;
	}*/
	/*添加事件：
		1、给lu对象添加一个events对象
		2、events里面存储各种事件的信息，用键值对表示，键为click、dblclick等
		3、键值对的值为数组[]，数组的组成为函数即要执行的事件
	
	*/
	on:function(type,func){
		//这里this指的是dom对象，后面this的指向会发生变化，this指向dom下面的元素，所以这里要记录dom的值
		//解析第一次遇到click事件时，如果lu对象的events属性中没有click的话，就为它添加上；并且绑定事件，如果放在if
		//外面，就会绑定多次事件；
		if( !this.events[type] ){
			this.events[type] = [];
			var that = this;
			this.each(function(){
				//这里this的值发生了变化，指向dom后面的元素
				//绑定onclick事件
				var self = this;
				var f = function(e){
					for(var i = 0; i < that.events[type].length;i++){
						that.events[type][i].call(self);
					}
				}
				if(this.addEventListener){
					this.addEventListener(type,f);
				}else{
					this.attachEvent("on"+type,f);
				}
			});
		}
		this.events[type].push(func);
		return this;
	},
	off:function(type,fn){
		var arr = this.events[type];
		for(var i = 0;i < arr.length; i++){
			if(arr[i] === fn){
				arr.slice(i,1);
			}
		}
	},
	hover:function(fun1,fun2){
		this.mouseover(fun1);
		this.mouseout(fun2);
		return this;
	},
	//toggle能在发生click的时候循环执行参数里面的函数
	toggle:function(){
		var i = 0,args = arguments;
		this.on('click',function(e){
			args[i % args.length].call(this,e);
			i++;
		});
		return this;
	},
	css:function(option){
		var args = arguments,
			len = args.length;
		//如果option的length是2的话，就是设置一个属性
		if((len == 2)&&(lu.isString(args[0]))&&(lu.isString(args[0]))){
			this.each(function(){
				this.style[args[0]] = args[1];
			})
		//如果option的length是1的话，如果option是字符串就是获取样式，如果option是对象就是设置多个属性。
		}else if(len === 1){
			if(lu.isString(args[0])){
				//获取第一个dom元素this[0]的样式args[0]
				return this[0].style[args[0]]||lu.getStyle(this[0],args[0]);
			}else if(lu.isObject(args[0])){
				for(var i = 0;i < this.length; i++){
					for(var k in option){
						this.style[k] = option[k];
					}
				}
			}
		}
	},
	addClass:function(name){
		//链式编程，在进行each操作之后得到的仍然是this
		return this.each(function(){
			var classTxt = this.className;
			if((" " + classTxt + " ").indexOf(" " + name + " ") == -1){
				this.className += " "+name;
			}
		})
	},
	removeClass:function(name){
		return this.each(function(){
			var classTxt = ' ' + this.className + ' ';
			var rclassName = new RegExp(' ' + name +' ','g');
			this.className = classTxt
							.replace(rclassName,' ')
							.replace(/\s+/g,' ')
							.trim();
		});
	},
	//只要lu对象中有一个dom元素包含对应的属性就返回true。
	//链式编程：返回值为this
	hasClass:function(name){
		for(var i = 0;i < this.length; i++){
			if((' '+this[i].className+' ').indexOf(' '+name+' ')!= -1){
				return true;
			}
		}
		return false;
	},
	toggleClass:function(name){
		if(this.hasClass(name)){
			this.removeClass(name);
		}else{
			this.addClass(name);
		}
		return this;
	},
	//属性操作
	attr:function(name,value){
		if(value){
			if(lu.isString(name) && lu.isString(value)){
				return this.each(function(){
					this.setAttribute(name,value);
				});
			}
		}else{
			if(lu.isString(name)){
				return this[0].getAttribute(name);
			}
		}
		return this;
	},
	prop:function(name,value){
		if(arguments.length == 2 && value != undefined){
			if(lu.isString(name)){
				this.each(function(){
					this[name] = value;
				});
			}
		}else{
			if( lu.isString(name)){
				return this[0][name];
			}	
		}
		return this;
	},
	val:function(value){
		return this.attr('value',value);
	},
	html:function(html){
		return this.prop('innerHTML',html);
	},
	text:function(txt){
		if(txt){
			return this.each(function(){
				this.innerHTML = ' ';
				this.appendChild(document.createTextNode(txt+''));
			});
		}else{
			var arr = [];
			getTxt(this[0],arr);
			return arr.join(' ');
		}
		return this;
	},
	animate:function( props, dur, easing, fn){
		// 只设置第一个dom对象
		// 增加stop功能
		var x = this[ 0 ],
			isOver = false;
		var startx = parseInt(x.style.left || x.offsetLeft),
			starty = parseInt(x.style.top || x.offsetTop),
			startTime = +new Date();
		//设置当前对象的定时器
		this.intervalId = setInterval(function(){
			var t = (+new Date) - startTime;
			if( t >= dur){
				clearInterval(this.intervalId);
				t = dur;
				isOver = True;
			}
			//实现缓动
			easing = easing || 'change';
			x.style.left = startx + lu.Easing[easing](null,t,startx,parseInt(props['left']),dur) + 'px';
			x.style.top = starty + lu.Easing[easing](null,t,starty,parseInt(props['top']),dur) + 'px';
			//结束的时候调用传入的回调函数
			if(isOver && fn){
				fn.apply(that);
			}
		},20);
	},
	intervalId:null,
	stop:function(){
		clearInterval(this.intervalId);
		this.intervalId = null;
	}
});
lu.each(( "blur focus focusin focusout load resize scroll unload click dblclick " +
  "mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
  "change select submit keydown keypress keyup error contextmenu" ).split(' '),function(i,v){
		lu.fn[v] = function(fn){
			this.on(v,fn);
			return this;
		};
});

//沙箱模式让外界访问的两种方式：一种是return返回值,一种是window公开一个让外界访问的接口。这里没有return所以使用window

window.lu = window.I = lu;
 }) (window)
	

