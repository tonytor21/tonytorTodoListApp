//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
//const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
// Create connection
mongoose.connect("mongodb+srv://tonytor:keep2121@cluster0.zar4k.mongodb.net/todolistDB")

// Create Schema
const itemSchema = {
  name: String
}

const listSchema = {
  name: String,
  item: [itemSchema]
}


// Create  Model
const Item = mongoose.model("Item", itemSchema)
const List = mongoose.model("List", listSchema)
// Add document in to Model
const item1 = new Item({
               name: "Wellcome to our todo list "
             })
const item2 = new Item({
              name: "click th + button to add "
            })
const item3 = new Item({
                name: "<-- click this to delet todo "
              })

var defaultItems = [item1,item2,item3];



app.get("/", function(req, res) {
  //const day = date.getDate();

  Item.find({}, function(err, foundItems){
                  if (foundItems.length === 0) {
                    Item.insertMany(defaultItems,function(err){
                                                  if (err) {
                                                      console.log(err);
                                                    } else {
                                                      console.log("Add successfully to the DB.");
                                                    }
                                                })
                        res.redirect("/")
                  }else {
                    res.render("list", {listTitle: "Today", newListItems: foundItems});
                  }


                              })

                    });

app.get('/:customListName', function(req,res){

                            const customListName = _.capitalize(req.params.customListName);

                            List.findOne({name:customListName},function(err, foundList){
                                                                  if(!err){
                                                                    if (!foundList) {
                                                                      const list = new List({
                                                                        name:customListName,
                                                                        item:defaultItems
                                                                      })
                                                                      list.save()
                                                                      res.redirect("/" + customListName )
                                                                    }else {
                                                                      res.render("list",{listTitle: foundList.name, newListItems: foundList.item})
                                                                    }
                                                                  }
                                                                })

                                                            })

app.post("/", function(req, res){

                const itemName = req.body.newItem;
                const listName = req.body.list;

                const item = new Item({
                  name: itemName
                })

                if (listName === "Today") {
                  item.save();
                  res.redirect('/')
                } else {
                  List.findOne({name:listName}, function(err, foundList){
                    foundList.item.push(item);
                     foundList.save();
                    res.redirect('/' + listName  )
                  })

                }




              });

app.post("/delete", function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

   if (listName === "Today") {
     Item.findByIdAndRemove(checkedItemId,function(err){
       if(!err){
         console.log("succussfully deleted");
         res.redirect('/')
       }
     })
   } else {
     List.findOneAndUpdate({name:listName}, {$pull:{item:{_id:checkedItemId}}}, function(err, foundList){
       if(!err){
         res.redirect("/" + listName);
       }
     })
   }



})



// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });
//
// app.get("/about", function(req, res){
//   res.render("about");
// });

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
