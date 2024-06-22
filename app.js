//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
var _ = require("lodash");

const app = express();
mongoose.connect("mongodb://0.0.0.0:27017/todolistDB");

const itemschema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model('item', itemschema);

const item1 = new Item({
  name: "Wake-up"
});
const item2 = new Item({
  name: "Brush your teeth"
});
const item3 = new Item({
  name: "Take Bath"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemschema]
}

const List = mongoose.model("List", listSchema);




app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));







app.get("/", function (req, res) {

  const day = date.getDate();

  Item.find({})
    .then(data => {
      // data.forEach(e => { console.log(e.name) });
      if (data.length === 0) {
        Item.insertMany([item1, item2, item3])
          .then((err) => {
            if (err) {
              console.log("Items added succesfully")
            } else {
              console.log("Error occured");
            }
          });
        res.redirect('/');
      }
      else {
        res.render("list", { listTitle: day, newListItems: data });
        // mongoose.connection.close();
      }
    });


});

app.post("/", function (req, res) {

  const itemname = req.body.newItem;
  const listname = req.body.list;

  const item4 = new Item({
    name: itemname
  });
  const day = date.getDate();
  if (listname === day) {
    item4.save();
    res.redirect('/');
  }
  else {
    List.findOne({ name: listname })
      .then(data => {
        data.items.push(item4);
        data.save();
        res.redirect('/' + listname);
      })
  }



});

app.post("/delete", function (req, res) {
  const itemid = req.body.checkbox;
  const listname = req.body.listname;

  const day = date.getDate();
  if (listname === day) {
    Item.findByIdAndRemove(itemid)
      .then((data) => {
        if (data) {
          console.log("Items deleted succesfully")
        } else {
          console.log("Error occured");
        }
      });

    res.redirect('/');
  }
  else {
    List.findOneAndUpdate({ name: listname }, { $pull: { items: { _id: itemid } } })
      .then((data) => {
        res.redirect('/' + listname);
      });
  }



});

app.get("/:customlistname", function (req, res) {
  const listname = _.capitalize(req.params.customlistname);
  List.findOne({ name: listname })
    .then(data => {
      if (!data) {
        console.log("No list found");
        const list = new List({
          name: listname,
          items: defaultItems
        })
        list.save();
        res.redirect("/" + listname);
      }
      else {
        res.render("list", { listTitle: listname, newListItems: data.items });
      }
    });

})

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
