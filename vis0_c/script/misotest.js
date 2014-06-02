var ds = new Miso.Dataset({
  url : 'http://misoproject.com/data/crudeoil.csv',
  delimiter : ','
});

ds.fetch({
  success : function() {
    console.log("Available Columns:" + this.columnNames());
    console.log("There are " + this.length + " rows");
  }
});

log("succes!!!!!!!!!!!!!");