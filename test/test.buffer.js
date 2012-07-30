describe("Buffer", function(){

  function writeTo(buffer, times){
    for(var i = 0; i < times; i++)
      buffer.write(i);
  };

  function readFrom(buffer, times){
    for(var i = 0; i < times; i++)
      buffer.read();
  };

  describe("#new",function(){

    var buffer = new Buffer();    

    it("is empty at first",function(){
      expect(buffer).to.be.empty();
    });

    it("has a default initial capacity of 20", function(){
      expect(buffer.capacity).to.be(20);
    });

    it("has a default grow mode of OVERWRITE", function(){
      expect(buffer.GROW_MODE).to.be(Buffer.GROW_MODE.OVERWRITE);
    }); 

    it("has a default type of null with no type checking", function(){
      expect(buffer.DATA_TYPE).to.be(null);
    });

    it("allows an initial capacity to be set", function() {
      var mbuffer = new Buffer({capacity: 24});
      expect(mbuffer.capacity).to.be(24);
    });

    it("allows an initial data type to be set", function() {
      buffer = new Buffer({DATA_TYPE: Function});
      expect(buffer.DATA_TYPE).to.be(Function);
    });

    it("allows an initial grow mode to be set", function() {
      buffer = new Buffer({GROW_MODE: Buffer.GROW_MODE.CONTINUOUS});
      expect(buffer.GROW_MODE).to.be(Buffer.GROW_MODE.CONTINUOUS);
    });
  });

  describe("#setDataType", function() {
    var buffer = new Buffer();    

    it("sets the DATA_TYPE if the structure is empty", function() {
      expect(buffer.DATA_TYPE).to.not.be(String);
      buffer.setDataType(String);
      expect(buffer.DATA_TYPE).to.be(String);
    });

    it("throws an exception if the structure is not empty", function() {
      buffer.setDataType(null);
      buffer.write(9);
      expect((function(){
        buffer.setDataType(Number);
      })).to.throwException(/It is not safe to change a buffer's type/);
    });
  });

  describe("#setGrowMode", function() {
    it("should apply the new grow strategy to the buffer", function() {
      var buffer = new Buffer();
      buffer.setGrowMode(Buffer.GROW_MODE.OVERWRITE);
      expect(buffer.GROW_MODE).to.eql(Buffer.GROW_MODE.OVERWRITE);
    });
  });

  describe("#isEmpty", function() {
    var buffer = new Buffer();    

    it("returns true if the buffer is has no elements", function(){
      buffer.clear();
      expect(buffer.isEmpty()).to.eql(true);
    });

    it("returns false if the buffer contains elements", function(){
      buffer.write("element");
      expect(buffer.isEmpty()).to.eql(false);
    });
  });

  describe("#length attribute", function(){
    var buffer = new Buffer();    

    it("returns the number of elements in the buffer", function(){
      buffer.write("element");
      expect(buffer.length).to.eql(1);
    });

    it("can be overwritten publicly, but integrity is kept privately", function(){
      buffer.length = 10000;
      buffer.write("another element");
      expect(buffer.length).to.eql(2);
    });
  });

  describe("#write", function() {
    var buffer = new Buffer();    
    
    it("increases the length of the buffer by one", function(){
      expect(buffer).to.be.empty();
      buffer.write("element");
      expect(buffer.length).to.be(1);
    });

    it("allows elements of the defined DATA_TYPE", function(){
      buffer.clear();
      buffer.setDataType(String);
      expect(function(){
        buffer.write("this is a string");
      }).to.not.throwException();
      expect(buffer.length).to.be(1);
    });

    it("does not allow elements not of the defined DATA_TYPE", function(){
      expect((function(){
        buffer.clear();
        buffer.setDataType(Number);
        buffer.write("not a number");
      })).to.throwException(function(e){
        expect(e).to.be.a(Buffer.InvalidTypeWriteException);
      });
    });
  });
  
  describe("#read", function(){
    var buffer = new Buffer();
    buffer.write("a");
    buffer.write("b");
    buffer.write("c");

    it("decreases the length by one", function(){
      var length = buffer.length;
      buffer.read();
      expect(buffer.length).to.be(length - 1);
    });
    
    it("returns the oldest element in the buffer", function(){
      expect(buffer.read()).to.be("b");
    });

    it("returns undefined for an empty buffer",function(){
      buffer.clear();
      expect(buffer.read()).to.be(undefined);
    });

    it("removes the oldest element from the buffer", function(){
      buffer.clear();
      buffer.write("test");
      buffer.read();
      expect(buffer).to.be.empty();
      expect(buffer.contains("test")).to.be(false);
    });

  });

  describe("GROW_MODE::CONTINUOUS", function(){
    var buffer = new Buffer({capacity: 5, GROW_MODE: Buffer.GROW_MODE.CONTINUOUS});

    it("capacity is completely ignored in this mode", function(){
      expect(buffer.capacity).to.be(5);
    });

    it("length grows steadily based on writes", function(){
      buffer.clear();
      writeTo(buffer,100);
      expect(buffer.length).to.be(100);
    });

    it("length lessens steadily based on reads", function(){
      readFrom(buffer, 50);
      expect(buffer.length).to.be(50);
      writeTo(buffer,50);
      expect(buffer.length).to.be(100);
    });

  });
  
  describe("GROW_MODE::OVERWRITE", function(){
    var buffer = new Buffer({capacity: 25});

    it("capacity remains constant regardless of writes", function(){
      writeTo(buffer, 30);  
      expect(buffer.capacity).to.be(25);
    });

    it("length has a maximum possible value equal to capacity", function() {
      buffer.read();
      buffer.read();
      writeTo(buffer, 100);
      expect(buffer.length).to.be(25);
    });

    it("begins overwriting the oldest elements once capacity is reached", function(){
      buffer.clear();
      buffer.write("first/oldest element");
      writeTo(buffer, 24);
      expect(buffer.length).to.be(25);
      buffer.write("out with the old, in with the new");
      expect(buffer.contains("first/oldest element")).to.be(false);     
      expect(buffer.read()).to.not.be("first/oldest element");
    });
  });

});

describe("Buffer.DEFAULT", function() {
  it("allows a default application-wide GROW_MODE to be set", function() {
    Buffer.DEFAULT.GROW_MODE = Buffer.GROW_MODE.CONTINUOUS;
    var buffer = new Buffer();
    expect(buffer.GROW_MODE).to.be(Buffer.GROW_MODE.CONTINUOUS);
  });

  it("allows a default application-wide DATA_TYPE to be set", function() {
    Buffer.DEFAULT.DATA_TYPE = String;
    var buffer = new Buffer();
    expect(buffer.DATA_TYPE).to.be(String);
  });

  it("allows a default application-wide capacity to be set", function() {
    Buffer.DEFAULT.capacity = 50;
    var buffer = new Buffer();
    expect(buffer.capacity).to.be(50);
  });

  it("is Jimmy proof in case the POJO is overwritten", function() {
    Buffer.DEFAULT = "HERP DERP";
    var buffer = new Buffer();
    expect(buffer.capacity).to.be(20);
    expect(buffer.DATA_TYPE).to.be(null);
    expect(buffer.GROW_MODE).to.be(Buffer.GROW_MODE.OVERWRITE);
  });
});
