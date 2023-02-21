/*
* Initialize auth and export it
*/
const auth = {
    // Create an action object with type set to 'AUTH.SET' and payload set to data
    set: (data) => ({
        type: 'AUTH.SET',
        payload: data
    }),
    // Create an action object with type set to 'AUTH.CLEAR'
    clear: () => ({type: 'AUTH.CLEAR'}),
    // Create an action object with type set to 'AUTH.SETUSER' and payload set to data
    setUser: (data) => ({
        type: 'AUTH.SETUSER',
        payload: data
    })
};

export default auth;
