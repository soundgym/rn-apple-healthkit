import { Permissions, Units, Activities } from "./Constants";
declare type PermissionOptions = {
    read: Permissions[];
    write: Permissions[];
};
declare type WorkoutOptions = {
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
declare type MindfulSessionOptions = {
    startDate: Date;
    endDate: Date;
};
interface GetSampleOptions {
    startDate: Date;
    endDate?: Date;
}
declare type GetHeartRateOptions = GetSampleOptions & {
    unit?: string;
    ascending?: boolean;
    limit?: number;
};
declare enum AuthorizationStatus {
    UnavailablePermission = -1,
    NotDetermined = 0,
    SharingDenied = 1,
    SharingAuthorized = 2
}
declare const HealthKit: {
    isAvailable: () => Promise<boolean>;
    init: (options: PermissionOptions) => Promise<true>;
    saveMindfulSession: (options: MindfulSessionOptions) => Promise<string>;
    saveWorkout: (options: WorkoutOptions) => Promise<string>;
    authorizationStatus: (types: Permissions[]) => Promise<AuthorizationStatus[]>;
    getAuthStatus: (options: PermissionOptions) => Promise<{
        read: AuthorizationStatus[];
        write: AuthorizationStatus[];
    }>;
    getHeartRate: (options: GetHeartRateOptions) => Promise<{
        value: number;
        startDate: string;
        endDate: string;
    }[]>;
};
export declare const HKConstants: {
    Permissions: typeof Permissions;
    Units: typeof Units;
    Activities: typeof Activities;
};
export default HealthKit;
