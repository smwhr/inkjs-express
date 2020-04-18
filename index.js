const express = require('express')
const app = express()
const port = 3000

var fs = require('fs');
var Story = require('inkjs').Story;

var inkFile = fs.readFileSync('./data/story.json', 'UTF-8').replace(/^\uFEFF/, '');

var myStory = new Story(inkFile);

app.get('/', (req, res) => res.send('Hello World!'))

app.get('/version', function(req, res){
  res.json({ version: "1.0" })
})

app.get('/continue', function(req, res){
  if (!myStory.canContinue && myStory.currentChoices.length === 0) res.json({ status: "end" })

  let userChoice = req.query.choice;
  if(userChoice){
    console.log(userChoice)
    myStory.ChooseChoiceIndex(parseInt(userChoice) - 1);
    res.redirect('/continue')
    return;
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


app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))