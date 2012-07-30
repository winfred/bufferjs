window.Buffer = (function(){
  /**
   *  A FIFO Queue Circular Array Buffer Implementation
   *
   *  Operates with two methods of overflow protection.
   *    1.) Overwrite - will keep the allocated array length constant
   *        When capacity is reached, the oldest element gets replaced
   *        This is good for streaming data.
   *
   *    2.) CONTINUOUS - will simply keep writing elements to the array
   *        much like a regular JS array.push()
   *
   *  TODO: put examples here
   */
  var Buffer = function(options){
    var buffer, GROW_MODE, DATA_TYPE, capacity, array, length;

    /**
     * ------------------------------
     * | Private Instance Variables |
     * ------------------------------
     */
    options = options || {};
    this.name = "Buffer";
    GROW_MODE = this.GROW_MODE = options.GROW_MODE || Buffer.DEFAULT.GROW_MODE || Buffer.GROW_MODE.OVERWRITE;
    DATA_TYPE = this.DATA_TYPE = options.DATA_TYPE || Buffer.DEFAULT.DATA_TYPE || null;
    capacity = this.capacity = options.capacity || Buffer.DEFAULT.capacity || 20;
		array = [];
		this.length = 0;
    //brining this into scope for private methods
    buffer = this;

    /** 
     * ----------------------------
     * | Private Instance Methods |
     * ----------------------------
     */

    /**
     * Updates the public length accessor.
     *
     * @api private
     */
    function updateLength(){
      buffer.length = array.length;
    };

    /**
     * Check an elements type against the defined DATA_TYPE 
     *  for prototypal inheritance.
     *  Automatically wraps primitive numbers and strings
     *
     * @param {Object} element
     * @return {boolean} true if the element does not match the buffer's data type
     * @api private
     */
    function typeDoesNotMatch(element){
      if (typeof element === "number")
        return !DATA_TYPE.prototype.isPrototypeOf(new Number(element));
      if (typeof element === "string")
        return !DATA_TYPE.prototype.isPrototypeOf(new String(element));
      return !DATA_TYPE.prototype.isPrototypeOf(element);
    };

    /**
     * Determine if a .equals() method should be used on an element
     *
     * @param {Object} element
     * @return {boolean} true if the element responds to .equals()
     * @api private
     */
    function shouldUseEqualsMethodFor(element){
      return typeof element.equals === 'function';
    };

    /**
     * ---------------------------
     * | Public Instance Methods |
     * ---------------------------
     */

    
    /**
     * Iterate the array with a function
     *
     * @param {Function} 
     * @return this
     * @api public
     */
    this.forEach = function(fn){
      var breaking = false;

      function breakIteration(){
        breaking = true;
      };

      for (var i = 0, len = array.length; i < len; ++i) {
        if(breaking) break;
        else fn(array[++i], i, breakIteration);
      }
      return this;
    };

    /**
     * Check if the buffer contains an equivalent element
     *  Will use a .equal() method if available
     *  Otherwise checks with ===
     * 
     * @param {this.DATA_TYPE} element
     * @return {boolean} true if an equal element was found
     * @api public
     */
    this.contains = function(element){
      var found = false,
          useEqualsMethod = shouldUseEqualsMethodFor(element);

      this.forEach(function(probe,index,breakIteration) {
        if (useEqualsMethod) {

          if (element.equals(probe))
            found = true; breakIteration();
        
        } else {

          if (element === probe)
            found = true; breakIteration();
        }
      });

      return found;
    };  


    /**
     * Apply a new data type restriction to an empty buffer
     *   Will throw an exception if the buffer is not empty
     *
     * @param {Buffer.DATA_TYPE}
     * @return {Buffer} this buffer, handy for chaining
     * @throws Buffer.InvalidTypeChangeException
     * @api public
     */
    this.setDataType = function(type){
      if (!this.isEmpty())
        throw new Buffer.InvalidTypeChangeException();

      DATA_TYPE = this.DATA_TYPE = type;
      return this;
    };

    /**
     * Apply a new grow mode to the buffer
     *
     * @param {Buffer.GROW_MODE}
     * @return {Buffer} this buffer, handy for chaining
     * @api public
     */
    this.setGrowMode = function(growMode){
      GROW_MODE = this.GROW_MODE = growMode;
      return this;
    };

    /**
     * Check if the buffer is empty
     * 
     * @return {boolean} true if the buffer contains no elements
     * @api public
     */
    this.isEmpty = function(){
      return array.length == 0;
    };

    /**
     * Removes all data from the structure
     *
     * @return {Buffer} this buffer, handy for chaining
     * @api public
     */
    this.clear = function(){
      array = []
			this.length = 0;
      return this;      
    };

    /**
     * write a new element to the buffer (Enqueue)
     *
     * @param {this.DATA_TYPE} element
     * @return {Buffer} this buffer, handy for chaining
     * @api public
     */
    this.write = function(element){
      if (DATA_TYPE && typeDoesNotMatch(element))
        throw new Buffer.InvalidTypeWriteException();

			array.push(element);

      if (array.length > capacity && GROW_MODE !== Buffer.GROW_MODE.CONTINUOUS) {
				array.shift();
      } else {
	      updateLength();			
			}
      return this;      
    }
    
    /**
     * read the oldest element from the buffer (Dequeue)
     * 
     * @return {this.DATA_TYPE} element
     * @api public
     */
    this.read = function() {
      if (!this.isEmpty())
				this.length--;

			return array.shift();
    }
  };

  /**
   * ------------------------------
   * | Static Types and Exceptions|
   * ------------------------------
   */

  /**
   * Static types describing how the buffer will treat array overflows
   */
  Buffer.GROW_MODE = {
    CONTINUOUS: "CONTINUOUS",
    OVERWRITE: "OVERWRITE"
  };
  
  /**
   * Expose defaults publicly for application-wide defaults
   */
  Buffer.DEFAULT = {
    GROW_MODE: Buffer.GROW_MODE.OVERWRITE,
    DATA_TYPE: null,
    capacity: 20
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

  /**
   * Exception: Thrown if writing an element of incompatible type
   */
  Buffer.InvalidTypeWriteException = (function(){
    var error = function(){
      this.name = "InvalidTypeWriteException";
      this.message = "Attempted to write an element to this buffer that did not match the buffer's DATA_TYPE.";
    };
    error.prototype = new Error();
    return error;
  })();

  return Buffer;  
})();
