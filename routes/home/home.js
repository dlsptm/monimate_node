// page d'accueil sans login
app.get('/', (req, res) => {
  res.render(__dirname+"/views/index.ejs");
})