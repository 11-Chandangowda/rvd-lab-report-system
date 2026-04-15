const express = require('express');
const { google } = require('googleapis');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const SHEET_ID = '1F-z4Zqh2nn1SQVabsyZmJO9xbfrf-eT5Hbj5NJSXkbI';
const RANGE = 'Sheet1!A2:D';

// ✅ Use ONLY API KEY
const sheets = google.sheets({
  version: 'v4',
  auth: 'AIzaSyA5bFuelNoD9_9KvQifMS0P5DfM6_BrjW8'
});

// ✅ Convert Drive link to direct download
function convertToDirectLink(url) {
  const match = url.match(/\/d\/(.*?)\//);
  if (match && match[1]) {
    return `https://drive.google.com/uc?export=download&id=${match[1]}`;
  }
  return url;
}

app.post('/get-report', async (req, res) => {
  const { phone, labNo } = req.body;

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: RANGE,
    });

    const rows = response.data.values;

    const report = rows.find(r =>
      r[0] === phone && r[2] === labNo
    );

    if (!report) {
      return res.json({ success: false });
    }

    const directLink = convertToDirectLink(report[3]);

    return res.json({
      success: true,
      link: directLink,
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching report');
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));