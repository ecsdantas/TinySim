import ConstantModel from "./constant";
import AddModel from "./add";
import SubModel from "./sub";
import DisplayModel from "./display";
import GainModel from "./gain";
import MemoryModel from "./memory";
import PlotModel from "./plot";
import ClockModel from "./clock";
import TextModel from "./text";
import IntegratorModel from "./integrator";
import SaturationModel from "./saturation";
import MultiplyModel from "./multiply";
import DivideModel from "./divide";
import PowModel from "./pow";
import LogModel from "./log";
import ExponentialModel from "./exp";

export { 
    ConstantModel,
    AddModel, 
    SubModel,
    MultiplyModel,
    DivideModel,
    PowModel,
    LogModel,
    ExponentialModel,        
    DisplayModel, 
    GainModel, 
    MemoryModel,
    PlotModel,
    ClockModel,
    TextModel,
    IntegratorModel,
    SaturationModel
}

export const ModelsArray = [
    ConstantModel,
    AddModel,
    SubModel,
    MultiplyModel,
    DivideModel,
    DisplayModel,
    PowModel,
    LogModel,
    ExponentialModel,
    GainModel,
    MemoryModel,
    PlotModel,
    ClockModel,
    TextModel,
    IntegratorModel,
    SaturationModel
];