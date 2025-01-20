require('log-timestamp');
const { TOKEN, INITCHATIDS } = require('./config');
const TelegramBot      = require('node-telegram-bot-api');
const token            = TOKEN;
const bot              = new TelegramBot(token, {polling: true});
// use api call instead of webpage
const url_Myth         = "https://tecdottir.metaodi.ch/measurements/mythenquai?sort=timestamp_cet%20desc&limit=1&offset=0";
const url_Tief         = "https://tecdottir.metaodi.ch/measurements/tiefenbrunnen?sort=timestamp_cet%20desc&limit=1&offset=0";
const temperatureParse = require('./tempParse');
const myth             = "Mythenquai";
const tief             = "Tiefenbrunnen";
const noloc            = "noloc";                // only used for disabled message
const tempDiff         = 0.4;                    // Temperature offset to last message
const keyboard         = [[myth],[tief]];
const msg_option       = {
                          "parse_mode": "Markdown"
                         ,"reply_markup": {
                            "keyboard": keyboard
                           }
                         };

var allChatIDs = new Array();
allChatIDs = INITCHATIDS;
var locationMap = new Map();
var lastTempMyth = 0;
var lastTempTief = 0;

function addChatID(chatID) {
  if (!allChatIDs.includes(chatID)) {
    allChatIDs.push(chatID);
    console.log("Added chatID " + chatID);
  }
}

function setChatIDLoc(chatID, loc) {
  locationMap.set(chatID, loc);
  console.log("Updated " + chatID + " with location " + loc);
}

function remvChatID(chatID) {
  var idx = allChatIDs.indexOf(chatID);
  if (idx > -1) {
    allChatIDs.splice(idx, 1);
    locationMap.delete(chatID);
    console.log("Removed chatID " + chatID);
  }
}

function broadcastTemp(temp, location) {
  allChatIDs.forEach(sendMsg);
  function sendMsg(item, index) {
    if (locationMap.get(item) == location) {
      bot.sendMessage(
        item
        , "Die Wassertemperatur beim " + location + " beträgt: " + temp + "° C"
        , msg_option
      )
        .catch(err => {
          console.log(+index + 1 + ". " + err + ". Removing ID " + item);
          remvChatID(item);
        });
      console.log(+index + 1 + ". broadcast to " + item);
    }
  }
}

/**
 *  Poll the water temperature at certain intervalls
 *  Broadcast a message to all chats on init or if
 *  temperature difference is greater 0.4° C
 */
setInterval(function() {
  // Location Mythenquai
	//console.log('starting broadcast');
  temperatureParse(url_Myth)
	  .then(function(result) {
      //console.log("Myth " + result + 'last ' + lastTempMyth);
      if (!lastTempMyth) {
        lastTempMyth = result;
		    //console.log('broadcasting ' + result);
        broadcastTemp(result, myth);
      } else {
        if (Math.abs(lastTempMyth - result) >= tempDiff) {
          broadcastTemp(result, myth);
          lastTempMyth = result;
        }
      }
    })
    .then(function() {
      // Location Tiefenbrunnen
      temperatureParse(url_Tief)
	      .then(function (result) {
          //console.log("Tief " + result);
          if (!lastTempTief) {
            broadcastTemp(result, tief);
            lastTempTief = result;
          } else {
            if (Math.abs(lastTempTief - result) >= tempDiff) {
              broadcastTemp(result, tief);
              lastTempTief = result;
            }
          }
	      })
    })	
}, 10800000); // 10800000 ms (3h)

bot.on('message', (msg) => {
  console.log("ChatID: " + msg.chat.id + " Name: " + msg.from.last_name + ", " + msg.from.first_name + ": " + msg.text.toString());
  addChatID(msg.chat.id);

  var url;
  var loc;
  var msg_text;

  switch (msg.text) {
    case myth:
      url = url_Myth;
      loc = myth;
      break;
    case tief:
      url = url_Tief;
      loc = tief;
      break;
    default:
      url = "";
      loc = "";
      console.log("nix schlaues: " + msg.text.toString());        
  }
  if (loc !== "") {
    console.log("loc: " + loc + " url: " + url);
    if (loc == noloc) {
      msg_text = "Temperatur beim " + noloc + " wegen Bauarbeiten zur Zeit nicht verfügbar.";
      bot.sendMessage(
        msg.chat.id
       ,msg_text
       ,msg_option
      );
    } else {
      var temp = temperatureParse(url);
      temp.then(function(result) {
        msg_text = "Die Wassertemperatur beim " +  loc + " beträgt: " + result + "° C";
        bot.sendMessage(
          msg.chat.id
         ,msg_text
         ,msg_option
        );
      }, (err) => {
          if (err) {
            bot.sendMessage(msg.chat.id, "Die Daten konnten nicht geladen werden.");
            console.log(err);
          }
        })
    }
    setChatIDLoc(msg.chat.id, loc);
  } else {
    bot.sendMessage(
      msg.chat.id
     ,"*Wassertemperatur Zürichsee*\n" +
      "Messstation _" + myth + "_ oder _" + tief + "_?"
     ,msg_option
    );
  }
});
