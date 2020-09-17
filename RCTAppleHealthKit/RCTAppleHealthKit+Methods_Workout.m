//
//  RCTAppleHealthKit+Methods_Workout.m
//  RCTAppleHealthKit
//
//  Created by Ahmed Fathy Ghazy on 4/27/18.
//  Copyright © 2018 Greg Wilson. All rights reserved.
//

#import "RCTAppleHealthKit+Methods_Workout.h"
#import "RCTAppleHealthKit+Utils.h"
#import "RCTAppleHealthKit+Queries.h"

@implementation RCTAppleHealthKit (Methods_Workout)

- (void)workout_get:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback
{
    NSUInteger limit = [RCTAppleHealthKit uintFromOptions:input key:@"limit" withDefault:HKObjectQueryNoLimit];
    BOOL ascending = [RCTAppleHealthKit boolFromOptions:input key:@"ascending" withDefault:false];
    NSDate *startDate = [RCTAppleHealthKit dateFromOptions:input key:@"startDate" withDefault:[NSDate date]];
    NSDate *endDate = [RCTAppleHealthKit dateFromOptions:input key:@"endDate" withDefault:[NSDate date]];
    
    NSPredicate *predicate = [HKQuery predicateForSamplesWithStartDate:startDate endDate:endDate options:HKQueryOptionStrictStartDate];
    
    void (^completion)(NSArray *results, NSError *error);
    
    completion = ^(NSArray *results, NSError *error) {
        if(results){
            callback(@[[NSNull null], results]);
            return;
        } else {
            NSString *errMsg = [NSString stringWithFormat:@"Error getting samples: %@", error];
            NSLog(errMsg);
            callback(@[RCTMakeError(errMsg, nil, nil)]);
            return;
        }
    };
    
    [self fetchWorkoutForPredicate: predicate
                         ascending:ascending
                             limit:limit
                        completion:completion];
}

-(void)workout_save: (NSDictionary *)input callback: (RCTResponseSenderBlock)callback {
    HKWorkoutActivityType type = [RCTAppleHealthKit hkWorkoutActivityTypeFromOptions:input key:@"type" withDefault:HKWorkoutActivityTypeAmericanFootball];
    NSDate *startDate = [RCTAppleHealthKit dateFromOptions:input key:@"startDate" withDefault:nil];
    NSDate *endDate = [RCTAppleHealthKit dateFromOptions:input key:@"endDate" withDefault:nil];
    NSTimeInterval duration = [RCTAppleHealthKit doubleFromOptions:input key:@"duration" withDefault:(NSTimeInterval)0];
    HKQuantity *totalEnergyBurned = [RCTAppleHealthKit hkQuantityFromOptions:input valueKey:@"energyBurned" unitKey:@"energyBurnedUnit"];
    HKQuantity *totalDistance = [RCTAppleHealthKit hkQuantityFromOptions:input valueKey:@"distance" unitKey:@"distanceUnit"];
    
    
    
    HKWorkout *workout = [HKWorkout workoutWithActivityType: type
                                                  startDate: startDate
                                                    endDate: endDate
                                                   duration: duration
                                          totalEnergyBurned: totalEnergyBurned
                                              totalDistance: totalDistance
                                                   metadata: nil
                          ];
    
    void (^completion)(BOOL success, NSError *error);
    completion = ^(BOOL success, NSError *error){
        if(!success) {
            NSLog(@"An error occured saving the workout %@. The error was: %@.", workout, error);
            callback(@[RCTMakeError(@"An error occured saving the workout", error, nil)]);
            return;
        }
        
        // Update for Activity Rings, ActiveEnergyBurned + appleMoveTime + appleExerciseTime + appleStandHours
        [self log_activity:workout kcal:[input objectForKey:@"energyBurned"]];
        callback(@[[NSNull null], [[workout UUID] UUIDString]]);
    };
    
    [self.healthStore saveObject:workout withCompletion:completion];
    
}

-(void)log_activity:(HKWorkout *)workout kcal: (NSNumber *_Nullable)kcal {
    NSMutableArray<HKSample *> *samples = [[NSMutableArray<HKSample *> alloc] init];
    
    NSNumber *num = kcal;
    if(num != nil && num != 0){
        //Save Kcal
        HKQuantityType *kcalType = [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierActiveEnergyBurned];
        HKQuantity *kcalQuant = [HKQuantity quantityWithUnit: [HKUnit kilocalorieUnit]
                                                 doubleValue: [num doubleValue]];
        HKQuantitySample *kcalSample = [HKQuantitySample quantitySampleWithType:kcalType
                                                                       quantity:kcalQuant
                                                                      startDate:[workout startDate]
                                                                        endDate:[workout endDate]];
        [samples addObject:kcalSample];
    }
    
//    Cannot get write permission on Apple Quantity types..
//    if (@available(iOS 9.3, *)) {
//        HKQuantityType *exerciseType = [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierAppleExerciseTime];
//        HKQuantity *exerciseQuant = [HKQuantity quantityWithUnit:[HKUnit secondUnit] doubleValue:[workout duration]];
//        HKQuantitySample *exerciseSample = [HKQuantitySample quantitySampleWithType:exerciseType
//                                                                           quantity:exerciseQuant
//                                                                          startDate:[workout startDate]
//                                                                            endDate:[workout endDate]];
//        [samples addObject:exerciseSample];
//    }
    
    [self.healthStore addSamples:samples toWorkout:workout completion:^(BOOL success, NSError * _Nullable error) {
        if(error != nil){
            NSLog(@"activity_kcal: error %@", error.localizedDescription);
        }
        NSLog(@"activity_kcal: add sample to workout %s", success ? "SUCCESS" : "ERROR");
    }];
}
@end
