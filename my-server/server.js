const path = require("path");
var express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
var geohash = require("ngeohash");
var SpotifyWebApi = require("spotify-web-api-node");

var app = express();
const API_KEY = "6siVwNXqzs4Vdea3BISSMAmMyAGtrE6i";

app.use(cors());

app.use(express.static(path.join(__dirname, "./dist/my-app")));
app.get(["/search/*"], (req, res) => {
  res.sendFile(path.join(__dirname, "./dist/my-app/index.html"));
});

const spotifyApi = new SpotifyWebApi({
  clientId: "9b7b68c36c7f434ba61d7c119f74ae69",
  clientSecret: "31e60b7c870a4248943311c976941f27",
});

app.get("/search", async (req, res) => {
  let segmentId = "";
  const category = req.query.Category;
  if (category === "Music") {
    segmentId = "KZFzniwnSyZfZ7v7nJ";
  } else if (category === "Sports") {
    segmentId = "KZFzniwnSyZfZ7v7nE";
  } else if (category === "Arts & Theatre") {
    segmentId = "KZFzniwnSyZfZ7v7na";
  } else if (category === "Film") {
    segmentId = "KZFzniwnSyZfZ7v7nn";
  } else if (category === "Miscellaneous") {
    segmentId = "KZFzniwnSyZfZ7v7n1";
  }

  console.log(segmentId);

  const unit = "miles";
  console.log(unit);

  const lat = req.query.Lat;
  const lon = req.query.Lon;
  console.log(lat);
  console.log(lon);
  const geo = geohash.encode(lat, lon, 7);
  console.log(geo);

  const radius = req.query.Distance;
  const keyword = req.query.Keyword;
  console.log(radius);
  console.log(keyword);

  const ticketmaster_base_url =
    "https://app.ticketmaster.com/discovery/v2/events.json?apikey=6siVwNXqzs4Vdea3BISSMAmMyAGtrE6i";
  const url =
    ticketmaster_base_url +
    "&keyword=" +
    keyword +
    "&segmentId=" +
    segmentId +
    "&radius=" +
    radius +
    "&unit=miles" +
    "&geoPoint=" +
    geo;
  console.log(url);

  try {
    const event_search_response = await fetch(url);
    const event_search_json = await event_search_response.json();
    console.log(event_search_json);
    res.json(event_search_json);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

app.get("/detail", async (req, res) => {
  const event_id = req.query.Event_id;

  const event_call_url = `https://app.ticketmaster.com/discovery/v2/events/${event_id}?apikey=${API_KEY}`;

  try {
    const event_detail_response = await fetch(event_call_url);
    const event_detail_json = await event_detail_response.json();

    console.log("This is detail backend event_detail_reponse_text");
    console.log(event_detail_json);
    res.json(event_detail_json);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

app.get("/venue", async (req, res) => {
  const keyword = req.query.Keyword;

  const venue_url = `https://app.ticketmaster.com/discovery/v2/venues.json?keyword=${keyword}&apikey=${API_KEY}`;

  try {
    const venue_detail_response = await fetch(venue_url);
    const venue_detail_json = await venue_detail_response.json();

    console.log("This is detail backend venue_detail_json");
    console.log(venue_detail_json);
    res.json(venue_detail_json);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

app.get("/autoComplete", async (req, res) => {
  const inputWord = req.query.InputWord;

  const suggest_url = `https://app.ticketmaster.com/discovery/v2/suggest?apikey=${API_KEY}&keyword=${inputWord}`;

  try {
    const autoComplete_response = await fetch(suggest_url);
    const autoComplete_json = await autoComplete_response.json();

    console.log("This is detail autoComplete_json");
    console.log(autoComplete_json._embedded.attractions);
    res.json(autoComplete_json._embedded.attractions);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

app.get("/artist", async (req, res) => {
  const attraction = req.query.Attraction;

  try {
    const artistList = await searchArtists(attraction);
    res.json(artistList);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
});

async function searchArtists(attraction) {
  // reference from github example
  try {
    const artist_data = await spotifyApi.searchArtists(attraction);
    console.log(artist_data);
    return artist_data.body;
  } catch (error) {
    if (error.statusCode === 401) {
      const tokenData = await spotifyApi.clientCredentialsGrant();
      spotifyApi.setAccessToken(tokenData.body["access_token"]);
      const new_artistList = await spotifyApi.searchArtists(attraction);
      return new_artistList.body;
    } else {
      throw new Error(error);
    }
  }
}

app.get("/artist/album", async (req, res) => {
  const spotify_id = req.query.spotifyArtistID;

  try {
    const albumList = await spotifyApi.getArtistAlbums(spotify_id, {
      limit: 3,
    });
    res.json(albumList);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Node.js API listening on port ${PORT}`);
});
