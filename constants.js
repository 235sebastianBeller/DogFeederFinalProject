const constants = {
    END_POINT:"a3i9cvbxqqn25a-ats.iot.us-east-1.amazonaws.com",
    
    DEFAULT_THING_NAME:"dogfeeder",
    
    BUCKET_NAME:"bucket-prac4",
    
    FILE : "data.json",
    
    MODE_STATES :[
                    "Esta con el modo programable",
                    "Esta con el modo automatico"
                ],
                
    DEFAULT_FOOD_PORTION:50,
    
    ERROR_MESSAGE:"Error",
    
    HELP_INTENT_MESSAGE:`Tienes las siguientes opciones: 
                            alimentar ahora, 
                            programar alimentacion,
                            consultar modo de alimentacion,
                            consultar el estado del plato,
                            fijar la porcion de comida`,
                            
    LAUNCH_REQUEST_MESSAGE: `Bienvenido al alimentador de perros,
                             puedes pedir ayuda,
                             crear un objeto, usar un objeto inteligente 
                             consultar que objeto se esta usando`,
                             
    GOOD_BYE_MESSAGE:"Adios!!",
    
    ERROR_MESSAGE_OBJECT_ALREADY_EXISTS:"El objeto ya existe",
    
    SUCCESSFUL_CREATE_OBJECT_MESSAGE: "Se creó el objeto exitosamente",
    
    ERROR_CREATE_OBJECT_MESSAGE: "Ocurrió un problema al crear el objeto",
    
    ACTIVATION_MODE_MESSAGE:`Modo automatico activado!,
                            Se alimentara si el plato no tiene la porcion adecuada`,
    
    SCHEDULE_MODE_MESSAGE:`Modo programable activado!,
                            diga la hora a alimentar`,
    
    FALLBACK_INTENT_MESSAGE: "Lo siento, no te entiendo.Intentalo mas tarde.",
    
    ERROR_HANDLER_MESSAGE:`Lo siento ocurrio un problema haciendo lo que me pediste,
                           intentalo de nuevo.`

};

module.exports = constants;