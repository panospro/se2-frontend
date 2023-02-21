/*
* Initialize ui and export it
*/
const ui = {
    // Create an action object with type set to 'UI.ADD_ERROR' and payload set to error
    addError: (error) => ({
        type: 'UI.ADD_ERROR',
        payload: error
    }),
    // Create an action object with type set to 'UI.REMOVE_ERROR' and payload set to id
    removeError: (id) => ({
        type: 'UI.REMOVE_ERROR',
        payload: id
    })
};

export default ui;
