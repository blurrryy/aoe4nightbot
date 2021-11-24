const axios = require("axios");
const express = require("express");
const cors = require("cors");
const moment = require('moment');
moment.locale('de');

const app = express();
app.use(cors());

let globalData = {};

const refreshData = async () => {
  let data = await axios.get(
    "https://aoeiv.net/api/strings?game=aoe4&language=de"
  );
  if (data.status === 200) globalData = data.data;
};

refreshData();
setInterval(refreshData, 1000 * 60 * 60 * 24);

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
    console.log(`New Request for ${params.search}`);
    let data = await axios.get(`https://aoeiv.net/api/leaderboard`, { params });
    if (data.status !== 200) throw `Ups! Fehler bei der Schnittstellenanfrage!`;
    data = data.data;
    if (data.count < 1) {
      res.send(`Kein Spieler mit diesem Namen gefunden!`);
    } else {
      let player = data.leaderboard[0];
      let answerString = `${player.country ? `(${player.country}) ` : ""}${
        player.name
      } | Rank #${player.rank} (${player.rating}) | ${player.wins}W/${
        player.losses
      }L (${player.streak > 0 ? `+${player.streak}` : player.streak})`;
      res.send(answerString);
    }
  } catch (err) {
    console.error(new Error(err));
    res.send(`Ups! Fehler bei der Schnittstellenanfrage!`);
  }
});

app.get("/match", async (req, res) => {
  let params = {
    game: "aoe4",
    count: 1,
    steam_id: "76561198012752362",
  };
  try {
    console.log(`New Request for Match`);
    let data = await axios.get(`https://aoeiv.net/api/player/matches`, {
      params,
    });
    if (data.status !== 200) throw `Ups! Fehler bei der Schnittstellenanfrage!`;
    data = data.data;
    if (data.length < 1) {
      res.send(`Ups! Kein aktuelles Spiel gefunden!`);
    } else {
      data = data[0];
      if (data.num_players > 2) {
        res.send(`Ups! Aktuellstes Match ist kein 1v1`);
        return;
      }
      let mapType = globalData.map_type.find((x) => x.id === data.map_type);
      mapType = mapType ? mapType.string : null;
      let playerStrings = [];

      for(let p of data.players) {
          let civ = globalData.civ.find((x) => x.id === p.civ);
          civ = civ ? civ.string : null;
          playerStrings.push(`${p.name} (${p.rating})${civ? ` mit ${civ}`:''}`)
      }
      let dateString = data.started ? moment(new Date(parseInt(data.started)*1000).toISOString()).fromNow() : null
      playerStrings = playerStrings.join(' gegen ')
      let outputString = `Aktuellstes Match: ${playerStrings} ${mapType?`auf ${mapType}`:''} ${dateString?`gestartet ${dateString}`:''}`

      res.send(outputString)
    }
  } catch (err) {
    console.error(new Error(err));
    res.send(`Ups! Fehler bei der Schnittstellenanfrage!`);
  }
});

app.listen(3000, () => {
  console.log(`Listening on port 3000`);
});
