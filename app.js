var restify = require('restify'); 
var builder = require('botbuilder'); 

var server = restify.createServer(); 
server.listen(process.env.port || process.env.PORT || 3978, function(){
    console.log('%s listening to %s', server.name, server.url); 
});

var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

server.post('/api/messages', connector.listen()); 

var bot = new builder.UniversalBot(connector, [
    function(session){
        builder.Prompts.text(session, "hi what day is it?"); 
    },
    function(session, results){
        if(results.response.toLowerCase() == 'wednesday' ) {
            session.send('it is Wednesday my dudes'); 
        } else {
            session.endDialog('It is not Wednesday my dudes'); 
        }
    }
]); 

// var connector = new builder.ConsoleConnector().listen();
// var bot = new builder.UniversalBot(connector, function(session) {
//     session.send("You said: %s", session.message.text); 
// }); 