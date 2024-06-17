const constants=require("./constants");
const ThingJsonController= require("./ThingJsonController");
const Alexa = require("ask-sdk-core");
const AWS = require("aws-sdk");
const thingJsonController=new ThingJsonController();
const IotData = new AWS.IotData({
  endpoint: constants.END_POINT,
});

const s3 = new AWS.S3();

var hoursSaved = "",
  minutesSaved = "";

function getShadowPromise(params) {
  return new Promise((resolve, reject) => {
    IotData.getThingShadow(params, (err, data) => {
      if (err) {
        console.log(err, err.stack);
        reject("Failed to get thing shadow ${err.errorMessage}");
      } else {
        resolve(JSON.parse(data.payload));
      }
    });
  });
}

async function getData(file) {
  const params = {
    Bucket: constants.BUCKET_NAME,
    Key: constants.FILE,
  };
  var response = await s3
    .getObject(params)
    .promise()
    .catch((error) => {
      console.log(error);
    });
  response = response.Body.toString("utf-8");
  return JSON.parse(response);
}

async function saveData(data, file) {
  const jsonString = JSON.stringify(data);
  const params = {
    Bucket: constants.BUCKET_NAME,
    Key: constants.FILE,
    Body: jsonString,
    ContentType: "application/json",
  };
  await s3
    .upload(params)
    .promise()
    .catch((error) => {
      console.log(error);
    });
}
function findObject(objects, objectName) {
  const object = objects.find((objectname) => objectname == objectName);
  return object;
}



const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "LaunchRequest"
    );
  },
  handle(handlerInput) {

    const speakOutput =constants.LAUNCH_REQUEST_MESSAGE;
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};

const GetTheCurrentObjectNameIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) ===
        "GetTheCurrentObjectNameIntent"
    );
  },
  handle(handlerInput) {
    var speakOutput;
    speakOutput =`estas usando a ${thingJsonController.getThingName()}`;
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};

const saveObjectNameIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) ===
        "SaveObjectNameIntent"
    );
  },
  async handle(handlerInput) {
    var speakOutput = constants.ERROR_MESSAGE_OBJECT_ALREADY_EXISTS;
    const objectNameSlot = Alexa.getSlotValue(
      handlerInput.requestEnvelope,
      "objectName"
    );
    const userId = Alexa.getUserId(handlerInput.requestEnvelope);
    var data;
    await getData(constants.FILE).then((result) => (data = result || {}));
    data[userId] ??= [];
    var objects = data[userId];
    const object = findObject(objects, objectNameSlot);
    if (!object) {
      objects.push(objectNameSlot);
      await saveData(data, constants.FILE)
        .then(() => {
          speakOutput = constants.SUCCESSFUL_CREATE_OBJECT_MESSAGE
        })
        .catch(() => {
          speakOutput =constants.ERROR_CREATE_OBJECT_MESSAGE;
        });
    }
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};

const selectObjectIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "SelectObjectIntent"
    );
  },
  async handle(handlerInput) {
    var speakOutput = `No se encontro el objeto, se quedara con el nombre  ${thingJsonController.getThingName()}`;
    const objectNameSlot = Alexa.getSlotValue(
      handlerInput.requestEnvelope,
      "objectName"
    );
    const userId = Alexa.getUserId(handlerInput.requestEnvelope);
    var data;
    await getData(constants.FILE).then((result) => (data = result || {}));
    data[userId] ??= [];
    var objects = data[userId];
    const objectName = findObject(objects, objectNameSlot);
    if (objectName) {
      thingJsonController.setThingName(objectName);
      speakOutput = `Ahora se esta usando a ${thingJsonController.getThingName()}`;
    }

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};
const AutomaticFeedingIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) ===
        "AutomaticFeedingIntent"
    );
  },
  handle(handlerInput) {
    var speakOutput = constants.ERROR_MESSAGE;
    let automaticModeJson=thingJsonController.getAutomaticModeJson();
    IotData.updateThingShadow(automaticModeJson, function (err, data) {
      if (err) console.log(err);
    });
    speakOutput = constants.ACTIVATION_MODE_MESSAGE;
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};

const ScheduledFeedingIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) ===
        "ScheduledFeedingIntent"
    );
  },
  handle(handlerInput) {
    var speakOutput = constants.ERROR_MESSAGE;
    let scheduleModeJson=thingJsonController.getScheduleModeJson();
    IotData.updateThingShadow(scheduleModeJson, function (err, data) {
      if (err) console.log(err);
    });

    speakOutput = constants.SCHEDULE_MODE_MESSAGE;
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};

const GetFeederModeIntent = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) ===
        "GetFeederModeIntent"
    );
  },
  async handle(handlerInput) {
    var modeFeeding;
    await getShadowPromise(thingJsonController.getShadowJson()).then(
      (result) => (modeFeeding = result.state.reported.activationCategory)
    );
    const modes = constants.MODE_STATES;
    var speakOutput = modes[Number(modeFeeding)] || constants.ERROR_MESSAGE;
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};
const ScheduleHourFeeding = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) ===
        "ScheduleHourFeeding"
    );
  },
  async handle(handlerInput) {
    const hour = Alexa.getSlotValue(
      handlerInput.requestEnvelope,
      "feedingHour"
    );
    const minutes = Alexa.getSlotValue(
      handlerInput.requestEnvelope,
      "feedingMinutes"
    );
    await getShadowPromise(thingJsonController.getShadowJson()).then((result) => {
      hoursSaved = result.state.desired.hoursToFeed || "";
      minutesSaved = result.state.desired.minutesToFeed || "";
    });
    hoursSaved += String(hour) + " ";
    minutesSaved += String(minutes) + " ";
    let updateTimeJson=thingJsonController.getUpdateTimeJson(hoursSaved,minutesSaved);
    updateTimeJson["payload"] = JSON.stringify(updateTimeJson["payload"]);
    IotData.updateThingShadow(updateTimeJson, function (err, data) {
      if (err) console.log(err);
    });
    var speakOutput = `se programo la comida a las ${hour} con ${minutes}`;
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};

const GetPlateStateIntent = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) ===
        "GetPlateStateIntent"
    );
  },
  async handle(handlerInput) {
    var state;
    var foodPortion;
    await getShadowPromise(thingJsonController.getShadowJson()).then(
      (result) => {
        state = result.state.reported.plateState;
        foodPortion=result.state.reported.foodPortion || constants.DEFAULT_FOOD_PORTION;
      }
    );
    const states = [`es menor a ${foodPortion} gramos`, `Es mas que ${foodPortion} gramos`];
    var speakOutput = states[Number(state)] ?? constants.ERROR_MESSAGE;
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};

const SetFoodPortionIntent = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) ===
        "SetFoodPortionIntent"
    );
  },
  handle(handlerInput) {
    var foodPortion=Alexa.getSlotValue(
      handlerInput.requestEnvelope,
      "foodPortion"
    );
   let updateFoodPortionParams=thingJsonController.getUpdateFoodPortionJson(foodPortion);
    updateFoodPortionParams["payload"] = JSON.stringify(updateFoodPortionParams["payload"]);
    IotData.updateThingShadow(updateFoodPortionParams, function (err, data) {
      if (err) console.log(err);
    });
    var speakOutput = `Se establecio la porcion ${foodPortion} gramos con exito`;
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "AMAZON.HelpIntent"
    );
  },
  handle(handlerInput) {
    const speakOutput =constants.HELP_INTENT_MESSAGE;
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      (Alexa.getIntentName(handlerInput.requestEnvelope) ===
        "AMAZON.CancelIntent" ||
        Alexa.getIntentName(handlerInput.requestEnvelope) ===
          "AMAZON.StopIntent")
    );
  },
  handle(handlerInput) {
    const speakOutput = constants.GOOD_BYE_MESSAGE;
    return handlerInput.responseBuilder.speak(speakOutput).getResponse();
  },
};

const FallbackIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) ===
        "AMAZON.FallbackIntent"
    );
  },
  handle(handlerInput) {
    const speakOutput =constants.FALLBACK_INTENT_MESSAGE;

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) ===
      "SessionEndedRequest"
    );
  },
  handle(handlerInput) {
    console.log(
      `~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`
    );
    // Any cleanup logic goes here.
    return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
  },
};

const IntentReflectorHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest"
    );
  },
  handle(handlerInput) {
    const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
    const speakOutput = ` You just triggered ${intentName}`;

    return (
      handlerInput.responseBuilder
        .speak(speakOutput)
        //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
        .getResponse()
    );
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    const speakOutput =constants.ERROR_HANDLER_MESSAGE;
    console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};


exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    ScheduledFeedingIntentHandler,
    selectObjectIntentHandler,
    AutomaticFeedingIntentHandler,
    GetFeederModeIntent,
    saveObjectNameIntentHandler,
    GetTheCurrentObjectNameIntentHandler,
    SetFoodPortionIntent,
    HelpIntentHandler,
    GetPlateStateIntent,
    ScheduleHourFeeding,
    CancelAndStopIntentHandler,
    FallbackIntentHandler,
    IntentReflectorHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .withCustomUserAgent("sample/hello-world/v1.2")
  .lambda();
