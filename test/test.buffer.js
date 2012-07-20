describe("Buffer", function(){
	var buffer = new Buffer();

	describe("#new",function(){

		beforeEach(function(){
			var buffer = new Buffer();
		});

		it("is empty at first",function(){
			expect(buffer).to.be.empty();
		});

		it("has a default initial capacity of 20", function(){
			expect(buffer.capacity).to.be(20);
		});

		it("has a default grow mode of REGROW", function(){
			expect(buffer.GROW_MODE).to.be(Buffer.GROW_MODE.REGROW);
		});	

		it("has a default type of Object", function(){
			expect(buffer.DATA_TYPE).to.be(Object);
		});

		it("allows an initial capacity to be set", function() {
			buffer = new Buffer({capacity: 24});
			expect(buffer.capacity).to.be(24);
		});

		it("allows an initial data type to be set", function() {
			buffer = new Buffer({DATA_TYPE: Function});
			expect(buffer.DATA_TYPE).to.be(Function);
		});
	});

	describe("#setType", function() {
		beforeEach(function() {
			var buffer = new Buffer();	
		});
		it("sets the DATA_TYPE if the structure is empty", function() {
			expect(buffer.DATA_TYPE).to.not.be(String);
			buffer.setType(String);
			expect(buffer.DATA_TYPE).to.be(String);
		});

		it("throws an exception if the structure is not empty", function() {
			buffer.add(9);
			try {
				buffer.setDataType(String);
				expect("this should not run").to.be("");
			} catch (e) {
				expect(e).to.be.a(Buffer.InvalidTypeChangeException);
			}
		});
	});

	describe("#setGrowMode", function() {
		it("should apply the new grow strategy to the buffer", function() {
			buffer.setGrowMode(Buffer.GROW_MODE.OVERWRITE);
			expect(buffer.GROW_MODE).to.eql(Buffer.GROW_MODE.OVERWRITE);
		});
	});

	describe("#isEmpty", function() {

		beforeEach(function(){
			var buffer = new Buffer();
		});

		it("returns true if the buffer is empty", function(){
			expect(buffer.isEmpty()).to.eql(true);
		});

		it("returns false if the buffer contains elements", function(){
			buffer.add("element");
			expect(buffer.isEmpty()).to.eql(false);
		});
	});

	describe("#length attributes", function(){
		beforeEach(function(){
			var buffer = new Buffer();
		});

		it("returns the nuber of elements in the buffer", function(){
			buffer.add("element");
			expect(buffer.length).to.eql(1);
		});
	});

	describe("#add", function() {
		beforeEach(function(){
			var buffer = new Buffer();
		});

		it("increases the length of the buffer by one", function(){
			expect(buffer).to.be.empty();
			buffer.add("element");
			buffer(buffer.length).to.eql(1);
		});

		it("allows only elements of the defined DATA_TYPE", function(){
			expect((function(){
				buffer.setDataType(Number);
				buffer.add("not a number");
			})).to.throwException(/InvalidElementTypeException/);
		});
	});
});
