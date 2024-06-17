const constants=require("./constants");
class  ThingJsonController{
  constructor(thingName=constants.DEFAULT_THING_NAME){
      this.thingName=thingName;
  }
  setThingName(thingName){
      this.thingName=thingName;
  }
  getThingName(){
      return this.thingName;
  }
  getAutomaticModeJson (){
    return {
      thingName: this.thingName,
      payload: '{"state": {"desired": {"activationCategory": true}}}'
    };
  };
  
    getScheduleModeJson (){
    return {
      thingName: this.thingName,
      payload: '{"state": {"desired": {"activationCategory": false}}}'
    };
  };
  
    getShadowJson(){
    return {"thingName":this.thingName};
  };
  
    getUpdateTimeJson(hoursSaved,minutesSaved) {
    return {
        thingName: this.thingName,
        payload: {
          state: {
            desired: { hoursToFeed: hoursSaved, minutesToFeed: minutesSaved },
          }
        }
    };
  };
  
    getUpdateFoodPortionJson (foodPortion) {
      return {  
        thingName: this.thingName,
        payload: {
          state: {
            desired: { "foodPortion": Number(foodPortion) }
          }
        }
      };
  };
  
};
module.exports=ThingJsonController;