# Buffer.js

TODO: this readme.

Check out the comments and tests until then.

A circular array buffer is much like a queue in that it is FIFO and provides O(1) time for read/write operations; however, it is also optimized for streaming data in that a fixed capacity can be applied. [See Wikipedia](http://en.wikipedia.org/wiki/Circular_buffer)

## Features

Aside from the standard read/write concept of a buffer, this guy also has...

* Prototypal type checking
* Two operational modes supporting both continuous growth and fixed buffer length.
* Basic O(n) search of contents (just in case)


## API Reference

BufferJS tries to follow as many buffer and javascript conventions as possible, so this shouldn't feel unfamiliar.

### Constructor Options

* capacity - an intial capacity (defaults to 20)
* GROW_MODE - an initial growth mode (defaults to Buffer.GROW_MODE.OVERWRITE)
* DATA_TYPE - optional data type to enforce (defaults to null for no enforcement)

```javascript
var options = {
  capacity: 42,
  GROW_MODE: Buffer.GROW_MODE.CONTINUOUS,
  DATA_TYPE: MyObject
};
var buffer = new Buffer(options);
```

### Attributes

* length - get the current number of elements in the buffer

### Methods

* write - add an element to the buffer

```javascript
buffer.write({some: 'JSON', or: 'anything really'})
buffer.write(function(){console.log('i need this to be called later')})
buffer.write(42)
buffer.write(myObject);
```
* read - dequeue the oldest element in the buffer

```javascript
var element = buffer.read();
$.post('/game/actions', element);
```

* contains - simple O(n) search for containment

 ```javascript
buffer.write("hey")
buffer.contains("hey") //returns true
buffer.contains(1234) //returns false
```

* setDataType - apply a specific JS Object type to enforce across the buffer, only to be called on empty buffers

```javascript
buffer.setDataType(Number)   //enforces both primitive and OO numbers
buffer.write("not a number") //throws a Buffer.InvalidTypeWriteException

buffer.setDataType(String)   //enforces both primitive and OO strings
buffer.write("a string")     //will work

buffer.setDataType(MyObject) //works with custom objects as well
buffer.setDataType(Function) //or functions, etc...
```

* setGrowMode - apply one of the two grow modes to the buffer

```javascript
buffer.setGrowMode(Buffer.GROW_MODE.CONTINUOUS) //don't limit the buffer's size
buffer.setGrowMode(Buffer.GROW_MODE.OVERWRITE) //buffer's capacity is fixed, oldest will be overwritten
```

* Buffer.DEFAULT - set application-wide defaults for all new buffers

```javascript
//For example, if you need all buffers to have a certain configuration
Buffer.DEFAULT.GROW_MODE = Buffer.GROW_MODE.CONTINOUS
Buffer.DEFAULT.DATA_TYPE = MyObject;
Buffer.DEFAULT.capacity = 42;
```

