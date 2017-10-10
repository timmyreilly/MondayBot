var restify = require('restify');
var builder = require('botbuilder');

var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

server.post('/api/messages', connector.listen());

var bot = new builder.UniversalBot(connector, [
    function (session) {
        session.beginDialog('createAlarm', session.dialogData.profile); 
    },
    function (session, results) {
        session.dialogData.profile = results.response;
        if (session.dialogData.profile.date.toLowerCase() == 'wednesday') {
            session.send('it is Wednesday my dudes');
        } else {
            session.send('It is not Wednesday my dudes');
        }
        session.send(`Hello ${session.dialogData.profile.name}! I love ${session.dialogData.profile.date}!`);  
    },
    function(session, results){
        session.beginDialog('createAlarm');
    },
    function(session, results){
        session.send(results.response); 
    }
]);

bot.dialog('createAlarm', [
    function(session){
        session.dialogData.alarm = {}; 
        builder.Prompts.text(session, "What would you like to name this alarm?"); 
    },
    function(session, results, next){
        if(results.response){
            session.dialogData.name = results.response;
            builder.Prompts.time(session, "What time would you like to set an alarm for?"); 
        } else {
            next(); 
        }

    },
    function(session, results){
        if(results.response){
            session.dialogData.time = builder.EntityRecognizer.resolveTime([results.response]); 
        }

        // return alarm to caller
        if (session.dialogData.name && session.dialogData.time){
            session.endDialogWithResult({
                response: { name: session.dialogData.name, time: session.dialogData.time }
            });
        } else {
            session.endDialogWithResult({
                resumed: builder.ResumeReason.notCompleted
            });
        }
    }
]);

bot.dialog('collectData', [
    function (session, args, next) {
        session.dialogData.profile = args || {};
        if (!session.dialogData.profile.name) {
            builder.Prompts.text(session, "What is your name?");
        } else {
            next();
        }
    },
    function (session, results, next) {
        if (results.response) {
            // save use's name if we asked for it. 
            session.dialogData.profile.name = results.response;
        }
        if (!session.dialogData.profile.date) {
            builder.Prompts.text(session, "What day is it???");
        } else {
            next(); // Skip if we already have this info. 
        }
    },
    function (session, results) {
        if (results.response) {
            session.dialogData.profile.date = results.response;
        }
        session.endDialogWithResult({ response: session.dialogData.profile });
    }
]); 
