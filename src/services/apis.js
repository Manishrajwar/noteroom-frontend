const baseurl = process.env.REACT_APP_API_URL


export const DocumentEndpoints = {
    CREATE_NOTE_ROOM: `${baseurl}/api/v1/create-noteroom`,
    GET_ALL_NOTE_ROOMS: `${baseurl}/api/v1/get-all-noteroom`
}