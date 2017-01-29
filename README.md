# twoplayer-firebase-js

I plan to use this module to implement a chess variation - [HalfChess](!www.halfchess.com).

This is the first implementation and has a client.js module (supposed to run on the browser) and a server.js module (supposed to be used from the backend).

The rules directory has firebase rules and the user needs to cut-copy-paste them to 'firebase console -> database -> rules' section.

The users are authenticated with anonymous method and the token is passed back to the client. The client uses the token to login or else would be denied permission to join a game.

I plan to add more information in coming days. 

Please feel free to reach out meanwhile on twitter @navalsaini for any queries, discussions or ideas.

Also feel free to forkit and create variations for your usecases. 
