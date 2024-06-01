const Alexa = require("ask-sdk-core");
const AWS = require("aws-sdk");
const IotData = new AWS.IotData({
  endpoint: "YOUR_END_POINT"
});
const file = "YOUR.JSON";
const s3 = new AWS.S3();
var thingName = "YOUR_DEFAULT_OBJECT";
var hoursSaved = "",minutesSaved = "";

const getAutomaticModeJson = (thing) => {
  return {
    thingName: thing,
    payload: '{"state": {"desired": {"activationCategory": true}}}',
  };
};

const getScheduleModeJson = (thing) => {
  return {
    thingName: thing,
    payload: '{"state": {"desired": {"activationCategory": false}}}',
  };
};

const getShadowJson = (thing) => {
  return { thingName: thing };
};

const getUpdateTimeJson = (thing, hoursSaved, minutesSaved) => {
  return {
    thingName: thing,
    payload: {
      state: {
        desired: { hoursToFeed: hoursSaved, minutesToFeed: minutesSaved },
      },
    },
  };
};

const getUpdateFoodPortionJson = (thing, foodPortion) => {
  return {
    thingName: thing,
    payload: {
      state: {
        desired: { foodPortion: Number(foodPortion) },
      },
    },
  };
};

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
    await getShadowPromise(getShadowJson(thingName)).then(
      (result) => (modeFeeding = result.state.reported.activationCategory)
    );
    const modes = [
      "Esta con el modo programable",
      "Esta con el modo automatico",
    ];
    console.log(modeFeeding);
    console.log(getShadowJson(thingName));
    var speakOutput = modes[Number(modeFeeding)] || "Error";
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
    var foodPortion = Alexa.getSlotValue(
      handlerInput.requestEnvelope,
      "foodPortion"
    );
    let updateFoodPortionParams = getUpdateFoodPortionJson(
      thingName,
      foodPortion
    );
    updateFoodPortionParams["payload"] = JSON.stringify(
      updateFoodPortionParams["payload"]
    );
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

const AutomaticFeedingIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) ===
        "AutomaticFeedingIntent"
    );
  },
  handle(handlerInput) {
    var speakOutput = "Error";
    console.log(thingName);
    let automaticModeJson = getAutomaticModeJson(thingName);
    IotData.updateThingShadow(automaticModeJson, function (err, data) {
      if (err) console.log(err);
    });
    speakOutput =
      "Modo automatico activado! Se alimentara si el plato no tiene la porcion adecuada";
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
    var speakOutput = "Error";
    let scheduleModeJson = getScheduleModeJson(thingName);
    IotData.updateThingShadow(scheduleModeJson, function (err, data) {
      if (err) console.log(err);
    });

    speakOutput = "Modo programable activado!, diga la hora a alimentar";
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
    await getShadowPromise(getShadowJson(thingName)).then((result) => {
      hoursSaved = result.state.desired.hoursToFeed || "";
      minutesSaved = result.state.desired.minutesToFeed || "";
    });
    hoursSaved += String(hour) + " ";
    minutesSaved += String(minutes) + " ";
    let updateTimeJson = getUpdateTimeJson(thingName, hoursSaved, minutesSaved);
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


const saveObjectNameIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) ===
        "SaveObjectNameIntent"
    );
  },
  async handle(handlerInput) {
    var speakOutput = "El objeto ya existe";
    const objectNameSlot = Alexa.getSlotValue(
      handlerInput.requestEnvelope,
      "objectName"
    );
    const userId = Alexa.getUserId(handlerInput.requestEnvelope);
    var data;
    await getData(file).then((result) => (data = result || {}));
    data[userId] ??= [];
    var objects = data[userId];
    const object = findObject(objects, objectNameSlot);
    if (!object) {
      objects.push(objectNameSlot);
      await saveData(data, file)
        .then(() => {
          speakOutput = "Se creó el objeto exitosamente";
        })
        .catch(() => {
          speakOutput = "Ocurrió un problema al crear el objeto";
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
    var speakOutput = `No se encontro el objeto, se quedara con el nombre por defecto ${thingName}`;
    const objectNameSlot = Alexa.getSlotValue(
      handlerInput.requestEnvelope,
      "objectName"
    );
    const userId = Alexa.getUserId(handlerInput.requestEnvelope);
    var data;
    await getData(file).then((result) => (data = result || {}));
    data[userId] ??= [];
    var objects = data[userId];
    const objectName = findObject(objects, objectNameSlot);
    if (objectName) {
      thingName = objectName;
      speakOutput = `Ahora se esta usando a ${thingName}`;
    }

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "LaunchRequest"
    );
  },
  handle(handlerInput) {
    const speakOutput =
      "Bienvenido al alimentador de perros, puedes pedir ayuda, crear un objeto o usar un objeto inteligente";
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
    await getShadowPromise(getShadowJson(thingName)).then((result) => {
      state = result.state.reported.plateState;
      foodPortion = result.state.reported.foodPortion || 50;
    });
    const states = [
      `es menor a ${foodPortion} gramos`,
      `Es mas que ${foodPortion} gramos`,
    ];
    var speakOutput = states[Number(state)] ?? "Error";
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
    const speakOutput =
      "Tienes las siguientes opciones: alimentar ahora, programar alimentacion, consultar modo de alimentacion, consultar el estado del plato, fijar la porcion de comida";

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
    const speakOutput = "Adios!";

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
    const speakOutput = "Lo siento, no te entiendo. Intentalo mas tarde.";

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
    const speakOutput =
      "Lo siento ocurrio un problema haciendo lo que me pediste, intentalo de nuevo.";
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
    HelpIntentHandler,
    GetPlateStateIntent,
    CancelAndStopIntentHandler,
    FallbackIntentHandler,
    SessionEndedRequestHandler,
    IntentReflectorHandler, 
    AutomaticFeedingIntentHandler, 
    ScheduledFeedingIntentHandler,
    GetFeederModeIntent,
    SetFoodPortionIntent,
    ScheduleHourFeeding,
    saveObjectNameIntentHandler,
    selectObjectIntentHandler
  )
  .addErrorHandlers(ErrorHandler)
  .withCustomUserAgent("sample/hello-world/v1.2")
  .lambda();
