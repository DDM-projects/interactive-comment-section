const usersURL = "http://localhost:3000/users";
const commentsURL = "http://localhost:3000/comments";
const currentUserURL = "http://localhost:3000/currentUser";

const getFetch = async (url) => {
    try {
        const response = await fetch(url);

        if (response.ok) {
            const fetchedData = await response.json();
            return {
                status: "success",
                data: fetchedData,
            };
        }
    } catch (error) {
        console.log(error);
        return {
            status: "error",
            data: null,
        };
    }
};

const getUsers = () => getFetch(usersURL);
const getComments = () => getFetch(commentsURL);
const getCurrentUser = () => getFetch(currentUserURL);

const getCommentById = async (id) => getFetch(`${commentsURL}/${id}`);

const postFetch = async (url, data) => {
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            return "success";
        }
    } catch (error) {
        console.log(error);
        return "error";
    }
};
const postUser = (data) => postFetch(usersURL, data);
const postComment = (data) => postFetch(commentsURL, data);
const postCurrentUser = (data) => postFetch(currentUserURL, data);

const deleteFetch = async (url, id) => {
    try {
        const response = await fetch(`${url}/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (response.ok) {
            console.log("success");
            return "success";
        }
    } catch (error) {
        console.log(error);
        return "error";
    }
};

const deleteUser = (id) => deleteFetch(usersURL, id);
const deleteComment = (id) => deleteFetch(commentsURL, id);
const deleteCurrentUser = (id) => deleteFetch(currentUserURL, id);

const putFetch = async (url, id, data) => {
    try {
        const response = await fetch(`${url}/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            console.log("success");
            return "success";
        }
    } catch (error) {
        console.log(error);
        return "error";
    }
};
const putUser = (id, data) => putFetch(usersURL, id, data);
const putComment = (id, data) => putFetch(commentsURL, id, data);

const patchFetch = async (url, id, data) => {
    try {
        const response = await fetch(`${url}/${id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            console.log("success");
            return "success";
        }
    } catch (error) {
        console.log(error);
        return "error";
    }
};
const patchUser = (id, data) => patchFetch(usersURL, id, data);
const patchComment = (id, data) => patchFetch(commentsURL, id, data);

const startApp = async () => {
    await fetchData();
    await checkIfRemembered();
    await checkAdmin();
};

startApp();
