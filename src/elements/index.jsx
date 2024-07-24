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
import SwitchModel from "./switch";
import DerivatorModel from "./derivator"
import LookupTableModel from "./lookupTable";
import RandomNumberModel from "./random";
import RoundModel from "./round";
import RelationalOperatorModel from "./relational";
import MinModel from "./min";
import MaxModel from "./max";
import CSVExportModel from "./CSVExport";
import ImportCSVMode from "./CSVImport"
import HistogramModel from "./histogram";

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
    DerivatorModel,
    SaturationModel,
    SwitchModel,
    LookupTableModel,
    RandomNumberModel,
    RoundModel,
    RelationalOperatorModel,
    MinModel,
    MaxModel,
    CSVExportModel,
    ImportCSVMode,
    HistogramModel
}

export const ModelsArray = [
    ConstantModel,
    AddModel,
    SubModel,
    MultiplyModel,
    DivideModel,
    PowModel,
    LogModel,
    ExponentialModel,
    MinModel,
    MaxModel,
    GainModel,
    MemoryModel,
    ClockModel,
    DisplayModel,
    PlotModel,
    TextModel,
    IntegratorModel,
    DerivatorModel,
    SaturationModel,
    SwitchModel,
    LookupTableModel,
    RandomNumberModel,
    RoundModel,
    RelationalOperatorModel,
    CSVExportModel,
    ImportCSVMode,
    HistogramModel
];