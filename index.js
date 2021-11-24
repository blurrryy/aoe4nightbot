const axios = require("axios");
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());

app.get("/rank", async (req, res) => {
  let params = {
    game: "aoe4",
    leaderboard_id: 17,
    start: 1,
    count: 1,
    search: "infernoXtreme",
  };

  let name = req.query.name ? String(req.query.name) : null;
  if (name) params.search = name;

  try {
      console.log(`New Request for ${params.search}`)
    let data = await axios.get(`https://aoeiv.net/api/leaderboard`, { params });
    if(data.status !== 200) throw `Ups! Fehler bei der Schnittstellenanfrage!`;
    data = data.data;
    if(data.count < 1) {
        res.send(`Kein Spieler mit diesem Namen gefunden!`);
    }
    else {
        let player = data.leaderboard[0];
        let answerString = `${player.country?`(${player.country}) `:''}${player.name} | Rank #${player.rank} (${player.rating}) | ${player.wins}W/${player.losses}L (${player.streak>0?`+${player.streak}`:player.streak})`;
        res.send(answerString);
    }
  } catch (err) {
      console.error(new Error(err));
    res.send(`Ups! Fehler bei der Schnittstellenanfrage!`);
  }
});

app.listen(3000, () => {console.log(`Listening on port 3000`)});

