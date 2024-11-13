require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const querystring = require('querystring');

const app = express();
const PORT = 3000;

app.use(cors());

// Serve static files from the "public" directory
app.use(express.static('public'));

// Spotify login route
app.get('/login', (req, res) => {
  const scope = 'user-top-read';
  const authUrl = 'https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: process.env.CLIENT_ID,
      scope: scope,
      redirect_uri: process.env.REDIRECT_URI,
    });
  res.redirect(authUrl);
});

// Spotify callback route
app.get('/callback', async (req, res) => {
  const { code } = req.query;

  // Exchange authorization code for access token
  try {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      querystring.stringify({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: process.env.REDIRECT_URI,
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const { access_token } = response.data;
    res.redirect(`/top-tracks?access_token=${access_token}`);
  } catch (error) {
    console.error('Error fetching access token:', error);
    res.send('Error during authentication');
  }
});

// Fetch user's top tracks
app.get('/top-tracks', async (req, res) => {
  const { access_token } = req.query;

  try {
    const response = await axios.get('https://api.spotify.com/v1/me/top/tracks?limit=5', {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    //map through the tracks to extract only the title names, artists
    const formattedTracks = response.data.items.map(track => ({
        name: track.name,
        artists: track.artists.map(artist => artist.name).join(', ')
    }));

    res.json(formattedTracks); //send only the formatted track data
  } catch (error) {
    console.error('Error fetching top tracks:', error);
    res.status(500).send('Error fetching top tracks');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
