import { Permissions, Units, Activities } from "./Constants";
import { NativeModules } from "react-native";

type PermissionOptions = {
    read: Permissions[];
    write: Permissions[];
};

type WorkoutOptions = {
    type: Activities;
    startDate: Date;
    endDate: Date;
    duration?: number;
    energyBurned?: {
        unit: Units;
        value: number;
    };
    distance?: {
        unit: Units;
        value: number;
    };
};

enum AuthorizationStatus {
    UnavailablePermission = -1,
    NotDetermined,
    SharingDenied,
    SharingAuthorized,
}

const { AppleHealthKit } = NativeModules;

const handleCallbackWithPromise = <ErrorType, ResultType>(resolve: any, reject: any) => (
    err: ErrorType | null,
    results: ResultType | null
) => {
    if (err) {
        reject(err);
    } else {
        resolve(results);
    }
};

const HealthKit = {
    isAvailable: (): Promise<boolean> => {
        return new Promise((resolve, reject) => {
            AppleHealthKit.isAvailable(handleCallbackWithPromise(resolve, reject));
        });
    },
    init: (options: PermissionOptions): Promise<true> => {
        return new Promise((resolve, reject) => {
            AppleHealthKit.initHealthKit({ permissions: options }, handleCallbackWithPromise(resolve, reject));
        });
    },
    saveWorkout: (options: WorkoutOptions): Promise<string> => {
        return new Promise((resolve, reject) => {
            const {
                startDate,
                endDate,
                energyBurned = { unit: Units.calorie, value: -1 },
                distance = { unit: Units.mile, value: -1 },
                ...rest
            } = options;

            AppleHealthKit.saveWorkout(
                {
                    startDate: startDate.toISOString(),
                    endDate: startDate.toISOString(),
                    energyBurned: energyBurned.value,
                    energyBurnedUnit: energyBurned.unit,
                    distance: distance.value,
                    distanceUnit: distance.unit,
                    ...rest,
                },
                handleCallbackWithPromise(resolve, reject)
            );
        });
    },
    /** Only Available Write Permissions **/
    authorizationStatus: (types: Permissions[]): AuthorizationStatus[] => {
        return AppleHealthKit.authorizationStatus(types);
    },
    getAuthStatus: (
        options: PermissionOptions
    ): Promise<{ read: AuthorizationStatus[]; write: AuthorizationStatus[] }> => {
        return new Promise((resolve, reject) => {
            AppleHealthKit.initHealthKit({ permissions: options }, (err: Error, result: any) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result?.permissions);
                }
            });
        });
    },
};

export const HKConstants = {
    Permissions,
    Units,
    Activities,
};

export default HealthKit;
