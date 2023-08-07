const { Vonage } = require('@vonage/server-sdk');
require("dotenv").config({ path: './config.env' });

const vonage = new Vonage({
    apiKey: process.env.VONAGE_API_KEY,
    apiSecret: process.env.VONAGE_API_SECRET,
    applicationId: process.env.VONAGE_APPLICATION_ID,
    privateKey: 'private.key'
});

const NUMBERS = [{ Number: "+919896424841" }];

const answer_url = process.env.HOST_URL + '/vonage/voice/answer';
const event_url = process.env.HOST_URL + '/vonage/voice/event';

let i = 1;
const makeOutboundCall = (req, res) => {
    console.log('Making the outbound call...')
    i = 1;

    vonage.voice.createOutboundCall({
        to: [{
            type: 'phone',
            number: NUMBERS[0].Number
        }],
        from: {
            type: 'phone',
            number: process.env.VONAGE_NUMBER
        },
        answer_url: [answer_url],
        event_url: [event_url]
    });
};


const makeCall = async (no) => {
    console.log('Making the call...')

    await vonage.voice.createOutboundCall({
        to: [{
            type: 'phone',
            number: no
        }],
        from: {
            type: 'phone',
            number: process.env.VONAGE_NUMBER
        },
        answer_url: [answer_url],
        event_url: [event_url]
    });
    i++;
};

// * Answer call
const answerCall = async (req, res) => {
    console.log(req.body);
    console.log(req.hostname);
    try {
        return res.json([
            // {
            //     "action": "talk",
            //     "text": "Hello! How may I assist you today?"
            // },
            {
                "action": "connect",
                "from": process.env.VONAGE_NUMBER,
                "endpoint": [
                    {
                        "type": "websocket",
                        "uri": `wss://${req.hostname}/socket`,
                        "content-type": "audio/l16;rate=16000",
                        "headers": {
                            "conversation_uuid": req.body["conversation_uuid"],
                        },
                    },
                ],
            },
        ]);
    }
    catch (err) {
        console.log(
            "An error occurred while trying to answer call : " + err.message
        );
        return res.json([
            {
                action: "talk",
                text: "An error occurred. Please try later.",
            },
        ]);
    }
};

const handleEvents = (req, res) => {
    console.log(req.body);
    if ((req.body.status === "completed") && (i < NUMBERS.length)) {
        console.log(i);
        makeCall(NUMBERS[i].Number);
    }
    res.status(200).end();
};

module.exports = {
    makeOutboundCall,
    answerCall,
    handleEvents
};
