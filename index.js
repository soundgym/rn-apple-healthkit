"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HKConstants = void 0;
const Constants_1 = require("./Constants");
const react_native_1 = require("react-native");
var AuthorizationStatus;
(function (AuthorizationStatus) {
    AuthorizationStatus[AuthorizationStatus["UnavailablePermission"] = -1] = "UnavailablePermission";
    AuthorizationStatus[AuthorizationStatus["NotDetermined"] = 0] = "NotDetermined";
    AuthorizationStatus[AuthorizationStatus["SharingDenied"] = 1] = "SharingDenied";
    AuthorizationStatus[AuthorizationStatus["SharingAuthorized"] = 2] = "SharingAuthorized";
})(AuthorizationStatus || (AuthorizationStatus = {}));
const { AppleHealthKit } = react_native_1.NativeModules;
const handleCallbackWithPromise = (resolve, reject) => (err, results) => {
    if (err) {
        reject(err);
    }
    else {
        resolve(results);
    }
};
const HealthKit = {
    isAvailable: () => {
        return new Promise((resolve, reject) => {
            AppleHealthKit.isAvailable(handleCallbackWithPromise(resolve, reject));
        });
    },
    init: (options) => {
        return new Promise((resolve, reject) => {
            AppleHealthKit.initHealthKit({ permissions: options }, handleCallbackWithPromise(resolve, reject));
        });
    },
    saveMindfulSession: (options) => {
        return new Promise((resolve, reject) => {
            const { startDate, endDate, value } = options;
            AppleHealthKit.saveMindfulSession({
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                value,
            }, handleCallbackWithPromise(resolve, reject));
        });
    },
    saveWorkout: (options) => {
        return new Promise((resolve, reject) => {
            const { startDate, endDate, energyBurned = { unit: Constants_1.Units.calorie, value: -1 }, distance = { unit: Constants_1.Units.mile, value: -1 }, ...rest } = options;
            AppleHealthKit.saveWorkout({
                startDate: startDate.toISOString(),
                endDate: startDate.toISOString(),
                energyBurned: energyBurned.value,
                energyBurnedUnit: energyBurned.unit,
                distance: distance.value,
                distanceUnit: distance.unit,
                ...rest,
            }, handleCallbackWithPromise(resolve, reject));
        });
    },
    authorizationStatus: (types) => {
        return new Promise((resolve, reject) => {
            AppleHealthKit.authorizationStatus(types, handleCallbackWithPromise(resolve, reject));
        });
    },
    getAuthStatus: (options) => {
        return new Promise((resolve, reject) => {
            AppleHealthKit.initHealthKit({ permissions: options }, (err, result) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(result?.permissions);
                }
            });
        });
    },
};
exports.HKConstants = {
    Permissions: Constants_1.Permissions,
    Units: Constants_1.Units,
    Activities: Constants_1.Activities,
};
exports.default = HealthKit;
//# sourceMappingURL=index.js.map