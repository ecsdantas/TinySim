import {
    DefaultPortModel,
    RightAngleLinkModel
  } from "@projectstorm/react-diagrams"
  
  // When new link is created by clicking on port the RightAngleLinkModel needs to be returned.
  export class RightAnglePortModel extends DefaultPortModel {
    createLinkModel(factory) {
      return new RightAngleLinkModel()
    }
  }
  