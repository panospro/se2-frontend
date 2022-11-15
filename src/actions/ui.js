const ui = {
    addError: (error) => ({
        type: 'UI.ADD_ERROR',
        payload: error
    }),
    removeError: (id) => ({
        type: 'UI.REMOVE_ERROR',
        payload: id
    })
};

export default ui;
