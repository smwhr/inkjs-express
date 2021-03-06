const express = require('express')
const app = express()
const port = 3000

var fs = require('fs');
var Story = require('inkjs').Story;

var inkFile = fs.readFileSync('./data/story.json', 'UTF-8').replace(/^\uFEFF/, '');

var myStory = new Story(inkFile);

app.get('/', (req, res) => res.send('The Intercept - Inkjs-Express Demo'))

app.get('/version', function(req, res){
  res.json({ version: "1.0" })
})

app.get('/restart', function(req, res){
  myStory = new Story(inkFile);
  res.redirect('/continue')
})

app.get('/continue', function(req, res){
  if (!myStory.canContinue && myStory.currentChoices.length === 0) res.json({ status: "end" })

  let userChoice = req.query.choice;
  if(userChoice){
    console.log(userChoice)
    try{
      myStory.ChooseChoiceIndex(parseInt(userChoice) - 1);  
      res.redirect('/continue')
      return;
    }catch(e){
      res.status(400).json({ status: "error", message: e.message })
      return
    }
    
    
  }

  var paragraphs = [];
  while (myStory.canContinue){
    var p = myStory.Continue();
    console.log(p)
    paragraphs.push(p);
  }

  var choices = [];
  if (myStory.currentChoices.length > 0){
    for (var i = 0; i < myStory.currentChoices.length; ++i) {
      var choice = myStory.currentChoices[i];
      console.log((i + 1) + ". " + choice.text);
      choices.push({choice: (i + 1) , label: choice.text})
    }
    
  }

  res.json({ status: "continued", paragraphs: paragraphs, choices: choices })
})

app.get('/goto', function(req, res){
  let knot = req.query.knot;

  try{
    myStory.ChoosePathString(knot);
    res.redirect('/continue')
    return;
  }catch(e){
    res.status(400).json({ status: "error", message: e.message })
  }
})


app.listen(port, () => console.log(`Inkjs-Express listening at http://localhost:${port}`))