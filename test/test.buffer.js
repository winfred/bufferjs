describe("Buffer", function(){

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

	describe("#contains", function(){
		var buffer = new Buffer();

		it("returns true if the buffer contains a certain element",function(){
			buffer.write("a");
			expect(buffer.contains("a")).to.eql(true);
		});

		it("returns false if the buffer does not contain an element", function(){
			expect(buffer.contains(12345)).to.eql(false);
		});
	});

	describe("#write", function() {
		var buffer = new Buffer();		
		
		it("increases the length of the buffer by one", function(){
			expect(buffer).to.be.empty();
			buffer.write("element");
			expect(buffer.length).to.eql(1);
		});

		it("allows only elements of the defined DATA_TYPE", function(){
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
			expect(buffer.length).to.eql(length - 1);
		});
		
		it("returns the oldest element in the buffer", function(){
			expect(buffer.read()).to.eql("b");
		});

		it("returns null for an empty buffer",function(){
			buffer.clear();
			expect(buffer.read()).to.eql(null);
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

		it("capacity doubles once capacity is reached", function(){
			for(var i = 0; i < 100; i++)
				buffer.write(i);
			expect(buffer.capacity).to.be(160); //5, 10, 20, 40, 80, 160
		});

		it("length grows steadily based on writes", function(){
			buffer.clear();
			for(var i = 0; i < 100; i++)
				buffer.write(i);
			expect(buffer.length).to.be(100);
		});

		it("length lessens steadily based on reads", function(){
			for(var i = 0; i < 50; i++)
				buffer.read();
			expect(buffer.length).to.be(50);
			for(var i = 0; i < 50; i++)
				buffer.write(i);
			expect(buffer.length).to.be(100);
		});

		it("capacity remains the same until it is reached (a la circular array)", function(){
			expect(buffer.capacity).to.be(160);
		});

		it("when capacity doubles, circular array structure is still transparent", function(){
			buffer.clear();
			for(var i = 0; i< 160; i++)
				buffer.write(i);
			expect(buffer.capacity).to.be(160);
			expect(buffer.read()).to.be(0);
			for(var i = 0; i< 10; i++)
				buffer.read();
			for(var i = 0; i< 11; i++)
				buffer.write("hey");
			expect(buffer.read()).to.be(11);
		});
	});
	
	describe("GROW_MODE::OVERWRITE", function(){
		var buffer = new Buffer({capacity: 25});

		it("capacity remains constant regardless of writes", function(){
			for(var i = 0; i < 30; i++)
				buffer.write(i);
			expect(buffer.capacity).to.be(25);
		});

		it("length has a maximum possible value equal to capacity", function() {
			buffer.read();
			buffer.read();
			for(var i = 0; i < 100; i++)
				buffer.write(i);
			expect(buffer.length).to.be(25);
		});

		it("begins overwriting the oldest elements once capacity is reached", function(){
			buffer.clear();
			buffer.write("first/oldest element");
			for(var i = 0; i < 24; i++)
				buffer.write(i);
			expect(buffer.length).to.be(25);
			buffer.write("out with the old, in with the new");
			expect(buffer.contains("first/oldest element")).to.be(false);			
			expect(buffer.read()).to.not.be("first/oldest element");
		});
	});

});
