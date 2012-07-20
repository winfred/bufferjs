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
			buffer = new Buffer({GROW_MODE: Buffer.GROW_MODE.REGROW});
			expect(buffer.GROW_MODE).to.be(Buffer.GROW_MODE.REGROW);
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
			buffer.add(9);
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
			buffer.add("element");
			expect(buffer.isEmpty()).to.eql(false);
		});
	});

	describe("#length attribute", function(){
		var buffer = new Buffer();		

		it("returns the nuber of elements in the buffer", function(){
			buffer.add("element");
			expect(buffer.length).to.eql(1);
		});
	});

	describe("#contains", function(){
		var buffer = new Buffer();

		it("returns true if the buffer contains a certain element",function(){
			buffer.add("a");
			expect(buffer.contains("a")).to.eql(true);
		});

		it("returns false if the buffer does not contain an element", function(){
			expect(buffer.contains(12345)).to.eql(false);
		});
	});

	describe("#add", function() {
		var buffer = new Buffer();		
		
		it("increases the length of the buffer by one", function(){
			expect(buffer).to.be.empty();
			buffer.add("element");
			expect(buffer.length).to.eql(1);
		});

		it("allows only elements of the defined DATA_TYPE", function(){
			expect((function(){
				buffer.clear();
				buffer.setDataType(Number);
				buffer.add("not a number");
			})).to.throwException(function(e){
				expect(e).to.be.a(Buffer.InvalidTypeAddException);
			});
		});
	});
	
	describe("#remove", function(){
		var buffer = new Buffer();
		buffer.add("a");
		buffer.add("b");
		buffer.add("c");

		it("decreases the length by one", function(){
			var length = buffer.length;
			buffer.remove();
			expect(buffer.length).to.eql(length - 1);
		});
		
		it("returns the oldest element in the buffer", function(){
			expect(buffer.remove()).to.eql("b");
		});

		it("returns null for an empty buffer",function(){
			buffer.clear();
			expect(buffer.remove()).to.eql(null);
		});

	});
});
