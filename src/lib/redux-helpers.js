/*
*
* Importing the necessary modules
*
*/ 
import {
    equals, complement, isNil, ifElse
} from 'ramda';

const isNotNil = complement(isNil);

// Export actionTypeEq, which checks if the actionType is equal 
// to the type. Else throw an error.
export const actionTypeEq = (actionType) =>
    ifElse(
        (_, {type}) => isNotNil(type),
        (_, {type}) => equals(actionType, type),
        (_, {type}) => {
            throw new Error(`Action type is ${typeof type}.`);
        }
    );

// Export reducer with arguments type and callback and check if they are equal
export const reducer = (type, callback) => [actionTypeEq(type), callback];
