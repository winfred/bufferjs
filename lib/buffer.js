window.Buffer = (function(){
	var Buffer = function(options){
		var buffer, GROW_MODE, DATA_TYPE, capacity, array, size, head, tail;

		options = options || {};
		this.name = "Buffer";
		GROW_MODE = this.GROW_MODE = options.GROW_MODE || Buffer.GROW_MODE.OVERWRITE;
		DATA_TYPE = this.DATA_TYPE = options.DATA_TYPE || Object;
		capacity = this.capacity = options.capacity || 20;
		array = new Array(this.capacity);
		head = 0;
		tail = 0;
		size = this.length = 0;

		buffer = this;

		function updateLength(){
			buffer.length = size;			
		}
		function incrementSize(){
			size++;
			updateLength();
		};

		function decrementSize(){
			size--;
			updateLength();
		}

		this.setDataType = function(type){
			if (!this.isEmpty())
				throw new Buffer.InvalidTypeChangeException();

			DATA_TYPE = this.DATA_TYPE = type;
		};

		this.setGrowMode = function(growMode){
			GROW_MODE = this.GROW_MODE = growMode;
		};

		this.isEmpty = function(){
			return size == 0;
		};
		
		this.add = function(element){
			incrementSize();
			array.push(element);
		}
		
		this.clear = function(){
			size = 0;
			updateLength();
		};

		this.toString = function(){
			var string = "Buffer: [";
			for (var i = size-1; i >= 0; i--)
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
