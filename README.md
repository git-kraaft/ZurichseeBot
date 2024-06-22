__Telegram bot Zürichsee__

This Telegram bot informs its subscribers about changes in the water temperature of lake Zurich (Zürichsee, Zürisee).
It basically scrapes a website containing data about two locations along the lake.
Polling is done every 3 hours. An update is sent if the difference between the current and the previous reading is at or above 0.4° Celsius.

Implemented in Javscript and run with node.js. Uses cheerio for request-promise reading of html web page.
Bot token and initial chat-ids are kept in config.js (rename config_templ.js to config.js)

The bot was created to take a look at node.js
Have fun with it!
