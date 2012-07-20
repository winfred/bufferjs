window.Buffer = (function(){
	var Buffer = function(options){
		var buffer, GROW_MODE, DATA_TYPE, capacity, array, length, head, tail;

		options = options || {};
		this.name = "Buffer";
		GROW_MODE = this.GROW_MODE = options.GROW_MODE || Buffer.GROW_MODE.OVERWRITE;
		DATA_TYPE = this.DATA_TYPE = options.DATA_TYPE || Object;
		capacity = this.capacity = options.capacity || 20;
		array = new Array(this.capacity);
		head = 0;
		tail = 0;
		length = this.length = 0;

		buffer = this;

		function incrementlength(){
			buffer.length = ++length;
		};

		function decrementlength(){
			buffer.length = --length;
		};

		this.setDataType = function(type){
			if (!this.isEmpty())
				throw new Buffer.InvalidTypeChangeException();

			DATA_TYPE = this.DATA_TYPE = type;
		};

		this.setGrowMode = function(growMode){
			GROW_MODE = this.GROW_MODE = growMode;
		};

		this.isEmpty = function(){
			return length == 0;
		};
		
		this.add = function(element){
			incrementlength();
			array.push(element);
		}
		
		this.clear = function(){
			this.length = length = 0;
		};

		this.toString = function(){
			var string = "Buffer: [";
			for (var i = length-1; i >= 0; i--)
				string += ", " + array[i];
			return string += "]";
		};
	};

	Buffer.GROW_MODE = {
		REGROW: "REGROW",
		OVERWRITE: "OVERWRITE"
	};

	Buffer.InvalidTypeChangeException = (function(){
		var error = function(){
			this.name = "InvalidBufferTypeChangeException";
			this.message = "It is not safe to change a buffer's type while it is not empty.";
		};
		error.prototype = new Error();
		return error;
	})();

	return Buffer;	
})();
