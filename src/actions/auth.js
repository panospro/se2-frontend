const auth = {
    set: (data) => ({
        type: 'AUTH.SET',
        payload: data
    }),
    clear: () => ({type: 'AUTH.CLEAR'}),
    setUser: (data) => ({
        type: 'AUTH.SETUSER',
        payload: data
    })
};

export default auth;
