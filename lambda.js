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
    AutomaticFeedingIntentHandler
  )
  .addErrorHandlers(ErrorHandler)
  .withCustomUserAgent("sample/hello-world/v1.2")
  .lambda();
