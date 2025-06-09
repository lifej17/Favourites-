const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });
const PORT = 3000;

app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));
app.use(express.json());

app.get('/data', (req, res) => {
  const json = fs.readFileSync('data.json', 'utf-8');
  res.json(JSON.parse(json));
});

app.post('/save', (req, res) => {
  fs.writeFileSync('data.json', JSON.stringify(req.body, null, 2));
  res.sendStatus(200);
});

app.post('/upload', upload.single('image'), (req, res) => {
  const file = req.file;
  const imgPath = `/uploads/${file.filename}`;
  res.json({ imgPath });
});

app.listen(PORT, () => {
  console.log(`🌐 Favourites запущен на http://localhost:${PORT}`);
});