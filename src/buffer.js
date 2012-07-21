window.Buffer = (function(){
  /**
   *  A FIFO Queue Circular Array Buffer Implementation
   *
   *  Operates with two methods of overflow protection.
   *    1.) Overwrite - will keep the allocated array length constant
   *        When capacity is reached, the oldest element gets replaced
   *        This is good for streaming data.
   *
   *    2.) CONTINUOUS - will simply keep writeing elements to the array
   *        much like a regular JS array.push()
   *
   *  TODO: put examples here
   */
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
    DATA_TYPE = this.DATA_TYPE = options.DATA_TYPE;
    capacity = this.capacity = options.capacity || 20;
    array = new Array(this.capacity);
    head = 0;
    tail = -1;
    length = this.length = 0;

    //brining this into scope for private methods
    buffer = this;

    /** 
     * ----------------------------
     * | Private Instance Methods |
     * ----------------------------
     */

    /**
     *  Adds 1 to the length.
     *    Also updates the public length accessor.
     *
     *  @api private
     */
    function incrementLength(){
      buffer.length = ++length;
    };

    /**
     * Subtract 1 from the length.
     *   Also updates the public length accessor.
     *
     * @api private
     */
    function decrementLength(){
      buffer.length = --length;
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
     * Iterate the array with a function
     *
     * @param {Function} 
     */
    function iterateWith(fn){
      var breaking = false, 
          i = head - 1;

      function breakIteration(){
        breaking = true;
      };

      while(i != tail) {
        if(i + 1 >= length)
          i = 0;
        if(breaking)
          break;
        else
          fn(array[++i], breakIteration);
      } 
    };

    /**
     * Make room for another element(s) using the grow strategy
     * 
     * @api private
     */
    function makeSpace() {
      if (GROW_MODE === Buffer.GROW_MODE.CONTINUOUS)
        regrow();
      else
        incrementHead();
    };

    /**
     * Double the array's capacity and rearrange the head/tail if needed
     *  Rearrangement should only happen if the buffer
     *  changes grow modes mid-lifecycle, which seems unlikely.
     *  TODO: use array slicing to rearrange head/tail mismatch in this case
     *
     *  @api private
     */
    function regrow() {
      buffer.capacity = capacity = capacity * 2;
      if (head > tail) {
        var newArray = new Array(capacity),
            index = 0;        
        iterateWith(function(probe){
          newArray[index] = probe;
        });
        array = newArray;
        head = 0;
        tail = length - 1;
      }
    };

    /**
     * Moves head one position forward
     *
     * @api private
     */
    function incrementHead() {
      if(head + 1 === capacity) head = 0;
      else head++;
    };
  
    /**
     * Moves tail one position forward
     *
     * @api private
     */
    function incrementTail() {
      if(tail + 1 == capacity) tail = 0;
      else tail++;
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
     * ---------------------------
     * | Public Instance Methods |
     * ---------------------------
     */

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
     * @return {Buffer} this buffer, handy for chaining
     * @param {Buffer.GROW_MODE}
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
      return length == 0;
    };

    /**
     * Removes all data from the structure
     *
     * @return {Buffer} this buffer, handy for chaining
     * @api public
     */
    this.clear = function(){
      array = new Array(capacity);
      this.length = length = 0;
      head = 0;
      tail = -1;
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

      iterateWith(function(probe,breakIteration) {
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
     * write a new element to the buffer (Enqueue)
     *
     * @param {this.DATA_TYPE} element
     * @return {Buffer} this buffer, handy for chaining
     * @api public
     */
    this.write = function(element){
      if (DATA_TYPE && typeDoesNotMatch(element))
        throw new Buffer.InvalidTypeWriteException();

      if (length === capacity) {
        makeSpace();
        if (GROW_MODE === Buffer.GROW_MODE.CONTINUOUS)
          incrementLength();
      } else {
        incrementLength();
      }
      incrementTail();
      array[tail] = element;
      return this;      
    }
    
    /**
     * read the oldest element from the buffer (Dequeue)
     * 
     * @return {this.DATA_TYPE} element
     * @api public
     */
    this.read = function() {
      if (this.isEmpty())
        return null;
      else {
        var element = array[head];
        array[head] = null;
        incrementHead();
        decrementLength();
        return element;
      }
      
    }

    this.toString = function(){
      var string = "Buffer: [";
      for (var i = 0, limit = length; i < limit ; i++)
        string += ", " + array[i];
      return string += "]";
    };
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
   * Exception: Thrown if writeing an element of incompatible type
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
