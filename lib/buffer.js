window.Buffer = (function(){
	var Buffer = function(options){
		var buffer, GROW_MODE, DATA_TYPE, capacity, array, length, head, tail;

		/**
		 * ------------------------------
		 * | Private Instance Variables |
		 * ------------------------------
		 */
		options = options || {};
		this.name = "Buffer";
		GROW_MODE = this.GROW_MODE = options.GROW_MODE || Buffer.GROW_MODE.OVERWRITE;
		DATA_TYPE = this.DATA_TYPE = options.DATA_TYPE || Object;
		capacity = this.capacity = options.capacity || 20;
		array = new Array(this.capacity);
		head = 0;
		tail = 0;
		length = this.length = 0;

		//brining this into scope for private methods
		buffer = this;

		/** 
		 * ----------------------------
		 * | Private Instance Methods |
		 * ----------------------------
		 */

		/**
		 *	Adds 1 to the length.
		 *	  Also updates the public length accessor.
		 *
		 *  @api private
		 */
		function incrementlength(){
			buffer.length = ++length;
		};

		/**
		 * Subtract 1 from the length.
		 *   Also updates the public length accessor.
		 *
		 * @api private
		 */
		function decrementlength(){
			buffer.length = --length;
		};

		/**
		 * ---------------------------
		 * | Public Instance Methods |
		 * ---------------------------
		 */

		/**
		 * Apply a new data type restriction to an empty buffer
		 *   Will throw an exception if the buffer is not empty
		 *
		 * @param {Buffer.DATA_TYPE}
		 * @throws Buffer.InvalidTypeChangeException
		 * @api public
		 */
		this.setDataType = function(type){
			if (!this.isEmpty())
				throw new Buffer.InvalidTypeChangeException();

			DATA_TYPE = this.DATA_TYPE = type;
		};

		/**
		 * Apply a new grow mode to the buffer
		 *
		 * @param {Buffer.GROW_MODE}
		 * @api public
		 */
		this.setGrowMode = function(growMode){
			GROW_MODE = this.GROW_MODE = growMode;
		};

		/**
		 * Check if the buffer is empty
		 * 
		 * @return {boolean} true if the buffer contains no elements
		 * @api public
		 */
		this.isEmpty = function(){
			return length == 0;
		};

		/**
		 * Lazily deletes (ignores) all elements in the buffer
		 *
		 * @api public
		 */
		this.clear = function(){
			this.length = length = 0;
			head = 0;
			tail = 0;
		};

		
		/**
		 * Add a new element to the buffer
		 *
		 * @param {this.DATA_TYPE} element
		 * @api public
		 */
		this.add = function(element){
			incrementlength();
			array.push(element);
		}
		
		this.toString = function(){
			var string = "Buffer: [";
			for (var i = length-1; i >= 0; i--)
				string += ", " + array[i];
			return string += "]";
		};
	};

	/**
	 * Static types describing how the buffer will treat array overflows
	 */
	Buffer.GROW_MODE = {
		REGROW: "REGROW",
		OVERWRITE: "OVERWRITE"
	};

	/**
	 * Exception: Thrown if the buffer's data type is changed while there are
	 *  elements inside of it.
	 */
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
